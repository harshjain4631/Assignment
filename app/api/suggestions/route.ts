// GET /api/suggestions?userId=xxx
// Return personalized recipe suggestions based on user's past ratings.
// Finds the user's top-rated cuisines and recommends similar recipes.

import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return Response.json(
        { error: "userId query param is required." },
        { status: 400 }
      );
    }

    console.debug("[suggestions] Loading suggestions for user:", userId);

    const adminDb = getAdminDb();

    // Fetch the user's ratings, ordered by rating (highest first).
    const ratingsSnap = await adminDb
      .collection("users")
      .doc(userId)
      .collection("ratings")
      .orderBy("rating", "desc")
      .limit(10)
      .get();
    console.debug(
      "[suggestions] Ratings snapshot size:",
      ratingsSnap.size
    );

    if (ratingsSnap.empty) {
      // No ratings yet — return random recipes as suggestions.
      const allRecipes = await adminDb
        .collection("recipes")
        .limit(6)
        .get();
      console.debug(
        "[suggestions] No ratings – fallback recipes size:",
        allRecipes.size
      );

      const recipes = allRecipes.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return Response.json({ suggestions: recipes });
    }

    // Collect recipe IDs the user rated highly (4+).
    const highRatedIds = ratingsSnap.docs
      .filter((doc) => (doc.data().rating as number) >= 4)
      .map((doc) => doc.data().recipeId as string);
    console.debug(
      "[suggestions] High rated recipe IDs:",
      highRatedIds
    );

    // Fetch those recipes to find preferred cuisines.
    const cuisineCounts: Record<string, number> = {};
    for (const recipeId of highRatedIds) {
      const recipeDoc = await adminDb
        .collection("recipes")
        .doc(recipeId)
        .get();
      if (recipeDoc.exists) {
        const cuisine = recipeDoc.data()?.cuisine as string;
        cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
      }
    }

    // Sort cuisines by frequency to find favorites.
    const topCuisines = Object.entries(cuisineCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([cuisine]) => cuisine);

    // If we found favorite cuisines, fetch recipes matching them.
    let suggestions;
    if (topCuisines.length > 0) {
      const snap = await adminDb
        .collection("recipes")
        .where("cuisine", "in", topCuisines)
        .limit(6)
        .get();

      suggestions = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        // Exclude recipes the user already rated.
        .filter((r) => !highRatedIds.includes(r.id));
    } else {
      const snap = await adminDb.collection("recipes").limit(6).get();
      suggestions = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    return Response.json({ suggestions });
  } catch (error) {
    console.error("Suggestions error:", error);
    return Response.json(
      { error: "Failed to load suggestions." },
      { status: 500 }
    );
  }
}
