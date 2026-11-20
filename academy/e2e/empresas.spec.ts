import { expect, test } from "@playwright/test";
import { API, cenario, entrar, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request }) => {
  await resetar(request);
  await simularExternos(context);
});

test("convite de empresa: aceite com o aviso, painel da gestão e novos convites", async ({ page, request }) => {
  await cenario(request, { empresa: "convite" });
  await entrar(page);

  // O convite aparece logo na entrada.
  const aviso = page.getByRole("status").filter({ hasText: "A Banco Exemplo convidou você para a Academy." });
  await expect(aviso).toBeVisible();
  await aviso.getByRole("link", { name: "Ver convite" }).click();

  const cartao = page.getByRole("region", { name: "Banco Exemplo" });
  await expect(cartao.getByText("suas notas e respostas;")).toBeVisible();
  await expect(cartao.getByText(/Você vai cuidar da gestão da equipe/)).toBeVisible();
  await cartao.getByRole("button", { name: "Aceitar convite" }).click();

  // Gestão: cai no painel da empresa, com a equipe e o progresso.
  await expect(page).toHaveURL(/\/empresa\/e1$/);
  await expect(page.getByRole("heading", { level: 1, name: "Banco Exemplo" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Minha empresa" })).toBeVisible();
  const ana = page.getByRole("listitem", { name: "Ana Analista" });
  await ana.getByRole("button", { name: "Progresso" }).click();
  await expect(ana.getByRole("row", { name: /SOC Analyst: Formação Completa 9 de 24 Ainda não/ })).toBeVisible();

  const form = page.getByRole("form", { name: "Convidar pessoas" });
  await form.getByLabel("E-mails").fill("bruno@banco.com\ncaio@banco.com");
  await form.getByRole("button", { name: "Enviar convites" }).click();
  await expect(page.getByText("2 convites enviados")).toBeVisible();
  const pendentes = page.getByRole("region", { name: "Convites pendentes" });
  await expect(pendentes.getByRole("listitem")).toHaveCount(2);
  await expect(pendentes.getByRole("listitem", { name: "bruno@banco.com" })).toContainText("E-mail enviado em 20/11/2026");

  const est = await (await request.get(`${API}/__estado`)).json();
  expect(est.enviosConvite.at(-1)).toEqual({ empresa_id: "e1", emails: ["bruno@banco.com", "caio@banco.com"] });

  // Minha conta mostra a empresa e o que a gestão vê.
  await page.goto("/conta");
  await expect(page.getByRole("region", { name: "Empresas" })).toContainText("Ela não vê notas nem respostas.");
});

test("admin cadastra a empresa e o convite da gestão sai", async ({ page, request }) => {
  await cenario(request, { equipe: "admin" });
  await entrar(page);
  await page.goto("/instrutor/empresas");
  await expect(page.getByText("Nenhuma empresa cadastrada ainda.")).toBeVisible();
  await page.getByRole("button", { name: "Cadastrar empresa" }).click();
  const form = page.getByRole("form", { name: "Cadastrar empresa" });
  await form.getByLabel("Empresa").fill("Fintech Y");
  await form.getByLabel("Tipo").selectOption("plano");
  await form.getByLabel("Vagas").fill("12");
  await form.getByLabel("E-mail de quem vai cuidar da gestão").fill("gestora@fintech.com");
  await form.getByRole("button", { name: "Cadastrar e convidar" }).click();
  await expect(page.getByText("Convite enviado para gestora@fintech.com.")).toBeVisible();
  const linha = page.getByRole("listitem", { name: "Fintech Y" });
  await expect(linha).toContainText("1 de 12 vagas, 0 pessoas");
  await expect(linha).toContainText("Gestão: gestora@fintech.com");
});
