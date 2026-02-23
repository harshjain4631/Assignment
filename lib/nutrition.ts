// Nutrition calculation helpers.
// Used to scale nutrition values when adjusting serving sizes.

import type { Nutrition, Ingredient } from "./types";

/**
 * Scale nutrition values from the original servings to a new serving count.
 * Returns a new Nutrition object with recalculated values (rounded).
 */
export function scaleNutrition(
  nutrition: Nutrition,
  originalServings: number,
  newServings: number
): Nutrition {
  // Avoid division by zero.
  if (originalServings <= 0) return nutrition;

  const factor = newServings / originalServings;

  return {
    calories: Math.round(nutrition.calories * factor),
    protein: Math.round(nutrition.protein * factor * 10) / 10,
    carbs: Math.round(nutrition.carbs * factor * 10) / 10,
    fat: Math.round(nutrition.fat * factor * 10) / 10,
    fiber: Math.round(nutrition.fiber * factor * 10) / 10,
  };
}

/**
 * Scale ingredient quantities when changing serving size.
 * Parses the numeric portion of the quantity string and multiplies it.
 */
export function scaleIngredients(
  ingredients: Ingredient[],
  originalServings: number,
  newServings: number
): Ingredient[] {
  if (originalServings <= 0) return ingredients;

  const factor = newServings / originalServings;

  return ingredients.map((ing) => {
    // Try to extract a leading number from the quantity string.
    const match = ing.quantity.match(/^([\d.\/]+)\s*(.*)/);
    if (!match) return ing;

    const numericPart = match[1];
    const unitPart = match[2];

    // Handle fractions like "1/2".
    let value: number;
    if (numericPart.includes("/")) {
      const [numerator, denominator] = numericPart.split("/").map(Number);
      value = numerator / denominator;
    } else {
      value = parseFloat(numericPart);
    }

    if (isNaN(value)) return ing;

    // Round to one decimal place for clean display.
    const scaled = Math.round(value * factor * 10) / 10;
    const newQuantity = `${scaled} ${unitPart}`.trim();

    return { ...ing, quantity: newQuantity };
  });
}
