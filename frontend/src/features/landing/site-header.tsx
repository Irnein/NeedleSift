"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

import { Container, DashboardLink, NAV_LINKS } from "./section";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
      <Container className="flex h-16 items-center gap-4">
        <Link href="/" aria-label="NeedleSift home" className="rounded-md">
          <Logo />
        </Link>

        <nav aria-label="Main" className="mx-auto hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-raised hover:text-fg"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle />
          <Button asChild variant="primary" className="hidden sm:inline-flex">
            <DashboardLink>
              Open Dashboard
              <ArrowRight aria-hidden className="size-4" />
            </DashboardLink>
          </Button>
          <Button
            size="icon"
            className="md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden className="size-4" /> : <Menu aria-hidden className="size-4" />}
          </Button>
        </div>
      </Container>

      <AnimatePresence initial={false}>
        {menuOpen ? (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <Container className="py-3">
              <ul>
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex h-11 items-center rounded-lg px-3 text-[15px] font-medium text-fg hover:bg-raised"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              <Button asChild variant="primary" size="lg" className="mt-2 w-full">
                <DashboardLink>
                  Open Dashboard
                  <ArrowRight aria-hidden className="size-4" />
                </DashboardLink>
              </Button>
            </Container>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
