import { expect, test } from "@playwright/test";
import { cenario, entrar, estado, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request, page }) => {
  await resetar(request);
  await simularExternos(context);
  await cenario(request, { equipe: "admin" });
  await entrar(page);
});

test("quem é da Equipe sem perfil aparece em Quem ensina e entra no curso junto com outros", async ({
  page,
  request,
}) => {
  await page.goto("/instrutor/cursos/cybersecurity-fundamentals?aba=sobre");
  const quem = page.getByRole("region", { name: "Quem ensina" });
  const lista = quem.getByRole("group", { name: "Acrescentar ao curso" });
  await expect(lista.getByLabel("Matheus Inacio")).toBeVisible();
  await expect(lista.getByText(/ainda sem perfil de instrutor/)).toHaveCount(2);
  await expect(
    quem.getByRole("button", { name: "Acrescentar", exact: true }),
  ).toBeDisabled();

  await lista.getByLabel("Matheus Inacio").check();
  await lista.getByLabel("Ana Souza").check();
  await quem.getByRole("button", { name: "Acrescentar 2 pessoas" }).click();
  await expect(
    quem.getByRole("listitem").filter({ hasText: "Matheus Inacio" }),
  ).toContainText("sem bio");
  await expect(
    quem.getByRole("listitem").filter({ hasText: "Ana Souza" }),
  ).toBeVisible();
  await expect(
    quem.getByText("Todo mundo da Equipe já está neste curso."),
  ).toBeVisible();

  const escrita = (await estado(request)).escritasAdm.find(
    (e) => e.fn === "academy_adm_acrescentar_instrutores",
  );
  expect(escrita).toMatchObject({
    p_curso: "cybersecurity-fundamentals",
    p_instrutores: [],
    p_pessoas: ["u-matheus", "u-ana"],
    p_papel: "instrutor",
  });
});
