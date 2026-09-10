// Route map — localized slugs per language (P2-03, SEO i18n).
// PT slugs are the historical canonical; EN/ES get their own slug per page.
// Content routes (blog/:slug, cursos/:courseId, academy/*) keep universal
// slugs because their data is keyed by the same slug across languages.
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
  courses: { pt: "cursos", en: "courses", es: "cursos" },
} as const;

export type PageKey = keyof typeof pageSlugs;

const slugToKey: Record<Lang, Record<string, PageKey>> = {
  pt: {},
  en: {},
  es: {},
};

for (const key of Object.keys(pageSlugs) as PageKey[]) {
  for (const lang of ["pt", "en", "es"] as Lang[]) {
    slugToKey[lang][pageSlugs[key][lang]] = key;
  }
}

export const slugFor = (key: PageKey, lang: Lang): string => pageSlugs[key][lang];

/** Resolves a first-segment slug (in a given language) to a page key. */
export const pageKeyForSlug = (lang: Lang, slug: string): PageKey | undefined =>
  slugToKey[lang][slug];

/** Localized route for an internal path: translates the first segment (if it
 *  is a known page slug) into the target language and prefixes the language.
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
  const firstOut = key ? slugFor(key, toLang) : first;
  const tail = rest.length > 0 ? `/${rest.join("/")}` : "";
  return `/${toLang}/${firstOut}${tail}${hash}`;
};
