import { describe, expect, it } from "vitest";
import { bucketKey, decidirRateLimit, RATE_LIMIT, atingiuLimiteDeFalhas } from "./ratelimit";

describe("rate limit (S-03/S-05 — HEL-M05/SEC-006)", () => {
  it("valores fixados no design", () => {
    expect(RATE_LIMIT.capturePorIp).toEqual({ limite: 10, janelaMs: 15 * 60 * 1000 });
    expect(RATE_LIMIT.verifyPorToken).toEqual({ limite: 5, janelaMs: 60 * 60 * 1000 });
    expect(RATE_LIMIT.falhasTokenMax).toBe(20);
  });

  it("capture: permite até 10 por janela de 15 min e nega a 11ª (mesmo IP)", () => {
    const contadores = new Map<string, number>();
    const chave = bucketKey("ip", "hash-do-ip", RATE_LIMIT.capturePorIp.janelaMs, 1_700_000_000_000);
    for (let i = 1; i <= 10; i++) {
      expect(decidirRateLimit(contadores, chave, RATE_LIMIT.capturePorIp.limite).permitido).toBe(true);
    }
    expect(decidirRateLimit(contadores, chave, RATE_LIMIT.capturePorIp.limite).permitido).toBe(false);
  });

  it("verify: permite até 5 por token por hora", () => {
    const contadores = new Map<string, number>();
    const chave = bucketKey("token", "hash-do-token", RATE_LIMIT.verifyPorToken.janelaMs, 1_700_000_000_000);
    for (let i = 1; i <= 5; i++) {
      expect(decidirRateLimit(contadores, chave, RATE_LIMIT.verifyPorToken.limite).permitido).toBe(true);
    }
    expect(decidirRateLimit(contadores, chave, RATE_LIMIT.verifyPorToken.limite).permitido).toBe(false);
  });

  it("bucket diferente reinicia o contador (janela nova)", () => {
    const contadores = new Map<string, number>();
    const janelaA = bucketKey("ip", "h", RATE_LIMIT.capturePorIp.janelaMs, 1_700_000_000_000);
    const janelaB = bucketKey("ip", "h", RATE_LIMIT.capturePorIp.janelaMs, 1_700_000_000_000 + RATE_LIMIT.capturePorIp.janelaMs);
    decidirRateLimit(contadores, janelaA, RATE_LIMIT.capturePorIp.limite);
    decidirRateLimit(contadores, janelaA, RATE_LIMIT.capturePorIp.limite);
    const r = decidirRateLimit(contadores, janelaB, RATE_LIMIT.capturePorIp.limite);
    expect(r.contador).toBe(1);
    expect(r.permitido).toBe(true);
  });

  it("20 falhas invalida o token (HEL-M05)", () => {
    expect(atingiuLimiteDeFalhas(19)).toBe(false);
    expect(atingiuLimiteDeFalhas(20)).toBe(true);
  });
});
