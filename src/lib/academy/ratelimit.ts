/**
 * Rate limit (HEL-M05/SEC-006) — valores fixados no design:
 * - capture: 10/15 min por IP (hash do IP, sem PII);
 * - verify: 5/h por token (hash) e 10/15 min por IP;
 * - 20 falhas de verificação no mesmo token → token invalidado (abuso).
 *
 * A autoridade é o banco (RPCs `security definer` — atômico). Este módulo puro
 * fornece as constantes e a lógica de janela/bucket usada tanto pela Edge
 * Function (para montar chaves e interpretar resultados) quanto pelos testes.
 */

export const RATE_LIMIT = {
  capturePorIp: { limite: 10, janelaMs: 15 * 60 * 1000 },
  verifyPorToken: { limite: 5, janelaMs: 60 * 60 * 1000 },
  verifyPorIp: { limite: 10, janelaMs: 15 * 60 * 1000 },
  falhasTokenMax: 20,
} as const;

/** Chave de janela por bucket (sem PII: idHash já é hash). */
export function bucketKey(prefix: string, idHash: string, janelaMs: number, agoraMs: number): string {
  const bucket = Math.floor(agoraMs / janelaMs);
  return `${prefix}:${idHash}:${bucket}`;
}

export interface DecisaoRateLimit {
  permitido: boolean;
  contador: number;
  limite: number;
  chave: string;
}

/**
 * Referência da decisão (espelha a lógica SQL de `rate_limit_events`).
 * `contadores` é um mapa chave → contagem acumulada na janela.
 */
export function decidirRateLimit(
  contadores: Map<string, number>,
  chave: string,
  limite: number,
): DecisaoRateLimit {
  const contador = (contadores.get(chave) ?? 0) + 1;
  contadores.set(chave, contador);
  return { permitido: contador <= limite, contador, limite, chave };
}

/** Após esta quantidade de falhas de verificação, o token deve ser invalidado. */
export function atingiuLimiteDeFalhas(falhas: number): boolean {
  return falhas >= RATE_LIMIT.falhasTokenMax;
}
