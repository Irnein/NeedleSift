import { Reveal } from "./reveal";
import { Container, SectionHeading } from "./section";

const FACTS = [
  { label: "Built for", value: "University NOC analysts" },
  { label: "AI model", value: "Google Gemini" },
  { label: "Backend", value: "FastAPI on Cloud Run" },
  { label: "Interface", value: "Next.js + TypeScript" },
] as const;

export function About() {
  return (
    <section id="about" className="scroll-mt-20 border-t border-line bg-sunken py-20 sm:py-28">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="About"
            title="A hackathon project built like a product"
            lead="NeedleSift started from a simple observation: campus network teams are small, the alert stream is not, and the alert that matters is easy to miss. The name says the rest — find the needle, sift out the hay."
          />
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
            Triage output is AI-generated guidance for trained analysts. It&apos;s there to speed
            up the first read, not to act on its own.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {FACTS.map((fact) => (
              <div key={fact.label} className="bg-surface p-5">
                <dt className="font-mono text-[11px] tracking-[0.1em] text-subtle uppercase">
                  {fact.label}
                </dt>
                <dd className="mt-2 text-[15px] font-medium text-fg">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
