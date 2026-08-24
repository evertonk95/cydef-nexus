/**
 * E-mail de confirmação (REQ-003, SEC-007, HEL-L01/L03/L04).
 * - Nome sanitizado server-side (remoção de CR/LF + escape HTML) — HEL-L01;
 * - corpo sem dado sensível além do nome;
 * - transport atrás de adapter: Resend (produção, com API key em env) ou
 *   dev transport (sandbox — nunca em produção);
 * - timeout ≤ 10s fail closed (HEL-L04);
 * - sem webhooks nesta fase (HEL-L03): status via dashboard + fallback manual.
 */

export const EMAIL_LIMITES = {
  corpoMaxBytes: 4096,
  nomeMax: 80,
  timeoutMs: 10_000,
} as const;

export function escaparHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** HEL-L01: remove CR/LF (injecção de header) e colapsa espaços; escapa HTML. */
export function sanitizarNome(nome: string): string {
  const semCrlf = nome
    .replace(/[\r\n\u2028\u2029]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return escaparHtml(semCrlf).slice(0, EMAIL_LIMITES.nomeMax);
}

export interface EmailConfirmacao {
  to: string;
  subject: string;
  html: string;
}

/** Monta o e-mail de confirmação. `link` é escapado (nunca reflete entrada). */
export function montarEmailConfirmacao(input: {
  to: string;
  nome: string;
  link: string;
}): EmailConfirmacao {
  const nomeLimp = sanitizarNome(input.nome);
  const linkSeguro = escaparHtml(input.link);
  return {
    to: input.to,
    subject: "Confirme sua pré-inscrição — CyDef Academy",
    html: `<p>Olá, <strong>${nomeLimp}</strong>!</p>
<p>Recebemos sua pré-inscrição nos cursos gratuitos da CyDef Academy.</p>
<p>Para confirmar, clique no link abaixo (válido por 48 horas):</p>
<p><a href="${linkSeguro}">Confirmar pré-inscrição</a></p>
<p>Se não foi você, ignore este e-mail. Nenhuma outra ação é necessária.</p>
<p>— CyDef Academy</p>`,
  };
}

export type EmailResult = { ok: true } | { ok: false; razao: string };

export interface EmailTransport {
  send(mail: EmailConfirmacao): Promise<EmailResult>;
}

/** Transport Resend (produção). Timeout 10s fail closed; sem retry dentro do transport (retry no caller). */
export function resendTransport(
  apiKey: string,
  from: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs: number = EMAIL_LIMITES.timeoutMs,
): EmailTransport {
  return {
    async send(mail) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetchImpl("https://api.resend.com/emails", {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [mail.to],
            subject: mail.subject,
            html: mail.html,
          }),
        });
        if (!res.ok) {
          return { ok: false, razao: `http_${res.status}` };
        }
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          razao: err instanceof Error ? err.name : "unknown",
        };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

/** Transport de desenvolvimento/sandbox (dados sintéticos) — nunca em produção. */
export function devTransport(log: (msg: string) => void = console.log): EmailTransport {
  return {
    async send(mail) {
      log(`[dev-transport] para=${mail.to} assunto="${mail.subject}" (sandbox — não enviado)`);
      return { ok: true };
    },
  };
}
