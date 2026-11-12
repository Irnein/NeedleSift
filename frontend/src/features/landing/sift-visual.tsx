"use client";

import { motion } from "motion/react";
import { Siren, Sparkles, VolumeX } from "lucide-react";

import { SeverityBadge } from "@/components/shared/severity-badge";
import type { Severity } from "@/lib/api/schemas";

const INCOMING = [
  "failed_login",
  "ransomware_behavior",
  "port_scan",
  "pua_detected",
  "brute_force_success",
  "rare_domain_lookup",
  "suspicious_powershell",
  "admin_login_off_hours",
] as const;

const PRIORITIZED: ReadonlyArray<{ severity: Severity; event: string; host: string }> = [
  { severity: "critical", event: "Ransomware behavior", host: "SRV-SHARE-02" },
  { severity: "critical", event: "Brute force success", host: "SRV-FILE-01" },
  { severity: "high", event: "Suspicious PowerShell", host: "LAB-PC-07" },
];

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The hero illustration: an undifferentiated stream of alerts on the left,
 * Gemini in the middle, a short ranked queue on the right. Purely decorative
 * and static data — it never talks to the API.
 */
export function SiftVisual() {
  return (
    <div
      role="img"
      aria-label="Illustration: eight raw alerts pass through Gemini and come out as three prioritized threats, with five set aside as noise."
      className="relative rounded-2xl border border-line bg-surface p-4 shadow-pop sm:p-5"
    >
      <div aria-hidden className="grid grid-cols-[minmax(0,0.8fr)_36px_minmax(0,1.25fr)] items-stretch gap-2 sm:gap-3">
        <div>
          <p className="mb-2.5 font-mono text-[10px] tracking-[0.12em] text-subtle uppercase">
            Incoming · 8
          </p>
          <ul className="space-y-1.5">
            {INCOMING.map((event, index) => (
              <motion.li
                key={event}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + index * 0.05, ease }}
                className="truncate rounded-md border border-line bg-raised px-2 py-1.5 font-mono text-[10.5px] text-subtle"
              >
                {event}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* The needle: a single line of analysis drawn through the noise. */}
        <div className="relative flex flex-col items-center">
          <motion.span
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.7, delay: 0.5, ease }}
            className="absolute inset-y-0 w-px origin-top bg-gradient-to-b from-transparent via-accent to-transparent"
          />
          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.85, ease }}
            className="relative mt-[88px] grid size-9 place-items-center rounded-full border border-accent/50 bg-surface text-accent shadow-[0_0_0_6px_var(--glow)]"
          >
            <Sparkles className="size-4" />
          </motion.span>
        </div>

        <div>
          <p className="mb-2.5 font-mono text-[10px] tracking-[0.12em] text-subtle uppercase">
            Prioritized · 3
          </p>
          <ul className="space-y-2">
            {PRIORITIZED.map((row, index) => (
              <motion.li
                key={row.event}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 1 + index * 0.12, ease }}
                className="rounded-lg border border-line bg-raised p-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <SeverityBadge severity={row.severity} className="h-5 px-1.5 text-[10.5px]" />
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-critical">
                    <Siren className="size-3" />
                    Escalate
                  </span>
                </div>
                <p className="mt-1.5 truncate text-xs font-medium text-fg">{row.event}</p>
                <p className="truncate font-mono text-[10.5px] text-subtle">{row.host}</p>
              </motion.li>
            ))}
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="flex items-center gap-2 rounded-lg border border-dashed border-line-strong px-2.5 py-2 text-[11px] text-subtle"
            >
              <VolumeX className="size-3.5" />5 judged noise · set aside
            </motion.li>
          </ul>
        </div>
      </div>
      <p className="mt-4 border-t border-line pt-3 text-center font-mono text-[10px] tracking-[0.1em] text-subtle uppercase">
        Illustration · sample data
      </p>
    </div>
  );
}
