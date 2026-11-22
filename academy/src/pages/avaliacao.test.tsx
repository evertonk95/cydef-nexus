import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import QuestoesModulo from "./QuestoesModulo";
import Avaliacao from "./Avaliacao";
import Certificado from "./Certificado";
import Curso from "./Curso";
import Aula from "./Aula";
import { renderizar } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import { acertosMinimos, linkLinkedin, normalizarCodigo, dataPorExtenso, mostraConclusao, nomeValido, normalizarNome, quandoLibera, buscarSituacao, type Situacao } from "@/lib/avaliacao";

const gerarPdf = vi.fn<(d: unknown) => Promise<Blob>>(async () => new Blob(["%PDF"], { type: "application/pdf" }));
vi.mock("@/lib/certificado-pdf", () => ({
  gerarCertificadoNoNavegador: (d: unknown) => gerarPdf(d),
  nomeArquivo: () => "certificado-cybersecurity-fundamentals-CYD-AAAA-BBBB-CCCC-DDDD.pdf",
}));

const M0 = "00000000-0000-4000-8000-0000000000a0";
const M1 = "00000000-0000-4000-8000-0000000000a1";
const M2 = "00000000-0000-4000-8000-0000000000a2";
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const CURSO = {
  slug: "cybersecurity-fundamentals",
  titulo: "Cybersecurity Fundamentals",
  descricao: "Fundamentos.",
  nivel: "iniciante",
  gratuito: true,
  modulos: [
    { id: M0, ordem: 0, titulo: "Introdução", aulas: [{ id: "a1", ordem: 1, numero: 1, titulo: "Boas-vindas ao curso", resumo: "", duracao_seg: 122 }] },
    {
      id: M1,
      ordem: 1,
      titulo: "Princípios de segurança",
      aulas: [
        { id: "a2", ordem: 1, numero: 2, titulo: "Confidencialidade, integridade e disponibilidade", resumo: "", duracao_seg: 1020 },
        { id: "a3", ordem: 2, numero: 3, titulo: "Risco, ameaça, vulnerabilidade e impacto", resumo: "", duracao_seg: 1020 },
      ],
    },
    { id: M2, ordem: 2, titulo: "Redes e protocolos essenciais", aulas: [{ id: "a4", ordem: 1, numero: 4, titulo: "Modelo OSI na prática", resumo: "", duracao_seg: 900 }] },
  ],
};

function situacao(over: { modulos?: Partial<Situacao["modulos"][number]>[]; final?: Partial<Situacao["final"]>; certificado?: Partial<Situacao["certificado"]>; aulas?: Situacao["aulas"] } = {}): Situacao {
  const base = [
    { id: M0, ordem: 0, titulo: "Introdução", tem_questoes: false, aprovado: false, liberado: true },
    { id: M1, ordem: 1, titulo: "Princípios de segurança", tem_questoes: true, aprovado: false, liberado: true },
    { id: M2, ordem: 2, titulo: "Redes e protocolos essenciais", tem_questoes: true, aprovado: false, liberado: false },
  ];
  return {
    requisitos: {
      exige_todas_aulas: true,
      exige_modulos: true,
      nota_minima_modulo: 70,
      nota_minima_final: 80,
      questoes_final: 20,
      espera_final_horas: 24,
      tentativas_final_max: null,
      carga_horaria_h: 6,
    },
    aulas: over.aulas ?? { total: 4, concluidas: 1 },
    modulos: base.map((m, i) => ({ ...m, ...(over.modulos?.[i] ?? {}) })),
    final: { situacao: "requisitos_pendentes", prova_aberta: null, tentativas: 0, melhor_nota: null, proxima_em: null, ...over.final },
    certificado: { elegivel: false, codigo: null, nome: null, concluido_em: null, ...over.certificado },
  };
}

/** Questões com alternativas: a primeira de cada é a certa. */
function questoes(qtd: number, base = 100) {
  return Array.from({ length: qtd }, (_, i) => ({
    id: uuid(base + i * 10),
    enunciado: `Pergunta ${i + 1} sobre segurança?`,
    alternativas: [0, 1, 2, 3].map((j) => ({ id: uuid(base + i * 10 + j + 1), texto: `Alternativa ${j + 1} da pergunta ${i + 1}` })),
  }));
}

type Rpc = { nome: string; args: Record<string, unknown> };

