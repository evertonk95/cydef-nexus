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

  /**
   * O caso montava as duas rotas juntas e esperava DUAS canônicas iguais (uma
   * por montagem), contando o acúmulo como prova da forma comum. Desde a etapa
   * 80 a segunda montagem derruba a tag equivalente da primeira, então a prova
   * passa a ser a igualdade do valor lido em cada montagem isolada.
   */
  it("dá a mesma forma à rota com e sem barra final", () => {
    const canonicalOf = (pathname: string) => {
      const view = renderAt(pathname);
      const value = href('link[rel="canonical"]');
      view.unmount();
      return value;
    };
    expect(canonicalOf("/pt/sobre")).toBe(
      "https://www.cydef.com.br/pt/sobre/",
    );
    expect(canonicalOf("/pt/sobre/")).toBe(
      "https://www.cydef.com.br/pt/sobre/",
    );
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

/**
 * Etapa 80: o pré-render publica estas tags no HTML servido (o
 * scripts/prerender-worker.mjs repassa o head do pré-render) e o HeadSeo as
 * anexava de novo ao montar: a aba HTML da Inspeção de URL mostrava a canônica
 * nas linhas 24 e 25 com a mesma URL. Os casos abaixo põem no head do jsdom o
 * HTML que o servidor entrega e exigem exatamente uma tag de cada tipo depois
 * do efeito.
 */
describe("HeadSeo · não duplica as tags do pré-render", () => {
  beforeAll(async () => {
    await ensureLang("en");
    await i18n.changeLanguage("en");
  });

  /** Head do jsdom = HTML servido, antes de o bundle do cliente montar. */
  const served = (html: string) =>
    document.head.insertAdjacentHTML("beforeend", html);

  it("mantém uma única canônica na rota com canônica no HTML servido", () => {
    served('<link rel="canonical" href="https://www.cydef.com.br/en/about/">');

    renderAt("/en/about/");

    const canonicals = [
      ...document.head.querySelectorAll('link[rel="canonical"]'),
    ];
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0].getAttribute("href")).toBe(
      "https://www.cydef.com.br/en/about/",
    );
  });

  it("mantém um conjunto de alternates sem repetir hreflang", () => {
    served(
      '<link rel="alternate" hreflang="pt" href="https://www.cydef.com.br/pt/sobre/">' +
        '<link rel="alternate" hreflang="en" href="https://www.cydef.com.br/en/about/">' +
        '<link rel="alternate" hreflang="es" href="https://www.cydef.com.br/es/nosotros/">' +
        '<link rel="alternate" hreflang="x-default" href="https://www.cydef.com.br/en/about/">',
    );

    renderAt("/en/about/");

    const alternates = [
      ...document.head.querySelectorAll('link[rel="alternate"]'),
    ];
    expect(alternates.map((el) => el.getAttribute("hreflang"))).toEqual([
      "pt",
      "en",
      "es",
      "x-default",
    ]);
  });

  /**
   * A raiz é o caso medido em 26/09/2026: a canônica estática vem do
   * postbuild (etapa 77) e precisa ter a MESMA URL que o HeadSeo calcula para
   * `/`, senão a equivalência não casa e sobra mais de uma canônica.
   */
  it("mantém uma única canônica na raiz servida com /en/", () => {
    served('<link rel="canonical" href="https://www.cydef.com.br/en/">');

    renderAt("/");

    const canonicals = [
      ...document.head.querySelectorAll('link[rel="canonical"]'),
    ];
    expect(canonicals).toHaveLength(1);
    expect(canonicals[0].getAttribute("href")).toBe(
      "https://www.cydef.com.br/en/",
    );
  });

  it("mantém um único robots noindex em rota privada", () => {
    served('<meta name="robots" content="noindex, nofollow">');

    renderAt("/pt/academy/entrar");

    const metas = [...document.head.querySelectorAll('meta[name="robots"]')];
    expect(metas).toHaveLength(1);
    expect(metas[0].getAttribute("content")).toBe("noindex, nofollow");
  });

  it("preserva do head o que não é equivalente", () => {
    served(
      '<link rel="alternate" type="application/rss+xml" href="https://www.cydef.com.br/feed.xml">',
    );

    renderAt("/en/about/");

    const rss = document.head.querySelector('link[type="application/rss+xml"]');
    expect(rss?.getAttribute("href")).toBe("https://www.cydef.com.br/feed.xml");
    rss?.remove(); // fora do HeadSeo: sai para não vazar para os casos seguintes
  });
});
