/**
 * Structured data builders (JSON-LD) — NEX-P2-04 (SEO técnico).
 * Organization + WebSite globais; BlogPosting nos artigos; Course nas páginas
 * de curso com ementa publicada. Nenhum dado inventado: sem ratings, sem
 * offers (preço sob consulta), sem sameAs (perfis sociais não confirmados).
 * Reference: https://schema.org
 */
import type { Lang } from "@/i18n";
import type { BlogPost } from "@/lib/blog/posts";
import { SITE_ORIGIN } from "@/lib/site";
import { slugFor } from "@/lib/routes";

/** schema.org inLanguage: pt -> pt-BR; en/es são códigos válidos diretos. */
const htmlLang = (lang: Lang): string => (lang === "pt" ? "pt-BR" : lang);

export const orgLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_ORIGIN}/#org`,
  name: "CyDef",
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/assets/cydef-icon.png`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Boston Post Road East",
    addressLocality: "Boston",
    addressRegion: "Massachusetts",
    addressCountry: "US",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+15086305886",
    contactType: "customer service",
    availableLanguage: ["en", "pt", "es"],
  },
});

export const webSiteLd = (lang: Lang) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_ORIGIN}/#website`,
  url: SITE_ORIGIN,
  name: "CyDef",
  inLanguage: htmlLang(lang),
  publisher: { "@id": `${SITE_ORIGIN}/#org` },
});

/** Artigo do blog (URL canônica por idioma). */
export const blogPostingLd = (post: BlogPost, lang: Lang) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${SITE_ORIGIN}/${lang}/blog/${post.slug}`,
  },
  headline: post.title,
  description: post.excerpt,
  image: `${SITE_ORIGIN}${post.image}`,
  datePublished: post.dateISO,
  dateModified: post.dateISO,
  inLanguage: htmlLang(lang),
  url: `${SITE_ORIGIN}/${lang}/blog/${post.slug}`,
  author: {
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#org`,
    name: "CyDef",
    url: SITE_ORIGIN,
  },
  publisher: {
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#org`,
    name: "CyDef",
    url: SITE_ORIGIN,
  },
});

/** Curso da Academy com ementa publicada (sem offers/ratings inventados). */
export const courseLd = ({
  name,
  description,
  lang,
  courseId,
}: {
  name: string;
  description: string;
  lang: Lang;
  courseId: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Course",
  name,
  description,
  inLanguage: htmlLang(lang),
  url: `${SITE_ORIGIN}/${lang}/${slugFor("courses", lang)}/${courseId}`,
  provider: {
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#org`,
    name: "CyDef",
    url: SITE_ORIGIN,
  },
});
