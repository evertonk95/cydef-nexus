import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { pt } from "@/i18n/pt";
import { es } from "@/i18n/es";
import { LANGS } from "@/i18n";
import { CONSULTING_KEYS } from "@/lib/consulting";
import { legacyPageKeyForSlug, legacyPageSlugs, pageKeyForSlug, pageSlugs } from "@/lib/routes";

const dicts = { en, pt, es };

describe("CyDef Consulting", () => {
  it("todo serviço tem título, descrição, entregáveis e formato nos 3 idiomas", () => {
    for (const lang of LANGS) {
      for (const key of CONSULTING_KEYS) {
        const item = dicts[lang].consulting.items[key];
        expect(item.title, `${lang}.${key}`).toBeTruthy();
        expect(item.desc, `${lang}.${key}`).toBeTruthy();
        expect(item.deliverables, `${lang}.${key}`).toBeTruthy();
        expect(item.format, `${lang}.${key}`).toBeTruthy();
      }
    }
  });

  it("a antiga página de Serviços redireciona para a Consultoria nos 3 idiomas", () => {
    expect(legacyPageKeyForSlug("pt", "servicos")).toBe("consulting");
    expect(legacyPageKeyForSlug("en", "ecosystem")).toBe("consulting");
    expect(legacyPageKeyForSlug("es", "ecosistema")).toBe("consulting");
    expect(pageSlugs.consulting).toEqual({ pt: "consultoria", en: "consulting", es: "consultoria" });
  });

  it("slug antigo não colide com página atual", () => {
    for (const lang of LANGS) {
      for (const slug of Object.keys(legacyPageSlugs[lang])) {
        expect(pageKeyForSlug(lang, slug), `${lang}/${slug}`).toBeUndefined();
      }
    }
  });

  it("nenhum texto de oferta publica prazo de atendimento ou preço", () => {
    for (const lang of LANGS) {
      const text = JSON.stringify([dicts[lang].consulting, dicts[lang].contact]);
      expect(text, lang).not.toMatch(/\d+\s*(h|horas|hours|horas hábiles)\b/i);
      expect(text, lang).not.toMatch(/(R\$|US\$|\$\s?\d|€)/);
    }
  });
});
