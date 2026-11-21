import { describe, expect, it } from "vitest";
import { blocosDoTexto } from "./texto";

describe("blocosDoTexto", () => {
  it("separa parágrafos por linha em branco e junta linhas seguidas", () => {
    expect(blocosDoTexto("Primeira linha.\nSegunda linha.\n\nOutro parágrafo.")).toEqual([
      { tipo: "paragrafo", linhas: ["Primeira linha.", "Segunda linha."] },
      { tipo: "paragrafo", linhas: ["Outro parágrafo."] },
    ]);
  });

  it("transforma linhas com marcador em lista, logo depois do texto", () => {
    expect(blocosDoTexto("Você vê:\n• risco;\n- impacto;\n* decisão.\nFim.")).toEqual([
      { tipo: "paragrafo", linhas: ["Você vê:"] },
      { tipo: "lista", itens: ["risco;", "impacto;", "decisão."] },
      { tipo: "paragrafo", linhas: ["Fim."] },
    ]);
  });

  it("aceita quebra de linha do Windows, espaços sobrando e texto sem formatação", () => {
    expect(blocosDoTexto("  a\r\n\r\n\r\n  • b  \r\n")).toEqual([
      { tipo: "paragrafo", linhas: ["a"] },
      { tipo: "lista", itens: ["b"] },
    ]);
    expect(blocosDoTexto("Só uma frase.")).toEqual([{ tipo: "paragrafo", linhas: ["Só uma frase."] }]);
    expect(blocosDoTexto("")).toEqual([]);
  });

  it("não trata hífen no meio da frase nem número negativo como marcador", () => {
    expect(blocosDoTexto("on-line e -5 graus")).toEqual([{ tipo: "paragrafo", linhas: ["on-line e -5 graus"] }]);
  });

  it("não interpreta HTML: o texto passa como está", () => {
    expect(blocosDoTexto("<b>negrito</b>")).toEqual([{ tipo: "paragrafo", linhas: ["<b>negrito</b>"] }]);
  });
});
