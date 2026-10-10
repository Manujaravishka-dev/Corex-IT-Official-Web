import { auth, db } from "@/lib/firebase";

/** Report a failed public read without throwing or logging tokens/document data. */
export function reportPublicFirestoreError(path: string, operation: "get" | "list", error: unknown) {
  if (process.env.NODE_ENV === "production") return;
  const code = typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : "unknown";
  console.error(`[firestore] Public ${operation.toUpperCase()} failed: ${path}`, {
    code,
    projectId: db.app.options.projectId,
    authenticated: auth.currentUser !== null,
    hint: code === "permission-denied"
      ? "Check deployed firestore.rules for this project and the public query constraints. Local rules are not deployed automatically."
      : "Check Firestore availability and the query indexes.",
  });
}
