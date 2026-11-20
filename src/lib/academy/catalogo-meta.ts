import meta from "./catalogo-meta.json";
import type { Nivel, SituacaoCurso } from "./catalogo";

/**
 * O mínimo de cada curso do catálogo (fase 14): endereço, título, descrição,
 * nível, situação e carga horária. Leve de propósito: entra no chunk inicial
 * (home, og, hreflang) e no sitemap. Gerado junto com o catálogo completo por
 * scripts/gen-catalogo-academy.mjs.
 */
export interface CursoMeta {
  slug: string;
  titulo: string;
  descricao: string;
  nivel: Nivel;
  situacao: SituacaoCurso;
  carga_horaria_h: number | null;
}

export const cursosMeta = meta as CursoMeta[];

const porSlug = new Map(cursosMeta.map((c) => [c.slug, c]));

export const cursoMeta = (slug: string): CursoMeta | undefined => porSlug.get(slug);

/** Os cursos são em português: só a URL em português é canônica e vai para o sitemap. */
export const IDIOMA_DOS_CURSOS = "pt" as const;
