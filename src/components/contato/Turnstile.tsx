import { useEffect, useRef, useState } from "react";

/**
 * Widget do Cloudflare Turnstile (anti-bot gratuito, sem quebra-cabeça de imagem).
 * O script só é carregado quando o formulário aparece, nunca na página inteira
 * nem no prerender. O token gerado é de uso único e validado no servidor.
 */

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  remove(id: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let carregando: Promise<void> | null = null;

function carregarScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if (window.turnstile) return Promise.resolve();
  if (carregando) return carregando;
  carregando = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.referrerPolicy = "strict-origin";
    s.onload = () => resolve();
    s.onerror = () => {
      carregando = null;
      reject(new Error("turnstile_script"));
    };
    document.head.appendChild(s);
  });
  return carregando;
}

export const Turnstile = ({
  siteKey,
  lang,
  resetKey,
  onToken,
  loadingLabel,
}: {
  siteKey: string;
  lang: string;
  /** Mudar este valor recria o widget (ex.: após token rejeitado). */
  resetKey: number;
  onToken: (token: string) => void;
  loadingLabel: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pronto, setPronto] = useState(false);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    let id: string | null = null;
    let ativo = true;
    onTokenRef.current("");
    carregarScript()
      .then(() => {
        if (!ativo || !ref.current || !window.turnstile) return;
        id = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          action: "contato",
          theme: "dark",
          language: lang,
          appearance: "always",
          "refresh-expired": "auto",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(""),
          "error-callback": () => onTokenRef.current(""),
        });
        setPronto(true);
      })
      .catch(() => setPronto(false));
    return () => {
      ativo = false;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, [siteKey, lang, resetKey]);

  return (
    <div className="min-h-[65px]">
      {!pronto && (
        <div
          className="h-[65px] w-[300px] max-w-full rounded-md bg-white/5 border border-white/10 animate-pulse motion-reduce:animate-none flex items-center px-4 text-xs text-neutral-500"
          aria-hidden="true"
        >
          {loadingLabel}
        </div>
      )}
      <div ref={ref} data-testid="turnstile" />
    </div>
  );
};
