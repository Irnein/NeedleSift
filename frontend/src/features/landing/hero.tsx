import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Reveal } from "./reveal";
import { Container, DashboardLink } from "./section";
import { SiftVisual } from "./sift-visual";

const PROOF_POINTS = ["Severity", "Threat verdict", "MITRE ATT&CK", "Next steps"] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Backdrop: a faint blueprint grid and one restrained wash of violet. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
      />

      <Container className="relative grid items-center gap-12 pt-16 pb-20 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14 lg:pt-24 lg:pb-28">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted">
            <Sparkles aria-hidden className="size-3.5 text-accent" />
            AI alert triage for university NOC teams
          </p>

          <h1 className="mt-6 text-[2.6rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-fg sm:text-6xl lg:text-[4rem]">
            Security alerts.
            <br />
            <span className="text-accent">Intelligently</span> prioritized.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted">
            NeedleSift uses Google&apos;s Gemini to read every incoming security alert, separate
            real threats from noise, and hand analysts a ranked queue with the reasoning and next
            steps attached.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary" size="lg">
              <DashboardLink>
                Open Dashboard
                <ArrowRight aria-hidden className="size-4" />
              </DashboardLink>
            </Button>
            <Button asChild size="lg">
              <a href="#capabilities">
                Explore capabilities
                <ArrowDown aria-hidden className="size-4 text-subtle" />
              </a>
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-subtle">
            <li className="text-muted">Every alert comes back with:</li>
            {PROOF_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span aria-hidden className="size-1 rounded-full bg-accent" />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.12}>
          <SiftVisual />
        </Reveal>
      </Container>
    </section>
  );
}
