// Interactive 1-5 star rating component.
"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}

export function RatingStars({
  rating,
  onRate,
  readonly = false,
  size = "md",
}: RatingStarsProps) {
  const [hovered, setHovered] = useState(0);

  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        // Determine if this star should be filled.
        const isFilled = readonly ? star <= rating : star <= (hovered || rating);

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onRate?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-colors ${
              readonly ? "cursor-default" : "cursor-pointer"
            }`}
          >
            <Star
              className={`${starSize} ${
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
