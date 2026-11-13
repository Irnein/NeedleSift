import { Inbox, Radar, ScrollText, ShieldAlert, Siren, Sparkles, VolumeX } from "lucide-react";

import { LogoMark } from "@/components/shared/logo";
import { SeverityBadge } from "@/components/shared/severity-badge";
import type { Severity } from "@/lib/api/schemas";
import { SEVERITY_META } from "@/lib/severity";
import { cn } from "@/lib/utils";

import { Reveal } from "./reveal";
import { Container, SectionHeading } from "./section";

/* Everything below is static sample data for illustration. Nothing is fetched. */

const STATS: ReadonlyArray<{ label: string; value: number; tone: string }> = [
  { label: "Critical", value: 3, tone: "text-critical" },
  { label: "High", value: 4, tone: "text-high" },
  { label: "Medium", value: 4, tone: "text-medium" },
  { label: "Noise", value: 7, tone: "text-low" },
  { label: "Escalate now", value: 7, tone: "text-critical" },
];

type Row = { severity: Severity; event: string; host: string; user: string; state: "escalate" | "triaged" | "noise" };

const ROWS: readonly Row[] = [
  { severity: "critical", event: "Ransomware behavior", host: "SRV-SHARE-02", user: "svc_backup", state: "escalate" },
  { severity: "critical", event: "Brute force success", host: "SRV-FILE-01", user: "admin", state: "escalate" },
  { severity: "high", event: "Suspicious PowerShell", host: "LAB-PC-07", user: "student042", state: "escalate" },
  { severity: "medium", event: "Port scan", host: "LAB-PC-22", user: "student099", state: "triaged" },
  { severity: "low", event: "Failed login", host: "LAB-PC-04", user: "student030", state: "noise" },
  { severity: "low", event: "Port scan", host: "SCAN-01", user: "svc_nessus", state: "noise" },
];

const VIEWS = [
  { label: "All alerts", icon: Inbox, count: 18, active: true },
  { label: "Escalate now", icon: Siren, count: 7, active: false },
  { label: "Genuine threats", icon: ShieldAlert, count: 11, active: false },
  { label: "Noise", icon: VolumeX, count: 7, active: false },
] as const;

