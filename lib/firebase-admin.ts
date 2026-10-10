import { getApps, initializeApp, cert, applicationDefault, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { createHash } from "crypto";

// Server-only Firebase Admin SDK for existing project corexit-652f5
// NEVER import this file in client components.
// Supports (in order):
// 1) FIREBASE_SERVICE_ACCOUNT_KEY — JSON string (or base64-encoded JSON) of service account
// 2) FIREBASE_ADMIN_PRIVATE_KEY + FIREBASE_ADMIN_CLIENT_EMAIL + (FIREBASE_ADMIN_PROJECT_ID | NEXT_PUBLIC_FIREBASE_PROJECT_ID | "corexit-652f5")
// 3) GOOGLE_APPLICATION_CREDENTIALS / ADC (Cloud Run, Firebase Hosting, GCP)
// Project ID verified: corexit-652f5

declare global {
  // eslint-disable-next-line no-var
  var __COREX_ADMIN_APP__: App | undefined;
  // eslint-disable-next-line no-var
  var __COREX_ADMIN_INIT_ERROR__: Error | undefined;
}

let adminInitError: Error | undefined = (globalThis as unknown as { __COREX_ADMIN_INIT_ERROR__?: Error }).__COREX_ADMIN_INIT_ERROR__;

function parseServiceAccountKey(raw: string): Record<string, unknown> | null {
  let trimmed = raw.trim();
  if (!trimmed) return null;
  // Handle accidentally quoted JSON (e.g., FIREBASE_SERVICE_ACCOUNT_KEY='{"type":...}' or "...")
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    try {
      // Unwrap outer quotes and unescape inner quotes if needed
      const unwrapped = trimmed.slice(1, -1).trim();
      // If unwrapped is still JSON, use it
      return JSON.parse(unwrapped) as Record<string, unknown>;
    } catch {
      // fall through to normal handling
      trimmed = trimmed.slice(1, -1).trim();
    }
  }
  // Handle stray < > and var admin = require... wrappers (defensive for malformed .env)
  // Example malformed: FIREBASE_SERVICE_ACCOUNT_KEY=<{ ... },> or > on next line
  if (trimmed.includes('var admin') || trimmed.includes('require(')) {
    return null;
  }
  // Remove leading < and trailing > , commas
  trimmed = trimmed.replace(/^<+\s*/, '').replace(/\s*>+\s*$/, '').trim();
  // Remove trailing comma after closing } or ]
  // Vercel: JSON may have been pasted with trailing comma due to JS object syntax
  trimmed = trimmed.replace(/,\s*$/, '');
  // Try direct JSON
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    // Try removing trailing commas before } or ] (e.g., {"a":1,})
    try {
      const fixed = trimmed.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(fixed) as Record<string, unknown>;
    } catch {
      // Try base64-encoded JSON (common on Vercel when pasting file content)
      try {
        const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
        // Also handle base64 that was quoted
        let dTrim = decoded.trim();
        if ((dTrim.startsWith('"') && dTrim.endsWith('"')) || (dTrim.startsWith("'") && dTrim.endsWith("'"))) {
          dTrim = dTrim.slice(1, -1).trim();
        }
        return JSON.parse(dTrim) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
  }
}

function normalizePrivateKey(key: string): string {
  // Convert escaped \\n into real newline, preserve already-real newlines
  return key.replace(/\\n/g, "\n");
}

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]!;
  const cached = (globalThis as unknown as { __COREX_ADMIN_APP__?: App }).__COREX_ADMIN_APP__;
  if (cached) return cached;
  if (adminInitError) throw adminInitError;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "corexit-652f5";
  if (projectId !== "corexit-652f5") {
    console.warn(`[firebase-admin] Expected projectId "corexit-652f5" but got "${projectId}". Using existing project corexit-652f5.`);
  }
  const effectiveProjectId = "corexit-652f5";

  // 1) Full service account JSON — primary method
  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT || "";
  if (serviceAccountRaw.trim()) {
    const svc = parseServiceAccountKey(serviceAccountRaw);
    // Validate required fields without logging secrets
    const hasPrivateKey = typeof svc?.private_key === "string" && (svc.private_key as string).length > 0;
    const hasClientEmail = typeof svc?.client_email === "string" && (svc.client_email as string).length > 0;
    const projectIdFromSvc = typeof svc?.project_id === "string" ? (svc.project_id as string) : "";
    if (!svc || typeof svc !== "object" || !hasPrivateKey || !hasClientEmail) {
      const err = new Error("FIREBASE_SERVICE_ACCOUNT_KEY is set but could not be parsed as valid service account JSON (missing type/project_id/private_key/client_email). Check JSON formatting, ensure no < > or trailing comma.");
      console.error("[firebase-admin]", err.message);
      adminInitError = err;
      (globalThis as unknown as { __COREX_ADMIN_INIT_ERROR__?: Error }).__COREX_ADMIN_INIT_ERROR__ = adminInitError;
      throw err;
    }
    // Normalize private_key newlines (handle \\n)
    if (typeof svc.private_key === "string") {
      svc.private_key = normalizePrivateKey(svc.private_key as string);
    }
    // Validate project is corexit-652f5 — safe logs only
    if (projectIdFromSvc && projectIdFromSvc !== effectiveProjectId) {
      console.warn(`[firebase-admin] Service account project_id "${projectIdFromSvc}" does not match expected "${effectiveProjectId}". Using ${effectiveProjectId}.`);
    }
    if (typeof svc.client_email === "string" && !svc.client_email.includes("@")) {
      const err = new Error("FIREBASE_SERVICE_ACCOUNT_KEY client_email is invalid.");
      console.error("[firebase-admin]", err.message);
      adminInitError = err;
      (globalThis as unknown as { __COREX_ADMIN_INIT_ERROR__?: Error }).__COREX_ADMIN_INIT_ERROR__ = adminInitError;
      throw err;
    }
    if (typeof svc.private_key === "string" && !svc.private_key.includes("BEGIN PRIVATE KEY")) {
      const err = new Error("FIREBASE_SERVICE_ACCOUNT_KEY private_key is invalid (missing BEGIN PRIVATE KEY). Ensure newlines are preserved as \\n.");
      console.error("[firebase-admin]", err.message);
      adminInitError = err;
      (globalThis as unknown as { __COREX_ADMIN_INIT_ERROR__?: Error }).__COREX_ADMIN_INIT_ERROR__ = adminInitError;
      throw err;
    }
    // Safe logs — never log private_key
    console.log("[firebase-admin] Firebase Admin credentials detected");
    console.log(`[firebase-admin] Firebase Admin project: ${effectiveProjectId}`);
    console.log(`[firebase-admin] Firebase Admin client email configured: ${hasClientEmail}`);
    console.log(`[firebase-admin] Firebase Admin private key configured: ${hasPrivateKey}`);
    try {
      const app = initializeApp({ credential: cert(svc as never), projectId: effectiveProjectId });
      (globalThis as unknown as { __COREX_ADMIN_APP__?: App }).__COREX_ADMIN_APP__ = app;
      return app;
    } catch (e) {
      console.error("[firebase-admin] Failed to init with FIREBASE_SERVICE_ACCOUNT_KEY (check JSON formatting, do NOT log private_key)", e);
      adminInitError = e as Error;
      (globalThis as unknown as { __COREX_ADMIN_INIT_ERROR__?: Error }).__COREX_ADMIN_INIT_ERROR__ = adminInitError;
      throw adminInitError;
    }
  }

  // 2) Split key + email
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  if (privateKeyRaw && clientEmail) {
    const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
    if (!privateKey.includes("BEGIN PRIVATE KEY")) {
      console.warn("[firebase-admin] FIREBASE_ADMIN_PRIVATE_KEY does not look like PEM (missing BEGIN PRIVATE KEY)");
    }
    try {
      const app = initializeApp({
        credential: cert({
          projectId: effectiveProjectId,
          clientEmail,
          privateKey,
        } as never),
      });
      (globalThis as unknown as { __COREX_ADMIN_APP__?: App }).__COREX_ADMIN_APP__ = app;
      return app;
    } catch (e) {
      console.error("[firebase-admin] cert init failed with FIREBASE_ADMIN_PRIVATE_KEY/CLIENT_EMAIL (check key formatting, ensure \\n preserved)", e);
      adminInitError = e as Error;
      (globalThis as unknown as { __COREX_ADMIN_INIT_ERROR__?: Error }).__COREX_ADMIN_INIT_ERROR__ = adminInitError;
    }
  }

  // 3) ADC — only attempt if explicitly configured (GOOGLE_APPLICATION_CREDENTIALS)
  // Do NOT silently fall back to applicationDefault() when no explicit credentials are set,
  // otherwise server throws "Could not load the default credentials" (503).
  const hasAnyAdminEnv = !!(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_SERVICE_ACCOUNT || (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL));
  const hasGacEnv = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!hasAnyAdminEnv && !hasGacEnv) {
    const err = new Error(
      "Firebase Admin not configured on server — missing FIREBASE_SERVICE_ACCOUNT_KEY. Set FIREBASE_SERVICE_ACCOUNT_KEY (full service account JSON) as server-only env var in .env.local (see .env.example). Do NOT use NEXT_PUBLIC_* and do NOT commit the JSON."
    );
    console.error("[firebase-admin]", err.message);
    adminInitError = err;
    (globalThis as unknown as { __COREX_ADMIN_INIT_ERROR__?: Error }).__COREX_ADMIN_INIT_ERROR__ = adminInitError;
    throw err;
  }

  // Explicit credentials missing but GOOGLE_APPLICATION_CREDENTIALS is set → try ADC
  try {
    const app = initializeApp({ credential: applicationDefault(), projectId: effectiveProjectId });
    (globalThis as unknown as { __COREX_ADMIN_APP__?: App }).__COREX_ADMIN_APP__ = app;
    return app;
  } catch (e) {
    // Provide clear configuration error instead of raw "Could not load the default credentials"
    const err = new Error(
      "Firebase Admin not configured on server — applicationDefault() failed and no valid FIREBASE_SERVICE_ACCOUNT_KEY / FIREBASE_ADMIN_PRIVATE_KEY was found. Set FIREBASE_SERVICE_ACCOUNT_KEY in .env.local."
    );
    console.error("[firebase-admin]", err.message);
    // Do not log original e which may contain paths; only log hint
    console.error("[firebase-admin] applicationDefault error:", e instanceof Error ? e.message : String(e));
    adminInitError = err;
    (globalThis as unknown as { __COREX_ADMIN_INIT_ERROR__?: Error }).__COREX_ADMIN_INIT_ERROR__ = adminInitError;
    throw err;
  }
}

