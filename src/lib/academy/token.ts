/**
 * Token de confirmação (HEL-M02/M05, SEC-007):
 * - aleatório ≥ 128 bits (usamos 256 bits);
 * - armazenado APENAS como hash SHA-256 (nunca o valor bruto em logs/banco);
 * - TTL fixado em 48 horas;
 * - uso único (consumido na primeira validação bem-sucedida — DB);
 * - comparação em tempo constante.
 * Módulo puro (WebCrypto) — roda em navegador, Node 20+ e Deno.
 */

export const TOKEN_TTL_MS = 48 * 60 * 60 * 1000; // 48h fixado (HEL-M02)
export const TOKEN_BYTES = 32; // 256 bits

export function gerarToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
}

export function base64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) {
    bin += String.fromCharCode(b);
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return bytesToHex(new Uint8Array(digest));
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function tokenNaoExpirado(expiraEmMs: number, agoraMs: number): boolean {
  return agoraMs < expiraEmMs;
}

/** Comparação em tempo constante (evita timing oracle — HEL-M05). */
export function comparaEmTempoConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
