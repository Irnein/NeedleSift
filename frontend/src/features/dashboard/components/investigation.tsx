"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  ExternalLink,
  LoaderCircle,
  MousePointerClick,
  RotateCw,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
} from "lucide-react";

import { SeverityBadge } from "@/components/shared/severity-badge";
import { Button } from "@/components/ui/button";
import { describeError } from "@/lib/api/client";
import type { Alert, TriageResult } from "@/lib/api/schemas";
import { formatPercent, formatTimestamp, humanizeEventType } from "@/lib/format";
import { SEVERITY_META } from "@/lib/severity";
import { cn } from "@/lib/utils";

import type { QueueItem } from "../lib/queue";
import { Eyebrow } from "./panel";

/** Shown in the side panel before anything is selected. */
export function InvestigationPlaceholder({ triaging }: { triaging: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
      <span className="grid size-11 place-items-center rounded-xl border border-line bg-raised text-muted">
        {triaging ? (
          <LoaderCircle aria-hidden className="size-5 animate-spin" />
        ) : (
          <MousePointerClick aria-hidden className="size-5" />
        )}
      </span>
      <h2 className="mt-4 text-sm font-semibold text-fg">
        {triaging ? "Gemini is triaging the queue" : "Select an alert to investigate"}
      </h2>
      <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted">
        {triaging
          ? "The most urgent alert will open here as soon as verdicts are in."
          : "You'll see Gemini's assessment, the verdict, the mapped ATT&CK technique and suggested next steps."}
      </p>
    </div>
  );
}

/**
 * The full investigation view for one alert. Rendered inside the side panel
 * on wide screens and inside a bottom sheet everywhere else; `heading` lets
 * the host supply the right title element for its context.
 */
export function Investigation({
  item,
  onRetry,
  heading,
}: {
  item: QueueItem;
  onRetry: (alertId: string) => void;
  heading: (title: string) => ReactNode;
}) {
  const { alert } = item;
  const triage = item.status === "triaged" ? item.triage : null;
  const { date, time } = formatTimestamp(alert.timestamp);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-line px-5 pt-5 pb-4">
        <div className="flex flex-wrap items-center gap-2 pr-10">
          {triage ? (
            <SeverityBadge severity={triage.severity} />
          ) : (
            <span className="inline-flex h-6 items-center rounded-md border border-line bg-raised px-2 text-xs font-semibold text-muted">
              {item.status === "pending" ? "Triage in progress" : "Not triaged"}
            </span>
          )}
          <span className="font-mono text-xs text-subtle">{alert.id}</span>
          {item.origin === "simulated" ? (
            <span className="rounded border border-accent/40 px-1.5 py-px text-[10px] font-semibold tracking-wide text-accent uppercase">
              Simulated
            </span>
          ) : null}
        </div>
        <div className="mt-3">{heading(humanizeEventType(alert.event_type))}</div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{alert.description}</p>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 scroll-slim">
        {triage?.escalate ? <EscalationBanner host={alert.host} /> : null}

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
          <Fact label="Host" value={alert.host} />
          <Fact label="User" value={alert.user} />
          <Fact label="Source IP" value={alert.src_ip || "—"} />
          <Fact label="Detected" value={`${date} ${time}`.trim()} title={alert.timestamp} />
          <Fact label="Reported by" value={alert.source} mono={false} wide />
        </dl>

        {item.status === "triaged" ? (
          <Assessment triage={item.triage} />
        ) : item.status === "pending" ? (
          <PendingAssessment />
        ) : (
          <FailedAssessment error={item.error} onRetry={() => onRetry(alert.id)} />
        )}

        <RawAlert alert={alert} />
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  title,
  mono = true,
  wide = false,
}: {
  label: string;
  value: string;
  title?: string;
  mono?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={cn("bg-surface px-3.5 py-2.5", wide && "col-span-2")}>
      <dt className="text-[11px] font-medium text-subtle">{label}</dt>
      <dd
        title={title ?? value}
        className={cn("mt-0.5 truncate text-[13px] text-fg", mono && "font-mono text-xs leading-5")}
      >
        {value}
      </dd>
    </div>
  );
}

function EscalationBanner({ host }: { host: string }) {
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-xl border border-critical/40 bg-critical-soft px-4 py-3.5"
    >
      <Siren aria-hidden className="mt-0.5 size-5 shrink-0 text-critical" />
      <div>
        <p className="text-sm font-semibold text-critical">Escalate now</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-fg">
          Gemini flagged this for immediate analyst attention. Start with{" "}
          <span className="font-mono text-xs">{host}</span>.
        </p>
      </div>
    </div>
  );
}

