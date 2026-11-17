import { describe, expect, it, vi } from "vitest";
import { createContatoHandler, type ContatoDeps, type ContatoStorage, type ContatoEmail } from "./index.ts";
import type { EmailInterno } from "../../../src/lib/contato/email.ts";

/**
 * Matriz de segurança da Edge Function `contato`: origem, métodos, tipo e
 * tamanho do corpo, armadilhas de robô, Turnstile, validação, rate limit,
 * disjuntor, dedupe, falha de e-mail e ausência de PII nos logs.
 */

const ORIGEM = "https://www.cydef.com.br";
const PEPPER = "p".repeat(40);

function req(body: unknown, o: { origin?: string | null; method?: string; ct?: string; headers?: Record<string, string> } = {}) {
  const headers: Record<string, string> = { "Content-Type": o.ct ?? "application/json", ...(o.headers ?? {}) };
  if (o.origin !== null) headers.Origin = o.origin ?? ORIGEM;
  const init: RequestInit = { method: o.method ?? "POST", headers };
  if ((o.method ?? "POST") === "POST") init.body = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("https://ref.supabase.co/functions/v1/contato", init);
}

const valido = {
  nome: "Maria Souza",
  cargo: "Gerente de TI",
  empresa: "Acme Logística Ltda.",
  email: "maria@acme.com.br",
  mensagem: "Queremos estruturar um SOC com monitoramento 24x7 para 300 servidores.",
  aceito: true,
  triagem: { motivo: "consultoria", area: "soc_siem", porte: "201_1000", prazo: "ate_3_meses" },
  honeypot: "",
  tempo_ms: 25_000,
  turnstile_token: "tok-ok",
  request_id: "3f1c2b4a-8d7e-4f6a-9b1c-2d3e4f5a6b7c",
};

function deps(over: Partial<ContatoDeps> = {}) {
  const logs: Array<Record<string, unknown>> = [];
  const enviados: EmailInterno[] = [];
  const storage: ContatoStorage = {
    registrar: vi.fn().mockResolvedValue({ ok: true, status: "accepted" }),
    marcar: vi.fn().mockResolvedValue(undefined),
  };
  const email: ContatoEmail = {
    enviar: vi.fn(async (m: EmailInterno) => {
      enviados.push(m);
      return { enviado: true };
    }),
  };
  const d: ContatoDeps = {
    storage,
    email,
    turnstile: { verificar: vi.fn().mockResolvedValue({ ok: true }) },
    origens: [ORIGEM, "https://cydef.com.br"],
    pepper: PEPPER,
    destino: "contato@cydef.com.br",
    emailHabilitado: true,
    agora: () => new Date("2026-11-16T12:00:00Z"),
    log: (e) => logs.push(e),
    novoRequestId: () => "evt-1",
    ...over,
  };
  return { d, logs, enviados, storage, email };
}

describe("contato — origem e protocolo", () => {
  it("preflight de origem permitida: 204 com CORS restrito", async () => {
    const { d } = deps();
    const res = await createContatoHandler(d)(req(null, { method: "OPTIONS" }));
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe(ORIGEM);
    expect(res.headers.get("access-control-allow-methods")).toBe("POST, OPTIONS");
  });

  it("origem desconhecida: 403 no preflight e no POST, sem CORS", async () => {
    const { d, storage } = deps();
    const h = createContatoHandler(d);
    const pre = await h(req(null, { method: "OPTIONS", origin: "https://evil.example" }));
    expect(pre.status).toBe(403);
    expect(pre.headers.get("access-control-allow-origin")).toBeNull();
    const post = await h(req(valido, { origin: "https://evil.example" }));
    expect(post.status).toBe(403);
    const semOrigem = await h(req(valido, { origin: null }));
    expect(semOrigem.status).toBe(403);
    expect(storage.registrar).not.toHaveBeenCalled();
  });

  it("GET: 405", async () => {
    const { d } = deps();
    expect((await createContatoHandler(d)(req(null, { method: "GET" }))).status).toBe(405);
  });

  it("Content-Type diferente de JSON: 415", async () => {
    const { d } = deps();
    expect((await createContatoHandler(d)(req("a=b", { ct: "application/x-www-form-urlencoded" }))).status).toBe(415);
  });

  it("corpo acima de 8 KB: 413 (declarado e real)", async () => {
    const { d } = deps();
    const h = createContatoHandler(d);
    const grande = { ...valido, mensagem: "x".repeat(9000) };
    expect((await h(req(grande))).status).toBe(413);
    expect((await h(req(valido, { headers: { "Content-Length": "999999" } }))).status).toBe(413);
  });

  it("JSON inválido ou array: 400 genérico", async () => {
    const { d } = deps();
    const h = createContatoHandler(d);
    expect((await h(req("{nao json"))).status).toBe(400);
    expect((await h(req([1, 2]))).status).toBe(400);
  });
});

