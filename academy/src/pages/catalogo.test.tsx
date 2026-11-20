import { describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { painelTeste, renderizar, sbFalso } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import { ProvedorAvisos } from "@/components/ui/Avisos";
import type { CursoAdm } from "@/lib/instrutor";
import {
  checkoutValido,
  diasDesde,
  escreverPreco,
  formatarPreco,
  lerPreco,
  linkCompra,
  type Catalogo as TipoCatalogo,
  type CursoCatalogo,
  type TrilhaAdm,
  type VitrineAdm,
} from "@/lib/vitrine";
import Catalogo from "./Catalogo";
import CursoCatalogoPagina from "./CursoCatalogo";
import AreaInstrutor from "./instrutor/Area";
import CursoInstrutor from "./instrutor/Curso";
import TrilhasInstrutor from "./instrutor/Trilhas";

const CHECKOUT = "https://pay.hotmart.com/A1234567B?off=ab12cd";

function curso(over: Partial<CursoCatalogo>): CursoCatalogo {
  return {
    slug: "soc-analyst",
    titulo: "SOC Analyst: Formação Completa",
    descricao: "Formação para analista SOC N1 e N2.",
    nivel: "intermediario",
    objetivos: ["Triar alertas no SIEM"],
    publico: "Quem quer trabalhar em SOC.",
    pre_requisitos: "",
    situacao: "a_venda",
    carga_horaria_h: 80,
    preco_centavos: 49700,
    preco_observacao: "ou em até 12x no cartão",
    checkout_url: CHECKOUT,
    trilhas: ["soc"],
    modulos: [
      { ordem: 1, titulo: "Introdução ao SOC", resumo: "Estrutura e processos.", aulas: [{ titulo: "O que um SOC faz", duracao_seg: 600 }] },
      { ordem: 2, titulo: "Análise de Logs", resumo: "", aulas: [] },
    ],
    instrutores: [{ nome: "Everton Lima", cargo: "Wazuh Ambassador", bio: "", linkedin: null, site: null, papel: "instrutor" }],
    atualizado_em: "2026-11-19T10:00:00Z",
    ...over,
  };
}

const catalogo: TipoCatalogo = {
  trilhas: [
    { slug: "soc", titulo: "SOC", descricao: "Para quem quer trabalhar em SOC.", cursos: ["soc-analyst", "fundamentos-para-soc"] },
    { slug: "certificacoes", titulo: "Certificações", descricao: "Preparatórios.", cursos: ["sc-900-prep"] },
  ],
  cursos: [
    curso({}),
    curso({ slug: "fundamentos-para-soc", titulo: "Fundamentos para SOC", situacao: "a_venda" }),
    curso({ slug: "sc-900-prep", titulo: "Preparatório SC-900", situacao: "em_breve", preco_centavos: null, checkout_url: null, trilhas: ["certificacoes"] }),
  ],
};

describe("regras da vitrine", () => {
  it("lê e escreve preço em reais", () => {
    expect(lerPreco("497")).toBe(49700);
    expect(lerPreco("497,9")).toBe(49790);
    expect(lerPreco("R$ 1.497,90")).toBe(149790);
    expect(lerPreco("1497.90")).toBeNull();
    expect(lerPreco("abc")).toBeNull();
    expect(escreverPreco(149790)).toBe("1.497,90");
    expect(formatarPreco(49700).replace(/\s/g, " ")).toBe("R$ 497,00");
  });

  it("só aceita checkout da Hotmart e marca a origem e o e-mail", () => {
    expect(checkoutValido("https://pay.hotmart.com/A1234567B")).toBe(true);
    expect(checkoutValido("https://go.hotmart.com/A1234567B")).toBe(false);
    expect(checkoutValido("http://pay.hotmart.com/A1234567B")).toBe(false);
    expect(checkoutValido("https://pay.hotmart.com.evil.com/A1")).toBe(false);
    const u = new URL(linkCompra(CHECKOUT, "portal", "ana+cydef@empresa.com.br")!);
    expect(u.origin).toBe("https://pay.hotmart.com");
    expect(u.searchParams.get("off")).toBe("ab12cd");
    expect(u.searchParams.get("sck")).toBe("portal");
    expect(u.searchParams.get("email")).toBe("ana+cydef@empresa.com.br");
    expect(linkCompra("javascript:alert(1)", "site")).toBeNull();
  });

  it("conta os dias desde a conferência do preço", () => {
    expect(diasDesde(null)).toBeNull();
    expect(diasDesde("2026-10-01T00:00:00Z", Date.parse("2026-11-19T00:00:00Z"))).toBe(49);
  });
});

describe("catálogo do portal", () => {
  const sb = () => sbFalso({ painel: painelTeste(), rpcs: { academy_catalogo_publico: catalogo } });

  it("mostra os cursos, quem já tem vira Continuar e o Comprar abre a Hotmart com o e-mail da conta", async () => {
    const { container } = renderizar(<Catalogo />, { rota: "/catalogo", caminho: "/catalogo", sb: sb() });
    const soc = (await screen.findByRole("link", { name: "SOC Analyst: Formação Completa" })).closest("article")!;
    expect(within(soc).getByText("Intermediário, 80 h")).toBeInTheDocument();
    expect(within(soc).getByText("ou em até 12x no cartão")).toBeInTheDocument();
    const comprar = within(soc).getByRole("link", { name: /^Comprar/ });
    const u = new URL(comprar.getAttribute("href")!);
    expect(u.searchParams.get("sck")).toBe("portal");
    expect(u.searchParams.get("email")).toBe("ana@empresa.com.br");
    expect(comprar).toHaveAttribute("target", "_blank");

    // A aluna já tem Fundamentos para SOC (painel de teste).
    const meu = screen.getByRole("link", { name: "Fundamentos para SOC" }).closest("article")!;
    expect(within(meu).getByRole("link", { name: "Continuar" })).toHaveAttribute("href", "/cursos/fundamentos-para-soc");
    expect(within(meu).queryByRole("link", { name: /Comprar/ })).toBeNull();

    const breve = screen.getByRole("link", { name: "Preparatório SC-900" }).closest("article")!;
    expect(within(breve).getByText(/Em breve/)).toBeInTheDocument();
    expect(within(breve).getByRole("link", { name: "Ver ementa" })).toHaveAttribute("href", "/catalogo/sc-900-prep");
    expect(await violacoesGraves(container)).toEqual([]);
  });

  it("filtra por trilha, na ordem da trilha", async () => {
    renderizar(<Catalogo />, { rota: "/catalogo", caminho: "/catalogo", sb: sb() });
    await screen.findByRole("link", { name: "Preparatório SC-900" });
    await userEvent.click(screen.getByRole("button", { name: "Certificações" }));
    expect(screen.getByRole("button", { name: "Certificações" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("link", { name: "SOC Analyst: Formação Completa" })).toBeNull();
    expect(screen.getByText("Preparatórios.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Todas" }));
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });

  it("página do curso: sobre, ementa com aulas, quem ensina e o aviso do e-mail da compra", async () => {
    const { container } = renderizar(<CursoCatalogoPagina />, { rota: "/catalogo/soc-analyst", caminho: "/catalogo/:slug", sb: sb() });
    expect(await screen.findByRole("heading", { level: 1, name: "SOC Analyst: Formação Completa" })).toBeInTheDocument();
    expect(screen.getByText("Intermediário, 80 h, 2 módulos")).toBeInTheDocument();
    const ementa = screen.getByRole("region", { name: "Ementa" });
    expect(within(ementa).getByText("Módulo 1: Introdução ao SOC")).toBeInTheDocument();
    expect(within(ementa).getByText("O que um SOC faz")).toBeInTheDocument();
    expect(screen.getByText("Everton Lima")).toBeInTheDocument();
    const lateral = screen.getByRole("complementary", { name: "Matrícula" });
    expect(within(lateral).getByText("ana@empresa.com.br")).toBeInTheDocument();
    expect(within(lateral).getByRole("link", { name: /^Comprar/ })).toBeInTheDocument();
    expect(await violacoesGraves(container)).toEqual([]);
  });

  it("curso fora do catálogo é 404", async () => {
    renderizar(<CursoCatalogoPagina />, { rota: "/catalogo/nao-existe", caminho: "/catalogo/:slug", sb: sb() });
    expect(await screen.findByRole("heading", { name: /não encontrada|não encontrado/i })).toBeInTheDocument();
  });
});

// Painel do admin ------------------------------------------------------------------

const cursoAdm: CursoAdm = {
  slug: "soc-analyst",
  titulo: "SOC Analyst: Formação Completa",
  descricao: "",
  nivel: "intermediario",
  gratuito: false,
  publicado: true,
  ordem: 10,
  eh_admin: true,
  requisitos: null,
  questoes_final: 0,
  questoes_final_publicadas: 0,
  modulos: [],
};

function vitrine(over: Partial<VitrineAdm> = {}): VitrineAdm {
  return {
    curso: "soc-analyst",
    situacao: "em_breve",
    situacao_efetiva: "em_breve",
    checkout_url: null,
    hotmart_produto_id: null,
    preco_centavos: null,
    preco_observacao: "",
    preco_conferido_em: null,
    atualizado_em: "2026-11-19T10:00:00Z",
    trilhas: [
      { slug: "soc", titulo: "SOC", publicado: true, no_curso: true },
      { slug: "red-team", titulo: "Red Team", publicado: true, no_curso: false },
    ],
    pendencias: ["sem_instrutor"],
    ...over,
  };
}

type Rpcs = NonNullable<NonNullable<Parameters<typeof sbFalso>[0]>["rpcs"]>;

function painel(rota: string, rpcs: Rpcs) {
  return renderizar(
    <ProvedorAvisos>
      <Routes>
        <Route element={<AreaInstrutor />}>
          <Route path="cursos/:slug" element={<CursoInstrutor />} />
          <Route path="trilhas" element={<TrilhasInstrutor />} />
        </Route>
      </Routes>
    </ProvedorAvisos>,
    { rota, caminho: "/instrutor/*", sb: sbFalso({ rpcs }) },
  );
}

describe("vitrine no painel", () => {
  it("instrutor não vê a aba Vitrine nem a página de trilhas", async () => {
    painel("/instrutor/cursos/soc-analyst", {
      academy_adm_eu: { papel: "instrutor", cursos: ["soc-analyst"] },
      academy_adm_curso: { ...cursoAdm, eh_admin: false },
    });
    await screen.findByRole("tab", { name: "Estrutura" });
    expect(screen.queryByRole("tab", { name: "Vitrine" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Trilhas" })).toBeNull();
  });

  it("admin coloca à venda: link de checkout, código do produto, preço e trilhas", async () => {
    const salvar = vi.fn((args: Record<string, unknown>) => ({ data: vitrine({ ...(args.p_dados as object), atualizado_em: "2026-11-19T11:00:00Z" }) }));
    const { container } = painel("/instrutor/cursos/soc-analyst?aba=vitrine", {
      academy_adm_eu: { papel: "admin", cursos: [] },
      academy_adm_curso: cursoAdm,
      academy_adm_vitrine: vitrine(),
      academy_adm_salvar_vitrine: salvar,
    });
    expect(await screen.findByRole("heading", { name: "Onde o curso aparece" })).toBeInTheDocument();
    expect(screen.getByText("Diga quem ensina.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("radio", { name: /À venda/ }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Red Team" }));
    await userEvent.type(screen.getByLabelText("Link de checkout"), "https://go.hotmart.com/A1234567B");
    await userEvent.type(screen.getByLabelText("Código do produto"), "4455667");
    await userEvent.type(screen.getByLabelText("Preço (R$)"), "497,00");
    await userEvent.click(screen.getByRole("button", { name: "Salvar vitrine" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("https://pay.hotmart.com/");
    expect(salvar).not.toHaveBeenCalled();

    const link = screen.getByLabelText("Link de checkout");
    await userEvent.clear(link);
    await userEvent.type(link, CHECKOUT);
    await userEvent.click(screen.getByRole("button", { name: "Salvar vitrine" }));
    await waitFor(() => expect(salvar).toHaveBeenCalled());
    expect(salvar.mock.calls[0]![0]).toEqual({
      p_curso: "soc-analyst",
      p_dados: {
        situacao: "a_venda",
        trilhas: ["soc", "red-team"],
        checkout_url: CHECKOUT,
        hotmart_produto_id: "4455667",
        preco_centavos: 49700,
        preco_observacao: "",
        conferir_preco: false,
      },
    });
    expect(await violacoesGraves(container)).toEqual([]);
  });

  it("avisa quando o preço não é conferido na Hotmart há mais de 30 dias", async () => {
    painel("/instrutor/cursos/soc-analyst?aba=vitrine", {
      academy_adm_eu: { papel: "admin", cursos: [] },
      academy_adm_curso: cursoAdm,
      academy_adm_vitrine: vitrine({ situacao: "a_venda", situacao_efetiva: "a_venda", preco_centavos: 49700, checkout_url: CHECKOUT, preco_conferido_em: "2026-01-10T12:00:00Z", pendencias: [] }),
    });
    expect(await screen.findByText(/conferido na Hotmart em 10\/01\/2026, há \d+ dias/)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Conferi agora que o preço na Hotmart é este" })).toBeInTheDocument();
    expect(screen.getByText(/A página do curso tem tudo/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver a página no site/ })).toHaveAttribute("href", "https://www.cydef.com.br/pt/cursos/soc-analyst/");
  });

  it("mostra o erro do banco na voz do painel", async () => {
    painel("/instrutor/cursos/soc-analyst?aba=vitrine", {
      academy_adm_eu: { papel: "admin", cursos: [] },
      academy_adm_curso: cursoAdm,
      academy_adm_vitrine: vitrine(),
      academy_adm_salvar_vitrine: () => ({ error: { message: "curso_nao_publicado" } }),
    });
    fireEvent.click(await screen.findByRole("button", { name: "Salvar vitrine" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Publique o curso antes de colocar à venda.");
  });
});

describe("trilhas no painel", () => {
  const trilhas: TrilhaAdm[] = [
    { slug: "soc", titulo: "SOC", descricao: "Centro de operações.", ordem: 1, publicado: true, formacao: null, cursos: [
      { slug: "soc-analyst", titulo: "SOC Analyst", ordem: 1, situacao: "a_venda" },
      { slug: "malware-analysis", titulo: "Análise de Malware", ordem: 2, situacao: "em_breve" },
    ] },
    { slug: "grc", titulo: "GRC", descricao: "", ordem: 2, publicado: false, formacao: null, cursos: [] },
  ];

  it("lista, ordena e cria trilhas", async () => {
    const mover = vi.fn(() => ({ data: trilhas }));
    const moverCurso = vi.fn(() => ({ data: trilhas }));
    const criar = vi.fn(() => ({ data: trilhas }));
    const { container } = painel("/instrutor/trilhas", {
      academy_adm_eu: { papel: "admin", cursos: [] },
      academy_adm_trilhas: trilhas,
      academy_adm_mover_trilha: mover,
      academy_adm_mover_na_trilha: moverCurso,
      academy_adm_salvar_trilha: criar,
    });
    expect(await screen.findByRole("heading", { name: /^GRC/ })).toHaveTextContent("Não publicada");
    expect(screen.getByText("Nenhum curso nesta trilha ainda.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Subir a trilha SOC" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Descer a trilha SOC" }));
    await waitFor(() => expect(mover).toHaveBeenCalledWith({ p_slug: "soc", p_direcao: 1 }));
    fireEvent.click(screen.getByRole("button", { name: "Subir Análise de Malware na trilha SOC" }));
    await waitFor(() => expect(moverCurso).toHaveBeenCalledWith({ p_trilha: "soc", p_curso: "malware-analysis", p_direcao: -1 }));
    expect(screen.getByRole("link", { name: "SOC Analyst" })).toHaveAttribute("href", "/instrutor/cursos/soc-analyst?aba=vitrine");

    await userEvent.click(screen.getByRole("button", { name: "Nova trilha" }));
    await userEvent.type(screen.getByLabelText("Nome da trilha"), "Segurança em Nuvem");
    expect(screen.getByLabelText("Endereço")).toHaveValue("seguranca-em-nuvem");
    await userEvent.click(screen.getByRole("button", { name: "Criar trilha" }));
    await waitFor(() =>
      expect(criar).toHaveBeenCalledWith({ p_slug: "", p_dados: { slug: "seguranca-em-nuvem", titulo: "Segurança em Nuvem", descricao: "", publicado: true } }),
    );
    expect(await violacoesGraves(container)).toEqual([]);
  });
});
