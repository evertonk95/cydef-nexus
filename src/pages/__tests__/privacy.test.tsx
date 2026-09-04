import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import i18n, { ensureLang } from "@/i18n";
import AcademyPrivacy from "../AcademyPrivacy";

/**
 * S-04 — aviso de privacidade por versão (HEL-M01/SEC-003):
 * URL imutável /academy/privacidade/v<versão>; conteúdo da versão publicado
 * nunca sobrescrito; versão inexistente → página neutra.
 */

function renderPrivacy(versao: string) {
  return render(
    <MemoryRouter initialEntries={[`/academy/privacidade/${versao}`]}>
      <Routes>
        <Route path="/academy/privacidade/:versao" element={<AcademyPrivacy />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AcademyPrivacy (S-04)", () => {
  beforeAll(async () => {
    await ensureLang("pt"); // dicionário PT sob demanda (P3-01)
    await i18n.changeLanguage("pt"); // chrome da página em PT
  });

  it("renderiza a versão vigente com cabeçalho correto", async () => {
    renderPrivacy("v2026.1");
    expect(
      await screen.findByRole("heading", { level: 1, name: /Aviso de Privacidade/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/versão v2026\.1/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Quem é o controlador/i }),
    ).toBeInTheDocument();
  });

  it("exibe o hash SHA-256 da versão (integridade — M01)", async () => {
    renderPrivacy("v2026.1");
    const hash = await screen.findByText(/^[0-9a-f]{64}$/);
    expect(hash).toBeInTheDocument();
  });

  it("versão inexistente → mensagem neutra, sem vazar conteúdo", () => {
    renderPrivacy("v9999");
    expect(screen.getByText("Versão não encontrada")).toBeInTheDocument();
  });

  it("link de volta aponta para a landing", () => {
    renderPrivacy("v2026.1");
    expect(screen.getAllByRole("link", { name: /Voltar para a pré-inscrição/i }).length).toBeGreaterThan(0);
  });
});
