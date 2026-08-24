import { describe, expect, it, vi } from "vitest";
import { createConfirmacaoHandler, type ConfirmacaoStorage } from "./index.ts";

/**
 * Testes do fluxo de confirmação (S-05 — HEL-M02/M05).
 * Matriz: válido/inválido/expirado/reutilizado → MESMO 302 para página neutra
 * SEM query string; Referrer-Policy: no-referrer; rate limit → 429 (sem
 * revelar estado); token nunca em logs.
 */

function makeRequest(token: string | null, ip = "203.0.113.7"): Request {
  const url = token === null ? "https://api.cydef.com.br/confirmacao" : `https://api.cydef.com.br/confirmacao?token=${encodeURIComponent(token)}`;
  return new Request(url, {
    method: "GET",
    headers: { "x-forwarded-for": ip },
  });
}

function makeDeps(overrides: Partial<ReturnType<typeof baseDeps>> = {}) {
  return { ...baseDeps(), ...overrides };
}

function baseDeps() {
  const logs: Array<Record<string, unknown>> = [];
  const storage: ConfirmacaoStorage = {
    confirmarToken: vi.fn().mockResolvedValue({ ok: true, resultado: "ok" }),
  };
  return {
    storage,
    hashIp: (ip: string) => Promise.resolve(`hash-${ip}`),
    agora: () => 1_700_000_000_000,
    log: (e: Record<string, unknown>) => logs.push(e),
    novoRequestId: () => "req-conf-1",
    statusPath: "/academy/status-confirmacao",
    logs,
  };
}

describe("GET /api/confirmacao — HEL-M02/M05", () => {
  it("token válido → 302 para página neutra SEM query string", async () => {
    const deps = makeDeps();
    const res = await createConfirmacaoHandler(deps)(makeRequest("token-valido-abc"));
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/academy/status-confirmacao");
    expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("token inválido → MESMO 302 (mesmo Location, status e headers)", async () => {
    const storage: ConfirmacaoStorage = {
      confirmarToken: vi.fn().mockResolvedValue({ ok: true, resultado: "invalido" }),
    };
    const deps = makeDeps({ storage });
    const res = await createConfirmacaoHandler(deps)(makeRequest("token-invalido"));
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/academy/status-confirmacao");
    expect(res.headers.get("Referrer-Policy")).toBe("no-referrer");
  });

  it("token expirado → MESMO 302 (RPC retorna invalido uniforme)", async () => {
    const storage: ConfirmacaoStorage = {
      confirmarToken: vi.fn().mockResolvedValue({ ok: true, resultado: "invalido" }),
    };
    const deps = makeDeps({ storage });
    const res = await createConfirmacaoHandler(deps)(makeRequest("token-expirado"));
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/academy/status-confirmacao");
  });

  it("token reutilizado (replay) → MESMO 302 (M05 — sem oracle)", async () => {
    const storage: ConfirmacaoStorage = {
      confirmarToken: vi.fn().mockResolvedValue({ ok: true, resultado: "invalido" }),
    };
    const deps = makeDeps({ storage });
    const res = await createConfirmacaoHandler(deps)(makeRequest("token-reusado"));
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/academy/status-confirmacao");
  });

  it("a URL final NÃO contém o token (M02)", async () => {
    const deps = makeDeps();
    const res = await createConfirmacaoHandler(deps)(makeRequest("token-secreto-xyz"));
    expect(res.headers.get("Location")).not.toContain("token-secreto-xyz");
  });

  it("token ausente → mesmo 302 (sem enumeração)", async () => {
    const deps = makeDeps();
    const res = await createConfirmacaoHandler(deps)(makeRequest(null));
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/academy/status-confirmacao");
  });

  it("rate limit → 429 genérico (não revela estado do token)", async () => {
    const storage: ConfirmacaoStorage = {
      confirmarToken: vi.fn().mockResolvedValue({ ok: false, razao: "rate_limited" }),
    };
    const deps = makeDeps({ storage });
    const res = await createConfirmacaoHandler(deps)(makeRequest("token-qualquer"));
    expect(res.status).toBe(429);
    expect(res.headers.get("Location")).toBeNull();
  });

  it("erro de storage → fail closed: mesmo 302 neutro (não vaza erro)", async () => {
    const storage: ConfirmacaoStorage = {
      confirmarToken: vi.fn().mockResolvedValue({ ok: false, razao: "http_500" }),
    };
    const deps = makeDeps({ storage });
    const res = await createConfirmacaoHandler(deps)(makeRequest("token-qualquer"));
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/academy/status-confirmacao");
  });

  it("token NUNCA aparece em logs (M02) — nem query string", async () => {
    const deps = makeDeps();
    await createConfirmacaoHandler(deps)(makeRequest("token-ultra-secreto-42"));
    const logsJson = JSON.stringify(deps.logs);
    expect(logsJson).not.toContain("token-ultra-secreto-42");
    expect(logsJson).not.toContain("?token=");
    expect(logsJson).toContain("confirmacao_checada");
  });

  it("log contém apenas evento/request_id/resultado (sem e-mail)", async () => {
    const deps = makeDeps();
    await createConfirmacaoHandler(deps)(makeRequest("abc"));
    const logsJson = JSON.stringify(deps.logs);
    expect(logsJson).not.toMatch(/@/);
    expect(logsJson).toContain('"resultado":"ok"');
  });

  it("método não-GET → 405", async () => {
    const deps = makeDeps();
    const res = await createConfirmacaoHandler(deps)(
      new Request("https://api.cydef.com.br/confirmacao", { method: "POST" }),
    );
    expect(res.status).toBe(405);
  });
});
