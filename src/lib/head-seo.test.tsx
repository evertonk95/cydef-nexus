import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it } from "vitest";
import i18n, { ensureLang } from "@/i18n";
import { HeadSeo } from "@/lib/head-seo";

/**
 * Etapa 58: o noindex das rotas utilitárias/privadas da Academy nasce aqui (e o
 * pré-render repassa o meta para o HTML estático). Rota pública segue sem
 * `meta[name="robots"]`.
 */
const renderAt = (pathname: string) =>
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <HeadSeo />
    </MemoryRouter>,
  );

const robots = () => document.head.querySelector('meta[name="robots"]');

describe("HeadSeo · robôs por tipo de rota", () => {
  beforeAll(async () => {
    await ensureLang("pt"); // dicionário PT sob demanda (P3-01)
    await i18n.changeLanguage("pt");
  });

  it.each([
    "/pt/academy/entrar",
    "/pt/academy/obrigado",
    "/pt/academy/status-confirmacao",
    "/pt/academy/privacidade/v2026.2",
    "/en/academy/privacidade/v2026.1",
  ])("emite noindex em %s", (pathname) => {
    renderAt(pathname);
    expect(robots()?.getAttribute("content")).toBe("noindex, nofollow");
  });

  it.each(["/pt/academy/gratuito", "/pt/academy", "/pt/blog"])(
    "não emite robots em rota pública %s",
    (pathname) => {
      renderAt(pathname);
      expect(robots()).toBeNull();
    },
  );

  it("mantém canonical nas rotas públicas", () => {
    renderAt("/pt/academy/gratuito");
    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe("https://www.cydef.com.br/pt/academy/gratuito/");
  });

  /**
   * Correção de 18/09/2026 (avisos do GSC de 16/09): canonical e hreflang
   * passam a usar a forma servida pelo GitHub Pages (COM barra final), a mesma
   * que o sitemap emite (guarda: sitemap-forma-canonica.test.ts).
   */
  const href = (selector: string) =>
    document.head.querySelector(selector)?.getAttribute("href");

  it("emite canonical com barra final em página localizada", () => {
    renderAt("/en/about/");
    expect(href('link[rel="canonical"]')).toBe(
      "https://www.cydef.com.br/en/about/",
    );
  });

  it("aplica a forma com barra em hreflang e x-default", () => {
    renderAt("/en/about/");
    expect(href('link[rel="alternate"][hreflang="pt"]')).toBe(
      "https://www.cydef.com.br/pt/sobre/",
    );
    expect(href('link[rel="alternate"][hreflang="en"]')).toBe(
      "https://www.cydef.com.br/en/about/",
    );
    expect(href('link[rel="alternate"][hreflang="es"]')).toBe(
      "https://www.cydef.com.br/es/nosotros/",
    );
    expect(href('link[rel="alternate"][hreflang="x-default"]')).toBe(
      "https://www.cydef.com.br/en/about/",
    );
  });

  it("dá a mesma forma à rota com e sem barra final", () => {
    renderAt("/pt/sobre");
    renderAt("/pt/sobre/");
    const canonicals = [
      ...document.head.querySelectorAll('link[rel="canonical"]'),
    ].map((el) => el.getAttribute("href"));
    expect(canonicals).toEqual([
      "https://www.cydef.com.br/pt/sobre/",
      "https://www.cydef.com.br/pt/sobre/",
    ]);
  });

  it("mantém alternate de artigo com a forma canônica", () => {
    renderAt("/pt/blog/wazuh-em-movimento/");
    expect(href('link[rel="canonical"]')).toBe(
      "https://www.cydef.com.br/pt/blog/wazuh-em-movimento/",
    );
    expect(href('link[rel="alternate"][hreflang="en"]')).toBe(
      "https://www.cydef.com.br/en/blog/wazuh-em-movimento/",
    );
  });

  it("não emite robots em rota pública com barra final", () => {
    renderAt("/pt/academy/gratuito/");
    expect(robots()).toBeNull();
    expect(href('link[rel="canonical"]')).toBe(
      "https://www.cydef.com.br/pt/academy/gratuito/",
    );
  });
});
