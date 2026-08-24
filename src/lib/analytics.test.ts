import { describe, expect, it, vi, beforeEach } from "vitest";
import { buildPayload, getSessionId, track, type AnalyticsPayload } from "./analytics";

describe("analytics sem PII (S-02/S-06 — SEC-008/REQ-004)", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("payload NUNCA contém nome, e-mail ou IP", () => {
    const p = buildPayload("pageview", { perfil: "iniciante" });
    expect(p.e).toBe("pageview");
    expect(p.p).toBeTruthy();
    expect(p.rid).toBeTruthy();
    const json = JSON.stringify(p);
    expect(json).not.toMatch(/@/);
    expect(json).not.toMatch(/\b\d{1,3}(\.\d{1,3}){3}\b/);
  });

  it("campos extras não aceitam PII acidentalmente (payload mínimo)", () => {
    const p = buildPayload("preinscricao_submitida", { ok: true });
    expect(p.ok).toBe(true);
  });

  it("session id é estável na mesma sessão e aleatório", () => {
    const a = getSessionId();
    const b = getSessionId();
    expect(a).toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(10);
  });

  it("track não dispara beacon quando analytics desabilitado (default fail secure)", () => {
    vi.stubEnv("VITE_ANALYTICS_ENABLED", undefined);
    vi.stubEnv("VITE_ANALYTICS_ENDPOINT", "https://analytics.cydef.com.br/e");
    const spy = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);
    track("pageview");
    expect(spy).not.toHaveBeenCalled();
  });

  it("track dispara beacon com payload sem PII quando habilitado", async () => {
    vi.stubEnv("VITE_ANALYTICS_ENABLED", "true");
    vi.stubEnv("VITE_ANALYTICS_ENDPOINT", "https://analytics.cydef.com.br/e");
    const spy = vi.spyOn(navigator, "sendBeacon").mockReturnValue(true);
    track("confirmacao_concluida");
    expect(spy).toHaveBeenCalledTimes(1);
    const [url, blob] = spy.mock.calls[0] as [string, Blob];
    expect(url).toBe("https://analytics.cydef.com.br/e");
    const sent = JSON.parse(await blob.text()) as AnalyticsPayload;
    expect(sent.e).toBe("confirmacao_concluida");
    const json = JSON.stringify(sent);
    expect(json).not.toMatch(/@/);
    expect(json).not.toMatch(/token=/);
  });

  it("track degrada silencioso quando beacon falha (não quebra a página)", () => {
    vi.stubEnv("VITE_ANALYTICS_ENABLED", "true");
    vi.stubEnv("VITE_ANALYTICS_ENDPOINT", "https://analytics.cydef.com.br/e");
    vi.spyOn(navigator, "sendBeacon").mockImplementation(() => {
      throw new Error("boom");
    });
    expect(() => track("pageview")).not.toThrow();
  });
});
