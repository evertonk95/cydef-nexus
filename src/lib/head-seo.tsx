import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT_LANG, isLang, type Lang } from "@/i18n";
import { localizePath } from "@/lib/routes";
import { SITE_ORIGIN } from "@/lib/site";
import { postMetaBySlug } from "@/lib/blog/posts";

/** Slug universal de conteúdo, se a base for rota de artigo (/blog/<slug>). */
const blogSlugFromBase = (base: string): string | undefined => {
  const m = base.match(/^\/blog\/([^/]+)$/);
  return m ? m[1] : undefined;
};

/** Idioma tem versão do artigo? Rotas de página sempre existem nos 3 idiomas;
 *  conteúdo editorial pode estar só em PT até a tradução chegar (F3: artigo
 *  Wazuh em Movimento PT-only até a Fase 10) — sem alternate para idioma que
 *  ainda não tem o artigo (evita hreflang apontando para 404). */
const hasContentFor = (base: string, lang: Lang): boolean => {
  const slug = blogSlugFromBase(base);
  if (!slug) return true;
  return !!postMetaBySlug(slug, lang);
};

/**
 * Head SEO: canonical + hreflang alternates (P2-03).
 * Computa a base (pathname sem idioma) e gera o URL canônico do idioma atual
 * + alternates EN/PT/ES (apenas idiomas com conteúdo) + x-default.
 *
 * Vive em módulo próprio (não no SeoRouter) para não arrastar as páginas
 * estáticas para o chunk inicial (P3-01 code-splitting).
 */
export const HeadSeo = () => {
  const { pathname } = useLocation();
  useTranslation(); // re-render na troca de idioma
  const l = ((): Lang => {
    const first = pathname.split("/")[1];
    return isLang(first) ? first : DEFAULT_LANG;
  })();

  useEffect(() => {
    const base =
      pathname === `/${l}` || pathname === `/${l}/`
        ? "/"
        : pathname.replace(`/${l}`, "");
    const links: { rel: string; href: string; hreflang?: string }[] = [
      { rel: "canonical", href: `${SITE_ORIGIN}${localizePath(base, l, l)}` },
    ];
    let enHref: string | undefined;
    for (const t of ["pt", "en", "es"] as Lang[]) {
      if (!hasContentFor(base, t)) continue;
      const href = `${SITE_ORIGIN}${localizePath(base, t, l)}`;
      links.push({ rel: "alternate", hreflang: t, href });
      if (t === "en") enHref = href;
    }
    // x-default: versão EN quando existir; senão o canônico do idioma atual
    // (evita apontar x-default para URL sem conteúdo).
    links.push({
      rel: "alternate",
      hreflang: "x-default",
      href: enHref ?? `${SITE_ORIGIN}${localizePath(base, l, l)}`,
    });

    const head = document.head;
    const els = links.map((link) => {
      const el = document.createElement("link");
      el.rel = link.rel;
      el.href = link.href;
      if (link.hreflang) el.setAttribute("hreflang", link.hreflang);
      head.appendChild(el);
      return el;
    });
    return () => {
      els.forEach((el) => el.remove());
    };
  }, [pathname, l]);

  return null;
};
