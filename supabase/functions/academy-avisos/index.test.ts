/**
 * Função academy-avisos (fase 17): token do agendamento, rotina de acessos,
 * e-mails de vencimento e registro do que foi enviado.
 */
import { describe, expect, it, vi } from "vitest";
import { createAvisosHandler, LIMITES_AVISOS, type AvisosDeps, type BancoAvisos } from "./index.ts";
import { montarAulasNovas, montarAviso, montarCertificado, montarPrivacidade, type AvisoAulas, type AvisoCertificado, type AvisoPrivacidade, type AvisoVencimento } from "./email.ts";

const TOKEN = "token-do-agendamento-com-32-caracteres-ou-mais";

const plano: AvisoVencimento = {
  chave: "concessao:0b7e2c1a-1111-4222-8333-444455556666:30d", email: "bia@exemplo.com", nome: "Bia Souza",
  tipo: "plano", acesso: "Plataforma toda", fim: "2027-05-31", dias: 20, renovar_url: "https://pay.hotmart.com/P1234567Q",
};
const cert: AvisoCertificado = {
  chave: "certificado:CYD-1A2B-3C4D-5E6F-7A8B", email: "bia@exemplo.com", nome: "Bia Souza", curso: "Cybersecurity Fundamentals",
  curso_slug: "cybersecurity-fundamentals", codigo: "CYD-1A2B-3C4D-5E6F-7A8B", carga_horaria_h: 6, concluido_em: "2026-11-20", validacao_publica: true,
};
const grupo: AvisoAulas = {
  email: "ana@exemplo.com", nome: "Ana Lima", curso: "Cybersecurity Fundamentals", curso_slug: "cybersecurity-fundamentals",
  aulas: [
    { chave: "aula:0b7e2c1a-1111-4222-8333-000000000004", numero: 4, titulo: "Risco, ameaça, vulnerabilidade e impacto" },
    { chave: "aula:0b7e2c1a-1111-4222-8333-000000000005", numero: 5, titulo: "Defesa em profundidade" },
  ],
};
const membro: AvisoVencimento = { ...plano, chave: "concessao:0b7e2c1a-1111-4222-8333-444455556667:7d", email: "ana@banco.com", tipo: "membro", acesso: "Banco Exemplo", dias: 5, renovar_url: null };

