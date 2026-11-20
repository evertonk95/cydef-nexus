import { describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizar, sbFalso } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import { ProvedorAvisos } from "@/components/ui/Avisos";
import { csvProgresso, lerEmails, prazoContrato, type Empresa as TEmpresa, type MinhasEmpresas, type PainelEmpresa } from "@/lib/empresas";
import Convites from "./Convites";
import Empresa from "./Empresa";
import AreaInstrutor from "./instrutor/Area";
import EmpresasInstrutor from "./instrutor/Empresas";

type Rpcs = NonNullable<NonNullable<Parameters<typeof sbFalso>[0]>["rpcs"]>;

const empresa: TEmpresa = {
  id: "e1", nome: "Banco Exemplo", tipo: "consultoria", escopo: "plataforma", curso: null, trilha: null, alvo: "Plataforma toda",
  inicio: "2026-11-20", fim: "2027-11-19", vagas: 5, usadas: 3, ativos: 2, convites: 1, gestoras: ["carla@banco.com"],
  observacao: "", situacao: "vigente", encerrada_em: null, motivo: null, criado_em: "2026-11-20T12:00:00Z",
};

const painel: PainelEmpresa = {
  empresa,
  membros: [
    {
      id: "m1", email: "carla@banco.com", gestor: true, situacao: "ativo", nome: "Carla Gestora", convidado_em: "2026-11-20T12:00:00Z",
      convite_enviado_em: "2026-11-20T12:00:00Z", aceito_em: "2026-11-20T13:00:00Z", ultimo_acesso: "2026-11-20T14:00:00Z", cursos: [],
    },
    {
      id: "m2", email: "ana@banco.com", gestor: false, situacao: "ativo", nome: "Ana Analista", convidado_em: "2026-11-20T12:00:00Z",
      convite_enviado_em: "2026-11-20T12:00:00Z", aceito_em: "2026-11-20T13:00:00Z", ultimo_acesso: "2026-11-20T15:00:00Z",
      cursos: [{ slug: "soc-analyst", titulo: "SOC Analyst", total: 40, concluidas: 12, aprovado: true, certificado_em: "2026-11-20T16:00:00Z" }],
    },
    {
      id: "m3", email: "bruno@banco.com", gestor: false, situacao: "convidado", nome: null, convidado_em: "2026-11-20T12:00:00Z",
      convite_enviado_em: null, aceito_em: null, ultimo_acesso: null, cursos: [],
    },
  ],
};

function gestao(rpcs: Rpcs = {}, funcoes = {}) {
  return renderizar(
    <ProvedorAvisos>
      <Empresa />
    </ProvedorAvisos>,
    { rota: "/empresa/e1", caminho: "/empresa/:id", sb: sbFalso({ rpcs: { academy_empresa_painel: painel, ...rpcs }, funcoes }) },
  );
}

