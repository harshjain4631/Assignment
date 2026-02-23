// Recipe thumbnail card used in the recipe grid.
// Shows title, cuisine, difficulty, time, calories, and a favorite button.
"use client";

import Link from "next/link";
import { Clock, Flame, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/lib/types";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite?: boolean;
  onToggleFavorite?: (recipeId: string) => void;
  onSaveRecipe?: (recipe: Recipe) => void;
  onSelectRecipe?: (recipe: Recipe) => void;
}

// Color mapping for difficulty badges.
const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function RecipeCard({
  recipe,
  isFavorite = false,
  onToggleFavorite,
  onSaveRecipe,
  onSelectRecipe,
}: RecipeCardProps) {
  const showImage = Boolean(recipe.imageUrl);

  return (
    <Card
      className="group overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
      onClick={
        onSelectRecipe ? () => onSelectRecipe(recipe) : undefined
      }
    >
      {showImage && !onSelectRecipe && (
        <Link href={`/recipes/${recipe.id}`}>
          <div className="relative aspect-4/3 bg-muted flex items-center justify-center overflow-hidden">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        </Link>
      )}

      {showImage && onSelectRecipe && (
        <div className="relative aspect-4/3 bg-muted flex items-center justify-center overflow-hidden" />
      )}

      <CardContent className="p-4 space-y-3">
        {/* Title */}
        {onSelectRecipe ? (
          <button
            type="button"
            className="text-left w-full font-semibold text-lg leading-tight hover:text-primary transition-colors line-clamp-1"
          >
            {recipe.title}
          </button>
        ) : (
          <Link href={`/recipes/${recipe.id}`}>
            <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors line-clamp-1">
              {recipe.title}
            </h3>
          </Link>
        )}

        {/* Cuisine + Difficulty + Saved/unsaved indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {recipe.cuisine}
          </Badge>
          <Badge
            className={`text-xs border-0 ${difficultyColors[recipe.difficulty]}`}
          >
            {recipe.difficulty}
          </Badge>
          {recipe.isAIGenerated && recipe.id.startsWith("local-") && (
            <Badge variant="secondary" className="text-[10px] uppercase">
              Unsaved AI
            </Badge>
          )}
        </div>

        {/* Meta: time, calories */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {recipe.cookingTimeMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-3.5 w-3.5" />
            {recipe.nutrition.calories} cal
          </span>
        </div>

        <div className="flex justify-between items-center pt-1">
          {/* Save button for unsaved AI recipes */}
          {onSaveRecipe && recipe.isAIGenerated && recipe.id.startsWith("local-") && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSaveRecipe(recipe);
              }}
            >
              Save recipe
            </Button>
          )}

          {/* Favorite button */}
          {onToggleFavorite && (
            <div className="flex justify-end flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(recipe.id);
                }}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    isFavorite
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground"
                  }`}
                />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