function sbAvaliacao(respostas: Record<string, (args: Record<string, unknown>, vez: number) => { data?: unknown; error?: { message: string } }>) {
  const chamadas: Rpc[] = [];
  const cadeia = (resultado: unknown) => {
    const c: Record<string, unknown> = {};
    for (const m of ["select", "eq", "in", "order"]) c[m] = () => c;
    c.maybeSingle = () => Promise.resolve(resultado);
    c.then = (ok: (v: unknown) => unknown) => Promise.resolve(resultado).then(ok);
    return c;
  };
  const sb = {
    from: (tabela: string) => {
      if (tabela === "cursos") return cadeia({ data: CURSO, error: null });
      if (tabela === "matriculas") return cadeia({ data: { curso_slug: CURSO.slug }, error: null });
      return cadeia({ data: [], error: null });
    },
    rpc: (nome: string, args: Record<string, unknown> = {}) => {
      chamadas.push({ nome, args });
      const f = respostas[nome];
      const vez = chamadas.filter((c) => c.nome === nome).length;
      if (!f) return Promise.resolve({ data: null, error: { message: "rota não simulada" } });
      const r = f(args, vez);
      return Promise.resolve({ data: r.data ?? null, error: r.error ?? null });
    },
    auth: { signOut: () => Promise.resolve({ error: null }) },
  } as unknown as SupabaseClient;
  return { sb, chamadas };
}

const rotaQuestoes = (ordem: number, sb: SupabaseClient) =>
  renderizar(<QuestoesModulo />, { rota: `/cursos/${CURSO.slug}/modulos/${ordem}/questoes`, caminho: "/cursos/:slug/modulos/:ordem/questoes", sb });

function responderTodas(qs: ReturnType<typeof questoes>, escolha: (i: number) => number) {
  qs.forEach((q, i) => fireEvent.click(screen.getByRole("radio", { name: q.alternativas[escolha(i)]!.texto })));
}

afterEach(() => window.localStorage.clear());

