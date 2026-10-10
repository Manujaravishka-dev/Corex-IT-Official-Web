import { NextRequest, NextResponse } from "next/server";
import { addContactMessage } from "@/lib/firestore";

interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function validateContactInput(data: unknown): {
  valid: boolean;
  errors: Partial<Record<keyof ContactInput, string>>;
  value?: ContactInput;
} {
  const errors: Partial<Record<keyof ContactInput, string>> = {};

  if (!data || typeof data !== "object") {
    return { valid: false, errors: { message: "Invalid payload" } };
  }

  const d = data as Record<string, unknown>;
  const name = typeof d.name === "string" ? d.name.trim() : "";
  const email = typeof d.email === "string" ? d.email.trim() : "";
  const subject = typeof d.subject === "string" ? d.subject.trim() : "";
  const message = typeof d.message === "string" ? d.message.trim() : "";

  if (!name) errors.name = "Name is required";
  else if (name.length < 2) errors.name = "Name must be at least 2 characters";
  else if (name.length > 80) errors.name = "Name must be under 80 characters";

  if (!email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";

  if (!subject) errors.subject = "Subject is required";
  else if (subject.length > 120) errors.subject = "Subject must be under 120 characters";

  if (!message) errors.message = "Message is required";
  else if (message.length < 10) errors.message = "Message must be at least 10 characters";
  else if (message.length > 2000) errors.message = "Message must be under 2000 characters";

  if (Object.keys(errors).length > 0) return { valid: false, errors };

  return { valid: true, errors: {}, value: { name, email, subject, message } };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { valid, errors, value } = validateContactInput(body);
  if (!valid || !value) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  try {
    const newMessage = await addContactMessage(value);
    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Error adding contact message:", error);
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
  }
}