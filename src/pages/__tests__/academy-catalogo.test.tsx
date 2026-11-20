import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import i18n, { ensureLang } from "@/i18n";

/**
 * Fase 14: páginas da Academy lidas do catálogo do banco. O catálogo de teste
 * tem um curso à venda (com aula publicada e instrutor), um em breve e duas
 * trilhas, para cobrir os dois estados da página do curso.
 */
vi.mock("@/lib/academy/catalogo-snapshot.json", () => ({
  default: {
    trilhas: [
      { slug: "soc", titulo: "SOC", descricao: "Para quem quer trabalhar em SOC.", cursos: ["soc-analyst", "malware-analysis"] },
      { slug: "certificacoes", titulo: "Certificações", descricao: "Preparatórios.", cursos: ["sc-900-prep"] },
    ],
    cursos: [
      {
        slug: "soc-analyst",
        titulo: "SOC Analyst: Formação Completa",
        descricao: "Formação para analista SOC N1 e N2.",
        nivel: "intermediario",
        objetivos: ["Triar alertas no SIEM", "Investigar incidentes"],
        publico: "Quem quer trabalhar em SOC.",
        pre_requisitos: "Redes e sistemas operacionais.",
        situacao: "a_venda",
        carga_horaria_h: 80,
        preco_centavos: 49700,
        preco_observacao: "ou em até 12x no cartão",
        checkout_url: "https://pay.hotmart.com/A1234567B?off=ab12cd",
        trilhas: ["soc"],
        modulos: [
          { ordem: 1, titulo: "Introdução ao SOC", resumo: "Estrutura e processos.", aulas: [{ titulo: "O que um SOC faz", duracao_seg: 600 }] },
          { ordem: 2, titulo: "Análise de Logs", resumo: "Logs de sistema e rede.", aulas: [] },
        ],
        instrutores: [
          { nome: "Everton Lima", cargo: "Wazuh Ambassador", bio: "Especialista em SOC.", linkedin: "https://www.linkedin.com/in/teste", site: null, papel: "instrutor" },
          { nome: "Convidada Teste", cargo: "Threat Intel", bio: "", linkedin: null, site: null, papel: "convidado" },
        ],
        atualizado_em: "2026-11-19T12:00:00+00:00",
      },
      {
        slug: "malware-analysis",
        titulo: "Análise de Malware para SOC",
        descricao: "Malware no contexto SOC.",
        nivel: "avancado",
        objetivos: [],
        publico: "",
        pre_requisitos: "",
        situacao: "em_breve",
        carga_horaria_h: 40,
        preco_centavos: null,
        preco_observacao: "",
        checkout_url: null,
        trilhas: ["soc"],
        modulos: [],
        instrutores: [],
        atualizado_em: "2026-11-19T12:00:00+00:00",
      },
      {
        slug: "sc-900-prep",
        titulo: "Preparatório SC-900",
        descricao: "Preparação para o exame SC-900.",
        nivel: "iniciante",
        objetivos: [],
        publico: "",
        pre_requisitos: "",
        situacao: "em_breve",
        carga_horaria_h: 30,
        preco_centavos: null,
        preco_observacao: "",
        checkout_url: null,
        trilhas: ["certificacoes"],
        modulos: [],
        instrutores: [],
        atualizado_em: "2026-11-19T12:00:00+00:00",
      },
    ],
    ofertas: [
      { tipo: "plataforma", nome: "Academy completa", trilha: null, duracao_dias: 365, cursos: 3, preco_centavos: 99700, preco_observacao: "ou 12x", checkout_url: "https://pay.hotmart.com/P1234567Q" },
      { tipo: "trilha", nome: "Trilha SOC", trilha: "soc", duracao_dias: null, cursos: 2, preco_centavos: 69700, preco_observacao: "", checkout_url: "https://pay.hotmart.com/T7654321R" },
    ],
  },
}));

const { default: CoursePage } = await import("@/pages/CoursePage");
const { default: AcademyCatalogo } = await import("@/pages/AcademyCatalogo");
const { default: Academy } = await import("@/pages/Academy");
const { linkCompraSite, cargaHoraria } = await import("@/lib/academy/catalogo");

