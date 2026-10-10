import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyAdminIdToken, hashToken, getAdminMissingEnvHint } from "@/lib/firebase-admin";

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

// POST /api/testimonial-invites/revoke  body: { tokenHash } or { token }
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  let adminUser: Awaited<ReturnType<typeof verifyAdminIdToken>> = null;
  try {
    adminUser = await verifyAdminIdToken(authHeader);
  } catch (e) {
    console.error("[revoke] verify error", e);
    return NextResponse.json({ error: "Auth verification failed" }, { status: 500 });
  }
  if (!adminUser) return NextResponse.json({ error: "Unauthorized - missing or invalid ID token" }, { status: 401 });

  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch { body = {}; }
  const raw = (body.tokenHash as string) || (body.token as string) || (body.id as string) || "";
  const tokenHash = raw.trim();
  if (!tokenHash) return NextResponse.json({ error: "tokenHash required" }, { status: 400 });

  let db: ReturnType<typeof getAdminDb>;
  try {
    db = getAdminDb();
  } catch (e) {
    console.error("[revoke] Admin not configured", e);
    return NextResponse.json({ error: "Firebase Admin not configured on server", hint: getAdminMissingEnvHint() }, { status: 503 });
  }
  try {
    // Try hash, then raw token hash, then legacy doc id
    let docId = tokenHash;
    // If token looks like raw token (64 hex), hash it
    if (/^[a-f0-9]{64}$/i.test(tokenHash)) {
      // Could be hash already or raw token; check both
      const maybeHash = hashToken(tokenHash);
      // If doc exists for hash of hash, not; we try both
      const snapHash = await db.collection("testimonial_invites").doc(tokenHash).get();
      if (!snapHash.exists) {
        const snapRaw = await db.collection("testimonial_invites").doc(maybeHash).get();
        if (snapRaw.exists) docId = maybeHash;
      }
    } else {
      // tokenHash might be raw token from UI link (64 hex)
      if (/^[a-f0-9]{64}$/i.test(tokenHash)) {
        docId = hashToken(tokenHash);
      }
    }
    // If UI passed full link token, hash it
    // Fallback: if doc not found, try hashing raw
    let snap = await db.collection("testimonial_invites").doc(docId).get();
    if (!snap.exists && /^[a-f0-9]{64}$/.test(tokenHash)) {
      const hashed = hashToken(tokenHash);
      const s2 = await db.collection("testimonial_invites").doc(hashed).get();
      if (s2.exists) { snap = s2; docId = hashed; }
    }
    // Also try legacy doc id = raw token (from earlier invites)
    if (!snap.exists) {
      const legacy = await db.collection("testimonial_invites").doc(tokenHash).get();
      if (legacy.exists) snap = legacy;
    }
    if (!snap.exists) {
      // Idempotent: already deleted — treat as success so UI can refresh gracefully
      return NextResponse.json({ ok: true, alreadyDeleted: true }, { status: 200 });
    }

    // Allow delete regardless of status (unused/used/expired) — admin can delete any invite
    // Deleting a used invite must NOT make token reusable (submit requires invite exists && status unused)
    await db.collection("testimonial_invites").doc(snap.id).delete();
    return NextResponse.json({ ok: true, deletedId: snap.id }, { status: 200 });
  } catch (err) {
    console.error("[revoke] error", err);
    return NextResponse.json({ error: "Failed to revoke invite" }, { status: 500 });
  }
}
