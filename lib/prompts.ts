// AI prompt templates for recipe generation and ingredient recognition.
// These are used by the API routes to construct structured AI requests.

/**
 * Build a prompt that asks the AI to generate 3-5 recipes
 * from a given list of ingredients and dietary preferences.
 */
export function buildRecipePrompt(
  ingredients: string[],
  dietary: string[]
): string {
  return `You are a professional chef and nutritionist. Generate 20+ recipes using these ingredients:

Ingredients: ${ingredients.join(", ")}
Dietary restrictions: ${dietary.length ? dietary.join(", ") : "none"}

Requirements:
- Each recipe must include: title, description, cuisine, difficulty (easy/medium/hard), cooking time in minutes, servings, full ingredient list with quantities, step-by-step instructions, nutrition per serving (calories, protein, carbs, fat, fiber in grams), dietary tags, and 2-3 ingredient substitution suggestions.
- Prioritize recipes that use MOST of the provided ingredients.
- Include a mix of difficulties (easy, medium, hard).
- Be accurate with nutrition estimates.
- Make the recipes practical and delicious.
- For substitutions, include the original ingredient, the replacement, and a short note explaining why.`;
}

/**
 * Build a prompt for recognizing ingredients from an uploaded image.
 * The AI vision model will identify food items visible in the photo.
 */
export function buildIngredientRecognitionPrompt(): string {
  return `You are a food ingredient recognition expert. Look at this image carefully and list ALL food ingredients visible.

For each ingredient:
- Provide the common name (e.g. "tomato", "chicken breast", "olive oil")
- Estimate your confidence from 0.0 to 1.0

Only list actual food ingredients. Do not list:
- Kitchen utensils, plates, or containers
- Non-food items
- Decorative items

Be specific: say "red bell pepper" instead of just "pepper".`;
}

/**
 * Build a prompt for generating personalized recipe suggestions
 * based on a user's past ratings and preferences.
 */
export function buildSuggestionPrompt(
  topRatedCuisines: string[],
  dietaryPreferences: string[]
): string {
  return `You are a recipe recommendation expert. Based on the user's preferences, suggest 3 unique recipe ideas.

User's favorite cuisines: ${topRatedCuisines.join(", ") || "varied"}
Dietary preferences: ${dietaryPreferences.join(", ") || "none"}

For each suggestion, provide a brief title and description.
Make the suggestions diverse but aligned with the user's tastes.`;
}
