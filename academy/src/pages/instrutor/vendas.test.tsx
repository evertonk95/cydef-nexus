import { describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizar, sbFalso } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import { ProvedorAvisos } from "@/components/ui/Avisos";
import type { Concessao, Produtos } from "@/lib/vendas";
import AreaInstrutor from "./Area";
import VendasInstrutor from "./Vendas";

type Rpcs = NonNullable<NonNullable<Parameters<typeof sbFalso>[0]>["rpcs"]>;

const compra: Concessao = {
  id: "c1",
  email: "pessoal@exemplo.com",
  nome: "Bia Compradora",
  origem: "hotmart",
  escopo: "curso",
  curso: "soc-analyst",
  trilha: null,
  cursos: [],
  alvo: "SOC Analyst: Formação Completa",
  inicio: "2026-11-19T15:00:00Z",
  fim: null,
  transacao: "HP1234567890",
  produto: 1001,
  revogada_em: null,
  motivo: null,
  conta: false,
  situacao: "ativa",
  criado_em: "2026-11-19T15:00:00Z",
};

const produtos: Produtos = {
  produtos: [{ hotmart_produto_id: 3003, nome: "Academy completa por 12 meses", escopo: "plataforma", trilha: null, trilha_titulo: null, duracao_dias: 365, ativo: true, vendas: 2 }],
  cursos: [{ hotmart_produto_id: 1001, curso: "soc-analyst", titulo: "SOC Analyst: Formação Completa", vendas: 1 }],
  eventos: [{ evento: "PURCHASE_APPROVED", resultado: "liberado", produto: 1001, transacao: "HP1234567890", recebido_em: "2026-11-19T15:00:00Z" }],
};

function painel(rpcs: Rpcs, papel: "admin" | "instrutor" = "admin") {
  return renderizar(
    <ProvedorAvisos>
      <Routes>
        <Route element={<AreaInstrutor />}>
          <Route path="vendas" element={<VendasInstrutor />} />
        </Route>
      </Routes>
    </ProvedorAvisos>,
    {
      rota: "/instrutor/vendas",
      caminho: "/instrutor/*",
      sb: sbFalso({
        rpcs: {
          academy_adm_eu: { papel, cursos: [] },
          academy_adm_concessoes: [compra],
          academy_adm_produtos: produtos,
          academy_adm_cursos: [{ slug: "soc-analyst", titulo: "SOC Analyst", gratuito: false }, { slug: "fundamentos-para-soc", titulo: "Fundamentos", gratuito: true }],
          academy_adm_trilhas: [{ slug: "soc", titulo: "SOC", descricao: "", ordem: 1, publicado: true, formacao: null, cursos: [] }],
          ...rpcs,
        },
      }),
    },
  );
}

