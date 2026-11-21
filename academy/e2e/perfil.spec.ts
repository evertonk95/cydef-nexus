import { expect, test } from "@playwright/test";
import { entrar, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request, page }) => {
  await resetar(request);
  await simularExternos(context);
  await entrar(page);
});

test("Meu perfil: abre pelo menu, completa e o salvo continua lá depois de recarregar", async ({ page }) => {
  await page.getByRole("button", { name: "Menu da conta" }).click();
  await page.getByRole("menuitem", { name: "Meu perfil" }).click();
  await expect(page).toHaveURL(/\/perfil$/);
  await expect(page.getByRole("heading", { level: 1, name: "Meu perfil" })).toBeVisible();
  await expect(page.getByText("aluno@exemplo.com")).toBeVisible();

  await page.getByLabel("Empresa onde trabalha").fill("Empresa X");
  await page.getByLabel("Cargo").fill("Analista de SOC N1");
  await page.getByLabel("Tempo de experiência na área").selectOption("1_3");
  await expect(page.getByText("3 de 10 campos opcionais preenchidos")).toBeVisible();
  await page.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(page.getByText("Perfil salvo")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Empresa onde trabalha")).toHaveValue("Empresa X");
  await expect(page.getByLabel("Tempo de experiência na área")).toHaveValue("1_3");
});
