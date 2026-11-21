import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import Aula from "./Aula";
import Curso from "./Curso";
import { renderizar } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import { lerMensagem, ORIGEM_YOUTUBE, urlEmbed } from "@/lib/youtube";
import { localizarAula, rotuloModulo } from "@/lib/aula";
import type { CursoDetalhe } from "@/lib/cursos";

const CURSO = {
  slug: "cybersecurity-fundamentals",
  titulo: "Cybersecurity Fundamentals",
  descricao: "Fundamentos.",
  nivel: "iniciante",
  gratuito: true,
  modulos: [
    {
      id: "m0",
      ordem: 0,
      titulo: "Introdução",
      aulas: [{ id: "a1", ordem: 1, numero: 1, titulo: "Boas-vindas ao curso", resumo: "O que vamos estudar.", duracao_seg: 122 }],
    },
    {
      id: "m1",
      ordem: 1,
      titulo: "Princípios de segurança",
      aulas: [
        { id: "a2", ordem: 1, numero: 2, titulo: "Confidencialidade, integridade e disponibilidade", resumo: "", duracao_seg: 1020 },
        { id: "a3", ordem: 2, numero: 3, titulo: "Risco, ameaça, vulnerabilidade e impacto", resumo: "", duracao_seg: 1020 },
      ],
    },
  ],
};

type Rpc = { nome: string; args: Record<string, unknown> };

function sbAula(opts: { progresso?: { aula_id: string; posicao_seg: number; concluida_em: string | null }[]; matriculado?: boolean; videoErro?: string } = {}) {
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
      if (tabela === "progresso_aulas") return cadeia({ data: opts.progresso ?? [], error: null });
      if (tabela === "matriculas") return cadeia({ data: opts.matriculado === false ? null : { curso_slug: CURSO.slug }, error: null });
      return cadeia({ data: [], error: null });
    },
    rpc: (nome: string, args: Record<string, unknown> = {}) => {
      chamadas.push({ nome, args });
      if (nome === "academy_video_aula") {
        return Promise.resolve(opts.videoErro ? { data: null, error: { message: opts.videoErro } } : { data: { provedor: "youtube", ref: "AKtr_lmAB6Y" }, error: null });
      }
      if (nome === "academy_registrar_progresso") return Promise.resolve({ data: { status: "ok", concluida: args.p_concluida }, error: null });
      return Promise.resolve({ data: null, error: null });
    },
    auth: { signOut: () => Promise.resolve({ error: null }) },
  } as unknown as SupabaseClient;
  return { sb, chamadas };
}

function abrir(numero: number, sb: SupabaseClient) {
  return renderizar(<Aula />, { rota: `/cursos/${CURSO.slug}/aulas/${numero}`, caminho: "/cursos/:slug/aulas/:numero", sb });
}

