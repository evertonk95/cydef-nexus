import { expect, test } from "@playwright/test";
import { cenario, entrar, estado, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request }) => {
  await resetar(request);
  await simularExternos(context);
});

test("aluno não vê o painel do instrutor nem o link no topo", async ({ page }) => {
  await entrar(page);
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Instrutor" })).toHaveCount(0);
  await page.goto("/instrutor");
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
});

test("admin cria uma aula com link do YouTube, publica e reordena", async ({ page, request }) => {
  await cenario(request, { equipe: "admin" });
  await entrar(page);

  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Instrutor" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Cursos" })).toBeVisible();
  await page.getByRole("link", { name: /Cybersecurity Fundamentals/ }).click();

  const modulo = page.getByRole("region", { name: "Módulo 1: Princípios de segurança" });
  await modulo.getByRole("link", { name: "Nova aula no módulo 1" }).click();
  await page.getByLabel("Título").fill("Autenticação e autorização");
  await page.getByLabel("Vídeo do YouTube").fill("https://youtu.be/iKAWeoCtbmA?si=compartilhado");
  await expect(page.getByText("Vídeo iKAWeoCtbmA")).toBeVisible();
  await page.getByLabel("Duração").fill("14:05");
  await page.getByLabel("Aula publicada").check();
  await page.getByRole("button", { name: "Criar aula" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Aula 05" })).toBeVisible();
  await expect(page.getByText("Publicada", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Cybersecurity Fundamentals" }).click();
  await expect(modulo.getByRole("link", { name: "Autenticação e autorização" })).toBeVisible();
  await modulo.getByRole("button", { name: "Subir aula 05" }).click();
  await expect(modulo.getByRole("listitem").nth(2)).toContainText("Autenticação e autorização");
  await expect(modulo.getByRole("listitem").nth(2)).toContainText("04");

  const e = await estado(request);
  expect(e.escritasAdm[0]).toMatchObject({
    fn: "academy_adm_salvar_aula",
    p_id: null,
    p_dados: { titulo: "Autenticação e autorização", modulo_id: "m1", duracao_seg: 845, video_provedor: "youtube", video_ref: "iKAWeoCtbmA", publicado: true },
  });
  expect(e.escritasAdm[1]).toMatchObject({ fn: "academy_adm_mover_aula", p_direcao: -1 });
});
