import { expect, test } from "@playwright/test";
import { cenario, entrar, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request, page }) => {
  await resetar(request);
  await simularExternos(context);
  await cenario(request, { equipe: "admin" });
  await entrar(page);
});

test("admin vê os indicadores", async ({ page }) => {
  await page.goto("/instrutor/indicadores");
  await expect(page.getByRole("heading", { level: 1, name: "Indicadores" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Números gerais" }).getByText("42")).toBeVisible();
  await expect(page.getByRole("rowheader", { name: /Cybersecurity Fundamentals/ })).toBeVisible();
});

test("admin acha a pessoa sem saber o e-mail, edita o perfil e a torna instrutora", async ({ page }) => {
  await page.goto("/instrutor");
  await page.getByRole("link", { name: "Pessoas" }).click();
  await expect(page.getByText("3 pessoas")).toBeVisible();
  await page.getByRole("searchbox", { name: "Buscar por nome ou e-mail" }).fill("ana");
  await expect(page.getByText(`1 pessoa para "ana"`)).toBeVisible();
  await page.getByRole("link", { name: /Ana Souza/ }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Ana Souza" })).toBeVisible();
  await page.getByLabel("Empresa onde trabalha").fill("Empresa X");
  await page.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(page.getByText("Perfil salvo")).toBeVisible();
  await expect(page.getByLabel("Empresa onde trabalha")).toHaveValue("Empresa X");

  const papel = page.getByRole("form", { name: "Papel" });
  await papel.getByRole("radio", { name: /Instrutor/ }).check();
  await papel.getByRole("checkbox").first().check();
  await papel.getByRole("button", { name: "Salvar papel" }).click();
  await expect(page.getByText("Papel salvo")).toBeVisible();

  await page.getByRole("link", { name: "Pessoas", exact: true }).first().click();
  await page.getByRole("button", { name: "Equipe" }).click();
  await expect(page.getByText("2 pessoas")).toBeVisible();
});
