import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import i18n, { ensureLang } from "@/i18n";
import AcademyLogin from "@/pages/AcademyLogin";
import { expectNoViolations } from "@/test/axe";

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={["/pt/academy/entrar"]}>
      <AcademyLogin />
    </MemoryRouter>,
  );

describe("login da Academy", () => {
  beforeAll(async () => {
    await ensureLang("pt");
    await i18n.changeLanguage("pt");
  });

  it("um único H1, campo de e-mail rotulado e nenhum campo de senha", () => {
    const { container } = renderLogin();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Entrar na Academy" })).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("type", "email");
    expect(container.querySelector('input[type="password"]')).toBeNull();
  });

  it("enviar não transmite o e-mail e mostra o aviso honesto de portal indisponível", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText("E-mail"), "pessoa@exemplo.com");
    await user.click(screen.getByRole("button", { name: /Enviar link de acesso/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/O login ainda não está disponível/i);
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("links levam à pré-inscrição e de volta à Academy", () => {
    renderLogin();
    expect(screen.getByRole("link", { name: /Pré-inscreva-se no curso gratuito/i })).toHaveAttribute("href", "/pt/academy/gratuito");
    expect(screen.getByRole("link", { name: /Voltar para a Academy/i })).toHaveAttribute("href", "/pt/academy");
  });

  it("não promete certificados", () => {
    const { container } = renderLogin();
    expect(container.textContent).not.toMatch(/certificad/i);
  });

  it("sem violações axe", async () => {
    const { container } = renderLogin();
    await expectNoViolations(container);
  });
});
