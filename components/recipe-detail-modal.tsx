"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/app/providers";
import { RecipeDetailContent } from "@/components/recipe-detail-content";
import type { Recipe } from "@/lib/types";
import { toast } from "sonner";

interface RecipeDetailModalProps {
  open: boolean;
  recipe: Recipe;
  onClose: () => void;
  onSaveRecipe?: (recipe: Recipe) => Promise<void> | void;
}

export function RecipeDetailModal({
  open,
  recipe,
  onClose,
  onSaveRecipe,
}: RecipeDetailModalProps) {
  const { user } = useAuth();
  const [servings, setServings] = useState(recipe.servings);
  const [userRating, setUserRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setServings(recipe.servings);
    setUserRating(0);
    setIsFavorite(false);
  }, [recipe]);

  async function handleRate(rating: number) {
    if (!user) {
      toast.error("Sign in to rate recipes.");
      return;
    }

    setUserRating(rating);

    try {
      await fetch(`/api/recipes/${recipe.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, rating }),
      });
      toast.success("Rating saved!");
    } catch {
      toast.error("Failed to save rating.");
    }
  }

  async function handleFavorite() {
    if (!user) {
      toast.error("Sign in to save favorites.");
      return;
    }

    const newState = !isFavorite;
    setIsFavorite(newState);

    try {
      await fetch(`/api/recipes/${recipe.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, isFavorite: newState }),
      });
    } catch {
      setIsFavorite(!newState);
      toast.error("Failed to update favorite.");
    }
  }

  async function handleSave() {
    if (!onSaveRecipe) return;
    try {
      await onSaveRecipe(recipe);
      onClose();
    } catch {
      // Errors should already be handled in onSaveRecipe.
    }
  }

  const showSaveButton =
    !!onSaveRecipe && recipe.isAIGenerated && recipe.id.startsWith("local-");

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle>{recipe.title}</DialogTitle>
        </DialogHeader>

        {showSaveButton && (
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Save recipe
            </button>
          </div>
        )}

        <RecipeDetailContent
          recipe={recipe}
          servings={servings}
          onServingsChange={setServings}
          userRating={userRating}
          isFavorite={isFavorite}
          onRate={handleRate}
          onFavorite={handleFavorite}
        />
      </DialogContent>
    </Dialog>
  );
}

