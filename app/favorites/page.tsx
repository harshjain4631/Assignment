// Favorites page: shows recipes the user has saved as favorites.
"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { RecipeGrid } from "@/components/recipe-grid";
import { RecipeGridSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { toast } from "sonner";
import type { Recipe } from "@/lib/types";
import Link from "next/link";

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load the user's favorite recipes.
  useEffect(() => {
    async function loadFavorites() {
      if (!user) {
        console.debug("[favorites] No user – skipping favorites load.");
        setLoading(false);
        return;
      }

      const db = getFirebaseDb();
      if (!db) {
        console.warn(
          "[favorites] Firestore DB is null – check NEXT_PUBLIC_FIREBASE_* env vars."
        );
        setLoading(false);
        return;
      }

      try {
        // Get all ratings where isFavorite = true.
        const ratingsRef = collection(db, "users", user.uid, "ratings");
        const favQuery = query(ratingsRef, where("isFavorite", "==", true));
        console.debug(
          "[favorites] Loading favorites for user:",
          user.uid
        );
        const snapshot = await getDocs(favQuery);
        console.debug(
          "[favorites] Favorites ratings docs count:",
          snapshot.size
        );

        const recipeIds = snapshot.docs.map(
          (doc) => doc.data().recipeId as string
        );
        setFavoriteIds(recipeIds);
        console.debug(
          "[favorites] Favorite recipe IDs:",
          recipeIds
        );

        if (recipeIds.length === 0) {
          setRecipes([]);
          setLoading(false);
          return;
        }

        // Fetch the actual recipe data for each favorite.
        const recipeFetches = recipeIds.map((id) =>
          fetch(`/api/recipes/${id}`).then((r) => r.json())
        );
        const results = await Promise.all(recipeFetches);
        const validRecipes = results
          .filter((r) => r.recipe)
          .map((r) => r.recipe);

        setRecipes(validRecipes);
      } catch {
        toast.error("Failed to load favorites.");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadFavorites();
    }
  }, [user, authLoading]);

  // Remove from favorites.
  async function toggleFavorite(recipeId: string) {
    if (!user) return;

    // Optimistic update: remove from list.
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    setFavoriteIds((prev) => prev.filter((id) => id !== recipeId));

    try {
      await fetch(`/api/recipes/${recipeId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, isFavorite: false }),
      });
    } catch {
      toast.error("Failed to update favorite.");
    }
  }

  // Not signed in.
  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold">Your Favorites</h1>
        <p className="text-muted-foreground">
          Sign in to save and view your favorite recipes.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Favorites</h1>
        <p className="text-muted-foreground">
          Your saved recipes, all in one place.
        </p>
      </div>

      {loading ? (
        <RecipeGridSkeleton count={3} />
      ) : recipes.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground">
            You haven&apos;t saved any favorites yet.
          </p>
          <Link href="/recipes">
            <Button variant="outline">Browse Recipes</Button>
          </Link>
        </div>
      ) : (
        <RecipeGrid
          recipes={recipes}
          favorites={favoriteIds}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}
