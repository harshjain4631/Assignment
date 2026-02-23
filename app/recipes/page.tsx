// Recipe listing page: shows AI-generated results or browse/search from Firestore.
"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RecipeGrid } from "@/components/recipe-grid";
import { FilterBar } from "@/components/filter-bar";
import { RecipeGridSkeleton } from "@/components/loading-skeleton";
import { useAuth } from "@/app/providers";
import { RecipeDetailModal } from "@/components/recipe-detail-modal";
import { toast } from "sonner";
import type { Recipe, RecipeFilters } from "@/lib/types";

function RecipesContent() {
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const { user } = useAuth();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [loading, setLoading] = useState(true);
  const [generatingText, setGeneratingText] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // Fetch recipes from Firestore based on filters.
  const fetchRecipes = useCallback(async (currentFilters: RecipeFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.difficulty)
        params.set("difficulty", currentFilters.difficulty);
      if (currentFilters.maxCookingTime)
        params.set("maxCookingTime", String(currentFilters.maxCookingTime));
      if (currentFilters.cuisine) params.set("cuisine", currentFilters.cuisine);
      if (currentFilters.dietaryTags?.length)
        params.set("dietary", currentFilters.dietaryTags.join(","));
      if (currentFilters.searchQuery)
        params.set("q", currentFilters.searchQuery);

      const res = await fetch(`/api/recipes/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch {
      toast.error("Failed to load recipes.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate recipes from AI when coming from the home page.
  const generateRecipes = useCallback(async () => {
    const stored = sessionStorage.getItem("recipeRequest");
    if (!stored) {
      fetchRecipes(filters);
      return;
    }

    sessionStorage.removeItem("recipeRequest");
    setLoading(true);
    setGeneratingText("AI is cooking up recipes for you...");

    try {
      const { ingredients, dietary } = JSON.parse(stored);
      const res = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, dietary }),
      });

      if (!res.ok) throw new Error("Generation failed");

      // Read the streaming response.
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }
      }

      // Parse the streamed object. The AI SDK streams JSON text.
      try {
        const parsed = JSON.parse(fullText);
        if (parsed.recipes) {
          // Add temporary local IDs for display only. These are not Firestore IDs.
          const timestamp = Date.now();
          const withIds: Recipe[] = parsed.recipes.map(
            (r: Omit<Recipe, "id">, i: number) => ({
              // The generated data already matches the Recipe shape minus id.
              ...(r as unknown as Omit<Recipe, "id">),
              id: `local-${timestamp}-${i}`,
              isAIGenerated: true,
              imageUrl: "",
            })
          );

          setRecipes(withIds);
          // Persist generated recipes for this session so the detail page
          // can render unsaved recipes by local ID.
          try {
            sessionStorage.setItem(
              "generatedRecipes",
              JSON.stringify(withIds)
            );
          } catch {
            // Ignore storage errors; UI will still work for this page load.
          }
        }
      } catch {
        // Streaming might return partial JSON — try to extract recipes.
        toast.error("Could not parse AI response. Showing saved recipes.");
        fetchRecipes(filters);
      }
    } catch {
      toast.error("Recipe generation failed. Showing saved recipes.");
      fetchRecipes(filters);
    } finally {
      setLoading(false);
      setGeneratingText("");
    }
  }, [fetchRecipes, filters]);

  // On mount: generate, restore from session, or fetch from Firestore.
  // Clear generated recipes on hard refresh so they don't persist across reloads.
  useEffect(() => {
    const navEntry = typeof window !== "undefined" && performance.getEntriesByType?.("navigation")?.[0];
    const isReload =
      navEntry && (navEntry as PerformanceNavigationTiming).type === "reload";
    if (isReload) {
      sessionStorage.removeItem("generatedRecipes");
    }

    if (source === "generate") {
      generateRecipes();
      return;
    }

    // Restore AI-generated list when returning from detail (e.g. back button).
    const stored = sessionStorage.getItem("generatedRecipes");
    if (stored) {
      try {
        const list = JSON.parse(stored) as Recipe[];
        if (Array.isArray(list) && list.length > 0) {
          setRecipes(list);
          setLoading(false);
          return;
        }
      } catch {
        // Invalid JSON, fall through to fetch.
      }
    }

    fetchRecipes(filters);
    // Only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when filters change (but not on initial generate).
  function handleFilterChange(newFilters: RecipeFilters) {
    setFilters(newFilters);
    fetchRecipes(newFilters);
  }

  // Save a generated recipe for the current user.
  async function handleSaveRecipe(recipe: Recipe) {
    if (!user) {
      toast.error("Sign in to save recipes.");
      return;
    }

    try {
      const { id: _localId, ...rest } = recipe;
      const res = await fetch("/api/user/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          recipe: rest,
        }),
      });

      if (!res.ok) {
        throw new Error("Save failed");
      }

      const data = await res.json();
      const saved: Recipe = {
        ...(data.recipe as Recipe),
        isAIGenerated: true,
      };

      // Replace the local recipe with the saved Firestore-backed one.
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipe.id ? saved : r))
      );

      // Also update the session cache so detail view works after navigation.
      try {
        const current = sessionStorage.getItem("generatedRecipes");
        if (current) {
          const list: Recipe[] = JSON.parse(current);
          const updated = list.map((r) =>
            r.id === recipe.id ? saved : r
          );
          sessionStorage.setItem(
            "generatedRecipes",
            JSON.stringify(updated)
          );
        }
      } catch {
        // Ignore storage errors.
      }

      // Optionally mark as favorite immediately.
      try {
        await fetch(`/api/recipes/${saved.id}/rate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.uid,
            isFavorite: true,
          }),
        });
        setFavorites((prev) => [...prev, saved.id]);
      } catch {
        // Ignore favorite failures here; user can toggle manually.
      }

      toast.success("Recipe saved!");
    } catch {
      toast.error("Failed to save recipe.");
    }
  }

  // Toggle favorite status for a recipe.
  async function toggleFavorite(recipeId: string) {
    if (!user) {
      toast.error("Sign in to save favorites.");
      return;
    }

    const isFav = favorites.includes(recipeId);
    const newFavorites = isFav
      ? favorites.filter((id) => id !== recipeId)
      : [...favorites, recipeId];
    setFavorites(newFavorites);

    try {
      await fetch(`/api/recipes/${recipeId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          isFavorite: !isFav,
        }),
      });
    } catch {
      // Revert on error.
      setFavorites(favorites);
      toast.error("Failed to update favorite.");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Recipes</h1>
        <p className="text-muted-foreground">
          {source === "generate"
            ? "AI-generated recipes based on your ingredients"
            : "Browse and discover delicious recipes"}
        </p>
      </div>

      {/* Filter bar */}
      <FilterBar filters={filters} onChange={handleFilterChange} />

      {/* Generating status */}
      {generatingText && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground animate-pulse">
            {generatingText}
          </p>
        </div>
      )}

      {/* Recipe grid */}
      {loading ? (
        <RecipeGridSkeleton />
      ) : (
        <RecipeGrid
          recipes={recipes}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSaveRecipe={handleSaveRecipe}
          onSelectRecipe={(recipe) => setSelectedRecipe(recipe)}
        />
      )}

      {selectedRecipe && (
        <RecipeDetailModal
          open={!!selectedRecipe}
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onSaveRecipe={async (recipe) => {
            await handleSaveRecipe(recipe);
          }}
        />
      )}
    </div>
  );
}

// Wrap in Suspense because useSearchParams() needs it in Next.js 16.
export default function RecipesPage() {
  return (
    <Suspense fallback={<RecipeGridSkeleton />}>
      <RecipesContent />
    </Suspense>
  );
}