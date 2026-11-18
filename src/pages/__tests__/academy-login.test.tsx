import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it } from "vitest";
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

  it("um único H1 e nenhum formulário: o login vive no portal do aluno", () => {
    const { container } = renderLogin();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Entrar na Academy" })).toBeInTheDocument();
    expect(container.querySelector("form, input")).toBeNull();
    expect(container.textContent).not.toMatch(/ainda não está disponível|em desenvolvimento/i);
  });

  it("leva ao portal do aluno", () => {
    renderLogin();
    expect(screen.getByRole("link", { name: /Ir para o portal do aluno/i })).toHaveAttribute("href", "https://academy.cydef.com.br/entrar");
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
