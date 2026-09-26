// Route map — localized slugs per language (P2-03, SEO i18n).
// PT slugs are the historical canonical; EN/ES get their own slug per page.
// Content routes (blog/:slug, cursos/:courseId, academy/*) keep universal
// slugs because their data is keyed by the same slug across languages.
//
// Duas famílias de slug localizado, e a diferença é o que mantém o sitemap
// honesto (etapa 82):
// - `pageSlugs`: PÁGINAS do `PageRouter`, uma por componente de
//   `PAGE_COMPONENTS` (src/lib/SeoRouter.tsx). Toda chave é uma URL real e é
//   isso que o `scripts/gen-sitemap.mjs` publica como página.
// - `contentAreaSlugs`: prefixo localizado de ÁREA de conteúdo
//   (`/<lang>/cursos/<courseId>`). A área sozinha NÃO é página: o `CourseArea`
//   só renderiza com um `courseId` conhecido.
//   `courses` vivia em `pageSlugs` e o build publicava `/pt/cursos/`,
//   `/en/courses/` e `/es/cursos/`; sem componente no `PageRouter`, a URL
//   respondia 200 com o corpo do `NotFound` (soft-404 nos 3 idiomas, a mesma
//   URL que o Search Console lê como página vazia).
import type { Lang } from "@/i18n";

export const pageSlugs = {
  about: { pt: "sobre", en: "about", es: "nosotros" },
  ecosystem: { pt: "servicos", en: "ecosystem", es: "ecosistema" },
  academy: { pt: "academy", en: "academy", es: "academy" },
  labs: { pt: "labs", en: "labs", es: "labs" },
  research: { pt: "research", en: "research", es: "research" },
  blog: { pt: "blog", en: "blog", es: "blog" },
  contact: { pt: "contato", en: "contact", es: "contacto" },
  privacy: { pt: "privacidade", en: "privacy", es: "privacidad" },
  terms: { pt: "termos", en: "terms", es: "terminos" },
} as const;

export type PageKey = keyof typeof pageSlugs;

/** Áreas de conteúdo com slug localizado (prefixo de rota, não página). */
export const contentAreaSlugs = {
  courses: { pt: "cursos", en: "courses", es: "cursos" },
} as const;

export type ContentAreaKey = keyof typeof contentAreaSlugs;

const slugToKey: Record<Lang, Record<string, PageKey>> = {
  pt: {},
  en: {},
  es: {},
};

const areaSlugToKey: Record<Lang, Record<string, ContentAreaKey>> = {
  pt: {},
  en: {},
  es: {},
};

for (const key of Object.keys(pageSlugs) as PageKey[]) {
  for (const lang of ["pt", "en", "es"] as Lang[]) {
    slugToKey[lang][pageSlugs[key][lang]] = key;
  }
}

for (const key of Object.keys(contentAreaSlugs) as ContentAreaKey[]) {
  for (const lang of ["pt", "en", "es"] as Lang[]) {
    areaSlugToKey[lang][contentAreaSlugs[key][lang]] = key;
  }
}

export const slugFor = (key: PageKey, lang: Lang): string => pageSlugs[key][lang];

/** Slug localizado de uma área de conteúdo (prefixo de rota, não página). */
export const areaSlugFor = (key: ContentAreaKey, lang: Lang): string =>
  contentAreaSlugs[key][lang];

/** Resolves a first-segment slug (in a given language) to a page key. */
export const pageKeyForSlug = (lang: Lang, slug: string): PageKey | undefined =>
  slugToKey[lang][slug];

/** Resolves a first-segment slug (in a given language) to a content area key. */
export const areaKeyForSlug = (
  lang: Lang,
  slug: string,
): ContentAreaKey | undefined => areaSlugToKey[lang][slug];

/** Localized route for an internal path: translates the first segment (if it
 *  is a known page slug OR the prefix of a content area, ex. `/cursos/<id>`)
 *  into the target language and prefixes the language.
 *  Handles hash (e.g. "/servicos#soc") and keeps deeper segments untouched. */
export const localizePath = (path: string, toLang: Lang, fromLang?: Lang): string => {
  if (path === "/") return `/${toLang}`;
  const hashIdx = path.indexOf("#");
  const hash = hashIdx >= 0 ? path.slice(hashIdx) : "";
  const base = hashIdx >= 0 ? path.slice(0, hashIdx) : path;
  const parts = base.split("/").filter((p) => p !== "");
  if (parts.length === 0) return `/${toLang}${hash}`;
  const first = parts[0];
  const rest = parts.slice(1);
  const origin: Lang = fromLang ?? "pt";
  const key = pageKeyForSlug(origin, first);
  // Área de conteúdo (ex.: `/cursos/<id>`) também é traduzida: sem isto o
  // alternate/hreflang e o LanguageSwitcher da página de curso apontavam para
  // `/en/cursos/<id>`, que é atalho de outro idioma e redireciona no cliente.
  const area = key ? undefined : areaKeyForSlug(origin, first);
  const firstOut = key
    ? slugFor(key, toLang)
    : area
      ? areaSlugFor(area, toLang)
      : first;
  const tail = rest.length > 0 ? `/${rest.join("/")}` : "";
  return `/${toLang}/${firstOut}${tail}${hash}`;
};

/** Separa `caminho` de `?query#hash` (o sufixo volta intacto). */
const splitSuffix = (path: string): [string, string] => {
  const i = path.search(/[?#]/);
  return i >= 0 ? [path.slice(0, i), path.slice(i)] : [path, ""];
};

/**
 * Forma canonica real do site: COM barra final.
 *
 * O `scripts/postbuild.mjs` grava um arquivo fisico por rota
 * (`dist/<rota>/index.html`) e o GitHub Pages responde 301 de `/<rota>` para
 * `/<rota>/`. Sitemap (`scripts/gen-sitemap.mjs`), canonical e hreflang
 * (`@/lib/head-seo`) usam ESTA funcao, e so ela, para nao divergirem de novo:
 * a divergencia (sitemap sem barra + canonica sem barra) gerou os avisos de
 * "Pagina com redirecionamento" e "Pagina alternativa com tag canonica
 * adequada" no GSC em 16/09/2026.
 */
export const withTrailingSlash = (path: string): string => {
  const [base, suffix] = splitSuffix(path);
  if (base === "" || base === "/") return `/${suffix}`;
  return base.endsWith("/") ? `${base}${suffix}` : `${base}/${suffix}`;
};

/** Forma sem barra final (navegacao interna e comparação de slug de
 *  conteudo, ex.: `/blog/<slug>` no HeadSeo). A raiz continua `/`. */
export const withoutTrailingSlash = (path: string): string => {
  const [base, suffix] = splitSuffix(path);
  const trimmed = base.replace(/\/+$/, "");
  return `${trimmed === "" ? "/" : trimmed}${suffix}`;
};
