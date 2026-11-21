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

test("Minha conta: liga o aviso de aula nova e o certificado emitido chega sempre", async ({ page }) => {
  await page.goto("/conta");
  const bloco = page.getByRole("region", { name: "Avisos por e-mail" });
  await expect(bloco.getByText(/certificado emitido chega sempre/)).toBeVisible();
  const chave = bloco.getByRole("checkbox", { name: /Avisar quando sair aula nova/ });
  await expect(chave).not.toBeChecked();
  await chave.click();
  await expect(chave).toBeChecked();
  await expect(bloco.getByText(/Ligado desde 20 de novembro de 2026/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole("region", { name: "Avisos por e-mail" }).getByRole("checkbox", { name: /Avisar quando sair aula nova/ })).toBeChecked();
});
