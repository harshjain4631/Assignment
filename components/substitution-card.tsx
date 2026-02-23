// Displays ingredient substitution suggestions for a recipe.

import { ArrowRight } from "lucide-react";
import type { Substitution } from "@/lib/types";

interface SubstitutionCardProps {
  substitutions: Substitution[];
}

export function SubstitutionCard({ substitutions }: SubstitutionCardProps) {
  if (!substitutions || substitutions.length === 0) return null;

  return (
    <div className="space-y-3">
      {substitutions.map((sub, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{sub.original}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-primary">{sub.replacement}</span>
          </div>
          {sub.note && (
            <p className="text-xs text-muted-foreground ml-auto">{sub.note}</p>
          )}
        </div>
      ))}
    </div>
  );
}
