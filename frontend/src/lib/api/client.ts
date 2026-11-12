import { z } from "zod";

import {
  alertSchema,
  digestResultSchema,
  healthSchema,
  triagedAlertSchema,
  triageResultSchema,
  type Alert,
  type DigestResult,
  type Health,
  type TriagedAlert,
  type TriageResult,
} from "./schemas";

/**
 * Where the API lives.
 * - NEXT_PUBLIC_API_BASE_URL wins when set.
 * - `next dev` falls back to the backend's local uvicorn port.
 * - Production builds default to same-origin, because the backend container
 *   serves this static export itself.
 */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8080" : "")
).replace(/\/+$/, "");

export const API_DOCS_URL = `${API_BASE_URL}/api/docs`;

export type ApiErrorKind = "network" | "unavailable" | "http" | "invalid";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

/** Analyst-facing copy. Raw backend or parser detail never reaches the UI. */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case "network":
        return "Can't reach the NeedleSift API. Check your connection and try again.";
      case "unavailable":
        return "AI triage is temporarily unavailable. Try again in a moment.";
      case "invalid":
        return "The API returned a response NeedleSift didn't recognise.";
      case "http":
        return "The NeedleSift API couldn't complete that request.";
    }
  }
  return "Something went wrong. Please try again.";
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function request<S extends z.ZodType>(
  path: string,
  schema: S,
  init?: { method?: "GET" | "POST"; body?: unknown; signal?: AbortSignal },
): Promise<z.output<S>> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: init?.method ?? "GET",
      headers:
        init?.body === undefined
          ? { Accept: "application/json" }
          : { Accept: "application/json", "Content-Type": "application/json" },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
      signal: init?.signal,
    });
  } catch (error) {
    if (isAbort(error)) throw error;
    throw new ApiError("network", "Network request failed");
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 503 ? "unavailable" : "http",
      `Request to ${path} failed with status ${response.status}`,
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    if (isAbort(error)) throw error;
    throw new ApiError("invalid", `Response from ${path} was not valid JSON`);
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError("invalid", `Response from ${path} did not match the API contract`);
  }
  return parsed.data;
}

export function fetchAlerts(signal?: AbortSignal): Promise<Alert[]> {
  return request("/api/alerts", z.array(alertSchema), { signal });
}

export function triageAlert(alert: Alert, signal?: AbortSignal): Promise<TriageResult> {
  return request("/api/triage", triageResultSchema, { method: "POST", body: alert, signal });
}

export function simulateAlert(): Promise<TriagedAlert> {
  return request("/api/simulate", triagedAlertSchema, { method: "POST" });
}

export function generateDigest(results: TriageResult[]): Promise<DigestResult> {
  return request("/api/digest", digestResultSchema, { method: "POST", body: { results } });
}

export function fetchHealth(signal?: AbortSignal): Promise<Health> {
  return request("/api/health", healthSchema, { signal });
}
