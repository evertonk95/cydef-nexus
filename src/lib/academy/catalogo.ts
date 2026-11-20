import snapshot from "./catalogo-snapshot.json";
export { NIVEL_KEY } from "./nivel-chave";

/**
 * Catálogo da CyDef Academy no site (fase 14).
 *
 * Fonte única: a função pública `academy_catalogo_publico` do banco (0020). O
 * build lê dela e grava `catalogo-snapshot.json` (scripts/gen-catalogo-academy.mjs);
 * uma verificação de hora em hora publica o site de novo quando o catálogo
 * muda. As mesmas informações aparecem no catálogo do portal e na página do
 * produto na Hotmart.
 *
 * Os cursos são dados em português (são ministrados em português). As páginas
 * em inglês e espanhol traduzem a moldura e mostram o curso como ele é.
 *
 * Módulo do catálogo completo: só as páginas da Academy importam. A home, o og
 * e o sitemap usam `catalogo-meta.ts`, que é leve.
 */

export type Nivel = "iniciante" | "intermediario" | "avancado";
export type SituacaoCurso = "em_breve" | "a_venda";

export interface AulaCatalogo {
  titulo: string;
  duracao_seg: number;
}

export interface ModuloCatalogo {
  ordem: number;
  titulo: string;
  resumo: string;
  aulas: AulaCatalogo[];
}

export interface InstrutorCatalogo {
  nome: string;
  cargo: string;
  bio: string;
  linkedin: string | null;
  site: string | null;
  papel: "instrutor" | "convidado";
}

export interface CursoCatalogo {
  slug: string;
  titulo: string;
  descricao: string;
  nivel: Nivel;
  objetivos: string[];
  publico: string;
  pre_requisitos: string;
  situacao: SituacaoCurso;
  carga_horaria_h: number | null;
  preco_centavos: number | null;
  preco_observacao: string;
  checkout_url: string | null;
  trilhas: string[];
  modulos: ModuloCatalogo[];
  instrutores: InstrutorCatalogo[];
  atualizado_em: string;
}

export interface TrilhaCatalogo {
  slug: string;
  titulo: string;
  descricao: string;
  cursos: string[];
}

export interface Catalogo {
  trilhas: TrilhaCatalogo[];
  cursos: CursoCatalogo[];
}

export const catalogoAcademy = snapshot as Catalogo;

const porSlug = new Map(catalogoAcademy.cursos.map((c) => [c.slug, c]));

export const cursoDoCatalogo = (slug: string | undefined): CursoCatalogo | undefined => (slug ? porSlug.get(slug) : undefined);

/** Trilhas com os cursos já resolvidos, na ordem da trilha. */
export const trilhasComCursos = (c: Catalogo = catalogoAcademy) => {
  const mapa = new Map(c.cursos.map((k) => [k.slug, k]));
  return c.trilhas
    .map((t) => ({ ...t, cursosDaTrilha: t.cursos.flatMap((s) => (mapa.has(s) ? [mapa.get(s)!] : [])) }))
    .filter((t) => t.cursosDaTrilha.length > 0);
};

const CHECKOUT = /^https:\/\/(pay|checkout)\.hotmart\.com\/[A-Za-z0-9]{4,40}(\?[A-Za-z0-9=&._-]{1,200})?$/;

/** Link do Comprar no site: checkout da Hotmart com a origem marcada (`sck=site`). */
export const linkCompraSite = (curso: Pick<CursoCatalogo, "situacao" | "checkout_url">): string | null => {
  if (curso.situacao !== "a_venda" || !curso.checkout_url || !CHECKOUT.test(curso.checkout_url)) return null;
  const u = new URL(curso.checkout_url);
  u.searchParams.set("sck", "site");
  return u.toString();
};

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatarPreco = (centavos: number): string => BRL.format(centavos / 100);

/** "80 h", "1,5 h". */
export const cargaHoraria = (h: number | null, decimal = ","): string | null => {
  if (h == null) return null;
  const n = Number(h);
  const texto = Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", decimal);
  return `${texto} h`;
};

/** "12 min", "1h 05min". */
export const duracaoAula = (seg: number): string => {
  const min = Math.max(1, Math.round(seg / 60));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto ? `${h}h ${String(resto).padStart(2, "0")}min` : `${h}h`;
};
