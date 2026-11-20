import { describe, expect, it, vi } from "vitest";
import {
  comCors,
  createCaptureHandler,
  criarEnvioAcesso,
  origensPermitidas,
  type CaptureStorage,
  type EmailServico,
} from "./index.ts";
import type { Carteiro, Servidor } from "../_shared/academy-link.ts";

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
    enviarAcesso: vi.fn().mockResolvedValue({ enviado: true }),
  };
  return {
    storage,
    email,
    hashIp: (ip: string) => Promise.resolve(`hash-${ip}`),
    agora: () => 1_700_000_000_000,
    log: (e: Record<string, unknown>) => logs.push(e),
    novoRequestId: () => "req-teste-1",
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

  it("duplicado também recebe o link de acesso (quem refaz a pré-inscrição não fica sem e-mail)", async () => {
    const storage: CaptureStorage = {
      ...baseDeps().storage,
      captureLead: vi.fn().mockResolvedValue({ ok: true, status: "accepted_duplicate" }),
    };
    const deps = makeDeps({ storage });
    await createCaptureHandler(deps)(makeRequest(payloadValido));
    expect(deps.email.enviarAcesso).toHaveBeenCalledTimes(1);
    const arg = (deps.email.enviarAcesso as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(arg.to).toBe("maria@exemplo.com");
  });

  it("falha no envio do link não muda a resposta (202 genérico)", async () => {
    const deps = makeDeps({
      email: { enviarAcesso: vi.fn().mockRejectedValue(new Error("x")) },
    });
    const res = await createCaptureHandler(deps)(makeRequest(payloadValido));
    expect(res.status).toBe(202);
    expect(deps.logs.some((l) => l.event === "email_nao_enviado")).toBe(true);
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
    expect(deps.email.enviarAcesso).not.toHaveBeenCalled();
  });

  it("nome repassado ao envio sem quebra de linha (L01; o HTML é escapado no modelo)", async () => {
    const deps = makeDeps();
    await createCaptureHandler(deps)(makeRequest({ ...payloadValido, nome: "Maria\r\nBcc: x" }));
    const arg = (deps.email.enviarAcesso as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(arg.nome).not.toMatch(/[\r\n]/);
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
    expect(deps.email.enviarAcesso).toHaveBeenCalledTimes(1);
    expect((deps.email.enviarAcesso as ReturnType<typeof vi.fn>).mock.calls[0][0].to).toBe("a@b.com");
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

describe("CORS do formulario do site (origem cruzada)", () => {
  const ORIGEM = "https://www.cydef.com.br";

  function reqComOrigem(origem: string, metodo = "POST"): Request {
    if (metodo === "OPTIONS") {
      return new Request("https://api.cydef.com.br/capture", { method: metodo, headers: { Origin: origem } });
    }
    return new Request("https://api.cydef.com.br/capture", {
      method: metodo,
      headers: { "Content-Type": "application/json", Origin: origem },
      body: JSON.stringify(payloadValido),
    });
  }

  it("preflight OPTIONS da origem do site responde 204 com Access-Control-Allow-Origin", async () => {
    const res = await comCors(createCaptureHandler(makeDeps()))(reqComOrigem(ORIGEM, "OPTIONS"));
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe(ORIGEM);
    expect(res.headers.get("access-control-allow-methods")).toContain("POST");
    expect(res.headers.get("vary")).toBe("Origin");
  });

  it("preflight de origem desconhecida responde 403 e nao libera CORS", async () => {
    const res = await comCors(createCaptureHandler(makeDeps()))(reqComOrigem("https://evil.example", "OPTIONS"));
    expect(res.status).toBe(403);
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
    expect(await res.json()).toEqual({ erro: "origem_nao_permitida" });
  });

  it("POST aceito da origem do site leva o cabecalho de CORS na resposta", async () => {
    const res = await comCors(createCaptureHandler(makeDeps()))(reqComOrigem(ORIGEM));
    expect(res.status).toBe(202);
    expect(res.headers.get("access-control-allow-origin")).toBe(ORIGEM);
  });

  it("POST de origem desconhecida e recusado antes de tocar o banco", async () => {
    const deps = makeDeps();
    const res = await comCors(createCaptureHandler(deps))(reqComOrigem("https://evil.example"));
    expect(res.status).toBe(403);
    expect(deps.storage.captureLead).not.toHaveBeenCalled();
  });

  it("sem Origin (servidor, curl) o fluxo segue igual e nenhum cabecalho de CORS e inventado", async () => {
    const res = await comCors(createCaptureHandler(makeDeps()))(makeRequest(payloadValido));
    expect(res.status).toBe(202);
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("CAPTURE_ALLOWED_ORIGINS soma origens a lista padrao do site", () => {
    const origens = origensPermitidas("https://preview.cydef.pages.dev, https://www.cydef.com.br");
    expect(origens).toContain("https://www.cydef.com.br");
    expect(origens).toContain("https://preview.cydef.pages.dev");
    expect(origens).toHaveLength(3);
  });
});

describe("envio do link de acesso pela pré-inscrição (mesmo fluxo do Entrar)", () => {
  const PEPPER = "p".repeat(40);
  const URL_PORTAL = "https://academy.cydef.com.br";

  function servidor(over: Partial<Servidor> = {}): Servidor {
    return {
      limite: vi.fn().mockResolvedValue(true),
      elegibilidade: vi.fn().mockResolvedValue({ elegivel: true, user_id: null, aluno: false, lead_id: "lead-1", nome: "Maria Silva" }),
      criarUsuario: vi.fn().mockResolvedValue({ ok: true, userId: "user-1" }),
      provisionarAluno: vi.fn().mockResolvedValue(undefined),
      gerarLink: vi.fn().mockResolvedValue(`${URL_PORTAL}/entrar/retorno?token_hash=abc0123456789abcdef&type=email`),
      enviarPeloSupabase: vi.fn().mockResolvedValue(undefined),
      ...over,
    };
  }

  it("cria o usuário, provisiona o aluno e envia o link de boas-vindas pelo Resend", async () => {
    const sv = servidor();
    const carteiro: Carteiro = { enviar: vi.fn().mockResolvedValue(true) };
    const envio = criarEnvioAcesso({ servidor: sv, carteiro, academyUrl: URL_PORTAL, pepper: PEPPER });
    const r = await envio.enviarAcesso({ to: "Maria@Exemplo.com", nome: "Maria", requestId: "req-1" });
    expect(r.enviado).toBe(true);
    expect(sv.elegibilidade).toHaveBeenCalledWith("maria@exemplo.com");
    expect(sv.criarUsuario).toHaveBeenCalledWith("maria@exemplo.com", "Maria Silva");
    expect(sv.provisionarAluno).toHaveBeenCalledWith("user-1", "lead-1", "Maria Silva");
    expect(sv.gerarLink).toHaveBeenCalledWith("maria@exemplo.com", `${URL_PORTAL}/entrar/retorno`);
    const mail = (carteiro.enviar as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(mail.subject).toContain("Bem-vindo");
    expect(mail.html).toContain("token_hash=abc0123456789abcdef");
    expect(mail.text).toContain("academy.cydef.com.br/entrar");
  });

  it("sem Resend ligado, o Supabase envia o link (como no Entrar)", async () => {
    const sv = servidor();
    const envio = criarEnvioAcesso({ servidor: sv, academyUrl: URL_PORTAL, pepper: PEPPER });
    const r = await envio.enviarAcesso({ to: "maria@exemplo.com", nome: "Maria", requestId: "req-1" });
    expect(r.enviado).toBe(true);
    expect(sv.enviarPeloSupabase).toHaveBeenCalledWith("maria@exemplo.com", `${URL_PORTAL}/entrar/retorno`);
  });

  it("usa a mesma chave de limite por e-mail do Entrar (3 a cada 15 min)", async () => {
    const sv = servidor({ limite: vi.fn().mockResolvedValue(false) });
    const envio = criarEnvioAcesso({ servidor: sv, academyUrl: URL_PORTAL, pepper: PEPPER });
    const r = await envio.enviarAcesso({ to: "maria@exemplo.com", nome: "Maria", requestId: "req-1" });
    expect(r.enviado).toBe(false);
    const [chave, limite, janela] = (sv.limite as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(chave).toMatch(/^em:[0-9a-f]{64}$/);
    expect([limite, janela]).toEqual([3, 900]);
    expect(sv.elegibilidade).not.toHaveBeenCalled();
  });

  it("e-mail não elegível (lead descartado) não recebe nada", async () => {
    const sv = servidor({ elegibilidade: vi.fn().mockResolvedValue({ elegivel: false }) });
    const envio = criarEnvioAcesso({ servidor: sv, academyUrl: URL_PORTAL, pepper: PEPPER });
    const r = await envio.enviarAcesso({ to: "maria@exemplo.com", nome: "Maria", requestId: "req-1" });
    expect(r.enviado).toBe(false);
    expect(sv.criarUsuario).not.toHaveBeenCalled();
  });

  it("configuração incompleta (sem pepper) falha fechado, sem chamar o banco", async () => {
    const sv = servidor();
    const envio = criarEnvioAcesso({ servidor: sv, academyUrl: URL_PORTAL, pepper: undefined });
    const r = await envio.enviarAcesso({ to: "maria@exemplo.com", nome: "Maria", requestId: "req-1" });
    expect(r.enviado).toBe(false);
    expect(sv.limite).not.toHaveBeenCalled();
  });

  it("logs não trazem e-mail, nome nem link", async () => {
    const logs: Record<string, unknown>[] = [];
    const carteiro: Carteiro = { enviar: vi.fn().mockResolvedValue(true) };
    const envio = criarEnvioAcesso({ servidor: servidor(), carteiro, academyUrl: URL_PORTAL, pepper: PEPPER, log: (e) => logs.push(e) });
    await envio.enviarAcesso({ to: "maria@exemplo.com", nome: "Maria", requestId: "req-1" });
    const t = JSON.stringify(logs);
    expect(t).not.toContain("maria@exemplo.com");
    expect(t).not.toContain("Maria");
    expect(t).not.toContain("token_hash");
  });
});
