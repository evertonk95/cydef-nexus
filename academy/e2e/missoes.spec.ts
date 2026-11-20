import { expect, test } from "@playwright/test";
import { cenario, entrar, estado, resetar, simularExternos } from "./apoio";

test.beforeEach(async ({ context, request }) => {
  await resetar(request);
  await simularExternos(context);
});

test("missão de SOC: do painel ao resultado, com evidência fixada", async ({ page, request }) => {
  await cenario(request, { missao: true });
  await entrar(page);

  const cartao = page.getByRole("region", { name: "Triagem de phishing" });
  await expect(cartao).toContainText("Próxima missão");
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Missões" })).toBeVisible();
  await cartao.getByRole("link", { name: "Iniciar investigação" }).click();

  await expect(page).toHaveURL(/\/missoes\/msn-001$/);
  await page.getByRole("button", { name: "Iniciar investigação" }).click();

  const abas = page.getByRole("tablist", { name: "Evidências" });
  await abas.getByRole("tab", { name: "Logs do proxy" }).click();
  await page.getByRole("button", { name: "Fixar a linha 09:15:02 m.souza 10.0.4.33 POST nortec-fin.example/login.php ALLOWED" }).click();
  await abas.getByRole("tab", { name: "Cabeçalhos" }).click();
  await page.getByRole("button", { name: /Reply-To: pagamentos@nortec-fin\.example/ }).click();
  await expect(page.getByRole("button", { name: /^Tirar / })).toHaveCount(2);

  const enviar = page.getByRole("button", { name: "Enviar investigação" });
  await expect(enviar).toBeDisabled();
  const investigacao = page.getByRole("region", { name: "Investigação" });
  for (const certa of ["nortec-fin.example", "SPF falhou, não há DKIM e o DMARC falhou", "m.souza", "Verdadeiro positivo"]) {
    await investigacao.getByText(certa, { exact: true }).click();
  }
  for (const acao of ["Bloquear nortec-fin.example no proxy e no e-mail", "Redefinir a senha do m.souza e encerrar as sessões dele", "Remover o e-mail das caixas de quem o recebeu"]) {
    await investigacao.getByText(acao, { exact: true }).click();
  }
  await expect(investigacao.getByRole("checkbox", { name: "Desligar o servidor de e-mail" })).not.toBeChecked();
  await expect(page.getByText("Tudo pronto. As 2 evidências fixadas vão junto com a investigação.")).toBeVisible();
  await enviar.click();

  await expect(page.getByRole("heading", { name: "Missão concluída" })).toBeVisible();
  await expect(page.getByText("Selo conquistado: Caçador de phishing")).toBeVisible();
  await expect(page.getByText(/Você acertou 5 de 5 perguntas em 07:05 e fixou 2 evidências\./)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Correção" })).toBeVisible();

  const e = await estado(request);
  const envio = e.escritasAdm.find((x) => x.fn === "academy_enviar_missao")!.p_dados as { p_respostas: Record<string, number[]>; p_evidencias: string[] };
  expect(envio.p_respostas).toEqual({ dominio: [1], autenticacao: [1], usuario: [1], classificacao: [1], acoes: [0, 1, 2] });
  expect(envio.p_evidencias).toEqual([
    "Logs do proxy · 09:15:02 m.souza 10.0.4.33 POST nortec-fin.example/login.php ALLOWED",
    "Cabeçalhos · Reply-To: pagamentos@nortec-fin.example",
  ]);

  // Aprovada, ela sai do painel.
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Triagem de phishing" })).toHaveCount(0);
});

test("instrutor edita a missão na aba Missões do curso", async ({ page, request }) => {
  await cenario(request, { missao: true, equipe: "admin" });
  await entrar(page);
  await page.goto("/instrutor/cursos/cybersecurity-fundamentals?aba=missoes");
  const item = page.getByRole("listitem", { name: "MSN-001, Triagem de phishing" });
  await expect(item).toContainText("Publicada");
  await item.getByRole("button", { name: "Editar" }).click();
  const form = page.getByRole("form", { name: "Editar MSN-001" });
  await form.getByLabel("Título", { exact: true }).fill("Triagem de phishing no financeiro");
  await form.getByRole("button", { name: "Salvar missão" }).click();
  await expect(page.getByText("Missão salva e publicada")).toBeVisible();
  await expect(page.getByRole("listitem", { name: "MSN-001, Triagem de phishing no financeiro" })).toBeVisible();
});
