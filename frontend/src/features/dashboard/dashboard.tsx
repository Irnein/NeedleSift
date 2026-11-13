"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { describeError } from "@/lib/api/client";
import type { TriagedAlert } from "@/lib/api/schemas";
import { humanizeEventType } from "@/lib/format";
import { SEVERITY_META } from "@/lib/severity";

import { AlertQueue } from "./components/alert-queue";
import { DashboardHeader } from "./components/dashboard-header";
import { DigestDialog } from "./components/digest-dialog";
import { Investigation, InvestigationPlaceholder } from "./components/investigation";
import { Panel } from "./components/panel";
import { Sidebar } from "./components/sidebar";
import { StatsRow } from "./components/stats-row";
import { useAlertQueue } from "./hooks/use-alert-queue";
import { useDigest } from "./hooks/use-digest";
import { useMediaQuery } from "./hooks/use-media-query";
import { computeStats, matchesFilter, type QueueFilter, type TriagedItem } from "./lib/queue";

/** How long a freshly simulated alert stays highlighted in the queue. */
const ARRIVAL_HIGHLIGHT_MS = 3200;

export function Dashboard() {
  // Wide screens show the investigation beside the queue; narrower ones use a sheet.
  const isWide = useMediaQuery("(min-width: 1280px)");

  const [filter, setFilter] = useState<QueueFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [digestOpen, setDigestOpen] = useState(false);
  const [arrivedId, setArrivedId] = useState<string | null>(null);
  const arrivalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (arrivalTimer.current) clearTimeout(arrivalTimer.current);
  }, []);

  const inspect = useCallback((alertId: string) => {
    setSelectedId(alertId);
    setSheetOpen(true);
  }, []);

  const handleSimulated = useCallback(
    ({ alert, triage }: TriagedAlert) => {
      // Make sure the newcomer is visible, flag it, and open it where there's room.
      setFilter("all");
      setArrivedId(alert.id);
      if (arrivalTimer.current) clearTimeout(arrivalTimer.current);
      arrivalTimer.current = setTimeout(() => setArrivedId(null), ARRIVAL_HIGHLIGHT_MS);
      if (isWide) setSelectedId(alert.id);

      const title = `${SEVERITY_META[triage.severity].label} · ${humanizeEventType(alert.event_type)}`;
      const options = {
        description: `${alert.host} · ${triage.escalate ? "Escalate now" : triage.verdict === "false_positive" ? "Judged a false positive" : "Triaged"}`,
        action: isWide ? undefined : { label: "Inspect", onClick: () => inspect(alert.id) },
      };
      if (triage.escalate) toast.error(title, options);
      else toast(title, options);
    },
    [inspect, isWide],
  );

  const queue = useAlertQueue({ onSimulated: handleSimulated });
  const { items, simulate } = queue;

  const stats = useMemo(() => computeStats(items), [items]);
  const visibleItems = useMemo(
    () => (filter === "all" ? items : items.filter((item) => matchesFilter(item, filter))),
    [items, filter],
  );
  const triageResults = useMemo(
    () =>
      items
        .filter((item): item is TriagedItem => item.status === "triaged")
        .map((item) => item.triage),
    [items],
  );

  const digest = useDigest(triageResults);

  // Until the analyst picks something, a wide layout opens the top-ranked
  // alert once the initial triage has settled — derived, not stored.
  const settled = stats.total > 0 && stats.pending === 0;
  const activeId = selectedId ?? (isWide && settled ? (items[0]?.alert.id ?? null) : null);
  const activeItem = useMemo(
    () => items.find((item) => item.alert.id === activeId) ?? null,
    [items, activeId],
  );

  const handleSimulate = useCallback(() => {
    simulate.mutate(undefined, {
      onError: (error) => toast.error("Simulation failed", { description: describeError(error) }),
    });
  }, [simulate]);

  const openDigest = useCallback(() => {
    setDigestOpen(true);
    digest.ensureFresh();
  }, [digest]);

  return (
    <TooltipProvider delayDuration={350}>
      <div className="flex min-h-dvh xl:h-dvh xl:overflow-hidden">
        <Sidebar
          stats={stats}
          filter={filter}
          onFilterChange={setFilter}
          onOpenDigest={openDigest}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            stats={stats}
            isLoading={queue.isLoading}
            hasLoadError={queue.loadError !== null}
            isSimulating={simulate.isPending}
            onSimulate={handleSimulate}
            onOpenDigest={openDigest}
          />

          <main className="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-6">
            <StatsRow
              stats={stats}
              isLoading={queue.isLoading}
              filter={filter}
              onFilterChange={setFilter}
            />

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(400px,0.62fr)]">
              <AlertQueue
                items={visibleItems}
                stats={stats}
                filter={filter}
                onFilterChange={setFilter}
                selectedId={activeId}
                arrivedId={arrivedId}
                onSelect={inspect}
                onRetry={queue.retry}
                onRetryAllFailed={queue.retryAllFailed}
                isLoading={queue.isLoading}
                loadError={queue.loadError}
                onReload={() => void queue.reload()}
                isReloading={queue.isReloading}
                isSimulating={simulate.isPending}
                onSimulate={handleSimulate}
                className="xl:overflow-hidden"
              />

              <Panel
                aria-label="Investigation"
                className="hidden min-h-0 flex-col overflow-hidden xl:flex"
              >
                {activeItem ? (
                  <Investigation
                    key={activeItem.alert.id}
                    item={activeItem}
                    onRetry={queue.retry}
                    heading={(title) => (
                      <h2 className="text-lg leading-snug font-semibold tracking-tight text-fg">
                        {title}
                      </h2>
                    )}
                  />
                ) : (
                  <InvestigationPlaceholder triaging={queue.isLoading || stats.pending > 0} />
                )}
              </Panel>
            </div>
          </main>
        </div>
      </div>

      {/* Below xl the same investigation opens as a sheet over the queue. */}
      <Dialog open={!isWide && sheetOpen && activeItem !== null} onOpenChange={setSheetOpen}>
        {activeItem ? (
          <DialogContent layout="sheet" className="h-[92dvh] md:mx-auto md:max-w-2xl">
            <DialogDescription className="sr-only">
              Triage details for the selected alert.
            </DialogDescription>
            <Investigation
              key={activeItem.alert.id}
              item={activeItem}
              onRetry={queue.retry}
              heading={(title) => (
                <DialogTitle className="text-lg leading-snug font-semibold tracking-tight text-fg">
                  {title}
                </DialogTitle>
              )}
            />
          </DialogContent>
        ) : null}
      </Dialog>

      <DigestDialog
        open={digestOpen}
        onOpenChange={setDigestOpen}
        state={digest}
        pendingTriage={stats.pending}
      />
    </TooltipProvider>
  );
}