export function ProductPreview() {
  return (
    <section id="overview" className="scroll-mt-20 border-t border-line bg-sunken py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Overview"
            title="One screen that tells you where to look first"
            lead="The dashboard ranks every alert by severity, flags what needs a human now, and keeps the evidence one click away."
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <figure>
            <div
              role="img"
              aria-label="Preview of the NeedleSift dashboard: five summary counters, a severity-ranked alert queue, and an investigation panel showing Gemini's assessment of the selected alert."
              className="overflow-hidden rounded-2xl border border-line-strong bg-canvas shadow-pop"
            >
              <div aria-hidden>
                <div className="flex h-10 items-center gap-3 border-b border-line bg-surface px-4">
                  <span className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-line-strong" />
                    <span className="size-2.5 rounded-full bg-line-strong" />
                    <span className="size-2.5 rounded-full bg-line-strong" />
                  </span>
                  <span className="mx-auto rounded-md bg-raised px-3 py-1 font-mono text-[10.5px] text-subtle">
                    needlesift / dashboard
                  </span>
                  <span className="w-10" />
                </div>

                <div className="flex">
                  <PreviewSidebar />
                  <div className="min-w-0 flex-1">
                    <div className="flex h-12 items-center gap-3 border-b border-line px-4">
                      <p className="flex-1 truncate text-[13px] font-semibold text-fg">
                        Security operations
                      </p>
                      <span className="hidden h-7 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-[11px] font-medium text-fg sm:inline-flex">
                        <ScrollText className="size-3.5" />
                        Daily digest
                      </span>
                      <span className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-[11px] font-medium text-primary-fg">
                        <Radar className="size-3.5" />
                        Simulate alert
                      </span>
                    </div>

                    <div className="space-y-3 p-3 sm:p-4">
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
                        {STATS.map((stat, index) => (
                          <div
                            key={stat.label}
                            className={cn(
                              "rounded-xl border border-line bg-surface p-3",
                              index > 2 && "hidden sm:block",
                            )}
                          >
                            <p className="truncate text-[11px] font-medium text-muted">{stat.label}</p>
                            <p className={cn("mt-1 text-2xl font-semibold tabular", stat.tone)}>
                              {stat.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)]">
                        <PreviewQueue />
                        <PreviewInvestigation />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <figcaption className="mt-4 text-center font-mono text-[11px] tracking-[0.1em] text-subtle uppercase">
              Illustrative preview · sample data, not a live feed
            </figcaption>
          </figure>
        </Reveal>
      </Container>
    </section>
  );
}

function PreviewSidebar() {
  return (
    <div className="hidden w-44 shrink-0 border-r border-line bg-sunken p-3 md:block">
      <div className="flex items-center gap-2 px-1.5 pb-4">
        <LogoMark className="size-5" />
        <span className="text-xs font-semibold text-fg">NeedleSift</span>
      </div>
      <p className="px-1.5 pb-1.5 text-[9.5px] font-semibold tracking-[0.08em] text-subtle uppercase">
        Queue
      </p>
      <ul className="space-y-0.5">
        {VIEWS.map((view) => (
          <li
            key={view.label}
            className={cn(
              "flex h-7 items-center gap-2 rounded-md px-1.5 text-[11px] font-medium",
              view.active ? "bg-raised text-fg" : "text-muted",
            )}
          >
            <view.icon className={cn("size-3.5", view.active ? "text-accent" : "text-subtle")} />
            <span className="flex-1 truncate">{view.label}</span>
            <span className="font-mono text-[10px] text-subtle">{view.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PreviewQueue() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="border-b border-line px-3 py-2.5">
        <p className="text-xs font-semibold text-fg">Alert queue</p>
        <p className="text-[10.5px] text-subtle">Most severe first</p>
      </div>
      <ul>
        {ROWS.map((row, index) => {
          const noise = row.state === "noise";
          return (
            <li
              key={`${row.event}-${row.host}`}
              className={cn(
                "relative grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3 border-b border-line px-3 py-2.5 last:border-b-0",
                index === 0 && "bg-raised",
              )}
            >
              {!noise ? (
                <span className={cn("absolute inset-y-0 left-0 w-[3px]", SEVERITY_META[row.severity].solid)} />
              ) : null}
              <SeverityBadge severity={row.severity} muted={noise} className="h-5 px-1.5 text-[10.5px]" />
              <div className="min-w-0">
                <p className={cn("truncate text-xs font-medium", noise ? "text-muted" : "text-fg")}>
                  {row.event}
                </p>
                <p className="truncate font-mono text-[10.5px] text-subtle">
                  {row.host} · {row.user}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10.5px] font-semibold",
                  row.state === "escalate" ? "text-critical" : "text-subtle",
                )}
              >
                {row.state === "escalate" ? <Siren className="size-3" /> : null}
                {row.state === "noise" ? <VolumeX className="size-3" /> : null}
                {row.state === "escalate" ? "Escalate" : row.state === "noise" ? "Noise" : "Triaged"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PreviewInvestigation() {
  return (
    <div className="hidden rounded-xl border border-line bg-surface p-3.5 lg:block">
      <div className="flex items-center gap-2">
        <SeverityBadge severity="critical" className="h-5 px-1.5 text-[10.5px]" />
        <span className="font-mono text-[10.5px] text-subtle">ALT-006</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-fg">Ransomware behavior</p>

      <div className="mt-3 flex gap-2 rounded-lg border border-critical/40 bg-critical-soft p-2.5">
        <Siren className="mt-px size-3.5 shrink-0 text-critical" />
        <p className="text-[11px] leading-relaxed text-fg">
          <span className="font-semibold text-critical">Escalate now.</span> Start with{" "}
          <span className="font-mono text-[10.5px]">SRV-SHARE-02</span>.
        </p>
      </div>

      <p className="mt-3.5 flex items-center gap-1.5 text-[9.5px] font-semibold tracking-[0.08em] text-subtle uppercase">
        <Sparkles className="size-3 text-accent" />
        Gemini summary
      </p>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
        A service account is rapidly renaming files on a shared drive — the pattern ransomware
        leaves while encrypting data.
      </p>

      <div className="mt-3.5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
        <div className="bg-surface p-2.5">
          <p className="text-[9.5px] text-subtle">Verdict</p>
          <p className="mt-0.5 text-[11.5px] font-semibold text-fg">Genuine threat</p>
        </div>
        <div className="bg-surface p-2.5">
          <p className="text-[9.5px] text-subtle">Confidence</p>
          <p className="mt-0.5 font-mono text-[11.5px] font-semibold text-fg">96%</p>
        </div>
      </div>

      <p className="mt-3.5 text-[9.5px] font-semibold tracking-[0.08em] text-subtle uppercase">
        MITRE ATT&amp;CK
      </p>
      <p className="mt-1.5 flex items-center gap-2 text-[11.5px] text-fg">
        <span className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-accent">
          T1486
        </span>
        Data Encrypted for Impact
      </p>

      <p className="mt-3.5 text-[9.5px] font-semibold tracking-[0.08em] text-subtle uppercase">
        Recommended actions
      </p>
      <ol className="mt-1.5 space-y-1.5">
        {["Isolate the server from the network", "Disable the service account", "Check backup integrity"].map(
          (action, index) => (
            <li key={action} className="flex items-center gap-2 text-[11.5px] text-muted">
              <span className="grid size-4 place-items-center rounded bg-accent-soft font-mono text-[9.5px] font-semibold text-accent">
                {index + 1}
              </span>
              {action}
            </li>
          ),
        )}
      </ol>
    </div>
  );
}
