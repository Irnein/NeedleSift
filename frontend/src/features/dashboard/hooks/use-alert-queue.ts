"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { ApiError, fetchAlerts, simulateAlert, triageAlert } from "@/lib/api/client";
import type { Alert, TriagedAlert, TriageResult } from "@/lib/api/schemas";
import { createLimiter } from "@/lib/limiter";

import { sortQueue, type QueueItem } from "../lib/queue";

/** The backend contract: never more than two triage requests in flight. */
const TRIAGE_CONCURRENCY = 2;
const limitTriage = createLimiter(TRIAGE_CONCURRENCY);

const alertsKey = ["alerts"] as const;
const triageKey = (alertId: string) => ["triage", alertId] as const;

type TriageState = { data: TriageResult | undefined; error: Error | null; failed: boolean };

/** Reduces each query to the three facts the queue needs; stable between renders. */
function combineTriage(results: UseQueryResult<TriageResult, Error>[]): TriageState[] {
  return results.map((result) => ({
    data: result.data,
    error: result.error,
    failed: result.isError && !result.isFetching,
  }));
}

/**
 * Owns the alert queue's server state.
 *
 * - The alert feed is fetched once.
 * - Each alert gets its own triage query keyed by id, so results are cached,
 *   deduplicated and individually retryable. All of them funnel through one
 *   limiter, which is what caps concurrency at two.
 * - A simulated alert arrives already triaged: its result is written straight
 *   into the query cache, so no second request is made for it.
 */
export function useAlertQueue({ onSimulated }: { onSimulated?: (result: TriagedAlert) => void } = {}) {
  const queryClient = useQueryClient();
  const [simulated, setSimulated] = useState<Alert[]>([]);

  const feed = useQuery({
    queryKey: alertsKey,
    queryFn: ({ signal }) => fetchAlerts(signal),
  });

  const alerts = useMemo(() => {
    const feedAlerts = feed.data ?? [];
    return [...simulated, ...feedAlerts];
  }, [simulated, feed.data]);

  const simulatedIds = useMemo(() => new Set(simulated.map((alert) => alert.id)), [simulated]);

  const triage = useQueries({
    queries: alerts.map((alert) => ({
      queryKey: triageKey(alert.id),
      queryFn: ({ signal }: { signal: AbortSignal }): Promise<TriageResult> =>
        limitTriage(() => triageAlert(alert, signal), signal),
      // A dropped connection gets one automatic retry. A 503 does not: the
      // backend has already retried Gemini with backoff before giving up, so
      // repeating it here would only hold a slot and delay the manual retry.
      retry: (failureCount: number, error: Error) =>
        failureCount < 1 && error instanceof ApiError && error.kind === "network",
      retryDelay: 1500,
    })),
    combine: combineTriage,
  });

  const items = useMemo(() => {
    const unsorted = alerts.map((alert, index): QueueItem => {
      const origin = simulatedIds.has(alert.id) ? "simulated" : "feed";
      const state = triage[index];
      if (state?.data) return { alert, origin, status: "triaged", triage: state.data };
      if (state?.failed) return { alert, origin, status: "failed", error: state.error };
      return { alert, origin, status: "pending" };
    });
    return sortQueue(unsorted);
  }, [alerts, simulatedIds, triage]);

  const retry = useCallback(
    (alertId: string) => {
      void queryClient.refetchQueries({ queryKey: triageKey(alertId), exact: true });
    },
    [queryClient],
  );

  const retryAllFailed = useCallback(() => {
    void queryClient.refetchQueries({
      queryKey: ["triage"],
      predicate: (query) => query.state.status === "error",
    });
  }, [queryClient]);

  const simulate = useMutation({
    mutationFn: simulateAlert,
    onSuccess: (result) => {
      // Seed the cache before the alert joins the list so its triage query
      // mounts with data and never fires a request of its own.
      queryClient.setQueryData(triageKey(result.alert.id), result.triage);
      setSimulated((current) => [result.alert, ...current]);
      onSimulated?.(result);
    },
  });

  return {
    items,
    isLoading: feed.isPending,
    loadError: feed.isError ? feed.error : null,
    reload: feed.refetch,
    isReloading: feed.isFetching,
    retry,
    retryAllFailed,
    simulate,
  };
}
