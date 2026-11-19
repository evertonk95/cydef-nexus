import type { SupabaseClient } from "@supabase/supabase-js";
import type { AulaLista, CursoDetalhe, ModuloLista } from "./cursos";
import { contagem } from "./formato";

export interface Video {
  provedor: "youtube" | "bunny";
  ref: string;
}

export type CodigoErroAula = "sem_matricula" | "aula_indisponivel" | "sem_video" | "modulo_bloqueado" | "falha";

export class ErroAula extends Error {
  constructor(public readonly codigo: CodigoErroAula) {
    super(codigo);
  }
}

function codigoDe(mensagem?: string): CodigoErroAula {
  for (const c of ["sem_matricula", "aula_indisponivel", "sem_video", "modulo_bloqueado"] as const) {
    if (mensagem?.includes(c)) return c;
  }
  return "falha";
}

/** Provedor e referência do vídeo, só para aluno matriculado em aula publicada. */
export async function buscarVideo(sb: SupabaseClient, aulaId: string): Promise<Video> {
  const { data, error } = await sb.rpc("academy_video_aula", { p_aula_id: aulaId });
  if (error) throw new ErroAula(codigoDe(error.message));
  const v = data as Partial<Video> | null;
  if (!v || (v.provedor !== "youtube" && v.provedor !== "bunny") || typeof v.ref !== "string" || !/^[A-Za-z0-9_-]{6,64}$/.test(v.ref)) {
    throw new ErroAula("falha");
  }
  return { provedor: v.provedor, ref: v.ref };
}

/** Grava posição e conclusão. A conclusão é definitiva no banco. */
export async function registrarProgresso(
  sb: SupabaseClient,
  aulaId: string,
  posicao: number,
  concluida: boolean,
): Promise<{ concluida: boolean }> {
  const { data, error } = await sb.rpc("academy_registrar_progresso", {
    p_aula_id: aulaId,
    p_posicao: Math.max(0, Math.floor(posicao)),
    p_concluida: concluida,
  });
  if (error) throw new ErroAula(codigoDe(error.message));
  return { concluida: Boolean((data as { concluida?: boolean } | null)?.concluida ?? concluida) };
}

/** "Introdução" para o módulo 0; "Módulo N: Título" para os demais. */
export function rotuloModulo(ordem: number, titulo: string): string {
  return ordem === 0 ? titulo : `Módulo ${ordem}: ${titulo}`;
}

/** Rótulo curto para metadados: "Introdução" ou "Módulo N". */
export function rotuloModuloCurto(ordem: number, titulo: string): string {
  return ordem === 0 ? titulo : `Módulo ${ordem}`;
}

export function caminhoAula(slug: string, numero: number): string {
  return `/cursos/${slug}/aulas/${numero}`;
}

export function numeroAula(numero: number): string {
  return String(numero).padStart(2, "0");
}

export interface PosicaoNoCurso {
  aula: AulaLista;
  modulo: ModuloLista;
  anterior: AulaLista | null;
  proxima: AulaLista | null;
  indice: number;
  total: number;
}

/** Acha a aula pelo número e devolve vizinhas na ordem do curso. */
export function localizarAula(curso: CursoDetalhe, numero: number): PosicaoNoCurso | null {
  const sequencia = curso.modulos.flatMap((m) => m.aulas.map((a) => ({ a, m })));
  const i = sequencia.findIndex((x) => x.a.numero === numero);
  if (i === -1) return null;
  const atual = sequencia[i]!;
  return {
    aula: atual.a,
    modulo: atual.m,
    anterior: sequencia[i - 1]?.a ?? null,
    proxima: sequencia[i + 1]?.a ?? null,
    indice: i + 1,
    total: sequencia.length,
  };
}

/** Primeira aula não concluída do curso (ou a primeira, se tudo estiver feito). */
export function aulaParaContinuar(curso: CursoDetalhe): AulaLista | null {
  const aulas = curso.modulos.flatMap((m) => m.aulas);
  return aulas.find((a) => !a.concluida) ?? aulas[0] ?? null;
}

export interface ResumoCurso {
  feitas: number;
  total: number;
  percentual: number;
  /** Módulos que ainda não têm aula publicada. */
  emProducao: number;
  /** Frase de progresso que não chama de concluído um curso pela metade. */
  texto: string;
}

/** Progresso do curso contando só o que foi publicado, e dizendo o que falta publicar. */
export function resumoDoCurso(curso: CursoDetalhe): ResumoCurso {
  const aulas = curso.modulos.flatMap((m) => m.aulas);
  const feitas = aulas.filter((a) => a.concluida).length;
  const total = aulas.length;
  const emProducao = curso.modulos.filter((m) => m.aulas.length === 0).length;
  const percentual = total ? Math.round((feitas / total) * 100) : 0;
  let texto: string;
  if (total === 0) texto = "As aulas deste curso estão em produção.";
  else {
    texto = `Concluídas: ${feitas} de ${contagem(total, emProducao ? "aula publicada" : "aula", emProducao ? "aulas publicadas" : "aulas")}.`;
    if (emProducao) texto += ` ${contagem(emProducao, "módulo está", "módulos estão")} em produção.`;
  }
  return { feitas, total, percentual, emProducao, texto };
}

/** Próximo módulo sem aula publicada depois do módulo atual, para avisar de onde vem a próxima aula. */
export function proximoModuloEmProducao(curso: CursoDetalhe, moduloAtualId: string): ModuloLista | null {
  const i = curso.modulos.findIndex((m) => m.id === moduloAtualId);
  return curso.modulos.slice(i + 1).find((m) => m.aulas.length === 0) ?? null;
}
