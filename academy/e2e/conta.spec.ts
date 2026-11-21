import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { entrar, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request, page }) => {
  await resetar(request);
  await simularExternos(context);
  await entrar(page);
});

test("Minha conta: o nome corrigido em Meu perfil aparece, baixa a cópia dos dados e prepara o pedido de exclusão", async ({ page }) => {
  await page.goto("/perfil");
  await page.getByLabel("Nome completo").fill("Everton Igor Lima do Nascimento");
  await page.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(page.getByText("Perfil salvo")).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /, Everton\.$/ })).toBeVisible();

  await page.getByRole("button", { name: "Menu da conta" }).click();
  await page.getByRole("menuitem", { name: "Minha conta" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Minha conta" })).toBeVisible();
  const dadosBloco = page.getByRole("region", { name: "Seus dados" });
  await expect(dadosBloco.getByText("Everton Igor Lima do Nascimento")).toBeVisible();
  await expect(dadosBloco.getByRole("link", { name: "Meu perfil" })).toHaveAttribute("href", "/perfil");

  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Baixar meus dados/ }).click()]);
  expect(download.suggestedFilename()).toMatch(/^meus-dados-cydef-academy-\d{4}-\d{2}-\d{2}\.json$/);
  const dados = JSON.parse(readFileSync((await download.path())!, "utf8"));
  expect(dados.conta.nome).toBe("Everton Igor Lima do Nascimento");
  expect(dados.perfil).toMatchObject({ nome: "Everton Igor Lima do Nascimento", email: "aluno@exemplo.com" });

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
