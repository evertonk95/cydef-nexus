/**
 * E-mails de vencimento (fase 17): plano de 12 meses e liberações longas,
 * acesso pela empresa (membro) e fim do contrato (gestora). Nenhum link de
 * login; o de renovação, quando existe, é o checkout da Hotmart.
 */
import { NOTA, P, botao, dataBr, escaparHtml, linha, moldura, saudacao, type EmailAcademy } from "../_shared/academy-email.ts";

export interface AvisoVencimento {
  chave: string;
  email: string;
  nome: string;
  tipo: "plano" | "membro" | "gestora";
  acesso: string;
  fim: string;
  dias: number;
  renovar_url: string | null;
}

const CHECKOUT = /^https:\/\/(pay|checkout)\.hotmart\.com\/[A-Za-z0-9]{4,40}(\?[A-Za-z0-9=&._-]{1,200})?$/;

function prazo(dias: number): string {
  if (dias <= 0) return "hoje";
  if (dias === 1) return "amanhã";
  return `em ${dias} dias`;
}

export function montarAviso(a: AvisoVencimento): EmailAcademy {
  const s = saudacao(a.nome);
  const acesso = linha(a.acesso, 120);
  const fim = dataBr(a.fim);
  const quando = prazo(a.dias);
  const fica = "Sua conta, o progresso e os certificados já emitidos continuam com você.";

  if (a.tipo === "gestora") {
    return {
      to: a.email,
      subject: linha(`O contrato da ${acesso} com a CyDef Academy termina ${quando}`, 140),
      text: `${s.texto}\n\nO contrato da ${acesso} com a CyDef Academy vale até ${fim}. Depois dessa data, a equipe deixa de acessar os cursos do contrato e você deixa de ver o progresso das pessoas.\n\nPara renovar, responda este e-mail ou escreva para contato@cydef.com.br.\n\nCyDef Academy`,
      html: moldura(`${s.html}
<p ${P}>O contrato da <strong style="color:#f5f5f4">${escaparHtml(acesso)}</strong> com a CyDef Academy vale até <strong style="color:#f5f5f4">${fim}</strong>. Depois dessa data, a equipe deixa de acessar os cursos do contrato e você deixa de ver o progresso das pessoas.</p>
<p ${NOTA}>Para renovar, responda este e-mail ou escreva para contato@cydef.com.br.</p>`),
    };
  }

  if (a.tipo === "membro") {
    return {
      to: a.email,
      subject: linha(`Seu acesso pela ${acesso} à CyDef Academy termina ${quando}`, 140),
      text: `${s.texto}\n\nSeu acesso à CyDef Academy pela ${acesso} vale até ${fim}. ${fica}\n\nPara continuar depois dessa data, fale com a gestão da sua empresa.\n\nCyDef Academy`,
      html: moldura(`${s.html}
<p ${P}>Seu acesso à CyDef Academy pela <strong style="color:#f5f5f4">${escaparHtml(acesso)}</strong> vale até <strong style="color:#f5f5f4">${fim}</strong>. ${fica}</p>
<p ${NOTA}>Para continuar depois dessa data, fale com a gestão da sua empresa.</p>`),
    };
  }

  const renovar = a.renovar_url && CHECKOUT.test(a.renovar_url) ? a.renovar_url : null;
  return {
    to: a.email,
    subject: linha(`Seu acesso à CyDef Academy vence ${quando}`, 140),
    text: `${s.texto}\n\nSeu acesso a ${acesso} na CyDef Academy vale até ${fim}. Ele não é renovado sozinho. ${fica}\n\n${renovar ? `Para continuar, você pode comprar um novo período: ${renovar}` : "Para continuar, responda este e-mail ou escreva para contato@cydef.com.br."}\n\nCyDef Academy`,
    html: moldura(`${s.html}
<p ${P}>Seu acesso a <strong style="color:#f5f5f4">${escaparHtml(acesso)}</strong> na CyDef Academy vale até <strong style="color:#f5f5f4">${fim}</strong>. Ele não é renovado sozinho. ${fica}</p>
${renovar ? botao(renovar, "Comprar um novo período") : ""}
<p ${NOTA}>${renovar ? "O pagamento é feito na Hotmart." : "Para continuar, responda este e-mail ou escreva para contato@cydef.com.br."}</p>`),
  };
}