describe("questões do módulo", () => {
  it("envia só com tudo respondido, mostra a correção e sorteia de novo ao refazer", async () => {
    const qs = questoes(5);
    const { sb, chamadas } = sbAvaliacao({
      academy_situacao_curso: () => ({ data: situacao() }),
      academy_questoes_modulo: () => ({ data: { modulo_id: M1, nota_minima: 70, aprovado: false, questoes: qs } }),
      academy_responder_modulo: (args) => {
        const r = args.p_respostas as { questao: string; alternativa: string }[];
        const correcao = r.map((x, i) => ({
          questao: x.questao,
          escolhida: x.alternativa,
          correta: x.alternativa === qs[i]!.alternativas[0]!.id,
          alternativa_correta: qs[i]!.alternativas[0]!.id,
          explicacao: `Explicação da pergunta ${i + 1}.`,
        }));
        const acertos = correcao.filter((c) => c.correta).length;
        return { data: { acertos, total: 5, nota: acertos * 20, nota_minima: 70, aprovado: acertos >= 4, correcao } };
      },
    });
    rotaQuestoes(1, sb);
    expect(await screen.findByRole("heading", { level: 1, name: "Módulo 1: Princípios de segurança" })).toBeInTheDocument();
    await screen.findByText("Pergunta 1 sobre segurança?");
    const regras = within(screen.getByRole("list", { name: "Como funciona" }));
    expect(regras.getByText("5 questões de múltipla escolha, sorteadas a cada tentativa")).toBeInTheDocument();
    expect(regras.getByText("Para passar: acertar 4 de 5 (70%)")).toBeInTheDocument();
    expect(regras.getByText(/^Passou: o Módulo 2 é liberado$/)).toBeInTheDocument();
    expect(regras.getByText("Não passou: leia a explicação de cada questão e responda novamente")).toBeInTheDocument();
    const enviar = screen.getByRole("button", { name: /Enviar respostas/ });
    expect(enviar).toBeDisabled();
    expect(screen.getByText("0 de 5 respondidas")).toBeInTheDocument();

    // 2 certas de 5 = 40%
    responderTodas(qs, (i) => (i < 2 ? 0 : 1));
    expect(screen.getByText("5 de 5 respondidas")).toBeInTheDocument();
    fireEvent.click(enviar);

    expect(await screen.findByRole("heading", { name: "Ainda não foi desta vez" })).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("Explicação da pergunta 3.")).toBeInTheDocument();
    expect(screen.getAllByText("Errou")).toHaveLength(3);
    const envio = chamadas.find((c) => c.nome === "academy_responder_modulo")!;
    expect(envio.args.p_modulo_id).toBe(M1);
    expect((envio.args.p_respostas as { questao: string }[]).map((r) => r.questao)).toEqual(qs.map((q) => q.id));

    fireEvent.click(screen.getByRole("button", { name: /Responder novamente/ }));
    await waitFor(() => expect(chamadas.filter((c) => c.nome === "academy_questoes_modulo")).toHaveLength(2));
    expect(await screen.findByText("0 de 5 respondidas")).toBeInTheDocument();
  });

  it("aprovado libera o próximo módulo e leva à primeira aula dele", async () => {
    const qs = questoes(5);
    const { sb } = sbAvaliacao({
      academy_situacao_curso: () => ({ data: situacao() }),
      academy_questoes_modulo: () => ({ data: { modulo_id: M1, nota_minima: 70, aprovado: false, questoes: qs } }),
      academy_responder_modulo: () => ({
        data: {
          acertos: 5,
          total: 5,
          nota: 100,
          nota_minima: 70,
          aprovado: true,
          correcao: qs.map((q) => ({ questao: q.id, escolhida: q.alternativas[0]!.id, correta: true, alternativa_correta: q.alternativas[0]!.id, explicacao: null })),
        },
      }),
    });
    rotaQuestoes(1, sb);
    await screen.findByText("Pergunta 1 sobre segurança?");
    responderTodas(qs, () => 0);
    fireEvent.click(screen.getByRole("button", { name: /Enviar respostas/ }));
    expect(await screen.findByRole("heading", { name: "Módulo concluído" })).toBeInTheDocument();
    expect(screen.getByText("O Módulo 2 está liberado.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Começar o Módulo 2/ })).toHaveAttribute("href", `/cursos/${CURSO.slug}/aulas/4`);
  });

  it("módulo bloqueado aponta para as questões que faltam", async () => {
    const { sb, chamadas } = sbAvaliacao({ academy_situacao_curso: () => ({ data: situacao() }) });
    rotaQuestoes(2, sb);
    expect(await screen.findByRole("heading", { name: "Este módulo ainda está bloqueado" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ir para as questões do Módulo 1/ })).toHaveAttribute("href", `/cursos/${CURSO.slug}/modulos/1/questoes`);
    expect(chamadas.some((c) => c.nome === "academy_questoes_modulo")).toBe(false);
  });

  it("avisa quando há tentativas demais em pouco tempo", async () => {
    const qs = questoes(2);
    const { sb } = sbAvaliacao({
      academy_situacao_curso: () => ({ data: situacao() }),
      academy_questoes_modulo: () => ({ data: { modulo_id: M1, nota_minima: 70, aprovado: false, questoes: qs } }),
      academy_responder_modulo: () => ({ error: { message: "muitas_tentativas" } }),
    });
    rotaQuestoes(1, sb);
    await screen.findByText("Pergunta 1 sobre segurança?");
    responderTodas(qs, () => 0);
    fireEvent.click(screen.getByRole("button", { name: /Enviar respostas/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("muitas tentativas em pouco tempo");
  });

  it("sem violações graves de acessibilidade", async () => {
    const qs = questoes(3);
    const { sb } = sbAvaliacao({
      academy_situacao_curso: () => ({ data: situacao() }),
      academy_questoes_modulo: () => ({ data: { modulo_id: M1, nota_minima: 70, aprovado: false, questoes: qs } }),
    });
    const { container } = rotaQuestoes(1, sb);
    await screen.findByText("Pergunta 1 sobre segurança?");
    expect(await violacoesGraves(container)).toEqual([]);
  });
});

describe("avaliação final", () => {
  const abrir = (sb: SupabaseClient) => renderizar(<Avaliacao />, { rota: `/cursos/${CURSO.slug}/avaliacao`, caminho: "/cursos/:slug/avaliacao", sb });

  it("mostra o que falta quando os requisitos não estão completos", async () => {
    const { sb } = sbAvaliacao({ academy_situacao_curso: () => ({ data: situacao() }) });
    abrir(sb);
    expect(await screen.findByRole("heading", { name: "Falta pouco para liberar a avaliação" })).toBeInTheDocument();
    expect(screen.getByText(/Todas as aulas \(1 de 4\)/)).toBeInTheDocument();
    expect(screen.getByText(/As questões de cada módulo \(0 de 2\)/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Questões do Módulo 1/ })).toHaveAttribute("href", `/cursos/${CURSO.slug}/modulos/1/questoes`);
  });

  it("sem banco de questões: avisa que está sendo preparada", async () => {
    const { sb } = sbAvaliacao({ academy_situacao_curso: () => ({ data: situacao({ final: { situacao: "sem_banco" } }) }) });
    abrir(sb);
    expect(await screen.findByRole("heading", { name: "A avaliação final está sendo preparada" })).toBeInTheDocument();
  });

  it("na espera, diz quando abre a próxima tentativa", async () => {
    const amanha = new Date(Date.now() + 26 * 3600_000).toISOString();
    const { sb } = sbAvaliacao({
      academy_situacao_curso: () => ({ data: situacao({ final: { situacao: "aguarde", proxima_em: amanha, melhor_nota: 65, tentativas: 1 } }) }),
    });
    abrir(sb);
    expect(await screen.findByRole("heading", { name: /^Nova tentativa / })).toBeInTheDocument();
    expect(screen.getByText(/Sua melhor nota até agora: 65%/)).toBeInTheDocument();
  });

  it("faz a prova: guarda o rascunho, pede confirmação e mostra só a nota", async () => {
    const qs = questoes(4, 500);
    const prova = uuid(999);
    const { sb, chamadas } = sbAvaliacao({
      academy_situacao_curso: (_a, vez) => ({ data: situacao({ final: { situacao: vez === 1 ? "disponivel" : "aguarde" } }) }),
      academy_iniciar_final: () => ({ data: { prova_id: prova, iniciada_em: "2026-11-19T10:00:00Z", questoes: qs } }),
      academy_enviar_final: () => ({ data: { acertos: 3, total: 4, nota: 75, nota_minima: 80, aprovado: false, proxima_em: new Date(Date.now() + 24 * 3600_000).toISOString() } }),
    });
    abrir(sb);
    fireEvent.click(await screen.findByRole("button", { name: /Começar a avaliação/ }));
    await screen.findByText("Pergunta 1 sobre segurança?");
    responderTodas(qs, () => 0);
    expect(JSON.parse(window.localStorage.getItem(`cydef-academy:prova:${prova}`)!)).toEqual(Object.fromEntries(qs.map((q) => [q.id, q.alternativas[0]!.id])));

    fireEvent.click(screen.getByRole("button", { name: /Enviar avaliação/ }));
    const dialogo = await screen.findByRole("alertdialog", { name: "Enviar a avaliação?" });
    expect(chamadas.some((c) => c.nome === "academy_enviar_final")).toBe(false);
    fireEvent.click(within(dialogo).getByRole("button", { name: /Enviar agora/ }));

    expect(await screen.findByRole("heading", { name: "Ainda não foi desta vez" })).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText(/não são mostradas depois do envio/)).toBeInTheDocument();
    expect(screen.queryByText("Pergunta 1 sobre segurança?")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(`cydef-academy:prova:${prova}`)).toBeNull();
    const envio = chamadas.find((c) => c.nome === "academy_enviar_final")!;
    expect(envio.args.p_prova_id).toBe(prova);
    expect(envio.args.p_respostas).toHaveLength(4);
  });

  it("retoma a prova aberta com as respostas que estavam no navegador", async () => {
    const qs = questoes(2, 700);
    const prova = uuid(998);
    window.localStorage.setItem(`cydef-academy:prova:${prova}`, JSON.stringify({ [qs[0]!.id]: qs[0]!.alternativas[2]!.id }));
    const { sb } = sbAvaliacao({
      academy_situacao_curso: () => ({ data: situacao({ final: { situacao: "disponivel", prova_aberta: prova } }) }),
      academy_iniciar_final: () => ({ data: { prova_id: prova, iniciada_em: "2026-11-19T10:00:00Z", questoes: qs } }),
    });
    abrir(sb);
    fireEvent.click(await screen.findByRole("button", { name: /Continuar a avaliação/ }));
    expect(await screen.findByText("1 de 2 respondidas")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: qs[0]!.alternativas[2]!.texto })).toBeChecked();
  });
});

