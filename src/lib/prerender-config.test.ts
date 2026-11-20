import { describe, expect, it } from "vitest";
import { inteiroDoAmbiente } from "../../scripts/lib/prerender-config.mjs";

describe("configuração do prerender por ambiente", () => {
  const ler = (env: Record<string, string>) => inteiroDoAmbiente("PRERENDER_TIMEOUT_MS", 20000, 1000, 600000, env);

  it("sem a variável, mantém o padrão do CI (20 s)", () => {
    expect(ler({})).toBe(20000);
    expect(ler({ PRERENDER_TIMEOUT_MS: "  " })).toBe(20000);
  });

  it("aceita um inteiro dentro da faixa", () => {
    expect(ler({ PRERENDER_TIMEOUT_MS: "90000" })).toBe(90000);
    expect(ler({ PRERENDER_TIMEOUT_MS: " 1000 " })).toBe(1000);
  });

  it("recusa valor fora da faixa ou que não é inteiro, dizendo a faixa", () => {
    for (const v of ["999", "600001", "90s", "1.5", "-1", "abc"]) {
      expect(() => ler({ PRERENDER_TIMEOUT_MS: v })).toThrow(/entre 1000 e 600000/);
    }
  });
});
