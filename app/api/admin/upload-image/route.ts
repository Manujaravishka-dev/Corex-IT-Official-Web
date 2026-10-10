import { NextRequest, NextResponse } from "next/server";
import { verifyAdminIdToken, getAdminDb } from "@/lib/firebase-admin";
import {
  cloudinaryConfigured,
  uploadImageToCloudinary,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "@/lib/cloudinary";

const FOLDER_MAP: Record<string, string> = {
  hero: "corex-it/hero",
  about: "corex-it/about",
  services: "corex-it/services",
  projects: "corex-it/projects",
  blogs: "corex-it/blogs",
  testimonials: "corex-it/testimonials",
  contact: "corex-it/contact",
  general: "corex-it/general",
};

const VALID_CATEGORIES = Object.keys(FOLDER_MAP);

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
    const category = ((formData.get("category") as string) || "general").toLowerCase();
    const title = (formData.get("title") as string) || "";
    const altText = (formData.get("altText") as string) || "";
    const description = (formData.get("description") as string) || "";
    const isActive = formData.get("isActive") !== "false";
    const sortOrder = parseInt(formData.get("sortOrder") as string, 10) || 0;

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

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category: ${category}. Allowed: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    const folder = FOLDER_MAP[category] || FOLDER_MAP.general;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadImageToCloudinary(buffer, folder);

    const secureUrl = result.secure_url as string;
    const publicId = result.public_id as string;

    let documentId: string | null = null;
    try {
      const db = getAdminDb();
      const docRef = await db.collection("websiteImages").add({
        title: title || file.name.replace(/\.[^.]+$/, ""),
        category,
        imageUrl: secureUrl,
        publicId,
        cloudinaryFolder: folder,
        altText: altText || title || "",
        description,
        isActive,
        sortOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      documentId = docRef.id;
    } catch (fsErr) {
      console.error("[upload-image] Firestore write failed (image uploaded but metadata not saved):", fsErr);
    }

    return NextResponse.json({
      secure_url: secureUrl,
      public_id: publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      folder: result.folder,
      documentId,
      title: title || file.name.replace(/\.[^.]+$/, ""),
      category,
      altText: altText || title || "",
      description,
      isActive,
      sortOrder,
    });
  } catch (err) {
    console.error("[upload-image] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}