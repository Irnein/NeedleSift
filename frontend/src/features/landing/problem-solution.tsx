import { ArrowRight, Check, X } from "lucide-react";

import { Reveal } from "./reveal";
import { Container, SectionHeading } from "./section";

const CONTRASTS = [
  {
    problem: "Alert overload",
    before: "Hundreds of alerts land in one flat list, each demanding the same attention.",
    after: "Every alert is read and scored the moment it arrives.",
  },
  {
    problem: "Slow manual triage",
    before: "Analysts open each event, read the raw log, and decide from scratch.",
    after: "A plain-English summary and a verdict are ready before you click.",
  },
  {
    problem: "False positives",
    before: "Routine scans, typos and patch jobs bury the events that matter.",
    after: "Likely noise is labelled and pushed to the bottom of the queue.",
  },
  {
    problem: "Hidden urgency",
    before: "The one alert that can't wait looks like all the others.",
    after: "Anything that needs a human now is flagged for escalation.",
  },
] as const;

export function ProblemSolution() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="The problem"
            title="Every alert looks urgent. Very few are."
            lead="A small NOC team can't investigate everything. The danger isn't the volume itself — it's the real incident that goes unnoticed inside it."
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-panel">
            <div className="hidden grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-line bg-raised/60 text-xs font-semibold tracking-[0.06em] text-subtle uppercase md:grid">
              <p className="px-6 py-3">Challenge</p>
              <p className="border-l border-line px-6 py-3">Without triage</p>
              <p className="border-l border-line px-6 py-3 text-accent">With NeedleSift</p>
            </div>
            <ul>
              {CONTRASTS.map((row) => (
                <li
                  key={row.problem}
                  className="grid gap-3 border-b border-line px-5 py-5 last:border-b-0 md:grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-0 md:px-0 md:py-0"
                >
                  <h3 className="text-[15px] font-semibold text-fg md:px-6 md:py-5">{row.problem}</h3>
                  <p className="flex gap-2.5 text-sm leading-relaxed text-muted md:border-l md:border-line md:px-6 md:py-5">
                    <X aria-hidden className="mt-0.5 size-4 shrink-0 text-subtle" />
                    <span>
                      <span className="sr-only">Without triage: </span>
                      {row.before}
                    </span>
                  </p>
                  <p className="flex gap-2.5 text-sm leading-relaxed text-fg md:border-l md:border-line md:px-6 md:py-5">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>
                      <span className="sr-only">With NeedleSift: </span>
                      {row.after}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-8 flex items-center gap-2 text-sm text-muted">
            <ArrowRight aria-hidden className="size-4 text-accent" />
            The result is a short, ordered queue of findings instead of a wall of events.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
