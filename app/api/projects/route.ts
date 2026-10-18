import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
export const runtime = "nodejs";
export async function GET() {
  try {
    const snapshot = await getAdminDb().collection("projects").where("published", "==", true).get();
    const projects = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ projects }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
  } catch { return NextResponse.json({ error: "Projects unavailable" }, { status: 503 }); }
}