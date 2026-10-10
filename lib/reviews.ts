export type Review = {
  id: string;
  name: string;
  email: string;
  company?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO string
  imageUrl?: string;
};

export type ReviewInput = Omit<Review, "id" | "createdAt">;

export type ReviewsResponse = {
  reviews: Review[];
};

// Deprecated: hardcoded testimonials removed — public site now loads dynamically from Firestore `testimonials` where status="published".
// Do NOT use this as fallback. See lib/firebase.ts + components/testimonials-section.tsx for Firestore integration.
// This empty array prevents duplicate hardcoded data while keeping Review type for legacy validation.
export const initialReviews: Review[] = [];

export function validateReviewInput(data: unknown): {
  valid: boolean;
  errors: Partial<Record<keyof ReviewInput, string>>;
  value?: ReviewInput;
} {
  const errors: Partial<Record<keyof ReviewInput, string>> = {};
  if (!data || typeof data !== "object") {
    return { valid: false, errors: { comment: "Invalid payload" } };
  }
  const d = data as Record<string, unknown>;
  const name = typeof d.name === "string" ? d.name.trim() : "";
  const email = typeof d.email === "string" ? d.email.trim() : "";
  const company = typeof d.company === "string" ? d.company.trim() : "";
  const rating = typeof d.rating === "number" ? d.rating : Number(d.rating);
  const comment = typeof d.comment === "string" ? d.comment.trim() : "";
  const imageUrl = typeof d.imageUrl === "string" ? d.imageUrl.trim() : "";

  if (!name) errors.name = "Name is required";
  else if (name.length < 2) errors.name = "Name must be at least 2 characters";
  else if (name.length > 80) errors.name = "Name must be under 80 characters";

  if (!email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address";

  if (company && company.length > 100) errors.company = "Company must be under 100 characters";

  if (imageUrl && imageUrl.length > 800) errors.imageUrl = "Image URL must be under 800 characters";
  else if (imageUrl && !/^https?:\/\/.+\..+/.test(imageUrl)) errors.imageUrl = "Image URL must be a valid http(s) URL";

  if (!rating || Number.isNaN(rating)) errors.rating = "Rating is required";
  else if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    errors.rating = "Rating must be between 1 and 5";

  if (!comment) errors.comment = "Review is required";
  else if (comment.length < 10) errors.comment = "Review must be at least 10 characters";
  else if (comment.length > 600) errors.comment = "Review must be under 600 characters";

  if (Object.keys(errors).length > 0) return { valid: false, errors };

  return {
    valid: true,
    errors: {},
    value: { name, email, company: company || undefined, rating, comment, imageUrl: imageUrl || undefined },
  };
}