describe("certificado", () => {
  const abrir = (sb: SupabaseClient) => renderizar(<Certificado />, { rota: `/cursos/${CURSO.slug}/certificado`, caminho: "/cursos/:slug/certificado", sb });

  it("fica bloqueado enquanto faltar requisito", async () => {
    const { sb } = sbAvaliacao({ academy_situacao_curso: () => ({ data: situacao() }), academy_meu_painel: () => ({ data: { nome: "Ana Souza" } }) });
    abrir(sb);
    expect(await screen.findByRole("heading", { name: "O certificado ainda não está liberado" })).toBeInTheDocument();
  });

  it("liberado: confere o nome, exige a confirmação e emite com o nome limpo", async () => {
    const { sb, chamadas } = sbAvaliacao({
      academy_situacao_curso: () => ({ data: situacao({ final: { situacao: "aprovado", melhor_nota: 90 }, certificado: { elegivel: true } }) }),
      academy_meu_painel: () => ({ data: { nome: "Ana Souza" } }),
      academy_emitir_certificado: (a) => ({
        data: { codigo: "CYD-1A2B-3C4D-5E6F-7A8B", nome: a.p_nome, curso_titulo: CURSO.titulo, carga_horaria_h: 6, concluido_em: "2026-11-19" },
      }),
    });
    abrir(sb);
    const campo = await screen.findByLabelText("Nome no certificado");
    await waitFor(() => expect(campo).toHaveValue("Ana Souza"));
    const emitir = screen.getByRole("button", { name: /Emitir certificado/ });
    expect(emitir).toBeDisabled();

    fireEvent.change(campo, { target: { value: "Ana 123" } });
    fireEvent.blur(campo);
    expect(screen.getByText(/Use só letras/)).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeDisabled();

    fireEvent.change(campo, { target: { value: "  Ana   Souza  de Oliveira " } });
    expect(screen.getByText("Ana Souza de Oliveira")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: /Conferi meu nome/ }));
    fireEvent.click(emitir);

    expect(await screen.findByText("CYD-1A2B-3C4D-5E6F-7A8B")).toBeInTheDocument();
    expect(screen.getByText(/carga horária de 6 horas, em 19 de novembro de 2026/)).toBeInTheDocument();
    expect(chamadas.find((c) => c.nome === "academy_emitir_certificado")!.args).toEqual({ p_curso: CURSO.slug, p_nome: "Ana Souza de Oliveira" });
  });

  it("já emitido: mostra os dados sem formulário", async () => {
    const { sb } = sbAvaliacao({
      academy_situacao_curso: () => ({
        data: situacao({ final: { situacao: "aprovado" }, certificado: { codigo: "CYD-AAAA-BBBB-CCCC-DDDD", nome: "Ana Souza", concluido_em: "2026-11-19" } }),
      }),
      academy_meu_painel: () => ({ data: { nome: "Ana Souza" } }),
    });
    abrir(sb);
    expect(await screen.findByText("CYD-AAAA-BBBB-CCCC-DDDD")).toBeInTheDocument();
    expect(screen.queryByLabelText("Nome no certificado")).not.toBeInTheDocument();
  });

  it("já emitido: baixa o PDF com os dados do banco e oferece LinkedIn e validação", async () => {
    const meu = {
      codigo: "CYD-AAAA-BBBB-CCCC-DDDD",
      nome: "Ana Souza",
      curso_titulo: "Cybersecurity Fundamentals",
      carga_horaria_h: 6,
      concluido_em: "2026-11-19",
      modelo: "claro",
      conteudo: ["Princípios de segurança"],
    };
    const { sb, chamadas } = sbAvaliacao({
      academy_situacao_curso: () => ({
        data: situacao({ final: { situacao: "aprovado" }, certificado: { codigo: meu.codigo, nome: meu.nome, concluido_em: meu.concluido_em } }),
      }),
      academy_meu_painel: () => ({ data: { nome: "Ana Souza" } }),
      academy_meu_certificado: () => ({ data: meu }),
    });
    const criar = vi.fn(() => "blob:certificado");
    Object.assign(URL, { createObjectURL: criar, revokeObjectURL: vi.fn() });
    const clique = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    abrir(sb);
    const linkedin = await screen.findByRole("link", { name: /Adicionar ao LinkedIn/ });
    const url = new URL(linkedin.getAttribute("href")!);
    expect(url.origin + url.pathname).toBe("https://www.linkedin.com/profile/add");
    expect(Object.fromEntries(url.searchParams)).toMatchObject({ startTask: "CERTIFICATION_NAME", name: "Cybersecurity Fundamentals", certId: meu.codigo, issueYear: "2026", issueMonth: "11" });
    expect(screen.getByRole("link", { name: /Ver página de validação/ })).toHaveAttribute("href", `/certificado/${meu.codigo}`);

    fireEvent.click(screen.getByRole("button", { name: /Baixar PDF/ }));
    await waitFor(() => expect(gerarPdf).toHaveBeenCalledWith(expect.objectContaining({ codigo: meu.codigo, modelo: "claro" })));
    expect(chamadas.find((c) => c.nome === "academy_meu_certificado")?.args).toEqual({ p_curso: CURSO.slug });
    await waitFor(() => expect(clique).toHaveBeenCalled());
    expect(criar).toHaveBeenCalled();
    clique.mockRestore();
  });

  it("falha ao gerar o PDF avisa sem sair da tela", async () => {
    const { sb } = sbAvaliacao({
      academy_situacao_curso: () => ({
        data: situacao({ final: { situacao: "aprovado" }, certificado: { codigo: "CYD-AAAA-BBBB-CCCC-DDDD", nome: "Ana Souza", concluido_em: "2026-11-19" } }),
      }),
      academy_meu_painel: () => ({ data: { nome: "Ana Souza" } }),
      academy_meu_certificado: () => ({ error: { message: "boom" } }),
    });
    abrir(sb);
    fireEvent.click(await screen.findByRole("button", { name: /Baixar PDF/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível gerar o PDF");
  });
});

describe("curso e sala de aula com questões", () => {
  it("curso mostra questões do módulo, bloqueio e nada de avaliação antes da hora", async () => {
    const { sb } = sbAvaliacao({ academy_situacao_curso: () => ({ data: situacao() }) });
    renderizar(<Curso />, { rota: `/cursos/${CURSO.slug}`, caminho: "/cursos/:slug", sb });
    await screen.findByRole("heading", { level: 1, name: CURSO.titulo });
    fireEvent.click(await screen.findByRole("button", { name: /Módulo 1: Princípios de segurança/ }));
    expect(await screen.findByRole("link", { name: /Questões do módulo.*Responder/ })).toHaveAttribute("href", `/cursos/${CURSO.slug}/modulos/1/questoes`);
    fireEvent.click(screen.getByRole("button", { name: /Módulo 2: Redes e protocolos essenciais, bloqueado/ }));
    expect(await screen.findByText("Abre depois que você passar nas questões do Módulo 1.")).toBeInTheDocument();
    expect(screen.queryByText("Avaliação final")).not.toBeInTheDocument();
    expect(screen.queryByText(/Certificado/)).not.toBeInTheDocument();
  });

  it("curso sem questões ou com falha na consulta segue igual a antes", async () => {
    const { sb } = sbAvaliacao({ academy_situacao_curso: () => ({ error: { message: "falha qualquer" } }) });
    renderizar(<Curso />, { rota: `/cursos/${CURSO.slug}`, caminho: "/cursos/:slug", sb });
    await screen.findByRole("heading", { level: 1, name: CURSO.titulo });
    expect(screen.queryByText("Questões do módulo")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Começar o curso/ })).toBeInTheDocument();
  });

  it("certificado liberado aparece no curso", async () => {
    const { sb } = sbAvaliacao({
      academy_situacao_curso: () => ({ data: situacao({ final: { situacao: "aprovado" }, certificado: { elegivel: true } }) }),
    });
    renderizar(<Curso />, { rota: `/cursos/${CURSO.slug}`, caminho: "/cursos/:slug", sb });
    expect(await screen.findByRole("link", { name: /Emitir certificado/ })).toHaveAttribute("href", `/cursos/${CURSO.slug}/certificado`);
  });

  it("última aula do módulo com questões pendentes leva às questões, não à próxima aula", async () => {
    const { sb } = sbAvaliacao({ academy_situacao_curso: () => ({ data: situacao() }) });
    renderizar(<Aula />, { rota: `/cursos/${CURSO.slug}/aulas/3`, caminho: "/cursos/:slug/aulas/:numero", sb });
    expect(await screen.findByRole("link", { name: /^Questões do módulo$/ })).toHaveAttribute("href", `/cursos/${CURSO.slug}/modulos/1/questoes`);
    expect(screen.queryByRole("link", { name: /Próxima aula/ })).not.toBeInTheDocument();
  });

  it("aula de módulo bloqueado aponta para as questões que faltam", async () => {
    const { sb } = sbAvaliacao({
      academy_situacao_curso: () => ({ data: situacao() }),
      academy_video_aula: () => ({ error: { message: "modulo_bloqueado" } }),
    });
    renderizar(<Aula />, { rota: `/cursos/${CURSO.slug}/aulas/4`, caminho: "/cursos/:slug/aulas/:numero", sb });
    expect(await screen.findByRole("link", { name: /Ir para as questões do Módulo 1/ })).toHaveAttribute("href", `/cursos/${CURSO.slug}/modulos/1/questoes`);
    expect(screen.queryByRole("button", { name: /Marcar como concluída/ })).not.toBeInTheDocument();
  });
});

