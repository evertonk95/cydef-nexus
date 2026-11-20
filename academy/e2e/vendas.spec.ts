import { expect, test } from "@playwright/test";
import { cenario, entrar, estado, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request }) => {
  await resetar(request);
  await simularExternos(context);
});

test("admin vê a compra da Hotmart, transfere para o e-mail da conta e libera uma cortesia", async ({ page, request }) => {
  await cenario(request, { equipe: "admin" });
  await entrar(page);
  await page.goto("/instrutor/vendas");
  await expect(page.getByRole("heading", { level: 1, name: "Vendas e acessos" })).toBeVisible();

  const compra = page.getByRole("listitem", { name: /pessoal@exemplo.com/ });
  await expect(compra.getByText("Hotmart, HP1234567890")).toBeVisible();
  await compra.getByRole("button", { name: "Transferir" }).click();
  await compra.getByLabel("Novo e-mail").fill("trabalho@exemplo.com");
  await compra.getByRole("button", { name: "Transferir acesso" }).click();
  await expect(page.getByText("Acesso transferido")).toBeVisible();
  await expect(page.getByRole("listitem", { name: /trabalho@exemplo.com/ })).toBeVisible();

  await page.getByRole("button", { name: "Liberar acesso" }).click();
  const form = page.getByRole("form", { name: "Liberar acesso" });
  await form.getByLabel("E-mail").fill("parceiro@exemplo.com");
  await form.getByLabel("O acesso cobre").selectOption("plataforma");
  await form.getByLabel("Validade").selectOption("365");
  await form.getByLabel("Motivo").fill("Cortesia de parceria");
  await form.getByRole("button", { name: "Liberar acesso" }).click();
  await expect(page.getByRole("listitem", { name: /parceiro@exemplo.com/ })).toBeVisible();
  const escrita = (await estado(request)).escritasAdm.find((e) => e.fn === "academy_adm_conceder");
  expect(escrita?.p_dados).toMatchObject({ email: "parceiro@exemplo.com", escopo: "plataforma", dias: 365 });

  await expect(page.getByText("Produto 3003, plataforma toda, 365 dias")).toBeVisible();
  await expect(page.getByText("Acesso liberado").last()).toBeVisible();
});
