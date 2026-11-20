/**
 * E-mail de convite de empresa (fase 17). Não leva link de login: a pessoa
 * entra no portal com o e-mail convidado e o convite aparece na entrada,
 * com o que a gestão da empresa poderá acompanhar antes do aceite.
 */
import { NOTA, P, botao, dataBr, escaparHtml, linha, moldura, type EmailAcademy } from "../_shared/academy-email.ts";

export interface DadosConvite {
  to: string;
  empresa: string;
  alvo: string;
  fim: string;
  quemConvida: string;
  gestor: boolean;
  academyUrl: string;
}

export function montarConvite(d: DadosConvite): EmailAcademy {
  const empresa = linha(d.empresa, 120);
  const alvo = linha(d.alvo, 120);
  const quem = linha(d.quemConvida, 80);
  const fim = dataBr(d.fim);
  const entrar = `${d.academyUrl.replace(/\/+$/, "")}/entrar`;
  const papel = d.gestor
    ? "Você vai cuidar da gestão da equipe na Academy: depois de aceitar, poderá convidar as pessoas e acompanhar o progresso de cada uma nos cursos do contrato."
    : "A gestão da empresa poderá acompanhar o seu progresso nos cursos do contrato. Antes de aceitar, você vê exatamente o que ela vai ver.";
  return {
    to: d.to,
    subject: linha(`${empresa} convidou você para a CyDef Academy`, 140),
    text: `Olá!\n\n${quem} convidou você para a CyDef Academy pela ${empresa}. O convite libera ${alvo}${fim ? ` até ${fim}` : ""}.\n\n${papel}\n\nPara aceitar, abra ${entrar} e peça o link de acesso com este e-mail (${d.to}). O convite aparece logo depois de entrar.\n\nSe você não esperava este convite, pode ignorar este e-mail.\n\nCyDef Academy`,
    html: moldura(`<p style="margin:0 0 12px;font-size:16px">Olá!</p>
<p ${P}><strong style="color:#f5f5f4">${escaparHtml(quem)}</strong> convidou você para a CyDef Academy pela <strong style="color:#f5f5f4">${escaparHtml(empresa)}</strong>. O convite libera ${escaparHtml(alvo)}${fim ? ` até ${fim}` : ""}.</p>
<p ${P}>${escaparHtml(papel)}</p>
<p ${P}>Para aceitar, peça o link de acesso com este e-mail: <strong style="color:#f5f5f4">${escaparHtml(d.to)}</strong>. O convite aparece logo depois de entrar.</p>
${botao(entrar, "Ir para a Academy")}
<p ${NOTA}>Se você não esperava este convite, pode ignorar este e-mail.</p>`),
  };
}
