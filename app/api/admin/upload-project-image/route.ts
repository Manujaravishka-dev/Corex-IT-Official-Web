import { NextRequest, NextResponse } from "next/server";
import { verifyAdminIdToken } from "@/lib/firebase-admin";
import { cloudinaryConfigured, uploadImageToCloudinary, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdminIdToken(request.headers.get("authorization"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!cloudinaryConfigured()) return NextResponse.json({ error: "Cloudinary server credentials are missing" }, { status: 503 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !ALLOWED_IMAGE_TYPES.includes(file.type) || file.size < 1 || file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Upload a supported image up to 10MB" }, { status: 400 });
    }
    const result = await uploadImageToCloudinary(Buffer.from(await file.arrayBuffer()), "corex-it/projects");
    return NextResponse.json({ imageUrl: result.secure_url, publicId: result.public_id });
  } catch (error) {
    console.error("[project-image]", error);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}
