import { expect, test } from "@playwright/test";
import { cenario, entrar, resetar, simularExternos } from "./apoio";

const PDF = Buffer.from("%PDF-1.7\n1 0 obj << >> endobj\ntrailer << >>\n%%EOF\n");

test.beforeEach(async ({ context, request }) => {
  await resetar(request);
  await simularExternos(context);
});

test("material só chega ao aluno depois da aprovação de outra pessoa", async ({ page, request }) => {
  await cenario(request, { equipe: "admin", pessoa: 1 });
  await entrar(page);

  // Pessoa 1 envia: o arquivo fica em quarentena.
  await page.goto("/instrutor/cursos/cybersecurity-fundamentals?aba=materiais");
  await page.getByLabel("Arquivo").setInputFiles({ name: "slides-modulo-1.pdf", mimeType: "application/pdf", buffer: PDF });
  await page.getByLabel("Onde aparece").selectOption({ label: "Módulo 1: Princípios de segurança" });
  await page.getByRole("button", { name: /Enviar para aprovação/ }).click();
  await expect(page.getByText("Aguardando aprovação")).toBeVisible();

  // O aluno ainda não vê nada.
  await page.goto("/cursos/cybersecurity-fundamentals");
  await expect(page.getByRole("heading", { level: 1, name: "Cybersecurity Fundamentals" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Material complementar" })).toHaveCount(0);

  // A mesma pessoa não consegue aprovar.
  await page.goto("/instrutor/aprovacoes");
  await expect(page.getByText("Você enviou este arquivo. Outra pessoa precisa revisar e aprovar.")).toBeVisible();

  // Pessoa 2 baixa, confere o hash e aprova.
  await cenario(request, { pessoa: 2 });
  await page.reload();
  const item = page.getByRole("listitem", { name: "slides modulo 1" });
  await expect(item.getByRole("button", { name: "Aprovar e publicar" })).toBeDisabled();
  await item.getByRole("button", { name: /Baixar e conferir/ }).click();
  await expect(item.getByText(/SHA-256 confere/)).toBeVisible();
  await item.getByRole("button", { name: "Aprovar e publicar" }).click();
  await expect(page.getByText("Nada esperando aprovação.")).toBeVisible();

  // Agora o aluno vê e baixa como anexo.
  await page.goto("/cursos/cybersecurity-fundamentals");
  const bloco = page.getByRole("region", { name: "Material complementar" });
  await expect(bloco.getByText("slides modulo 1").first()).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent("download"), bloco.getByRole("button", { name: /Baixar/ }).click()]);
  expect(download.suggestedFilename()).toBe("slides-modulo-1.pdf");
});
