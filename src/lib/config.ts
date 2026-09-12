import { versaoVigente } from "@/lib/academy/consent";

/**
 * Configuração única da landing da CyDef Academy (fase protótipo/validação).
 *
 * - Slug proposto: /academy/gratuito (decisão final de Everton pendente — troca
 *   aqui + sitemap no go-live, S-10).
 * - Aviso de Privacidade imutável por versão (HEL-M01): a URL contém a versão;
 *   o conteúdo publicado de uma versão nunca é sobrescrito.
 * - Versão vigente do aviso: fonte única é `versaoVigente()`
 *   (src/lib/academy/consent.ts, última entrada de AVISOS, o conteúdo
 *   publicado). O link da landing deriva dela: publicar uma versão nova passa
 *   a valer sozinho, sem constante paralela para esquecer de atualizar.
 */

export const LANDING_PATH = "/academy/gratuito";

/** URL do Aviso de Privacidade. Sem argumento usa a versão VIGENTE publicada;
 *  com argumento serve versões históricas (imutabilidade por versão, HEL-M01). */
export const privacyPath = (version: string = versaoVigente()) =>
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

/**
 * Supabase (portal) — URL e anon key.
 * A anon key é pública por design (vai no bundle do SPA); os dados continuam
 * protegidos por RLS deny-by-default + grants explícitos de RPC (HEL-M03).
 */
export const supabaseUrl = (): string =>
  ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "").replace(/\/+$/, "");
export const supabaseAnonKey = (): string =>
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "";

/** Stats públicos da Academy (contagem de alunos na home) — default desligado (fail secure). */
export const isAcademyStatsEnabled = (): boolean =>
  import.meta.env.VITE_ACADEMY_STATS_ENABLED === "true";
