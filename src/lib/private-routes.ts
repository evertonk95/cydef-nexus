import type { Lang } from "@/i18n";
import { AVISOS } from "@/lib/academy/consent";

/**
 * Rotas utilitárias/privadas da CyDef Academy (etapa 58).
 *
 * Existem para uso real (link "Entrar" da Navigation, deep links dos e-mails de
 * confirmação, aviso de privacidade imutável por versão) mas NÃO são conteúdo
 * de descoberta: ficam fora do sitemap e levam `noindex, nofollow` no
 * `HeadSeo` (que o pré-render repassa para o HTML estático).
 *
 * Por que a lista vive aqui: o GitHub Pages não reescreve rota de SPA. Rota sem
 * arquivo físico cai no `404.html` e o Pages responde HTTP 404 (o shell da SPA
 * aparece, mas o status derruba link, deep link de e-mail e indexação). O
 * `scripts/postbuild.mjs` e o `scripts/prerender.mjs` leem esta MESMA lista
 * para gerar o `index.html` físico dessas rotas — uma fonte de verdade só, sem
 * duplicar caminho no build.
 *
 * Slugs são universais: `academy/*` é igual nos 3 idiomas (ver `lib/routes.ts`),
 * então o caminho recebe apenas o prefixo de idioma.
 */
export const privateAcademyPaths = (): string[] => [
  "/academy/entrar",
  "/academy/obrigado",
  "/academy/status-confirmacao",
  // Aviso de privacidade: URL imutável por versão (HEL-M01/SEC-003). Toda
  // versão PUBLICADA continua acessível (a anterior permanece como histórico),
  // não apenas a vigente — por isso a lista sai do AVISOS, não do
  // PRIVACY_VERSION.
  ...Object.keys(AVISOS)
    .sort()
    .map((versao) => `/academy/privacidade/${versao}`),
];

/** Caminhos privados já com o prefixo de idioma (rotas com arquivo físico). */
export const privateRoutesForLang = (lang: Lang): string[] =>
  privateAcademyPaths().map((path) => `/${lang}${path}`);

/** O caminho (sem prefixo de idioma) é uma rota privada? Ignora barra final. */
export const isPrivateAcademyPath = (base: string): boolean => {
  const clean =
    base.length > 1 && base.endsWith("/") ? base.slice(0, -1) : base;
  return privateAcademyPaths().includes(clean);
};
