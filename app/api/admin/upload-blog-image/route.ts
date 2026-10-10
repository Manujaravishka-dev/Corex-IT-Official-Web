import { NextRequest, NextResponse } from "next/server";
import { verifyAdminIdToken } from "@/lib/firebase-admin";
import {
  cloudinaryConfigured,
  uploadImageToCloudinary,
  BLOG_IMAGE_FOLDER,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "@/lib/cloudinary";

// Uploads a Blog cover image to Cloudinary (corex-it/blogs) and returns the secure URL.
// Used by the Admin > Blog Management form. Does NOT write to the websiteImages collection.
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const admin = await verifyAdminIdToken(authHeader);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!cloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Cloudinary not configured on server" },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 10MB` },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadImageToCloudinary(buffer, BLOG_IMAGE_FOLDER);

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      folder: result.folder,
    });
  } catch (err) {
    console.error("[upload-blog-image] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}