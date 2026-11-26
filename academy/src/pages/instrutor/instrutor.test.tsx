import { describe, expect, it } from "vitest";
import { Route, Routes } from "react-router";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderizar, sbFalso } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import { escreverDuracao, extrairYoutube, lerDuracao, sugerirSlug, type CursoAdm, type QuestaoAdm } from "@/lib/instrutor";
import { ProvedorAvisos } from "@/components/ui/Avisos";
import AreaInstrutor from "./Area";
import CursosInstrutor from "./Cursos";
import CursoInstrutor from "./Curso";
import AulaInstrutor from "./Aula";
import QuestaoInstrutor from "./Questao";
import BoletimInstrutor from "./Boletim";

const SLUG = "fundamentos-para-soc";

function cursoAdm(): CursoAdm {
  const aula = (id: string, ordem: number, numero: number, titulo: string, extra: Partial<CursoAdm["modulos"][0]["aulas"][0]> = {}) => ({
    id,
    modulo_id: "",
    ordem,
    numero,
    titulo,
    resumo: "",
    duracao_seg: 750,
    video_provedor: "youtube" as const,
    video_ref: "iKAWeoCtbmA",
    publicado: true,
    atualizado_em: "2026-11-18T10:00:00Z",
    alunos_com_progresso: 3,
    ...extra,
  });
  return {
    slug: SLUG,
    titulo: "Fundamentos para SOC",
    descricao: "Como funciona um SOC.",
    nivel: "iniciante",
    gratuito: true,
    publicado: true,
    ordem: 1,
    eh_admin: true,
    requisitos: {
      exige_todas_aulas: true,
      exige_modulos: true,
      nota_minima_modulo: 70,
      questoes_modulo: 5,
      nota_minima_final: 80,
      questoes_final: 20,
      espera_final_horas: 24,
      tentativas_final_max: null,
      carga_horaria_h: 8,
      certificado_ativo: true,
    },
    questoes_final: 2,
    questoes_final_publicadas: 2,
    modulos: [
      { id: "m0", ordem: 0, titulo: "Introdução", questoes: 0, questoes_publicadas: 0, aulas: [aula("a1", 1, 1, "Boas-vindas")] },
      {
        id: "m1",
        ordem: 1,
        titulo: "O SOC por dentro",
        questoes: 1,
        questoes_publicadas: 1,
        aulas: [
          aula("a2", 1, 2, "Papéis no SOC"),
          aula("a3", 2, 3, "Turnos e escalas", { publicado: false, alunos_com_progresso: 0 }),
          aula("a4", 3, 4, "Ferramentas do analista", { publicado: false, video_ref: null, video_provedor: null, alunos_com_progresso: 0 }),
        ],
      },
      { id: "m2", ordem: 2, titulo: "Triagem", questoes: 0, questoes_publicadas: 0, aulas: [] },
    ],
  };
}

const questoesAdm: QuestaoAdm[] = [
  {
    id: "q1",
    modulo_id: "m1",
    enunciado: "Quem decide a escalação de um incidente crítico?",
    explicacao: "O líder do turno.",
    publicado: true,
    atualizado_em: "2026-11-18T10:00:00Z",
    em_uso: true,
    alternativas: [
      { ordem: 1, texto: "O analista N1", correta: false },
      { ordem: 2, texto: "O líder do turno", correta: true },
    ],
  },
];

function rotas() {
  return (
    <ProvedorAvisos>
      <Routes>
        <Route element={<AreaInstrutor />}>
          <Route index element={<CursosInstrutor />} />
          <Route path="cursos/:slug" element={<CursoInstrutor />} />
          <Route path="cursos/:slug/aulas/:id" element={<AulaInstrutor />} />
          <Route path="cursos/:slug/questoes/:id" element={<QuestaoInstrutor />} />
          <Route path="boletim" element={<BoletimInstrutor />} />
        </Route>
      </Routes>
    </ProvedorAvisos>
  );
}

type Rpcs = NonNullable<NonNullable<Parameters<typeof sbFalso>[0]>["rpcs"]>;

function abrir(rota: string, rpcs: Rpcs) {
  return renderizar(rotas(), { rota, caminho: "/instrutor/*", sb: sbFalso({ rpcs }) });
}

