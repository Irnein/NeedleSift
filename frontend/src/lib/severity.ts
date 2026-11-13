import { CircleAlert, CircleMinus, OctagonAlert, TriangleAlert, type LucideIcon } from "lucide-react";

import type { Severity } from "@/lib/api/schemas";

/** Queue order: most urgent first. Mirrors SEVERITY_RANK in backend/models.py. */
export const SEVERITY_ORDER: readonly Severity[] = ["critical", "high", "medium", "low"];

export const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

type SeverityMeta = {
  label: string;
  /** What this level means to an analyst, in plain words. */
  meaning: string;
  /** Each level has its own icon shape so severity never relies on colour alone. */
  icon: LucideIcon;
  text: string;
  soft: string;
  solid: string;
  border: string;
};

// Class names are written out in full so Tailwind can see them.
export const SEVERITY_META: Record<Severity, SeverityMeta> = {
  critical: {
    label: "Critical",
    meaning: "Compromise likely, active impact",
    icon: OctagonAlert,
    text: "text-critical",
    soft: "bg-critical-soft",
    solid: "bg-critical",
    border: "border-critical/30",
  },
  high: {
    label: "High",
    meaning: "Needs action today",
    icon: TriangleAlert,
    text: "text-high",
    soft: "bg-high-soft",
    solid: "bg-high",
    border: "border-high/30",
  },
  medium: {
    label: "Medium",
    meaning: "Suspicious, worth checking",
    icon: CircleAlert,
    text: "text-medium",
    soft: "bg-medium-soft",
    solid: "bg-medium",
    border: "border-medium/30",
  },
  low: {
    label: "Low",
    meaning: "Very likely benign",
    icon: CircleMinus,
    text: "text-low",
    soft: "bg-low-soft",
    solid: "bg-low",
    border: "border-low/30",
  },
};
