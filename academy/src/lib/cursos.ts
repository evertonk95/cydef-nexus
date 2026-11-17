import type { SupabaseClient } from "@supabase/supabase-js";

export interface AulaLista {
  id: string;
  ordem: number;
  numero: number;
  titulo: string;
  resumo: string;
  duracao_seg: number;
  concluida: boolean;
}

export interface ModuloLista {
  id: string;
  ordem: number;
  titulo: string;
  aulas: AulaLista[];
}

export interface CursoDetalhe {
  slug: string;
  titulo: string;
  descricao: string;
  nivel: "iniciante" | "intermediario" | "avancado";
  gratuito: boolean;
  matriculado: boolean;
  modulos: ModuloLista[];
}

interface LinhaCurso {
  slug: string;
  titulo: string;
  descricao: string;
  nivel: CursoDetalhe["nivel"];
  gratuito: boolean;
  modulos: { id: string; ordem: number; titulo: string; aulas: Omit<AulaLista, "concluida">[] }[];
}

export async function buscarCurso(sb: SupabaseClient, slug: string, userId: string): Promise<CursoDetalhe | null> {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 60) return null;
  const { data, error } = await sb
    .from("cursos")
    .select("slug, titulo, descricao, nivel, gratuito, modulos(id, ordem, titulo, aulas(id, ordem, numero, titulo, resumo, duracao_seg))")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error("curso_indisponivel");
  if (!data) return null;
  const curso = data as unknown as LinhaCurso;

  const ids = curso.modulos.flatMap((m) => m.aulas.map((a) => a.id));
  const [{ data: prog, error: e2 }, { data: mat, error: e3 }] = await Promise.all([
    ids.length
      ? sb.from("progresso_aulas").select("aula_id, concluida_em").eq("user_id", userId).in("aula_id", ids)
      : Promise.resolve({ data: [], error: null }),
    sb.from("matriculas").select("curso_slug").eq("user_id", userId).eq("curso_slug", slug).maybeSingle(),
  ]);
  if (e2 || e3) throw new Error("curso_indisponivel");
  const feitas = new Set(
    ((prog ?? []) as { aula_id: string; concluida_em: string | null }[])
      .filter((p) => p.concluida_em)
      .map((p) => p.aula_id),
  );

  return {
    slug: curso.slug,
    titulo: curso.titulo,
    descricao: curso.descricao,
    nivel: curso.nivel,
    gratuito: curso.gratuito,
    matriculado: Boolean(mat),
    modulos: [...curso.modulos]
      .sort((a, b) => a.ordem - b.ordem)
      .map((m) => ({
        id: m.id,
        ordem: m.ordem,
        titulo: m.titulo,
        aulas: [...m.aulas].sort((a, b) => a.ordem - b.ordem).map((a) => ({ ...a, concluida: feitas.has(a.id) })),
      })),
  };
}

export const NIVEL: Record<CursoDetalhe["nivel"], string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};