function ensureApp(): App {
  const cached = (globalThis as unknown as { __COREX_ADMIN_APP__?: App }).__COREX_ADMIN_APP__;
  if (cached) return cached;
  if (adminInitError) throw adminInitError;
  const gErr = (globalThis as unknown as { __COREX_ADMIN_INIT_ERROR__?: Error }).__COREX_ADMIN_INIT_ERROR__;
  if (gErr) throw gErr;
  const app = getAdminApp();
  (globalThis as unknown as { __COREX_ADMIN_APP__?: App }).__COREX_ADMIN_APP__ = app;
  return app;
}

export function getAdminAuth() {
  return getAuth(ensureApp());
}

export function getAdminDb() {
  try {
    return getFirestore(ensureApp());
  } catch (e) {
    console.error("[firebase-admin] getFirestore failed (Admin not configured)", e);
    throw e;
  }
}

export function isAdminInitialized(): boolean {
  return !adminInitError && !(globalThis as unknown as { __COREX_ADMIN_INIT_ERROR__?: Error }).__COREX_ADMIN_INIT_ERROR__;
}

export function getAdminInitError(): string | null {
  const e = adminInitError || (globalThis as unknown as { __COREX_ADMIN_INIT_ERROR__?: Error }).__COREX_ADMIN_INIT_ERROR__;
  return e ? e.message || String(e) : null;
}

export async function verifyAdminIdToken(authHeader: string | null): Promise<{ uid: string; email?: string } | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  if (!token) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  } catch (e) {
    // Do not log token contents
    console.warn("[firebase-admin] verifyIdToken failed (token invalid or Admin not configured)");
    return null;
  }
}

// Helper to hash token server-side (SHA-256 hex)
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateSecureToken(bytes: number = 32): string {
  // 32 bytes = 64 hex chars — uses Node crypto, server-only
  const { randomBytes } = require("crypto") as typeof import("crypto");
  return randomBytes(bytes).toString("hex");
}

// Human-readable hint for API error responses (never includes secrets)
export function getAdminMissingEnvHint(): string {
  return "Set server-only env: FIREBASE_SERVICE_ACCOUNT_KEY (JSON) OR FIREBASE_ADMIN_PRIVATE_KEY + FIREBASE_ADMIN_CLIENT_EMAIL (+ optional FIREBASE_ADMIN_PROJECT_ID=corexit-652f5). See .env.example. Do NOT use NEXT_PUBLIC_*.";
}
