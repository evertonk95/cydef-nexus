import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Meu perfil (0030, fase 19). Só o nome é obrigatório; o e-mail é o login e
 * não muda por aqui. Quem vê: o próprio aluno e os administradores.
 */
export interface Perfil {
  nome: string;
  email: string;
  data_nascimento: string | null;
  telefone: string | null;
  cidade: string | null;
  pais: string | null;
  empresa: string | null;
  cargo: string | null;
  area: string | null;
  experiencia: string | null;
  bio: string | null;
  linkedin: string | null;
  atualizado_em: string | null;
}

/** O que o formulário envia: tudo em texto, vazio = sem valor. */
export type PerfilForm = Record<Exclude<keyof Perfil, "email" | "atualizado_em">, string>;

export const AREAS: { valor: string; rotulo: string }[] = [
  { valor: "seguranca", rotulo: "Segurança da informação" },
  { valor: "infraestrutura", rotulo: "Infraestrutura e redes" },
  { valor: "desenvolvimento", rotulo: "Desenvolvimento" },
  { valor: "dados", rotulo: "Dados" },
  { valor: "suporte", rotulo: "Suporte e service desk" },
  { valor: "gestao", rotulo: "Gestão" },
  { valor: "estudante", rotulo: "Estudante" },
  { valor: "outra", rotulo: "Outra área" },
];

export const EXPERIENCIAS: { valor: string; rotulo: string }[] = [
  { valor: "menos_1", rotulo: "Menos de 1 ano" },
  { valor: "1_3", rotulo: "De 1 a 3 anos" },
  { valor: "3_5", rotulo: "De 3 a 5 anos" },
  { valor: "5_10", rotulo: "De 5 a 10 anos" },
  { valor: "mais_10", rotulo: "Mais de 10 anos" },
];

/** Campos opcionais que contam para "perfil completo". */
const OPCIONAIS = ["data_nascimento", "telefone", "cidade", "pais", "empresa", "cargo", "area", "experiencia", "bio", "linkedin"] as const;

export function paraFormulario(p: Perfil): PerfilForm {
  return {
    nome: p.nome,
    data_nascimento: p.data_nascimento ?? "",
    telefone: p.telefone ?? "",
    cidade: p.cidade ?? "",
    pais: p.pais ?? "",
    empresa: p.empresa ?? "",
    cargo: p.cargo ?? "",
    area: p.area ?? "",
    experiencia: p.experiencia ?? "",
    bio: p.bio ?? "",
    linkedin: p.linkedin ?? "",
  };
}

/** Quantos dos campos opcionais estão preenchidos. */
export function preenchidos(f: PerfilForm): { feitos: number; total: number } {
  return { feitos: OPCIONAIS.filter((c) => f[c].trim() !== "").length, total: OPCIONAIS.length };
}

/** Data mais recente aceita: quem tem 16 anos hoje (a idade mínima da pré-inscrição). */
export function nascimentoMaximo(hoje = new Date()): string {
  const d = new Date(Date.UTC(hoje.getUTCFullYear() - 16, hoje.getUTCMonth(), hoje.getUTCDate()));
  return d.toISOString().slice(0, 10);
}

const MENSAGENS: Record<string, string> = {
  nome_invalido: "O nome precisa ter entre 2 e 80 caracteres.",
  telefone_invalido: "Telefone inválido. Use só números, com DDD, e se quiser o código do país (+55).",
  nascimento_invalido: "Data de nascimento inválida. A Academy é para quem tem 16 anos ou mais.",
  linkedin_invalido: "Use o endereço do seu perfil, no formato https://www.linkedin.com/in/seu-nome.",
  bio_invalida: "A bio pode ter até 600 caracteres.",
  campo_invalido: "Algum campo passou do tamanho ou tem um valor que não está na lista.",
  sem_cadastro: "Este login não tem cadastro de aluno.",
  sem_permissao: "Seu acesso não permite essa alteração.",
  pessoa_inexistente: "Pessoa não encontrada.",
  nao_autenticado: "Sua sessão expirou. Entre de novo.",
};

export class ErroPerfil extends Error {
  constructor(readonly codigo: string) {
    super(MENSAGENS[codigo] ?? "Não foi possível salvar. Tente de novo.");
  }
}

/** Chamada com as mensagens do perfil (também usada pelo admin na fase 20). */
export async function chamarPerfil<T>(sb: SupabaseClient, fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await sb.rpc(fn, args);
  if (error) throw new ErroPerfil(Object.keys(MENSAGENS).find((c) => error.message?.includes(c)) ?? "falha");
  return data as T;
}

export const meuPerfil = (sb: SupabaseClient) => chamarPerfil<Perfil>(sb, "academy_meu_perfil");
export const salvarMeuPerfil = (sb: SupabaseClient, dados: PerfilForm) =>
  chamarPerfil<Perfil>(sb, "academy_salvar_meu_perfil", { p_dados: dados });
