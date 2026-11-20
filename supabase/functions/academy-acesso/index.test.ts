/**
 * Função academy-acesso: origem, tamanho do corpo, Turnstile, limite de
 * tentativas, resposta neutra (sem revelar quem é aluno), criação do usuário,
 * provisionamento e envio do link, pelo Resend ou pelo Supabase.
 */
import { describe, expect, it, vi } from "vitest";
import { createAcessoHandler, LIMITES_ACESSO, servidorSupabase, type AcessoDeps, type Servidor } from "./index.ts";
import { montarEmailAcesso } from "./email.ts";

const ORIGEM = "https://academy.cydef.com.br";
const PEPPER = "p".repeat(40);
const valido = { email: "Ana@Empresa.com.br", turnstile_token: "tok-ok", request_id: "3f1c2b4a-1111-4222-8333-444455556666" };

function servidor(over: Partial<Servidor> = {}): Servidor {
  return {
    limite: vi.fn().mockResolvedValue(true),
    elegibilidade: vi.fn().mockResolvedValue({ elegivel: true, user_id: null, aluno: false, lead_id: "lead-1", nome: "Ana Souza" }),
    criarUsuario: vi.fn().mockResolvedValue({ ok: true, userId: "user-1" }),
    provisionarAluno: vi.fn().mockResolvedValue(undefined),
    gerarLink: vi.fn().mockResolvedValue("https://academy.cydef.com.br/entrar/retorno?token_hash=abc0123456789abcdef&type=email"),
    enviarPeloSupabase: vi.fn().mockResolvedValue(undefined),
    ...over,
  };
}

function deps(over: Partial<AcessoDeps> = {}) {
  const logs: Record<string, unknown>[] = [];
  const d: AcessoDeps = {
    servidor: servidor(),
    turnstile: { verificar: vi.fn().mockResolvedValue({ ok: true }) },
    origens: [ORIGEM],
    academyUrl: ORIGEM,
    pepper: PEPPER,
    log: (e) => logs.push(e),
    esperar: vi.fn().mockResolvedValue(undefined),
    agora: () => 0,
    ...over,
  };
  return { d, logs };
}

