// Home page: ingredient input (text + image), dietary preferences, generate button.
// This is the main entry point where users start finding recipes.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IngredientInput } from "@/components/ingredient-input";
import { ImageUpload } from "@/components/image-upload";
import { DietaryFilter } from "@/components/dietary-filter";
import { toast } from "sonner";

export default function HomePage() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // When image recognition detects ingredients, merge them with existing ones.
  function handleImageIngredients(detected: string[]) {
    const merged = [...new Set([...ingredients, ...detected])];
    setIngredients(merged);
    toast.success(`Detected ${detected.length} ingredients from photo!`);
  }

  // Generate recipes by calling the AI API, then navigate to results.
  async function handleGenerate() {
    if (ingredients.length === 0) {
      toast.error("Please add at least one ingredient.");
      return;
    }

    setIsGenerating(true);

    try {
      // Store the generation request in sessionStorage for the results page.
      sessionStorage.setItem(
        "recipeRequest",
        JSON.stringify({ ingredients, dietary })
      );
      // Navigate to the recipes page which will trigger generation.
      router.push("/recipes?source=generate");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsGenerating(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      {/* Hero heading */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          AI-Powered Recipe Discovery
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Smart Recipe Generator
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Tell us what ingredients you have, and we&apos;ll find the perfect recipes
          for you.
        </p>
      </div>

      <div className="space-y-8">
        {/* Text ingredient input */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Enter your ingredients
          </h2>
          <IngredientInput
            ingredients={ingredients}
            onChange={setIngredients}
          />
        </section>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-sm text-muted-foreground font-medium">OR</span>
          <Separator className="flex-1" />
        </div>

        {/* Image upload */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Upload a photo
          </h2>
          <ImageUpload onIngredientsDetected={handleImageIngredients} />
        </section>

        {/* Dietary preferences */}
        <section>
          <DietaryFilter selected={dietary} onChange={setDietary} />
        </section>

        {/* Generate button */}
        <Button
          size="lg"
          className="w-full text-lg gap-2"
          onClick={handleGenerate}
          disabled={ingredients.length === 0 || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating Recipes...
            </>
          ) : (
            <>
              <ChefHat className="h-5 w-5" />
              Generate Recipes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
