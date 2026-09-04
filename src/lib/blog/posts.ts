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
  sections: BlogSection[];
  sources: { label: string; url: string }[];
  changelog?: string[];
}

export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  lists?: { title?: string; items: string[] }[];
  paragraphsAfter?: string[];
  code?: string;
  note?: string;
}

/** Metadados do artigo (sem o corpo). Módulo leve — P3-01 code-splitting.
 *  A home e as listagens usam APENAS estes dados; o corpo (sections/sources)
 *  vive em posts.content.ts e só é carregado na página do artigo. */
export type BlogPostMeta = Omit<BlogPost, "sections" | "sources" | "changelog">;

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
