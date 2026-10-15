import { NextRequest, NextResponse } from "next/server";
import { validateReviewInput, type ReviewInput } from "@/lib/reviews";
import { addReview, getReviews } from "@/lib/firestore";

export async function GET() {
  try {
    const { reviews } = await getReviews({ limit: 50 });
    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { valid, errors, value } = validateReviewInput(body);
  if (!valid || !value) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    const newReview = await addReview(value as ReviewInput);
    return NextResponse.json({ review: newReview }, { status: 201 });
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}