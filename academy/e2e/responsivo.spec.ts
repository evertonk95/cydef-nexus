import { expect, test } from "@playwright/test";
import { cenario, entrar, resetar, simularExternos } from "./apoio";

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test.beforeEach(async ({ context, request }) => {
  await resetar(request);
  await simularExternos(context);
});

for (const [nome, caminho] of [
  ["entrada", "/entrar"],
  ["painel", "/"],
  ["curso", "/cursos/cybersecurity-fundamentals"],
  ["aula", "/cursos/cybersecurity-fundamentals/aulas/2"],
  ["minha conta", "/conta"],
  ["catálogo", "/catalogo"],
  ["curso do catálogo", "/catalogo/soc-analyst"],
  ["validação do certificado", "/certificado/CYD-0000-0000-0000-0000"],
] as const) {
  test(`celular sem rolagem lateral: ${nome}`, async ({ page }) => {
    if (caminho !== "/entrar" && !caminho.startsWith("/certificado")) await entrar(page);
    await page.goto(caminho);
    await page.waitForLoadState("networkidle");
    const [largura, tela] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(largura).toBeLessThanOrEqual(tela!);
  });
}

// Fase 17: convite e painel da gestão, com a empresa de exemplo.
for (const [nome, caminho] of [
  ["convite de empresa", "/convites"],
  ["painel da empresa", "/empresa/e1"],
  ["empresas no painel do admin", "/instrutor/empresas"],
] as const) {
  test(`celular sem rolagem lateral: ${nome}`, async ({ page, request }) => {
    await cenario(request, { empresa: "convite", equipe: "admin" });
    await entrar(page);
    await page.goto(caminho);
    await page.waitForLoadState("networkidle");
    const [largura, tela] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(largura).toBeLessThanOrEqual(tela!);
  });
}

// Fase 15: missões, inclusive a investigação aberta.
for (const [nome, caminho, iniciar] of [
  ["lista de missões", "/missoes", false],
  ["investigação da missão", "/missoes/msn-001", true],
  ["missões no painel do instrutor", "/instrutor/cursos/cybersecurity-fundamentals?aba=missoes", false],
] as const) {
  test(`celular sem rolagem lateral: ${nome}`, async ({ page, request }) => {
    await cenario(request, { missao: true, equipe: "admin" });
    await entrar(page);
    await page.goto(caminho);
    if (iniciar) await page.getByRole("button", { name: "Iniciar investigação" }).click();
    await page.waitForLoadState("networkidle");
    const [largura, tela] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(largura).toBeLessThanOrEqual(tela!);
  });
}
