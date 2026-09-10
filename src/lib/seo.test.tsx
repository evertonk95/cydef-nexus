import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonLd } from "@/lib/seo";
import { orgLd, webSiteLd, blogPostingLd, courseLd } from "@/lib/seo-data";
import type { BlogPost } from "@/lib/blog/posts";

const samplePost: BlogPost = {
  slug: "como-estruturar-um-soc-do-zero",
  title: "Como estruturar um SOC do zero: Guia completo",
  category: "SOC",
  excerpt: "Guia em 5 fases para criar um SOC do zero.",
  date: "24 de Agosto, 2026",
  dateISO: "2026-08-24",
  readTime: "8 min",
  image: "/assets/blog/soc-do-zero-thumb.webp",
  author: "Equipe CyDef",
  sections: [],
  sources: [],
};

describe("structured data (NEX-P2-04)", () => {
  it("JsonLd renderiza <script type=application/ld+json> válido", () => {
    const { container } = render(<JsonLd data={orgLd()} />);
    const script = container.querySelector("script[type='application/ld+json']");
    expect(script).toBeTruthy();
    const parsed = JSON.parse(script?.textContent ?? "{}");
    expect(parsed["@type"]).toBe("Organization");
    expect(parsed.name).toBe("CyDef");
    expect(parsed.url).toBe("https://www.cydef.com.br");
    expect(parsed.address.addressCountry).toBe("US");
    expect(parsed.address.postalCode).toBeUndefined(); // sem CEP (regra)
    expect(parsed.sameAs).toBeUndefined(); // sem perfis não confirmados
  });

  it("WebSite usa inLanguage por idioma (pt -> pt-BR)", () => {
    const pt = JSON.parse(JSON.stringify(webSiteLd("pt"))) as { inLanguage: string };
    expect(pt.inLanguage).toBe("pt-BR");
    const en = JSON.parse(JSON.stringify(webSiteLd("en"))) as { inLanguage: string };
    expect(en.inLanguage).toBe("en");
  });

  it("BlogPosting reflete o post e não inventa campos", () => {
    const ld = blogPostingLd(samplePost, "en") as Record<string, unknown>;
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.headline).toBe(samplePost.title);
    expect(ld.datePublished).toBe("2026-08-24");
    expect(ld.url).toBe(
      "https://www.cydef.com.br/en/blog/como-estruturar-um-soc-do-zero",
    );
    expect(ld.aggregateRating).toBeUndefined();
    expect(ld.review).toBeUndefined();
  });

  it("Course usa slug localizado e não inventa offers/ratings", () => {
    const ld = courseLd({
      name: "Cybersecurity Fundamentals",
      description: "Base sólida em segurança da informação.",
      lang: "en",
      courseId: "cybersecurity-fundamentals",
    }) as Record<string, unknown>;
    expect(ld["@type"]).toBe("Course");
    expect(ld.url).toBe(
      "https://www.cydef.com.br/en/courses/cybersecurity-fundamentals",
    );
    expect(ld.offers).toBeUndefined();
    expect(ld.aggregateRating).toBeUndefined();
    const es = courseLd({
      name: "Fundamentos",
      description: "x",
      lang: "es",
      courseId: "cybersecurity-fundamentals",
    }) as Record<string, unknown>;
    expect(es.url).toBe("https://www.cydef.com.br/es/cursos/cybersecurity-fundamentals");
  });
});
