import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AcademyLanding from "../index";
import { expectNoViolations } from "@/test/axe";

/**
 * S-02 — walking skeleton: landing estática na rota /academy/gratuito.
 * A11y: teclado, labels, foco, semântica (WCAG 2.2 AA em J1).
 */

function renderLanding() {
  return render(
    <MemoryRouter initialEntries={["/academy/gratuito"]}>
      <AcademyLanding />
    </MemoryRouter>,
  );
}

describe("AcademyLanding (S-02)", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("renderiza hero com H1 e CTA âncora", () => {
    renderLanding();
    expect(
      screen.getByRole("heading", { level: 1, name: /Comece sua carreira em SOC/i }),
    ).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /Quero meu acesso gratuito/i });
    expect(cta).toHaveAttribute("href", "#pre-inscricao");
  });

  it("apresenta os 2 cursos gratuitos (o que você recebe)", () => {
    renderLanding();
    expect(screen.getByText("Fundamentos para SOC")).toBeInTheDocument();
    expect(screen.getByText("Cybersecurity Fundamentals")).toBeInTheDocument();
  });

  it("apresenta os 3 passos e a prova de valor", () => {
    renderLanding();
    expect(screen.getByText("Como funciona")).toBeInTheDocument();
    expect(screen.getByText("Pré-inscreva-se")).toBeInTheDocument();
    expect(screen.getByText("Quem cria é quem opera")).toBeInTheDocument();
  });

  it("FAQ acessível por teclado (botões com aria-expanded)", async () => {
    const user = userEvent.setup();
    renderLanding();
    const pergunta = screen.getByRole("button", { name: /É realmente grátis/i });
    expect(pergunta).toHaveAttribute("aria-expanded", "false");
    await user.click(pergunta);
    expect(pergunta).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/100% gratuitos, sem cartão/i)).toBeInTheDocument();
  });

  it("skip link presente e focável", () => {
    renderLanding();
    const skip = screen.getByRole("link", { name: /Pular para o conteúdo/i });
    expect(skip).toHaveAttribute("href", "#conteudo");
  });

  it("landing sem violações axe (automático, jsdom)", async () => {
    const { container } = renderLanding();
    await expectNoViolations(container);
  });

  it("link do Aviso de Privacidade aponta para versão imutável (M01)", () => {
    renderLanding();
    const aviso = screen.getByRole("link", { name: "Aviso de Privacidade" });
    expect(aviso).toHaveAttribute("href", "/academy/privacidade/v2026.1");
  });

  it("formulário em estado 'inscrições em breve' (capture off) — NENHUM input de PII na rede", async () => {
    vi.stubEnv("VITE_CAPTURE_ENABLED", undefined);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    renderLanding();
    expect(screen.getByText(/Pré-inscrições em breve/i)).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /Nome completo/i })).not.toBeInTheDocument();
    // nenhuma chamada de rede com dados
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("pageview sem PII dispara quando analytics habilitado", async () => {
    vi.stubEnv("VITE_ANALYTICS_ENABLED", "true");
    vi.stubEnv("VITE_ANALYTICS_ENDPOINT", "https://analytics.cydef.com.br/e");
    const beacon = vi.fn().mockReturnValue(true);
    vi.spyOn(navigator, "sendBeacon").mockImplementation(beacon);
    renderLanding();
    expect(beacon).toHaveBeenCalled();
    const blob = beacon.mock.calls[0][1] as Blob;
    const payload = JSON.parse(await blob.text()) as Record<string, unknown>;
    expect(payload.e).toBe("pageview");
    expect(JSON.stringify(payload)).not.toMatch(/@/);
    expect(JSON.stringify(payload)).not.toMatch(/\b\d{1,3}(\.\d{1,3}){3}\b/);
  });

  it("página não referencia a rota no nav principal (acesso direto em staging)", () => {
    renderLanding();
    // A landing não adiciona link próprio no Navigation (rota só por URL direta até go-live)
    const nav = document.querySelector("nav");
    expect(nav).not.toBeNull();
    const links = nav ? within(nav as HTMLElement).queryAllByRole("link") : [];
    expect(links.some((l) => l.getAttribute("href") === "/academy/gratuito")).toBe(false);
  });
});
