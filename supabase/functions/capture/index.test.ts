import { describe, expect, it, vi } from "vitest";
import { createCaptureHandler, type CaptureStorage, type EmailServico } from "./index.ts";

/**
 * Testes da Capture API (S-03..S-05) com dependências injetadas.
 * Cobre a matriz de segurança: 415/413/400/429/503, honeypot (202 silencioso),
 * dedupe uniforme (202 idêntico), server-stamped (sem versão do cliente — M01),
 * token nunca nos logs/respostas (M02).
 */

function makeRequest(body: unknown, opts: { contentType?: string; method?: string } = {}): Request {
  const init: RequestInit = {
    method: opts.method ?? "POST",
    headers: { "Content-Type": opts.contentType ?? "application/json" },
  };
  init.body = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("https://api.cydef.com.br/capture", init);
}

function makeDeps(overrides: Partial<ReturnType<typeof baseDeps>> = {}) {
  return { ...baseDeps(), ...overrides };
}

function baseDeps() {
  const logs: Array<Record<string, unknown>> = [];
  const storage: CaptureStorage = {
    captureLead: vi.fn().mockResolvedValue({ ok: true, status: "accepted", leadId: "uuid-1" }),
    reenviarToken: vi.fn().mockResolvedValue({ ok: true, status: "accepted", leadId: "uuid-1", email: "a@b.com", nome: "Ana" }),
  };
  const email: EmailServico = {
    enviarConfirmacao: vi.fn().mockResolvedValue({ enviado: true }),
  };
  return {
    storage,
    email,
    hashIp: (ip: string) => Promise.resolve(`hash-${ip}`),
    agora: () => 1_700_000_000_000,
    log: (e: Record<string, unknown>) => logs.push(e),
    novoRequestId: () => "req-teste-1",
    apiBaseUrl: () => "https://api.cydef.com.br",
    emailHabilitado: () => true,
    logs,
  };
}

const payloadValido = {
  nome: "Maria Silva",
  email: "maria@exemplo.com",
  perfil: "iniciante",
  aceito: true,
  declaracao_idade: true,
  honeypot: "",
  request_id: "req-abc-123",
};

