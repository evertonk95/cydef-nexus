import { expect, test } from "@playwright/test";
import { entrar, estado, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request }) => {
  await resetar(request);
  await simularExternos(context);
});

test("pedido de link: confirmação neutra e reenvio segurado", async ({ page, request }) => {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill("aluno@exemplo.com");
  const enviar = page.getByRole("button", { name: /Enviar link de acesso/ });
  await expect(enviar).toBeEnabled();
  await enviar.click();
  await expect(page.getByRole("heading", { name: "Confira seu e-mail" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Pedir outro link em/ })).toBeDisabled();
  const e = await estado(request);
  expect(e.pedidosAcesso).toHaveLength(1);
  expect(e.pedidosAcesso[0]).toMatchObject({ email: "aluno@exemplo.com", turnstile_token: "turnstile-e2e" });
});

test("link do e-mail: o token sai da barra, só vira sessão no clique e abre o painel", async ({ page, request }) => {
  await page.goto("/entrar/retorno?token_hash=linkdeteste-e2e-aaaaaa&type=email");
  await expect(page.getByRole("heading", { name: "Confirme a sua entrada" })).toBeVisible();
  expect(new URL(page.url()).search).toBe("");
  expect((await estado(request)).verificacoes).toHaveLength(0);

  await page.getByRole("button", { name: "Entrar na Academy" }).click();
  await expect(page.getByText("Olá, Everton")).toBeVisible();
  const e = await estado(request);
  expect(e.verificacoes).toEqual([expect.objectContaining({ token_hash: "linkdeteste-e2e-aaaaaa", type: "email" })]);
  expect(e.acessosRegistrados).toBeGreaterThanOrEqual(1);
});

test("link vencido cai no pedido de link novo", async ({ page }) => {
  await page.goto("/entrar/retorno?token_hash=vencido-e2e-aaaaaaaaaa&type=email");
  await page.getByRole("button", { name: "Entrar na Academy" }).click();
  await expect(page.getByRole("heading", { name: "Este link não vale mais" })).toBeVisible();
  await page.getByRole("link", { name: "Pedir novo link" }).click();
  await expect(page).toHaveURL(/\/entrar$/);
});

test("aluno logado que abre a tela de entrada vai direto ao painel", async ({ page }) => {
  await entrar(page);
  await page.goto("/entrar");
  await expect(page).toHaveURL(/\/$/);
});
