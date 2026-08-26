import { isAnalyticsEnabled } from "./config";

/**
 * Telemetria sem PII (SEC-008 / REQ-004).
 * Payload inspecionável: evento, timestamp, pathname e id de sessão aleatório —
 * NUNCA nome, e-mail ou IP. Sem cookies de terceiros.
 * Flag `analytics.enabled` (VITE_ANALYTICS_ENABLED) default desligada (fail secure).
 */

export type AnalyticsEventName =
  | "pageview"
  | "preinscricao_submitida"
  | "confirmacao_aberta"
  | "confirmacao_concluida";

export interface AnalyticsPayload {
  v: 1;
  e: AnalyticsEventName;
  ts: string;
  p: string;
  rid: string;
  [k: string]: unknown;
}

let sessionId: string | null = null;

export function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

export function buildPayload(
  event: AnalyticsEventName,
  extra?: Record<string, unknown>,
): AnalyticsPayload {
  const payload: AnalyticsPayload = {
    v: 1,
    e: event,
    ts: new Date().toISOString(),
    p: typeof window !== "undefined" ? window.location.pathname : "",
    rid: getSessionId(),
  };
  if (extra) {
    for (const [k, val] of Object.entries(extra)) {
      payload[k] = val;
    }
  }
  return payload;
}

/** Dispara o beacon; degrada silencioso (telemetria nunca quebra a página). */
export function track(event: AnalyticsEventName, extra?: Record<string, unknown>): void {
  if (!isAnalyticsEnabled()) return;
  const endpoint = (import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined) ?? "";
  if (!endpoint) return;
  const payload = buildPayload(event, extra);
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch(endpoint, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch {
    // silencioso por design
  }
}

/** Hook utilitário de pageview (sem PII). */
export function trackPageview(): void {
  track("pageview");
}
