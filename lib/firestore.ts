import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  limit as firestoreLimit,
  startAfter,
  DocumentSnapshot,
  Timestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

export type Review = {
  id: string;
  name: string;
  email: string;
  company?: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "new" | "read" | "replied" | "archived";
};

export type ReviewInput = Omit<Review, "id" | "createdAt" | "status">;
export type ContactMessageInput = Omit<ContactMessage, "id" | "createdAt" | "status">;

const REVIEWS_COLLECTION = "reviews";
const CONTACTS_COLLECTION = "contactMessages";

function reviewFromDoc(doc: { id: string; data: () => Record<string, unknown> }): Review {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name as string,
    email: data.email as string,
    company: data.company as string | undefined,
    rating: data.rating as number,
    comment: data.comment as string,
    imageUrl: data.imageUrl as string | undefined,
    createdAt: data.createdAt as string,
    status: (data.status as Review["status"]) || "pending",
  };
}

function contactFromDoc(doc: { id: string; data: () => Record<string, unknown> }): ContactMessage {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name as string,
    email: data.email as string,
    subject: data.subject as string,
    message: data.message as string,
    createdAt: data.createdAt as string,
    status: (data.status as ContactMessage["status"]) || "new",
  };
}

export async function addReview(input: ReviewInput): Promise<Review> {
  const db = getFirestoreDb();
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
    ...input,
    createdAt: now,
    status: "pending",
  });
  return { id: docRef.id, ...input, createdAt: now, status: "pending" };
}

export async function addContactMessage(input: ContactMessageInput): Promise<ContactMessage> {
  const db = getFirestoreDb();
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, CONTACTS_COLLECTION), {
    ...input,
    createdAt: now,
    status: "new",
  });
  return { id: docRef.id, ...input, createdAt: now, status: "new" };
}

export async function getReviews(
  options: {
    status?: Review["status"];
    limit?: number;
    lastDoc?: DocumentSnapshot;
  } = {}
): Promise<{ reviews: Review[]; lastDoc: DocumentSnapshot | null }> {
  const db = getFirestoreDb();
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

  if (options.status) {
    constraints.push(where("status", "==", options.status));
  }

  if (options.limit) {
    constraints.push(firestoreLimit(options.limit));
  }

  if (options.lastDoc) {
    constraints.push(startAfter(options.lastDoc));
  }

  const q = query(collection(db, REVIEWS_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  const reviews = snapshot.docs.map(reviewFromDoc);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { reviews, lastDoc };
}

export async function getContactMessages(
  options: {
    status?: ContactMessage["status"];
    limit?: number;
    lastDoc?: DocumentSnapshot;
  } = {}
): Promise<{ messages: ContactMessage[]; lastDoc: DocumentSnapshot | null }> {
  const db = getFirestoreDb();
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

  if (options.status) {
    constraints.push(where("status", "==", options.status));
  }

  if (options.limit) {
    constraints.push(firestoreLimit(options.limit));
  }

  if (options.lastDoc) {
    constraints.push(startAfter(options.lastDoc));
  }

  const q = query(collection(db, CONTACTS_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  const messages = snapshot.docs.map(contactFromDoc);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { messages, lastDoc };
}

export async function getTotalCounts(): Promise<{
  totalReviews: number;
  totalContactMessages: number;
  pendingReviews: number;
  newContactMessages: number;
}> {
  const db = getFirestoreDb();

  const [reviewsSnap, contactsSnap, pendingReviewsSnap, newContactsSnap] = await Promise.all([
    getDocs(collection(db, REVIEWS_COLLECTION)),
    getDocs(collection(db, CONTACTS_COLLECTION)),
    getDocs(query(collection(db, REVIEWS_COLLECTION), where("status", "==", "pending"))),
    getDocs(query(collection(db, CONTACTS_COLLECTION), where("status", "==", "new"))),
  ]);

  return {
    totalReviews: reviewsSnap.size,
    totalContactMessages: contactsSnap.size,
    pendingReviews: pendingReviewsSnap.size,
    newContactMessages: newContactsSnap.size,
  };
}

export async function updateReviewStatus(
  id: string,
  status: Review["status"]
): Promise<void> {
  const db = getFirestoreDb();
  const { doc, updateDoc } = await import("firebase/firestore");
  await updateDoc(doc(db, REVIEWS_COLLECTION, id), { status });
}

export async function updateContactStatus(
  id: string,
  status: ContactMessage["status"]
): Promise<void> {
  const db = getFirestoreDb();
  const { doc, updateDoc } = await import("firebase/firestore");
  await updateDoc(doc(db, CONTACTS_COLLECTION, id), { status });
}

export async function deleteReview(id: string): Promise<void> {
  const db = getFirestoreDb();
  const { doc, deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, REVIEWS_COLLECTION, id));
}

export async function deleteContactMessage(id: string): Promise<void> {
  const db = getFirestoreDb();
  const { doc, deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, CONTACTS_COLLECTION, id));
}