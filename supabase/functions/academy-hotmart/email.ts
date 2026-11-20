/**
 * E-mails da CyDef sobre o acesso pago (fase 16). A Hotmart envia recibo,
 * boleto, Pix e reembolso; a CyDef avisa só o que muda no portal: acesso
 * liberado e acesso encerrado. Nenhum link de login vai no e-mail: a pessoa
 * pede o link na própria tela de entrada, com o e-mail da compra.
 */
import { escaparHtml, sanitizarNome } from "../../../src/lib/academy/email.ts";

export interface EmailAvisoAcesso {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function primeiroNome(nome: string): string {
  return (nome.trim().split(/\s+/)[0] ?? "").replace(/[\r\n\u2028\u2029<>]/g, "").slice(0, 40);
}

function moldura(conteudo: string): string {
  return `<div style="background:#050505;padding:32px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#f5f5f4">
<div style="max-width:520px;margin:0 auto;background:#0e0e10;border:1px solid #232326;border-radius:16px;padding:32px">
<p style="margin:0 0 24px;font-size:20px;font-weight:700">CyDef <span style="color:#f97316">Academy</span></p>
${conteudo}
</div></div>`;
}

export function montarAcessoLiberado(input: { to: string; nome: string; produto: string; academyUrl: string }): EmailAvisoAcesso {
  const nomeTexto = primeiroNome(input.nome);
  const nome = sanitizarNome(nomeTexto);
  const produto = escaparHtml(input.produto.slice(0, 120));
  const entrar = `${input.academyUrl.replace(/\/+$/, "")}/entrar`;
  return {
    to: input.to,
    subject: "Seu acesso à CyDef Academy foi liberado",
    text: `${nomeTexto ? `Olá, ${nomeTexto}!` : "Olá!"}\n\nSua compra de "${input.produto.slice(0, 120)}" foi aprovada e o acesso já está liberado.\n\nPara entrar, abra ${entrar} e peça o link de acesso com este e-mail (${input.to}). O link chega na sua caixa de entrada e vale uma vez.\n\nRecibo, nota e reembolso ficam com a Hotmart, pelo e-mail dela.\n\nCyDef Academy`,
    html: moldura(`<p style="margin:0 0 12px;font-size:16px">${nome ? `Olá, ${nome}!` : "Olá!"}</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#d6d6d6">Sua compra de <strong style="color:#f5f5f4">${produto}</strong> foi aprovada e o acesso já está liberado.</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#d6d6d6">Para entrar, peça o link de acesso com este e-mail: <strong style="color:#f5f5f4">${escaparHtml(input.to)}</strong>.</p>
<p style="margin:0 0 28px"><a href="${escaparHtml(entrar)}" style="display:inline-block;background:#f97316;color:#1c0d02;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:12px">Ir para a Academy</a></p>
<p style="margin:0;font-size:13px;line-height:1.6;color:#8b8b91">Recibo, nota e reembolso ficam com a Hotmart, pelo e-mail dela.</p>`),
  };
}

export function montarAcessoEncerrado(input: { to: string; nome: string; produto: string }): EmailAvisoAcesso {
  const nomeTexto = primeiroNome(input.nome);
  const nome = sanitizarNome(nomeTexto);
  const produto = escaparHtml(input.produto.slice(0, 120));
  return {
    to: input.to,
    subject: "Seu acesso a um curso da CyDef Academy foi encerrado",
    text: `${nomeTexto ? `Olá, ${nomeTexto}!` : "Olá!"}\n\nA Hotmart nos avisou que a compra de "${input.produto.slice(0, 120)}" foi reembolsada, contestada ou cancelada. Por isso, o acesso a esse conteúdo foi encerrado.\n\nSua conta continua ativa, com os cursos gratuitos e os certificados já emitidos.\n\nSe achar que é um engano, responda este e-mail ou escreva para contato@cydef.com.br.\n\nCyDef Academy`,
    html: moldura(`<p style="margin:0 0 12px;font-size:16px">${nome ? `Olá, ${nome}!` : "Olá!"}</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#d6d6d6">A Hotmart nos avisou que a compra de <strong style="color:#f5f5f4">${produto}</strong> foi reembolsada, contestada ou cancelada. Por isso, o acesso a esse conteúdo foi encerrado.</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#d6d6d6">Sua conta continua ativa, com os cursos gratuitos e os certificados já emitidos.</p>
<p style="margin:0;font-size:13px;line-height:1.6;color:#8b8b91">Se achar que é um engano, responda este e-mail ou escreva para contato@cydef.com.br.</p>`),
  };
}
