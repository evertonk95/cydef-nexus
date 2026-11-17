import type { SupabaseClient } from "@supabase/supabase-js";

export interface ContinuarAula {
  curso_slug: string;
  curso_titulo: string;
  modulo_ordem: number;
  modulo_titulo: string;
  aula_id: string;
  aula_numero: number;
  aula_titulo: string;
  duracao_seg: number;
  posicao_seg: number;
  progresso_curso: number;
}

export interface CursoResumo {
  slug: string;
  titulo: string;
  total: number;
  concluidas: number;
  ultimo_acesso: string | null;
}

export interface TrilhaResumo {
  slug: string;
  titulo: string;
  total: number;
  concluidas: number;
}

export interface FormacaoResumo {
  slug: string;
  titulo: string;
  aulas_total: number;
  aulas_concluidas: number;
  trilhas: TrilhaResumo[];
}

export interface Competencia {
  slug: string;
  titulo: string;
  percentual: number;
}

export interface Painel {
  nome: string;
  continuar: ContinuarAula | null;
  cursos: CursoResumo[];
  formacoes: FormacaoResumo[];
  competencias: Competencia[];
  dias_estudo: string[];
  hoje: string;
}

export interface ItemBoletim {
  id: string;
  tipo: "atualizacao" | "ameaca" | "missao" | "aula";
  titulo: string;
  link: string | null;
  publicado_em: string;
}

export async function buscarPainel(sb: SupabaseClient): Promise<Painel | null> {
  const { data, error } = await sb.rpc("academy_meu_painel");
  if (error) throw new Error("painel_indisponivel");
  return (data as Painel | null) ?? null;
}

export async function buscarBoletim(sb: SupabaseClient): Promise<ItemBoletim[]> {
  const { data, error } = await sb
    .from("boletim")
    .select("id, tipo, titulo, link, publicado_em")
    .order("publicado_em", { ascending: false })
    .limit(4);
  if (error) throw new Error("boletim_indisponivel");
  return (data ?? []) as ItemBoletim[];
}

/** Soma um número de dias a uma data ISO (AAAA-MM-DD), sem fuso. */
export function somarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split("-").map(Number) as [number, number, number];
  const t = Date.UTC(a, m - 1, d) + dias * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/** Dias seguidos de estudo terminando hoje ou ontem (hoje ainda pode acontecer). */
export function sequenciaAtual(dias: string[], hoje: string): number {
  const conjunto = new Set(dias);
  let cursor = conjunto.has(hoje) ? hoje : somarDias(hoje, -1);
  let n = 0;
  while (conjunto.has(cursor)) {
    n += 1;
    cursor = somarDias(cursor, -1);
  }
  return n;
}

export interface CelulaMapa {
  dia: string;
  estudou: boolean;
  futuro: boolean;
}

/**
 * Mapa de 12 semanas (colunas) por 7 dias (linhas, domingo a sábado), com a
 * última coluna na semana de hoje.
 */
export function mapaDeEstudo(dias: string[], hoje: string, semanas = 12): CelulaMapa[][] {
  const conjunto = new Set(dias);
  const [a, m, d] = hoje.split("-").map(Number) as [number, number, number];
  const diaSemana = new Date(Date.UTC(a, m - 1, d)).getUTCDay();
  const inicio = somarDias(hoje, -diaSemana - (semanas - 1) * 7);
  const colunas: CelulaMapa[][] = [];
  for (let c = 0; c < semanas; c += 1) {
    const coluna: CelulaMapa[] = [];
    for (let r = 0; r < 7; r += 1) {
      const dia = somarDias(inicio, c * 7 + r);
      coluna.push({ dia, estudou: conjunto.has(dia), futuro: dia > hoje });
    }
    colunas.push(coluna);
  }
  return colunas;
}
