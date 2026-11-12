"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig } from "motion/react";

/**
 * App-wide client providers: theme (persisted in localStorage and applied by
 * an inline script before first paint, so there is no flash of the wrong
 * theme) and motion preferences (honours prefers-reduced-motion).
 */
/*
 * next-themes injects its no-flash script from inside a React component.
 * The server-rendered copy is what actually runs (before first paint); on the
 * client React 19 would only warn that it can't execute it, so there the tag
 * is marked as inert data instead.
 */
const themeScriptProps =
  typeof window === "undefined" ? undefined : ({ type: "application/json" } as const);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="needlesift-theme"
      scriptProps={themeScriptProps}
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  );
}
