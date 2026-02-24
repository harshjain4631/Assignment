// GET /api/recipes/search
// Search and filter recipes from Firestore.
// Supports filters: difficulty, maxCookingTime, cuisine, dietary tags, search query.
// Fetches recipes with a single query (no composite indexes) and filters in memory.

import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const difficulty = searchParams.get("difficulty");
    const maxTime = searchParams.get("maxCookingTime");
    const cuisine = searchParams.get("cuisine");
    const dietary = searchParams.get("dietary");
    const query = searchParams.get("q");

    console.debug("[search] Incoming search params:", {
      difficulty,
      maxTime,
      cuisine,
      dietary,
      query,
    });

    // Single query: no .where() with orderBy to avoid composite index requirements.
    const adminDb = getAdminDb();
    const snapshot = await adminDb
      .collection("recipes")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    let recipes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply client-side filters that Firestore can't handle in a single query.
    if (difficulty) {
      recipes = recipes.filter(
        (r: Record<string, unknown>) => r.difficulty === difficulty
      );
    }

    if (maxTime) {
      const maxMinutes = parseInt(maxTime, 10);
      recipes = recipes.filter(
        (r: Record<string, unknown>) =>
          (r.cookingTimeMinutes as number) <= maxMinutes
      );
    }

    if (cuisine) {
      recipes = recipes.filter(
        (r: Record<string, unknown>) => r.cuisine === cuisine
      );
    }

    // Filter by dietary tags (recipe must contain ALL requested tags).
    if (dietary) {
      const tags = dietary.split(",");
      recipes = recipes.filter((r: Record<string, unknown>) => {
        const recipeTags = (r.dietaryTags as string[]) || [];
        return tags.every((tag) => recipeTags.includes(tag));
      });
    }

    // Simple text search on title (case-insensitive).
    if (query) {
      const lowerQuery = query.toLowerCase();
      recipes = recipes.filter((r: Record<string, unknown>) =>
        (r.title as string).toLowerCase().includes(lowerQuery)
      );
    }

    return Response.json({ recipes });
  } catch (error) {
    console.error("Recipe search error:", error);
    return Response.json(
      { error: "Failed to search recipes." },
      { status: 500 }
    );
  }
}

