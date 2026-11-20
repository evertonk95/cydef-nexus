import { expect, test } from "@playwright/test";
import { entrar, resetar, simularExternos } from "./apoio";

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