function deps(over: Partial<AvisosDeps> = {}) {
  const logs: Record<string, unknown>[] = [];
  const banco = {
    expirar: vi.fn<BancoAvisos["expirar"]>().mockResolvedValue(3),
    pendentes: vi.fn<BancoAvisos["pendentes"]>().mockResolvedValue([plano, membro]),
    certificados: vi.fn<BancoAvisos["certificados"]>().mockResolvedValue([]),
    aulas: vi.fn<BancoAvisos["aulas"]>().mockResolvedValue([]),
    privacidade: vi.fn<BancoAvisos["privacidade"]>().mockResolvedValue([]),
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
    expect(await res.json()).toEqual({ recalculados: 3, enviados: 1, falhas: 1, por_tipo: { vencimento: 1, certificado: 0, aula: 0, privacidade: 0 }, email: "ligado" });
    expect(banco.registrar).toHaveBeenCalledWith([{ chave: plano.chave, email: plano.email }]);
    expect(JSON.stringify(logs)).not.toMatch(/@/);
  });

  it("com o e-mail desligado recalcula, mas não registra nada", async () => {
    const { d, banco } = deps({ carteiro: undefined });
    expect(await (await createAvisosHandler(d)(post())).json()).toEqual({ recalculados: 3, enviados: 0, falhas: 0, pendentes: 2, email: "desligado" });
    expect(banco.registrar).not.toHaveBeenCalled();
  });

  it("fase 18: certificado e aula nova saem na mesma rodada e cada aula do e-mail é registrada", async () => {
    const { d, banco, carteiro } = deps();
    banco.pendentes.mockResolvedValue([]);
    banco.certificados.mockResolvedValue([cert]);
    banco.aulas.mockResolvedValue([grupo]);
    const res = await createAvisosHandler({ ...d, academyUrl: "https://academy.cydef.com.br" })(post());
    expect(await res.json()).toMatchObject({ enviados: 2, falhas: 0, por_tipo: { vencimento: 0, certificado: 1, aula: 1 } });
    expect(banco.aulas).toHaveBeenCalledWith(LIMITES_AVISOS.aulaNovaPorDia);
    expect(carteiro.enviar).toHaveBeenCalledTimes(2);
    expect(banco.registrar).toHaveBeenCalledWith([
      { chave: cert.chave, email: cert.email },
      { chave: grupo.aulas[0]!.chave, email: grupo.email },
      { chave: grupo.aulas[1]!.chave, email: grupo.email },
    ]);
  });

  it("fase 18: banco sem a 0028 não derruba o vencimento", async () => {
    const { d, banco, logs } = deps();
    banco.certificados.mockRejectedValue(new Error("rpc_academy_avisos_certificados_404"));
    banco.aulas.mockRejectedValue(new Error("rpc_academy_avisos_aulas_404"));
    const res = await createAvisosHandler(d)(post());
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ enviados: 2, por_tipo: { vencimento: 2, certificado: 0, aula: 0 } });
    expect(logs.filter((l) => l.event === "avisos_fonte_falhou")).toHaveLength(2);
  });

  it("fase 18: aula nova respeita o teto diário mesmo se o banco mandar mais", async () => {
    const { d, banco, carteiro } = deps();
    banco.pendentes.mockResolvedValue([]);
    banco.aulas.mockResolvedValue(Array.from({ length: LIMITES_AVISOS.aulaNovaPorDia + 5 }, (_, i) => ({ ...grupo, email: `p${i}@exemplo.com` })));
    await createAvisosHandler(d)(post());
    expect(carteiro.enviar).toHaveBeenCalledTimes(LIMITES_AVISOS.aulaNovaPorDia);
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

describe("modelos da fase 18", () => {
  const URL = "https://academy.cydef.com.br";

  it("certificado: código, link do certificado e da validação pública", () => {
    const m = montarCertificado(cert, URL)!;
    expect(m.subject).toBe("Seu certificado da CyDef Academy: Cybersecurity Fundamentals");
    expect(m.html).toContain("https://academy.cydef.com.br/cursos/cybersecurity-fundamentals/certificado");
    expect(m.html).toContain("academy.cydef.com.br/certificado/CYD-1A2B-3C4D-5E6F-7A8B");
    expect(m.text).toContain("6 horas");
    expect(m.text).toContain("20/11/2026");
    expect(m.html).toContain("LinkedIn");
  });

  it("certificado com validação pública desligada não leva o link de validação", () => {
    const m = montarCertificado({ ...cert, validacao_publica: false }, URL)!;
    expect(m.html).not.toContain("/certificado/CYD-");
    expect(m.text).not.toContain("/certificado/CYD-");
  });

  it("certificado com código ou curso fora do formato não é montado", () => {
    expect(montarCertificado({ ...cert, codigo: "CYD-<script>" }, URL)).toBeNull();
    expect(montarCertificado({ ...cert, curso_slug: "../conta" }, URL)).toBeNull();
  });

  it("aula nova: lista as aulas, abre a primeira e diz como desligar", () => {
    const m = montarAulasNovas(grupo, URL)!;
    expect(m.subject).toBe("2 aulas novas em Cybersecurity Fundamentals");
    expect(m.html).toContain("<li>Risco, ameaça, vulnerabilidade e impacto</li>");
    expect(m.html).toContain("<li>Defesa em profundidade</li>");
    expect(m.text).not.toMatch(/Aula 0\d/);
    expect(m.html).toContain("https://academy.cydef.com.br/cursos/cybersecurity-fundamentals/aulas/4");
    expect(m.html).toContain("https://academy.cydef.com.br/conta");
    expect(m.text).toContain("desligue");
    const uma = montarAulasNovas({ ...grupo, aulas: [grupo.aulas[1]!] }, URL)!;
    expect(uma.subject).toBe("Aula nova em Cybersecurity Fundamentals: Defesa em profundidade");
  });

  it("aula nova escapa título e não monta sem aula válida", () => {
    const m = montarAulasNovas({ ...grupo, aulas: [{ chave: "aula:x", numero: 6, titulo: "<img src=x onerror=alert(1)>" }] }, URL)!;
    expect(m.html).not.toContain("<img");
    expect(m.html).toContain("&lt;img");
    expect(montarAulasNovas({ ...grupo, aulas: [] }, URL)).toBeNull();
  });
});

const priv: AvisoPrivacidade = {
  chave: "privacidade:v2026.9", email: "bia@exemplo.com", nome: "Bia Souza", versao: "v2026.9", publicado_em: "2026-11-22T10:00:00Z",
  url: "/academy/privacidade/v2026.9",
  resumo: "Material complementar: registramos os materiais que você baixou (item 2.3).\nMeu perfil: dados opcionais em Meu perfil (item 2.8).",
};

describe("academy-avisos: nova versão do Aviso de Privacidade (fase 27)", () => {
  it("envia o aviso com o layout da Academy, o que mudou e o link da versão, e registra a chave", async () => {
    const { d, banco, carteiro } = deps();
    banco.pendentes.mockResolvedValue([]);
    banco.privacidade.mockResolvedValue([priv, { ...priv, email: "ana@exemplo.com", nome: "Ana" }]);
    const res = await createAvisosHandler(d)(post());
    expect(await res.json()).toMatchObject({ enviados: 2, falhas: 0, por_tipo: { privacidade: 2 } });
    expect(banco.privacidade).toHaveBeenCalledWith(LIMITES_AVISOS.privacidadePorDia);
    expect(banco.registrar).toHaveBeenCalledWith([
      { chave: "privacidade:v2026.9", email: "bia@exemplo.com" },
      { chave: "privacidade:v2026.9", email: "ana@exemplo.com" },
    ]);
    const mail = carteiro.enviar.mock.calls[0]![0];
    expect(mail.subject).toBe("Atualizamos o Aviso de Privacidade da CyDef Academy");
    expect(mail.html).toContain("CyDef <span style=\"color:#f97316\">Academy</span>");
    expect(mail.html).toContain('href="https://www.cydef.com.br/pt/academy/privacidade/v2026.9/"');
    expect(mail.html).toContain("<li style=\"margin-bottom:8px\">Meu perfil: dados opcionais em Meu perfil (item 2.8).</li>");
    expect(mail.text).toContain("A versão em vigor agora é a v2026.9, de 22/11/2026.");
    expect(mail.text).toContain("LGPD: Solicitação de titular");
  });

  it("sem a 0039 no banco, só esta parte é pulada", async () => {
    const { d, banco, logs } = deps();
    banco.privacidade.mockRejectedValue(new Error("rpc_academy_avisos_privacidade_404"));
    const res = await createAvisosHandler(d)(post());
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ por_tipo: { vencimento: 2, privacidade: 0 } });
    expect(logs.some((l) => l.event === "avisos_fonte_falhou" && l.fonte === "privacidade")).toBe(true);
  });

  it("não monta e-mail com versão, endereço ou chave fora do formato, nem sem resumo", () => {
    expect(montarPrivacidade(priv)).not.toBeNull();
    expect(montarPrivacidade({ ...priv, url: "https://outro.site/x" })).toBeNull();
    expect(montarPrivacidade({ ...priv, versao: "v2026.9<script>" })).toBeNull();
    expect(montarPrivacidade({ ...priv, chave: "privacidade:v2026.8" })).toBeNull();
    expect(montarPrivacidade({ ...priv, resumo: "  \n " })).toBeNull();
    const m = montarPrivacidade({ ...priv, nome: "<b>Bia</b>", resumo: "Mudança com <img src=x> no texto" })!;
    expect(m.html).not.toContain("<img");
    expect(m.html).toContain("&lt;img src=x&gt;");
  });
});
