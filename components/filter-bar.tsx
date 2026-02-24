// Filter bar for recipes: difficulty, max time, dietary restrictions.
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { DIFFICULTIES, COOKING_TIME_OPTIONS } from "@/lib/constants";
import type { RecipeFilters } from "@/lib/types";

interface FilterBarProps {
  filters: RecipeFilters;
  onChange: (filters: RecipeFilters) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  // Update a single filter field.
  function updateFilter(key: keyof RecipeFilters, value: unknown) {
    onChange({ ...filters, [key]: value || undefined });
  }

  // Check if any filters are active.
  const hasFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== "" && (!Array.isArray(v) || v.length > 0)
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search input */}
      <Input
        placeholder="Search recipes..."
        value={filters.searchQuery || ""}
        onChange={(e) => updateFilter("searchQuery", e.target.value)}
        className="w-full sm:w-48"
      />

      {/* Difficulty filter */}
      <Select
        value={filters.difficulty || "all"}
        onValueChange={(v) =>
          updateFilter("difficulty", v === "all" ? undefined : v)
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          {DIFFICULTIES.map((d) => (
            <SelectItem key={d} value={d} className="capitalize">
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Cooking time filter */}
      <Select
        value={String(filters.maxCookingTime || "all")}
        onValueChange={(v) =>
          updateFilter("maxCookingTime", v === "all" ? undefined : Number(v))
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Cooking Time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any Time</SelectItem>
          {COOKING_TIME_OPTIONS.map(({ label, value }) => (
            <SelectItem key={value} value={String(value)}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear filters button */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({})}
          className="gap-1"
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}