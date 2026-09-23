import { v2 as cloudinary } from "cloudinary";

// Server-only Cloudinary config — shared by all admin image upload/delete routes.
// NEVER import this module in client components.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const BLOG_IMAGE_FOLDER = "corex-it/blogs";
export const CLIENT_BRANDS_FOLDER = "corex-it/client-brands";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export function uploadImageToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "avif"],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as Record<string, unknown>);
      }
    );
    uploadStream.end(buffer);
  });
}

export async function destroyCloudinaryImage(publicId: string): Promise<string> {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
  return result.result;
}