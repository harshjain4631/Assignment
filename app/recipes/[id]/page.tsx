// Single recipe detail page: nutrition, ingredients, steps, substitutions, rating.
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeDetailSkeleton } from "@/components/loading-skeleton";
import { useAuth } from "@/app/providers";
import { RecipeDetailContent } from "@/components/recipe-detail-content";
import { toast } from "sonner";
import type { Recipe } from "@/lib/types";

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch recipe data on mount.
  useEffect(() => {
    async function load() {
      try {
        // If this is a local AI-generated recipe from the current session,
        // load it from sessionStorage instead of calling the API.
        if (id.startsWith("local-")) {
          const stored = sessionStorage.getItem("generatedRecipes");
          if (!stored) throw new Error("Not found");
          const list: Recipe[] = JSON.parse(stored);
          const found = list.find((r) => r.id === id) || null;
          if (!found) throw new Error("Not found");
          setRecipe(found);
          setServings(found.servings);
          return;
        }

        const res = await fetch(`/api/recipes/${id}`);
        if (!res.ok) throw new Error("Not found");

        const data = await res.json();
        setRecipe(data.recipe);
        setServings(data.recipe.servings);
      } catch {
        toast.error("Recipe not found.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Submit a rating to the API.
  async function handleRate(rating: number) {
    if (!user) {
      toast.error("Sign in to rate recipes.");
      return;
    }

    setUserRating(rating);

    try {
      await fetch(`/api/recipes/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, rating }),
      });
      toast.success("Rating saved!");
    } catch {
      toast.error("Failed to save rating.");
    }
  }

  // Toggle favorite.
  async function handleFavorite() {
    if (!user) {
      toast.error("Sign in to save favorites.");
      return;
    }

    const newState = !isFavorite;
    setIsFavorite(newState);

    try {
      await fetch(`/api/recipes/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, isFavorite: newState }),
      });
    } catch {
      setIsFavorite(!newState);
      toast.error("Failed to update favorite.");
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <RecipeDetailSkeleton />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-muted-foreground">Recipe not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <RecipeDetailContent
        recipe={recipe}
        servings={servings}
        onServingsChange={setServings}
        userRating={userRating}
        isFavorite={isFavorite}
        onRate={handleRate}
        onFavorite={handleFavorite}
      />
    </div>
  );
}
