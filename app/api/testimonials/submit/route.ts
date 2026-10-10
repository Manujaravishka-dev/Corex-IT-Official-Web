import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, hashToken, getAdminMissingEnvHint } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

function toDateSafe(expiresAt: unknown): Date | null {
  if (!expiresAt) return null;
  if (expiresAt instanceof Timestamp) return expiresAt.toDate();
  if (expiresAt instanceof Date) return expiresAt;
  if (typeof expiresAt === "string") {
    const d = new Date(expiresAt);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof expiresAt === "object" && expiresAt !== null && "seconds" in (expiresAt as Record<string, unknown>)) {
    try {
      const o = expiresAt as { seconds: number; nanoseconds: number };
      return new Timestamp(o.seconds, o.nanoseconds).toDate();
    } catch { return null; }
  }
  if (typeof expiresAt === "object" && expiresAt !== null && typeof (expiresAt as Record<string, unknown>).toDate === "function") {
    try { return (expiresAt as { toDate: () => Date }).toDate(); } catch { return null; }
  }
  return null;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const d = body as Record<string, unknown>;
  const token = typeof d.token === "string" ? d.token.trim() : "";
  const name = typeof d.name === "string" ? d.name.trim() : "";
  const company = typeof d.company === "string" ? d.company.trim() : "";
  const designation = typeof d.designation === "string" ? d.designation.trim() : "";
  const comment = typeof d.comment === "string" ? d.comment.trim() : "";
  const ratingRaw = d.rating;

  const rating = typeof ratingRaw === "number" ? ratingRaw : Number(ratingRaw);
  let ratingToStore: number;
  if (ratingRaw === undefined || ratingRaw === null || ratingRaw === "") {
    ratingToStore = 5;
  } else if (rating === 0) {
    ratingToStore = 5;
  } else if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ errors: { rating: "Rating must be between 1 and 5" } }, { status: 400 });
  } else {
    ratingToStore = rating;
  }

  const errors: Record<string, string> = {};
  if (!token) errors.token = "Token is required";
  if (!name) errors.name = "Name is required";
  else if (name.length < 2) errors.name = "Name must be at least 2 characters";
  else if (name.length > 80) errors.name = "Name must be under 80 characters";
  if (company && company.length > 100) errors.company = "Company must be under 100 characters";
  if (designation && designation.length > 100) errors.designation = "Position / Role must be under 100 characters";
  if (!comment) errors.comment = "Testimonial is required";
  else if (comment.length < 10) errors.comment = "Testimonial must be at least 10 characters";
  else if (comment.length > 600) errors.comment = "Testimonial must be under 600 characters";
  if ("imageUrl" in d && d.imageUrl) errors.imageUrl = "Image upload is not allowed for customer submissions";
  if ("image" in d && d.image) errors.image = "Image upload is not allowed";
  if ("file" in d && d.file) errors.file = "File upload is not allowed";
  if ("photo" in d && d.photo) errors.photo = "Photo upload is not allowed";
  if ("attachment" in d && d.attachment) errors.attachment = "Attachment is not allowed";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  let db: ReturnType<typeof getAdminDb>;
  try {
    db = getAdminDb();
  } catch (e) {
    console.error("[api/testimonials/submit] Admin not configured", e);
    return NextResponse.json({ error: "Service temporarily unavailable. Please try again later.", hint: getAdminMissingEnvHint() }, { status: 503 });
  }
  try {
    const tokenHash = hashToken(token);

    // Try to locate invite by hash, fallback to legacy plain token doc id
    const inviteRefHash = db.collection("testimonial_invites").doc(tokenHash);
    const inviteRefLegacy = db.collection("testimonial_invites").doc(token);

    const result = await db.runTransaction(async (tx) => {
      let inviteSnap = await tx.get(inviteRefHash);
      let inviteRef = inviteRefHash;
      if (!inviteSnap.exists) {
        const legacySnap = await tx.get(inviteRefLegacy);
        if (legacySnap.exists) {
          inviteSnap = legacySnap;
          inviteRef = inviteRefLegacy;
        }
      }
      if (!inviteSnap.exists) {
        throw { code: 404, message: "This testimonial link is invalid or does not exist." };
      }
      const invite = inviteSnap.data() as Record<string, unknown>;
      const status = (invite.status as string) || (invite.used ? "used" : "unused");
      if (status === "used" || invite.used === true) {
        throw { code: 410, message: "This testimonial link has expired or has already been used." };
      }
      const expiresAt = invite.expiresAt as unknown;
      const expDate = toDateSafe(expiresAt);
      if (expDate && expDate.getTime() <= Date.now()) {
        throw { code: 410, message: "This testimonial link has expired or has already been used." };
      }

      // Atomically create testimonial and mark invite used
      const testimonialRef = db.collection("testimonials").doc();
      const testimonialPayload = {
        name,
        company,
        designation,
        comment,
        rating: ratingToStore,
        status: "pending" as const,
        imageUrl: "",
        createdAt: FieldValue.serverTimestamp(),
      };
      tx.set(testimonialRef, testimonialPayload);
      tx.update(inviteRef, {
        status: "used",
        used: true,
        usedAt: FieldValue.serverTimestamp(),
      });

      return { id: testimonialRef.id };
    });

    return NextResponse.json({ id: result.id, status: "pending" }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && "message" in err) {
      const e = err as { code: number; message: string };
      return NextResponse.json({ error: e.message }, { status: e.code });
    }
    console.error("[api/testimonials/submit] transaction error", err);
    const msg = err instanceof Error ? err.message : "Failed to submit testimonial";
    // Do not expose internal Firebase data
    if (msg.includes("Missing or insufficient permissions")) {
      return NextResponse.json({ error: "Submission failed. Please contact support." }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to submit testimonial. Please try again." }, { status: 500 });
  }
}
