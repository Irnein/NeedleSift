"use client";

import { memo, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { CircleCheck, LoaderCircle, RotateCw, Siren, TriangleAlert, VolumeX } from "lucide-react";

import { SeverityBadge } from "@/components/shared/severity-badge";
import { formatTimestamp, humanizeEventType } from "@/lib/format";
import { SEVERITY_META } from "@/lib/severity";
import { cn } from "@/lib/utils";

import type { QueueItem } from "../lib/queue";

/** Column template shared by the header row and every alert row (md and up). */
export const QUEUE_COLUMNS =
  "md:grid-cols-[96px_minmax(0,1.5fr)_minmax(0,1fr)_60px_104px]";

/**
 * A failed row moves its last cell out of the select button so the Retry
 * control can live there (buttons can't nest). Same tracks, minus the last.
 */
const FAILED_ROW_COLUMNS = "md:grid-cols-[96px_minmax(0,1.5fr)_minmax(0,1fr)_60px]";

const chipClass =
  "inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-xs font-semibold whitespace-nowrap";

function StatusChip({ item }: { item: Exclude<QueueItem, { status: "failed" }> }) {
  if (item.status === "pending") {
    return <span className="text-xs text-subtle">Awaiting verdict</span>;
  }
  if (item.triage.escalate) {
    return (
      <span className={cn(chipClass, "border-critical/40 bg-critical-soft text-critical")}>
        <Siren aria-hidden className="size-3.5" />
        Escalate
      </span>
    );
  }
  if (item.triage.verdict === "false_positive") {
    return (
      <span className={cn(chipClass, "border-line bg-raised text-subtle")}>
        <VolumeX aria-hidden className="size-3.5" />
        Noise
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
      <CircleCheck aria-hidden className="size-3.5 text-subtle" />
      Triaged
    </span>
  );
}

function AlertRowComponent({
  item,
  selected,
  arrived,
  onSelect,
  onRetry,
}: {
  item: QueueItem;
  selected: boolean;
  /** True for a few seconds after a simulated alert lands. */
  arrived: boolean;
  onSelect: (alertId: string) => void;
  onRetry: (alertId: string) => void;
}) {
  const { alert } = item;
  const rowRef = useRef<HTMLLIElement>(null);
  const triage = item.status === "triaged" ? item.triage : null;
  const isNoise = triage?.verdict === "false_positive";
  const { date, time } = formatTimestamp(alert.timestamp);
  const eventName = humanizeEventType(alert.event_type);

  useEffect(() => {
    if (arrived) rowRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [arrived]);

  return (
    <motion.li
      ref={rowRef}
      layout="position"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ layout: { type: "spring", stiffness: 420, damping: 38 }, duration: 0.25 }}
      className={cn(
        "relative flex items-stretch border-b border-line last:border-b-0",
        arrived && "animate-arrive",
      )}
    >
      {/* Severity rail: a second, non-textual cue down the left edge. */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-[3px]",
          triage && !isNoise ? SEVERITY_META[triage.severity].solid : "bg-transparent",
        )}
      />

      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(alert.id)}
        className={cn(
          "grid min-w-0 flex-1 grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 py-3 pl-4 text-left transition-colors md:gap-x-4",
          item.status === "failed" ? ["pr-0", FAILED_ROW_COLUMNS] : ["pr-3", QUEUE_COLUMNS],
          "hover:bg-raised focus-visible:-outline-offset-2",
          selected && "bg-raised shadow-[inset_0_0_0_1px_var(--line-strong)]",
        )}
      >
        <span className="col-start-1 row-start-1">
          {triage ? (
            <SeverityBadge severity={triage.severity} muted={isNoise} />
          ) : item.status === "pending" ? (
            <span className={cn(chipClass, "border-line bg-raised text-muted")}>
              <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
              Triaging
            </span>
          ) : (
            <span className={cn(chipClass, "border-high/30 bg-high-soft text-high")}>
              <TriangleAlert aria-hidden className="size-3.5" />
              Failed
            </span>
          )}
        </span>

        {item.status === "failed" ? null : (
          <span className="col-start-2 row-start-1 justify-self-end md:col-start-5 md:justify-self-start">
            <StatusChip item={item} />
          </span>
        )}

        <span className="col-span-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1">
          <span
            className={cn(
              "block truncate text-sm font-medium",
              isNoise ? "text-muted" : "text-fg",
            )}
          >
            {eventName}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-subtle">
            {item.origin === "simulated" ? (
              <span className="shrink-0 rounded border border-accent/40 px-1 text-[10px] leading-4 font-semibold tracking-wide text-accent uppercase">
                Simulated
              </span>
            ) : null}
            <span className="truncate">{alert.source}</span>
          </span>
        </span>

        <span
          className={cn(
            "col-span-2 flex min-w-0 flex-wrap items-center gap-x-3 font-mono text-xs md:contents",
            isNoise ? "text-subtle" : "text-muted",
          )}
        >
          <span className="flex min-w-0 gap-x-3 md:col-start-3 md:row-start-1 md:block">
            <span className="block truncate" title={`Host ${alert.host}`}>
              {alert.host}
            </span>
            <span className="block truncate text-subtle" title={`User ${alert.user}`}>
              {alert.user}
            </span>
          </span>
          <time
            dateTime={alert.timestamp}
            title={alert.timestamp}
            className="flex gap-x-1.5 tabular md:col-start-4 md:row-start-1 md:block"
          >
            <span className="block">{time}</span>
            <span className="block text-subtle">{date}</span>
          </time>
        </span>
      </button>

      {item.status === "failed" ? (
        <button
          type="button"
          onClick={() => onRetry(alert.id)}
          aria-label={`Retry triage for ${eventName} on ${alert.host}`}
          className="mr-3 ml-3 flex shrink-0 items-center self-center md:ml-4 md:w-[104px]"
        >
          <span className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-fg transition-colors hover:border-line-strong hover:bg-raised">
            <RotateCw aria-hidden className="size-3.5" />
            Retry
          </span>
        </button>
      ) : null}
    </motion.li>
  );
}

export const AlertRow = memo(AlertRowComponent);
