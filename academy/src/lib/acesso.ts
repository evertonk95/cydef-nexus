/**
 * Pedido do link de acesso. A resposta é sempre a mesma, exista o e-mail ou
 * não: quem está do lado de fora não descobre quem é aluno.
 */
export type ResultadoAcesso =
  | { ok: true }
  | { ok: false; motivo: "muitas_tentativas" | "verificacao_falhou" | "email_invalido" | "indisponivel" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailValido(email: string): boolean {
  const e = email.trim();
  return e.length > 3 && e.length <= 254 && EMAIL.test(e);
}

export async function pedirLinkDeAcesso(
  url: string,
  dados: { email: string; turnstileToken: string; requestId: string },
  fetchImpl: typeof fetch = fetch,
): Promise<ResultadoAcesso> {
  if (!emailValido(dados.email)) return { ok: false, motivo: "email_invalido" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: dados.email.trim(),
        turnstile_token: dados.turnstileToken,
        request_id: dados.requestId,
      }),
      signal: controller.signal,
      credentials: "omit",
    });
    if (res.status === 202) return { ok: true };
    if (res.status === 429) return { ok: false, motivo: "muitas_tentativas" };
    if (res.status === 403) return { ok: false, motivo: "verificacao_falhou" };
    if (res.status === 400) return { ok: false, motivo: "email_invalido" };
    return { ok: false, motivo: "indisponivel" };
  } catch {
    return { ok: false, motivo: "indisponivel" };
  } finally {
    clearTimeout(timer);
  }
}
