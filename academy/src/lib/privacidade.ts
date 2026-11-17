/**
 * Aviso de Privacidade da Academy publicado no site (URL imutável por versão).
 * Ao publicar uma versão nova em src/lib/academy/consent.ts (raiz do repo),
 * atualize esta constante no mesmo PR.
 */
export const VERSAO_AVISO = "v2026.3";

export function urlAviso(siteUrl: string): string {
  return `${siteUrl}/academy/privacidade/${VERSAO_AVISO}`;
}
