// Firebase client SDK initialization.
// Used in client components for Auth, Firestore reads, and Storage uploads.
// Handles missing config gracefully during build/SSR.

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Firebase config pulled from environment variables (NEXT_PUBLIC_ prefix = client-safe).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy-initialize Firebase only when config values are present.
// This prevents build-time errors when env vars aren't set.
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (_app) return _app;

  // Skip initialization if API key is missing (build time / SSR without env).
  if (!firebaseConfig.apiKey) {
    console.warn(
      "[firebase] NEXT_PUBLIC_FIREBASE_API_KEY is missing – skipping client SDK initialization."
    );
    return null;
  }

  const alreadyInitialized = getApps().length > 0;
  _app = alreadyInitialized ? getApp() : initializeApp(firebaseConfig);

  if (alreadyInitialized) {
    console.debug(
      "[firebase] Reusing existing Firebase app instance for project:",
      firebaseConfig.projectId
    );
  } else {
    console.debug(
      "[firebase] Initialized new Firebase app instance for project:",
      firebaseConfig.projectId
    );
  }

  return _app;
}

// Export getter functions that handle missing config gracefully.
export function getFirebaseAuth(): Auth | null {
  if (_auth) return _auth;
  const app = getFirebaseApp();
  if (!app) {
    console.warn("[firebase] getFirebaseAuth called but Firebase app is null.");
    return null;
  }
  _auth = getAuth(app);
  console.debug("[firebase] Firebase Auth initialized.");
  return _auth;
}

export function getFirebaseDb(): Firestore | null {
  if (_db) return _db;
  const app = getFirebaseApp();
  if (!app) {
    console.warn("[firebase] getFirebaseDb called but Firebase app is null.");
    return null;
  }
  _db = getFirestore(app);
  console.debug("[firebase] Firestore client initialized.");
  return _db;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  if (_storage) return _storage;
  const app = getFirebaseApp();
  if (!app) {
    console.warn("[firebase] getFirebaseStorage called but Firebase app is null.");
    return null;
  }
  _storage = getStorage(app);
  console.debug("[firebase] Firebase Storage initialized.");
  return _storage;
}

// Legacy exports for backward compatibility — these will be null during build.
export const auth = null as unknown as Auth;
export const db = null as unknown as Firestore;
export const storage = null as unknown as FirebaseStorage;
