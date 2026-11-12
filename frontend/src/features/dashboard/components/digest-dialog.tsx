"use client";

import { CloudOff, RotateCw, ScrollText, Sparkles, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { describeError } from "@/lib/api/client";
import type { DigestResult } from "@/lib/api/schemas";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { useDigest } from "../hooks/use-digest";
import { Eyebrow } from "./panel";

type DigestState = ReturnType<typeof useDigest>;

export function DigestDialog({
  open,
  onOpenChange,
  state,
  pendingTriage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: DigestState;
  /** Alerts still waiting on a verdict, so the briefing can say what it left out. */
  pendingTriage: number;
}) {
  const { digest, isPending, error, basedOn, canGenerate, generate } = state;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-busy={isPending}>
        <header className="border-b border-line px-6 pt-5 pb-4 pr-14">
          <Eyebrow className="flex items-center gap-1.5 text-accent">
            <ScrollText aria-hidden className="size-3.5" />
            Daily NOC digest
          </Eyebrow>
          <DialogTitle className="mt-2 text-xl leading-snug font-semibold tracking-tight text-balance text-fg">
            {isPending
              ? "Writing today's briefing…"
              : error
                ? "The briefing couldn't be generated"
                : digest
                  ? digest.headline
                  : "No triage results yet"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            An AI-generated summary of the triaged alert queue: totals, overview, priorities and
            noise.
          </DialogDescription>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 scroll-slim">
          {isPending ? (
            <DigestSkeleton />
          ) : error ? (
            <Notice
              icon={<CloudOff aria-hidden className="size-5" />}
              body={describeError(error)}
              action={
                <Button onClick={generate}>
                  <RotateCw aria-hidden className="size-4" />
                  Try again
                </Button>
              }
            />
          ) : digest ? (
            <DigestBody digest={digest} />
          ) : (
            <Notice
              icon={<Sparkles aria-hidden className="size-5" />}
              body={
                canGenerate
                  ? "Generate a briefing from the alerts triaged so far."
                  : "The digest is written from triage results. Once Gemini has assessed at least one alert, you can generate it here."
              }
              action={
                canGenerate ? (
                  <Button variant="primary" onClick={generate}>
                    Generate digest
                  </Button>
                ) : null
              }
            />
          )}
        </div>

        <footer className="flex flex-wrap items-center gap-3 border-t border-line px-6 py-3.5">
          <p className="min-w-0 flex-1 text-xs text-subtle">
            {isPending
              ? `Gemini is reading ${pluralize(basedOn, "triage result")}…`
              : digest && !error
                ? `Written by Gemini from ${pluralize(basedOn, "triaged alert")}${pendingTriage > 0 ? ` · ${pendingTriage} still being triaged` : ""}. Verify before acting.`
                : "Generated on demand by Gemini."}
          </p>
          {digest && !error ? (
            <Button size="sm" onClick={generate} disabled={isPending || !canGenerate}>
              <RotateCw aria-hidden className={cn("size-3.5", isPending && "animate-spin")} />
              Regenerate
            </Button>
          ) : null}
          <DialogClose asChild>
            <Button size="sm" variant="primary">
              Done
            </Button>
          </DialogClose>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function DigestBody({ digest }: { digest: DigestResult }) {
  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line">
        <Tile label="Total alerts" value={digest.total} />
        <Tile
          label="Escalations"
          value={digest.escalations}
          tone={digest.escalations > 0 ? "text-critical" : undefined}
        />
        <Tile label="False positives" value={digest.false_positives} tone="text-muted" />
      </dl>

      <section aria-labelledby="digest-overview">
        <Eyebrow id="digest-overview">Overview</Eyebrow>
        <p className="mt-2 text-sm leading-relaxed text-fg">{digest.overview}</p>
      </section>

      <section aria-labelledby="digest-priorities">
        <Eyebrow id="digest-priorities">Priorities</Eyebrow>
        {digest.priorities.length > 0 ? (
          <ol className="mt-2.5 space-y-2">
            {digest.priorities.map((priority, index) => (
              <li key={index} className="flex gap-3">
                <span
                  aria-hidden
                  className="grid size-6 shrink-0 place-items-center rounded-md bg-accent-soft font-mono text-xs font-semibold text-accent"
                >
                  {index + 1}
                </span>
                <span className="pt-0.5 text-sm leading-relaxed text-fg">{priority}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-muted">No priority actions were identified.</p>
        )}
      </section>

      <section
        aria-labelledby="digest-noise"
        className="flex gap-3 rounded-xl border border-line bg-raised/60 p-4"
      >
        <VolumeX aria-hidden className="mt-0.5 size-4 shrink-0 text-subtle" />
        <div>
          <Eyebrow id="digest-noise">Noise note</Eyebrow>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">{digest.noise_note}</p>
        </div>
      </section>
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="bg-surface px-4 py-3">
      <dt className="text-xs text-subtle">{label}</dt>
      <dd className={cn("mt-1 text-2xl font-semibold tracking-tight tabular", tone ?? "text-fg")}>
        {value}
      </dd>
    </div>
  );
}

function DigestSkeleton() {
  return (
    <div role="status" aria-label="Gemini is writing the digest" className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <span className="skeleton h-[68px]" />
        <span className="skeleton h-[68px]" />
        <span className="skeleton h-[68px]" />
      </div>
      <div className="space-y-2">
        <span className="skeleton block h-4 w-full" />
        <span className="skeleton block h-4 w-11/12" />
        <span className="skeleton block h-4 w-3/5" />
      </div>
      <div className="space-y-2.5">
        <span className="skeleton block h-6 w-10/12" />
        <span className="skeleton block h-6 w-9/12" />
        <span className="skeleton block h-6 w-11/12" />
      </div>
    </div>
  );
}

function Notice({
  icon,
  body,
  action,
}: {
  icon: React.ReactNode;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <span className="grid size-11 place-items-center rounded-xl border border-line bg-raised text-muted">
        {icon}
      </span>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
