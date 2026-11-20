import { useQuery } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { usePortal } from "./portal";
import { chamar } from "./instrutor";

/**
 * Academy para empresas (banco na 0024). A CyDef (admin) cadastra a empresa e
 * o contrato; a gestora convida a equipe e acompanha o progresso; cada pessoa
 * aceita o convite sabendo o que a gestão vai ver.
 */

export type TipoEmpresa = "consultoria" | "plano";
export type EscopoEmpresa = "curso" | "trilha" | "plataforma";
export type SituacaoEmpresa = "futura" | "vigente" | "vencida" | "encerrada";

export interface Empresa {
  id: string;
  nome: string;
  tipo: TipoEmpresa;
  escopo: EscopoEmpresa;
  curso: string | null;
  trilha: string | null;
  alvo: string;
  inicio: string;
  fim: string;
  vagas: number;
  usadas: number;
  ativos: number;
  convites: number;
  gestoras: string[];
  observacao: string;
  situacao: SituacaoEmpresa;
  encerrada_em: string | null;
  motivo: string | null;
  criado_em: string;
}

export interface ProgressoCurso {
  slug: string;
  titulo: string;
  total: number;
  concluidas: number;
  aprovado: boolean;
  certificado_em: string | null;
}

export interface MembroEmpresa {
  id: string;
  email: string;
  gestor: boolean;
  situacao: "convidado" | "ativo";
  nome: string | null;
  convidado_em: string;
  convite_enviado_em: string | null;
  aceito_em: string | null;
  ultimo_acesso: string | null;
  cursos: ProgressoCurso[];
}

export interface PainelEmpresa {
  empresa: Empresa;
  membros: MembroEmpresa[];
}

export interface ConviteRecebido {
  id: string;
  empresa: string;
  gestor: boolean;
  alvo: string;
  inicio: string;
  fim: string;
  convidado_em: string;
}

export interface MinhaEmpresa {
  id: string;
  membro: string;
  empresa: string;
  gestor: boolean;
  alvo: string;
  inicio: string;
  fim: string;
  situacao: SituacaoEmpresa;
  aceito_em: string;
  aviso_versao: string;
}

export interface MinhasEmpresas {
  convites: ConviteRecebido[];
  empresas: MinhaEmpresa[];
}

export const TIPO_EMPRESA: Record<TipoEmpresa, string> = { consultoria: "Consultoria", plano: "Plano para times" };
export const SITUACAO_EMPRESA: Record<SituacaoEmpresa, string> = {
  futura: "Começa depois",
  vigente: "Vigente",
  vencida: "Vencido",
  encerrada: "Encerrado",
};

const VAZIO: MinhasEmpresas = { convites: [], empresas: [] };

/** Convites e empresas da pessoa. Banco antes da 0024: nada a mostrar. */
export function useMinhasEmpresas() {
  const { sb, sessao } = usePortal();
  return useQuery({
    queryKey: ["empresas", "minhas", sessao?.user.id],
    enabled: !!sessao,
    queryFn: async () => {
      try {
        return await chamar<MinhasEmpresas>(sb, "academy_minhas_empresas");
      } catch {
        return VAZIO;
      }
    },
    staleTime: 60_000,
  });
}

export function useEmpresasAdm() {
  const { sb } = usePortal();
  return useQuery({ queryKey: ["adm", "empresas"], queryFn: () => chamar<Empresa[]>(sb, "academy_adm_empresas") });
}

export function useEmpresaPainel(id: string) {
  const { sb } = usePortal();
  return useQuery({ queryKey: ["empresa", id], queryFn: () => chamar<PainelEmpresa>(sb, "academy_empresa_painel", { p_empresa: id }) });
}

export interface ResultadoEnvio {
  enviados: number;
  falhas: number;
  email: "ligado" | "desligado";
}

/**
 * Pede à função academy-empresa que envie os e-mails dos convites pendentes.
 * Se falhar, o convite continua valendo: a pessoa o encontra ao entrar no
 * portal com o e-mail convidado.
 */
export async function enviarConvites(sb: SupabaseClient, empresaId: string): Promise<ResultadoEnvio | null> {
  try {
    const { data, error } = await sb.functions.invoke<ResultadoEnvio>("academy-empresa", { body: { empresa_id: empresaId } });
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

/** Separa e-mails colados com vírgula, ponto e vírgula, espaço ou quebra de linha. */
export function lerEmails(texto: string): string[] {
  return [...new Set(texto.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))];
}

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "Faltam 12 dias", "Termina hoje"... a partir da data de fim (último dia de acesso). */
export function prazoContrato(fim: string, hoje = new Date()): string {
  const [a, m, d] = fim.split("-").map(Number);
  const alvo = Date.UTC(a!, m! - 1, d!);
  const base = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dias = Math.round((alvo - base) / 86_400_000);
  if (dias < 0) return "Encerrado";
  if (dias === 0) return "Último dia hoje";
  if (dias === 1) return "Termina amanhã";
  return `Faltam ${dias} dias`;
}

function celula(v: string): string {
  const t = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",;\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

/** Planilha (CSV com ;) do progresso da equipe, uma linha por pessoa e curso. */
export function csvProgresso(p: PainelEmpresa): string {
  const linhas = [["Nome", "E-mail", "Situação", "Curso", "Aulas concluídas", "Aulas do curso", "Avaliação final", "Certificado", "Último acesso"]];
  for (const m of p.membros) {
    const base = [m.nome ?? "", m.email, m.situacao === "ativo" ? (m.gestor ? "Ativo, gestão" : "Ativo") : "Convite pendente"];
    const acesso = m.ultimo_acesso ? m.ultimo_acesso.slice(0, 10) : "";
    if (m.cursos.length === 0) linhas.push([...base, "", "", "", "", "", acesso]);
    for (const c of m.cursos) {
      linhas.push([...base, c.titulo, String(c.concluidas), String(c.total), c.aprovado ? "Aprovado" : "", c.certificado_em ? c.certificado_em.slice(0, 10) : "", acesso]);
    }
  }
  return "﻿" + linhas.map((l) => l.map(celula).join(";")).join("\r\n");
}

/** Data só de dia ("2027-05-31") em "31/05/2027", sem passar por fuso. */
export function dia(d: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : d;
}
