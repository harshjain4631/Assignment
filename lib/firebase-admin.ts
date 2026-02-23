// Firebase Admin SDK initialization for server-side operations.
// Uses lazy initialization to avoid errors during build time.

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Cached references to avoid re-initializing.
let _app: App | null = null;
let _db: Firestore | null = null;

/**
 * Lazily initialize and return the Firebase Admin app.
 * This prevents build-time errors when env vars aren't set.
 */
function getAdminApp(): App {
  if (_app) return _app;

  const existing = getApps();
  if (existing.length > 0) {
    _app = existing[0];
    console.debug(
      "[firebase-admin] Reusing existing Admin app for project:",
      process.env.FIREBASE_ADMIN_PROJECT_ID
    );
    return _app;
  }

  try {
    _app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // The private key may have escaped newlines in env vars — replace them.
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
      }),
    });

    console.debug(
      "[firebase-admin] Initialized Admin app for project:",
      process.env.FIREBASE_ADMIN_PROJECT_ID
    );
  } catch (error) {
    console.error(
      "[firebase-admin] Failed to initialize Admin app. Check FIREBASE_ADMIN_* environment variables.",
      error
    );
    throw error;
  }

  return _app;
}

/**
 * Get the admin Firestore instance (lazy-initialized).
 * Call this function instead of using a top-level export.
 */
export function getAdminDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getAdminApp());
  console.debug("[firebase-admin] Firestore Admin client initialized.");
  return _db;
}
