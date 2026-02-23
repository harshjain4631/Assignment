// Text input with autocomplete and tag chips for managing ingredient list.
"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COMMON_INGREDIENTS } from "@/lib/constants";

interface IngredientInputProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
}

export function IngredientInput({
  ingredients,
  onChange,
}: IngredientInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on current input (excluding already-added items).
  const suggestions = inputValue.trim()
    ? COMMON_INGREDIENTS.filter(
        (ing) =>
          ing.toLowerCase().includes(inputValue.toLowerCase()) &&
          !ingredients.includes(ing)
      ).slice(0, 6)
    : [];

  // Add a new ingredient to the list.
  function addIngredient(name: string) {
    const trimmed = name.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      onChange([...ingredients, trimmed]);
    }
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  // Remove an ingredient by index.
  function removeIngredient(index: number) {
    onChange(ingredients.filter((_, i) => i !== index));
  }

  // Handle Enter key to add ingredient.
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addIngredient(inputValue);
    }
  }

  // Close suggestions when clicking outside.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="space-y-3">
      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Type an ingredient... (e.g. tomato)"
            className="w-full"
          />

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border bg-popover shadow-md">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addIngredient(s)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          type="button"
          onClick={() => addIngredient(inputValue)}
          disabled={!inputValue.trim()}
          size="icon"
          variant="secondary"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tag chips for added ingredients */}
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ing, i) => (
            <Badge
              key={ing}
              variant="secondary"
              className="gap-1 pl-3 pr-1 py-1 text-sm"
            >
              {ing}
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
