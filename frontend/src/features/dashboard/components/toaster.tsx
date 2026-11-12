"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

/** Toasts styled from the design tokens, so they follow the active theme. */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="bottom-right"
      closeButton
      toastOptions={{
        style: {
          background: "var(--overlay)",
          color: "var(--fg)",
          border: "1px solid var(--line-strong)",
          boxShadow: "var(--shadow-pop)",
          fontFamily: "var(--font-sans)",
        },
      }}
    />
  );
}
