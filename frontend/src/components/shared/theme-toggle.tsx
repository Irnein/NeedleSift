"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Both icons are always rendered and swapped with CSS, so the server and
 * client markup match regardless of the stored preference.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn("relative", className)}
      aria-label="Toggle light or dark theme"
      title="Toggle light or dark theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun
        aria-hidden
        className="size-4 scale-0 -rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0"
      />
      <Moon
        aria-hidden
        className="absolute size-4 scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:rotate-90"
      />
    </Button>
  );
}