describe("vendas e acessos no painel", () => {
  it("instrutor não vê a página nem o menu", async () => {
    painel({}, "instrutor");
    expect(await screen.findByRole("heading", { name: /não encontrada/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Vendas" })).toBeNull();
  });

  it("lista a compra da Hotmart e transfere para o e-mail da conta", async () => {
    const transferir = vi.fn(() => ({ data: { ...compra, email: "trabalho@exemplo.com" } }));
    const { container } = painel({ academy_adm_transferir_concessao: transferir });
    const linha = await screen.findByRole("listitem", { name: "SOC Analyst: Formação Completa, pessoal@exemplo.com" });
    expect(within(linha).getByText("Hotmart, HP1234567890")).toBeInTheDocument();
    expect(within(linha).getByText(/vitalício/)).toBeInTheDocument();
    expect(within(linha).getByText(/ainda sem conta no portal/)).toBeInTheDocument();
    await userEvent.click(within(linha).getByRole("button", { name: "Transferir" }));
    await userEvent.type(within(linha).getByLabelText("Novo e-mail"), "trabalho@exemplo.com");
    await userEvent.click(within(linha).getByRole("button", { name: "Transferir acesso" }));
    await waitFor(() => expect(transferir).toHaveBeenCalledWith({ p_id: "c1", p_email: "trabalho@exemplo.com" }));
    expect(await violacoesGraves(container)).toEqual([]);
  });

  it("encerrar pede motivo e mostra o erro do banco", async () => {
    painel({ academy_adm_revogar_concessao: () => ({ error: { message: "motivo_obrigatorio" } }) });
    const linha = await screen.findByRole("listitem", { name: /pessoal@exemplo.com/ });
    fireEvent.click(within(linha).getByRole("button", { name: "Encerrar" }));
    await userEvent.type(within(linha).getByLabelText("Motivo do encerramento"), "abc");
    fireEvent.click(within(linha).getByRole("button", { name: "Encerrar acesso" }));
    expect(await within(linha).findByRole("alert")).toHaveTextContent("Escreva o motivo");
  });

  it("libera acesso manual de 12 meses a um curso pago", async () => {
    const conceder = vi.fn(() => ({ data: compra }));
    painel({ academy_adm_conceder: conceder });
    await userEvent.click(await screen.findByRole("button", { name: "Liberar acesso" }));
    const form = screen.getByRole("form", { name: "Liberar acesso" });
    await userEvent.type(within(form).getByLabelText("E-mail"), "parceiro@exemplo.com");
    // Curso gratuito não aparece na lista.
    expect(within(form).queryByRole("option", { name: "Fundamentos" })).toBeNull();
    await userEvent.selectOptions(within(form).getByLabelText("Curso"), "soc-analyst");
    await userEvent.selectOptions(within(form).getByLabelText("Validade"), "365");
    await userEvent.type(within(form).getByLabelText("Motivo"), "Cortesia de parceria");
    await userEvent.click(within(form).getByRole("button", { name: "Liberar acesso" }));
    await waitFor(() =>
      expect(conceder).toHaveBeenCalledWith({
        p_dados: { email: "parceiro@exemplo.com", nome: "", escopo: "curso", curso: "soc-analyst", trilha: null, dias: 365, motivo: "Cortesia de parceria" },
      }),
    );
  });

  it("mostra os produtos e os últimos avisos; cadastra plataforma com 12 meses", async () => {
    const salvar = vi.fn(() => ({ data: produtos }));
    painel({ academy_adm_salvar_produto: salvar });
    expect(await screen.findByText("Academy completa por 12 meses")).toBeInTheDocument();
    expect(screen.getByText("Produto 3003, plataforma toda, 365 dias")).toBeInTheDocument();
    expect(screen.getByText("Fora das vitrines")).toBeInTheDocument();
    expect(screen.getByText("Produto 1001, curso individual, vitalício")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir vitrine" })).toHaveAttribute("href", "/instrutor/cursos/soc-analyst?aba=vitrine");
    expect(screen.getByText("Acesso liberado")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Cadastrar produto" }));
    const form = screen.getByRole("form", { name: "Cadastrar produto" });
    await userEvent.type(within(form).getByLabelText("Código do produto"), "4004");
    await userEvent.type(within(form).getByLabelText("Nome"), "Trilha SOC completa");
    await userEvent.selectOptions(within(form).getByLabelText("O que libera"), "trilha");
    await userEvent.selectOptions(within(form).getByLabelText("Trilha"), "soc");
    await userEvent.click(within(form).getByRole("button", { name: "Salvar produto" }));
    await waitFor(() =>
      expect(salvar).toHaveBeenCalledWith({
        p_dados: {
          situacao: "oculto",
          checkout_url: "",
          preco_centavos: null,
          preco_observacao: "",
          conferir_preco: false,
          hotmart_produto_id: "4004",
          nome: "Trilha SOC completa",
          escopo: "trilha",
          trilha: "soc",
          duracao_dias: null,
          ativo: true,
        },
      }),
    );
  });
});

describe("oferta à venda (fase 16b)", () => {
  it("põe a plataforma à venda com checkout e preço", async () => {
    const salvar = vi.fn<(args: Record<string, unknown>) => { data: Produtos }>(() => ({ data: produtos }));
    painel({ academy_adm_salvar_produto: salvar });
    const linha = (await screen.findByText("Academy completa por 12 meses")).closest("li")!;
    await userEvent.click(within(linha).getByRole("button", { name: "Editar" }));
    const form = screen.getByRole("form", { name: "Editar Academy completa por 12 meses" });
    await userEvent.selectOptions(within(form).getByLabelText("Onde aparece"), "a_venda");
    await userEvent.type(within(form).getByLabelText("Link de checkout"), "https://go.hotmart.com/P1234567Q");
    await userEvent.type(within(form).getByLabelText("Preço (R$)"), "997,00");
    await userEvent.click(within(form).getByRole("button", { name: "Salvar produto" }));
    expect(await within(form).findByRole("alert")).toHaveTextContent("https://pay.hotmart.com/");
    const link = within(form).getByLabelText("Link de checkout");
    await userEvent.clear(link);
    await userEvent.type(link, "https://pay.hotmart.com/P1234567Q");
    await userEvent.click(within(form).getByRole("button", { name: "Salvar produto" }));
    await waitFor(() => expect(salvar).toHaveBeenCalled());
    expect(salvar.mock.calls[0]![0]).toMatchObject({
      p_dados: { situacao: "a_venda", checkout_url: "https://pay.hotmart.com/P1234567Q", preco_centavos: 99700, hotmart_produto_id: "3003", duracao_dias: 365 },
    });
  });
});
