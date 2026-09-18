import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  localizePath,
  pageSlugs,
  withTrailingSlash,
  withoutTrailingSlash,
  type PageKey,
} from "@/lib/routes";
import { SITE_ORIGIN } from "@/lib/site";
import { postsMetaByLang } from "@/lib/blog/posts";

/**
 * Guarda de 18/09/2026: sitemap e canônica precisam usar a MESMA forma de URL
 * (COM barra final, a forma que o GitHub Pages serve). A divergência gerou os
 * avisos do GSC de 16/09 ("Página com redirecionamento" e "Página alternativa
 * com tag canônica adequada"): a URL do sitemap respondia 301 e a canônica
 * apontava para essa URL que redireciona.
 *
 * O arquivo lido é `public/sitemap.xml`, gerado por `scripts/gen-sitemap.mjs`
 * (prebuild). Rode `npm run build` antes de commitar mudança de rota/conteúdo.
 */
const xml = readFileSync(join(process.cwd(), "public/sitemap.xml"), "utf8");
const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
const lastmodByLoc = new Map(
  [...xml.matchAll(/<loc>(.*?)<\/loc><lastmod>(.*?)<\/lastmod>/g)].map((m) => [
    m[1],
    m[2],
  ]),
);

describe("sitemap — forma canônica com barra final", () => {
  it("tem URLs", () => {
    expect(locs.length).toBeGreaterThan(0);
  });

  it("toda URL do sitemap termina em barra", () => {
    expect(locs.filter((loc) => !loc.endsWith("/"))).toEqual([]);
  });

  it("toda URL é origin + withTrailingSlash(pathname), sem // duplo", () => {
    for (const loc of locs) {
      expect(loc.startsWith(`${SITE_ORIGIN}/`)).toBe(true);
      const { pathname, search, hash } = new URL(loc);
      expect(search).toBe("");
      expect(hash).toBe("");
      expect(loc).toBe(`${SITE_ORIGIN}${withTrailingSlash(pathname)}`);
      expect(pathname.includes("//")).toBe(false);
    }
  });

  it("não repete URL", () => {
    expect(new Set(locs).size).toBe(locs.length);
  });

  it("páginas dos 3 idiomas entram na forma canônica", () => {
    for (const lang of ["pt", "en", "es"] as const) {
      for (const key of Object.keys(pageSlugs) as PageKey[]) {
        const canonical = `${SITE_ORIGIN}${withTrailingSlash(
          localizePath(`/${pageSlugs[key][lang]}`, lang),
        )}`;
        expect(locs).toContain(canonical);
      }
    }
  });

  it("artigo publicado entra no sitemap com a forma da canônica", () => {
    for (const lang of ["pt", "en", "es"] as const) {
      for (const post of postsMetaByLang[lang]) {
        expect(locs).toContain(`${SITE_ORIGIN}/${lang}/blog/${post.slug}/`);
      }
    }
  });

  it("lastmod de artigo é a data real do conteúdo", () => {
    for (const lang of ["pt", "en", "es"] as const) {
      for (const post of postsMetaByLang[lang]) {
        const loc = `${SITE_ORIGIN}/${lang}/blog/${post.slug}/`;
        expect(lastmodByLoc.get(loc)).toBe(post.dateISO);
      }
    }
    for (const value of lastmodByLoc.values()) {
      expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("helpers de forma: idempotentes, com hash e raiz", () => {
    expect(withTrailingSlash("/en/about")).toBe("/en/about/");
    expect(withTrailingSlash("/en/about/")).toBe("/en/about/");
    expect(withTrailingSlash("/en")).toBe("/en/");
    expect(withTrailingSlash("/")).toBe("/");
    expect(withTrailingSlash("/servicos#soc")).toBe("/servicos/#soc");
    expect(withoutTrailingSlash("/en/about/")).toBe("/en/about");
    expect(withoutTrailingSlash("/en/about")).toBe("/en/about");
    expect(withoutTrailingSlash("/")).toBe("/");
    expect(withTrailingSlash(withoutTrailingSlash("/pt/blog/x/"))).toBe(
      "/pt/blog/x/",
    );
  });
});