describe("painel da gestora", () => {
  it("mostra vagas, a equipe e o progresso sem nota, e passa no axe", async () => {
    const { container } = gestao();
    expect(await screen.findByRole("heading", { level: 1, name: "Banco Exemplo" })).toBeInTheDocument();
    expect(screen.getByText("Vagas livres").nextSibling).toHaveTextContent("2");
    const ana = screen.getByRole("listitem", { name: "Ana Analista" });
    expect(within(ana).getByText("1 curso iniciado, 1 certificado")).toBeInTheDocument();
    await userEvent.click(within(ana).getByRole("button", { name: "Progresso" }));
    const tabela = within(ana).getByRole("table", { name: "Progresso de Ana Analista" });
    expect(within(tabela).getByRole("row", { name: /SOC Analyst 12 de 40 Aprovado/ })).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/nota/i);
    expect(screen.getByRole("listitem", { name: "bruno@banco.com" })).toHaveTextContent("E-mail ainda não enviado");
    expect(await violacoesGraves(container)).toEqual([]);
  });

  it("convida vários e-mails de uma vez e pede o envio à função", async () => {
    const convidar = vi.fn<(a: Record<string, unknown>) => { data: unknown }>(() => ({ data: { convidados: 2, ja_na_empresa: [] } }));
    const enviar = vi.fn<(c: unknown) => { data: unknown }>(() => ({ data: { enviados: 2, falhas: 0, email: "ligado" } }));
    gestao({ academy_empresa_convidar: convidar }, { "academy-empresa": enviar });
    const form = await screen.findByRole("form", { name: "Convidar pessoas" });
    await userEvent.type(within(form).getByLabelText("E-mails"), "Dani@banco.com, edu@banco.com\ndani@banco.com");
    await userEvent.click(within(form).getByRole("button", { name: "Enviar convites" }));
    await waitFor(() => expect(enviar).toHaveBeenCalledWith({ empresa_id: "e1" }));
    expect(convidar.mock.calls[0]![0]).toEqual({ p_empresa: "e1", p_emails: ["dani@banco.com", "edu@banco.com"], p_gestor: false });
    expect(await screen.findByText("2 convites enviados")).toBeInTheDocument();
  });

  it("e-mail inválido não vai ao banco; e-mail que não sai vira convite registrado", async () => {
    const convidar = vi.fn<(a: Record<string, unknown>) => { data: unknown }>(() => ({ data: { convidados: 1, ja_na_empresa: [] } }));
    gestao({ academy_empresa_convidar: convidar }, { "academy-empresa": () => ({ data: { enviados: 0, falhas: 0, email: "desligado" } }) });
    const form = await screen.findByRole("form", { name: "Convidar pessoas" });
    await userEvent.type(within(form).getByLabelText("E-mails"), "dani@banco");
    await userEvent.click(within(form).getByRole("button", { name: "Enviar convites" }));
    expect(within(form).getByRole("alert")).toHaveTextContent("Confira: dani@banco");
    expect(convidar).not.toHaveBeenCalled();
    await userEvent.clear(within(form).getByLabelText("E-mails"));
    await userEvent.type(within(form).getByLabelText("E-mails"), "dani@banco.com");
    await userEvent.click(within(form).getByRole("button", { name: "Enviar convites" }));
    expect(await screen.findByText("Convite registrado")).toBeInTheDocument();
  });

  it("quem não é da gestão vê 404; contrato encerrado tem aviso próprio", async () => {
    gestao({ academy_empresa_painel: () => ({ error: { message: "sem_permissao" } }) });
    expect(await screen.findByRole("heading", { name: /não encontrada/i })).toBeInTheDocument();
  });

  it("contrato encerrado", async () => {
    gestao({ academy_empresa_painel: () => ({ error: { message: "contrato_encerrado" } }) });
    expect(await screen.findByRole("heading", { name: "Contrato encerrado" })).toBeInTheDocument();
  });
});

const minhas: MinhasEmpresas = {
  convites: [{ id: "m9", empresa: "Banco Exemplo", gestor: false, alvo: "Plataforma toda", inicio: "2026-11-20", fim: "2027-11-19", convidado_em: "2026-11-20T12:00:00Z" }],
  empresas: [],
};

describe("convite recebido", () => {
  it("explica o que a gestão vê antes do aceite e aceita", async () => {
    const aceitar = vi.fn<(a: Record<string, unknown>) => { data: unknown }>(() => ({
      data: { convites: [], empresas: [{ id: "e1", membro: "m9", empresa: "Banco Exemplo", gestor: false, alvo: "Plataforma toda", inicio: "2026-11-20", fim: "2027-11-19", situacao: "vigente", aceito_em: "x", aviso_versao: "v2026.5" }] },
    }));
    const { container } = renderizar(
      <ProvedorAvisos>
        <Routes>
          <Route path="/convites" element={<Convites />} />
          <Route path="/cursos" element={<p>meus cursos</p>} />
        </Routes>
      </ProvedorAvisos>,
      { rota: "/convites", caminho: "/*", sb: sbFalso({ rpcs: { academy_minhas_empresas: minhas, academy_aceitar_convite: aceitar } }) },
    );
    const cartao = await screen.findByRole("region", { name: "Banco Exemplo" });
    expect(within(cartao).getByText("Libera todos os cursos pagos da Academy até 19/11/2027.")).toBeInTheDocument();
    expect(within(cartao).getByText("se você passou na avaliação final de cada curso;")).toBeInTheDocument();
    expect(within(cartao).getByText("suas notas e respostas;")).toBeInTheDocument();
    expect(within(cartao).getByRole("link", { name: "Aviso de Privacidade" })).toHaveAttribute("href", expect.stringMatching(/\/academy\/privacidade\/v2026\.7$/));
    expect(await violacoesGraves(container)).toEqual([]);
    await userEvent.click(within(cartao).getByRole("button", { name: "Aceitar convite" }));
    expect(await screen.findByText("meus cursos")).toBeInTheDocument();
    expect(aceitar).toHaveBeenCalledWith({ p_membro: "m9" });
  });
});

