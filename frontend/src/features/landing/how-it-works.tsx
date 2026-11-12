import { Reveal } from "./reveal";
import { Container, SectionHeading } from "./section";

const STEPS = [
  {
    title: "Collect security alerts",
    body: "Alerts from the tools a campus already runs — endpoint protection, firewalls, SIEM, VPN and identity — arrive in a single feed.",
  },
  {
    title: "Gemini analyzes and prioritizes",
    body: "Each alert is assessed for severity, judged real or false, mapped to an ATT&CK technique, and checked for whether it needs escalation.",
  },
  {
    title: "Review actionable intelligence",
    body: "Analysts open a ranked queue, read the reasoning, follow the suggested steps, and pull a daily digest for the handover.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="How it works"
            title="From raw alert to clear decision in three steps"
          />
        </Reveal>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {/* The thread connecting the steps (desktop only). */}
          <span
            aria-hidden
            className="absolute top-5 right-[16.6%] left-[16.6%] hidden h-px bg-gradient-to-r from-line via-accent/60 to-line md:block"
          />
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative">
              <Reveal delay={index * 0.1} className="flex gap-5 md:flex-col md:items-center md:text-center">
                <span className="relative grid size-10 shrink-0 place-items-center rounded-full border border-line-strong bg-surface font-mono text-sm font-semibold text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-fg md:mt-5">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted md:mx-auto md:max-w-xs">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
