import { expect, test } from "@playwright/test";
import { cenario, entrar, estado, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request, page }) => {
  await resetar(request);
  await simularExternos(context);
  await cenario(request, { equipe: "admin" });
  await entrar(page);
});

test("banco de questões: filtro sobrevive à volta da questão e publica tudo de uma vez", async ({ page, request }) => {
  await page.goto("/instrutor/cursos/cybersecurity-fundamentals?aba=questoes");
  await page.getByLabel("Mostrar").selectOption({ label: "Módulo 1: Princípios de segurança" });
  await page.getByLabel("Situação").selectOption("rascunho");
  await expect(page.getByRole("link", { name: /do Módulo 1/ })).toHaveCount(3);

  // Abre uma, publica pela tela da questão e volta: o recorte continua o mesmo.
  await page.getByRole("link", { name: /Questão 3 do Módulo 1/ }).click();
  await page.getByLabel("Questão publicada").check();
  await page.getByRole("button", { name: "Salvar questão" }).click();
  await expect(page.getByText("Questão salva")).toBeVisible();
  await page.getByRole("link", { name: "Voltar" }).click();
  await expect(page.getByLabel("Mostrar")).toHaveValue("m1");
  await expect(page.getByLabel("Situação")).toHaveValue("rascunho");
  await expect(page.getByRole("link", { name: /do Módulo 1/ })).toHaveCount(2);

  // Publica as que sobraram de uma vez.
  await page.getByRole("button", { name: "Publicar as 2 em rascunho" }).click();
  await expect(page.getByText("2 questões publicadas")).toBeVisible();
  await expect(page.getByText("Nenhuma questão em rascunho aqui.")).toBeVisible();
  const lote = (await estado(request)).escritasAdm.find((e) => e.fn === "academy_adm_publicar_questoes");
  expect(lote).toMatchObject({ p_curso: "cybersecurity-fundamentals", p_questoes: ["qa4", "qa5"], p_publicar: true });
});
