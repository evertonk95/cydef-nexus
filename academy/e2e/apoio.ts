import { expect, type APIRequestContext, type BrowserContext, type Page } from "@playwright/test";

export const API = "http://localhost:54399";

/** Estado registrado pelo Supabase falso (o que o portal pediu ao servidor). */
export interface EstadoFalso {
  pedidosAcesso: { email: string; turnstile_token: string }[];
  verificacoes: { token_hash?: string; type?: string }[];
  acessosRegistrados: number;
  gravacoes: { p_aula_id: string; p_posicao: number; p_concluida: boolean }[];
  pedidosVideo: string[];
}

export async function resetar(request: APIRequestContext) {
  await request.post(`${API}/__reset`);
}

export async function estado(request: APIRequestContext): Promise<EstadoFalso> {
  return (await request.get(`${API}/__estado`)).json();
}

/** Turnstile falso: entrega um token logo depois de desenhar o widget. */
const TURNSTILE = `window.turnstile = {
  render: (el, o) => { el.textContent = "verificação simulada"; setTimeout(() => o.callback("turnstile-e2e"), 30); return "w1"; },
  reset() {}, remove() {}
};`;

/**
 * YouTube falso: responde ao pedido de escuta do portal com as mesmas
 * mensagens do player real (infoDelivery), avançando o tempo depressa.
 */
const youtube = (inicio: number) => `<!doctype html><body style="margin:0;background:#000"><script>
let t = ${inicio}, ligado = null;
addEventListener("message", (e) => {
  let d; try { d = JSON.parse(e.data); } catch { return; }
  if (d.event === "listening" && !ligado) {
    ligado = setInterval(() => {
      t += 60;
      parent.postMessage(JSON.stringify({ event: "infoDelivery", info: { currentTime: t, duration: 1020, playerState: 1 } }), "*");
    }, 150);
  }
});
</script></body>`;

/** Bloqueia o que viria de fora e devolve a lista de cargas do player do YouTube. */
export async function simularExternos(context: BrowserContext): Promise<string[]> {
  const cargasYoutube: string[] = [];
  await context.route("https://challenges.cloudflare.com/**", (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: TURNSTILE }));
  await context.route("https://www.youtube-nocookie.com/**", (r) => {
    const url = r.request().url();
    cargasYoutube.push(url);
    const inicio = Number(new URL(url).searchParams.get("start") ?? 0);
    return r.fulfill({ status: 200, contentType: "text/html", body: youtube(inicio) });
  });
  return cargasYoutube;
}

/** Entra pelo caminho real do aluno: link do e-mail, confirmação e painel. */
export async function entrar(page: Page) {
  await page.goto("/entrar/retorno?token_hash=linkdeteste-e2e-aaaaaa&type=email");
  await page.getByRole("button", { name: "Entrar na Academy" }).click();
  await expect(page.getByText("Olá, Everton")).toBeVisible();
}
