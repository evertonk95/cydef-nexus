import { blogPostsMetaByLang } from "./posts-meta.generated";
import type { Lang } from "@/i18n";

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  dateISO: string;
  readTime: string;
  image: string;
  author: string;
  authorRole?: string;
  tags?: string[];
  toc?: boolean;
  sections: BlogSection[];
  sources: { label: string; url: string }[];
  changelog?: string[];
}

export type CalloutKind = "regra" | "exemplo" | "ponto" | "aviso";

export interface BlogCallout {
  kind: CalloutKind;
  title?: string;
  body: string;
}

export interface BlogTable {
  headers: string[];
  rows: string[][];
}

export interface BlogFigure {
  src: string;
  alt: string;
  caption?: string;
}

/** Bloco ordenado de uma secao (artigos com `blocks` renderizam na ordem exata;
 *  campos legados — paragraphs/lists/code/etc. — continuam suportados e são
 *  ignorados quando `blocks` existe). */
export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "list"; title?: string; items: string[] }
  | { type: "code"; text: string }
  | { type: "table"; table: BlogTable }
  | { type: "callout"; callout: BlogCallout }
  | { type: "figure"; figure: BlogFigure }
  | { type: "note"; text: string };

export interface BlogSection {
  heading?: string;
  blocks?: BlogBlock[];
  paragraphs?: string[];
  lists?: { title?: string; items: string[] }[];
  paragraphsAfter?: string[];
  code?: string;
  note?: string;
}

/** Metadados do artigo (sem o corpo). Módulo leve — P3-01 code-splitting.
 *  A home e as listagens usam APENAS estes dados; o corpo (sections/sources)
 *  vive em posts.content.ts e só é carregado na página do artigo. */
export type BlogPostMeta = Omit<
  BlogPost,
  "sections" | "sources" | "changelog" | "tags" | "toc" | "authorRole"
>;

/** Artigos publicados (meta) por idioma — fonte: posts-meta.generated.ts
 *  (derivado do conteúdo; regenerar ao adicionar artigo — ver teste de guarda
 *  posts-meta.test.ts). PT é o fallback. */
export const postsMetaByLang: Record<Lang, BlogPostMeta[]> = blogPostsMetaByLang;

export const postsForLangMeta = (lang: Lang): BlogPostMeta[] =>
  blogPostsMetaByLang[lang] ?? blogPostsMetaByLang.pt;

export const countPostsForLang = (lang: Lang): number =>
  (blogPostsMetaByLang[lang] ?? blogPostsMetaByLang.pt).length;

export const postMetaBySlug = (
  slug: string,
  lang?: Lang,
): BlogPostMeta | undefined =>
  (lang ? postsForLangMeta(lang) : blogPostsMetaByLang.pt).find(
    (p) => p.slug === slug,
  );