describe("contato — fail closed de configuração", () => {
  it.each([
    ["sem pepper", { pepper: undefined }],
    ["pepper curto", { pepper: "curto" }],
    ["sem destino", { destino: undefined }],
    ["envio desligado", { emailHabilitado: false }],
  ])("%s: 503 sem processar", async (_n, over) => {
    const { d, storage } = deps(over as Partial<ContatoDeps>);
    const res = await createContatoHandler(d)(req(valido));
    expect(res.status).toBe(503);
    expect(storage.registrar).not.toHaveBeenCalled();
  });
});

describe("contato — armadilhas de robô (resposta idêntica ao sucesso)", () => {
  it("honeypot preenchido: 202 sem Turnstile, sem banco, sem e-mail", async () => {
    const { d, storage, email } = deps();
    const res = await createContatoHandler(d)(req({ ...valido, honeypot: "http://spam" }));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ status: "recebido" });
    expect(d.turnstile.verificar).not.toHaveBeenCalled();
    expect(storage.registrar).not.toHaveBeenCalled();
    expect(email.enviar).not.toHaveBeenCalled();
  });

  it("preenchido rápido demais (< 4 s): 202 silencioso", async () => {
    const { d, email } = deps();
    const res = await createContatoHandler(d)(req({ ...valido, tempo_ms: 800 }));
    expect(res.status).toBe(202);
    expect(email.enviar).not.toHaveBeenCalled();
  });

  it("request_id fora do formato UUID v4: 400", async () => {
    const { d } = deps();
    expect((await createContatoHandler(d)(req({ ...valido, request_id: "abc" }))).status).toBe(400);
  });
});

describe("contato — Turnstile e validação", () => {
  it("Turnstile reprovado: 403 verificacao_falhou, nada gravado", async () => {
    const { d, storage } = deps({ turnstile: { verificar: vi.fn().mockResolvedValue({ ok: false, razao: "nao_humano" }) } });
    const res = await createContatoHandler(d)(req(valido));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ erro: "verificacao_falhou" });
    expect(storage.registrar).not.toHaveBeenCalled();
  });

  it("usa o request_id como idempotency_key do Turnstile", async () => {
    const { d } = deps();
    await createContatoHandler(d)(req(valido));
    expect(d.turnstile.verificar).toHaveBeenCalledWith(expect.objectContaining({ token: "tok-ok", idempotencyKey: valido.request_id }));
  });

  it("e-mail descartável: 400 email_nao_aceito", async () => {
    const { d } = deps();
    const res = await createContatoHandler(d)(req({ ...valido, email: "x@mailinator.com" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ erro: "email_nao_aceito" });
  });

  it("mais de 2 links: 400 links_demais", async () => {
    const { d } = deps();
    const msg = "veja https://a.com e https://b.com e https://c.com por favor, urgente";
    const res = await createContatoHandler(d)(req({ ...valido, mensagem: msg }));
    expect(await res.json()).toEqual({ erro: "links_demais" });
  });

  it("HTML na mensagem, CRLF no nome ou triagem forjada: 400 genérico sem refletir entrada", async () => {
    const { d } = deps();
    const h = createContatoHandler(d);
    for (const p of [
      { ...valido, mensagem: "<script>alert(1)</script> mensagem longa o suficiente" },
      { ...valido, nome: "Maria\r\nBcc: alvo@x.com" },
      { ...valido, triagem: { motivo: "consultoria", area: "soc_siem", porte: "201_1000", prazo: "ate_3_meses", prioridade: "P1" } },
      { ...valido, triagem: { motivo: "academy" } },
      { ...valido, aceito: false },
    ]) {
      const res = await h(req(p));
      expect(res.status).toBe(400);
      const txt = await res.text();
      expect(txt).not.toContain("script");
      expect(txt).not.toContain("Bcc");
    }
  });
});

