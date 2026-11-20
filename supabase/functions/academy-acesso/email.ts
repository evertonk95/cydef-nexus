/**
 * E-mail com o link de acesso ao portal (quando o envio pelo Resend está
 * ligado). Nome sanitizado e link escapado; nenhum outro dado do aluno.
 */
import { escaparHtml, sanitizarNome } from "../../../src/lib/academy/email.ts";

export interface EmailAcesso {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * "acesso": pedido de link em academy.cydef.com.br/entrar.
 * "pre_inscricao": pré-inscrição gratuita pelo site; o mesmo link, com uma
 * frase de boas-vindas.
 */
export type MotivoAcesso = "acesso" | "pre_inscricao";

export function montarEmailAcesso(input: {
  to: string;
  nome: string;
  link: string;
  validadeMin: number;
  motivo?: MotivoAcesso;
}): EmailAcesso {
  const pre = input.motivo === "pre_inscricao";
  const primeiro = (input.nome.trim().split(/\s+/)[0] ?? "").replace(/[\r\n\u2028\u2029<>]/g, "").slice(0, 40);
  const nome = sanitizarNome(primeiro);
  const link = escaparHtml(input.link);
  const saudacao = nome ? `Olá, ${nome}!` : "Olá!";
  return {
    to: input.to,
    subject: pre ? "Bem-vindo à CyDef Academy: seu link de acesso" : "Seu link de acesso à CyDef Academy",
    text: `${primeiro ? `Olá, ${primeiro}!` : "Olá!"}\n\n${pre ? "Recebemos sua pré-inscrição nos cursos gratuitos da CyDef Academy. " : ""}Use o link abaixo para entrar na CyDef Academy. Ele vale uma vez e expira em ${input.validadeMin} minutos.\n\n${input.link}\n\n${pre ? "Nas próximas vezes, entre por academy.cydef.com.br/entrar com este mesmo e-mail.\n\n" : ""}${pre ? "Se não foi você que fez a pré-inscrição" : "Se não foi você que pediu"}, ignore este e-mail.\n\nCyDef Academy`,
    html: `<div style="background:#050505;padding:32px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#f5f5f4">
<div style="max-width:520px;margin:0 auto;background:#0e0e10;border:1px solid #232326;border-radius:16px;padding:32px">
<p style="margin:0 0 24px;font-size:20px;font-weight:700">CyDef <span style="color:#f97316">Academy</span></p>
<p style="margin:0 0 12px;font-size:16px">${saudacao}</p>${pre ? `
<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#d6d6d6">Recebemos sua pré-inscrição nos cursos gratuitos da CyDef Academy.</p>` : ""}
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#d6d6d6">Use o botão abaixo para entrar no portal. O link vale uma vez e expira em ${input.validadeMin} minutos.</p>
<p style="margin:0 0 28px"><a href="${link}" style="display:inline-block;background:#f97316;color:#1c0d02;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:12px">Entrar na Academy</a></p>${pre ? `
<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#d6d6d6">Nas próximas vezes, entre por academy.cydef.com.br/entrar com este mesmo e-mail.</p>` : ""}
<p style="margin:0;font-size:13px;line-height:1.6;color:#8b8b91">${pre ? "Se não foi você que fez a pré-inscrição" : "Se não foi você que pediu"}, ignore este e-mail. Ninguém entra na sua conta sem este link.</p>
</div></div>`,
  };
}
