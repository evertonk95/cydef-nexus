import { expect, test } from "@playwright/test";
import { cenario, entrar, estado, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request, page }) => {
  await resetar(request);
  await simularExternos(context);
  await cenario(request, { material_modulo: true });
  await entrar(page);
});

test("material dentro do módulo: baixar dá o check e libera as questões", async ({ page, request }) => {
  await page.goto("/cursos/cybersecurity-fundamentals");
  await page.getByRole("button", { name: /Módulo 1: Princípios de segurança/ }).click();
  const material = page.getByRole("button", { name: /Material complementar.*Material complementar do Módulo 1.*Baixar/ });
  await expect(material).toBeVisible();
  await expect(page.getByRole("link", { name: /Questões do módulo.*Depois do material/ })).toBeVisible();

  // Tela de questões antes do download explica o que falta.
  await page.getByRole("link", { name: /Questões do módulo/ }).click();
  await expect(page.getByRole("heading", { name: "Antes das questões, baixe o material" })).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: /Baixar.*Material complementar do Módulo 1/ }).click();
  expect((await download).suggestedFilename()).toBe("material-modulo-1.pdf");
  expect((await estado(request)).baixados).toEqual(["mat-m1"]);
  await expect(page.getByRole("group").first()).toBeVisible();

  await page.goto("/cursos/cybersecurity-fundamentals");
  await page.getByRole("button", { name: /Módulo 1: Princípios de segurança/ }).click();
  await expect(page.getByRole("button", { name: /Material complementar.*Baixado/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Questões do módulo.*Responder/ })).toBeVisible();
});
