import { describe, expect, it } from "vitest";
import { Route, Routes } from "react-router";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cursoDetalheTeste, renderizar, sbFalso } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import { ProvedorAvisos } from "@/components/ui/Avisos";
import type { CursoAdm, InstrutoresDoCurso } from "@/lib/instrutor";
import Curso from "../Curso";
import AreaInstrutor from "./Area";
import CursoInstrutor from "./Curso";
import PerfilInstrutor from "./Perfil";

const SLUG = "fundamentos-para-soc";
const admin = { papel: "admin", cursos: [SLUG] };

type Rpcs = NonNullable<NonNullable<Parameters<typeof sbFalso>[0]>["rpcs"]>;

function painel(rota: string, rpcs: Rpcs) {
  return renderizar(
    <ProvedorAvisos>
      <Routes>
        <Route element={<AreaInstrutor />}>
          <Route path="cursos/:slug" element={<CursoInstrutor />} />
          <Route path="perfil" element={<PerfilInstrutor />} />
        </Route>
      </Routes>
    </ProvedorAvisos>,
    { rota, caminho: "/instrutor/*", sb: sbFalso({ rpcs }) },
  );
}

function cursoAdm(): CursoAdm {
  return {
    slug: SLUG,
    titulo: "Fundamentos para SOC",
    descricao: "Como funciona um SOC.",
    nivel: "iniciante",
    gratuito: true,
    publicado: true,
    ordem: 1,
    eh_admin: true,
    requisitos: null,
    objetivos: ["Triar alertas no SIEM"],
    publico: "",
    pre_requisitos: "",
    instrutores: [],
    questoes_final: 0,
    questoes_final_publicadas: 0,
    modulos: [{ id: "m1", ordem: 1, titulo: "O SOC por dentro", resumo: "", questoes: 0, questoes_publicadas: 0, aulas: [] }],
  };
}

const perfil = (id: string, nome: string, extra: Partial<InstrutoresDoCurso["disponiveis"][0]> = {}) => ({
  id,
  nome,
  cargo: "",
  bio: "",
  linkedin: null,
  site: null,
  da_equipe: true,
  eu: false,
  ...extra,
});

const instrutores: InstrutoresDoCurso = {
  do_curso: [
    { papel: "instrutor", ordem: 1, instrutor: perfil("p1", "Matheus Lima", { cargo: "Analista de SOC", bio: "Seis anos em SOC." }) },
    { papel: "convidado", ordem: 2, instrutor: perfil("p2", "Ana Convidada", { da_equipe: false }) },
  ],
  disponiveis: [perfil("p3", "Everton Nascimento", { eu: true })],
  equipe_sem_perfil: [{ id: "u9", nome: "Matheus Inacio", eu: false }],
};

describe("Sobre o curso, para o aluno", () => {
  const curso = {
    ...cursoDetalheTeste,
    objetivos: ["Triar alertas no SIEM", "Escalar um incidente"],
    publico: "Quem quer entrar em SOC.",
    pre_requisitos: "Nenhum.",
    cursos_instrutores: [
      { papel: "convidado", ordem: 2, instrutores: { id: "p2", nome: "Ana Convidada", cargo: "Threat Intel", bio: "", linkedin: null, site: null } },
      {
        papel: "instrutor",
        ordem: 1,
        instrutores: { id: "p1", nome: "Matheus Lima", cargo: "Analista de SOC", bio: "Seis anos em SOC.", linkedin: "https://www.linkedin.com/in/matheus", site: null },
      },
    ],
    modulos: cursoDetalheTeste.modulos.map((m) => (m.id === "m3" ? { ...m, resumo: "Como priorizar e descartar falso positivo." } : m)),
  };

  it("mostra objetivos, público, pré-requisitos, instrutores na ordem e a ementa de módulo em breve", async () => {
    renderizar(<Curso />, { rota: `/cursos/${SLUG}`, caminho: "/cursos/:slug", sb: sbFalso({ cursos: { [SLUG]: curso } }) });
    const objetivos = await screen.findByRole("region", { name: "O que você vai aprender" });
    expect(within(objetivos).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Triar alertas no SIEM", "Escalar um incidente"]);
    expect(screen.getByRole("region", { name: "Para quem é" })).toHaveTextContent("Quem quer entrar em SOC.");
    expect(screen.getByRole("region", { name: "Pré-requisitos" })).toHaveTextContent("Nenhum.");
    const quem = screen.getByRole("region", { name: "Quem ensina neste curso" });
    const nomes = within(quem).getAllByRole("listitem").map((li) => li.querySelector("p")?.textContent);
    expect(nomes).toEqual(["Matheus Lima", "Ana ConvidadaConvidado"]);
    expect(within(quem).getByRole("link", { name: /LinkedIn de Matheus Lima/ })).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("Como priorizar e descartar falso positivo.")).toBeInTheDocument();
  });

  it("curso sem nada cadastrado fica como antes", async () => {
    renderizar(<Curso />, { rota: `/cursos/${SLUG}`, caminho: "/cursos/:slug", sb: sbFalso({ cursos: { [SLUG]: cursoDetalheTeste } }) });
    expect(await screen.findByRole("heading", { level: 1, name: "Fundamentos para SOC" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "O que você vai aprender" })).not.toBeInTheDocument();
    expect(screen.queryByText("Quem ensina")).not.toBeInTheDocument();
  });

  it("não tem violação grave de acessibilidade", async () => {
    const { container } = renderizar(<Curso />, { rota: `/cursos/${SLUG}`, caminho: "/cursos/:slug", sb: sbFalso({ cursos: { [SLUG]: curso } }) });
    await screen.findByRole("region", { name: "O que você vai aprender" });
    expect(await violacoesGraves(container)).toEqual([]);
  });
});

