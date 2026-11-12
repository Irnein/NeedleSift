import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Reveal } from "./reveal";
import { Container, DashboardLink } from "./section";

export function FinalCta() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-surface px-6 py-16 text-center shadow-panel sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_80%_at_50%_100%,black,transparent)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-56 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
            />
            <h2 className="relative mx-auto max-w-3xl text-3xl leading-[1.12] font-semibold tracking-tight text-balance text-fg sm:text-5xl">
              Spend less time sorting alerts.
              <br className="hidden sm:block" /> More time securing your network.
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              The dashboard is open — no sign-up, no setup. Watch a live alert get triaged in
              seconds.
            </p>
            <div className="relative mt-9 flex justify-center">
              <Button asChild variant="primary" size="lg">
                <DashboardLink>
                  Open Dashboard
                  <ArrowRight aria-hidden className="size-4" />
                </DashboardLink>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
