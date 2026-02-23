// Script to seed Firestore with initial recipes from seed-recipes.json.
// Run with: npx tsx scripts/seed-db.ts
//
// Requires FIREBASE_ADMIN_* env vars to be set (or a .env.local file).

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load env vars from .env.local if available.
import { config } from "dotenv";
config({ path: resolve(process.cwd(), ".env.local") });

// Initialize Firebase Admin.
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);

async function seed() {
  // Read the seed data file.
  const filePath = resolve(process.cwd(), "data", "seed-recipes.json");
  const raw = readFileSync(filePath, "utf-8");
  const recipes = JSON.parse(raw);

  console.log(`Seeding ${recipes.length} recipes...`);

  // Use a batch write for efficiency (max 500 per batch in Firestore).
  const batch = db.batch();

  for (const recipe of recipes) {
    const docRef = db.collection("recipes").doc();
    batch.set(docRef, {
      ...recipe,
      createdAt: new Date(),
    });
  }

  await batch.commit();
  console.log(`Successfully seeded ${recipes.length} recipes to Firestore.`);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
