// Simple footer with app attribution.

import { ChefHat } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
        <ChefHat className="h-4 w-4" />
        <span>Smart Recipe Generator &mdash; Built with Next.js & Gemini AI</span>
      </div>
    </footer>
  );
}