describe("regras de apoio", () => {
  it("nome do certificado segue as regras do banco", () => {
    expect(nomeValido("Ana Souza")).toBe(true);
    expect(nomeValido("José D'Ávila Jr.")).toBe(true);
    expect(nomeValido("Maria-Clara")).toBe(true);
    expect(nomeValido("A")).toBe(false);
    expect(nomeValido("Ana 2")).toBe(false);
    expect(nomeValido("<script>")).toBe(false);
    expect(nomeValido("x".repeat(121))).toBe(false);
    expect(normalizarNome("  Ana   Souza ")).toBe("Ana Souza");
  });

  it("datas para o aluno", () => {
    expect(dataPorExtenso("2026-11-19")).toBe("19 de novembro de 2026");
    const agora = new Date(2026, 10, 19, 10, 0);
    expect(quandoLibera(new Date(2026, 10, 19, 15, 30).toISOString(), agora)).toBe("hoje às 15:30");
    expect(quandoLibera(new Date(2026, 10, 20, 9, 5).toISOString(), agora)).toBe("amanhã às 09:05");
    expect(quandoLibera(new Date(2026, 10, 22, 9, 5).toISOString(), agora)).toBe("22/11 às 09:05");
  });

  it("avaliação e certificado só aparecem no curso quando existem para o aluno", () => {
    expect(mostraConclusao(situacao())).toBe(false);
    expect(mostraConclusao(situacao({ final: { situacao: "sem_banco" } }))).toBe(false);
    expect(mostraConclusao(situacao({ final: { situacao: "disponivel" } }))).toBe(true);
    expect(mostraConclusao(situacao({ certificado: { codigo: "CYD-AAAA-BBBB-CCCC-DDDD" } }))).toBe(true);
  });

  it("resposta fora do formato vira erro, não tela quebrada", async () => {
    const { sb } = sbAvaliacao({ academy_situacao_curso: () => ({ data: { final: { situacao: "qualquer" } } }) });
    await expect(buscarSituacao(sb, CURSO.slug)).rejects.toMatchObject({ codigo: "falha" });
  });
});

