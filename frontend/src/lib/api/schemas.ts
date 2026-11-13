import { z } from "zod";

/**
 * Runtime contracts for the NeedleSift API. These mirror backend/models.py
 * exactly; every response is parsed through them before it reaches the UI,
 * so a malformed or unexpected payload fails loudly at the boundary instead
 * of rendering garbage.
 */

export const severitySchema = z.enum(["critical", "high", "medium", "low"]);
export const verdictSchema = z.enum(["true_positive", "false_positive"]);

export const alertSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  source: z.string(),
  host: z.string(),
  user: z.string(),
  src_ip: z.string().default(""),
  event_type: z.string(),
  description: z.string(),
  raw_log: z.string().default(""),
});

export const triageResultSchema = z.object({
  alert_id: z.string(),
  summary: z.string(),
  severity: severitySchema,
  verdict: verdictSchema,
  confidence: z.number().min(0).max(1),
  mitre_technique: z.string(),
  recommended_actions: z.array(z.string()),
  escalate: z.boolean(),
});

export const triagedAlertSchema = z.object({
  alert: alertSchema,
  triage: triageResultSchema,
});

export const digestResultSchema = z.object({
  headline: z.string(),
  overview: z.string(),
  priorities: z.array(z.string()),
  noise_note: z.string(),
  total: z.number().int(),
  by_severity: z.record(z.string(), z.number()),
  escalations: z.number().int(),
  false_positives: z.number().int(),
});

export const healthSchema = z.object({
  status: z.string(),
  model: z.string(),
  gemini_configured: z.boolean(),
  alerts_loaded: z.number().int(),
});

export type Severity = z.infer<typeof severitySchema>;
export type Verdict = z.infer<typeof verdictSchema>;
export type Alert = z.infer<typeof alertSchema>;
export type TriageResult = z.infer<typeof triageResultSchema>;
export type TriagedAlert = z.infer<typeof triagedAlertSchema>;
export type DigestResult = z.infer<typeof digestResultSchema>;
export type Health = z.infer<typeof healthSchema>;