describe("sala de aula", () => {
  it("mostra a capa da aula, a posição no curso e a navegação", async () => {
    const { sb } = sbAula();
    abrir(2, sb);
    expect(await screen.findByRole("heading", { level: 1, name: "Confidencialidade, integridade e disponibilidade" })).toBeInTheDocument();
    expect(screen.getByText(/Módulo 1, aula 1 de 2/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Aula anterior/ })).toHaveAttribute("href", `/cursos/${CURSO.slug}/aulas/1`);
    expect(screen.getAllByRole("link", { name: /Próxima aula/ })[0]).toHaveAttribute("href", `/cursos/${CURSO.slug}/aulas/3`);
    expect(screen.getByRole("link", { current: "page" })).toHaveTextContent("Você está aqui");
    expect(screen.queryByTitle(/Vídeo da aula/)).not.toBeInTheDocument();
  });

  it("só carrega o YouTube depois do clique, em modo de privacidade e retomando de onde parou", async () => {
    const { sb } = sbAula({ progresso: [{ aula_id: "a1", posicao_seg: 40, concluida_em: null }] });
    abrir(1, sb);
    expect(await screen.findByText("Continuar de 00:40")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: /Assistir à aula: Boas-vindas/ }));
    const iframe = await screen.findByTitle("Vídeo da aula: Boas-vindas ao curso");
    const src = new URL(iframe.getAttribute("src")!);
    expect(src.origin).toBe(ORIGEM_YOUTUBE);
    expect(src.pathname).toBe("/embed/AKtr_lmAB6Y");
    expect(src.searchParams.get("enablejsapi")).toBe("1");
    expect(src.searchParams.get("start")).toBe("40");
  });

  it("grava a conclusão quando o player passa de 92% e ignora mensagem de outra origem", async () => {
    const { sb, chamadas } = sbAula();
    abrir(1, sb);
    fireEvent.click(await screen.findByRole("button", { name: /Assistir à aula: Boas-vindas/ }));
    const iframe = (await screen.findByTitle(/Vídeo da aula: Boas-vindas/)) as HTMLIFrameElement;
    const enviar = (origin: string, info: Record<string, number>) =>
      act(() => {
        window.dispatchEvent(new MessageEvent("message", { origin, source: iframe.contentWindow, data: JSON.stringify({ event: "infoDelivery", info }) }));
      });
    enviar("https://evil.example", { currentTime: 120, duration: 122, playerState: 1 });
    expect(chamadas.filter((c) => c.nome === "academy_registrar_progresso")).toHaveLength(0);
    enviar(ORIGEM_YOUTUBE, { currentTime: 115, duration: 122, playerState: 1 });
    await waitFor(() => expect(chamadas.some((c) => c.nome === "academy_registrar_progresso" && c.args.p_concluida === true)).toBe(true));
    expect(await screen.findByText("Aula concluída")).toBeInTheDocument();
  });

  it("gravar o progresso não recarrega o vídeo (o endereço do player fica fixo)", async () => {
    const { sb, chamadas } = sbAula({ progresso: [{ aula_id: "a2", posicao_seg: 40, concluida_em: null }] });
    abrir(2, sb);
    fireEvent.click(await screen.findByRole("button", { name: /Assistir à aula: Confidencialidade/ }));
    const iframe = (await screen.findByTitle(/Vídeo da aula: Confidencialidade/)) as HTMLIFrameElement;
    const srcInicial = iframe.getAttribute("src");
    expect(new URL(srcInicial!).searchParams.get("start")).toBe("40");
    const enviar = (info: Record<string, number>) =>
      act(() => {
        window.dispatchEvent(new MessageEvent("message", { origin: ORIGEM_YOUTUBE, source: iframe.contentWindow, data: JSON.stringify({ event: "infoDelivery", info }) }));
      });
    // gravação periódica: a posição salva muda na página
    enviar({ currentTime: 300, duration: 1020, playerState: 1 });
    await waitFor(() => expect(chamadas.some((c) => c.nome === "academy_registrar_progresso" && c.args.p_posicao === 300)).toBe(true));
    // conclusão aos 92%: a aula passa a concluída na página
    enviar({ currentTime: 960, duration: 1020, playerState: 1 });
    expect(await screen.findByText("Aula concluída")).toBeInTheDocument();
    const depois = screen.getByTitle(/Vídeo da aula: Confidencialidade/);
    expect(depois).toBe(iframe);
    expect(depois.getAttribute("src")).toBe(srcInicial);
  });

  it("marcar como concluída grava e troca o botão pelo estado concluído", async () => {
    const { sb, chamadas } = sbAula();
    abrir(2, sb);
    fireEvent.click(await screen.findByRole("button", { name: /Marcar como concluída/ }));
    expect(await screen.findByText("Aula concluída")).toBeInTheDocument();
    const c = chamadas.find((x) => x.nome === "academy_registrar_progresso");
    expect(c?.args).toMatchObject({ p_aula_id: "a2", p_posicao: 1020, p_concluida: true });
  });

  it("vídeo indisponível vira mensagem clara, sem player quebrado", async () => {
    const { sb } = sbAula({ videoErro: "sem_video" });
    abrir(1, sb);
    expect(await screen.findByRole("alert")).toHaveTextContent("indisponível no momento");
    expect(screen.queryByRole("button", { name: /Assistir/ })).not.toBeInTheDocument();
  });

  it("aula de módulo bloqueado explica o que falta, sem player", async () => {
    const { sb } = sbAula({ videoErro: "modulo_bloqueado" });
    abrir(2, sb);
    expect(await screen.findByRole("alert")).toHaveTextContent("passar nas questões do módulo anterior");
    expect(screen.queryByRole("button", { name: /Assistir/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Tentar de novo/ })).not.toBeInTheDocument();
  });

  it("curso fora da conta do aluno não mostra o player", async () => {
    const { sb } = sbAula({ matriculado: false });
    abrir(1, sb);
    expect(await screen.findByText("Este curso ainda não está na sua conta")).toBeInTheDocument();
  });

  it("aula que não existe cai na página de não encontrado", async () => {
    const { sb } = sbAula();
    abrir(99, sb);
    expect(await screen.findByText(/não encontr/i)).toBeInTheDocument();
  });

  it("não tem violação grave de acessibilidade", async () => {
    const { sb } = sbAula();
    const { container } = abrir(2, sb);
    await screen.findByRole("heading", { level: 1 });
    expect(await violacoesGraves(container)).toEqual([]);
  });
});

