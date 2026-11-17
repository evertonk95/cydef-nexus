/**
 * E-mail interno do contato comercial (para o time de especialistas).
 *
 * Controles:
 * - todo campo do visitante é escapado (HTML) e tem CR/LF removido antes de
 *   entrar no assunto ou no corpo (sem injeção de cabeçalho nem HTML refletido);
 * - links da mensagem são neutralizados (hxxps://dominio[.]com), padrão de SOC
 *   para conteúdo não confiável: ninguém do time clica por engano;
 * - assunto montado só com valores de listas fechadas + empresa sanitizada;
 * - Reply-To é o e-mail validado do visitante; o remetente é sempre o
 *   endereço verificado da CyDef (nunca o do visitante, evita spoofing);
 * - NENHUM e-mail automático é enviado ao visitante: um formulário que
 *   responde para o endereço digitado vira arma de e-mail bombing contra
 *   terceiros.
 */

import { escaparHtml } from "../academy/email.ts";
import { ROTULOS_INTERNOS, type Prioridade, type Triagem } from "./triagem.ts";
import type { ContatoValidado } from "./validate.ts";

export const EMAIL_CONTATO_TIMEOUT_MS = 10_000;

export interface EmailInterno {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}

/** Remove quebras de linha e colapsa espaços (uso em assunto/cabeçalho). */
export function linhaSegura(s: string, max = 120): string {
  return s
    .replace(/[\r\n\u2028\u2029]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Neutraliza URLs: http→hxxp e pontos do host entre colchetes. */
export function neutralizarLinks(s: string): string {
  return s.replace(/\b(https?):\/\/([^\s/?#<>"']+)/giu, (_m, proto: string, host: string) => {
    const p = proto.toLowerCase() === "https" ? "hxxps" : "hxxp";
    return `${p}://${host.replace(/\./g, "[.]")}`;
  }).replace(/\bwww\.([^\s/?#<>"']+)/giu, (_m, resto: string) => `www[.]${resto.replace(/\./g, "[.]")}`);
}

function linhasTriagem(t: Triagem): Array<[string, string]> {
  const out: Array<[string, string]> = [["Motivo", ROTULOS_INTERNOS.motivo[t.motivo]]];
  if (t.urgencia) out.push(["Situação", ROTULOS_INTERNOS.urgencia[t.urgencia]]);
  if (t.area) out.push(["Área", ROTULOS_INTERNOS.area[t.area]]);
  if (t.interesse) out.push(["Interesse", ROTULOS_INTERNOS.interesse[t.interesse]]);
  if (t.porte) out.push(["Porte", ROTULOS_INTERNOS.porte[t.porte]]);
  if (t.prazo) out.push(["Prazo", ROTULOS_INTERNOS.prazo[t.prazo]]);
  return out;
}

export function montarEmailInterno(input: {
  to: string;
  contato: ContatoValidado;
  prioridade: Prioridade;
  requestId: string;
  recebidoEm: string;
}): EmailInterno {
  const c = input.contato;
  const empresaAssunto = linhaSegura(c.empresa, 60);
  const motivo = ROTULOS_INTERNOS.motivo[c.triagem.motivo];
  const subject = linhaSegura(`[Site CyDef · ${input.prioridade} · ${motivo}] ${empresaAssunto}`, 140);

  const dados: Array<[string, string]> = [
    ["Prioridade", input.prioridade],
    ...linhasTriagem(c.triagem),
    ["Nome", linhaSegura(c.nome, 80)],
    ["Cargo", linhaSegura(c.cargo, 80)],
    ["Empresa", linhaSegura(c.empresa, 100)],
    ["E-mail", c.email + (c.emailPessoal ? " (webmail pessoal, não corporativo)" : "")],
    ["Recebido em", input.recebidoEm],
    ["Protocolo", input.requestId],
  ];

  const mensagem = neutralizarLinks(c.mensagem);
  const aviso =
    "Conteúdo enviado por terceiro pelo formulário público. Links foram neutralizados. " +
    "Responda pelo botão Responder (Reply-To é o e-mail informado) e confirme a identidade antes de compartilhar qualquer informação.";

  const text = [
    ...dados.map(([k, v]) => `${k}: ${v}`),
    "",
    "Mensagem:",
    mensagem,
    "",
    `Aviso: ${aviso}`,
  ].join("\n");

  const cor = input.prioridade === "P1" ? "#dc2626" : input.prioridade === "P2" ? "#ea580c" : "#525252";
  const linhasHtml = dados
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#525252;white-space:nowrap;vertical-align:top">${escaparHtml(k)}</td>` +
        `<td style="padding:4px 0;color:#111">${escaparHtml(v)}</td></tr>`,
    )
    .join("");

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#111;max-width:640px">
<p style="margin:0 0 12px"><span style="display:inline-block;padding:2px 10px;border-radius:999px;background:${cor};color:#fff;font-weight:bold">${escaparHtml(input.prioridade)}</span>
<strong style="margin-left:8px">${escaparHtml(motivo)}</strong></p>
<table role="presentation" style="border-collapse:collapse;margin:0 0 16px">${linhasHtml}</table>
<p style="margin:0 0 4px;font-weight:bold">Mensagem</p>
<pre style="white-space:pre-wrap;word-break:break-word;font-family:inherit;background:#f5f5f5;border-left:3px solid ${cor};padding:12px;margin:0 0 16px">${escaparHtml(mensagem)}</pre>
<p style="margin:0;font-size:12px;color:#525252">${escaparHtml(aviso)}</p>
</div>`;

  return { to: input.to, replyTo: c.email, subject, text, html };
}

export type EnvioResultado = { ok: true } | { ok: false; razao: string };

export interface EmailInternoTransport {
  send(mail: EmailInterno): Promise<EnvioResultado>;
}

/** Transport Resend com reply_to e versão texto. Timeout fail closed, sem retry interno. */
export function resendTransportInterno(
  apiKey: string,
  from: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs: number = EMAIL_CONTATO_TIMEOUT_MS,
): EmailInternoTransport {
  return {
    async send(mail) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetchImpl("https://api.resend.com/emails", {
          method: "POST",
          signal: controller.signal,
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from,
            to: [mail.to],
            reply_to: mail.replyTo,
            subject: mail.subject,
            text: mail.text,
            html: mail.html,
          }),
        });
        return res.ok ? { ok: true } : { ok: false, razao: `http_${res.status}` };
      } catch (err) {
        return { ok: false, razao: err instanceof Error ? err.name : "unknown" };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
