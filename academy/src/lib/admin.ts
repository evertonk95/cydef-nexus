import { useQuery } from "@tanstack/react-query";
import { usePortal } from "./portal";
import { chamar } from "./instrutor";
import { chamarPerfil, type Perfil, type PerfilForm } from "./perfil";

/**
 * Indicadores e Pessoas (0032, fase 20). Só admin: as funções conferem o papel
 * no banco, e o portal só esconde as abas de quem não é admin.
 */

export interface Contagem {
  total: number;
  ult_7?: number;
  ult_30?: number;
}

export interface CursoIndicador {
  slug: string;
  titulo: string;
  gratuito: boolean;
  aulas: number;
  matriculados: number;
  comecaram: number;
  concluiram: number;
  media_conclusao: number;
  aprovados_final: number;
  certificados: number;
}

export interface Indicadores {
  gerado_em: string;
  pre_inscricoes: Required<Contagem>;
  contas: Required<Contagem>;
  ativos: { ult_7: number; ult_30: number };
  certificados: { total: number; ult_30: number };
  funil: { pre_inscritos: number; entraram: number; comecaram: number; concluiram_curso: number; certificados: number };
  por_dia: { dia: string; pre_inscricoes: number; contas: number }[];
  perfil_declarado: Record<string, number>;
  areas: Record<string, number>;
  experiencia: Record<string, number>;
  cursos: CursoIndicador[];
}

export type FiltroPessoas = "todos" | "contas" | "sem_conta" | "equipe";

export interface PessoaLista {
  tipo: "conta" | "pre_inscricao";
  user_id: string | null;
  lead_id: string | null;
  nome: string;
  email: string;
  papel: "admin" | "instrutor" | null;
  perfil_declarado: string | null;
  cadastro_em: string;
  ultimo_acesso_em: string | null;
  cursos: number;
  certificados: number;
}

export interface CursoPessoa {
  slug: string;
  titulo: string;
  origem: "gratuito" | "compra" | "cortesia";
  matriculado_em: string;
  progresso: { aulas: number; concluidas: number; ultima_atividade: string | null };
}

export interface FichaPessoa {
  user_id: string;
  perfil: Perfil;
  criado_em: string;
  ultimo_acesso_em: string | null;
  papel: "admin" | "instrutor" | null;
  eu: boolean;
  cursos_equipe: string[];
  pre_inscricao: { perfil: string; criado_em: string; status: string } | null;
  cursos: CursoPessoa[];
  certificados: { codigo: string; curso_titulo: string; emitido_em: string }[];
  missoes: { tentativas: number; aprovadas: number };
}

/** Perfil declarado na pré-inscrição (leads.perfil). */
export const PERFIS_DECLARADOS: Record<string, string> = {
  iniciante: "Iniciante em segurança",
  transicao: "Em transição para SOC",
  profissional: "Profissional de TI ou segurança",
  estudante: "Estudante",
  outro: "Outro",
};

export const POR_PAGINA = 50;

export function useIndicadores() {
  const { sb } = usePortal();
  return useQuery({ queryKey: ["adm-indicadores"], queryFn: () => chamar<Indicadores>(sb, "academy_adm_indicadores"), retry: false });
}

export function usePessoas(busca: string, filtro: FiltroPessoas, pagina: number) {
  const { sb } = usePortal();
  return useQuery({
    queryKey: ["adm-pessoas", busca, filtro, pagina],
    queryFn: () =>
      chamar<{ total: number; itens: PessoaLista[] }>(sb, "academy_adm_pessoas", {
        p_busca: busca || null,
        p_filtro: filtro,
        p_limite: POR_PAGINA,
        p_offset: pagina * POR_PAGINA,
      }),
    placeholderData: (anterior) => anterior,
    retry: false,
  });
}

export function usePessoa(id: string | undefined) {
  const { sb } = usePortal();
  return useQuery({
    queryKey: ["adm-pessoa", id],
    queryFn: () => chamar<FichaPessoa>(sb, "academy_adm_pessoa", { p_user_id: id }),
    enabled: Boolean(id),
    retry: false,
  });
}

/** Quem é o dono da plataforma (0033). A conta dele só muda pelas mãos dele. */
export interface Dono {
  user_id: string | null;
  eu: boolean;
}

export function useDono() {
  const { sb } = usePortal();
  return useQuery({
    queryKey: ["adm-dono"],
    queryFn: () => chamar<Dono>(sb, "academy_adm_dono"),
    staleTime: Infinity,
    retry: false,
  });
}

/** Edita o perfil de outra pessoa; os erros de campo vêm com as mensagens do perfil. */
export const salvarPerfilAdm = (sb: Parameters<typeof chamar>[0], id: string, dados: PerfilForm) =>
  chamarPerfil<FichaPessoa>(sb, "academy_adm_salvar_perfil", { p_user_id: id, p_dados: dados });

/** Porcentagem inteira, sem dividir por zero. */
export function pct(parte: number, todo: number): number {
  return todo > 0 ? Math.round((parte * 100) / todo) : 0;
}