describe("página do curso", () => {
  it("cada aula leva para a sala de aula e o botão principal começa pela primeira não concluída", async () => {
    const { sb } = sbAula({ progresso: [{ aula_id: "a1", posicao_seg: 122, concluida_em: "2026-11-18T10:00:00Z" }] });
    renderizar(<Curso />, { rota: `/cursos/${CURSO.slug}`, caminho: "/cursos/:slug", sb });
    expect(await screen.findByRole("button", { name: /Introdução/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Continuar o curso/ })).toHaveAttribute("href", `/cursos/${CURSO.slug}/aulas/2`);
    fireEvent.click(screen.getByRole("button", { name: /Módulo 1: Princípios de segurança/ }));
    expect(await screen.findByRole("link", { name: /Risco, ameaça/ })).toHaveAttribute("href", `/cursos/${CURSO.slug}/aulas/3`);
  });
});

describe("canal com o YouTube e ordem das aulas", () => {
  it("lê só eventos conhecidos e com números válidos", () => {
    expect(lerMensagem(JSON.stringify({ event: "infoDelivery", info: { currentTime: 3.5, duration: 10, playerState: 1 } }))).toEqual({ tempo: 3.5, duracao: 10, estado: 1 });
    expect(lerMensagem(JSON.stringify({ event: "onStateChange", info: 0 }))).toEqual({ estado: 0 });
    expect(lerMensagem("{quebrado")).toBeNull();
    expect(lerMensagem({ event: "infoDelivery", info: { currentTime: "x" } })).toBeNull();
    expect(lerMensagem({ event: "outro" })).toBeNull();
  });

  it("recusa referência de vídeo fora do formato", () => {
    expect(() => urlEmbed("../../x", { inicio: 0, origem: "https://academy.cydef.com.br" })).toThrow();
    expect(urlEmbed("AKtr_lmAB6Y", { inicio: 0, origem: "https://academy.cydef.com.br" })).not.toContain("start=");
  });

  it("acha a aula pelo número, com vizinhas atravessando módulos", () => {
    const curso = { ...CURSO, matriculado: true, modulos: CURSO.modulos.map((m) => ({ ...m, aulas: m.aulas.map((a) => ({ ...a, concluida: false, posicao_seg: 0 })) })) } as CursoDetalhe;
    const p = localizarAula(curso, 2)!;
    expect(p.anterior?.numero).toBe(1);
    expect(p.proxima?.numero).toBe(3);
    expect([p.indice, p.total]).toEqual([1, 2]);
    expect([localizarAula(curso, 3)!.indice, localizarAula(curso, 1)!.total]).toEqual([2, 1]);
    expect(localizarAula(curso, 1)!.anterior).toBeNull();
    expect(localizarAula(curso, 4)).toBeNull();
    expect(rotuloModulo(0, "Introdução")).toBe("Introdução");
    expect(rotuloModulo(2, "Redes")).toBe("Módulo 2: Redes");
  });
});

vi.setConfig({ testTimeout: 15_000 });
