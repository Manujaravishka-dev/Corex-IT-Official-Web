import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyAdminIdToken, hashToken, getAdminMissingEnvHint } from "@/lib/firebase-admin";
import { randomBytes } from "crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

// GET /api/testimonial-invites -> list invites (admin only) - uses Firebase Admin Firestore (server-only)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  let adminUser: Awaited<ReturnType<typeof verifyAdminIdToken>> = null;
  try {
    adminUser = await verifyAdminIdToken(authHeader);
  } catch (e) {
    console.error("[api/testimonial-invites] verify error", e);
    return NextResponse.json({ error: "Auth verification failed", details: String(e) }, { status: 500 });
  }
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized - missing or invalid ID token" }, { status: 401 });
  }
  try {
    const db = getAdminDb();
    const snap = await db.collection("testimonial_invites").orderBy("createdAt", "desc").limit(50).get();
    const invites = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      // Normalize to new schema + backward compat
      const status = (data.status as string) || (data.used ? "used" : "unused");
      return {
        id: d.id,
        tokenHash: (data.tokenHash as string) || d.id,
        status,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        usedAt: data.usedAt || null,
        createdBy: (data.createdBy as string) || null,
        note: (data.note as string) || "",
        // legacy
        used: status === "used",
      };
    });
    return NextResponse.json({ invites }, { status: 200 });
  } catch (err) {
    // Safe diagnostics: log category without secrets
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/testimonial-invites] GET error", msg.includes("not configured") ? msg : "GET_FAILED");
    if (msg.includes("not configured") || msg.includes("Could not load") || msg.includes("default credentials") || msg.includes("credential") || msg.includes("private_key") || msg.includes("PEM") || msg.includes("cert") || msg.includes("service account")) {
      return NextResponse.json({ error: "Firebase Admin not configured on server", hint: getAdminMissingEnvHint() }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to load invites" }, { status: 500 });
  }
}

// POST /api/testimonial-invites -> generate new invite (admin only)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  let adminUser: Awaited<ReturnType<typeof verifyAdminIdToken>> = null;
  try {
    adminUser = await verifyAdminIdToken(authHeader);
  } catch (e) {
    console.error("[api/testimonial-invites] verify error", e);
    return NextResponse.json({ error: "Auth verification failed" }, { status: 500 });
  }
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized - missing or invalid ID token" }, { status: 401 });
  }
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const d = body as Record<string, unknown>;
  const note = typeof d.note === "string" ? d.note.trim().slice(0, 120) : "";
  const expiryDaysRaw = d.expiryDays ?? d.expiresInDays ?? 7;
  const expiryDays = Number(expiryDaysRaw);
  const days = Number.isFinite(expiryDays) && expiryDays >= 1 && expiryDays <= 30 ? expiryDays : 7;

  try {
    const rawToken = randomBytes(32).toString("hex"); // 64 chars, cryptographically secure
    const tokenHash = hashToken(rawToken);
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + days * 24 * 60 * 60 * 1000));

    const db = getAdminDb();
    const docRef = db.collection("testimonial_invites").doc(tokenHash);
    await docRef.set({
      tokenHash,
      status: "unused",
      createdAt: FieldValue.serverTimestamp(),
      expiresAt,
      usedAt: null,
      createdBy: adminUser.email || adminUser.uid,
      note,
      // legacy compat fields
      token: tokenHash, // do NOT store raw token; store hash for compat read
      used: false,
      createdAtLegacy: now,
    });

    // Build URL for customer
    const origin = request.headers.get("origin") || request.headers.get("x-forwarded-host") ? `https://${request.headers.get("x-forwarded-host")}` : "";
    // Fallback to request url origin if header missing
    let baseUrl = "";
    try {
      const u = new URL(request.url);
      baseUrl = `${u.protocol}//${u.host}`;
    } catch {
      baseUrl = origin || "";
    }
    const url = `${baseUrl}/testimonial/${rawToken}`;

    return NextResponse.json(
      {
        token: rawToken,
        tokenHash,
        url,
        status: "unused",
        expiresAt: expiresAt.toDate().toISOString(),
        note,
      },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Safe diagnostics without exposing private_key
    console.error("[api/testimonial-invites] POST error: stage=FIRESTORE_WRITE", msg.includes("not configured") ? msg : "POST_FAILED");
    if (msg.includes("not configured") || msg.includes("Could not load") || msg.includes("default credentials") || msg.includes("credential") || msg.includes("private_key") || msg.includes("PEM") || msg.includes("cert") || msg.includes("service account") || msg.includes("FIREBASE_SERVICE_ACCOUNT_KEY")) {
      return NextResponse.json({ error: "Firebase Admin not configured on server", hint: getAdminMissingEnvHint() }, { status: 503 });
    }
    // Include safe Firestore error hint without secrets
    console.error("[api/testimonial-invites] POST Firestore error:", msg.slice(0, 200));
    return NextResponse.json({ error: "Failed to generate invite" }, { status: 500 });
  }
}
