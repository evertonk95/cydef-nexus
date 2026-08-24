import { describe, expect, it } from "vitest";
import { computarFunil } from "./funnel";

describe("funil sem PII (S-06 — REQ-004/SEC-008/ADRV-07)", () => {
  it("calcula etapas e taxas a partir do lead store", () => {
    const leads = [
      { status: "confirmed", perfil: "iniciante" },
      { status: "confirmed", perfil: "iniciante" },
      { status: "pending_confirmation", perfil: "transicao" },
      { status: "invalid", perfil: "iniciante" },
    ];
    const f = computarFunil(leads, 100);
    expect(f.expostos).toBe(100);
    expect(f.preinscritos).toBe(4);
    expect(f.confirmados).toBe(2);
    expect(f.taxaPreinscricao).toBeCloseTo(0.04);
    expect(f.taxaConfirmacao).toBeCloseTo(0.5);
  });

  it("taxas null quando denominador zero (sem divisão por zero)", () => {
    const f = computarFunil([], 0);
    expect(f.taxaPreinscricao).toBeNull();
    expect(f.taxaConfirmacao).toBeNull();
  });

  it("agrega por perfil declarado sem PII", () => {
    const f = computarFunil(
      [
        { status: "confirmed", perfil: "iniciante" },
        { status: "pending_confirmation", perfil: "iniciante" },
        { status: "confirmed", perfil: "estudante" },
      ],
      50,
    );
    expect(f.porPerfil.iniciante).toEqual({ preinscritos: 2, confirmados: 1 });
    expect(f.porPerfil.estudante).toEqual({ preinscritos: 1, confirmados: 1 });
  });

  it("não expõe nome/e-mail no resultado (apenas contagens)", () => {
    const f = computarFunil([{ status: "confirmed", perfil: "iniciante" }], 10);
    const json = JSON.stringify(f);
    expect(json).not.toMatch(/@/);
    expect(json).not.toMatch(/nome/i);
  });
});
