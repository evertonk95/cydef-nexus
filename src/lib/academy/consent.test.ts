import { describe, expect, it } from "vitest";
import { AVISOS, obterAviso, versaoVigente, hashDoAviso, sha256Hex } from "./consent";

describe("consentimento LGPD versionado (S-04 — HEL-M01/SEC-001..003)", () => {
  it("versão vigente existe e é a última publicada", () => {
    const v = versaoVigente();
    expect(AVISOS[v]).toBeDefined();
    expect(AVISOS[v].publicadoEm).toBeTruthy();
  });

  it("URL estável e imutável por versão", () => {
    for (const [versao, aviso] of Object.entries(AVISOS)) {
      expect(aviso.urlEstavel).toBe(`/academy/privacidade/${versao}`);
    }
  });

  it("obterAviso devolve undefined para versão inexistente", () => {
    expect(obterAviso("v9999")).toBeUndefined();
  });

  it("hash é estável (mesmo conteúdo → mesmo SHA-256) e 64 hex", async () => {
    const h1 = await hashDoAviso(versaoVigente());
    const h2 = await hashDoAviso(versaoVigente());
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("conteúdo diferente → hash diferente (integridade da versão)", async () => {
    const a = await sha256Hex("texto A");
    const b = await sha256Hex("texto B");
    expect(a).not.toBe(b);
  });

  it("versão inexistente rejeita o hash (fail secure)", async () => {
    await expect(hashDoAviso("v-inexistente")).rejects.toThrow();
  });

  it("o aviso vigente contém os elementos LGPD obrigatórios (SEC-003)", () => {
    const texto = AVISOS[versaoVigente()].texto.toLowerCase();
    expect(texto).toContain("controlador");
    expect(texto).toContain("base legal");
    expect(texto).toContain("retenção");
    expect(texto).toContain("direitos");
    expect(texto).toContain("anonimiz");
  });
});
