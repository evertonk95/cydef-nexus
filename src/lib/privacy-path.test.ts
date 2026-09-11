import { describe, expect, it } from "vitest";
import { privacyPath } from "@/lib/config";
import { AVISOS, obterAviso, versaoVigente } from "@/lib/academy/consent";

/**
 * Paridade do Aviso de Privacidade: o link usado pela landing (`privacyPath`)
 * e a fonte de verdade do conteúdo publicado (`versaoVigente`, última entrada
 * de AVISOS) não podem divergir.
 *
 * Antes existiam duas fontes: a constante PRIVACY_VERSION em src/lib/config.ts
 * e a última chave de AVISOS em src/lib/academy/consent.ts. Publicar uma versão
 * nova no AVISOS deixava o link da landing apontando para a versão antiga sem
 * ninguém perceber. Agora `privacyPath` deriva de `versaoVigente()` e estes
 * testes travam a regressão (o teste da landing confere o href renderizado).
 */
describe("paridade do Aviso de Privacidade (link da landing x conteúdo publicado)", () => {
  it("privacyPath() sem argumento aponta para a versão vigente", () => {
    expect(privacyPath()).toBe(`/academy/privacidade/${versaoVigente()}`);
  });

  it("privacyPath(versão vigente) é igual ao default", () => {
    expect(privacyPath(versaoVigente())).toBe(privacyPath());
  });

  it("a versão vigente é publicada e a URL estável dela é a do link", () => {
    const aviso = obterAviso(versaoVigente());
    expect(aviso).toBeDefined();
    expect(aviso?.urlEstavel).toBe(privacyPath());
  });

  it("versão histórica continua acessível pelo parâmetro (imutabilidade HEL-M01)", () => {
    expect(privacyPath("v2026.1")).toBe("/academy/privacidade/v2026.1");
  });

  it("a versão vigente é a publicada mais recente por publicadoEm", () => {
    const entradas = Object.entries(AVISOS);
    const maisRecente = [...entradas].sort((a, b) =>
      a[1].publicadoEm.localeCompare(b[1].publicadoEm),
    )[entradas.length - 1][0];
    expect(versaoVigente()).toBe(maisRecente);
  });

  it("toda versão publicada tem o caminho correspondente em privacyPath", () => {
    for (const versao of Object.keys(AVISOS)) {
      expect(obterAviso(versao)?.urlEstavel).toBe(privacyPath(versao));
    }
  });
});
