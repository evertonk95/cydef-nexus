import { describe, expect, it } from "vitest";
import { postsMetaByLang, countPostsForLang } from "./posts";
import { blogPostsByLang } from "./posts.content";
import type { Lang } from "@/i18n";

/**
 * Guarda do P3-01: o meta leve (posts.ts / posts-meta.generated.ts) deve estar
 * sincronizado com o conteúdo real (posts.content.ts). Se um artigo for
 * adicionado/alterado e o meta não for regenerado, este teste falha no CI.
 */
const LANGS: Lang[] = ["en", "pt", "es"];

describe("posts-meta ↔ posts.content (P3-01 guarda)", () => {
  for (const lang of LANGS) {
    it(`[${lang}] meta cobre todos os artigos e bate campo a campo`, () => {
      const full = blogPostsByLang[lang];
      const meta = postsMetaByLang[lang];
      expect(meta).toBeDefined();
      expect(meta.length).toBe(full.length);
      expect(countPostsForLang(lang)).toBe(full.length);

      const metaBySlug = new Map(meta.map((m) => [m.slug, m]));
      for (const post of full) {
        const m = metaBySlug.get(post.slug);
        expect(m, `slug ${post.slug} deve existir no meta`).toBeDefined();
        if (!m) continue;
        // Campos de listagem idênticos (título/categoria/excerpt/date/imagem)
        expect(m.title).toBe(post.title);
        expect(m.category).toBe(post.category);
        expect(m.excerpt).toBe(post.excerpt);
        expect(m.date).toBe(post.date);
        expect(m.dateISO).toBe(post.dateISO);
        expect(m.readTime).toBe(post.readTime);
        expect(m.image).toBe(post.image);
        expect(m.author).toBe(post.author);
        // Meta não deve carregar corpo
        expect(m).not.toHaveProperty("sections");
        expect(m).not.toHaveProperty("sources");
      }
    });
  }

  it("slugs únicos dentro de cada idioma", () => {
    for (const lang of LANGS) {
      const slugs = postsMetaByLang[lang].map((p) => p.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
});
