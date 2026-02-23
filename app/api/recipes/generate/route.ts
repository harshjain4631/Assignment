// POST /api/recipes/generate
// Accepts ingredients + dietary preferences, streams AI-generated recipes back.
// Uses Vercel AI SDK streamObject() with Gemini 3 Flash.

import { streamObject } from "ai";
import { z } from "zod";
import { aiModel } from "@/lib/ai";
import { buildRecipePrompt } from "@/lib/prompts";

// Zod schema for a single generated recipe.
const recipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  cuisine: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  cookingTimeMinutes: z.number(),
  servings: z.number(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
      optional: z.boolean(),
    })
  ),
  steps: z.array(z.string()),
  nutrition: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
    fiber: z.number(),
  }),
  dietaryTags: z.array(z.string()),
  substitutions: z.array(
    z.object({
      original: z.string(),
      replacement: z.string(),
      note: z.string(),
    })
  ),
});

// Schema for the full response: an array of recipes.
const recipesResponseSchema = z.object({
  recipes: z.array(recipeSchema),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ingredients, dietary } = body as {
      ingredients: string[];
      dietary: string[];
    };

    // Validate we received at least one ingredient.
    if (!ingredients || ingredients.length === 0) {
      return Response.json(
        { error: "At least one ingredient is required." },
        { status: 400 }
      );
    }

    // Build the prompt from user inputs.
    const prompt = buildRecipePrompt(ingredients, dietary || []);

    // Stream the AI response using structured object generation.
    const result = streamObject({
      model: aiModel,
      prompt,
      schema: recipesResponseSchema,
    });

    // Return the streamed response to the client.
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Recipe generation error:", error);
    return Response.json(
      { error: "Failed to generate recipes. Please try again." },
      { status: 500 }
    );
  }
}
