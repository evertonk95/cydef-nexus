import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Minha conta (banco na 0018). Tudo do próprio aluno: o banco confere quem
 * chama (auth.uid()) em cada função.
 */

export interface MeuCertificado {
  codigo: string;
  curso_slug: string;
  curso_titulo: string;
  nome: string;
  carga_horaria_h: number;
  concluido_em: string;
  validacao_publica: boolean;
}

/** Avisos por e-mail (0028, fase 18). Certificado emitido chega sempre; aula nova só ligada. */
export interface MeusAvisos {
  aula_nova: boolean;
  aula_nova_desde: string | null;
}

const MENSAGENS: Record<string, string> = {
  nome_invalido: "O nome precisa ter entre 2 e 80 caracteres.",
  sem_cadastro: "Este login não tem cadastro de aluno.",
  certificado_inexistente: "Certificado não encontrado na sua conta.",
  nao_autenticado: "Sua sessão expirou. Entre de novo.",
};

export class ErroConta extends Error {
  constructor(readonly codigo: string) {
    super(MENSAGENS[codigo] ?? "Não foi possível salvar. Tente de novo.");
  }
}

async function chamar<T>(sb: SupabaseClient, fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await sb.rpc(fn, args);
  if (error) throw new ErroConta(Object.keys(MENSAGENS).find((c) => error.message?.includes(c)) ?? "falha");
  return data as T;
}

export const atualizarNome = (sb: SupabaseClient, nome: string) => chamar<{ nome: string }>(sb, "academy_atualizar_nome", { p_nome: nome });
export const meusCertificados = (sb: SupabaseClient) => chamar<MeuCertificado[]>(sb, "academy_meus_certificados");
export const definirValidacao = (sb: SupabaseClient, codigo: string, ativa: boolean) =>
  chamar<MeuCertificado[]>(sb, "academy_validacao_publica", { p_codigo: codigo, p_ativa: ativa });
export const meusAvisos = (sb: SupabaseClient) => chamar<MeusAvisos>(sb, "academy_meus_avisos");
export const definirAvisoAulaNova = (sb: SupabaseClient, ligado: boolean) =>
  chamar<MeusAvisos>(sb, "academy_definir_aviso_aula_nova", { p_ligado: ligado });
/** Cópia dos dados. Desde a 0023 inclui os acessos pagos (compras e liberações); desde a 0024, as empresas e convites; desde a 0028, a preferência de avisos por e-mail. */
export async function meusDados(sb: SupabaseClient): Promise<Record<string, unknown>> {
  const dados = await chamar<Record<string, unknown>>(sb, "academy_meus_dados");
  try {
    dados.acessos_pagos = await chamar<unknown[]>(sb, "academy_meus_acessos");
  } catch {
    // Banco antes da 0023: a cópia sai sem os acessos pagos.
  }
  try {
    dados.empresas = await chamar<unknown>(sb, "academy_minhas_empresas");
  } catch {
    // Banco antes da 0024: a cópia sai sem as empresas.
  }
  try {
    dados.avisos_por_email = await meusAvisos(sb);
  } catch {
    // Banco antes da 0028: a cópia sai sem a preferência de avisos.
  }
  return dados;
}

/** Nome do arquivo da cópia dos dados: meus-dados-cydef-academy-2026-11-19.json */
export function arquivoDados(agora = new Date()): string {
  const d = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  return `meus-dados-cydef-academy-${d}.json`;
}

/** E-mail pronto para o pedido de exclusão, no canal e assunto do Aviso (item 11). */
export function emailExclusao(email: string): string {
  const assunto = "LGPD: Solicitação de titular";
  const corpo = [
    "Olá, equipe CyDef.",
    "",
    "Peço a eliminação da minha conta na CyDef Academy e dos dados associados a ela.",
    "",
    `E-mail da conta: ${email}`,
    "",
    "Estou ciente de que a eliminação encerra o acesso aos cursos e ao histórico de estudo e desativa a validação dos certificados emitidos.",
  ].join("\n");
  return `mailto:contato@cydef.com.br?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

/** Baixa um conteúdo como arquivo, sem sair da página. */
export function baixarArquivo(conteudo: BlobPart, nome: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
