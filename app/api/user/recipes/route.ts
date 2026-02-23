// POST /api/user/recipes
// Save a generated recipe for a specific user into Firestore.
// Writes to users/{userId}/recipes and also mirrors into the global recipes collection.

import { NextRequest } from "next/server";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";

// Reuse the same shape as the generate endpoint, minus the id field.
const ingredientSchema = z.object({
  name: z.string(),
  quantity: z.string(),
  optional: z.boolean(),
});

const nutritionSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number(),
});

const substitutionSchema = z.object({
  original: z.string(),
  replacement: z.string(),
  note: z.string(),
});

const recipeWithoutIdSchema = z.object({
  title: z.string(),
  description: z.string(),
  cuisine: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  cookingTimeMinutes: z.number(),
  servings: z.number(),
  ingredients: z.array(ingredientSchema),
  steps: z.array(z.string()),
  nutrition: nutritionSchema,
  dietaryTags: z.array(z.string()),
  substitutions: z.array(substitutionSchema),
  // Optional fields for generated recipes.
  imageUrl: z.string().optional().default(""),
  isAIGenerated: z.boolean().optional().default(true),
});

const saveBodySchema = z.object({
  userId: z.string().min(1),
  recipe: recipeWithoutIdSchema,
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { userId, recipe } = saveBodySchema.parse(json);

    const adminDb = getAdminDb();

    // First, create a doc in the global recipes collection so search/suggestions work.
    const globalRef = await adminDb.collection("recipes").add({
      ...recipe,
      isAIGenerated: true,
      authorId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const globalSnap = await globalRef.get();
    const recipeId = globalRef.id;

    // Also save under the user's personal recipes sub-collection.
    const userRecipeRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("recipes")
      .doc(recipeId);

    await userRecipeRef.set(
      {
        ...recipe,
        isAIGenerated: true,
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    const data = { id: recipeId, ...globalSnap.data() };

    return Response.json({ recipe: data });
  } catch (error) {
    console.error("Save recipe error:", error);
    return Response.json(
      { error: "Failed to save recipe." },
      { status: 500 }
    );
  }
}

