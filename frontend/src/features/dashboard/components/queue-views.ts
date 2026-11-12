import { Inbox, ShieldAlert, Siren, VolumeX, type LucideIcon } from "lucide-react";

import type { QueueFilter, QueueStats } from "../lib/queue";

export type QueueView = {
  filter: QueueFilter;
  label: string;
  icon: LucideIcon;
  count: (stats: QueueStats) => number;
};

/** The saved views shown in the sidebar (desktop) and as chips (mobile). */
export const QUEUE_VIEWS: readonly QueueView[] = [
  { filter: "all", label: "All alerts", icon: Inbox, count: (stats) => stats.total },
  { filter: "escalate", label: "Escalate now", icon: Siren, count: (stats) => stats.escalate },
  { filter: "threats", label: "Genuine threats", icon: ShieldAlert, count: (stats) => stats.threats },
  { filter: "noise", label: "Noise", icon: VolumeX, count: (stats) => stats.noise },
];
