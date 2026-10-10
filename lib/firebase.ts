<<<<<<< HEAD
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

=======
// Central Firebase module for existing project CorexIT (corexit-652f5) — Web App: corexit
// Do NOT copy this config into multiple components. Import from here only.
// Uses Firebase Modular SDK, initializes once via getApps()/getApp() to prevent
// duplicate init during Next.js dev / HMR.
// Env vars (actual values in .env.local):
// NEXT_PUBLIC_FIREBASE_API_KEY
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
// NEXT_PUBLIC_FIREBASE_DATABASE_URL
// NEXT_PUBLIC_FIREBASE_PROJECT_ID  (must be corexit-652f5)
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
// NEXT_PUBLIC_FIREBASE_APP_ID
// NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID (G-Z2GV5QFVE1)
// Never expose Admin SDK private keys here.

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
// Analytics is imported dynamically client-side only — see initAnalytics() below
import type { Analytics } from "firebase/analytics";

// Web App config for corexit-652f5 / corexit — MUST come from .env.local (never hardcode real secrets here)
// Required vars: NEXT_PUBLIC_FIREBASE_API_KEY, AUTH_DOMAIN, DATABASE_URL, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID, MEASUREMENT_ID
// See .env.example for template. Real values in .env.local (gitignored).
>>>>>>> 2c025544e1f15a8d71a440e0c31624deb1a31c5f
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

<<<<<<< HEAD
let app: FirebaseApp;
let db: Firestore;

function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  return { app, db };
}

export function getFirebaseApp() {
  if (!app) {
    initializeFirebase();
  }
  return app;
}

export function getFirestoreDb() {
  if (!db) {
    initializeFirebase();
  }
  return db;
}

export { initializeFirebase };
export default firebaseConfig;
=======
if (firebaseConfig.projectId && firebaseConfig.projectId !== "corexit-652f5") {
  console.warn(
    `[firebase] Expected projectId "corexit-652f5" but got "${firebaseConfig.projectId}". Use the existing CorexIT project.`
  );
}

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();

  const hasRequiredKeys = !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );

  if (!hasRequiredKeys) {
    const missing = [
      !firebaseConfig.apiKey && "NEXT_PUBLIC_FIREBASE_API_KEY",
      !firebaseConfig.authDomain && "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      !firebaseConfig.projectId && "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      !firebaseConfig.appId && "NEXT_PUBLIC_FIREBASE_APP_ID",
    ]
      .filter(Boolean)
      .join(", ");
    if (typeof window !== "undefined") {
      console.error(
        `[firebase] Missing Firebase env vars: ${missing}. Ensure .env.local exists with values from Firebase Console > Project Settings > Web App corexit (corexit-652f5). Then restart npm run dev.`
      );
    }
    // Allow build to succeed without real credentials (SSR/static generation)
    // Use placeholders so initializeApp doesn't crash during `next build` without .env.local
    return initializeApp({
      apiKey: firebaseConfig.apiKey || "missing-api-key",
      authDomain: firebaseConfig.authDomain || "corexit-652f5.firebaseapp.com",
      databaseURL: firebaseConfig.databaseURL || "https://corexit-652f5-default-rtdb.firebaseio.com",
      projectId: firebaseConfig.projectId || "corexit-652f5",
      storageBucket: firebaseConfig.storageBucket || "corexit-652f5.firebasestorage.app",
      messagingSenderId: firebaseConfig.messagingSenderId || "159898089316",
      appId: firebaseConfig.appId || "1:159898089316:web:aac5fba1a72efc42446c71",
      measurementId: firebaseConfig.measurementId || "G-Z2GV5QFVE1",
    } as typeof firebaseConfig);
  }

  return initializeApp(firebaseConfig as NonNullable<typeof firebaseConfig>);
}

const app: FirebaseApp = getFirebaseApp();

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// ── Analytics — client-safe, SSR-safe ──────────────────────────────────────
// Exports: `analytics` (may be null on server / if unsupported / if measurementId missing)
// and `initAnalytics()` for explicit lazy init if desired.
// Analytics never breaks the site: wrapped in try/catch and `isSupported()` check,
// and only runs in browser.

let analyticsInstance: Analytics | null = null;
let analyticsInitPromise: Promise<Analytics | null> | null = null;

/**
 * Safely initialize Firebase Analytics in the browser.
 * - No-op on server (typeof window === "undefined")
 * - No-op if already initialized
 * - Catches unsupported environments (e.g. no cookies, private mode)
 * - Returns null on failure without throwing
 */
export async function initAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (analyticsInstance) return analyticsInstance;
  if (analyticsInitPromise) return analyticsInitPromise;

  analyticsInitPromise = (async () => {
    try {
      const { isSupported, getAnalytics } = await import("firebase/analytics");
      const supported = await isSupported();
      if (!supported) return null;
      // Only initialize if measurementId is present (required for Analytics)
      if (!firebaseConfig.measurementId) return null;
      analyticsInstance = getAnalytics(app);
      return analyticsInstance;
    } catch {
      // Analytics unavailable — do not break app
      return null;
    }
  })();

  return analyticsInitPromise;
}

// Eagerly attempt analytics init on client (fire-and-forget, never throws, no unhandled rejection)
if (typeof window !== "undefined") {
  setTimeout(() => {
    void initAnalytics().catch(() => null);
  }, 0);
  // Also catch any unhandled promise from Firebase Installations/Analytics
  if (typeof window.addEventListener === "function") {
    window.addEventListener("unhandledrejection", (event) => {
      const msg = String((event.reason as Error)?.message || event.reason || "");
      if (msg.includes("Analytics") || msg.includes("Installations") || msg.includes("API key")) {
        // Swallow analytics/installations failures — do not crash app
        event.preventDefault();
      }
    });
  }
}

// Safe runtime diagnostic without exposing full key (only prefix/suffix/length)
if (typeof window !== "undefined") {
  try {
    const k = firebaseConfig.apiKey as string;
    const hasKey = !!k && k.startsWith("AIza") && k.length >= 30;
    if (!hasKey) {
      console.warn(
        "[firebase] NEXT_PUBLIC_FIREBASE_API_KEY appears missing or malformed (expected AIza... prefix). Copy the correct value from Firebase Console: Project Settings > General > Web App corexit > SDK config > apiKey. Then restart `npm run dev`."
      );
    } else {
      // Only log that key is present, never full value
      console.debug(`[firebase] Config loaded: projectId=${firebaseConfig.projectId}, apiKeyPrefix=${k.slice(0, 6)}...`);
    }
  } catch { /* ignore */ }
}

// Export for consumers that want to call getAnalytics explicitly
export const analytics: Analytics | null = analyticsInstance;

// Re-export app as default and named for flexibility
export { app };
export default app;
>>>>>>> 2c025544e1f15a8d71a440e0c31624deb1a31c5f
