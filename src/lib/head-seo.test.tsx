import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it } from "vitest";
import i18n, { ensureLang } from "@/i18n";
import { HeadSeo } from "@/lib/head-seo";

/**
 * Etapa 58: o noindex das rotas utilitárias/privadas da Academy nasce aqui (e o
 * pré-render repassa o meta para o HTML estático). Rota pública segue sem
 * `meta[name="robots"]`.
 */
const renderAt = (pathname: string) =>
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <HeadSeo />
    </MemoryRouter>,
  );

const robots = () => document.head.querySelector('meta[name="robots"]');

describe("HeadSeo · robôs por tipo de rota", () => {
  beforeAll(async () => {
    await ensureLang("pt"); // dicionário PT sob demanda (P3-01)
    await i18n.changeLanguage("pt");
  });

  it.each([
    "/pt/academy/entrar",
    "/pt/academy/obrigado",
    "/pt/academy/status-confirmacao",
    "/pt/academy/privacidade/v2026.2",
    "/en/academy/privacidade/v2026.1",
  ])("emite noindex em %s", (pathname) => {
    renderAt(pathname);
    expect(robots()?.getAttribute("content")).toBe("noindex, nofollow");
  });

  it.each(["/pt/academy/gratuito", "/pt/academy", "/pt/blog"])(
    "não emite robots em rota pública %s",
    (pathname) => {
      renderAt(pathname);
      expect(robots()).toBeNull();
    },
  );

  it("mantém canonical nas rotas públicas", () => {
    renderAt("/pt/academy/gratuito");
    expect(
      document.head.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe("https://www.cydef.com.br/pt/academy/gratuito");
  });
});
