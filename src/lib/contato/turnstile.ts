/**
 * Verificação server-side do Cloudflare Turnstile (anti-bot gratuito, sem
 * imagem para clicar). O widget no SPA só gera um token de uso único; quem
 * decide é esta verificação, com a chave secreta guardada no secret manager.
 *
 * Fail closed: erro de rede, timeout, resposta fora do padrão, hostname ou
 * action diferentes do esperado = rejeitado.
 */

export const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
export const TURNSTILE_ACTION = "contato";

export interface TurnstileResultado {
  ok: boolean;
  razao?: string;
}

export interface TurnstileVerificador {
  verificar(input: { token: string; ip?: string; idempotencyKey: string }): Promise<TurnstileResultado>;
}

export function turnstileVerificador(opts: {
  secret: string;
  hostnamesPermitidos: readonly string[];
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): TurnstileVerificador {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.timeoutMs ?? 8000;
  return {
    async verificar({ token, ip, idempotencyKey }) {
      if (!opts.secret) return { ok: false, razao: "sem_secret" };
      if (!token || token.length > 2048) return { ok: false, razao: "token_invalido" };
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const form = new URLSearchParams();
        form.set("secret", opts.secret);
        form.set("response", token);
        form.set("idempotency_key", idempotencyKey);
        if (ip && ip !== "desconhecido") form.set("remoteip", ip);
        const res = await fetchImpl(TURNSTILE_VERIFY_URL, {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: form.toString(),
        });
        if (!res.ok) return { ok: false, razao: `http_${res.status}` };
        const data = (await res.json()) as {
          success?: boolean;
          hostname?: string;
          action?: string;
        };
        if (data.success !== true) return { ok: false, razao: "nao_humano" };
        if (!data.hostname || !opts.hostnamesPermitidos.includes(data.hostname)) {
          return { ok: false, razao: "hostname" };
        }
        if (data.action !== TURNSTILE_ACTION) return { ok: false, razao: "action" };
        return { ok: true };
      } catch (err) {
        return { ok: false, razao: err instanceof Error ? err.name : "unknown" };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
