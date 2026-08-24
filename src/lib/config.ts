/**
 * Configuração única da landing da CyDef Academy (fase protótipo/validação).
 *
 * - Slug proposto: /academy/gratuito (decisão final de Everton pendente — troca
 *   aqui + sitemap no go-live, S-10).
 * - Aviso de Privacidade imutável por versão (HEL-M01): a URL contém a versão;
 *   o conteúdo publicado de uma versão nunca é sobrescrito.
 */

export const LANDING_PATH = "/academy/gratuito";

/** Versão vigente do Aviso de Privacidade da landing. */
export const PRIVACY_VERSION = "v2026.1";

export const privacyPath = (version: string = PRIVACY_VERSION) =>
  `/academy/privacidade/${version}`;

/** Página neutra para onde todos os desfechos do token de confirmação redirecionam (HEL-M02/M05). */
export const STATUS_CONFIRMATION_PATH = "/academy/status-confirmacao";

/** Página neutra de sucesso pós-inscrição. */
export const THANK_YOU_PATH = "/academy/obrigado";

/** Endpoint da Capture API (Edge Function). Preenchido via env em go-live; vazio = formulário em "inscrições em breve". */
export const captureApiUrl = (): string =>
  ((import.meta.env.VITE_CAPTURE_API_URL as string | undefined) ?? "").replace(/\/+$/, "");

/** Flags (defaults desligados — fail secure). Em produção default = false até merge aprovado (S-10). */
export const isCaptureEnabled = (): boolean => import.meta.env.VITE_CAPTURE_ENABLED === "true";
export const isEmailEnabled = (): boolean => import.meta.env.VITE_EMAIL_ENABLED === "true";
export const isAnalyticsEnabled = (): boolean => import.meta.env.VITE_ANALYTICS_ENABLED === "true";
