"use client";

import Link from "next/link";
import { CircleCheck, LoaderCircle, Radar, ScrollText, TriangleAlert } from "lucide-react";

import { LogoMark } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { QueueStats } from "../lib/queue";

export function DashboardHeader({
  stats,
  isLoading,
  hasLoadError,
  isSimulating,
  onSimulate,
  onOpenDigest,
}: {
  stats: QueueStats;
  isLoading: boolean;
  hasLoadError: boolean;
  isSimulating: boolean;
  onSimulate: () => void;
  onOpenDigest: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur-md sm:px-6">
      <Link href="/" aria-label="NeedleSift home" className="rounded-md lg:hidden">
        <LogoMark />
      </Link>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[15px] font-semibold tracking-tight text-fg sm:text-base">
          <span className="sm:hidden">Operations</span>
          <span className="hidden sm:inline">Security operations</span>
        </h1>
        <p className="hidden truncate text-xs text-subtle sm:block">
          AI-triaged alert queue for the university NOC
        </p>
      </div>

      <TriageStatus stats={stats} isLoading={isLoading} hasLoadError={hasLoadError} />

      <ThemeToggle />

      <Tooltip content="Ask Gemini for a briefing on everything triaged so far">
        <Button onClick={onOpenDigest} aria-label="Daily NOC digest" className="px-2.5 sm:px-3.5">
          <ScrollText aria-hidden className="size-4" />
          <span className="hidden md:inline">Daily digest</span>
        </Button>
      </Tooltip>

      <Tooltip content="Send a fresh alert through live Gemini triage">
        <Button
          variant="primary"
          onClick={onSimulate}
          disabled={isSimulating}
          aria-busy={isSimulating}
          className="min-w-0 px-3 sm:min-w-[158px] sm:px-3.5"
        >
          {isSimulating ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <Radar aria-hidden className="size-4" />
          )}
          <span className="hidden sm:inline">{isSimulating ? "Triaging alert…" : "Simulate alert"}</span>
          <span className="sm:hidden">{isSimulating ? "Triaging…" : "Simulate"}</span>
        </Button>
      </Tooltip>
    </header>
  );
}

/** Always-visible answer to "what is the system doing right now?" */
function TriageStatus({
  stats,
  isLoading,
  hasLoadError,
}: {
  stats: QueueStats;
  isLoading: boolean;
  hasLoadError: boolean;
}) {
  let tone = "text-muted";
  let icon = <LoaderCircle aria-hidden className="size-3.5 animate-spin" />;
  let label = "Loading alerts…";

  if (hasLoadError) {
    tone = "text-critical";
    icon = <TriangleAlert aria-hidden className="size-3.5" />;
    label = "Feed unavailable";
  } else if (!isLoading && stats.pending > 0) {
    label = `Triaging ${stats.triaged + stats.failed}/${stats.total}`;
  } else if (!isLoading && stats.failed > 0) {
    tone = "text-high";
    icon = <TriangleAlert aria-hidden className="size-3.5" />;
    label = `${stats.failed} not triaged`;
  } else if (!isLoading) {
    tone = "text-ok";
    icon = <CircleCheck aria-hidden className="size-3.5" />;
    label = `${pluralize(stats.triaged, "alert")} triaged`;
  }

  return (
    <p
      role="status"
      className={cn(
        "hidden h-8 items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs font-medium tabular min-[560px]:flex",
        tone,
      )}
    >
      {icon}
      <span className="text-muted">{label}</span>
    </p>
  );
}
