import type { Lang } from "@/i18n";

/**
 * Artefatos do CyDef Labs — META LEVE (P3-01 code-splitting).
 * A home, o Labs, o sitemap e o HeadSeo usam APENAS este módulo. O conteúdo
 * pesado de cada artefato vive em módulo próprio (ex.: framework.content.ts)
 * e só é carregado na página do artefato (rota lazy).
 *
 * Regra de conteúdo (04/09/2026): o catálogo só lista o que existe de verdade.
 * Idioma: um artefato pode existir só em PT até a tradução EN/ES chegar
 * (Fase 10) — `langs` declara onde há conteúdo; as demais línguas respondem
 * 404 (mesmo padrão do artigo "Wazuh em Movimento").
 */
export interface LabsArtifactMeta {
  slug: string;
  langs: Lang[];
}

export const labsArtifactsMeta: LabsArtifactMeta[] = [
  {
    // CyDef SIEM Health and Maturity Assessment Framework (Fase 4–5, 04/09/2026).
    // Multi-plataforma: implementação nº 1 = Wazuh (whitepaper em PT).
    // Fase 10 (05/09/2026): página localizada EN/PT/ES.
    slug: "siem-health-maturity-framework",
    langs: ["en", "pt", "es"],
  },
];

/** Slugs de artefato com conteúdo no idioma (para sitemap e hreflang). */
export const labsSlugsForLang = (lang: Lang): string[] =>
  labsArtifactsMeta.filter((a) => a.langs.includes(lang)).map((a) => a.slug);

/** Um artefato tem página no idioma? (head-seo: não gerar alternate p/ 404). */
export const hasLabsArtifactFor = (slug: string, lang: Lang): boolean =>
  labsArtifactsMeta.some((a) => a.slug === slug && a.langs.includes(lang));
