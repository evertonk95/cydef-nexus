import i18n from "@/i18n";
import { DEFAULT_LANG, isLang } from "@/i18n";
import { localizePath } from "@/lib/routes";

/** Current effective language (always a supported one). */
export const currentLang = (): Lang =>
  isLang(i18n.language) ? i18n.language : DEFAULT_LANG;

type Lang = (typeof import("@/i18n").LANGS)[number];

/**
 * Prefixes an internal path with the active language, translating the first
 * segment when it is a known page slug (P2-03):
 * L("/sobre") no EN -> "/en/about"; no ES -> "/es/nosotros"; no PT -> "/pt/sobre".
 * Caminhos de conteúdo (blog/:slug, cursos/:id, academy/*) mantêm o slug.
 */
export const L = (path: string): string => {
  const lang = currentLang();
  return localizePath(path, lang, "pt");
};

/** Official WhatsApp number (Everton, 03/09/2026). */
export const WA_NUMBER = "15086305886";
export const waLink = (message: string): string =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

/** Strips the language prefix from a pathname. */
export const stripLang = (pathname: string): string => {
  const parts = pathname.split("/");
  if (parts.length > 1 && isLang(parts[1])) {
    return "/" + parts.slice(2).join("/");
  }
  return pathname;
};