function req(body: unknown, init: { origem?: string; metodo?: string; ct?: string; ip?: string } = {}) {
  return new Request(`${ORIGEM}/functions/v1/academy-acesso`, {
    method: init.metodo ?? "POST",
    headers: {
      origin: init.origem ?? ORIGEM,
      "content-type": init.ct ?? "application/json",
      "x-forwarded-for": init.ip ?? "203.0.113.9",
    },
    body: init.metodo === "OPTIONS" || init.metodo === "GET" ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("academy-acesso: portas de entrada", () => {
  it("recusa origem não permitida e responde ao preflight só da origem certa", async () => {
    const { d } = deps();
    const h = createAcessoHandler(d);
    expect((await h(req(valido, { origem: "https://evil.example" }))).status).toBe(403);
    const pre = await h(req(null, { metodo: "OPTIONS" }));
    expect(pre.status).toBe(204);
    expect(pre.headers.get("Access-Control-Allow-Origin")).toBe(ORIGEM);
  });

  it("fica indisponível sem pepper forte ou com endereço do portal inseguro", async () => {
    expect((await createAcessoHandler(deps({ pepper: "curto" }).d)(req(valido))).status).toBe(503);
    expect((await createAcessoHandler(deps({ academyUrl: "http://academy.cydef.com.br" }).d)(req(valido))).status).toBe(503);
  });

  it("recusa corpo grande, não JSON, e-mail inválido e request_id malformado", async () => {
    const h = createAcessoHandler(deps().d);
    expect((await h(req("x".repeat(LIMITES_ACESSO.corpoMaxBytes + 10)))).status).toBe(413);
    expect((await h(req("{", {}))).status).toBe(400);
    expect((await h(req(valido, { ct: "text/plain" }))).status).toBe(415);
    expect((await h(req({ ...valido, email: "sem-arroba" }))).status).toBe(400);
    expect((await h(req({ ...valido, email: "a@b.com\r\nBcc: x@y.com" }))).status).toBe(400);
    expect((await h(req({ ...valido, request_id: "../../x" }))).status).toBe(400);
  });

  it("Turnstile reprovado: 403 e nada consultado no banco", async () => {
    const { d } = deps({ turnstile: { verificar: vi.fn().mockResolvedValue({ ok: false, razao: "nao_humano" }) } });
    expect((await createAcessoHandler(d)(req(valido))).status).toBe(403);
    expect(d.servidor.elegibilidade).not.toHaveBeenCalled();
  });

  it("limite de tentativas: 429 sem consultar elegibilidade; chaves nunca em claro", async () => {
    const limite = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const { d } = deps({ servidor: servidor({ limite }) });
    expect((await createAcessoHandler(d)(req(valido))).status).toBe(429);
    expect(d.servidor.elegibilidade).not.toHaveBeenCalled();
    const chaves = limite.mock.calls.map((c) => String(c[0]));
    expect(chaves.join(" ")).not.toMatch(/ana@|203\.0\.113/i);
    expect(chaves.every((c) => /^(ip|em):[0-9a-f]{64}$/.test(c))).toBe(true);
  });
});

describe("academy-acesso: resposta neutra", () => {
  it("e-mail sem inscrição recebe o mesmo 202, com o mesmo tempo mínimo, e nada é criado", async () => {
    const s = servidor({ elegibilidade: vi.fn().mockResolvedValue({ elegivel: false }) });
    const { d, logs } = deps({ servidor: s });
    const res = await createAcessoHandler(d)(req(valido));
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ status: "enviado_se_inscrito" });
    expect(d.esperar).toHaveBeenCalledWith(LIMITES_ACESSO.respostaMinimaMs);
    expect(s.criarUsuario).not.toHaveBeenCalled();
    expect(s.enviarPeloSupabase).not.toHaveBeenCalled();
    expect(JSON.stringify(logs)).not.toMatch(/ana@empresa/i);
  });

  it("falha depois da elegibilidade também responde 202 (não revela que o e-mail é de aluno)", async () => {
    const s = servidor({ enviarPeloSupabase: vi.fn().mockRejectedValue(new Error("otp_500")) });
    const { d, logs } = deps({ servidor: s });
    const res = await createAcessoHandler(d)(req(valido));
    expect(res.status).toBe(202);
    expect(logs.some((l) => l.event === "acesso_entrega_falhou")).toBe(true);
  });
});

describe("academy-acesso: entrega do link", () => {
  it("pré-inscrito sem usuário: cria o usuário, provisiona o aluno e o Supabase envia o link de retorno fixo", async () => {
    const s = servidor();
    const { d } = deps({ servidor: s });
    const res = await createAcessoHandler(d)(req(valido));
    expect(res.status).toBe(202);
    expect(s.elegibilidade).toHaveBeenCalledWith("ana@empresa.com.br");
    expect(s.criarUsuario).toHaveBeenCalledWith("ana@empresa.com.br", "Ana Souza");
    expect(s.provisionarAluno).toHaveBeenCalledWith("user-1", "lead-1", "Ana Souza");
    expect(s.enviarPeloSupabase).toHaveBeenCalledWith("ana@empresa.com.br", `${ORIGEM}/entrar/retorno`);
  });

  it("aluno existente: não cria nem provisiona de novo", async () => {
    const s = servidor({ elegibilidade: vi.fn().mockResolvedValue({ elegivel: true, user_id: "user-9", aluno: true, lead_id: "lead-9", nome: "Bia" }) });
    await createAcessoHandler(deps({ servidor: s }).d)(req(valido));
    expect(s.criarUsuario).not.toHaveBeenCalled();
    expect(s.provisionarAluno).not.toHaveBeenCalled();
    expect(s.enviarPeloSupabase).toHaveBeenCalled();
  });

  it("corrida na criação do usuário: busca o id existente e segue", async () => {
    const elegibilidade = vi
      .fn()
      .mockResolvedValueOnce({ elegivel: true, user_id: null, aluno: false, lead_id: "lead-1", nome: "Ana" })
      .mockResolvedValueOnce({ elegivel: true, user_id: "user-7", aluno: false, lead_id: "lead-1", nome: "Ana" });
    const s = servidor({ elegibilidade, criarUsuario: vi.fn().mockResolvedValue({ ok: false, jaExiste: true }) });
    await createAcessoHandler(deps({ servidor: s }).d)(req(valido));
    expect(s.provisionarAluno).toHaveBeenCalledWith("user-7", "lead-1", "Ana");
  });

  it("com o Resend ligado, gera o link e envia com o modelo da CyDef", async () => {
    const s = servidor();
    const carteiro = { enviar: vi.fn().mockResolvedValue(true) };
    await createAcessoHandler(deps({ servidor: s, carteiro }).d)(req(valido));
    expect(s.gerarLink).toHaveBeenCalledWith("ana@empresa.com.br", `${ORIGEM}/entrar/retorno`);
    expect(s.enviarPeloSupabase).not.toHaveBeenCalled();
    const mail = carteiro.enviar.mock.calls[0]![0];
    expect(mail.to).toBe("ana@empresa.com.br");
    expect(mail.html).toContain("Entrar na Academy");
  });

  it("o cliente não escolhe o destino do link", async () => {
    const s = servidor();
    await createAcessoHandler(deps({ servidor: s }).d)(req({ ...valido, redirect_to: "https://evil.example" }));
    expect(s.enviarPeloSupabase).toHaveBeenCalledWith(expect.any(String), `${ORIGEM}/entrar/retorno`);
  });
});

describe("modelo do e-mail", () => {
  it("escapa o nome e o link e usa só o primeiro nome", () => {
    const m = montarEmailAcesso({ to: "a@b.com", nome: "<script>x</script> Silva", link: 'https://x/"><img>', validadeMin: 60 });
    expect(m.html).not.toContain("<script>");
    expect(m.html).not.toContain('"><img>');
    expect(m.html).not.toContain("Silva");
    expect(m.text).toContain("60 minutos");
  });
});

describe("ligação com o Supabase", () => {
  it("monta o link do e-mail no domínio do portal, com o token de uso único", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ properties: { action_link: "https://proj.supabase.co/auth/v1/verify?token=x", hashed_token: "a1b2c3d4e5f6a7b8c9d0e1f2" } }), { status: 200 }),
    );
    const s = servidorSupabase("https://proj.supabase.co", "chave", fetchImpl as unknown as typeof fetch);
    const link = await s.gerarLink("a@b.com", `${ORIGEM}/entrar/retorno`);
    expect(link).toBe(`${ORIGEM}/entrar/retorno?token_hash=a1b2c3d4e5f6a7b8c9d0e1f2&type=email`);
    expect(link).not.toContain("supabase.co");
  });

  it("recusa resposta sem token ou com token fora do formato", async () => {
    for (const corpo of [{ properties: { action_link: "https://outro.example/verify" } }, { properties: { hashed_token: "../../x" } }]) {
      const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify(corpo), { status: 200 }));
      const s = servidorSupabase("https://proj.supabase.co", "chave", fetchImpl as unknown as typeof fetch);
      await expect(s.gerarLink("a@b.com", `${ORIGEM}/entrar/retorno`)).rejects.toThrow("gerar_link_resposta");
    }
  });

  it("pede o envio pelo Supabase sem criar usuário e com o retorno fixo", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    const s = servidorSupabase("https://proj.supabase.co", "chave", fetchImpl as unknown as typeof fetch);
    await s.enviarPeloSupabase("a@b.com", `${ORIGEM}/entrar/retorno`);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(String(url)).toBe(`https://proj.supabase.co/auth/v1/otp?redirect_to=${encodeURIComponent(`${ORIGEM}/entrar/retorno`)}`);
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({ email: "a@b.com", create_user: false });
  });
});

