import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en, type Dict } from "./en";

export const LANGS = ["en", "pt", "es"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";
export const langLabels: Record<Lang, string> = {
  en: "English",
  pt: "Português (BR)",
  es: "Español",
};
export const htmlTitles: Record<Lang, string> = {
  en: "CyDef | Security that evolves with you",
  pt: "CyDef | Segurança que evolui com você",
  es: "CyDef | Seguridad que evoluciona contigo",
};

export const isLang = (v: string | undefined): v is Lang =>
  !!v && (LANGS as readonly string[]).includes(v);

// P3-01: só o dicionário do idioma padrão (EN) entra no chunk inicial.
// pt/es carregam sob demanda via ensureLang() → chunks próprios no build.
void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: DEFAULT_LANG,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnObjects: true,
});

const dictLoaders: Record<Lang, () => Promise<Dict>> = {
  en: async () => en,
  pt: () => import("./pt").then((m) => m.pt as Dict),
  es: () => import("./es").then((m) => m.es as Dict),
};

const loadedLangs = new Set<Lang>([DEFAULT_LANG]);

/** Garante que o dicionário do idioma esteja registrado no i18n (idempotente). */
export async function ensureLang(lang: Lang): Promise<void> {
  if (loadedLangs.has(lang)) return;
  const dict = await dictLoaders[lang]();
  i18n.addResourceBundle(lang, "translation", dict as never, true, true);
  loadedLangs.add(lang);
}

export default i18n;
