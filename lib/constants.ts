// App-wide constants for dietary options, cuisines, difficulties, etc.

/** Available dietary restriction tags. */
export const DIETARY_OPTIONS = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "low-carb",
  "keto",
  "paleo",
] as const;

/** Supported cuisine types. */
export const CUISINES = [
  "Italian",
  "Mexican",
  "Indian",
  "Chinese",
  "Japanese",
  "Thai",
  "American",
  "Mediterranean",
  "French",
  "Korean",
  "Middle Eastern",
  "Greek",
] as const;

/** Recipe difficulty levels. */
export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

/** Common cooking time ranges for filtering (in minutes). */
export const COOKING_TIME_OPTIONS = [
  { label: "Under 15 min", value: 15 },
  { label: "Under 30 min", value: 30 },
  { label: "Under 45 min", value: 45 },
  { label: "Under 60 min", value: 60 },
  { label: "Any time", value: 999 },
] as const;

/** Predefined common ingredients for autocomplete suggestions. */
export const COMMON_INGREDIENTS = [
  "tomato", "onion", "garlic", "chicken", "beef", "pork", "salmon",
  "shrimp", "tofu", "rice", "pasta", "potato", "carrot", "broccoli",
  "spinach", "bell pepper", "mushroom", "cheese", "egg", "butter",
  "olive oil", "lemon", "lime", "ginger", "soy sauce", "flour",
  "sugar", "salt", "pepper", "basil", "oregano", "cumin", "paprika",
  "chili", "coconut milk", "cream", "milk", "bread", "avocado",
  "corn", "beans", "lentils", "chickpeas", "yogurt", "honey",
  "cilantro", "parsley", "thyme", "rosemary", "cinnamon",
] as const;

/** App metadata constants. */
export const APP_NAME = "Smart Recipe Generator";
export const APP_DESCRIPTION =
  "Find delicious recipes from the ingredients you already have.";
