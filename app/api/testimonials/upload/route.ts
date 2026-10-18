import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, hashToken } from "@/lib/firebase-admin";
import { cloudinaryConfigured, uploadImageToCloudinary } from "@/lib/cloudinary";
import { Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const token = form.get("token");
    const file = form.get("file");
    if (typeof token !== "string" || token.length < 32 || !(file instanceof File)) {
      return NextResponse.json({ error: "Valid invitation and image required" }, { status: 400 });
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Choose a JPG, PNG or WebP image under 5MB" }, { status: 400 });
    }
    if (!cloudinaryConfigured()) return NextResponse.json({ error: "Image upload unavailable" }, { status: 503 });
    const db = getAdminDb();
    const hash = hashToken(token);
    const hashedRef = db.collection("testimonial_invites").doc(hash);
    const hashed = await hashedRef.get();
    const legacy = hashed.exists ? hashed : await db.collection("testimonial_invites").doc(token).get();
    if (!legacy.exists) return NextResponse.json({ error: "Invitation invalid" }, { status: 403 });
    const data = legacy.data() || {};
    if (data.used || data.status === "used" || data.status === "revoked") return NextResponse.json({ error: "Invitation no longer available" }, { status: 410 });
    const expires = data.expiresAt;
    const expiresAt = expires instanceof Timestamp ? expires.toDate() : expires?.toDate?.() ?? (expires ? new Date(expires) : null);
    if (expiresAt && expiresAt.getTime() <= Date.now()) return NextResponse.json({ error: "Invitation expired" }, { status: 410 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const signatures: Record<string, boolean> = {
      "image/jpeg": bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
      "image/png": bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      "image/webp": bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP",
    };
    if (!signatures[file.type]) return NextResponse.json({ error: "Invalid image contents" }, { status: 400 });

    const existing = await db.collection("testimonial_uploads").doc(hash).get();
    if (existing.exists) return NextResponse.json({ error: "An image has already been uploaded for this invitation" }, { status: 409 });
    const uploaded = await uploadImageToCloudinary(bytes, "corex-it/testimonials");
    const imageUrl = uploaded.secure_url;
    if (typeof imageUrl !== "string") throw new Error("Upload did not return a URL");
    await db.collection("testimonial_uploads").doc(hash).create({ imageUrl, publicId: uploaded.public_id, createdAt: new Date().toISOString() });
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("[testimonial upload]", error);
    return NextResponse.json({ error: "Unable to upload image. Please try again." }, { status: 500 });
  }
}
