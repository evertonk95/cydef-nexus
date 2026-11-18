/**
 * Player do YouTube sem carregar script do Google na página do portal.
 *
 * O vídeo roda num iframe do domínio youtube-nocookie.com (modo de privacidade
 * aprimorada) com enablejsapi=1. O portal conversa com ele só por postMessage:
 * pede para ouvir ("listening") e recebe o tempo, a duração e o estado do
 * player. Mensagens de qualquer outra origem ou janela são ignoradas.
 */
export const ORIGEM_YOUTUBE = "https://www.youtube-nocookie.com";

/** Estados do player do YouTube que interessam ao portal. */
export const ESTADO = { terminou: 0, tocando: 1, pausado: 2 } as const;

export interface LeituraPlayer {
  tempo?: number;
  duracao?: number;
  estado?: number;
}

export function urlEmbed(ref: string, { inicio, origem }: { inicio: number; origem: string }): string {
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(ref)) throw new Error("referencia_invalida");
  const p = new URLSearchParams({
    enablejsapi: "1",
    autoplay: "1",
    rel: "0",
    playsinline: "1",
    iv_load_policy: "3",
    origin: origem,
  });
  const s = Math.max(0, Math.floor(inicio));
  if (s > 0) p.set("start", String(s));
  return `${ORIGEM_YOUTUBE}/embed/${ref}?${p.toString()}`;
}

function numero(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

/** Traduz uma mensagem do iframe em leitura do player. Exportada para teste. */
export function lerMensagem(dado: unknown): LeituraPlayer | null {
  let m: unknown = dado;
  if (typeof m === "string") {
    try {
      m = JSON.parse(m);
    } catch {
      return null;
    }
  }
  if (!m || typeof m !== "object") return null;
  const { event, info } = m as { event?: unknown; info?: unknown };
  if ((event === "infoDelivery" || event === "initialDelivery") && info && typeof info === "object") {
    const i = info as Record<string, unknown>;
    const leitura: LeituraPlayer = { tempo: numero(i.currentTime), duracao: numero(i.duration), estado: numero(i.playerState) };
    return leitura.tempo === undefined && leitura.duracao === undefined && leitura.estado === undefined ? null : leitura;
  }
  if (event === "onStateChange") {
    const estado = numero(info);
    return estado === undefined ? null : { estado };
  }
  return null;
}

/** Liga o canal com o iframe. Devolve a função que desliga. */
export function ouvirPlayer(iframe: HTMLIFrameElement, aoLer: (l: LeituraPlayer) => void): () => void {
  let recebeu = false;
  const pedirEscuta = () => {
    iframe.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), ORIGEM_YOUTUBE);
  };
  const aoReceber = (ev: MessageEvent) => {
    if (ev.origin !== ORIGEM_YOUTUBE || ev.source !== iframe.contentWindow) return;
    const leitura = lerMensagem(ev.data);
    if (!leitura) return;
    recebeu = true;
    aoLer(leitura);
  };
  window.addEventListener("message", aoReceber);
  iframe.addEventListener("load", pedirEscuta);
  // O iframe pode demorar a aceitar a escuta: insiste por alguns segundos.
  let tentativas = 0;
  const insistir = window.setInterval(() => {
    tentativas += 1;
    if (recebeu || tentativas > 20) {
      window.clearInterval(insistir);
      return;
    }
    pedirEscuta();
  }, 500);
  return () => {
    window.clearInterval(insistir);
    window.removeEventListener("message", aoReceber);
    iframe.removeEventListener("load", pedirEscuta);
  };
}
