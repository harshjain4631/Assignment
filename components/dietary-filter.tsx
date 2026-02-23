// Checkbox group for selecting dietary preferences.
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { DIETARY_OPTIONS } from "@/lib/constants";

interface DietaryFilterProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function DietaryFilter({ selected, onChange }: DietaryFilterProps) {
  // Toggle a dietary tag on or off.
  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Dietary Preferences</p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {DIETARY_OPTIONS.map((tag) => (
          <label
            key={tag}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <Checkbox
              checked={selected.includes(tag)}
              onCheckedChange={() => toggle(tag)}
            />
            <span className="capitalize">{tag}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
