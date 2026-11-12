import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

const DASHBOARD_HREF = "/dashboard/";

/**
 * Every "Open Dashboard" call to action renders this. It is a plain anchor on
 * purpose: the landing page and the dashboard are separate experiences with
 * separate bundles, and a document navigation works on any static file host
 * without depending on client-side route prefetching.
 */
export function DashboardLink(props: Omit<ComponentProps<"a">, "href">) {
  return <a href={DASHBOARD_HREF} {...props} />;
}

/** In-page section links, shared by the header and footer. */
export const NAV_LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#about", label: "About" },
] as const;

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>;
}

/** Shared heading block so every landing section opens the same way. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className="font-mono text-xs font-medium tracking-[0.14em] text-accent uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl leading-[1.15] font-semibold tracking-tight text-balance text-fg sm:text-4xl">
        {title}
      </h2>
      {lead ? (
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted sm:text-lg">{lead}</p>
      ) : null}
    </div>
  );
}
