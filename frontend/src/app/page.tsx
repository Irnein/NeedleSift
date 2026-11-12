import { About } from "@/features/landing/about";
import { Capabilities } from "@/features/landing/capabilities";
import { FinalCta } from "@/features/landing/final-cta";
import { Hero } from "@/features/landing/hero";
import { HowItWorks } from "@/features/landing/how-it-works";
import { ProblemSolution } from "@/features/landing/problem-solution";
import { ProductPreview } from "@/features/landing/product-preview";
import { SiteFooter } from "@/features/landing/site-footer";
import { SiteHeader } from "@/features/landing/site-header";

/** The public landing page. Fully static: it never calls the API. */
export default function LandingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-fg"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <ProductPreview />
        <ProblemSolution />
        <Capabilities />
        <HowItWorks />
        <About />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