describe("comprador da Hotmart sem pré-inscrição (fase 16)", () => {
  it("vira aluno sem lead e recebe o link", async () => {
    const sv = servidor({
      elegibilidade: vi.fn().mockResolvedValue({ elegivel: true, user_id: null, aluno: false, lead_id: null, comprador: true, nome: "Bia" }),
    });
    const { d } = deps({ servidor: sv });
    const res = await createAcessoHandler(d)(
      new Request("https://x/functions/v1/academy-acesso", {
        method: "POST",
        headers: { "content-type": "application/json", origin: ORIGEM },
        body: JSON.stringify(valido),
      }),
    );
    expect(res.status).toBe(202);
    expect(sv.provisionarAluno).toHaveBeenCalledWith("user-1", null, "Bia");
    expect(sv.enviarPeloSupabase).toHaveBeenCalled();
  });

  it("sem lead e sem compra continua sem link", async () => {
    const sv = servidor({ elegibilidade: vi.fn().mockResolvedValue({ elegivel: true, user_id: null, aluno: false, lead_id: null, nome: "" }) });
    const { d, logs } = deps({ servidor: sv });
    await createAcessoHandler(d)(
      new Request("https://x/functions/v1/academy-acesso", {
        method: "POST",
        headers: { "content-type": "application/json", origin: ORIGEM },
        body: JSON.stringify(valido),
      }),
    );
    expect(sv.provisionarAluno).not.toHaveBeenCalled();
    expect(logs).toContainEqual(expect.objectContaining({ event: "acesso_entrega_falhou", razao: "sem_lead" }));
  });
});
