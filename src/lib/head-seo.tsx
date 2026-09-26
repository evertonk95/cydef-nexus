import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT_LANG, htmlTitles, isLang, type Lang } from "@/i18n";
import { localizePath, withTrailingSlash, withoutTrailingSlash } from "@/lib/routes";
import { absoluteUrl, ogForBase } from "@/lib/og";
import { SITE_ORIGIN } from "@/lib/site";
import { postMetaBySlug } from "@/lib/blog/posts";
import { hasLabsArtifactFor } from "@/lib/labs/artifacts";
import { isPrivateAcademyPath } from "@/lib/private-routes";

/** Slug universal de conteúdo, se a base for rota de artigo (/blog/<slug>). */
const blogSlugFromBase = (base: string): string | undefined => {
  const m = base.match(/^\/blog\/([^/]+)$/);
  return m ? m[1] : undefined;
};

/** Slug universal de conteúdo, se a base for rota de artefato do Labs
 *  (/labs/<slug> — Fase 4–5: siem-health-maturity-framework). */
const labsSlugFromBase = (base: string): string | undefined => {
  const m = base.match(/^\/labs\/([^/]+)$/);
  return m ? m[1] : undefined;
};

/** Idioma tem versão do conteúdo? Rotas de página sempre existem nos 3 idiomas;
 *  conteúdo editorial pode estar só em PT até a tradução chegar (F3: artigo
 *  Wazuh em Movimento PT-only até a Fase 10; Labs: framework PT-first) — sem
 *  alternate para idioma que ainda não tem a página (evita hreflang 404). */
const hasContentFor = (base: string, lang: Lang): boolean => {
  const blogSlug = blogSlugFromBase(base);
  if (blogSlug) return !!postMetaBySlug(blogSlug, lang);
  const labsSlug = labsSlugFromBase(base);
  if (labsSlug) return hasLabsArtifactFor(labsSlug, lang);
  return true;
};

/**
 * Head SEO: canonical + hreflang alternates (P2-03) + og/twitter por rota
 * (etapa 81).
 * Computa a base (pathname sem idioma) e gera o URL canônico do idioma atual
 * + alternates EN/PT/ES (apenas idiomas com conteúdo) + x-default, e as tags
 * de compartilhamento do conteúdo da rota (src/lib/og.ts).
 *
 * Vive em módulo próprio (não no SeoRouter) para não arrastar as páginas
 * estáticas para o chunk inicial (P3-01 code-splitting).
 *
 * Estas tags são emitidas no cliente E serializadas no HTML servido (o
 * scripts/prerender-worker.mjs repassa o head do pré-render). Sem remover a
 * equivalente antes de anexar, o DOM renderizado ficava com a canônica
 * duplicada (aba HTML da Inspeção de URL: linhas 24 e 25 com a mesma URL).
 */
