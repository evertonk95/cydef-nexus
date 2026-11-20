import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { entrar, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request, page }) => {
  await resetar(request);
  await simularExternos(context);
  await entrar(page);
});

test("Minha conta: corrige o nome, baixa a cópia dos dados e prepara o pedido de exclusão", async ({ page }) => {
  await page.getByRole("button", { name: "Menu da conta" }).click();
  await page.getByRole("menuitem", { name: "Minha conta" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Minha conta" })).toBeVisible();

  const nome = page.getByLabel("Nome", { exact: true });
  await expect(nome).toHaveValue("Everton Nascimento");
  await nome.fill("Everton Igor Lima do Nascimento");
  await page.getByRole("button", { name: "Salvar nome" }).click();
  await expect(page.getByText("Nome salvo")).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /, Everton\.$/ })).toBeVisible();
  await page.goto("/conta");
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue("Everton Igor Lima do Nascimento");

  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Baixar meus dados/ }).click()]);
  expect(download.suggestedFilename()).toMatch(/^meus-dados-cydef-academy-\d{4}-\d{2}-\d{2}\.json$/);
  const dados = JSON.parse(readFileSync((await download.path())!, "utf8"));
  expect(dados.conta.nome).toBe("Everton Igor Lima do Nascimento");

  const exclusao = page.getByRole("link", { name: /Pedir a exclusão por e-mail/ });
  await expect(exclusao).toHaveAttribute("href", /^mailto:contato@cydef\.com\.br\?subject=LGPD/);
  await expect(page.getByText(/Você ainda não tem certificado/)).toBeVisible();
});
