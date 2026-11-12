import {
  ArrowUpNarrowWide,
  Crosshair,
  ListChecks,
  Scale,
  ScrollText,
  Siren,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Reveal } from "./reveal";
import { Container, SectionHeading } from "./section";

type Capability = { icon: LucideIcon; title: string; body: string; wide?: boolean };

const CAPABILITIES: readonly Capability[] = [
  {
    icon: Sparkles,
    title: "AI-powered triage",
    body: "Gemini reads each incoming alert — the event, the host, the raw log line — and writes a threat assessment a non-specialist can follow.",
    wide: true,
  },
  {
    icon: ArrowUpNarrowWide,
    title: "Intelligent prioritization",
    body: "Alerts are ordered critical to low, newest first, so the top of the queue is always the next thing to look at.",
  },
  {
    icon: Scale,
    title: "Threat verdicts",
    body: "Each alert is classified as a genuine threat or a false positive, with a confidence score beside it.",
  },
  {
    icon: Siren,
    title: "Escalation awareness",
    body: "Alerts that need an analyst immediately are flagged, counted, and impossible to miss.",
  },
  {
    icon: Crosshair,
    title: "MITRE ATT&CK context",
    body: "The most relevant attack technique is attached to each triaged alert, linked to its ATT&CK entry.",
  },
  {
    icon: ListChecks,
    title: "Recommended actions",
    body: "Two to four concrete investigation steps, naming the host or user involved. Suggestions — the analyst stays in control.",
  },
  {
    icon: ScrollText,
    title: "Daily NOC Digest",
    body: "One click produces an AI-written briefing: the headline, totals, escalations, ordered priorities, and a note on the noise.",
    wide: true,
  },
];

export function Capabilities() {
  return (
    <section id="capabilities" className="scroll-mt-20 border-t border-line bg-sunken py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Capabilities"
            title="Everything an analyst needs to decide, in one pass"
            lead="NeedleSift doesn't replace judgement. It does the first read, so judgement is spent where it counts."
          />
        </Reveal>

        {/* A single ruled grid rather than a wall of separate cards. */}
        <Reveal delay={0.1} className="mt-12">
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((capability) => (
              <li
                key={capability.title}
                className={cn(
                  "group bg-surface p-6 transition-colors hover:bg-raised sm:p-7",
                  capability.wide && "lg:col-span-2",
                )}
              >
                <span className="grid size-9 place-items-center rounded-lg border border-line bg-raised text-accent transition-colors group-hover:border-accent/40">
                  <capability.icon aria-hidden className="size-[18px]" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-fg">{capability.title}</h3>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
                  {capability.body}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
