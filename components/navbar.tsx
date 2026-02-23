// Top navigation bar with links to Home, Browse, Favorites, and auth.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Heart, Search, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/providers";

const navLinks = [
  { href: "/", label: "Home", icon: ChefHat },
  { href: "/recipes", label: "Browse", icon: Search },
  { href: "/favorites", label: "Favorites", icon: Heart },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, signInWithGoogle, signOutUser } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo / App name */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">Smart Recipe Generator</span>
          <span className="sm:hidden">Recipes</span>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2",
                  pathname === href && "pointer-events-none"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            </Link>
          ))}

          {/* Auth button */}
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={signOutUser}
              className="gap-2 ml-2"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
              <LogOut className="h-3 w-3 sm:hidden" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={signInWithGoogle}
              className="gap-2 ml-2"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