const admin = { papel: "admin", cursos: [SLUG] };

describe("vídeo, duração e endereço", () => {
  it("entende os formatos de link do YouTube", () => {
    for (const t of [
      "https://www.youtube.com/watch?v=iKAWeoCtbmA",
      "https://youtu.be/iKAWeoCtbmA?si=abc",
      "youtube.com/shorts/iKAWeoCtbmA",
      "https://www.youtube-nocookie.com/embed/iKAWeoCtbmA",
      "https://m.youtube.com/watch?v=iKAWeoCtbmA&t=30s",
      "https://www.youtube.com/live/iKAWeoCtbmA",
      "iKAWeoCtbmA",
    ]) {
      expect(extrairYoutube(t), t).toBe("iKAWeoCtbmA");
    }
    expect(extrairYoutube("https://vimeo.com/123456")).toBeNull();
    expect(extrairYoutube("https://www.youtube.com/watch?v=curto")).toBeNull();
    expect(extrairYoutube("não é link")).toBeNull();
  });

  it("lê e escreve duração", () => {
    expect(lerDuracao("12:30")).toBe(750);
    expect(lerDuracao("1:02:03")).toBe(3723);
    expect(lerDuracao("90")).toBe(90);
    expect(lerDuracao("12:75")).toBeNull();
    expect(lerDuracao("doze")).toBeNull();
    expect(escreverDuracao(750)).toBe("12:30");
    expect(escreverDuracao(3723)).toBe("1:02:03");
  });

  it("sugere endereço sem acento", () => {
    expect(sugerirSlug("Introdução à Resposta a Incidentes!")).toBe("introducao-a-resposta-a-incidentes");
  });
});

