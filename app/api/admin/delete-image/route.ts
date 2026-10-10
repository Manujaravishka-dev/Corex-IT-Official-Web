import { NextRequest, NextResponse } from "next/server";
import { verifyAdminIdToken, getAdminDb } from "@/lib/firebase-admin";
import { cloudinaryConfigured, destroyCloudinaryImage } from "@/lib/cloudinary";

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

    const body = await request.json();
    const { publicId, documentId } = body;

    if (!publicId || typeof publicId !== "string") {
      return NextResponse.json({ error: "publicId is required" }, { status: 400 });
    }

    let cloudinaryResult = "ok";
    try {
      cloudinaryResult = await destroyCloudinaryImage(publicId);
    } catch (clErr) {
      console.error("[delete-image] Cloudinary delete failed:", clErr);
      return NextResponse.json(
        { error: clErr instanceof Error ? clErr.message : "Cloudinary delete failed" },
        { status: 502 }
      );
    }

    if (cloudinaryResult !== "ok" && cloudinaryResult !== "not found") {
      return NextResponse.json(
        { error: `Cloudinary returned: ${cloudinaryResult}` },
        { status: 502 }
      );
    }

    let firestoreResult = "skipped";
    if (documentId && typeof documentId === "string") {
      try {
        const db = getAdminDb();
        await db.collection("websiteImages").doc(documentId).delete();
        firestoreResult = "deleted";
      } catch (fsErr) {
        console.error("[delete-image] Firestore delete failed:", fsErr);
        firestoreResult = "failed";
      }
    }

    return NextResponse.json({ result: cloudinaryResult, firestore: firestoreResult });
  } catch (err) {
    console.error("[delete-image] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}