function Assessment({ triage }: { triage: TriageResult }) {
  return (
    <>
      <section aria-labelledby="summary-title">
        <Eyebrow id="summary-title" className="flex items-center gap-1.5">
          <Sparkles aria-hidden className="size-3.5 text-accent" />
          Gemini summary
        </Eyebrow>
        <p className="mt-2 text-sm leading-relaxed text-fg">{triage.summary}</p>
      </section>

      <VerdictBlock triage={triage} />
      <MitreBlock technique={triage.mitre_technique} />

      <section aria-labelledby="actions-title">
        <Eyebrow id="actions-title">Recommended actions</Eyebrow>
        <p className="mt-1 text-xs text-subtle">
          Suggested next steps for the analyst — none of these have been carried out.
        </p>
        {triage.recommended_actions.length > 0 ? (
          <ol className="mt-2.5 space-y-2">
            {triage.recommended_actions.map((action, index) => (
              <li key={index} className="flex gap-3 rounded-xl border border-line bg-raised/60 p-3">
                <span
                  aria-hidden
                  className="grid size-5 shrink-0 place-items-center rounded-md bg-accent-soft font-mono text-[11px] font-semibold text-accent"
                >
                  {index + 1}
                </span>
                <span className="text-[13px] leading-relaxed text-fg">{action}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-[13px] text-muted">No follow-up was suggested for this alert.</p>
        )}
      </section>
    </>
  );
}

/**
 * Severity and verdict answer different questions, so they sit side by side
 * with their own labels: how bad would this be, and is it actually real?
 */
function VerdictBlock({ triage }: { triage: TriageResult }) {
  const genuine = triage.verdict === "true_positive";
  const severity = SEVERITY_META[triage.severity];
  const VerdictIcon = genuine ? ShieldAlert : ShieldCheck;
  const percent = formatPercent(triage.confidence);

  return (
    <section
      aria-label="Severity and verdict"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line"
    >
      <div className="bg-surface p-3.5">
        <p className="text-[11px] font-medium text-subtle">Severity · potential impact</p>
        <p className={cn("mt-1.5 flex items-center gap-1.5 text-sm font-semibold", severity.text)}>
          <severity.icon aria-hidden className="size-4" strokeWidth={2.25} />
          {severity.label}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{severity.meaning}</p>
      </div>
      <div className="bg-surface p-3.5">
        <p className="text-[11px] font-medium text-subtle">Verdict · is it real?</p>
        <p
          className={cn(
            "mt-1.5 flex items-center gap-1.5 text-sm font-semibold",
            genuine ? "text-fg" : "text-muted",
          )}
        >
          <VerdictIcon aria-hidden className={cn("size-4", genuine ? "text-critical" : "text-ok")} />
          {genuine ? "Genuine threat" : "False positive"}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div
            role="meter"
            aria-label="Confidence in verdict"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(triage.confidence * 100)}
            className="h-1.5 min-w-8 flex-1 overflow-hidden rounded-full bg-line"
          >
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: percent }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="font-mono text-xs text-muted tabular">{percent} confident</span>
        </div>
      </div>
    </section>
  );
}

const TECHNIQUE_PATTERN = /^(T\d{4}(?:\.\d{3})?)\s*[-–:]?\s*(.*)$/;

function MitreBlock({ technique }: { technique: string }) {
  const match = TECHNIQUE_PATTERN.exec(technique.trim());

  return (
    <section aria-labelledby="mitre-title">
      <Eyebrow id="mitre-title">MITRE ATT&amp;CK technique</Eyebrow>
      {match ? (
        <a
          href={`https://attack.mitre.org/techniques/${match[1].replace(".", "/")}/`}
          target="_blank"
          rel="noreferrer"
          className="group mt-2 flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-2.5 transition-colors hover:border-line-strong hover:bg-raised"
        >
          <span className="rounded-md bg-accent-soft px-2 py-1 font-mono text-xs font-semibold text-accent">
            {match[1]}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-fg">
            {match[2] || "View technique"}
          </span>
          <ExternalLink aria-hidden className="size-3.5 text-subtle group-hover:text-fg" />
          <span className="sr-only">(opens attack.mitre.org in a new tab)</span>
        </a>
      ) : (
        <p className="mt-2 text-[13px] text-muted">
          No attack technique mapped — consistent with benign activity.
        </p>
      )}
    </section>
  );
}

function PendingAssessment() {
  return (
    <div role="status" className="space-y-3">
      <Eyebrow className="flex items-center gap-1.5">
        <LoaderCircle aria-hidden className="size-3.5 animate-spin text-accent" />
        Gemini is analysing this alert
      </Eyebrow>
      <span className="skeleton block h-4 w-full" />
      <span className="skeleton block h-4 w-4/5" />
      <span className="skeleton block h-20 w-full" />
    </div>
  );
}

function FailedAssessment({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-high/30 bg-high-soft p-4">
      <p className="text-sm font-semibold text-fg">This alert hasn&apos;t been triaged</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">{describeError(error)}</p>
      <Button size="sm" onClick={onRetry} className="mt-3">
        <RotateCw aria-hidden className="size-3.5" />
        Retry triage
      </Button>
    </div>
  );
}

function RawAlert({ alert }: { alert: Alert }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <section className="rounded-xl border border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium text-fg transition-colors hover:bg-raised"
      >
        Raw alert
        <ChevronDown
          aria-hidden
          className={cn("size-4 text-subtle transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-line px-3.5 py-3">
              <div>
                <p className="text-[11px] font-medium text-subtle">Event type</p>
                <p className="mt-0.5 font-mono text-xs text-fg">{alert.event_type}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-subtle">Log line</p>
                {alert.raw_log ? (
                  <pre className="mt-1 max-h-56 overflow-auto rounded-lg bg-sunken p-3 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap text-muted scroll-slim">
                    {alert.raw_log}
                  </pre>
                ) : (
                  <p className="mt-0.5 text-[13px] text-muted">No log line was attached.</p>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