describe("empresas no painel do admin", () => {
  it("cadastra a empresa com a primeira pessoa da gestão e envia o convite", async () => {
    const salvar = vi.fn<(a: Record<string, unknown>) => { data: unknown }>(() => ({ data: { ...empresa, id: "e2" } }));
    const enviar = vi.fn<(c: unknown) => { data: unknown }>(() => ({ data: { enviados: 1, falhas: 0, email: "ligado" } }));
    renderizar(
      <ProvedorAvisos>
        <Routes>
          <Route element={<AreaInstrutor />}>
            <Route path="empresas" element={<EmpresasInstrutor />} />
          </Route>
        </Routes>
      </ProvedorAvisos>,
      {
        rota: "/instrutor/empresas",
        caminho: "/instrutor/*",
        sb: sbFalso({
          rpcs: {
            academy_adm_eu: { papel: "admin", cursos: [] },
            academy_adm_empresas: [empresa],
            academy_adm_cursos: [{ slug: "soc-analyst", titulo: "SOC Analyst", gratuito: false }],
            academy_adm_trilhas: [],
            academy_adm_salvar_empresa: salvar,
          },
          funcoes: { "academy-empresa": enviar },
        }),
      },
    );
    expect(await screen.findByRole("listitem", { name: "Banco Exemplo" })).toHaveTextContent("3 de 5 vagas, 2 pessoas");
    expect(screen.getByRole("link", { name: "Empresas" })).toHaveAttribute("aria-current", "page");
    await userEvent.click(screen.getByRole("button", { name: "Cadastrar empresa" }));
    const form = screen.getByRole("form", { name: "Cadastrar empresa" });
    await userEvent.type(within(form).getByLabelText("Empresa"), "Fintech Y");
    await userEvent.selectOptions(within(form).getByLabelText("Tipo"), "plano");
    await userEvent.clear(within(form).getByLabelText("Vagas"));
    await userEvent.type(within(form).getByLabelText("Vagas"), "8");
    await userEvent.type(within(form).getByLabelText("E-mail de quem vai cuidar da gestão"), "Gestora@Fintech.com");
    await userEvent.click(within(form).getByRole("button", { name: "Cadastrar e convidar" }));
    await waitFor(() => expect(enviar).toHaveBeenCalledWith({ empresa_id: "e2" }));
    expect(salvar.mock.calls[0]![0]).toMatchObject({ p_dados: { nome: "Fintech Y", tipo: "plano", escopo: "plataforma", vagas: 8, gestor_email: "Gestora@Fintech.com" } });
    expect(await screen.findByText("Convite enviado para gestora@fintech.com.")).toBeInTheDocument();
  });
});

describe("funções de apoio", () => {
  it("lê e-mails colados, conta o prazo e gera a planilha sem fórmula", () => {
    expect(lerEmails(" A@b.com;c@d.com\n\na@b.com ")).toEqual(["a@b.com", "c@d.com"]);
    const hoje = new Date(2026, 10, 20);
    expect(prazoContrato("2026-11-20", hoje)).toBe("Último dia hoje");
    expect(prazoContrato("2026-11-21", hoje)).toBe("Termina amanhã");
    expect(prazoContrato("2026-12-20", hoje)).toBe("Faltam 30 dias");
    const csv = csvProgresso({ ...painel, membros: [{ ...painel.membros[1]!, nome: "=HYPERLINK(\"x\")" }] });
    expect(csv.startsWith("﻿Nome;E-mail")).toBe(true);
    expect(csv).toContain(`"'=HYPERLINK(""x"")";ana@banco.com;Ativo;SOC Analyst;12;40;Aprovado;2026-11-20;2026-11-20`);
  });
});
