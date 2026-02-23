// POST /api/recipes/[id]/rate
// Submit a star rating (1-5) and/or favorite status for a recipe.
// Requires a userId in the request body (from Firebase Auth on the client).

import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recipeId } = await params;
    const body = await request.json();
    const { userId, rating, isFavorite } = body as {
      userId: string;
      rating: number;
      isFavorite: boolean;
    };

    console.debug("[rate] Incoming rating request:", {
      recipeId,
      userId,
      rating,
      isFavorite,
    });

    // Validate required fields.
    if (!userId) {
      return Response.json(
        { error: "userId is required." },
        { status: 400 }
      );
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return Response.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    console.debug("[rate] Using Admin Firestore for project:", process.env.FIREBASE_ADMIN_PROJECT_ID);

    // Verify the recipe exists before saving a rating.
    const recipeDoc = await adminDb.collection("recipes").doc(recipeId).get();
    console.debug("[rate] Recipe exists:", recipeDoc.exists);
    if (!recipeDoc.exists) {
      return Response.json({ error: "Recipe not found." }, { status: 404 });
    }

    // Upsert the rating in the user's ratings sub-collection.
    // The doc ID is the recipeId so each user has one rating per recipe.
    const ratingRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("ratings")
      .doc(recipeId);

    const ratingData: Record<string, unknown> = {
      recipeId,
      createdAt: new Date(),
    };

    if (rating !== undefined) ratingData.rating = rating;
    if (isFavorite !== undefined) ratingData.isFavorite = isFavorite;

    // Merge so we don't overwrite existing fields.
    await ratingRef.set(ratingData, { merge: true });
    console.debug("[rate] Rating document written at users/%s/ratings/%s", userId, recipeId);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Rate recipe error:", error);
    return Response.json(
      { error: "Failed to save rating." },
      { status: 500 }
    );
  }
}
