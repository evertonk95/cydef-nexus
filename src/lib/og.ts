// og:* e twitter:* por rota (etapa 81).
//
// O que existia: nada no app emitia og/twitter, então TODA página interna servia
// o mesmo card do template index.html (título e descrição da home, og:url da
// raiz, imagem genérica). Compartilhar um artigo no LinkedIn/WhatsApp/X mostrava
// o card da home apontando para a raiz.
//
// O que entra aqui: título e descrição do conteúdo da rota (metadados do artigo,
// i18n da página/artefato) e a imagem do conteúdo, no idioma da rota. É módulo
// leve de propósito: entra no chunk inicial junto do HeadSeo, então nada aqui
// pode arrastar conteúdo pesado (o corpo dos artigos e o conteúdo do artefato do
// Labs são lazy, ver src/lib/blog/posts.ts e src/lib/labs/artifacts.ts).
import type { Lang } from "@/i18n";
import { postMetaBySlug } from "@/lib/blog/posts";
import { hasLabsArtifactFor } from "@/lib/labs/artifacts";
import { pageKeyForSlug, type PageKey } from "@/lib/routes";
import { SITE_ORIGIN } from "@/lib/site";

/** Imagem de compartilhamento padrão do site (public/assets/cydef-og.png). */
export const DEFAULT_OG_IMAGE = "/assets/cydef-og.png";

/** Chaves de i18n do og de uma rota: título (1 ou mais chaves, unidas por
 *  espaço, para os h1 que a página quebra em duas linhas) e descrição. */
export interface OgKeys {
  title: string[];
  description: string[];
}

export interface OgMeta {
  title: string;
  description: string;
  image: string;
}

/** og das páginas com slug localizado (PageRouter): título e descrição do i18n
 *  da própria página (o mesmo texto que a página renderiza).
 *
 *  `courses` fica fora de propósito: `/cursos` não tem página hoje (o
 *  PageRouter cai no NotFound) e o sitemap lista a URL mesmo assim. Card de
 *  catálogo de cursos num 404 mentiria sobre o conteúdo da página. */
const PAGE_OG: Partial<Record<PageKey, OgKeys>> = {
  about: { title: ["about.h1a", "about.h1b"], description: ["about.lead"] },
  ecosystem: { title: ["services.h1a", "services.h1b"], description: ["services.lead"] },
  academy: { title: ["academy.h1"], description: ["academy.lead"] },
  labs: { title: ["labs.h1a", "labs.h1b"], description: ["labs.lead"] },
  research: { title: ["research.h1a", "research.h1b"], description: ["research.lead"] },
  blog: { title: ["blog.title"], description: ["blog.lead"] },
  contact: { title: ["contact.h1a", "contact.h1b"], description: ["contact.lead"] },
  privacy: { title: ["privacy.title"], description: ["privacy.lead"] },
  terms: { title: ["terms.h1a", "terms.h1b"], description: ["terms.docBody"] },
};

/** og de rotas com slug universal que não passam pelo PageRouter. */
const BASE_OG: Record<string, OgKeys> = {
  // Landing de captura da Academy: o hero vem do i18n `landing` (sections.tsx).
  "/academy/gratuito": { title: ["landing.h1a", "landing.h1b"], description: ["landing.lead"] },
};

/** og por slug de artefato do Labs. Chave de i18n do catálogo (`labs.fwName` /
 *  `labs.fwBody`) e não do conteúdo do artefato: `framework.content.ts` é módulo
 *  pesado, carregado só na rota do artefato.
 *  O teste de guarda em src/lib/head-seo.test.tsx cobra uma entrada por artefato
 *  de `labsArtifactsMeta`. */
export const LABS_OG: Record<string, OgKeys> = {
  "siem-health-maturity-framework": {
    title: ["labs.fwName"],
    description: ["labs.fwBody"],
  },
};

/** URL absoluta de um caminho de asset publicado (og:image e twitter:image
 *  exigem URL absoluta, não caminho relativo). */
export const absoluteUrl = (path: string): string =>
  path.startsWith("http") ? path : `${SITE_ORIGIN}${path}`;

const resolveKeys = (
  keys: OgKeys,
  t: (key: string) => unknown,
): Pick<OgMeta, "title" | "description"> => ({
  title: keys.title.map((key) => String(t(key))).join(" "),
  description: keys.description.map((key) => String(t(key))).join(" "),
});

/**
 * og da rota. `base` é o caminho SEM idioma e SEM barra final (a mesma forma que
 * o HeadSeo usa para casar conteúdo); `t` traduz no idioma ativo (o mesmo que a
 * página renderiza) e `siteTitle` é o título do site no idioma ativo.
 *
 * Rota de artigo (/blog/<slug>): título, resumo e thumb do próprio post.
 * Rota de artefato (/labs/<slug>): i18n do catálogo do Labs + imagem padrão (o
 * artefato não publica thumb).
 * Página: i18n da página + imagem padrão.
 * Raiz e rota sem og próprio (404): card do site no idioma ativo.
 */
export const ogForBase = (
  base: string,
  lang: Lang,
  t: (key: string) => unknown,
  siteTitle: string,
): OgMeta => {
  const blogSlug = base.match(/^\/blog\/([^/]+)$/)?.[1];
  if (blogSlug) {
    const post = postMetaBySlug(blogSlug, lang);
    if (post) {
      return { title: post.title, description: post.excerpt, image: post.image };
    }
  }

  const labsSlug = base.match(/^\/labs\/([^/]+)$/)?.[1];
  if (labsSlug && hasLabsArtifactFor(labsSlug, lang)) {
    const keys = LABS_OG[labsSlug];
    if (keys) return { ...resolveKeys(keys, t), image: DEFAULT_OG_IMAGE };
  }

  const pageKey = pageKeyForSlug(lang, base.split("/")[1] ?? "");
  const keys = BASE_OG[base] ?? (pageKey ? PAGE_OG[pageKey] : undefined);
  if (keys) return { ...resolveKeys(keys, t), image: DEFAULT_OG_IMAGE };

  return {
    title: siteTitle,
    description: String(t("home.lead")),
    image: DEFAULT_OG_IMAGE,
  };
};