describe("contato — rate limit, disjuntor e dedupe", () => {
  it("rate limited: 429 sem e-mail", async () => {
    const { d, email } = deps();
    (d.storage.registrar as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, status: "rate_limited" });
    const res = await createContatoHandler(d)(req(valido));
    expect(res.status).toBe(429);
    expect(email.enviar).not.toHaveBeenCalled();
  });

  it("disjuntor global: 503 capacidade", async () => {
    const { d } = deps();
    (d.storage.registrar as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, status: "capacidade" });
    const res = await createContatoHandler(d)(req(valido));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ erro: "capacidade" });
  });

  it("duplicado: 202 idêntico sem novo e-mail", async () => {
    const { d, email } = deps();
    (d.storage.registrar as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, status: "accepted_duplicate" });
    const res = await createContatoHandler(d)(req(valido));
    expect(res.status).toBe(202);
    expect(email.enviar).not.toHaveBeenCalled();
  });

  it("banco indisponível: 503 fail closed", async () => {
    const { d } = deps();
    (d.storage.registrar as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, razao: "http_500" });
    expect((await createContatoHandler(d)(req(valido))).status).toBe(503);
  });

  it("banco recebe só hashes HMAC de 64 hex, nunca e-mail em claro", async () => {
    const { d, storage } = deps();
    await createContatoHandler(d)(req(valido));
    const arg = (storage.registrar as ReturnType<typeof vi.fn>).mock.calls[0][0];
    for (const k of ["ipHash", "emailHash", "conteudoHash"]) expect(arg[k]).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(arg)).not.toContain("maria@acme.com.br");
    expect(arg.prioridade).toBe("P2"); // porte 201-1000 → P2 (calculado no servidor)
  });
});

describe("contato — envio do e-mail interno", () => {
  it("202 e e-mail ao time com Reply-To do visitante e assunto classificado", async () => {
    const { d, enviados, storage } = deps();
    const res = await createContatoHandler(d)(req(valido, { headers: { "x-forwarded-for": "203.0.113.9" } }));
    expect(res.status).toBe(202);
    expect(res.headers.get("access-control-allow-origin")).toBe(ORIGEM);
    expect(enviados).toHaveLength(1);
    expect(enviados[0].to).toBe("contato@cydef.com.br");
    expect(enviados[0].replyTo).toBe("maria@acme.com.br");
    expect(enviados[0].subject).toBe("[Site CyDef · P2 · Consultoria] Acme Logística Ltda.");
    expect(storage.marcar).toHaveBeenCalledWith({ requestId: valido.request_id, status: "enviado" });
  });

  it("incidente ativo vira P1", async () => {
    const { d, enviados } = deps();
    await createContatoHandler(d)(req({ ...valido, triagem: { motivo: "incidente", urgencia: "ativo_agora", porte: "ate_50" } }));
    expect(enviados[0].subject.startsWith("[Site CyDef · P1 · Incidente de segurança]")).toBe(true);
  });

  it("links neutralizados no corpo do e-mail", async () => {
    const { d, enviados } = deps();
    await createContatoHandler(d)(req({ ...valido, mensagem: "Nosso portal https://portal.acme.com.br/login está fora do ar desde ontem." }));
    expect(enviados[0].text).toContain("hxxps://portal[.]acme[.]com[.]br/login");
    expect(enviados[0].html).not.toContain("https://portal.acme");
  });

  it("falha do provedor de e-mail: 503 e status falha_envio", async () => {
    const { d, storage } = deps({ email: { enviar: vi.fn().mockResolvedValue({ enviado: false }) } });
    const res = await createContatoHandler(d)(req(valido));
    expect(res.status).toBe(503);
    expect(storage.marcar).toHaveBeenCalledWith({ requestId: valido.request_id, status: "falha_envio" });
  });

  it("logs sem nome, e-mail, empresa ou mensagem", async () => {
    const { d, logs } = deps();
    await createContatoHandler(d)(req(valido));
    const s = JSON.stringify(logs);
    for (const pii of ["Maria", "maria@acme", "Acme", "SOC com monitoramento"]) expect(s).not.toContain(pii);
  });
});
