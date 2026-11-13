import type { Alert, Severity, TriageResult } from "@/lib/api/schemas";
import { SEVERITY_RANK } from "@/lib/severity";

/** One row of the queue: an alert plus wherever its triage currently stands. */
export type QueueItem = { alert: Alert; origin: "feed" | "simulated" } & (
  | { status: "pending" }
  | { status: "failed"; error: unknown }
  | { status: "triaged"; triage: TriageResult }
);

export type TriagedItem = Extract<QueueItem, { status: "triaged" }>;

export type QueueFilter = "all" | "escalate" | "threats" | "noise" | Exclude<Severity, "low">;

export type QueueStats = {
  total: number;
  triaged: number;
  pending: number;
  failed: number;
  bySeverity: Record<Severity, number>;
  threats: number;
  noise: number;
  escalate: number;
};

// Untriaged alerts have no severity yet, so they sit below the ranked ones:
// failures first (they need a retry), then alerts still being analysed.
const FAILED_RANK = 4;
const PENDING_RANK = 5;

function rankOf(item: QueueItem): number {
  if (item.status === "triaged") return SEVERITY_RANK[item.triage.severity];
  return item.status === "failed" ? FAILED_RANK : PENDING_RANK;
}

function timeOf(alert: Alert): number {
  const time = Date.parse(alert.timestamp);
  return Number.isNaN(time) ? 0 : time;
}

/** Critical → High → Medium → Low, newest first within each level. */
export function sortQueue(items: readonly QueueItem[]): QueueItem[] {
  return items
    .map((item) => ({ item, rank: rankOf(item), time: timeOf(item.alert) }))
    .sort((a, b) => a.rank - b.rank || b.time - a.time)
    .map(({ item }) => item);
}

export function computeStats(items: readonly QueueItem[]): QueueStats {
  const stats: QueueStats = {
    total: items.length,
    triaged: 0,
    pending: 0,
    failed: 0,
    bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    threats: 0,
    noise: 0,
    escalate: 0,
  };
  for (const item of items) {
    if (item.status === "pending") stats.pending += 1;
    else if (item.status === "failed") stats.failed += 1;
    else {
      stats.triaged += 1;
      stats.bySeverity[item.triage.severity] += 1;
      if (item.triage.verdict === "false_positive") stats.noise += 1;
      else stats.threats += 1;
      if (item.triage.escalate) stats.escalate += 1;
    }
  }
  return stats;
}

export function matchesFilter(item: QueueItem, filter: QueueFilter): boolean {
  if (filter === "all") return true;
  if (item.status !== "triaged") return false;
  const { triage } = item;
  switch (filter) {
    case "escalate":
      return triage.escalate;
    case "threats":
      return triage.verdict === "true_positive";
    case "noise":
      return triage.verdict === "false_positive";
    default:
      return triage.severity === filter;
  }
}

export const FILTER_LABELS: Record<QueueFilter, string> = {
  all: "All alerts",
  escalate: "Escalate now",
  threats: "Genuine threats",
  noise: "Noise",
  critical: "Critical",
  high: "High",
  medium: "Medium",
};
