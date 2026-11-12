import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** The dashboard's base surface: a bordered, slightly elevated panel. */
export function Panel({ className, ...props }: ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-panel border border-line bg-surface shadow-panel", className)}
      {...props}
    />
  );
}

/** Small uppercase label used for section headings inside panels. */
export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-[11px] font-semibold tracking-[0.08em] text-subtle uppercase", className)}
      {...props}
    />
  );
}
