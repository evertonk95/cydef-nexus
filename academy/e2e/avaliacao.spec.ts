import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { cenario, entrar, estado, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request, page }) => {
  await resetar(request);
  await simularExternos(context);
  await entrar(page);
});

/** No Supabase falso a primeira alternativa listada é sempre a certa. */
async function responder(page: Page, certas: boolean) {
  const questoes = page.getByRole("group");
  await expect(questoes.first()).toBeVisible();
  const n = await questoes.count();
  for (let i = 0; i < n; i++) {
    await questoes.nth(i).locator("label").nth(certas ? 0 : 1).click();
  }
  return n;
}

test("questões do módulo: erra, vê a explicação, refaz e libera", async ({ page, request }) => {
  await page.goto("/cursos/cybersecurity-fundamentals");
  await page.getByRole("button", { name: /Módulo 1: Princípios de segurança/ }).click();
  await page.getByRole("link", { name: /Questões do módulo/ }).click();
  await expect(page).toHaveURL(/\/modulos\/1\/questoes$/);

  const enviar = page.getByRole("button", { name: /Enviar respostas/ });
  await expect(enviar).toBeDisabled();
  expect(await responder(page, false)).toBe(3);
  await enviar.click();
  await expect(page.getByRole("heading", { name: "Ainda não foi desta vez" })).toBeVisible();
  await expect(page.getByText('A resposta certa é "Confidencialidade".')).toBeVisible();

  await page.getByRole("button", { name: /Responder de novo/ }).click();
  await expect(page.getByText("0 de 3 respondidas")).toBeVisible();
  await responder(page, true);
  await page.getByRole("button", { name: /Enviar respostas/ }).click();
  await expect(page.getByRole("heading", { name: "Módulo concluído" })).toBeVisible();
  expect((await estado(request)).respostasModulo).toHaveLength(2);

  await page.goto("/cursos/cybersecurity-fundamentals");
  await page.getByRole("button", { name: /Módulo 1: Princípios de segurança/ }).click();
  await expect(page.getByRole("link", { name: /Questões do módulo/ })).toContainText("Aprovado");
});

test("avaliação final e emissão do certificado", async ({ page, request }) => {
  await cenario(request, { aulas_concluidas: true, modulo_aprovado: true });
  await page.goto("/cursos/cybersecurity-fundamentals");
  await page.getByRole("link", { name: /Fazer a avaliação/ }).click();
  await expect(page).toHaveURL(/\/avaliacao$/);
  await page.getByRole("button", { name: /Começar a avaliação/ }).click();

  expect(await responder(page, true)).toBe(4);
  await page.getByRole("button", { name: /Enviar avaliação/ }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: /Enviar agora/ }).click();
  await expect(page.getByRole("heading", { name: "Você passou na avaliação final" })).toBeVisible();
  await page.getByRole("link", { name: /Ir para o certificado/ }).click();

  const nome = page.getByLabel("Nome no certificado");
  await expect(nome).toHaveValue("Everton Nascimento");
  await nome.fill("Everton Igor Lima do Nascimento");
  await page.getByRole("checkbox", { name: /Conferi meu nome/ }).check();
  await page.getByRole("button", { name: /Emitir certificado/ }).click();
  await expect(page.getByText("CYD-1A2B-3C4D-5E6F-7A8B")).toBeVisible();
  expect((await estado(request)).certificado?.nome).toBe("Everton Igor Lima do Nascimento");

  // PDF gerado no navegador, com as fontes servidas pelo próprio portal.
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Baixar PDF/ }).click()]);
  expect(download.suggestedFilename()).toBe("certificado-cybersecurity-fundamentals-CYD-1A2B-3C4D-5E6F-7A8B.pdf");
  const caminho = await download.path();
  const bytes = readFileSync(caminho!);
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(bytes.byteLength).toBeGreaterThan(50_000);

  // Validação pública, sem login.
  await page.context().clearCookies();
  await page.evaluate(() => window.localStorage.clear());
  await page.goto("/certificado/cyd-1a2b-3c4d-5e6f-7a8b");
  await expect(page.getByText("Certificado válido")).toBeVisible();
  await expect(page.getByText("Everton Igor Lima do Nascimento")).toBeVisible();
  await page.goto("/certificado/CYD-0000-0000-0000-0000");
  await expect(page.getByRole("heading", { name: "Não encontramos este certificado" })).toBeVisible();
  await entrar(page);

  await page.goto("/cursos/cybersecurity-fundamentals");
  await expect(page.getByRole("link", { name: /Ver certificado/ })).toBeVisible();
});

test("reprovado na avaliação final espera a próxima tentativa", async ({ page, request }) => {
  await cenario(request, { aulas_concluidas: true, modulo_aprovado: true });
  await page.goto("/cursos/cybersecurity-fundamentals/avaliacao");
  await page.getByRole("button", { name: /Começar a avaliação/ }).click();
  await responder(page, false);
  await page.getByRole("button", { name: /Enviar avaliação/ }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: /Enviar agora/ }).click();
  await expect(page.getByRole("heading", { name: "Ainda não foi desta vez" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: /^Nova tentativa amanhã às/ })).toBeVisible();
  expect((await estado(request)).provas).toEqual([{ nota: 0, aprovado: false }]);
});
