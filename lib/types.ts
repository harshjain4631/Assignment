// TypeScript interfaces for the Smart Recipe Generator app.
// These types mirror the Firestore document shapes.

/** Single ingredient in a recipe, with quantity and optional flag. */
export interface Ingredient {
  name: string;
  quantity: string;
  optional: boolean;
}

/** Nutrition info per serving. All values in grams except calories. */
export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

/** Ingredient substitution suggestion. */
export interface Substitution {
  original: string;
  replacement: string;
  note: string;
}

/** Full recipe document stored in Firestore. */
export interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  difficulty: "easy" | "medium" | "hard";
  cookingTimeMinutes: number;
  servings: number;
  ingredients: Ingredient[];
  steps: string[];
  nutrition: Nutrition;
  dietaryTags: string[];
  substitutions: Substitution[];
  imageUrl: string;
  isAIGenerated: boolean;
  createdAt: Date;
}

/** User profile stored in Firestore. */
export interface User {
  uid: string;
  displayName: string;
  email: string;
  dietaryPreferences: string[];
  createdAt: Date;
}

/** User's rating for a recipe (sub-collection of users). */
export interface Rating {
  recipeId: string;
  rating: number;
  isFavorite: boolean;
  createdAt: Date;
}

/** Tracked ingredient photo upload. */
export interface IngredientPhoto {
  userId: string;
  imageUrl: string;
  detectedIngredients: string[];
  createdAt: Date;
}

/** Ingredient detected by AI vision with a confidence score. */
export interface DetectedIngredient {
  name: string;
  confidence: number;
}

/** Filters users can apply when browsing recipes. */
export interface RecipeFilters {
  difficulty?: "easy" | "medium" | "hard";
  maxCookingTime?: number;
  cuisine?: string;
  dietaryTags?: string[];
  searchQuery?: string;
}
