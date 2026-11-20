/**
 * Função academy-empresa (fase 17): origem, sessão, permissão conferida pelo
 * banco com o token de quem chamou, e-mail do convite e marcação do enviado.
 */
import { describe, expect, it, vi } from "vitest";
import { bancoSupabase, createEmpresaHandler, ErroBanco, type BancoEmpresa, type ConvitesPendentes, type EmpresaDeps } from "./index.ts";
import { montarConvite } from "./email.ts";

const ORIGEM = "https://academy.cydef.com.br";
const JWT = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1In0.assinatura";
const EMPRESA = "0b7e2c1a-1111-4222-8333-444455556666";

const pendentes: ConvitesPendentes = {
  empresa: "Banco Exemplo",
  alvo: "Plataforma toda",
  fim: "2027-05-31",
  quem_convida: "Carla Gestora",
  convites: [
    { id: "m1", email: "ana@banco.com", gestor: false },
    { id: "m2", email: "bruno@banco.com", gestor: true },
  ],
};

function deps(over: Partial<EmpresaDeps> = {}) {
  const logs: Record<string, unknown>[] = [];
  const banco = {
    pendentes: vi.fn<BancoEmpresa["pendentes"]>().mockResolvedValue(pendentes),
    marcar: vi.fn<BancoEmpresa["marcar"]>().mockResolvedValue(2),
  };
  const carteiro = { enviar: vi.fn().mockResolvedValue(true) };
  const d: EmpresaDeps = { banco, origens: [ORIGEM], carteiro, academyUrl: ORIGEM, log: (e) => logs.push(e), novoRequestId: () => "req-1", ...over };
  return { d, logs, banco, carteiro };
}

const post = (corpo: unknown, headers: Record<string, string> = {}) =>
  new Request("https://x/functions/v1/academy-empresa", {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGEM, authorization: `Bearer ${JWT}`, ...headers },
    body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
  });

describe("academy-empresa: portas de entrada", () => {
  it("recusa origem não permitida e responde ao preflight só da origem certa", async () => {
    const { d, banco } = deps();
    const h = createEmpresaHandler(d);
    expect((await h(post({ empresa_id: EMPRESA }, { origin: "https://evil.example" }))).status).toBe(403);
    const pre = await h(new Request("https://x", { method: "OPTIONS", headers: { origin: ORIGEM } }));
    expect(pre.status).toBe(204);
    expect(pre.headers.get("access-control-allow-origin")).toBe(ORIGEM);
    expect(banco.pendentes).not.toHaveBeenCalled();
  });

  it("exige sessão, POST e um uuid", async () => {
    const { d, banco } = deps();
    const h = createEmpresaHandler(d);
    expect((await h(post({ empresa_id: EMPRESA }, { authorization: "" }))).status).toBe(401);
    expect((await h(new Request("https://x", { method: "GET", headers: { origin: ORIGEM, authorization: `Bearer ${JWT}` } }))).status).toBe(405);
    expect((await h(post({ empresa_id: "1; drop" }))).status).toBe(400);
    expect((await h(post("{"))).status).toBe(400);
    expect((await h(post({ empresa_id: EMPRESA, x: "a".repeat(2000) }))).status).toBe(413);
    expect(banco.pendentes).not.toHaveBeenCalled();
  });

  it("sem permissão no banco: 403 com o código, sem e-mail", async () => {
    const { d, carteiro } = deps({
      banco: { pendentes: vi.fn().mockRejectedValue(new ErroBanco("sem_permissao", 400)), marcar: vi.fn() },
    });
    const res = await createEmpresaHandler(d)(post({ empresa_id: EMPRESA }));
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ erro: "sem_permissao" });
    expect(carteiro.enviar).not.toHaveBeenCalled();
  });

  it("falha do banco: 503", async () => {
    const { d } = deps({ banco: { pendentes: vi.fn().mockRejectedValue(new Error("rede")), marcar: vi.fn() } });
    expect((await createEmpresaHandler(d)(post({ empresa_id: EMPRESA }))).status).toBe(503);
  });
});

describe("academy-empresa: envio", () => {
  it("envia um e-mail por convite com o token de quem chamou e marca só os que saíram", async () => {
    const { d, banco, carteiro, logs } = deps();
    carteiro.enviar.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const res = await createEmpresaHandler(d)(post({ empresa_id: EMPRESA }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ enviados: 1, falhas: 1, pendentes: 1, email: "ligado" });
    expect(banco.pendentes).toHaveBeenCalledWith(JWT, EMPRESA);
    expect(banco.marcar).toHaveBeenCalledWith(JWT, EMPRESA, ["m1"]);
    expect(carteiro.enviar.mock.calls.map((c) => (c[0] as { to: string }).to)).toEqual(["ana@banco.com", "bruno@banco.com"]);
    expect(JSON.stringify(logs)).not.toMatch(/@banco\.com/);
  });

  it("com o e-mail desligado não marca nada", async () => {
    const { d, banco } = deps({ carteiro: undefined });
    const res = await createEmpresaHandler(d)(post({ empresa_id: EMPRESA }));
    expect(await res.json()).toEqual({ enviados: 0, falhas: 0, pendentes: 2, email: "desligado" });
    expect(banco.marcar).not.toHaveBeenCalled();
  });
});

describe("modelo do convite", () => {
  it("escapa o que vem do banco, diz o que a empresa verá e não leva link de login", () => {
    const m = montarConvite({
      to: "ana@banco.com", empresa: "Banco <b>Exemplo</b>", alvo: "Plataforma toda", fim: "2027-05-31",
      quemConvida: "Carla\r\nBcc: x@y.com", gestor: false, academyUrl: ORIGEM,
    });
    expect(m.subject).toBe("Banco <b>Exemplo</b> convidou você para a CyDef Academy");
    expect(m.subject).not.toMatch(/[\r\n]/);
    expect(m.html).toContain("Banco &lt;b&gt;Exemplo&lt;/b&gt;");
    expect(m.html).toContain("até 31/05/2027");
    expect(m.text).toContain("acompanhar o seu progresso");
    expect(m.text).toContain(`${ORIGEM}/entrar`);
    expect(m.html).not.toMatch(/token|type=email/);
    expect(montarConvite({ ...{ to: "b@b.com", empresa: "E", alvo: "A", fim: "", quemConvida: "Q", academyUrl: ORIGEM }, gestor: true }).text).toContain("gestão da equipe");
  });
});

describe("ligação com o Supabase", () => {
  it("chama a RPC com a anon key e o token da pessoa, e traduz o erro do banco", async () => {
    const f = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(pendentes), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "contrato_encerrado", code: "P0001" }), { status: 400 }));
    const b = bancoSupabase("https://p.supabase.co", "anon-key", f as unknown as typeof fetch);
    await b.pendentes(JWT, EMPRESA);
    const [url, init] = f.mock.calls[0]!;
    expect(url).toBe("https://p.supabase.co/rest/v1/rpc/academy_empresa_convites_pendentes");
    expect((init as RequestInit).headers).toMatchObject({ Authorization: `Bearer ${JWT}`, apikey: "anon-key" });
    await expect(b.marcar(JWT, EMPRESA, ["m1"])).rejects.toMatchObject({ codigo: "contrato_encerrado" });
  });
});
