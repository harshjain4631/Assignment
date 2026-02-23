// Displays nutrition info (calories, protein, carbs, fat, fiber) in a row of badges.

import type { Nutrition } from "@/lib/types";

interface NutritionBadgeProps {
  nutrition: Nutrition;
}

export function NutritionBadge({ nutrition }: NutritionBadgeProps) {
  const items = [
    { label: "Calories", value: nutrition.calories, unit: "kcal" },
    { label: "Protein", value: nutrition.protein, unit: "g" },
    { label: "Carbs", value: nutrition.carbs, unit: "g" },
    { label: "Fat", value: nutrition.fat, unit: "g" },
    { label: "Fiber", value: nutrition.fiber, unit: "g" },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {items.map(({ label, value, unit }) => (
        <div key={label} className="text-center">
          <p className="text-lg font-bold">
            {value}
            <span className="text-xs font-normal text-muted-foreground ml-0.5">
              {unit}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}
