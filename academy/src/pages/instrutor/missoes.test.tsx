import { describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizar, sbFalso } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import { ProvedorAvisos } from "@/components/ui/Avisos";
import { lerCabecalhos, lerTabela, paraBanco, paraForm, type MissaoAdm } from "@/lib/missoes-editor";
import exemplo from "@/test/missao-exemplo.json";
import CursoInstrutor from "./Curso";

const msn = exemplo as unknown as MissaoAdm;
const competencias = [
  { slug: "triagem-alertas", titulo: "Triagem de alertas" },
  { slug: "analise-logs", titulo: "Análise de logs" },
  { slug: "mitre-attack", titulo: "MITRE ATT&CK" },
];

function abrir(salvar = vi.fn<(a: Record<string, unknown>) => { data: unknown }>(() => ({ data: { missoes: [msn], competencias } }))) {
  const r = renderizar(
    <ProvedorAvisos>
      <Routes>
        <Route path="/instrutor/cursos/:slug" element={<CursoInstrutor />} />
      </Routes>
    </ProvedorAvisos>,
    {
      rota: "/instrutor/cursos/fundamentos-para-soc?aba=missoes",
      caminho: "/*",
      sb: sbFalso({
        rpcs: {
          academy_adm_eu: { papel: "admin", cursos: [] },
          academy_adm_curso: {
            slug: "fundamentos-para-soc", titulo: "Fundamentos para SOC", descricao: "", nivel: "iniciante", gratuito: true, publicado: true, ordem: 2,
            eh_admin: true, requisitos: null, questoes_final: 0, modulos: [],
          },
          academy_adm_missoes: { missoes: [msn], competencias },
          academy_adm_salvar_missao: salvar,
        } as never,
      }),
    },
  );
  return { ...r, salvar };
}

describe("editor de missões", () => {
  it("o formulário volta para o banco igual, sem JSON à mão", () => {
    const volta = paraBanco(paraForm(msn));
    expect(volta.evidencias).toEqual(msn.evidencias);
    expect(volta.perguntas).toEqual(msn.perguntas);
    expect(volta.competencias).toEqual(msn.competencias);
    expect(lerCabecalhos("!Received: from x\n!  by y\nReply-To: a@b")).toEqual([
      { campo: "Received:", valor: "from x", destaque: true },
      { campo: "", valor: "by y", destaque: true },
      { campo: "Reply-To:", valor: "a@b", destaque: false },
    ]);
    expect(lerTabela("Hora | Usuário\n09:00 | ana\n\n09:01 | bia")).toEqual({ colunas: ["Hora", "Usuário"], linhas: [["09:00", "ana"], ["09:01", "bia"]] });
  });

  it("lista as missões do curso e salva a edição; passa no axe", async () => {
    const { salvar, container } = abrir();
    const item = await screen.findByRole("listitem", { name: "MSN-001, Triagem de phishing" });
    expect(item).toHaveTextContent("4 evidências, 5 perguntas");
    expect(item).toHaveTextContent("Rascunho");
    await userEvent.click(within(item).getByRole("button", { name: "Editar" }));
    const form = screen.getByRole("form", { name: "Editar MSN-001" });
    expect(within(form).getByLabelText("Título")).toHaveValue("Triagem de phishing");
    expect(within(form).getByRole("group", { name: "Pergunta 5" })).toBeInTheDocument();
    expect(await violacoesGraves(container)).toEqual([]);
    await userEvent.click(within(form).getByLabelText("Publicada"));
    await userEvent.click(within(form).getByRole("button", { name: "Salvar missão" }));
    await waitFor(() => expect(salvar).toHaveBeenCalled());
    const enviado = salvar.mock.calls[0]![0] as { p_curso: string; p_dados: Record<string, unknown> };
    expect(enviado.p_curso).toBe("fundamentos-para-soc");
    expect(enviado.p_dados).toMatchObject({ id: "m1", codigo: "MSN-001", publicado: true, perguntas: msn.perguntas });
  });

  it("nova missão: aponta o problema antes de ir ao banco", async () => {
    const { salvar } = abrir();
    await userEvent.click(await screen.findByRole("button", { name: "Nova missão" }));
    const form = screen.getByRole("form", { name: "Nova missão" });
    await userEvent.type(within(form).getByLabelText("Código"), "msn-002");
    await userEvent.type(within(form).getByLabelText("Título"), "Força bruta na VPN");
    await userEvent.type(within(form).getByLabelText("Briefing"), "Madrugada de terça. Muitas falhas de login na VPN.");
    const e1 = within(form).getByRole("group", { name: "Evidência 1" });
    await userEvent.selectOptions(within(e1).getByLabelText("Tipo"), "tabela");
    await userEvent.type(within(e1).getByLabelText("Título da aba"), "Logs da VPN");
    await userEvent.type(within(e1).getByLabelText("Colunas e linhas"), "Hora | Usuário{enter}03:10");
    await userEvent.click(within(form).getByRole("button", { name: "Salvar missão" }));
    expect(within(form).getByRole("alert")).toHaveTextContent("Evidência 1: a linha 2 tem 1 valores, e a tabela tem 2 colunas.");
    await userEvent.type(within(e1).getByLabelText("Colunas e linhas"), " | j.silva");
    const p1 = within(form).getByRole("group", { name: "Pergunta 1" });
    await userEvent.type(within(p1).getByLabelText("Pergunta 1"), "Qual a técnica?");
    await userEvent.type(within(p1).getByLabelText("Alternativas"), "Phishing{enter}Spraying");
    await userEvent.type(within(p1).getByLabelText("Explicação"), "Muitas contas e poucas senhas.");
    await userEvent.click(within(form).getByRole("button", { name: "Salvar missão" }));
    expect(within(form).getByRole("alert")).toHaveTextContent("Pergunta 1: marque a certa começando a linha com *.");
    expect(salvar).not.toHaveBeenCalled();
    await userEvent.clear(within(p1).getByLabelText("Alternativas"));
    await userEvent.type(within(p1).getByLabelText("Alternativas"), "Phishing{enter}* Spraying");
    await userEvent.click(within(form).getByLabelText("Triagem de alertas"));
    await userEvent.click(within(form).getByRole("button", { name: "Salvar missão" }));
    await waitFor(() => expect(salvar).toHaveBeenCalled());
    expect((salvar.mock.calls[0]![0] as { p_dados: Record<string, unknown> }).p_dados).toMatchObject({
      codigo: "MSN-002",
      publicado: false,
      competencias: [{ slug: "triagem-alertas", peso: 2 }],
      evidencias: [{ tipo: "tabela", titulo: "Logs da VPN", conteudo: { colunas: ["Hora", "Usuário"], linhas: [["03:10", "j.silva"]] } }],
      perguntas: [{ enunciado: "Qual a técnica?", alternativas: ["Phishing", "Spraying"], corretas: [1] }],
    });
  });
});
