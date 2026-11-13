"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink, ScrollText } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { API_DOCS_URL } from "@/lib/api/client";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

import { useHealth } from "../hooks/use-health";
import type { QueueFilter, QueueStats } from "../lib/queue";
import { Eyebrow } from "./panel";
import { QUEUE_VIEWS } from "./queue-views";

const itemClass =
  "group flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-muted transition-colors hover:bg-raised hover:text-fg";

export function Sidebar({
  stats,
  filter,
  onFilterChange,
  onOpenDigest,
}: {
  stats: QueueStats;
  filter: QueueFilter;
  onFilterChange: (filter: QueueFilter) => void;
  onOpenDigest: () => void;
}) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-sunken lg:flex">
      <div className="flex h-16 items-center px-5">
        <Link href="/" aria-label="NeedleSift home" className="rounded-md">
          <Logo />
        </Link>
      </div>

      <nav aria-label="Queue views" className="flex-1 space-y-6 overflow-y-auto px-3 py-3 scroll-slim">
        <div>
          <Eyebrow className="mb-2 px-2.5">Queue</Eyebrow>
          <ul className="space-y-0.5">
            {QUEUE_VIEWS.map((view) => {
              const active = filter === view.filter;
              const Icon = view.icon;
              return (
                <li key={view.filter}>
                  <button
                    type="button"
                    aria-current={active ? "true" : undefined}
                    onClick={() => onFilterChange(view.filter)}
                    className={cn(
                      itemClass,
                      active && "bg-raised text-fg shadow-[inset_0_0_0_1px_var(--line)]",
                    )}
                  >
                    <Icon
                      aria-hidden
                      className={cn("size-4", active ? "text-accent" : "text-subtle")}
                    />
                    <span className="flex-1 text-left">{view.label}</span>
                    <span className="font-mono text-xs text-subtle tabular">
                      {view.count(stats)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <Eyebrow className="mb-2 px-2.5">Briefing</Eyebrow>
          <button type="button" onClick={onOpenDigest} className={itemClass}>
            <ScrollText aria-hidden className="size-4 text-subtle" />
            <span className="flex-1 text-left">Daily NOC digest</span>
          </button>
        </div>

        <div>
          <Eyebrow className="mb-2 px-2.5">Resources</Eyebrow>
          <ul className="space-y-0.5">
            <li>
              <a href={API_DOCS_URL} target="_blank" rel="noreferrer" className={itemClass}>
                <BookOpen aria-hidden className="size-4 text-subtle" />
                <span className="flex-1">API reference</span>
                <ExternalLink aria-hidden className="size-3.5 text-subtle" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
            <li>
              <Link href="/" className={itemClass}>
                <ArrowLeft aria-hidden className="size-4 text-subtle" />
                Product overview
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <EngineStatus />
    </aside>
  );
}

function EngineStatus() {
  const health = useHealth();

  let tone = "bg-subtle";
  let title = "Checking triage engine…";
  let detail = "Contacting the NeedleSift API";
  if (health.isError) {
    tone = "bg-critical";
    title = "API unreachable";
    detail = "Status could not be confirmed";
  } else if (health.data) {
    const ready = health.data.gemini_configured;
    tone = ready ? "bg-ok" : "bg-medium";
    title = ready ? "Triage engine online" : "Gemini not configured";
    detail = pluralize(health.data.alerts_loaded, "alert") + " in the feed";
  }

  return (
    <div className="m-3 rounded-xl border border-line bg-surface p-3.5" role="status">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={cn("size-2 rounded-full", tone, health.isPending && "animate-pulse-dot")}
        />
        <p className="text-[13px] font-medium text-fg">{title}</p>
      </div>
      <p className="mt-1.5 text-xs text-subtle">{detail}</p>
      {health.data ? (
        <p className="mt-2 truncate font-mono text-[11px] text-muted" title="Gemini model in use">
          {health.data.model}
        </p>
      ) : null}
    </div>
  );
}
