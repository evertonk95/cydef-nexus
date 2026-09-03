import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./en";
import { pt } from "./pt";
import { es } from "./es";

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

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
    es: { translation: es },
  },
  lng: DEFAULT_LANG,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnObjects: true,
});

export default i18n;
