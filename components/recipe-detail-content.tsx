"use client";

import { Clock, Users, ChefHat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NutritionBadge } from "@/components/nutrition-badge";
import { ServingAdjuster } from "@/components/serving-adjuster";
import { RatingStars } from "@/components/rating-stars";
import { SubstitutionCard } from "@/components/substitution-card";
import { scaleNutrition, scaleIngredients } from "@/lib/nutrition";
import type { Recipe } from "@/lib/types";

interface RecipeDetailContentProps {
  recipe: Recipe;
  servings: number;
  onServingsChange: (value: number) => void;
  userRating: number;
  isFavorite: boolean;
  onRate: (rating: number) => void;
  onFavorite: () => void;
}

export function RecipeDetailContent({
  recipe,
  servings,
  onServingsChange,
  userRating,
  isFavorite,
  onRate,
  onFavorite,
}: RecipeDetailContentProps) {
  const scaledNutrition = scaleNutrition(
    recipe.nutrition,
    recipe.servings,
    servings
  );
  const scaledIngredients = scaleIngredients(
    recipe.ingredients,
    recipe.servings,
    servings
  );

  return (
    <div className="space-y-8">
      {/* Title + actions */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          <p className="text-muted-foreground">{recipe.description}</p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{recipe.cuisine}</Badge>
            <Badge
              className={`border-0 ${
                recipe.difficulty === "easy"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : recipe.difficulty === "medium"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {recipe.difficulty}
            </Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {recipe.cookingTimeMinutes} min
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {recipe.servings} servings
            </span>
            {recipe.isAIGenerated && (
              <Badge variant="secondary" className="gap-1">
                <ChefHat className="h-3 w-3" />
                AI Generated
              </Badge>
            )}
          </div>

          {/* Dietary tags */}
          {recipe.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.dietaryTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Rating + favorite */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onFavorite}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <span
              className={`inline-block h-5 w-5 rounded-full ${
                isFavorite ? "bg-red-500" : "bg-transparent border border-muted"
              }`}
            />
          </button>
          <RatingStars rating={userRating} onRate={onRate} />
        </div>
      </div>

      {/* Recipe image */}
      {recipe.imageUrl && (
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full rounded-lg object-cover aspect-video"
        />
      )}

      {/* Serving adjuster */}
      <ServingAdjuster servings={servings} onChange={onServingsChange} />

      {/* Nutrition */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Nutrition (per serving)</h2>
        <NutritionBadge nutrition={scaledNutrition} />
      </section>

      <Separator />

      {/* Ingredients */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Ingredients</h2>
        <ul className="space-y-2">
          {scaledIngredients.map((ing, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>
                <strong>{ing.quantity}</strong> {ing.name}
                {ing.optional && (
                  <span className="text-muted-foreground ml-1">
                    (optional)
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      {/* Steps */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Instructions</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {i + 1}
              </span>
              <p className="pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Substitutions */}
      {recipe.substitutions && recipe.substitutions.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Substitutions</h2>
            <SubstitutionCard substitutions={recipe.substitutions} />
          </section>
        </>
      )}
    </div>
  );
}

