import { describe, expect, it } from "vitest";
import { Route, Routes } from "react-router";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizar, sbFalso } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import { ProvedorAvisos } from "@/components/ui/Avisos";
import type { FichaPessoa, Indicadores, PessoaLista } from "@/lib/admin";
import AreaInstrutor from "./Area";
import IndicadoresAdm from "./Indicadores";
import PessoasAdm from "./Pessoas";
import PessoaAdm from "./Pessoa";

type Rpcs = NonNullable<NonNullable<Parameters<typeof sbFalso>[0]>["rpcs"]>;

const dias = Array.from({ length: 30 }, (_, i) => ({
  dia: new Date(Date.UTC(2026, 9, 23 + i)).toISOString().slice(0, 10),
  pre_inscricoes: i === 29 ? 3 : 0,
  contas: i === 29 ? 1 : 0,
}));

const indicadores: Indicadores = {
  gerado_em: "2026-11-21T15:00:00Z",
  pre_inscricoes: { total: 42, ult_7: 9, ult_30: 30 },
  contas: { total: 25, ult_7: 6, ult_30: 20 },
  ativos: { ult_7: 11, ult_30: 19 },
  certificados: { total: 3, ult_30: 3 },
  funil: { pre_inscritos: 42, entraram: 25, comecaram: 18, concluiram_curso: 4, certificados: 3 },
  por_dia: dias,
  perfil_declarado: { iniciante: 20, transicao: 12, profissional: 10 },
  areas: { seguranca: 5 },
  experiencia: {},
  cursos: [
    { slug: "cybersecurity-fundamentals", titulo: "Cybersecurity Fundamentals", gratuito: true, aulas: 5, matriculados: 25, comecaram: 18, concluiram: 4, media_conclusao: 37, aprovados_final: 3, certificados: 3 },
  ],
};

const ana: PessoaLista = {
  tipo: "conta", user_id: "u-ana", lead_id: "l-ana", nome: "Ana Souza", email: "ana@exemplo.com", papel: null, perfil_declarado: "iniciante",
  cadastro_em: "2026-11-20T12:00:00Z", ultimo_acesso_em: "2026-11-21T12:00:00Z", cursos: 2, certificados: 1,
};
const so: PessoaLista = {
  tipo: "pre_inscricao", user_id: null, lead_id: "l-bia", nome: "Bia Lima", email: "bia@exemplo.com", papel: null, perfil_declarado: "transicao",
  cadastro_em: "2026-11-21T09:00:00Z", ultimo_acesso_em: null, cursos: 0, certificados: 0,
};

const ficha: FichaPessoa = {
  user_id: "u-ana",
  perfil: {
    nome: "Ana Souza", email: "ana@exemplo.com", data_nascimento: null, telefone: null, cidade: "Recife", pais: "Brasil", empresa: null, cargo: null,
    area: null, experiencia: null, bio: null, linkedin: null, atualizado_em: null,
  },
  criado_em: "2026-11-20T12:00:00Z",
  ultimo_acesso_em: "2026-11-21T12:00:00Z",
  papel: null,
  eu: false,
  cursos_equipe: [],
  pre_inscricao: { perfil: "iniciante", criado_em: "2026-11-20T11:00:00Z", status: "confirmed" },
  cursos: [
    { slug: "cybersecurity-fundamentals", titulo: "Cybersecurity Fundamentals", origem: "gratuito", matriculado_em: "2026-11-20T12:00:00Z", progresso: { aulas: 5, concluidas: 2, ultima_atividade: "2026-11-21T12:00:00Z" } },
  ],
  certificados: [],
  missoes: { tentativas: 1, aprovadas: 0 },
};

function painel(rota: string, rpcs: Rpcs, papel: "admin" | "instrutor" = "admin") {
  return renderizar(
    <ProvedorAvisos>
      <Routes>
        <Route element={<AreaInstrutor />}>
          <Route path="indicadores" element={<IndicadoresAdm />} />
          <Route path="pessoas" element={<PessoasAdm />} />
          <Route path="pessoas/:id" element={<PessoaAdm />} />
        </Route>
      </Routes>
    </ProvedorAvisos>,
    {
      rota,
      caminho: "/instrutor/*",
      sb: sbFalso({
        rpcs: {
          academy_adm_eu: { papel, cursos: [] },
          academy_adm_cursos: [
            { slug: "cybersecurity-fundamentals", titulo: "Cybersecurity Fundamentals", gratuito: true },
            { slug: "fundamentos-para-soc", titulo: "Fundamentos para SOC", gratuito: true },
          ],
          ...rpcs,
        },
      }),
    },
  );
}