describe("código e LinkedIn", () => {
  it("normaliza o código do jeito que a pessoa digitar", () => {
    expect(normalizarCodigo("cyd-7f3a-29c1-b84e-0d56")).toBe("CYD-7F3A-29C1-B84E-0D56");
    expect(normalizarCodigo(" 7F3A 29C1 B84E 0D56 ")).toBe("CYD-7F3A-29C1-B84E-0D56");
    expect(normalizarCodigo("CYD7F3A29C1B84E0D56")).toBe("CYD-7F3A-29C1-B84E-0D56");
    expect(normalizarCodigo("CYD-1234")).toBeNull();
    expect(normalizarCodigo("CYD-ZZZZ-29C1-B84E-0D56")).toBeNull();
  });

  it("link do LinkedIn aponta para a validação", () => {
    const u = new URL(linkLinkedin({ codigo: "CYD-1", curso_titulo: "Curso", concluido_em: "2026-03-05" }, "https://academy.cydef.com.br/"));
    expect(u.searchParams.get("certUrl")).toBe("https://academy.cydef.com.br/certificado/CYD-1");
    expect(u.searchParams.get("organizationName")).toBe("CyDef Academy");
    expect(u.searchParams.get("issueMonth")).toBe("3");
  });
});

describe("acertosMinimos", () => {
  it("usa a mesma conta do banco (nota arredondada)", () => {
    expect(acertosMinimos(5, 70)).toBe(4);
    expect(acertosMinimos(20, 80)).toBe(16);
    expect(acertosMinimos(3, 70)).toBe(3);
    expect(acertosMinimos(8, 70)).toBe(6);
    expect(acertosMinimos(10, 0)).toBe(0);
  });
});
