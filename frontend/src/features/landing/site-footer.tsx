import { Logo } from "@/components/shared/logo";

import { Container, DashboardLink, NAV_LINKS } from "./section";

const REPOSITORY_URL = "https://github.com/Irnein/NeedleSift";

const linkClass = "text-sm text-muted transition-colors hover:text-fg";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-sunken">
      <Container className="grid gap-10 py-14 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            AI-powered security alert triage for university Network Operations Centers. Less noise,
            faster decisions.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-mono text-[11px] tracking-[0.1em] text-subtle uppercase">Product</h2>
          <ul className="mt-4 space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-mono text-[11px] tracking-[0.1em] text-subtle uppercase">Project</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <DashboardLink className={linkClass}>Open Dashboard</DashboardLink>
            </li>
            <li>
              <a href={REPOSITORY_URL} target="_blank" rel="noreferrer" className={linkClass}>
                Source on GitHub
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-line">
        <Container className="flex flex-col gap-2 py-5 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 NeedleSift. A hackathon project.</p>
          <p>Triage output is AI-generated — verify before acting.</p>
        </Container>
      </div>
    </footer>
  );
}
