import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import i18n, { ensureLang } from "@/i18n";
import { AcademyEmpresas } from "./Empresas";

describe("Academy para empresas (fase 17)", () => {
  beforeEach(async () => {
    await ensureLang("pt");
    await i18n.changeLanguage("pt");
  });

  it("mostra as duas formas, sem preço, e um e-mail pronto para a CyDef", () => {
    render(<AcademyEmpresas />);
    const secao = screen.getByRole("region", { name: "Academy para empresas" });
    expect(within(secao).getByRole("heading", { name: "Junto com a consultoria" })).toBeInTheDocument();
    expect(within(secao).getByRole("heading", { name: "Plano para times" })).toBeInTheDocument();
    expect(secao.textContent).not.toMatch(/R\$/);
    const link = within(secao).getByRole("link", { name: "Falar com a CyDef" });
    const href = link.getAttribute("href")!;
    expect(href.startsWith("mailto:contato@cydef.com.br?subject=Academy%20para%20empresas&body=")).toBe(true);
    expect(decodeURIComponent(href)).toContain("Tamanho da equipe:");
  });

  it("existe em inglês e espanhol", async () => {
    for (const [lang, titulo] of [["en", "Academy for companies"], ["es", "Academy para empresas"]] as const) {
      await ensureLang(lang);
      await i18n.changeLanguage(lang);
      const { unmount } = render(<AcademyEmpresas />);
      expect(screen.getByRole("heading", { level: 2, name: titulo })).toBeInTheDocument();
      unmount();
    }
  });
});
