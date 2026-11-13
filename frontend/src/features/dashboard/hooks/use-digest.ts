"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { generateDigest } from "@/lib/api/client";
import type { TriageResult } from "@/lib/api/schemas";

/**
 * The Daily NOC Digest. A briefing is generated on demand from every triage
 * result currently in the queue, and remembered until the queue changes — so
 * reopening the modal doesn't spend another Gemini call for the same data.
 */
export function useDigest(results: readonly TriageResult[]) {
  const mutation = useMutation({ mutationFn: generateDigest });
  const { mutate } = mutation;

  const signature = useMemo(
    () =>
      results
        .map((result) => result.alert_id)
        .sort()
        .join("|"),
    [results],
  );
  const [requestedSignature, setRequestedSignature] = useState<string | null>(null);

  const generate = useCallback(() => {
    if (results.length === 0) return;
    setRequestedSignature(signature);
    mutate([...results]);
  }, [mutate, results, signature]);

  /** Generates only when there is no briefing for the current queue yet. */
  const ensureFresh = useCallback(() => {
    if (mutation.isPending) return;
    if (requestedSignature !== signature || mutation.isError) generate();
  }, [generate, mutation.isError, mutation.isPending, requestedSignature, signature]);

  return {
    digest: mutation.data,
    isPending: mutation.isPending,
    error: mutation.isError ? mutation.error : null,
    basedOn: mutation.variables?.length ?? 0,
    canGenerate: results.length > 0,
    generate,
    ensureFresh,
  };
}
