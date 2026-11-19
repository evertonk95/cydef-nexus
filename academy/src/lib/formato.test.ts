import { describe, expect, it } from "vitest";
import { contagem, fracao, normalizar } from "./formato";

describe("contagens em português", () => {
  it("concorda a palavra com a quantidade", () => {
    expect(contagem(1, "aula", "aulas")).toBe("1 aula");
    expect(contagem(0, "aula", "aulas")).toBe("0 aulas");
    expect(contagem(6, "módulo", "módulos")).toBe("6 módulos");
  });

  it("na fração, a palavra segue o total", () => {
    expect(fracao(1, 1, "aula", "aulas")).toBe("1 de 1 aula");
    expect(fracao(1, 5, "aula", "aulas")).toBe("1 de 5 aulas");
  });

  it("busca ignora acento e caixa", () => {
    expect(normalizar("Introdução")).toBe("introducao");
    expect(normalizar("Módulo 2 · Redes")).toContain("modulo 2");
  });
});
