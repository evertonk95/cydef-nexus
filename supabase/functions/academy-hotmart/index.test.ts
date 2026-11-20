/**
 * Função academy-hotmart (fase 16): token da Hotmart, formato do aviso,
 * respostas que fazem a Hotmart reenviar ou não, e e-mails de acesso.
 */
import { describe, expect, it, vi } from "vitest";
import { bancoSupabase, createHotmartHandler, iguais, normalizar, type BancoHotmart, type HotmartDeps } from "./index.ts";
import { montarAcessoEncerrado, montarAcessoLiberado } from "./email.ts";

const TOKEN = "hottok-de-teste-com-tamanho-suficiente";

const aviso = (over: Record<string, unknown> = {}) => ({
  id: "e8f9a0b1-2c3d-4e5f-6789-0abcdef12345",
  creation_date: 1763560000000,
  event: "PURCHASE_APPROVED",
  version: "2.0.0",
  data: {
    product: { id: 1001, name: "SOC Analyst" },
    buyer: { email: "Bia@Exemplo.com", name: "Bia Compradora", checkout_phone: "+5561999999999" },
    purchase: { transaction: "HP1234567890", status: "APPROVED", approved_date: 1763560000000, payment: { type: "PIX" }, price: { value: 497, currency_value: "BRL" } },
  },
  ...over,
});

function deps(over: Partial<HotmartDeps> = {}, resultado: Record<string, unknown> = { duplicado: false, resultado: "liberado", email: "bia@exemplo.com", nome: "Bia Compradora", produto: "SOC Analyst: Formação Completa" }) {
  const logs: Record<string, unknown>[] = [];
  const processar = vi.fn<BancoHotmart["processar"]>().mockResolvedValue(resultado as never);
  const banco = { processar };
  const carteiro = { enviar: vi.fn().mockResolvedValue(true) };
  const d: HotmartDeps = { banco, hottok: TOKEN, carteiro, academyUrl: "https://academy.cydef.com.br", log: (e) => logs.push(e), novoRequestId: () => "req-1", ...over };
  return { d, logs, banco, carteiro };
}

const post = (corpo: unknown, headers: Record<string, string> = {}) =>
  new Request("https://x/functions/v1/academy-hotmart", {
    method: "POST",
    headers: { "content-type": "application/json", "x-hotmart-hottok": TOKEN, ...headers },
    body: typeof corpo === "string" ? corpo : JSON.stringify(corpo),
  });

