/**
 * Peças comuns dos e-mails da CyDef Academy enviados pelas funções da fase 17
 * (convite de empresa e aviso de vencimento): moldura visual, primeiro nome,
 * data no formato brasileiro e envio pelo Resend.
 */
import { escaparHtml, sanitizarNome } from "../../../src/lib/academy/email.ts";

export { escaparHtml, sanitizarNome };

export interface EmailAcademy {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface CarteiroAcademy {
  enviar(mail: EmailAcademy): Promise<boolean>;
}

export function primeiroNome(nome: string): string {
  return (nome.trim().split(/\s+/)[0] ?? "").replace(/[\r\n\u2028\u2029<>]/g, "").slice(0, 40);
}

/** Texto de uma linha para assunto e corpo em texto puro. */
export function linha(s: string, max = 120): string {
  return s.replace(/[\r\n\u2028\u2029]+/g, " ").trim().slice(0, max);
}

/** "2027-05-31" vira "31/05/2027". Qualquer outra coisa volta vazia. */
export function dataBr(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

export function moldura(conteudo: string): string {
  return `<div style="background:#050505;padding:32px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#f5f5f4">
<div style="max-width:520px;margin:0 auto;background:#0e0e10;border:1px solid #232326;border-radius:16px;padding:32px">
<p style="margin:0 0 24px;font-size:20px;font-weight:700">CyDef <span style="color:#f97316">Academy</span></p>
${conteudo}
</div></div>`;
}

export const P = 'style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#d6d6d6"';
export const NOTA = 'style="margin:0;font-size:13px;line-height:1.6;color:#8b8b91"';

export function botao(href: string, rotulo: string): string {
  return `<p style="margin:0 0 28px"><a href="${escaparHtml(href)}" style="display:inline-block;background:#f97316;color:#1c0d02;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:12px">${escaparHtml(rotulo)}</a></p>`;
}

export function saudacao(nome: string): { texto: string; html: string } {
  const t = primeiroNome(nome);
  return {
    texto: t ? `Olá, ${t}!` : "Olá!",
    html: `<p style="margin:0 0 12px;font-size:16px">${t ? `Olá, ${sanitizarNome(t)}!` : "Olá!"}</p>`,
  };
}

export function carteiroResend(apiKey: string, from: string, fetchImpl: typeof fetch = fetch): CarteiroAcademy {
  return {
    async enviar(mail) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      try {
        const res = await fetchImpl("https://api.resend.com/emails", {
          method: "POST",
          signal: controller.signal,
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, html: mail.html, text: mail.text }),
        });
        return res.ok;
      } catch {
        return false;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

/** Comparação em tempo constante (não vaza o tamanho do prefixo certo). */
export function iguais(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let dif = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) dif |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return dif === 0;
}
