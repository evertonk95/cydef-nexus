import { expect, test } from "@playwright/test";
import { entrar, estado, resetar, simularExternos } from "./apoio";

let cargasYoutube: string[] = [];

test.beforeEach(async ({ context, request, page }) => {
  await resetar(request);
  cargasYoutube = await simularExternos(context);
  await entrar(page);
});

test("Continuar do painel leva à próxima aula do curso", async ({ page }) => {
  await page.getByRole("link", { name: "Continuar" }).first().click();
  await expect(page).toHaveURL(/\/cursos\/cybersecurity-fundamentals\/aulas\/2$/);
  await expect(page.getByRole("heading", { level: 1, name: "Confidencialidade, integridade e disponibilidade" })).toBeVisible();
});

test("o vídeo carrega uma vez, grava o progresso e conclui sem recarregar", async ({ page, request }) => {
  await page.goto("/cursos/cybersecurity-fundamentals/aulas/2");
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: /Assistir à aula 02/ }).click();
  await expect(page.locator('iframe[title^="Vídeo da aula 02"]')).toBeVisible();
  await expect(page.getByText("Aula concluída").first()).toBeVisible({ timeout: 15_000 });

  const e = await estado(request);
  expect(e.pedidosVideo).toContain("a2");
  expect(e.gravacoes.some((g) => g.p_aula_id === "a2" && !g.p_concluida)).toBe(true);
  expect(e.gravacoes.some((g) => g.p_aula_id === "a2" && g.p_concluida)).toBe(true);
  // A trava de 18/11: cada gravação recarregava o player. Tem de ser uma carga só.
  await page.waitForTimeout(1000);
  expect(cargasYoutube).toHaveLength(1);
  const url = new URL(cargasYoutube[0]!);
  expect(url.pathname).toBe("/embed/AKtr_lmAB6Y");
  expect(url.searchParams.get("enablejsapi")).toBe("1");
});

test("Marcar como concluída grava e mostra o estado concluído", async ({ page, request }) => {
  await page.goto("/cursos/cybersecurity-fundamentals/aulas/3");
  await page.getByRole("button", { name: /Marcar como concluída/ }).click();
  await expect(page.getByText("Aula concluída").first()).toBeVisible();
  expect((await estado(request)).gravacoes).toContainEqual(expect.objectContaining({ p_aula_id: "a3", p_concluida: true }));
});

test("navegação entre aulas e lista do curso", async ({ page }) => {
  await page.goto("/cursos/cybersecurity-fundamentals/aulas/2");
  await page.getByRole("link", { name: /Próxima aula/ }).first().click();
  await expect(page).toHaveURL(/\/aulas\/3$/);
  await page.getByRole("link", { name: /Aula anterior/ }).click();
  await expect(page).toHaveURL(/\/aulas\/2$/);
  await page.goto("/cursos/cybersecurity-fundamentals");
  await expect(page.getByRole("link", { name: /Continuar o curso/ })).toHaveAttribute("href", "/cursos/cybersecurity-fundamentals/aulas/2");
});
