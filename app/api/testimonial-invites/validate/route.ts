import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, hashToken, getAdminMissingEnvHint } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

// GET /api/testimonial-invites/validate?token=xxx
// Public endpoint for customer to check if link is still valid (unused and not expired)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim() || "";
  if (!token) {
    return NextResponse.json({ valid: false, reason: "missing_token", message: "This testimonial link is invalid or does not exist." }, { status: 400 });
  }
  if (token.length < 32) {
    return NextResponse.json({ valid: false, reason: "invalid", message: "This testimonial link is invalid or does not exist." }, { status: 404 });
  }
  try {
    const tokenHash = hashToken(token);
    let db: ReturnType<typeof getAdminDb>;
    try {
      db = getAdminDb();
    } catch (e) {
      console.error("[validate] Admin not configured", e);
      return NextResponse.json({ valid: false, reason: "error", message: "Service temporarily unavailable. Please try again later.", hint: getAdminMissingEnvHint() }, { status: 503 });
    }
    const snap = await db.collection("testimonial_invites").doc(tokenHash).get();
    if (!snap.exists) {
      // Try legacy doc id = raw token (for invites created before hash migration)
      const legacySnap = await db.collection("testimonial_invites").doc(token).get();
      if (!legacySnap.exists) {
        // Deleted or never existed — treat as expired/used (unified message, do not reveal existence)
        return NextResponse.json({ valid: false, reason: "used", message: "This testimonial link has expired or has already been used." }, { status: 410 });
      }
      // Legacy fallback: check legacy doc
      const ld = legacySnap.data() as Record<string, unknown>;
      const lStatus = (ld.status as string) || (ld.used ? "used" : "unused");
      if (lStatus === "used" || ld.used === true) {
        return NextResponse.json({ valid: false, reason: "used", message: "This testimonial link has expired or has already been used." }, { status: 410 });
      }
      const lExpiresAt = ld.expiresAt as Timestamp | undefined;
      if (lExpiresAt) {
        const expDate = lExpiresAt.toDate ? lExpiresAt.toDate() : new Date(lExpiresAt as unknown as string);
        if (expDate.getTime() <= Date.now()) {
          return NextResponse.json({ valid: false, reason: "expired", message: "This testimonial link has expired or has already been used." }, { status: 410 });
        }
      }
      return NextResponse.json({ valid: true, status: lStatus }, { status: 200 });
    }
    const data = snap.data() as Record<string, unknown>;
    const status = (data.status as string) || (data.used ? "used" : "unused");
    if (status === "used") {
      return NextResponse.json({ valid: false, reason: "used", message: "This testimonial link has expired or has already been used." }, { status: 410 });
    }
    const expiresAt = data.expiresAt as Timestamp | undefined;
    if (expiresAt) {
      let exp: Date | null = null;
      if (expiresAt instanceof Timestamp) exp = expiresAt.toDate();
      else if ((expiresAt as unknown as { toDate?: () => Date })?.toDate) exp = (expiresAt as unknown as { toDate: () => Date }).toDate();
      else {
        try { exp = new Date(expiresAt as unknown as string); } catch { exp = null; }
      }
      if (exp && exp.getTime() <= Date.now()) {
        return NextResponse.json({ valid: false, reason: "expired", message: "This testimonial link has expired or has already been used." }, { status: 410 });
      }
    }
    return NextResponse.json({ valid: true, status }, { status: 200 });
  } catch (err) {
    console.error("[validate] error", err);
    return NextResponse.json({ valid: false, reason: "error", message: "Unable to verify link. Please try again." }, { status: 500 });
  }
}
