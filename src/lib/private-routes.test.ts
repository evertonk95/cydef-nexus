import { describe, expect, it } from "vitest";
import {
  privateAcademyPaths,
  privateRoutesForLang,
  isPrivateAcademyPath,
} from "@/lib/private-routes";
import { AVISOS } from "@/lib/academy/consent";
import { PRIVACY_VERSION } from "@/lib/config";

/**
 * Etapa 58: rotas utilitárias/privadas da Academy que ficam FORA do sitemap
 * (login, obrigado, status e aviso de privacidade por versão) mas precisam de
 * HTTP 200 + noindex em produção. A lista é fonte única do HeadSeo e dos
 * scripts de build (postbuild/prerender).
 */
describe("rotas utilitárias/privadas da Academy", () => {
  it("cobre login, obrigado, status e TODA versão publicada do aviso", () => {
    const paths = privateAcademyPaths();
    expect(paths).toContain("/academy/entrar");
    expect(paths).toContain("/academy/obrigado");
    expect(paths).toContain("/academy/status-confirmacao");
    for (const versao of Object.keys(AVISOS)) {
      expect(paths).toContain(`/academy/privacidade/${versao}`);
    }
    // versão vigente entra pelo AVISOS, não por um valor repetido no build
    expect(paths).toContain(`/academy/privacidade/${PRIVACY_VERSION}`);
    // v2026.1 continua acessível como histórico (imutabilidade HEL-M01)
    expect(paths).toContain("/academy/privacidade/v2026.1");
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("não inclui a landing pública (essa entra no sitemap)", () => {
    expect(privateAcademyPaths()).not.toContain("/academy/gratuito");
  });

  it("prefixa o idioma sem localizar o slug (academy é universal)", () => {
    expect(privateRoutesForLang("en")).toContain("/en/academy/entrar");
    expect(privateRoutesForLang("es")).toContain(
      "/es/academy/status-confirmacao",
    );
    expect(privateRoutesForLang("pt")).toContain(
      "/pt/academy/privacidade/v2026.1",
    );
  });

  it("reconhece o caminho sem idioma e ignora a barra final", () => {
    expect(isPrivateAcademyPath("/academy/entrar")).toBe(true);
    expect(isPrivateAcademyPath("/academy/entrar/")).toBe(true);
    expect(isPrivateAcademyPath("/academy/status-confirmacao")).toBe(true);
    expect(isPrivateAcademyPath("/academy/gratuito")).toBe(false);
    expect(isPrivateAcademyPath("/academy")).toBe(false);
    expect(isPrivateAcademyPath("/")).toBe(false);
  });
});
