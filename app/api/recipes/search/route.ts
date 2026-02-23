// GET /api/recipes/search
// Search and filter recipes from Firestore.
// Supports filters: difficulty, maxCookingTime, cuisine, dietary tags, search query.

import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Extract filter params from the query string.
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

    // Start with the base collection reference.
    const adminDb = getAdminDb();
    let recipesRef = adminDb.collection("recipes").orderBy("createdAt", "desc");

    // Apply Firestore-supported filters.
    if (difficulty) {
      recipesRef = recipesRef.where("difficulty", "==", difficulty);
    }
    if (cuisine) {
      recipesRef = recipesRef.where("cuisine", "==", cuisine);
    }

    // Execute the query (limit to 50 results).
    const snapshot = await recipesRef.limit(50).get();
    console.debug("[search] Recipes snapshot size:", snapshot.size);

    let recipes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Apply client-side filters that Firestore can't handle in a single query.
    if (maxTime) {
      const maxMinutes = parseInt(maxTime, 10);
      recipes = recipes.filter(
        (r: Record<string, unknown>) =>
          (r.cookingTimeMinutes as number) <= maxMinutes
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
