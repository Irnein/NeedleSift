"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchHealth } from "@/lib/api/client";

/** One-off backend health probe, used only for the status indicators. */
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => fetchHealth(signal),
  });
}
