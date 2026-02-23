// POST /api/ingredients/recognize
// Accept an image (base64) and use AI vision to detect food ingredients.
// Returns a structured list of detected ingredients with confidence scores.

import { generateObject } from "ai";
import { z } from "zod";
import { aiModel } from "@/lib/ai";
import { buildIngredientRecognitionPrompt } from "@/lib/prompts";

// Schema for the AI response — a list of ingredient names + confidence.
const ingredientRecognitionSchema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string().describe("Common name of the ingredient"),
      confidence: z
        .number()
        .min(0)
        .max(1)
        .describe("Confidence score from 0.0 to 1.0"),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image } = body as { image: string };

    // Validate that an image was provided.
    if (!image) {
      return Response.json(
        { error: "An image (base64 string) is required." },
        { status: 400 }
      );
    }

    // Call the AI vision model with the image + recognition prompt.
    const result = await generateObject({
      model: aiModel,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", image },
            { type: "text", text: buildIngredientRecognitionPrompt() },
          ],
        },
      ],
      schema: ingredientRecognitionSchema,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error("Ingredient recognition error:", error);
    return Response.json(
      { error: "Failed to recognize ingredients. Please try again." },
      { status: 500 }
    );
  }
}
