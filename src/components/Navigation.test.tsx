/**
 * Submenu do Labs (decisão do Everton, 16/11/2026): o Inora deixa de ser item
 * solto do menu e passa a subitem do Labs, ao lado do SIEM Health Framework.
 * A página do Inora não monta o Navigation do site: usa a barra própria, com o
 * logo levando para a home da CyDef.
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import i18n, { ensureLang } from "@/i18n";
import { Navigation } from "@/components/Navigation";
import Inora from "@/pages/Inora";

const TRIGGER = 'button[aria-controls="menu-labs"]';
const INORA_HREF = "/pt/inora";
const FRAMEWORK_HREF = "/pt/labs/siem-health-maturity-framework";

const trigger = () => document.querySelector(TRIGGER) as HTMLButtonElement;
const menu = () => document.querySelector("#menu-labs") as HTMLElement | null;

const renderNav = () =>
  render(
    <MemoryRouter initialEntries={["/pt/"]}>
      <Navigation />
    </MemoryRouter>,
  );

/** Abre o submenu pelo teclado, sem hover: foco no botão e Enter. */
const openWithKeyboard = async (user: ReturnType<typeof userEvent.setup>) => {
  const btn = trigger();
  btn.focus();
  await user.keyboard("{Enter}");
  return btn;
};

beforeAll(async () => {
  await ensureLang("pt");
  await i18n.changeLanguage("pt");
});

afterAll(async () => {
  await i18n.changeLanguage("en");
});

describe("Navigation — submenu do Labs", () => {
  it("começa fechado, com o submenu fora do DOM", () => {
    renderNav();
    const btn = trigger();
    expect(btn).not.toBeNull();
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(menu()).toBeNull();
  });

  it("abre pelo teclado e lista o Inora e o SIEM Health Framework", async () => {
    const user = userEvent.setup();
    renderNav();

    const btn = await openWithKeyboard(user);

    expect(btn).toHaveAttribute("aria-expanded", "true");
    const panel = menu();
    expect(panel).not.toBeNull();

    const hrefs = Array.from(panel?.querySelectorAll("a") ?? []).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain(INORA_HREF);
    expect(hrefs).toContain(FRAMEWORK_HREF);
    expect(
      within(panel as HTMLElement).getByRole("link", { name: /Ver todo o Labs/i }),
    ).toBeTruthy();
  });

  it("fecha com Esc e devolve o aria-expanded para false", async () => {
    const user = userEvent.setup();
    renderNav();

    const btn = await openWithKeyboard(user);
    expect(menu()).not.toBeNull();

    await user.keyboard("{Escape}");

    expect(menu()).toBeNull();
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("abre no hover do mouse", async () => {
    const user = userEvent.setup();
    renderNav();

    await user.hover(trigger());

    expect(menu()).not.toBeNull();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("mantém aberto o clique na seta com o ponteiro sobre o grupo", async () => {
    const user = userEvent.setup();
    renderNav();

    // O hover abre o submenu; o clique na seta não pode fechá-lo logo em seguida.
    await user.hover(trigger());
    expect(menu()).not.toBeNull();

    await user.click(trigger());

    expect(menu()).not.toBeNull();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("fecha ao escolher um item do submenu", async () => {
    const user = userEvent.setup();
    renderNav();

    await openWithKeyboard(user);
    expect(menu()).not.toBeNull();

    const panel = menu() as HTMLElement;
    await user.click(within(panel).getByRole("link", { name: /Inora/i }));

    expect(menu()).toBeNull();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Página do Inora — cabeçalho próprio", () => {
  it("não renderiza o menu do site e leva o logo para a home da CyDef", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/pt/inora"]}>
        <Inora />
      </MemoryRouter>,
    );

    expect(screen.queryByLabelText("Abrir menu")).toBeNull();
    expect(screen.queryByLabelText("Fechar menu")).toBeNull();
    expect(container.querySelector(TRIGGER)).toBeNull();

    const home = container.querySelector('a[aria-label="Ir para a home da CyDef"]');
    expect(home).not.toBeNull();
    expect(home).toHaveAttribute("href", "/pt");
  });
});

describe("Entrar do menu", () => {
  it("leva direto ao portal do aluno, no desktop e no menu do celular", async () => {
    const user = userEvent.setup();
    renderNav();
    const desktop = screen.getAllByRole("link", { name: "Entrar" });
    expect(desktop.length).toBeGreaterThan(0);
    for (const a of desktop) expect(a).toHaveAttribute("href", "https://academy.cydef.com.br/entrar");
    const abrir = document.querySelector('button[aria-controls="menu-mobile"], button[aria-label*="menu" i]') as HTMLButtonElement | null;
    if (abrir) await user.click(abrir);
    for (const a of screen.getAllByRole("link", { name: /Entrar/i })) {
      expect(a).toHaveAttribute("href", "https://academy.cydef.com.br/entrar");
    }
  });
});