const naRota = (rota: string, padrao: string, elemento: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route path={padrao} element={elemento} />
        <Route path="/pt/cursos/:courseId" element={<p>página em pt</p>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(async () => {
  await ensureLang("pt");
  await i18n.changeLanguage("pt");
});
afterEach(async () => {
  await i18n.changeLanguage("en");
});

describe("página do curso (catálogo do banco)", () => {
  it("curso à venda: preço, Comprar com origem site, ementa, quem ensina e dados estruturados", () => {
    const { container } = naRota("/pt/cursos/soc-analyst", "/pt/cursos/:courseId", <CoursePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("SOC Analyst: Formação Completa");
    const lateral = screen.getByRole("complementary", { name: "Investimento" });
    expect(within(lateral).getByText(/R\$\s?497,00/)).toBeInTheDocument();
    expect(within(lateral).getByText("ou em até 12x no cartão")).toBeInTheDocument();

    const compras = screen.getAllByRole("link", { name: /^Comprar/ });
    expect(compras).toHaveLength(2);
    for (const a of compras) {
      const u = new URL(a.getAttribute("href")!);
      expect(u.hostname).toBe("pay.hotmart.com");
      expect(u.searchParams.get("sck")).toBe("site");
      expect(u.searchParams.get("off")).toBe("ab12cd");
      expect(u.searchParams.get("email")).toBeNull();
      expect(a).toHaveAttribute("target", "_blank");
    }

    expect(screen.getByRole("heading", { name: "Ementa" })).toBeInTheDocument();
    expect(screen.getByText("O que um SOC faz")).toBeInTheDocument();
    expect(screen.getByText("10 min")).toBeInTheDocument();
    expect(screen.getByText("Triar alertas no SIEM")).toBeInTheDocument();
    expect(screen.getByText("Everton Lima")).toBeInTheDocument();
    expect(screen.getByText("Participação especial")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LinkedIn de Everton Lima" })).toHaveAttribute("href", "https://www.linkedin.com/in/teste");
    expect(screen.getByText("Como funciona")).toBeInTheDocument();

    const ld = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(ld).toMatchObject({
      "@type": "Course",
      name: "SOC Analyst: Formação Completa",
      inLanguage: "pt-BR",
      offers: { "@type": "Offer", price: "497.00", priceCurrency: "BRL" },
      hasCourseInstance: { courseWorkload: "PT4800M", instructor: [{ name: "Everton Lima" }, { name: "Convidada Teste" }] },
    });
    expect(container.textContent).not.toContain("—");
  });

  it("curso em breve: sem preço, com Avise-me por e-mail", () => {
    const { container } = naRota("/pt/cursos/malware-analysis", "/pt/cursos/:courseId", <CoursePage />);
    expect(screen.queryByRole("link", { name: /Comprar/ })).toBeNull();
    const avise = screen.getAllByRole("link", { name: "Avise-me por e-mail" });
    expect(avise[0]).toHaveAttribute("href", expect.stringContaining("mailto:academy@cydef.com.br"));
    expect(container.textContent).not.toMatch(/R\$/);
    const ld = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(ld.offers).toBeUndefined();
  });

  it("em inglês e espanhol, a página do curso leva para a versão em português", async () => {
    await i18n.changeLanguage("en");
    naRota("/en/courses/soc-analyst", "/en/courses/:courseId", <CoursePage />);
    expect(screen.getByText("página em pt")).toBeInTheDocument();
  });

  it("curso fora do catálogo mostra que não existe e volta para o catálogo", () => {
    naRota("/pt/cursos/nao-existe", "/pt/cursos/:courseId", <CoursePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Curso não encontrado");
    expect(screen.getByRole("link", { name: "Voltar para o catálogo" })).toHaveAttribute("href", "/pt/academy/catalogo");
  });

  it("o link de compra só sai para checkout da Hotmart", () => {
    expect(linkCompraSite({ situacao: "a_venda", checkout_url: "https://evil.com/x" })).toBeNull();
    expect(linkCompraSite({ situacao: "em_breve", checkout_url: "https://pay.hotmart.com/A1234567B" })).toBeNull();
    expect(cargaHoraria(1.5)).toBe("1,5 h");
    expect(cargaHoraria(80)).toBe("80 h");
  });
});

describe("catálogo completo", () => {
  it("lista todos os cursos e filtra por trilha e por nível", () => {
    naRota("/pt/academy/catalogo", "/pt/academy/catalogo", <AcademyCatalogo />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Catálogo de cursos");
    expect(screen.getAllByRole("article")).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: "Certificações" }));
    expect(screen.getByRole("button", { name: "Certificações" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByText("Preparatórios.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Avançado" }));
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByText("Nenhum curso com esses filtros.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });

  it("cada card leva à página do curso em pt e mostra preço só do que está à venda", () => {
    naRota("/pt/academy/catalogo", "/pt/academy/catalogo", <AcademyCatalogo />);
    const soc = screen.getByRole("link", { name: "SOC Analyst: Formação Completa" });
    expect(soc).toHaveAttribute("href", "/pt/cursos/soc-analyst");
    const card = soc.closest("article")!;
    expect(within(card).getByText("Matrículas abertas")).toBeInTheDocument();
    expect(within(card).getByText(/R\$\s?497,00/)).toBeInTheDocument();
    const breve = screen.getByRole("link", { name: "Preparatório SC-900" }).closest("article")!;
    expect(within(breve).getByText("Em breve")).toBeInTheDocument();
    expect(within(breve).queryByText(/R\$/)).toBeNull();
  });

  it("em inglês, avisa que o curso é em português", async () => {
    await i18n.changeLanguage("en");
    naRota("/en/academy/catalogo", "/en/academy/catalogo", <AcademyCatalogo />);
    expect(screen.getAllByText("Taught in Portuguese")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "SOC Analyst: Formação Completa" })).toHaveAttribute("href", "/pt/cursos/soc-analyst");
  });
});

describe("página da Academy por trilhas", () => {
  it("um bloco por trilha, na ordem do painel, e o link para o catálogo completo", () => {
    naRota("/pt/academy", "/pt/academy", <Academy />);
    const blocos = screen.getAllByRole("heading", { level: 3 }).filter((h) => h.id.startsWith("trilha-"));
    expect(blocos.map((h) => h.textContent)).toEqual(["SOC", "Certificações"]);
    expect(screen.getByRole("link", { name: /Ver catálogo completo/ })).toHaveAttribute("href", "/pt/academy/catalogo");
  });
});

describe("ofertas de trilha e de plataforma (fase 16b)", () => {
  it("a página da Academy mostra a plataforma toda e o Comprar da trilha, com origem site", () => {
    naRota("/pt/academy", "/pt/academy", <Academy />);
    const plataforma = screen.getByRole("region", { name: "Acesso a toda a Academy" });
    expect(within(plataforma).getByText("Todos os 3 cursos pagos, e os que forem lançados no período, por 12 meses.")).toBeInTheDocument();
    expect(within(plataforma).getByText(/R\$\s?997,00/)).toBeInTheDocument();
    const comprar = within(plataforma).getByRole("link", { name: /^Comprar/ });
    expect(new URL(comprar.getAttribute("href")!).searchParams.get("sck")).toBe("site");

    const trilha = screen.getByRole("link", { name: "Comprar a trilha SOC (abre em nova aba)" });
    const u = new URL(trilha.getAttribute("href")!);
    expect(u.pathname).toBe("/T7654321R");
    expect(u.searchParams.get("sck")).toBe("site");
    expect(screen.queryByRole("link", { name: /Comprar a trilha Certificações/ })).toBeNull();
  });

  it("no catálogo, a oferta da trilha aparece ao filtrar por ela", () => {
    naRota("/pt/academy/catalogo", "/pt/academy/catalogo", <AcademyCatalogo />);
    expect(screen.getByRole("region", { name: "Acesso a toda a Academy" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Comprar a trilha SOC/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "SOC" }));
    expect(screen.getByRole("link", { name: /Comprar a trilha SOC/ })).toBeInTheDocument();
  });
});