describe("painel do admin: indicadores e pessoas", () => {
  it("instrutor não vê as abas nem as páginas", async () => {
    painel("/instrutor/pessoas", {}, "instrutor");
    expect(await screen.findByRole("heading", { name: /não encontrada/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Pessoas" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Indicadores" })).toBeNull();
  });

  it("indicadores: números, funil com porcentagem, curso e perfis", async () => {
    const { container } = painel("/instrutor/indicadores", { academy_adm_indicadores: indicadores });
    expect(await screen.findByRole("heading", { level: 1, name: "Indicadores" })).toBeInTheDocument();
    const gerais = await screen.findByRole("region", { name: "Números gerais" });
    expect(within(gerais).getByText("42")).toBeInTheDocument();
    expect(within(gerais).getByText("9 nos últimos 7 dias")).toBeInTheDocument();
    const funil = screen.getByRole("region", { name: "Da pré-inscrição ao certificado" });
    expect(within(funil).getByText("Entraram no portal").closest("li")).toHaveTextContent("25 (60%)");
    const linha = screen.getByRole("rowheader", { name: /Cybersecurity Fundamentals/ }).closest("tr")!;
    expect(linha).toHaveTextContent("37%");
    expect(screen.getByText("Em transição para SOC")).toBeInTheDocument();
    expect(screen.getByText("Segurança da informação")).toBeInTheDocument();
    expect(screen.getAllByText("Ninguém preencheu ainda em Meu perfil.")).toHaveLength(1);
    expect(await violacoesGraves(container)).toEqual([]);
  });

  it("pessoas: lista conta e pré-inscrição, busca e filtra no servidor", async () => {
    const chamadas: Record<string, unknown>[] = [];
    painel("/instrutor/pessoas", {
      academy_adm_pessoas: (a) => {
        chamadas.push(a);
        return { data: a.p_filtro === "sem_conta" ? { total: 1, itens: [so] } : { total: 2, itens: [so, ana] } };
      },
    });
    expect(await screen.findByText("2 pessoas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ana Souza/ })).toHaveAttribute("href", "/instrutor/pessoas/u-ana");
    expect(screen.queryByRole("link", { name: /Bia Lima/ })).toBeNull();
    expect(screen.getByText("Ainda não entrou no portal")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Só pré-inscrição" }));
    expect(await screen.findByText("1 pessoa")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("searchbox", { name: "Buscar por nome ou e-mail" }), "bia");
    await waitFor(() => expect(chamadas.at(-1)).toMatchObject({ p_busca: "bia", p_filtro: "sem_conta", p_offset: 0 }));
  });

  it("ficha: e-mail só leitura, salva o perfil e muda o papel para instrutor com cursos", async () => {
    const salvos: Record<string, unknown>[] = [];
    const papeis: Record<string, unknown>[] = [];
    const { container } = painel("/instrutor/pessoas/u-ana", {
      academy_adm_pessoa: ficha,
      academy_adm_salvar_perfil: (a) => {
        salvos.push(a);
        return { data: { ...ficha, perfil: { ...ficha.perfil, empresa: "Empresa X", atualizado_em: "2026-11-21T16:00:00Z" } } };
      },
      academy_adm_definir_equipe: (a) => {
        papeis.push(a);
        return { data: [] };
      },
    });
    expect(await screen.findByRole("heading", { level: 1, name: "Ana Souza" })).toBeInTheDocument();
    expect(screen.getByText("O e-mail é o login da pessoa e não muda por aqui.")).toBeInTheDocument();
    expect(screen.getByText("2 de 5 aulas")).toBeInTheDocument();
    expect(screen.getByText(/Missões: 1 tentativa enviada, 0 aprovadas/)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("Empresa onde trabalha"), "Empresa X");
    await userEvent.click(screen.getByRole("button", { name: "Salvar perfil" }));
    await waitFor(() => expect(salvos).toHaveLength(1));
    expect(salvos[0]).toMatchObject({ p_user_id: "u-ana", p_dados: { empresa: "Empresa X", nome: "Ana Souza" } });
    expect((salvos[0]!.p_dados as object)).not.toHaveProperty("email");

    const papel = screen.getByRole("form", { name: "Papel" });
    expect(within(papel).getByRole("button", { name: "Salvar papel" })).toBeDisabled();
    await userEvent.click(within(papel).getByRole("radio", { name: /Instrutor/ }));
    await userEvent.click(await within(papel).findByRole("checkbox", { name: "Fundamentos para SOC" }));
    await userEvent.click(within(papel).getByRole("button", { name: "Salvar papel" }));
    await waitFor(() => expect(papeis).toEqual([{ p_email: "ana@exemplo.com", p_papel: "instrutor", p_cursos: ["fundamentos-para-soc"] }]));
    expect(await violacoesGraves(container)).toEqual([]);
  });

  it("ficha de quem não existe vira 404", async () => {
    painel("/instrutor/pessoas/nao-existe", { academy_adm_pessoa: () => ({ error: { message: "pessoa_inexistente" } }) });
    expect(await screen.findByRole("heading", { name: /não encontrada/i })).toBeInTheDocument();
  });
});
