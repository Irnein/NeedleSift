"use client";

import { motion } from "motion/react";
import { Siren, VolumeX, type LucideIcon } from "lucide-react";

import { SEVERITY_META } from "@/lib/severity";
import { cn } from "@/lib/utils";

import type { QueueFilter, QueueStats } from "../lib/queue";

type Stat = {
  filter: Exclude<QueueFilter, "all" | "threats">;
  label: string;
  hint: string;
  icon: LucideIcon;
  value: number;
  text: string;
  soft: string;
};

function buildStats(stats: QueueStats): Stat[] {
  const severity = (level: "critical" | "high" | "medium"): Stat => ({
    filter: level,
    label: SEVERITY_META[level].label,
    hint: SEVERITY_META[level].meaning,
    icon: SEVERITY_META[level].icon,
    value: stats.bySeverity[level],
    text: SEVERITY_META[level].text,
    soft: SEVERITY_META[level].soft,
  });
  return [
    severity("critical"),
    severity("high"),
    severity("medium"),
    {
      filter: "noise",
      label: "Noise",
      hint: "Judged false positives",
      icon: VolumeX,
      value: stats.noise,
      text: "text-low",
      soft: "bg-low-soft",
    },
    {
      filter: "escalate",
      label: "Escalate now",
      hint: "Need an analyst immediately",
      icon: Siren,
      value: stats.escalate,
      text: "text-critical",
      soft: "bg-critical-soft",
    },
  ];
}

/**
 * The ten-second read. Every number is derived from live triage results, and
 * each card doubles as a filter for the queue below.
 */
export function StatsRow({
  stats,
  isLoading,
  filter,
  onFilterChange,
}: {
  stats: QueueStats;
  isLoading: boolean;
  filter: QueueFilter;
  onFilterChange: (filter: QueueFilter) => void;
}) {
  // No verdicts yet: shimmer while triage is underway, a dash if it all failed.
  const awaitingFirstResult = stats.triaged === 0 && (isLoading || stats.pending > 0);
  const noResults = stats.triaged === 0 && stats.failed > 0;

  return (
    <ul aria-label="Queue summary" className="grid grid-cols-3 gap-2 sm:gap-3 xl:grid-cols-5">
      {buildStats(stats).map((stat) => {
        const active = filter === stat.filter;
        const isEscalate = stat.filter === "escalate";
        const alarming = isEscalate && stat.value > 0;
        const Icon = stat.icon;
        return (
          <li key={stat.filter} className={cn(isEscalate && "col-span-2 xl:col-span-1")}>
            <button
              type="button"
              aria-pressed={active}
              aria-label={`${stat.label}: ${awaitingFirstResult || noResults ? "no triage results yet" : stat.value}. ${stat.hint}. ${active ? "Showing only these alerts." : "Filter the queue."}`}
              onClick={() => onFilterChange(active ? "all" : stat.filter)}
              className={cn(
                "group relative flex h-full w-full flex-col overflow-hidden rounded-panel border bg-surface p-3 text-left sm:p-4 shadow-panel transition-colors hover:border-line-strong",
                active ? "border-accent/60 bg-raised" : "border-line",
                alarming && !active && "border-critical/35",
              )}
            >
              {alarming ? (
                <span aria-hidden className="absolute inset-0 bg-critical-soft opacity-60" />
              ) : null}
              <span className="relative flex items-center justify-between gap-2">
                <span className="truncate text-xs font-medium text-muted sm:text-[13px]">{stat.label}</span>
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-lg sm:size-7",
                    stat.soft,
                    stat.text,
                  )}
                >
                  <Icon aria-hidden className="size-4" strokeWidth={2.25} />
                </span>
              </span>
              <span
                className={cn(
                  "relative mt-1 block h-9 text-[28px] leading-9 font-semibold tracking-tight tabular sm:mt-2 sm:h-10 sm:text-[34px] sm:leading-10",
                  stat.value > 0 ? stat.text : "text-fg",
                )}
              >
                {awaitingFirstResult ? (
                  <span className="skeleton mt-1.5 block h-7 w-10" />
                ) : noResults ? (
                  <span className="text-subtle">—</span>
                ) : (
                  <motion.span
                    key={stat.value}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="inline-block"
                  >
                    {stat.value}
                  </motion.span>
                )}
              </span>
              <span className="relative mt-1 hidden text-xs text-subtle sm:block">{stat.hint}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
