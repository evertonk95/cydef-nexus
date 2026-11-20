import { useQuery } from "@tanstack/react-query";
import { usePortal } from "./portal";
import { chamar } from "./instrutor";

/**
 * Vendas e acessos pagos (banco na 0021). Toda forma de acesso pago é uma
 * concessão: compra na Hotmart, liberação manual do admin ou, mais adiante,
 * contrato de empresa. O admin vê, libera, transfere e encerra por aqui.
 */

export type Escopo = "curso" | "trilha" | "plataforma";
export type OrigemConcessao = "hotmart" | "manual" | "empresa";
export type SituacaoConcessao = "ativa" | "vencida" | "encerrada";

export interface Concessao {
  id: string;
  email: string;
  nome: string;
  origem: OrigemConcessao;
  escopo: Escopo;
  curso: string | null;
  trilha: string | null;
  cursos: string[];
  alvo: string;
  inicio: string;
  fim: string | null;
  transacao: string | null;
  produto: number | null;
  revogada_em: string | null;
  motivo: string | null;
  conta: boolean;
  situacao: SituacaoConcessao;
  criado_em: string;
}

export interface ProdutoHotmart {
  hotmart_produto_id: number;
  nome: string;
  escopo: "trilha" | "plataforma";
  trilha: string | null;
  trilha_titulo: string | null;
  duracao_dias: number | null;
  ativo: boolean;
  vendas: number;
}

export interface Produtos {
  produtos: ProdutoHotmart[];
  cursos: { hotmart_produto_id: number; curso: string; titulo: string; vendas: number }[];
  eventos: { evento: string; resultado: string; produto: number; transacao: string; recebido_em: string }[];
}

export const ORIGEM: Record<OrigemConcessao, string> = { hotmart: "Hotmart", manual: "Liberação manual", empresa: "Empresa" };

export const RESULTADO_EVENTO: Record<string, string> = {
  liberado: "Acesso liberado",
  encerrado: "Acesso encerrado",
  ignorado: "Sem efeito",
  produto_desconhecido: "Produto não cadastrado",
  ja_encerrado: "Já encerrado",
};

export function useConcessoes(busca: string) {
  const { sb } = usePortal();
  return useQuery({
    queryKey: ["adm", "concessoes", busca],
    queryFn: () => chamar<Concessao[]>(sb, "academy_adm_concessoes", { p_busca: busca }),
  });
}

export function useProdutos() {
  const { sb } = usePortal();
  return useQuery({ queryKey: ["adm", "produtos"], queryFn: () => chamar<Produtos>(sb, "academy_adm_produtos") });
}

/** "Vitalício" ou "até 19/11/2027". */
export function validade(fim: string | null, formatar: (iso: string) => string): string {
  return fim ? `até ${formatar(fim)}` : "Vitalício";
}
