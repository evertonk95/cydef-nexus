import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import i18n, { ensureLang } from "@/i18n";
import AcademyThankYou from "@/pages/AcademyThankYou";
import AcademyStatusConfirmation from "@/pages/AcademyStatusConfirmation";
import { expectNoViolations } from "@/test/axe";
import * as analytics from "@/lib/analytics";

const renderAt = (path: string, ui: React.ReactNode) =>
  render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);

describe("telas de confirmação da Academy", () => {
  beforeAll(async () => {
    await ensureLang("pt");
    await i18n.changeLanguage("pt");
  });

  it("obrigado: um único H1, passos da jornada e o passo atual marcado", () => {
    const { container } = renderAt("/pt/academy/obrigado", <AcademyThankYou />);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Inscrição recebida!" })).toBeInTheDocument();
    const passos = container.querySelectorAll("ol li");
    expect(passos).toHaveLength(3);
    expect(passos[1]).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("link", { name: /Voltar à pré-inscrição/i })).toHaveAttribute("href", "/pt/academy/gratuito");
    expect(screen.getByRole("link", { name: /Conhecer a Academy/i })).toHaveAttribute("href", "/pt/academy");
  });

  it("status: texto neutro, sem diferenciar desfechos do token, e beacon sem token", () => {
    const spy = vi.spyOn(analytics, "track");
    const { container } = renderAt("/pt/academy/status-confirmacao", <AcademyStatusConfirmation />);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(spy).toHaveBeenCalledWith("confirmacao_concluida");
    const texto = container.textContent ?? "";
    expect(texto).not.toMatch(/inválido|expirou seu|já foi usado|token/i);
    spy.mockRestore();
  });

  it("sem violações axe nas duas telas", async () => {
    const a = renderAt("/pt/academy/obrigado", <AcademyThankYou />);
    await expectNoViolations(a.container);
    a.unmount();
    const b = renderAt("/pt/academy/status-confirmacao", <AcademyStatusConfirmation />);
    await expectNoViolations(b.container);
  });
});
