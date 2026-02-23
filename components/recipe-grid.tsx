// Responsive grid layout for displaying recipe cards.
"use client";

import { RecipeCard } from "@/components/recipe-card";
import type { Recipe } from "@/lib/types";

interface RecipeGridProps {
  recipes: Recipe[];
  favorites?: string[];
  onToggleFavorite?: (recipeId: string) => void;
  onSaveRecipe?: (recipe: Recipe) => void;
  onSelectRecipe?: (recipe: Recipe) => void;
}

export function RecipeGrid({
  recipes,
  favorites = [],
  onToggleFavorite,
  onSaveRecipe,
  onSelectRecipe,
}: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          No recipes found.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or adding more ingredients.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          isFavorite={favorites.includes(recipe.id)}
          onToggleFavorite={onToggleFavorite}
          onSaveRecipe={onSaveRecipe}
          onSelectRecipe={onSelectRecipe}
        />
      ))}
    </div>
  );
}