describe("academy-hotmart", () => {
  it("compra aprovada: normaliza só o necessário, libera e manda o e-mail de acesso liberado", async () => {
    const { d, banco, carteiro, logs } = deps();
    const res = await createHotmartHandler(d)(post(aviso()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok", resultado: "liberado" });
    expect(banco.processar).toHaveBeenCalledWith({
      evento_id: "e8f9a0b1-2c3d-4e5f-6789-0abcdef12345",
      evento: "PURCHASE_APPROVED",
      transacao: "HP1234567890",
      produto_id: 1001,
      email: "bia@exemplo.com",
      nome: "Bia Compradora",
      situacao: "APPROVED",
      ocorrido_em: "1763560000000",
    });
    const mail = carteiro.enviar.mock.calls[0]![0];
    expect(mail.to).toBe("bia@exemplo.com");
    expect(mail.subject).toBe("Seu acesso à CyDef Academy foi liberado");
    // Nada de pagamento nem telefone sai da função; e-mail e nome não vão para o log.
    expect(JSON.stringify(banco.processar.mock.calls)).not.toMatch(/PIX|497|5561/);
    expect(JSON.stringify(logs)).not.toMatch(/bia@|Compradora/i);
  });

  it("token errado ou ausente: 401, sem tocar no banco", async () => {
    const { d, banco } = deps();
    expect((await createHotmartHandler(d)(post(aviso(), { "x-hotmart-hottok": "outro" }))).status).toBe(401);
    const sem = new Request("https://x", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(aviso()) });
    expect((await createHotmartHandler(d)(sem)).status).toBe(401);
    expect(banco.processar).not.toHaveBeenCalled();
  });

  it("sem token configurado, fecha: 503", async () => {
    const { d } = deps({ hottok: undefined });
    expect((await createHotmartHandler(d)(post(aviso()))).status).toBe(503);
    const curto = deps({ hottok: "curto" });
    expect((await createHotmartHandler(curto.d)(post(aviso(), { "x-hotmart-hottok": "curto" }))).status).toBe(503);
  });

  it("recusa método, tipo, tamanho e aviso sem os campos da compra", async () => {
    const { d, banco } = deps();
    const h = createHotmartHandler(d);
    expect((await h(new Request("https://x", { method: "GET", headers: { "x-hotmart-hottok": TOKEN } }))).status).toBe(405);
    expect((await h(post(aviso(), { "content-type": "text/plain" }))).status).toBe(415);
    expect((await h(post("x".repeat(70 * 1024)))).status).toBe(413);
    expect((await h(post("{nao json"))).status).toBe(400);
    expect((await h(post(aviso({ data: { product: { id: 1001 }, buyer: { email: "bia@exemplo.com" }, purchase: { transaction: "HP 12" } } })))).status).toBe(400);
    expect((await h(post(aviso({ data: { product: { id: 1001 }, buyer: { email: "sem-arroba" }, purchase: { transaction: "HP1234" } } })))).status).toBe(400);
    expect(banco.processar).not.toHaveBeenCalled();
  });

  it("banco fora: 500, para a Hotmart tentar de novo", async () => {
    const { d, carteiro } = deps({ banco: { processar: vi.fn().mockRejectedValue(new Error("rpc_hotmart_503")) } });
    expect((await createHotmartHandler(d)(post(aviso()))).status).toBe(500);
    expect(carteiro.enviar).not.toHaveBeenCalled();
  });

  it("aviso repetido, ignorado ou de outro produto responde 200 e não manda e-mail", async () => {
    for (const r of [
      { duplicado: true, resultado: "liberado", email: "bia@exemplo.com" },
      { duplicado: false, resultado: "ignorado", email: "bia@exemplo.com" },
      { duplicado: false, resultado: "produto_desconhecido", email: "bia@exemplo.com" },
    ]) {
      const { d, carteiro } = deps({}, r);
      expect((await createHotmartHandler(d)(post(aviso()))).status).toBe(200);
      expect(carteiro.enviar).not.toHaveBeenCalled();
    }
  });

  it("reembolso: e-mail de acesso encerrado; falha no e-mail não muda a resposta", async () => {
    const { d, carteiro, logs } = deps({}, { duplicado: false, resultado: "encerrado", email: "bia@exemplo.com", nome: "Bia", produto: "SOC Analyst" });
    carteiro.enviar.mockResolvedValue(false);
    const res = await createHotmartHandler(d)(post(aviso({ event: "PURCHASE_REFUNDED" })));
    expect(res.status).toBe(200);
    expect(carteiro.enviar.mock.calls[0]![0].subject).toBe("Seu acesso a um curso da CyDef Academy foi encerrado");
    expect(logs).toContainEqual(expect.objectContaining({ event: "hotmart_email_falhou" }));
  });

  it("e-mails escapam HTML do nome e do produto e não trazem link de login", () => {
    const l = montarAcessoLiberado({ to: "bia@exemplo.com", nome: "<script>x</script> Bia", produto: "Curso <b>", academyUrl: "https://academy.cydef.com.br/" });
    expect(l.html).not.toContain("<script>");
    expect(l.html).toContain("Curso &lt;b&gt;");
    expect(l.html).toContain('href="https://academy.cydef.com.br/entrar"');
    expect(l.text).not.toMatch(/token/);
    const e = montarAcessoEncerrado({ to: "bia@exemplo.com", nome: "Bia", produto: "Trilha SOC" });
    expect(e.text).toContain("certificados já emitidos");
    expect(e.text).not.toContain("—");
  });

  it("compara o token em tempo constante e normaliza o aviso", () => {
    expect(iguais("abc", "abc")).toBe(true);
    expect(iguais("abc", "abd")).toBe(false);
    expect(iguais("abc", "abcd")).toBe(false);
    expect(normalizar(null)).toBeNull();
    expect(normalizar(aviso({ event: "purchase_refunded" }))?.evento).toBe("PURCHASE_REFUNDED");
    expect(normalizar(aviso({ data: { product: { id: "1001" }, buyer: { email: "a@b.com" }, purchase: { transaction: "HP1234" } } }))?.produto_id).toBe(1001);
  });

  it("chama a função do banco com a chave de serviço", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ duplicado: false, resultado: "ignorado" }), { status: 200 }));
    const n = normalizar(aviso())!;
    await bancoSupabase("https://proj.supabase.co", "service-key", fetchImpl).processar(n);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://proj.supabase.co/rest/v1/rpc/academy_hotmart_processar");
    expect(JSON.parse(init.body)).toEqual({ p_evento: n });
    expect(init.headers).toMatchObject({ apikey: "service-key" });
    const falha = vi.fn().mockResolvedValue(new Response("", { status: 503 }));
    await expect(bancoSupabase("https://p", "k", falha).processar(n)).rejects.toThrow(/rpc_hotmart_503/);
  });
});
