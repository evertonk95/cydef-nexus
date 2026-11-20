import { expect, test } from "@playwright/test";
import { cenario, entrar, estado, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request }) => {
  await resetar(request);
  await simularExternos(context);
});

test("admin coloca o curso à venda e o catálogo do portal mostra o Comprar com o e-mail da conta", async ({ page, request }) => {
  await cenario(request, { equipe: "admin" });
  await entrar(page);

  // Antes: o curso está em breve, sem preço.
  await page.goto("/catalogo");
  const card = page.getByRole("article").filter({ hasText: "SOC Analyst: Formação Completa" });
  await expect(card.getByText("Em breve. As matrículas ainda não abriram.")).toBeVisible();
  await expect(card.getByRole("link", { name: /Comprar/ })).toHaveCount(0);

  // Admin preenche a vitrine.
  await page.goto("/instrutor/cursos/soc-analyst?aba=vitrine");
  await expect(page.getByRole("heading", { name: "Onde o curso aparece" })).toBeVisible();
  await page.getByRole("radio", { name: /À venda/ }).check();
  await page.getByRole("checkbox", { name: "Blue Team" }).check();
  await page.getByLabel("Link de checkout").fill("https://pay.hotmart.com/A1234567B?off=ab12cd");
  await page.getByLabel("Código do produto").fill("4455667");
  await page.getByLabel("Preço (R$)").fill("497,00");
  await page.getByLabel("Observação").fill("ou em até 12x no cartão");
  await page.getByRole("button", { name: "Salvar vitrine" }).click();
  await expect(page.getByText("Vitrine salva")).toBeVisible();
  const escrita = (await estado(request)).escritasAdm.find((e) => e.fn === "academy_adm_salvar_vitrine");
  expect(escrita?.p_dados).toMatchObject({ situacao: "a_venda", preco_centavos: 49700, hotmart_produto_id: "4455667", trilhas: ["soc", "blue-team"] });

  // Depois: o catálogo do portal mostra preço e o Comprar leva à Hotmart com origem e e-mail.
  await page.goto("/catalogo");
  await expect(card.getByText(/R\$\s?497,00/)).toBeVisible();
  const comprar = card.getByRole("link", { name: /^Comprar/ });
  const u = new URL((await comprar.getAttribute("href"))!);
  expect(u.hostname).toBe("pay.hotmart.com");
  expect(u.searchParams.get("off")).toBe("ab12cd");
  expect(u.searchParams.get("sck")).toBe("portal");
  expect(u.searchParams.get("email")).toBe("aluno@exemplo.com");
  await expect(comprar).toHaveAttribute("target", "_blank");

  // Filtro por trilha e página do curso.
  await page.getByRole("button", { name: "Blue Team" }).click();
  await expect(page.getByText("Defesa em profundidade.")).toBeVisible();
  await card.getByRole("link", { name: "SOC Analyst: Formação Completa" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "SOC Analyst: Formação Completa" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Ementa" }).getByText("Módulo 2: Análise de Logs")).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Matrícula" }).getByText("aluno@exemplo.com")).toBeVisible();
});

test("admin ordena as trilhas e cria uma nova", async ({ page, request }) => {
  await cenario(request, { equipe: "admin" });
  await entrar(page);
  await page.goto("/instrutor/trilhas");
  await expect(page.getByRole("heading", { name: "Trilhas", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Descer a trilha SOC" }).click();
  await expect(page.getByRole("listitem").first().getByRole("heading")).toHaveText("Blue Team");

  await page.getByRole("button", { name: "Nova trilha" }).click();
  await page.getByLabel("Nome da trilha").fill("GRC");
  await expect(page.getByLabel("Endereço")).toHaveValue("grc");
  await page.getByRole("button", { name: "Criar trilha" }).click();
  await expect(page.getByText("Trilha criada")).toBeVisible();
  await expect(page.getByRole("heading", { name: "GRC" })).toBeVisible();
});

test("instrutor não vê a vitrine nem as trilhas, e o aluno vê o catálogo", async ({ page, request }) => {
  await cenario(request, { equipe: "instrutor" });
  await entrar(page);
  await page.goto("/instrutor/cursos/cybersecurity-fundamentals");
  await expect(page.getByRole("tab", { name: "Estrutura" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Vitrine" })).toHaveCount(0);
  await page.goto("/instrutor/trilhas");
  await expect(page.getByRole("heading", { name: /não encontrada/i })).toBeVisible();

  await page.goto("/");
  await page.getByRole("link", { name: "Catálogo" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Catálogo" })).toBeVisible();
});