export const HeadSeo = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation(); // re-render na troca de idioma
  const l = ((): Lang => {
    const first = pathname.split("/")[1];
    return isLang(first) ? first : DEFAULT_LANG;
  })();

  useEffect(() => {
    // A rota chega com barra final (forma servida pelo GitHub Pages) ou sem
    // (navegacao SPA). O base interno e sempre SEM barra: os helpers de
    // conteudo (blog/labs) casam o pathname sem barra.
    const base = withoutTrailingSlash(
      pathname === `/${l}` || pathname === `/${l}/`
        ? "/"
        : pathname.replace(`/${l}`, ""),
    );
    // Canonical e hreflang na forma COM barra final, a mesma que o sitemap
    // emite: /en/about responde 301 para /en/about/, entao a canonica sem
    // barra apontava para uma URL que redireciona.
    const canonical = `${SITE_ORIGIN}${withTrailingSlash(localizePath(base, l, l))}`;
    const links: { rel: string; href: string; hreflang?: string }[] = [
      { rel: "canonical", href: canonical },
    ];
    let enHref: string | undefined;
    for (const alt of ["pt", "en", "es"] as Lang[]) {
      if (!hasContentFor(base, alt)) continue;
      const href = `${SITE_ORIGIN}${withTrailingSlash(localizePath(base, alt, l))}`;
      links.push({ rel: "alternate", hreflang: alt, href });
      if (alt === "en") enHref = href;
    }
    // x-default: versão EN quando existir; senão o canônico do idioma atual
    // (evita apontar x-default para URL sem conteúdo).
    links.push({
      rel: "alternate",
      hreflang: "x-default",
      href: enHref ?? canonical,
    });

    const head = document.head;

    // O pre-render grava no HTML servido as tags que este efeito emite (ver
    // scripts/prerender-worker.mjs), então no cliente elas JÁ estão no head:
    // anexar a cópia deixava duas canônicas idênticas no DOM renderizado.
    // Antes de cada anexo sai a tag equivalente já presente, comparada pelos
    // atributos que a definem (rel+href+hreflang no link, name+content no
    // meta). A equivalência por atributo, e não "todo link[rel=alternate]",
    // evita remover um alternate que só compartilha o href com outro hreflang
    // (en e x-default apontam para a mesma URL) e nunca alcança os elementos
    // criados aqui, que a limpeza do unmount remove sozinha.
    const dropEquivalent = (isEquivalent: (el: Element) => boolean): void => {
      for (const el of Array.from(head.querySelectorAll("link, meta"))) {
        if (isEquivalent(el)) el.remove();
      }
    };

    // Rotas utilitárias/privadas da Academy (login, obrigado, status, aviso de
    // privacidade): fora do sitemap e fora do índice do buscador. O meta entra
    // no HTML estático porque o pré-render repassa meta[name="robots"]
    // (scripts/prerender-worker.mjs) — sem JS o status 200 já vem do arquivo
    // físico gerado no postbuild.
    if (isPrivateAcademyPath(base)) {
      const noindex = document.createElement("meta");
      noindex.name = "robots";
      noindex.content = "noindex, nofollow";
      // O pré-render já publicou este meta no HTML estático: sem a remoção,
      // a rota privada ficava com dois meta[name=robots] idênticos.
      dropEquivalent(
        (el) =>
          el.localName === "meta" &&
          el.getAttribute("name") === noindex.name &&
          el.getAttribute("content") === noindex.content,
      );
      head.appendChild(noindex);
      return () => {
        noindex.remove();
      };
    }

    // og:* e twitter:* por rota (etapa 81). Sem isto, o HTML servido de toda
    // página interna herdava as tags do template index.html: card da home, com
    // og:url na raiz, em qualquer artigo compartilhado. O pré-render repassa
    // estas tags (scripts/prerender-worker.mjs) e o build troca as do template
    // pelas do prerender, então o que o rastreador lê é o card da própria rota.
    const og = ogForBase(base, l, (key) => t(key), htmlTitles[l]);
    const image = absoluteUrl(og.image);
    const metas: { attr: "property" | "name"; key: string; content: string }[] = [
      { attr: "property", key: "og:title", content: og.title },
      { attr: "property", key: "og:description", content: og.description },
      // og:url na mesma forma da canônica (COM barra final, a do sitemap): a URL
      // que o card abre tem de ser a URL servida, não a raiz.
      { attr: "property", key: "og:url", content: canonical },
      { attr: "property", key: "og:image", content: image },
      { attr: "name", key: "twitter:card", content: "summary_large_image" },
      { attr: "name", key: "twitter:title", content: og.title },
      { attr: "name", key: "twitter:description", content: og.description },
      { attr: "name", key: "twitter:image", content: image },
    ];
    const metaEls = metas.map((meta) => {
      // Aqui a equivalência é a CHAVE (property/name), não a chave + conteúdo
      // como nos links acima: a chave é única na página, então o og:title da
      // home que veio no template precisa sair para não sobrar dois og:title
      // (o rastreador lê o primeiro, que seria o da home).
      dropEquivalent(
        (el) => el.localName === "meta" && el.getAttribute(meta.attr) === meta.key,
      );
      const el = document.createElement("meta");
      el.setAttribute(meta.attr, meta.key);
      el.setAttribute("content", meta.content);
      head.appendChild(el);
      return el;
    });

    const els = links.map((link) => {
      dropEquivalent(
        (el) =>
          el.localName === "link" &&
          el.getAttribute("rel") === link.rel &&
          el.getAttribute("href") === link.href &&
          el.getAttribute("hreflang") === (link.hreflang ?? null),
      );
      const el = document.createElement("link");
      el.rel = link.rel;
      el.href = link.href;
      if (link.hreflang) el.setAttribute("hreflang", link.hreflang);
      head.appendChild(el);
      return el;
    });
    return () => {
      [...els, ...metaEls].forEach((el) => el.remove());
    };
  }, [pathname, l, t]);

  return null;
};