describe("acesso ao painel do instrutor", () => {
  it("aluno recebe 404, sem sinal de que existe painel", async () => {
    renderizar(rotas(), { rota: "/instrutor", caminho: "/instrutor/*", sb: sbFalso() });
    expect(await screen.findByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument();
    expect(screen.queryByText(/Painel do instrutor/)).not.toBeInTheDocument();
  });

  it("instrutor vê os cursos dele e não vê Boletim nem Equipe", async () => {
    abrir("/instrutor", {
      academy_adm_eu: { papel: "instrutor", cursos: [SLUG] },
      academy_adm_cursos: [
        { slug: SLUG, titulo: "Fundamentos para SOC", nivel: "iniciante", gratuito: true, publicado: true, ordem: 1, modulos: 3, aulas: 4, aulas_publicadas: 2, aulas_sem_video: 1, questoes: 1, questoes_publicadas: 1 },
      ],
    });
    expect(await screen.findByRole("link", { name: /Fundamentos para SOC/ })).toHaveAttribute("href", `/instrutor/cursos/${SLUG}`);
    expect(screen.getByText("2 de 4")).toBeInTheDocument();
    expect(screen.getByText("1 aula")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Boletim do SOC" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Novo curso/ })).not.toBeInTheDocument();
  });

  it("admin vê as abas de Boletim e Equipe e cria curso", async () => {
    let enviado: Record<string, unknown> | undefined;
    abrir("/instrutor", {
      academy_adm_eu: admin,
      academy_adm_cursos: [],
      academy_adm_curso: { ...cursoAdm(), slug: "resposta-a-incidentes", titulo: "Resposta a Incidentes", modulos: [] },
      academy_adm_salvar_curso: (args) => {
        enviado = args;
        return { data: { ...cursoAdm(), slug: "resposta-a-incidentes" } };
      },
    });
    expect(await screen.findByRole("link", { name: "Boletim do SOC" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Equipe" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Novo curso/ }));
    await userEvent.type(screen.getByLabelText("Título"), "Resposta a Incidentes");
    expect(screen.getByLabelText("Endereço")).toHaveValue("resposta-a-incidentes");
    await userEvent.click(screen.getByRole("button", { name: "Criar curso" }));
    await waitFor(() => expect(enviado).toBeDefined());
    expect(enviado).toMatchObject({ p_slug: null, p_dados: { slug: "resposta-a-incidentes", titulo: "Resposta a Incidentes", nivel: "iniciante" } });
  });
});

describe("estrutura do curso", () => {
  it("mostra módulos, aulas e a situação de cada uma", async () => {
    abrir(`/instrutor/cursos/${SLUG}`, { academy_adm_eu: admin, academy_adm_curso: cursoAdm() });
    const modulo = await screen.findByRole("region", { name: "Módulo 1: O SOC por dentro" });
    const linhas = within(modulo).getAllByRole("listitem");
    expect(linhas).toHaveLength(3);
    expect(within(linhas[0]!).getByText("Publicada")).toBeInTheDocument();
    expect(within(linhas[1]!).getByText("Rascunho")).toBeInTheDocument();
    expect(within(linhas[2]!).getByText("Sem vídeo")).toBeInTheDocument();
    expect(within(modulo).getByRole("button", { name: "Subir aula 01" })).toBeDisabled();
    // Numeração dentro do módulo, como o aluno vê.
    expect(linhas.map((l) => l.querySelector("span")?.textContent)).toEqual(["01", "02", "03"]);
    expect(within(modulo).getByRole("link", { name: /Nova aula no módulo 1/ })).toHaveAttribute("href", `/instrutor/cursos/${SLUG}/aulas/nova?modulo=m1`);
    // Introdução não sobe nem desce; módulo com conteúdo não tem excluir.
    expect(screen.queryByRole("button", { name: "Subir Introdução" })).not.toBeInTheDocument();
    expect(within(modulo).queryByRole("button", { name: /Excluir/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir Módulo 2: Triagem" })).toBeInTheDocument();
  });

  it("mover aula chama o banco com a direção", async () => {
    let args: Record<string, unknown> | undefined;
    abrir(`/instrutor/cursos/${SLUG}`, {
      academy_adm_eu: admin,
      academy_adm_curso: cursoAdm(),
      academy_adm_mover_aula: (a) => {
        args = a;
        return { data: cursoAdm() };
      },
    });
    const modulo = await screen.findByRole("region", { name: "Módulo 1: O SOC por dentro" });
    await userEvent.click(within(modulo).getByRole("button", { name: "Descer aula 01" }));
    await waitFor(() => expect(args).toEqual({ p_id: "a2", p_direcao: 1 }));
  });

  it("excluir módulo pede confirmação e mostra o erro do banco", async () => {
    abrir(`/instrutor/cursos/${SLUG}`, {
      academy_adm_eu: admin,
      academy_adm_curso: cursoAdm(),
      academy_adm_excluir_modulo: () => ({ error: { message: "modulo_nao_vazio" } }),
    });
    await userEvent.click(await screen.findByRole("button", { name: "Excluir Módulo 2: Triagem" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirmar exclusão" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Só dá para excluir módulo sem aulas e sem questões.");
  });

  it("aba Questões avisa quando falta questão para a avaliação final", async () => {
    abrir(`/instrutor/cursos/${SLUG}?aba=questoes`, { academy_adm_eu: admin, academy_adm_curso: cursoAdm(), academy_adm_questoes: questoesAdm });
    expect(await screen.findByText(/sorteia 20 questões e o banco tem 2 publicadas/)).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /Quem decide a escalação/ })).toHaveAttribute("href", `/instrutor/cursos/${SLUG}/questoes/q1`);
    expect(screen.getByText("Já respondida")).toBeInTheDocument();
  });

  it("aba Certificado escolhe o modelo e volta ao automático", async () => {
    let args: Record<string, unknown> | undefined;
    const c = cursoAdm();
    c.requisitos = { ...c.requisitos!, modelo_certificado: null };
    abrir(`/instrutor/cursos/${SLUG}?aba=requisitos`, {
      academy_adm_eu: admin,
      academy_adm_curso: c,
      academy_adm_salvar_requisitos: (a) => {
        args = a;
        return { data: c };
      },
    });
    const modelo = await screen.findByLabelText("Modelo do certificado");
    expect(modelo).toHaveValue("");
    expect(screen.getByRole("option", { name: "Automático (gratuito: Clássico claro)" })).toBeInTheDocument();
    await userEvent.selectOptions(modelo, "tecnico");
    await userEvent.click(screen.getByRole("button", { name: "Salvar regras" }));
    await waitFor(() => expect(args).toBeDefined());
    expect(args).toMatchObject({ p_curso: SLUG, p_dados: { modelo_certificado: "tecnico", carga_horaria_h: 8 } });
  });

  it("instrutor não vê publicar curso nem gratuito", async () => {
    abrir(`/instrutor/cursos/${SLUG}?aba=dados`, { academy_adm_eu: { papel: "instrutor", cursos: [SLUG] }, academy_adm_curso: { ...cursoAdm(), eh_admin: false } });
    expect(await screen.findByLabelText("Título")).toHaveValue("Fundamentos para SOC");
    expect(screen.queryByLabelText("Curso publicado")).not.toBeInTheDocument();
    expect(screen.getByText(/fica com o admin da Academy/)).toBeInTheDocument();
  });

  it("curso fora do alcance do instrutor vira 404", async () => {
    abrir(`/instrutor/cursos/outro`, { academy_adm_eu: { papel: "instrutor", cursos: [SLUG] }, academy_adm_curso: () => ({ error: { message: "sem_permissao" } }) });
    expect(await screen.findByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument();
  });

  it("não tem violação grave de acessibilidade", async () => {
    const { container } = abrir(`/instrutor/cursos/${SLUG}`, { academy_adm_eu: admin, academy_adm_curso: cursoAdm() });
    await screen.findByRole("region", { name: "Módulo 1: O SOC por dentro" });
    expect(await violacoesGraves(container)).toEqual([]);
  });
});

describe("editor de aula", () => {
  it("nova aula: link do YouTube vira código e publica com vídeo", async () => {
    let args: Record<string, unknown> | undefined;
    abrir(`/instrutor/cursos/${SLUG}/aulas/nova?modulo=m2`, {
      academy_adm_eu: admin,
      academy_adm_curso: cursoAdm(),
      academy_adm_salvar_aula: (a) => {
        args = a;
        return { data: { ...cursoAdm().modulos[1]!.aulas[0]!, id: "nova-id" } };
      },
    });
    expect(await screen.findByRole("heading", { name: "Nova aula" })).toBeInTheDocument();
    expect(screen.getByLabelText("Módulo")).toHaveValue("m2");
    const publicar = screen.getByLabelText("Aula publicada");
    expect(publicar).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Título"), "Como ler um alerta");
    await userEvent.type(screen.getByLabelText("Vídeo do YouTube"), "https://youtu.be/iKAWeoCtbmA?si=x");
    expect(screen.getByText("Vídeo iKAWeoCtbmA")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Duração"), "14:05");
    expect(publicar).toBeEnabled();
    await userEvent.click(publicar);
    await userEvent.click(screen.getByRole("button", { name: "Criar aula" }));
    await waitFor(() => expect(args).toBeDefined());
    expect(args).toEqual({
      p_id: null,
      p_dados: { titulo: "Como ler um alerta", modulo_id: "m2", resumo: "", duracao_seg: 845, video_provedor: "youtube", video_ref: "iKAWeoCtbmA", publicado: true },
    });
  });

  it("duração inválida é barrada antes de ir ao banco", async () => {
    let chamou = false;
    abrir(`/instrutor/cursos/${SLUG}/aulas/a3`, {
      academy_adm_eu: admin,
      academy_adm_curso: cursoAdm(),
      academy_adm_salvar_aula: () => {
        chamou = true;
        return { data: null };
      },
    });
    const duracao = await screen.findByLabelText("Duração");
    expect(duracao).toHaveValue("12:30");
    await userEvent.clear(duracao);
    await userEvent.type(duracao, "doze minutos");
    await userEvent.click(screen.getByRole("button", { name: "Salvar aula" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("A duração precisa ficar entre 0:30 e 4:00:00.");
    expect(chamou).toBe(false);
  });

  it("aula publicada não oferece excluir; rascunho oferece", async () => {
    const { unmount } = abrir(`/instrutor/cursos/${SLUG}/aulas/a2`, { academy_adm_eu: admin, academy_adm_curso: cursoAdm() });
    expect(await screen.findByText("3 alunos já assistiram")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir rascunho" })).not.toBeInTheDocument();
    unmount();
    abrir(`/instrutor/cursos/${SLUG}/aulas/a3`, { academy_adm_eu: admin, academy_adm_curso: cursoAdm() });
    expect(await screen.findByRole("button", { name: "Excluir rascunho" })).toBeInTheDocument();
  });
});

describe("editor de questão", () => {
  it("envia alternativas com exatamente uma correta", async () => {
    let args: Record<string, unknown> | undefined;
    abrir(`/instrutor/cursos/${SLUG}/questoes/nova?modulo=m1`, {
      academy_adm_eu: admin,
      academy_adm_curso: cursoAdm(),
      academy_adm_questoes: questoesAdm,
      academy_adm_salvar_questao: (a) => {
        args = a;
        return { data: questoesAdm };
      },
    });
    await userEvent.type(await screen.findByLabelText("Enunciado"), "O que um SIEM faz primeiro?");
    await userEvent.type(screen.getByLabelText("Texto da alternativa A"), "Coleta eventos");
    await userEvent.type(screen.getByLabelText("Texto da alternativa B"), "Bloqueia ataques");
    await userEvent.click(screen.getByRole("button", { name: "Remover alternativa D" }));
    await userEvent.type(screen.getByLabelText("Texto da alternativa C"), "Aplica patches");
    await userEvent.click(screen.getByLabelText("Alternativa A é a correta"));
    await userEvent.click(screen.getByRole("button", { name: "Criar questão" }));
    await waitFor(() => expect(args).toBeDefined());
    expect(args).toMatchObject({
      p_id: null,
      p_dados: {
        curso_slug: SLUG,
        modulo_id: "m1",
        alternativas: [
          { texto: "Coleta eventos", correta: true },
          { texto: "Bloqueia ataques", correta: false },
          { texto: "Aplica patches", correta: false },
        ],
      },
    });
  });

  it("questão já respondida avisa e não oferece excluir", async () => {
    abrir(`/instrutor/cursos/${SLUG}/questoes/q1`, { academy_adm_eu: admin, academy_adm_curso: cursoAdm(), academy_adm_questoes: questoesAdm });
    expect(await screen.findByText(/Alunos já responderam esta questão/)).toBeInTheDocument();
    expect(screen.getByLabelText("Alternativa B é a correta")).toBeChecked();
    expect(screen.queryByRole("button", { name: "Excluir questão" })).not.toBeInTheDocument();
  });
});

describe("Boletim do SOC", () => {
  it("instrutor não acessa", async () => {
    abrir(`/instrutor/boletim`, { academy_adm_eu: { papel: "instrutor", cursos: [SLUG] } });
    expect(await screen.findByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument();
  });

  it("admin cria aviso e vê erro de link", async () => {
    abrir(`/instrutor/boletim`, {
      academy_adm_eu: admin,
      academy_adm_boletim: [],
      academy_adm_salvar_boletim: () => ({ error: { message: "link_invalido" } }),
    });
    await userEvent.click(await screen.findByRole("button", { name: /Novo aviso/ }));
    await userEvent.type(screen.getByLabelText("Título"), "Módulo 2 no ar");
    await userEvent.click(screen.getByRole("button", { name: "Criar aviso" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("O link precisa começar com https://.");
  });
});

describe("banco de questões: filtros na URL e publicar em lote (fase 24)", () => {
  const q = (id: string, modulo_id: string | null, publicado: boolean, enunciado: string): QuestaoAdm => ({
    id,
    modulo_id,
    enunciado,
    explicacao: "",
    publicado,
    atualizado_em: "2026-11-25T10:00:00Z",
    em_uso: false,
    alternativas: [
      { ordem: 1, texto: "Certa", correta: true },
      { ordem: 2, texto: "Errada", correta: false },
    ],
  });
  const banco = [
    ...questoesAdm,
    q("r1", "m2", false, "Rascunho um do módulo 2 sobre triagem"),
    q("r2", "m2", false, "Rascunho dois do módulo 2 sobre triagem"),
    q("p1", "m2", true, "Publicada do módulo 2 sobre triagem"),
    q("r3", "m1", false, "Rascunho do módulo 1 que não deve aparecer"),
  ];

  it("o filtro fica na URL e vai junto para a questão", async () => {
    abrir(`/instrutor/cursos/${SLUG}?aba=questoes&mostrar=m2&situacao=rascunho`, { academy_adm_eu: admin, academy_adm_curso: cursoAdm(), academy_adm_questoes: banco });
    expect(await screen.findByRole("link", { name: /Rascunho um do módulo 2/ })).toHaveAttribute(
      "href",
      `/instrutor/cursos/${SLUG}/questoes/r1?mostrar=m2&situacao=rascunho`,
    );
    expect(screen.getByLabelText("Mostrar")).toHaveValue("m2");
    expect(screen.getByLabelText("Situação")).toHaveValue("rascunho");
    expect(screen.queryByText(/Publicada do módulo 2/)).not.toBeInTheDocument();
    expect(screen.queryByText(/não deve aparecer/)).not.toBeInTheDocument();
  });

  it("publica de uma vez todas as questões em rascunho do recorte", async () => {
    let args: Record<string, unknown> | undefined;
    abrir(`/instrutor/cursos/${SLUG}?aba=questoes&mostrar=m2`, {
      academy_adm_eu: admin,
      academy_adm_curso: cursoAdm(),
      academy_adm_questoes: banco,
      academy_adm_publicar_questoes: (a) => {
        args = a;
        return { data: { alteradas: 2, ignoradas: [], questoes: banco } };
      },
    });
    await userEvent.click(await screen.findByRole("button", { name: "Publicar as 2 em rascunho" }));
    await waitFor(() => expect(args).toEqual({ p_curso: SLUG, p_questoes: ["r1", "r2"], p_publicar: true }));
    expect(await screen.findByText("2 questões publicadas")).toBeInTheDocument();
  });

  it("marca questões, publica as em rascunho e volta as publicadas para rascunho", async () => {
    const chamadas: Record<string, unknown>[] = [];
    abrir(`/instrutor/cursos/${SLUG}?aba=questoes&mostrar=m2`, {
      academy_adm_eu: admin,
      academy_adm_curso: cursoAdm(),
      academy_adm_questoes: banco,
      academy_adm_publicar_questoes: (a) => {
        chamadas.push(a);
        return { data: { alteradas: 1, ignoradas: [], questoes: banco } };
      },
    });
    const barra = await screen.findByRole("toolbar", { name: "Ações nas questões marcadas" });
    await userEvent.click(within(barra).getByLabelText("Marcar as 3"));
    expect(within(barra).getByText("3 marcadas de 3")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText(/Marcar questão 1:/));
    await userEvent.click(within(barra).getByRole("button", { name: "Publicar 1 questão" }));
    await waitFor(() => expect(chamadas[0]).toEqual({ p_curso: SLUG, p_questoes: ["r2"], p_publicar: true }));

    await userEvent.click(await screen.findByLabelText(/Marcar questão 3:/));
    await userEvent.click(within(barra).getByRole("button", { name: "Voltar 1 questão para rascunho" }));
    await waitFor(() => expect(chamadas[1]).toEqual({ p_curso: SLUG, p_questoes: ["p1"], p_publicar: false }));
  });

  it("avisa quando alguma questão não pôde ser publicada", async () => {
    abrir(`/instrutor/cursos/${SLUG}?aba=questoes&mostrar=m2`, {
      academy_adm_eu: admin,
      academy_adm_curso: cursoAdm(),
      academy_adm_questoes: banco,
      academy_adm_publicar_questoes: () => ({ data: { alteradas: 1, ignoradas: ["r2"], questoes: banco } }),
    });
    await userEvent.click(await screen.findByRole("button", { name: "Publicar as 2 em rascunho" }));
    expect(await screen.findByText(/1 questão ficou em rascunho/)).toBeInTheDocument();
  });

  it("voltar da questão cai no mesmo recorte", async () => {
    abrir(`/instrutor/cursos/${SLUG}/questoes/q1?mostrar=m1&situacao=publicadas`, { academy_adm_eu: admin, academy_adm_curso: cursoAdm(), academy_adm_questoes: banco });
    const destino = `/instrutor/cursos/${SLUG}?aba=questoes&mostrar=m1&situacao=publicadas`;
    expect(await screen.findByRole("link", { name: /Questões de/ })).toHaveAttribute("href", destino);
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", destino);
  });
});
