import { useQuery } from "@tanstack/react-query";
import { usePortal } from "./portal";
import { chamar, type Nivel } from "./instrutor";

/**
 * Vitrine dos cursos (banco na 0020).
 *
 * A venda é da Hotmart. A CyDef mostra o curso em três lugares, todos lidos da
 * mesma função pública (`academy_catalogo_publico`): o site principal, o
 * catálogo do portal e, por fora, a página do produto na própria Hotmart. O
 * botão Comprar leva ao checkout da Hotmart com a origem marcada (`sck`), para
 * o relatório de vendas separar site, portal e venda direta.
 */

export type SituacaoVitrine = "oculto" | "em_breve" | "a_venda";

export type Pendencia = "gratuito" | "nao_publicado" | "sem_carga_horaria" | "sem_instrutor" | "sem_objetivos" | "sem_modulos";

export interface VitrineAdm {
  curso: string;
  situacao: SituacaoVitrine;
  /** O que vale de fato: à venda volta a "em breve" se o curso for despublicado. */
  situacao_efetiva: SituacaoVitrine;
  checkout_url: string | null;
  hotmart_produto_id: number | null;
  preco_centavos: number | null;
  preco_observacao: string;
  preco_conferido_em: string | null;
  atualizado_em: string | null;
  trilhas: { slug: string; titulo: string; publicado: boolean; no_curso: boolean }[];
  pendencias: Pendencia[];
}

export interface TrilhaAdm {
  slug: string;
  titulo: string;
  descricao: string;
  ordem: number;
  publicado: boolean;
  /** Preenchido quando a trilha compõe uma formação. */
  formacao: string | null;
  cursos: { slug: string; titulo: string; ordem: number; situacao: SituacaoVitrine }[];
}

export interface CursoCatalogo {
  slug: string;
  titulo: string;
  descricao: string;
  nivel: Nivel;
  objetivos: string[];
  publico: string;
  pre_requisitos: string;
  situacao: Exclude<SituacaoVitrine, "oculto">;
  carga_horaria_h: number | null;
  preco_centavos: number | null;
  preco_observacao: string;
  checkout_url: string | null;
  trilhas: string[];
  modulos: { ordem: number; titulo: string; resumo: string; aulas: { titulo: string; duracao_seg: number }[] }[];
  instrutores: { nome: string; cargo: string; bio: string; linkedin: string | null; site: string | null; papel: "instrutor" | "convidado" }[];
  atualizado_em: string;
}

/** Trilha completa ou plataforma toda à venda (0023). */
export interface OfertaCatalogo {
  tipo: "trilha" | "plataforma";
  nome: string;
  trilha: string | null;
  duracao_dias: number | null;
  cursos: number;
  preco_centavos: number;
  preco_observacao: string;
  checkout_url: string;
}

export interface Catalogo {
  trilhas: { slug: string; titulo: string; descricao: string; cursos: string[] }[];
  cursos: CursoCatalogo[];
  /** Ausente em banco antes da 0023. */
  ofertas?: OfertaCatalogo[];
}

export const SITUACOES: { valor: SituacaoVitrine; rotulo: string; ajuda: string }[] = [
  { valor: "oculto", rotulo: "Fora das vitrines", ajuda: "Não aparece no site nem no catálogo do portal." },
  { valor: "em_breve", rotulo: "Em breve", ajuda: "Aparece com a ementa e o botão Avise-me, sem preço." },
  { valor: "a_venda", rotulo: "À venda", ajuda: "Aparece com o preço e o botão Comprar, que leva ao checkout da Hotmart." },
];

export const PENDENCIAS: Record<Pendencia, { texto: string; aba?: string }> = {
  gratuito: { texto: "Curso gratuito não entra na vitrine paga. Ele aparece na seção de cursos gratuitos do site." },
  nao_publicado: { texto: "Publique o curso para colocar à venda.", aba: "dados" },
  sem_carga_horaria: { texto: "Informe a carga horária.", aba: "requisitos" },
  sem_instrutor: { texto: "Diga quem ensina.", aba: "sobre" },
  sem_objetivos: { texto: "Escreva o que o aluno vai aprender.", aba: "sobre" },
  sem_modulos: { texto: "Crie os módulos da ementa.", aba: "estrutura" },
};

/** Endereço público do curso no site principal. */
export const SITE_CURSO = (slug: string) => `https://www.cydef.com.br/pt/cursos/${slug}/`;

// Preço ------------------------------------------------------------------------

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarPreco(centavos: number): string {
  return BRL.format(centavos / 100);
}

/** "497", "497,00", "R$ 1.497,90" em centavos. Null se não for um valor. */
export function lerPreco(texto: string): number | null {
  const t = texto.replace(/R\$|\s/g, "");
  if (!t) return null;
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(t)) return null;
  const [inteiro = "0", frac = ""] = t.replace(/\./g, "").split(",");
  return Number(inteiro) * 100 + Number(frac.padEnd(2, "0"));
}

export function escreverPreco(centavos: number | null): string {
  if (centavos == null) return "";
  return (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Dias desde a última conferência do preço na Hotmart. */
export function diasDesde(iso: string | null, agora = Date.now()): number | null {
  if (!iso) return null;
  return Math.floor((agora - new Date(iso).getTime()) / 86_400_000);
}

// Compra -----------------------------------------------------------------------

const CHECKOUT = /^https:\/\/(pay|checkout)\.hotmart\.com\/[A-Za-z0-9]{4,40}(\?[A-Za-z0-9=&._-]{1,200})?$/;

/** Mesma regra do banco: só checkout da Hotmart, em https. */
export function checkoutValido(url: string): boolean {
  return CHECKOUT.test(url.trim());
}

/**
 * Link do botão Comprar. `sck` marca a origem no relatório da Hotmart. No
 * portal, o e-mail da conta vai preenchido, para a compra cair no mesmo
 * e-mail do acesso (parâmetro de checkout pré-preenchido da Hotmart).
 */
export function linkCompra(checkout: string, origem: "site" | "portal", email?: string | null): string | null {
  if (!checkoutValido(checkout)) return null;
  const u = new URL(checkout);
  u.searchParams.set("sck", origem);
  if (email) u.searchParams.set("email", email);
  return u.toString();
}

export function cargaHoraria(h: number | null): string | null {
  if (h == null) return null;
  const n = Number(h);
  return `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} h`;
}

// Consultas ----------------------------------------------------------------------

export function useVitrineAdm(slug: string) {
  const { sb } = usePortal();
  return useQuery({
    queryKey: ["adm", "vitrine", slug],
    queryFn: () => chamar<VitrineAdm>(sb, "academy_adm_vitrine", { p_curso: slug }),
    enabled: Boolean(slug),
  });
}

export function useTrilhasAdm() {
  const { sb } = usePortal();
  return useQuery({ queryKey: ["adm", "trilhas"], queryFn: () => chamar<TrilhaAdm[]>(sb, "academy_adm_trilhas") });
}

/** Catálogo público: o mesmo que o site lê no build. */
export function useCatalogo() {
  const { sb } = usePortal();
  return useQuery({
    queryKey: ["catalogo"],
    queryFn: async () => {
      const { data, error } = await sb.rpc("academy_catalogo_publico");
      if (error) throw error;
      return data as Catalogo;
    },
    staleTime: 60_000,
  });
}
