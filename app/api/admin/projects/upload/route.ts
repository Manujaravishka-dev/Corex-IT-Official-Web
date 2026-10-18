import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { verifyAdminIdToken } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  if (!(await verifyAdminIdToken(req.headers.get("authorization")))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) return NextResponse.json({ error: "Cloudinary not configured" }, { status: 503 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Use a JPEG, PNG, WebP or AVIF image under 10MB" }, { status: 400 });
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "corexit/projects";
    const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
    const upload = new FormData();
    upload.append("file", file);
    upload.append("api_key", key);
    upload.append("timestamp", String(timestamp));
    upload.append("folder", folder);
    upload.append("signature", signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, { method: "POST", body: upload });
    const data = await response.json();
    if (!response.ok || !data.secure_url) return NextResponse.json({ error: "Cloudinary upload failed" }, { status: 502 });
    return NextResponse.json({ url: data.secure_url, publicId: data.public_id });
  } catch { return NextResponse.json({ error: "Upload failed" }, { status: 500 }); }
}