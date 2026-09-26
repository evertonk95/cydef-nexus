import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  areaKeyForSlug,
  areaSlugFor,
  pageKeyForSlug,
  pageSlugs,
  slugFor,
  withTrailingSlash,
  withoutTrailingSlash,
  type PageKey,
} from "@/lib/routes";
import { PAGE_COMPONENTS } from "@/lib/page-components";
import { LANDING_PATH } from "@/lib/config";
import { coursesByLang } from "@/lib/courses";
import { labsSlugsForLang } from "@/lib/labs/artifacts";
import { postsMetaByLang } from "@/lib/blog/posts";
import { SITE_ORIGIN } from "@/lib/site";

/**
 * Guarda de 26/09/2026 (etapa 82): toda URL publicada no sitemap tem de ter
 * página de verdade no app.
 *
 * O caso que motivou: `pageSlugs` tinha a chave `courses` (prefixo da rota de
 * conteúdo `/<lang>/cursos/<courseId>`) e o `gen-sitemap.mjs` iterava as
 * chaves, então o sitemap publicava `/pt/cursos/`, `/en/courses/` e
 * `/es/cursos/`. O `PageRouter` não tinha componente para a chave, caía no
 * `NotFound` e a URL respondia HTTP 200 com corpo de 404: soft-404 nos 3
 * idiomas, descoberto pela evidência do `curl` da etapa 81.
 *
 * O arquivo lido é `public/sitemap.xml`, gerado por `scripts/gen-sitemap.mjs`
 * (prebuild): rode `npm run build` antes de commitar mudança de rota/conteúdo.
 */
const LANGS = ["pt", "en", "es"] as const;
type SitemapLang = (typeof LANGS)[number];

const isSitemapLang = (value: string | undefined): value is SitemapLang =>
  value !== undefined && (LANGS as readonly string[]).includes(value);

const xml = readFileSync(join(process.cwd(), "public/sitemap.xml"), "utf8");
const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

/** Destino real da URL: página do PageRouter, rota de conteúdo COM dado no
 *  idioma, ou `null` quando o app não tem o que servir (o soft-404). */
const destinationOf = (
  loc: string,
): { kind: "page"; key: PageKey } | { kind: "content"; route: string } | null => {
  const { pathname } = new URL(loc);
  const clean = withoutTrailingSlash(pathname); // "/en/about"
  const [lang, ...rest] = clean.split("/").filter(Boolean);
  if (!isSitemapLang(lang)) return null;

  if (rest.length === 0) return { kind: "content", route: `home ${lang}` };
  if (clean === `/${lang}${LANDING_PATH}`) {
    return { kind: "content", route: "academy landing" };
  }

  const [first, second] = rest;
  if (rest.length === 1) {
    const key = pageKeyForSlug(lang, first);
    // A chave só vale como destino se o PageRouter realmente renderiza um
    // componente para ela (PAGE_COMPONENTS é o mesmo mapa que o router usa).
    return key && PAGE_COMPONENTS[key] ? { kind: "page", key } : null;
  }

  if (rest.length === 2) {
    if (
      first === slugFor("blog", lang) &&
      postsMetaByLang[lang].some((post) => post.slug === second)
    ) {
      return { kind: "content", route: `blog ${lang}` };
    }
    if (
      first === slugFor("labs", lang) &&
      labsSlugsForLang(lang).includes(second)
    ) {
      return { kind: "content", route: `labs ${lang}` };
    }
    // Área de conteúdo: só é destino com um id conhecido naquele idioma.
    if (areaKeyForSlug(lang, first) === "courses" && coursesByLang[lang][second]) {
      return { kind: "content", route: `courses ${lang}` };
    }
  }

  return null;
};

const courseUrl = (lang: SitemapLang, courseId: string): string =>
  `${SITE_ORIGIN}${withTrailingSlash(
    `/${lang}/${areaSlugFor("courses", lang)}/${courseId}`,
  )}`;

describe("sitemap — toda URL tem página de verdade (sem soft-404)", () => {
  it("tem URLs", () => {
    expect(locs.length).toBeGreaterThan(0);
  });

  it("toda URL do sitemap resolve para uma página ou rota de conteúdo real", () => {
    const semDestino = locs.filter((loc) => destinationOf(loc) === null);
    expect(semDestino).toEqual([]);
  });

  it("não publica o slug de área de cursos sozinho (o soft-404 da etapa 81)", () => {
    for (const lang of LANGS) {
      const areaSozinha = `${SITE_ORIGIN}${withTrailingSlash(
        `/${lang}/${areaSlugFor("courses", lang)}`,
      )}`;
      expect(destinationOf(areaSozinha)).toBeNull();
      expect(locs).not.toContain(areaSozinha);
    }
  });

  it("toda página de pageSlugs tem componente no PageRouter e URL no sitemap", () => {
    for (const key of Object.keys(pageSlugs) as PageKey[]) {
      expect(PAGE_COMPONENTS[key], `sem componente para ${key}`).toBeTruthy();
      for (const lang of LANGS) {
        expect(locs).toContain(
          `${SITE_ORIGIN}${withTrailingSlash(`/${lang}/${slugFor(key, lang)}`)}`,
        );
      }
    }
  });

  it("o slug da área de cursos não é chave de página", () => {
    for (const lang of LANGS) {
      expect(pageKeyForSlug(lang, areaSlugFor("courses", lang))).toBeUndefined();
    }
  });

  it("publica exatamente as URLs de curso do catálogo, nos 3 idiomas", () => {
    const esperadas = LANGS.flatMap((lang) =>
      Object.keys(coursesByLang[lang]).map((courseId) => courseUrl(lang, courseId)),
    );
    const publicadas = locs.filter((loc) => {
      const destino = destinationOf(loc);
      return destino?.kind === "content" && destino.route.startsWith("courses");
    });
    expect([...publicadas].sort()).toEqual([...esperadas].sort());
  });
});
