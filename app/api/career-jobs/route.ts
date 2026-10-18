import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyAdminIdToken } from "@/lib/firebase-admin";

export const runtime = "nodejs";
const jobs = () => getAdminDb().collection("career_jobs");
const clean = (body: Record<string, unknown>) => {
  const value = (key: string, max = 300) => String(body[key] ?? "").trim().slice(0, max);
  const list = (key: string) => Array.isArray(body[key]) ? (body[key] as unknown[]).filter((item): item is string => typeof item === "string").map(item => item.trim().slice(0, 500)).filter(Boolean).slice(0, 30) : [];
  return { title: value("title", 150), category: value("category", 80), employmentType: value("employmentType", 80), duration: value("duration", 80), location: value("location", 80), description: value("description", 1500), technologies: list("technologies"), responsibilities: list("responsibilities"), requirements: list("requirements"), published: body.published === true };
};
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminIdToken(request.headers.get("authorization"));
    const snapshot = admin ? await jobs().get() : await jobs().where("published", "==", true).get();
    return NextResponse.json({ jobs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to load career roles" }, { status: 503 });
  }
}
export async function POST(request: NextRequest) {
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = clean(await request.json());
    if (!data.title || !data.category) return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
    const ref = await jobs().add({ ...data, createdAt: new Date(), updatedAt: new Date(), createdBy: admin.uid });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create career role" }, { status: 500 });
  }
}
export async function PUT(request: NextRequest) {
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const id = String(body.id || "");
    if (!/^[a-zA-Z0-9_-]{1,150}$/.test(id)) return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
    const ref = jobs().doc(id);
    if (!(await ref.get()).exists) return NextResponse.json({ error: "Role not found" }, { status: 404 });
    const data = clean(body);
    if (!data.title || !data.category) return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
    await ref.update({ ...data, updatedAt: new Date() });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update career role" }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest) {
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^[a-zA-Z0-9_-]{1,150}$/.test(id)) return NextResponse.json({ error: "Invalid role ID" }, { status: 400 });
  try {
    await jobs().doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete career role" }, { status: 500 });
  }
}
