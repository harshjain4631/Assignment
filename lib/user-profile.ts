// Helper functions for syncing Firebase Auth users into Firestore profiles.
// Runs on the client using the Firebase Web SDK.

import type { User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

/**
 * Create or update the Firestore user profile document for the given auth user.
 * This is safe to call on every login; it uses merge semantics.
 */
export async function syncUserProfile(user: User): Promise<void> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn(
      "[user-profile] Firestore DB is null – cannot sync user profile for",
      user.uid
    );
    return;
  }

  const ref = doc(db, "users", user.uid);

  const profile = {
    name: user.displayName ?? "",
    email: user.email ?? "",
    photoUrl: user.photoURL ?? "",
    updatedAt: serverTimestamp(),
    // createdAt is only set if missing, thanks to merge: true.
    createdAt: serverTimestamp(),
  };

  await setDoc(ref, profile, { merge: true });
  console.debug("[user-profile] Synced user profile for", user.uid);
}

