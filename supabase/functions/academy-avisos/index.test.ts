/**
 * Função academy-avisos (fase 17): token do agendamento, rotina de acessos,
 * e-mails de vencimento e registro do que foi enviado.
 */
import { describe, expect, it, vi } from "vitest";
import { createAvisosHandler, type AvisosDeps, type BancoAvisos } from "./index.ts";
import { montarAviso, type AvisoVencimento } from "./email.ts";

const TOKEN = "token-do-agendamento-com-32-caracteres-ou-mais";

const plano: AvisoVencimento = {
  chave: "concessao:0b7e2c1a-1111-4222-8333-444455556666:30d", email: "bia@exemplo.com", nome: "Bia Souza",
  tipo: "plano", acesso: "Plataforma toda", fim: "2027-05-31", dias: 20, renovar_url: "https://pay.hotmart.com/P1234567Q",
};
const membro: AvisoVencimento = { ...plano, chave: "concessao:0b7e2c1a-1111-4222-8333-444455556667:7d", email: "ana@banco.com", tipo: "membro", acesso: "Banco Exemplo", dias: 5, renovar_url: null };

function deps(over: Partial<AvisosDeps> = {}) {
  const logs: Record<string, unknown>[] = [];
  const banco = {
    expirar: vi.fn<BancoAvisos["expirar"]>().mockResolvedValue(3),
    pendentes: vi.fn<BancoAvisos["pendentes"]>().mockResolvedValue([plano, membro]),
    registrar: vi.fn<BancoAvisos["registrar"]>().mockResolvedValue(1),
  };
  const carteiro = { enviar: vi.fn().mockResolvedValue(true) };
  const d: AvisosDeps = { banco, token: TOKEN, carteiro, log: (e) => logs.push(e), novoRequestId: () => "req-1", ...over };
  return { d, logs, banco, carteiro };
}

const post = (headers: Record<string, string> = { "x-academy-cron": TOKEN }) =>
  new Request("https://x/functions/v1/academy-avisos", { method: "POST", headers });

describe("academy-avisos", () => {
  it("sem token configurado (ou curto) responde 503; token errado, 401; só POST", async () => {
    const { d, banco } = deps({ token: undefined });
    expect((await createAvisosHandler(d)(post())).status).toBe(503);
    expect((await createAvisosHandler({ ...d, token: "curto" })(post({ "x-academy-cron": "curto" }))).status).toBe(503);
    const ok = deps();
    expect((await createAvisosHandler(ok.d)(post({ "x-academy-cron": `${TOKEN}x` }))).status).toBe(401);
    expect((await createAvisosHandler(ok.d)(new Request("https://x", { method: "GET" }))).status).toBe(405);
    expect(banco.expirar).not.toHaveBeenCalled();
    expect(ok.banco.expirar).not.toHaveBeenCalled();
  });

  it("recalcula os acessos, envia os avisos e registra só os que saíram", async () => {
    const { d, banco, carteiro, logs } = deps();
    carteiro.enviar.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const res = await createAvisosHandler(d)(post());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ recalculados: 3, enviados: 1, falhas: 1, email: "ligado" });
    expect(banco.registrar).toHaveBeenCalledWith([{ chave: plano.chave, email: plano.email }]);
    expect(JSON.stringify(logs)).not.toMatch(/@/);
  });

  it("com o e-mail desligado recalcula, mas não registra nada", async () => {
    const { d, banco } = deps({ carteiro: undefined });
    expect(await (await createAvisosHandler(d)(post())).json()).toEqual({ recalculados: 3, enviados: 0, falhas: 0, pendentes: 2, email: "desligado" });
    expect(banco.registrar).not.toHaveBeenCalled();
  });

  it("falha do banco: 500 para o agendamento acusar", async () => {
    const { d } = deps();
    (d.banco.pendentes as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("rpc_500"));
    expect((await createAvisosHandler(d)(post())).status).toBe(500);
  });
});

describe("modelos de vencimento", () => {
  it("plano: data brasileira, botão de compra só com checkout da Hotmart", () => {
    const m = montarAviso(plano);
    expect(m.subject).toBe("Seu acesso à CyDef Academy vence em 20 dias");
    expect(m.html).toContain("31/05/2027");
    expect(m.html).toContain("https://pay.hotmart.com/P1234567Q");
    expect(m.text).toContain("não é renovado sozinho");
    const sem = montarAviso({ ...plano, renovar_url: "https://evil.example/pagar", dias: 1 });
    expect(sem.subject).toBe("Seu acesso à CyDef Academy vence amanhã");
    expect(sem.html).not.toContain("evil.example");
    expect(sem.text).toContain("contato@cydef.com.br");
  });

  it("membro e gestora: falam da empresa e de quem procurar", () => {
    expect(montarAviso(membro).text).toContain("fale com a gestão da sua empresa");
    const g = montarAviso({ ...membro, tipo: "gestora", acesso: "Banco <i>X</i>", dias: 30 });
    expect(g.subject).toBe("O contrato da Banco <i>X</i> com a CyDef Academy termina em 30 dias");
    expect(g.html).toContain("Banco &lt;i&gt;X&lt;/i&gt;");
    expect(g.text).toContain("deixa de ver o progresso");
  });
});