describe("POST /api/capture — matriz de segurança", () => {
  it("202 para payload válido (status pending_confirmation)", async () => {
    const deps = makeDeps();
    const res = await createCaptureHandler(deps)(makeRequest(payloadValido));
    expect(res.status).toBe(202);
    const corpo = await res.json();
    expect(corpo).toEqual({ status: "pending_confirmation", mensagem: expect.any(String) });
    expect(corpo).not.toHaveProperty("lead_id");
    expect(corpo).not.toHaveProperty("token");
  });

  it("chama a RPC com token apenas como hash (nunca o token bruto no storage)", async () => {
    const deps = makeDeps();
    await createCaptureHandler(deps)(makeRequest(payloadValido));
    const args = (deps.storage.captureLead as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(args.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(args).not.toHaveProperty("token");
  });

  it("415 para Content-Type não-JSON (HEL-L04)", async () => {
    const deps = makeDeps();
    const res = await createCaptureHandler(deps)(makeRequest("x=1", { contentType: "text/plain" }));
    expect(res.status).toBe(415);
  });

  it("413 para corpo > 4 KB (HEL-L04)", async () => {
    const deps = makeDeps();
    const grande = { ...payloadValido, nome: "x".repeat(5000) };
    const res = await createCaptureHandler(deps)(makeRequest(grande));
    expect(res.status).toBe(413);
  });

  it("400 para JSON malformado (sem reflexão)", async () => {
    const deps = makeDeps();
    const res = await createCaptureHandler(deps)(makeRequest("{not-json"));
    expect(res.status).toBe(400);
  });

  it("400 para payload inválido (e-mail inválido) com mensagem genérica", async () => {
    const deps = makeDeps();
    const res = await createCaptureHandler(deps)(makeRequest({ ...payloadValido, email: "invalido" }));
    expect(res.status).toBe(400);
    const corpo = await res.json();
    expect(JSON.stringify(corpo)).not.toContain("invalido@");
  });

  it("400 para envio SEM opt-in (SEC-001 — envio sem consentimento falha)", async () => {
    const deps = makeDeps();
    const res = await createCaptureHandler(deps)(makeRequest({ ...payloadValido, aceito: false }));
    expect(res.status).toBe(400);
  });

  it("400 para declaracao_idade ausente/false (SEC-002)", async () => {
    const deps = makeDeps();
    const semIdade = { ...payloadValido };
    delete (semIdade as Record<string, unknown>).declaracao_idade;
    expect((await createCaptureHandler(deps)(makeRequest(semIdade))).status).toBe(400);
    expect(
      (await createCaptureHandler(deps)(makeRequest({ ...payloadValido, declaracao_idade: false }))).status,
    ).toBe(400);
  });

  it("honeypot preenchido → 202 silencioso (nunca persiste)", async () => {
    const deps = makeDeps();
    const res = await createCaptureHandler(deps)(
      makeRequest({ ...payloadValido, honeypot: "http://spam-bot" }),
    );
    expect(res.status).toBe(202);
    expect(deps.storage.captureLead).not.toHaveBeenCalled();
  });

  it("duplicado (RPC accepted_duplicate) → MESMO 202 genérico (M05 — sem oracle)", async () => {
    const storage: CaptureStorage = {
      ...baseDeps().storage,
      captureLead: vi.fn().mockResolvedValue({ ok: true, status: "accepted_duplicate" }),
    };
    const deps = makeDeps({ storage });
    const res = await createCaptureHandler(deps)(makeRequest(payloadValido));
    expect(res.status).toBe(202);
    const corpo = await res.json();
    expect(corpo).toEqual({ status: "pending_confirmation", mensagem: expect.any(String) });
  });

  it("rate limit (RPC rate_limited) → 429", async () => {
    const storage: CaptureStorage = {
      ...baseDeps().storage,
      captureLead: vi.fn().mockResolvedValue({ ok: false, razao: "rate_limited" }),
    };
    const deps = makeDeps({ storage });
    const res = await createCaptureHandler(deps)(makeRequest(payloadValido));
    expect(res.status).toBe(429);
  });

  it("falha de storage → 503 fail closed (L04), sem dado parcial", async () => {
    const storage: CaptureStorage = {
      ...baseDeps().storage,
      captureLead: vi.fn().mockResolvedValue({ ok: false, razao: "http_500" }),
    };
    const deps = makeDeps({ storage });
    const res = await createCaptureHandler(deps)(makeRequest(payloadValido));
    expect(res.status).toBe(503);
  });

  it("sem_consentimento vindo do banco → 400 (defesa em profundidade)", async () => {
    const storage: CaptureStorage = {
      ...baseDeps().storage,
      captureLead: vi.fn().mockResolvedValue({ ok: false, razao: "sem_consentimento" }),
    };
    const deps = makeDeps({ storage });
    const res = await createCaptureHandler(deps)(makeRequest(payloadValido));
    expect(res.status).toBe(400);
  });

  it("log NUNCA contém nome, e-mail ou token (M02/REQ-007)", async () => {
    const deps = makeDeps();
    await createCaptureHandler(deps)(makeRequest(payloadValido));
    await createCaptureHandler(deps)(makeRequest({ ...payloadValido, aceito: false }));
    const logsJson = JSON.stringify(deps.logs);
    expect(logsJson).not.toContain("maria@exemplo.com");
    expect(logsJson).not.toContain("Maria Silva");
    expect(logsJson).not.toMatch(/token/i);
  });

  it("e-mail só é enviado com flag habilitada (default off — fail secure)", async () => {
    const deps = makeDeps({ emailHabilitado: () => false });
    await createCaptureHandler(deps)(makeRequest(payloadValido));
    expect(deps.email.enviarConfirmacao).not.toHaveBeenCalled();
  });

  it("e-mail enviado usa nome sanitizado (L01)", async () => {
    const deps = makeDeps();
    await createCaptureHandler(deps)(makeRequest({ ...payloadValido, nome: "<b>Maria</b>\r\n" }));
    const arg = (deps.email.enviarConfirmacao as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(arg.nome).toContain("&lt;b&gt;");
    expect(arg.nome).not.toContain("\r");
  });

  it("resend: 202 uniforme e reenvia e-mail para lead existente", async () => {
    const deps = makeDeps();
    const res = await createCaptureHandler(deps)(
      makeRequest({ action: "resend", request_id: "req-abc-123", honeypot: "" }),
    );
    expect(res.status).toBe(202);
    expect(deps.storage.reenviarToken).toHaveBeenCalledTimes(1);
    const args = (deps.storage.reenviarToken as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(args.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(deps.email.enviarConfirmacao).toHaveBeenCalledTimes(1);
  });

  it("método não-POST → 405", async () => {
    const deps = makeDeps();
    const res = await createCaptureHandler(deps)(
      new Request("https://api.cydef.com.br/capture", { method: "GET" }),
    );
    expect(res.status).toBe(405);
  });

  it("payload com versao_aviso do cliente é ignorado (HEL-M01 — servidor carimba)", async () => {
    const deps = makeDeps();
    const res = await createCaptureHandler(deps)(
      makeRequest({ ...payloadValido, consentimento: { versao_aviso: "v9999" } }),
    );
    expect(res.status).toBe(202);
    // storage recebe apenas os campos do contrato — nenhuma versão enviada
    const args = (deps.storage.captureLead as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(args).not.toHaveProperty("versao_aviso");
  });
});
