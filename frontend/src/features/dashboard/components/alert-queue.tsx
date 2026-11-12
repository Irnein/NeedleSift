"use client";

import { AnimatePresence, motion } from "motion/react";
import { CloudOff, Inbox, LoaderCircle, RotateCw, SearchX, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { describeError } from "@/lib/api/client";
import { pluralize } from "@/lib/format";
import { SEVERITY_META, SEVERITY_ORDER } from "@/lib/severity";
import { cn } from "@/lib/utils";

import { FILTER_LABELS, type QueueFilter, type QueueItem, type QueueStats } from "../lib/queue";
import { AlertRow, QUEUE_COLUMNS } from "./alert-row";
import { Panel } from "./panel";
import { QUEUE_VIEWS } from "./queue-views";

type AlertQueueProps = {
  items: readonly QueueItem[];
  stats: QueueStats;
  filter: QueueFilter;
  onFilterChange: (filter: QueueFilter) => void;
  selectedId: string | null;
  arrivedId: string | null;
  onSelect: (alertId: string) => void;
  onRetry: (alertId: string) => void;
  onRetryAllFailed: () => void;
  isLoading: boolean;
  loadError: unknown;
  onReload: () => void;
  isReloading: boolean;
  isSimulating: boolean;
  onSimulate: () => void;
  className?: string;
};

export function AlertQueue({
  items,
  stats,
  filter,
  onFilterChange,
  selectedId,
  arrivedId,
  onSelect,
  onRetry,
  onRetryAllFailed,
  isLoading,
  loadError,
  onReload,
  isReloading,
  isSimulating,
  onSimulate,
  className,
}: AlertQueueProps) {
  const hasAlerts = stats.total > 0;

  return (
    <Panel aria-labelledby="queue-title" className={cn("flex min-h-0 min-w-0 flex-col", className)}>
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 id="queue-title" className="text-sm font-semibold text-fg">
            Alert queue
          </h2>
          <p className="text-xs text-subtle">
            {hasAlerts
              ? filter === "all"
                ? `${pluralize(stats.total, "alert")} · most severe first, newest first within each level`
                : `${items.length} of ${stats.total} shown`
              : "Sorted by severity, then recency"}
          </p>
        </div>

        {filter !== "all" ? (
          <button
            type="button"
            onClick={() => onFilterChange("all")}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft pr-2 pl-2.5 text-xs font-medium text-accent transition-colors hover:border-accent/70"
          >
            {FILTER_LABELS[filter]}
            <X aria-hidden className="size-3.5" />
            <span className="sr-only">— clear filter</span>
          </button>
        ) : null}

        {stats.triaged > 0 ? <SeverityMix stats={stats} /> : null}
      </header>

      {/* Saved views live in the sidebar on desktop; below lg they sit here. */}
      <div className="flex gap-2 overflow-x-auto border-b border-line px-4 py-2.5 lg:hidden">
        {QUEUE_VIEWS.map((view) => {
          const active = filter === view.filter;
          return (
            <button
              key={view.filter}
              type="button"
              aria-pressed={active}
              onClick={() => onFilterChange(view.filter)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors",
                active
                  ? "border-accent/50 bg-accent-soft text-accent"
                  : "border-line text-muted hover:bg-raised",
              )}
            >
              {view.label}
              <span className="font-mono tabular opacity-80">{view.count(stats)}</span>
            </button>
          );
        })}
      </div>

      {stats.failed > 0 ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-high/25 bg-high-soft px-4 py-2.5"
        >
          <p className="min-w-0 flex-1 text-[13px] text-fg">
            <span className="font-semibold">
              {pluralize(stats.failed, "alert")} couldn&apos;t be triaged.
            </span>{" "}
            <span className="text-muted">Gemini may be busy — retrying usually works.</span>
          </p>
          <Button size="sm" onClick={onRetryAllFailed}>
            <RotateCw aria-hidden className="size-3.5" />
            Retry {stats.failed === 1 ? "it" : "all"}
          </Button>
        </div>
      ) : null}

      <div
        aria-hidden
        className={cn(
          "hidden items-center gap-x-4 border-b border-line bg-raised/50 py-2 pr-3 pl-4 text-[11px] font-semibold tracking-[0.07em] text-subtle uppercase md:grid",
          QUEUE_COLUMNS,
        )}
      >
        <span>Severity</span>
        <span>Event</span>
        <span>Host · User</span>
        <span>Time</span>
        <span>Status</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scroll-slim">
        {isLoading ? (
          <QueueSkeleton />
        ) : loadError ? (
          <EmptyState
            icon={<CloudOff aria-hidden className="size-5" />}
            title="The alert feed didn't load"
            body={describeError(loadError)}
            action={
              <Button onClick={onReload} disabled={isReloading}>
                <RotateCw aria-hidden className={cn("size-4", isReloading && "animate-spin")} />
                Try again
              </Button>
            }
          />
        ) : !hasAlerts && !isSimulating ? (
          <EmptyState
            icon={<Inbox aria-hidden className="size-5" />}
            title="The queue is clear"
            body="No alerts are waiting in the feed. Simulate one to watch NeedleSift triage it live."
            action={
              <Button variant="primary" onClick={onSimulate}>
                Simulate alert
              </Button>
            }
          />
        ) : items.length === 0 && !isSimulating ? (
          <EmptyState
            icon={<SearchX aria-hidden className="size-5" />}
            title={`Nothing under “${FILTER_LABELS[filter]}”`}
            body={
              stats.pending > 0
                ? "Triage is still running — matching alerts will appear here as verdicts arrive."
                : "No triaged alert matches this view right now."
            }
            action={<Button onClick={() => onFilterChange("all")}>Show all alerts</Button>}
          />
        ) : (
          <ul aria-label="Alerts, most severe first">
            <AnimatePresence initial={false}>
              {isSimulating ? <IncomingRow key="incoming" /> : null}
              {items.map((item) => (
                <AlertRow
                  key={item.alert.id}
                  item={item}
                  selected={item.alert.id === selectedId}
                  arrived={item.alert.id === arrivedId}
                  onSelect={onSelect}
                  onRetry={onRetry}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </Panel>
  );
}

/** Proportional strip of triaged severities — a glanceable shape of the queue. */
function SeverityMix({ stats }: { stats: QueueStats }) {
  const summary = SEVERITY_ORDER.map(
    (level) => `${stats.bySeverity[level]} ${SEVERITY_META[level].label.toLowerCase()}`,
  ).join(", ");
  return (
    <div
      role="img"
      aria-label={`Severity mix: ${summary}`}
      className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full sm:w-44"
    >
      {SEVERITY_ORDER.map((level) =>
        stats.bySeverity[level] > 0 ? (
          <motion.span
            key={level}
            layout
            className={cn("h-full rounded-full", SEVERITY_META[level].solid)}
            style={{ flexGrow: stats.bySeverity[level], flexBasis: 0 }}
          />
        ) : null,
      )}
    </div>
  );
}

/** Placeholder shown at the top of the queue while a simulated alert is in flight. */
function IncomingRow() {
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="overflow-hidden border-b border-line bg-accent-soft"
    >
      <div role="status" className="flex items-center gap-3 px-4 py-3.5">
        <LoaderCircle aria-hidden className="size-4 animate-spin text-accent" />
        <p className="text-sm font-medium text-fg">Incoming alert</p>
        <p className="text-xs text-muted">Gemini is analysing it now…</p>
      </div>
    </motion.li>
  );
}

function QueueSkeleton() {
  return (
    <div role="status" aria-label="Loading alerts">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="flex items-center gap-4 border-b border-line px-4 py-3.5">
          <span className="skeleton h-6 w-20" />
          <span className="flex-1 space-y-1.5">
            <span className="skeleton block h-3.5 w-2/5" />
            <span className="skeleton block h-3 w-1/4" />
          </span>
          <span className="skeleton hidden h-3.5 w-24 md:block" />
          <span className="skeleton hidden h-3.5 w-16 md:block" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-xl border border-line bg-raised text-muted">
        {icon}
      </span>
      <h3 className="mt-4 text-sm font-semibold text-fg">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">{body}</p>
      <div className="mt-5">{action}</div>
    </div>
  );
}
