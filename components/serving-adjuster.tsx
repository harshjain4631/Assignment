// +/- control for adjusting recipe serving size.
"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServingAdjusterProps {
  servings: number;
  onChange: (newServings: number) => void;
}

export function ServingAdjuster({ servings, onChange }: ServingAdjusterProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">Servings:</span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(Math.max(1, servings - 1))}
          disabled={servings <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center font-semibold">{servings}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onChange(Math.min(20, servings + 1))}
          disabled={servings >= 20}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
