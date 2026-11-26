import { expect, test } from "@playwright/test";
import { cenario, entrar, estado, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request, page }) => {
  await resetar(request);
  await simularExternos(context);
  await cenario(request, { equipe: "admin" });
  await entrar(page);
});

test("instrutor troca a avaliação final para prova montada e escolhe as questões", async ({ page, request }) => {
  await page.goto("/instrutor/cursos/cybersecurity-fundamentals?aba=requisitos");
  await page.getByLabel("Como a prova é montada").selectOption("fixa");
  await expect(page.getByLabel("Questões sorteadas")).toHaveCount(0);
  await page.getByRole("button", { name: "Salvar regras" }).click();
  await expect(page.getByText("Regras do certificado salvas")).toBeVisible();

  await page.goto("/instrutor/cursos/cybersecurity-fundamentals?aba=questoes&mostrar=final");
  await expect(page.getByText(/A avaliação final é a prova montada: 0 questões escolhidas/)).toBeVisible();
  const barra = page.getByRole("toolbar", { name: "Ações nas questões marcadas" });
  await barra.getByLabel("Marcar as 2").check();
  await barra.getByRole("button", { name: "Pôr 2 questões na prova" }).click();
  await expect(page.getByText("2 questões entraram na prova")).toBeVisible();
  await expect(page.getByText("Na prova", { exact: true })).toHaveCount(2);
  await expect(page.getByText(/A avaliação final é a prova montada: 2 questões escolhidas\./)).toBeVisible();

  const escritas = (await estado(request)).escritasAdm;
  expect(escritas.find((e) => e.fn === "academy_adm_salvar_requisitos")?.p_dados).toMatchObject({ final_modo: "fixa" });
  expect(escritas.find((e) => e.fn === "academy_adm_definir_prova_final")).toMatchObject({ p_questoes: ["qa1", "qa2"], p_incluir: true });
});
