/**
 * Verificação do Cloudflare Turnstile no servidor para o login da Academy.
 * Mesmo comportamento do verificador do formulário de contato
 * (src/lib/contato/turnstile.ts), com a action própria "academy_acesso".
 * Fail closed: rede, timeout, hostname ou action fora do esperado = recusado.
 */
export const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
export const ACTION_ACESSO = "academy_acesso";

export interface Verificador {
  verificar(input: { token: string; ip?: string; idempotencyKey: string }): Promise<{ ok: boolean; razao?: string }>;
}

export function verificadorTurnstile(opts: {
  secret: string;
  hostnamesPermitidos: readonly string[];
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Verificador {
  const fetchImpl = opts.fetchImpl ?? fetch;
  return {
    async verificar({ token, ip, idempotencyKey }) {
      if (!opts.secret) return { ok: false, razao: "sem_secret" };
      if (!token || token.length > 2048) return { ok: false, razao: "token_invalido" };
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 8000);
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
        const data = (await res.json()) as { success?: boolean; hostname?: string; action?: string };
        if (data.success !== true) return { ok: false, razao: "nao_humano" };
        if (!data.hostname || !opts.hostnamesPermitidos.includes(data.hostname)) return { ok: false, razao: "hostname" };
        if (data.action !== ACTION_ACESSO) return { ok: false, razao: "action" };
        return { ok: true };
      } catch (err) {
        return { ok: false, razao: err instanceof Error ? err.name : "unknown" };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
