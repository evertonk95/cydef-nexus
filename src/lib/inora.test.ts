import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { en } from "@/i18n/en";
import { pt } from "@/i18n/pt";
import { es } from "@/i18n/es";
import { LANGS } from "@/i18n";
import { localizePath, pageSlugs } from "@/lib/routes";
import { PAGE_COMPONENTS } from "@/lib/page-components";
import { DEFAULT_OG_IMAGE, ogForBase } from "@/lib/og";
import { privacyDocEn, privacyDocEs, privacyDocPt } from "@/lib/privacyContent";

const dicts = { en, pt, es };

/** Texto de vitrine da página (sem as telas ilustrativas, que trazem dados de
 *  demonstração como "3 min" e "96,4%"). */
const marketingCopy = (lang: (typeof LANGS)[number]) => {
  const { ui: _ui, ...rest } = dicts[lang].inora;
  return JSON.stringify(rest);
};

describe("CyDef Inora: página comercial", () => {
  it("tem a mesma rota nos 3 idiomas e componente no PageRouter", () => {
    expect(pageSlugs.inora).toEqual({ pt: "inora", en: "inora", es: "inora" });
    expect(PAGE_COMPONENTS.inora).toBeTypeOf("function");
    expect(localizePath("/inora", "en", "pt")).toBe("/en/inora");
  });

  it("não publica preço nem prazo de atendimento", () => {
    for (const lang of LANGS) {
      const text = marketingCopy(lang);
      expect(text, lang).not.toMatch(/(R\$|US\$|\$\s?\d|€)/);
      expect(text, lang).not.toMatch(/\d+\s*(h|horas|hours)\b/i);
    }
  });

  it("não usa travessão no texto da página nem no compromisso", () => {
    for (const lang of LANGS) {
      const text = JSON.stringify([dicts[lang].inora, dicts[lang].pledge]);
      expect(text, lang).not.toMatch(/\u2014/);
    }
  });

  it("os planos com proposta têm nome, descrição e itens nos 3 idiomas", () => {
    for (const lang of LANGS) {
      for (const key of ["installed", "mssp", "cloud"] as const) {
        const plan = dicts[lang].inora.plans[key];
        expect(plan.name, `${lang}.${key}`).toBeTruthy();
        expect(plan.desc, `${lang}.${key}`).toBeTruthy();
        expect(plan.bullets.length, `${lang}.${key}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("Compromisso social da CyDef (1% do lucro líquido)", () => {
  it("deixa claro que a base é o lucro líquido, não o faturamento", () => {
    expect(pt.pledge.body).toMatch(/lucro líquido/);
    expect(pt.pledge.fine).toMatch(/lucro líquido, não sobre o faturamento/);
    expect(en.pledge.body).toMatch(/net profit/);
    expect(en.pledge.fine).toMatch(/net profit, not on revenue/);
    expect(es.pledge.body).toMatch(/beneficio neto/);
    expect(es.pledge.fine).toMatch(/beneficio neto, no sobre la facturación/);
  });

  it("o percentual é o mesmo nos 3 idiomas", () => {
    for (const lang of LANGS) {
      expect(dicts[lang].pledge.figure, lang).toBe("1%");
      expect(dicts[lang].pledge.title, lang).toMatch(/1%/);
      expect(dicts[lang].pledge.body, lang).toMatch(/1%/);
    }
  });
});

describe("Política de Privacidade revisada para o Inora (16/11/2026)", () => {
  const docs = { pt: privacyDocPt, en: privacyDocEn, es: privacyDocEs };

  it("cita o CyDef Inora e não cita mais o WhatsApp, nos 3 idiomas", () => {
    for (const [lang, doc] of Object.entries(docs)) {
      const text = JSON.stringify(doc.sections);
      expect(text, lang).toMatch(/CyDef Inora/);
      expect(text, lang).not.toMatch(/WhatsApp/i);
    }
  });

  it("a página do Inora não promete acompanhamento nem suporte fora do contrato", () => {
    for (const lang of LANGS) {
      const text = JSON.stringify(dicts[lang].inora);
      expect(text, lang).not.toMatch(/primeiras semanas|first weeks|primeras semanas/i);
    }
  });
});

describe("Card de compartilhamento do Inora (16/11/2026)", () => {
  const t = (key: string) => key;

  it("usa um card próprio em cada idioma, e o arquivo existe", () => {
    for (const lang of LANGS) {
      const og = ogForBase("/inora", lang, t, "CyDef");
      expect(og.image, lang).toBe(`/assets/inora/inora-og-${lang}.jpg`);
      expect(existsSync(`public${og.image}`), lang).toBe(true);
    }
  });

  it("as outras páginas continuam com o card padrão do site", () => {
    expect(ogForBase("/consultoria", "pt", t, "CyDef").image).toBe(DEFAULT_OG_IMAGE);
    expect(ogForBase("/labs", "en", t, "CyDef").image).toBe(DEFAULT_OG_IMAGE);
  });
});
