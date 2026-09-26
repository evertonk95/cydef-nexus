import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it } from "vitest";
import i18n, { ensureLang, htmlTitles, type Lang } from "@/i18n";
import { HeadSeo } from "@/lib/head-seo";
import { DEFAULT_OG_IMAGE, LABS_OG, ogForBase } from "@/lib/og";
import { labsArtifactsMeta } from "@/lib/labs/artifacts";
import { postMetaBySlug } from "@/lib/blog/posts";

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

/** Head do jsdom = HTML servido, antes de o bundle do cliente montar. */
const served = (html: string) =>
  document.head.insertAdjacentHTML("beforeend", html);

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

/**
 * Etapa 81: nada no app emitia og/twitter, então toda página interna servia o
 * card da home do template index.html (título/descrição da home, og:url na
 * raiz, imagem genérica). O conteúdo da rota passa a definir as tags, e o
 * pré-render as repassa (scripts/prerender-worker.mjs).
 */
describe("HeadSeo · og/twitter por rota", () => {
  const ORIGIN = "https://www.cydef.com.br";
  const ogImagePadrao = `${ORIGIN}${DEFAULT_OG_IMAGE}`;

  const content = (selector: string) =>
    document.head.querySelector(selector)?.getAttribute("content");

  /** Em teste o idioma do i18n não vem da URL: alinha antes de montar. */
  const translateInto = async (lang: Lang) => {
    await ensureLang(lang);
    await i18n.changeLanguage(lang);
  };

  it("usa o metadado do artigo em PT (título, resumo, thumb, URL servida)", async () => {
    await translateInto("pt");
    const post = postMetaBySlug(
      "cloudflare-containers-isolamento-entre-tenants",
      "pt",
    );

    renderAt("/pt/blog/cloudflare-containers-isolamento-entre-tenants/");

    expect(content('meta[property="og:title"]')).toBe(post?.title);
    expect(content('meta[property="og:description"]')).toBe(post?.excerpt);
    expect(content('meta[property="og:url"]')).toBe(
      `${ORIGIN}/pt/blog/cloudflare-containers-isolamento-entre-tenants/`,
    );
    expect(content('meta[property="og:image"]')).toBe(
      `${ORIGIN}${post?.image}`,
    );
  });

  it("acompanha o idioma da rota do artigo (PT, EN e ES)", async () => {
    const slug = "cloudflare-containers-isolamento-entre-tenants";
    const seen: string[] = [];
    for (const lang of ["pt", "en", "es"] as Lang[]) {
      await translateInto(lang);
      const post = postMetaBySlug(slug, lang);
      const view = renderAt(`/${lang}/blog/${slug}/`);

      expect(content('meta[property="og:url"]')).toBe(
        `${ORIGIN}/${lang}/blog/${slug}/`,
      );
      expect(content('meta[property="og:image"]')).toBe(
        `${ORIGIN}${post?.image}`,
      );
      expect(content('meta[property="og:title"]')).toBe(post?.title);
      seen.push(String(post?.title));
      view.unmount();
    }
    expect(new Set(seen).size).toBe(3); // cada idioma tem o seu título
  });

  it("usa título e descrição do i18n da página, com a imagem do site", async () => {
    await translateInto("pt");
    const t = i18n.getFixedT("pt");

    renderAt("/pt/sobre/");

    expect(content('meta[property="og:title"]')).toBe(
      `${t("about.h1a")} ${t("about.h1b")}`,
    );
    expect(content('meta[property="og:description"]')).toBe(t("about.lead"));
    expect(content('meta[property="og:url"]')).toBe(`${ORIGIN}/pt/sobre/`);
    expect(content('meta[property="og:image"]')).toBe(ogImagePadrao);
  });

  it("usa a URL localizada da página em EN e ES", async () => {
    await translateInto("es");
    renderAt("/es/nosotros/");
    expect(content('meta[property="og:url"]')).toBe(`${ORIGIN}/es/nosotros/`);

    await translateInto("en");
    renderAt("/en/about/");
    expect(content('meta[property="og:url"]')).toBe(`${ORIGIN}/en/about/`);
  });

  it("usa o catálogo do Labs no artefato (imagem padrão, sem thumb própria)", async () => {
    await translateInto("en");
    const t = i18n.getFixedT("en");

    renderAt("/en/labs/siem-health-maturity-framework/");

    expect(content('meta[property="og:title"]')).toBe(t("labs.fwName"));
    expect(content('meta[property="og:description"]')).toBe(t("labs.fwBody"));
    expect(content('meta[property="og:url"]')).toBe(
      `${ORIGIN}/en/labs/siem-health-maturity-framework/`,
    );
    expect(content('meta[property="og:image"]')).toBe(ogImagePadrao);
  });

  it("emite os og da home no idioma da rota da raiz", async () => {
    await translateInto("pt");

    renderAt("/pt/");

    expect(content('meta[property="og:title"]')).toBe(htmlTitles.pt);
    expect(content('meta[property="og:url"]')).toBe(`${ORIGIN}/pt/`);
    expect(content('meta[property="og:image"]')).toBe(ogImagePadrao);

    // A raiz continua com a canônica /en/ (etapa 79): o og:url a acompanha.
    renderAt("/");
    expect(content('meta[property="og:url"]')).toBe(`${ORIGIN}/en/`);
  });

  it("emite twitter:card, título, descrição e imagem", async () => {
    await translateInto("en");
    const post = postMetaBySlug(
      "cloudflare-containers-isolamento-entre-tenants",
      "en",
    );

    renderAt("/en/blog/cloudflare-containers-isolamento-entre-tenants/");

    expect(content('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(content('meta[name="twitter:title"]')).toBe(post?.title);
    expect(content('meta[name="twitter:description"]')).toBe(post?.excerpt);
    expect(content('meta[name="twitter:image"]')).toBe(
      `${ORIGIN}${post?.image}`,
    );
  });

  /**
   * O HTML servido traz as og/twitter da home (index.html) e o HeadSeo anexa as
   * da rota: a chave é única na página, então a tag antiga sai. Sem isso o
   * rastreador leria o og:title da home antes do título do artigo.
   */
  it("substitui as og/twitter da home que vieram no HTML servido", async () => {
    await translateInto("pt");
    served(
      '<meta property="og:title" content="CyDef | Security that evolves with you">' +
        '<meta property="og:description" content="CyDef is a cybersecurity ecosystem under construction.">' +
        '<meta property="og:type" content="website">' +
        '<meta property="og:url" content="https://www.cydef.com.br/">' +
        '<meta property="og:image" content="https://www.cydef.com.br/assets/cydef-og.png">' +
        '<meta name="twitter:card" content="summary_large_image">' +
        '<meta name="twitter:image" content="https://www.cydef.com.br/assets/cydef-og.png">',
    );
    const post = postMetaBySlug(
      "cloudflare-containers-isolamento-entre-tenants",
      "pt",
    );

    renderAt("/pt/blog/cloudflare-containers-isolamento-entre-tenants/");

    const titulos = [
      ...document.head.querySelectorAll('meta[property="og:title"]'),
    ];
    expect(titulos).toHaveLength(1);
    expect(titulos[0].getAttribute("content")).toBe(post?.title);
    expect(
      document.head.querySelectorAll('meta[name="twitter:card"]'),
    ).toHaveLength(1);
    // og:type não é emitido pelo HeadSeo: a do template continua no lugar.
    expect(content('meta[property="og:type"]')).toBe("website");
  });

  /** Guarda de drift: artefato novo no catálogo sem og cai aqui, não no card da
   *  home em produção. */
  it("cobre todo artefato do Labs com og do catálogo", () => {
    for (const artefato of labsArtifactsMeta) {
      expect(LABS_OG[artefato.slug], `sem og para ${artefato.slug}`).toBeTruthy();
    }
  });

  /**
   * Casos de rota sem conteúdo no idioma (aqui sem jsdom, no módulo puro):
   * artigo que não existe no idioma cai no card do blog DAQUELE idioma (não no
   * card da home nem no título do artigo em outro idioma) e rota desconhecida
   * cai no card do site no idioma ativo.
   */
  it("cai no card do idioma ativo quando não há conteúdo na rota", async () => {
    await translateInto("en");
    const en = (key: string) => String(i18n.getFixedT("en")(key));
    // Artigo publicado só em PT (rathat-trojan-bancario-android-controle-ia).
    expect(
      ogForBase(
        "/blog/rathat-trojan-bancario-android-controle-ia",
        "en",
        en,
        htmlTitles.en,
      ),
    ).toEqual({
      title: en("blog.title"),
      description: en("blog.lead"),
      image: DEFAULT_OG_IMAGE,
    });

    await translateInto("pt");
    const pt = (key: string) => String(i18n.getFixedT("pt")(key));
    expect(ogForBase("/rota-que-nao-existe", "pt", pt, htmlTitles.pt)).toEqual({
      title: htmlTitles.pt,
      description: pt("home.lead"),
      image: DEFAULT_OG_IMAGE,
    });
  });
});
