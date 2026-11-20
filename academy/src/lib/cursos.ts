import type { SupabaseClient } from "@supabase/supabase-js";

export interface AulaLista {
  id: string;
  ordem: number;
  numero: number;
  titulo: string;
  resumo: string;
  duracao_seg: number;
  concluida: boolean;
  /** Onde o aluno parou, em segundos (0 se nunca abriu). */
  posicao_seg: number;
}

export interface ModuloLista {
  id: string;
  ordem: number;
  titulo: string;
  /** Ementa do módulo (0016). Vazio quando não cadastrada. */
  resumo: string;
  aulas: AulaLista[];
}

export interface InstrutorCurso {
  id: string;
  nome: string;
  cargo: string;
  bio: string;
  linkedin: string | null;
  site: string | null;
  papel: "instrutor" | "convidado";
}

export interface CursoDetalhe {
  slug: string;
  titulo: string;
  descricao: string;
  nivel: "iniciante" | "intermediario" | "avancado";
  gratuito: boolean;
  /** Posição no catálogo (ordem da trilha). */
  ordem: number;
  matriculado: boolean;
  /** Sobre o curso (0016). Vazios quando não cadastrados. */
  objetivos: string[];
  publico: string;
  pre_requisitos: string;
  instrutores: InstrutorCurso[];
  modulos: ModuloLista[];
}

interface LinhaCurso {
  slug: string;
  titulo: string;
  descricao: string;
  nivel: CursoDetalhe["nivel"];
  gratuito: boolean;
  ordem?: number | null;
  objetivos?: string[] | null;
  publico?: string | null;
  pre_requisitos?: string | null;
  cursos_instrutores?: { papel: InstrutorCurso["papel"]; ordem: number; instrutores: Omit<InstrutorCurso, "papel"> | null }[] | null;
  modulos: { id: string; ordem: number; titulo: string; resumo?: string | null; aulas: Omit<AulaLista, "concluida" | "posicao_seg">[] }[];
}

const AULAS = "aulas(id, ordem, numero, titulo, resumo, duracao_seg)";
const SELECAO =
  "slug, titulo, descricao, nivel, gratuito, ordem, objetivos, publico, pre_requisitos, " +
  "cursos_instrutores(papel, ordem, instrutores(id, nome, cargo, bio, linkedin, site)), " +
  `modulos(id, ordem, titulo, resumo, ${AULAS})`;
/** Consulta de antes da 0016: o portal segue de pé se subir antes da migração. */
const SELECAO_ANTIGA = `slug, titulo, descricao, nivel, gratuito, ordem, modulos(id, ordem, titulo, ${AULAS})`;

export async function buscarCurso(sb: SupabaseClient, slug: string, userId: string): Promise<CursoDetalhe | null> {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 60) return null;
  let { data, error } = await sb.from("cursos").select(SELECAO).eq("slug", slug).maybeSingle();
  if (error) ({ data, error } = await sb.from("cursos").select(SELECAO_ANTIGA).eq("slug", slug).maybeSingle());
  if (error) throw new Error("curso_indisponivel");
  if (!data) return null;
  const curso = data as unknown as LinhaCurso;

  const ids = curso.modulos.flatMap((m) => m.aulas.map((a) => a.id));
  const [{ data: prog, error: e2 }, { data: mat, error: e3 }] = await Promise.all([
    ids.length
      ? sb.from("progresso_aulas").select("aula_id, posicao_seg, concluida_em").eq("user_id", userId).in("aula_id", ids)
      : Promise.resolve({ data: [], error: null }),
    sb.from("matriculas").select("curso_slug").eq("user_id", userId).eq("curso_slug", slug).maybeSingle(),
  ]);
  if (e2 || e3) throw new Error("curso_indisponivel");
  const progresso = new Map(
    ((prog ?? []) as { aula_id: string; posicao_seg: number; concluida_em: string | null }[]).map((p) => [p.aula_id, p]),
  );

  return {
    slug: curso.slug,
    titulo: curso.titulo,
    descricao: curso.descricao,
    nivel: curso.nivel,
    gratuito: curso.gratuito,
    ordem: curso.ordem ?? 0,
    matriculado: Boolean(mat),
    objetivos: curso.objetivos ?? [],
    publico: curso.publico ?? "",
    pre_requisitos: curso.pre_requisitos ?? "",
    instrutores: [...(curso.cursos_instrutores ?? [])]
      .sort((a, b) => a.ordem - b.ordem)
      .flatMap((v) => (v.instrutores ? [{ ...v.instrutores, papel: v.papel }] : [])),
    modulos: [...curso.modulos]
      .sort((a, b) => a.ordem - b.ordem)
      .map((m) => ({
        id: m.id,
        ordem: m.ordem,
        titulo: m.titulo,
        resumo: m.resumo ?? "",
        aulas: [...m.aulas]
          .sort((a, b) => a.ordem - b.ordem)
          .map((a) => ({
            ...a,
            concluida: Boolean(progresso.get(a.id)?.concluida_em),
            posicao_seg: progresso.get(a.id)?.posicao_seg ?? 0,
          })),
      })),
  };
}

export const NIVEL: Record<CursoDetalhe["nivel"], string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};