describe("aba Sobre o curso no painel", () => {
  it("salva objetivos sem linha vazia, público e pré-requisitos", async () => {
    let args: Record<string, unknown> | undefined;
    painel(`/instrutor/cursos/${SLUG}?aba=sobre`, {
      academy_adm_eu: admin,
      academy_adm_curso: cursoAdm(),
      academy_adm_instrutores: instrutores,
      academy_adm_salvar_sobre: (a) => {
        args = a;
        return { data: cursoAdm() };
      },
    });
    expect(await screen.findByLabelText("Objetivo 1")).toHaveValue("Triar alertas no SIEM");
    await userEvent.click(screen.getByRole("button", { name: /Adicionar objetivo/ }));
    await userEvent.click(screen.getByRole("button", { name: /Adicionar objetivo/ }));
    await userEvent.type(screen.getByLabelText("Objetivo 2"), "Escalar um incidente");
    await userEvent.type(screen.getByLabelText("Para quem é"), "Quem quer entrar em SOC.");
    await userEvent.click(screen.getByRole("button", { name: "Salvar sobre o curso" }));
    await waitFor(() => expect(args).toBeDefined());
    expect(args).toEqual({
      p_curso: SLUG,
      p_dados: { objetivos: ["Triar alertas no SIEM", "Escalar um incidente"], publico: "Quem quer entrar em SOC.", pre_requisitos: "" },
    });
  });

  it("lista quem ensina, permite acrescentar perfil e convidar alguém de fora", async () => {
    let vinculo: Record<string, unknown> | undefined;
    let convite: Record<string, unknown> | undefined;
    painel(`/instrutor/cursos/${SLUG}?aba=sobre`, {
      academy_adm_eu: admin,
      academy_adm_curso: cursoAdm(),
      academy_adm_instrutores: instrutores,
      academy_adm_acrescentar_instrutores: (a) => {
        vinculo = a;
        return { data: instrutores };
      },
      academy_adm_salvar_instrutor: (a) => {
        convite = a;
        return { data: instrutores };
      },
    });
    const quem = await screen.findByRole("region", { name: "Quem ensina" });
    expect(await within(quem).findByText(/sem bio/)).toBeInTheDocument();
    // Perfil de outra pessoa da equipe não tem "Editar"; convidado tem.
    expect(within(quem).queryByRole("button", { name: "Editar perfil de Matheus Lima" })).not.toBeInTheDocument();
    expect(within(quem).getByRole("button", { name: "Editar perfil de Ana Convidada" })).toBeInTheDocument();

    // Quem é da Equipe sem perfil de instrutor também aparece, e dá para marcar vários de uma vez.
    const lista = within(quem).getByRole("group", { name: "Acrescentar ao curso" });
    expect(within(lista).getByText(/ainda sem perfil de instrutor/)).toBeInTheDocument();
    expect(within(quem).getByRole("button", { name: "Acrescentar" })).toBeDisabled();
    await userEvent.click(within(lista).getByLabelText("Everton Nascimento (você)"));
    await userEvent.click(within(lista).getByLabelText("Matheus Inacio"));
    await userEvent.selectOptions(within(quem).getByLabelText("Papel"), "convidado");
    await userEvent.click(within(quem).getByRole("button", { name: "Acrescentar 2 pessoas" }));
    await waitFor(() => expect(vinculo).toEqual({ p_curso: SLUG, p_instrutores: ["p3"], p_pessoas: ["u9"], p_papel: "convidado" }));

    await userEvent.click(within(quem).getByRole("button", { name: /Convidar alguém de fora da equipe/ }));
    await userEvent.type(within(quem).getByLabelText("Nome público"), "Rayllan");
    await userEvent.type(within(quem).getByLabelText("Cargo"), "Forense digital");
    await userEvent.click(within(quem).getByRole("button", { name: "Adicionar convidado" }));
    await waitFor(() => expect(convite).toBeDefined());
    expect(convite).toEqual({ p_curso: SLUG, p_id: null, p_dados: { nome: "Rayllan", cargo: "Forense digital", bio: "", linkedin: null, site: null } });
  });

  it("ementa do módulo sai junto com o título", async () => {
    let args: Record<string, unknown> | undefined;
    painel(`/instrutor/cursos/${SLUG}`, {
      academy_adm_eu: admin,
      academy_adm_curso: cursoAdm(),
      academy_adm_editar_modulo: (a) => {
        args = a;
        return { data: cursoAdm() };
      },
    });
    expect(await screen.findByText(/sem ementa/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Editar Módulo 1: O SOC por dentro" }));
    await userEvent.type(screen.getByLabelText("Ementa do módulo"), "Papéis, turnos e ferramentas.");
    await userEvent.click(screen.getByRole("button", { name: "Salvar módulo" }));
    await waitFor(() => expect(args).toEqual({ p_id: "m1", p_dados: { titulo: "O SOC por dentro", resumo: "Papéis, turnos e ferramentas." } }));
  });

  it("antes da migração 0016 o painel continua salvando só o título", async () => {
    let usada = "";
    const antigo = cursoAdm();
    for (const m of antigo.modulos) delete m.resumo;
    painel(`/instrutor/cursos/${SLUG}`, {
      academy_adm_eu: admin,
      academy_adm_curso: antigo,
      academy_adm_salvar_modulo: () => {
        usada = "salvar_modulo";
        return { data: antigo };
      },
    });
    await userEvent.click(await screen.findByRole("button", { name: "Editar Módulo 1: O SOC por dentro" }));
    expect(screen.queryByLabelText("Ementa do módulo")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Salvar módulo" }));
    await waitFor(() => expect(usada).toBe("salvar_modulo"));
  });
});

describe("Perfil de instrutor", () => {
  it("cria o perfil a partir do nome do cadastro", async () => {
    let args: Record<string, unknown> | undefined;
    painel(`/instrutor/perfil`, {
      academy_adm_eu: { papel: "instrutor", cursos: [SLUG] },
      academy_adm_meu_perfil: { id: null, nome: "Matheus", cargo: "", bio: "", linkedin: null, site: null, da_equipe: true, eu: true },
      academy_adm_salvar_meu_perfil: (a) => {
        args = a;
        return { data: perfil("p1", "Matheus Lima") };
      },
    });
    expect(await screen.findByRole("link", { name: "Perfil de instrutor" })).toBeInTheDocument();
    const nome = await screen.findByLabelText("Nome público");
    expect(nome).toHaveValue("Matheus");
    await userEvent.type(nome, " Lima");
    await userEvent.type(screen.getByLabelText("LinkedIn"), "https://www.linkedin.com/in/matheus");
    await userEvent.click(screen.getByRole("button", { name: "Criar perfil" }));
    await waitFor(() => expect(args).toBeDefined());
    expect(args).toEqual({ p_dados: { nome: "Matheus Lima", cargo: "", bio: "", linkedin: "https://www.linkedin.com/in/matheus", site: null } });
  });

  it("mostra a mensagem do banco quando o LinkedIn é inválido", async () => {
    painel(`/instrutor/perfil`, {
      academy_adm_eu: admin,
      academy_adm_meu_perfil: perfil("p3", "Everton", { eu: true }),
      academy_adm_salvar_meu_perfil: () => ({ error: { message: "linkedin_invalido" } }),
    });
    await userEvent.click(await screen.findByRole("button", { name: "Salvar perfil" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("O LinkedIn precisa ser um link");
  });
});
