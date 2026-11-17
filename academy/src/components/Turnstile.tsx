import { useEffect, useRef, useState } from "react";

/**
 * Cloudflare Turnstile do login (mesmo widget do formulário de contato do
 * site, com action "academy_acesso"). O script só carrega na tela de login.
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

export function Turnstile({
  siteKey,
  reinicio,
  aoToken,
}: {
  siteKey: string;
  /** Mudar este número recria o widget (por exemplo, depois de um envio). */
  reinicio: number;
  aoToken: (token: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<"carregando" | "pronto" | "erro">("carregando");
  const aoTokenRef = useRef(aoToken);
  useEffect(() => {
    aoTokenRef.current = aoToken;
  }, [aoToken]);

  useEffect(() => {
    let id: string | null = null;
    let ativo = true;
    aoTokenRef.current("");
    carregarScript()
      .then(() => {
        if (!ativo || !ref.current || !window.turnstile) return;
        id = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          action: "academy_acesso",
          theme: "dark",
          language: "pt-br",
          appearance: "interaction-only",
          "refresh-expired": "auto",
          callback: (token: string) => aoTokenRef.current(token),
          "expired-callback": () => aoTokenRef.current(""),
          "error-callback": () => aoTokenRef.current(""),
        });
        setEstado("pronto");
      })
      .catch(() => {
        if (ativo) setEstado("erro");
      });
    return () => {
      ativo = false;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, [siteKey, reinicio]);

  return (
    <div className="min-h-0">
      {estado === "erro" && (
        <p role="alert" className="text-sm text-bad">
          A verificação de segurança não carregou. Confira a conexão e recarregue a página.
        </p>
      )}
      <div ref={ref} data-testid="turnstile" />
    </div>
  );
}
