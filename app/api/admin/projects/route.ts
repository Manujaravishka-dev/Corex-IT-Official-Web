import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyAdminIdToken } from "@/lib/firebase-admin";

export const runtime = "nodejs";
const collection = "projects";
async function authorized(req: NextRequest) {
  return verifyAdminIdToken(req.headers.get("authorization"));
}
function normalize(body: Record<string, unknown>) {
  const str = (key: string) => String(body[key] ?? "").trim();
  const arr = (key: string) => Array.isArray(body[key]) ? (body[key] as unknown[]).filter((x): x is string => typeof x === "string").map(x => x.trim()).filter(Boolean).slice(0, 30) : [];
  return {
    title: str("title").slice(0, 160),
    slug: str("slug").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 120),
    category: str("category").slice(0, 80),
    type: str("type").slice(0, 80),
    industry: str("industry").slice(0, 80),
    year: str("year").slice(0, 10),
    description: str("description").slice(0, 1200),
    overview: str("overview").slice(0, 10000),
    image: str("image").slice(0, 1000),
    images: arr("images"),
    technologies: arr("technologies"),
    features: arr("features"),
    challenge: str("challenge").slice(0, 5000),
    solution: str("solution").slice(0, 5000),
    liveUrl: str("liveUrl").slice(0, 1000),
    githubUrl: str("githubUrl").slice(0, 1000),
    published: body.published === true,
  };
}
export async function GET(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const snapshot = await getAdminDb().collection(collection).get();
    return NextResponse.json({ projects: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) });
  } catch { return NextResponse.json({ error: "Could not load projects" }, { status: 500 }); }
}
export async function POST(req: NextRequest) {
  const user = await authorized(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = normalize(await req.json());
    if (!data.title || !data.slug) return NextResponse.json({ error: "Title and slug required" }, { status: 400 });
    const ref = getAdminDb().collection(collection).doc(data.slug);
    if ((await ref.get()).exists) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    await ref.create({ ...data, createdAt: new Date(), updatedAt: new Date(), createdBy: user.uid });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch { return NextResponse.json({ error: "Could not create project" }, { status: 500 }); }
}
export async function PUT(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const id = String(body.id ?? "");
    if (!/^[a-z0-9-]{1,120}$/.test(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const ref = getAdminDb().collection(collection).doc(id);
    if (!(await ref.get()).exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = normalize({ ...body, slug: id });
    await ref.update({ ...data, updatedAt: new Date() });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Could not update project" }, { status: 500 }); }
}
export async function DELETE(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!/^[a-z0-9-]{1,120}$/.test(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    await getAdminDb().collection(collection).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Could not delete project" }, { status: 500 }); }
}