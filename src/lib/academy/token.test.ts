import { describe, expect, it } from "vitest";
import {
  gerarToken,
  hashToken,
  TOKEN_TTL_MS,
  tokenNaoExpirado,
  comparaEmTempoConstante,
  TOKEN_BYTES,
} from "./token";

describe("token de confirmação (S-05 — HEL-M02/M05/SEC-007)", () => {
  it("gera token com entropia ≥ 128 bits (256 bits)", async () => {
    const t = gerarToken();
    expect(t.length).toBeGreaterThanOrEqual(40); // base64url de 32 bytes ≈ 43 chars
    // bytes decodificados
    const decoded = Uint8Array.from(atob(t.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
    expect(decoded.length).toBe(TOKEN_BYTES);
  });

  it("tokens são únicos e imprevisíveis", () => {
    const set = new Set(Array.from({ length: 100 }, () => gerarToken()));
    expect(set.size).toBe(100);
  });

  it("hash SHA-256 é estável e diferente por token", async () => {
    const a = await hashToken("token-a");
    const b = await hashToken("token-a");
    const c = await hashToken("token-b");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("nunca armazena o token em claro — apenas hash (M02)", async () => {
    const raw = gerarToken();
    const h = await hashToken(raw);
    expect(h).not.toContain(raw);
  });

  it("TTL fixado em 48h (HEL-M02)", () => {
    expect(TOKEN_TTL_MS).toBe(48 * 60 * 60 * 1000);
  });

  it("tokenNaoExpirado respeita a janela", () => {
    const agora = Date.now();
    expect(tokenNaoExpirado(agora + TOKEN_TTL_MS, agora)).toBe(true);
    expect(tokenNaoExpirado(agora - 1, agora)).toBe(false);
    expect(tokenNaoExpirado(agora, agora + 1)).toBe(false);
  });

  it("comparação em tempo constante (M05 — sem timing oracle)", () => {
    expect(comparaEmTempoConstante("abc", "abc")).toBe(true);
    expect(comparaEmTempoConstante("abc", "abd")).toBe(false);
    expect(comparaEmTempoConstante("abc", "abcd")).toBe(false);
    expect(comparaEmTempoConstante("", "")).toBe(true);
  });
});
