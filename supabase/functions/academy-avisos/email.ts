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

// ---------------------------------------------------------------------------
// Fase 18: certificado emitido (sempre) e aula nova (só para quem ligou)
// ---------------------------------------------------------------------------

export interface AvisoCertificado {
  chave: string;
  email: string;
  nome: string;
  curso: string;
  curso_slug: string;
  codigo: string;
  carga_horaria_h: number;
  concluido_em: string;
  validacao_publica: boolean;
}

export interface AvisoAulas {
  email: string;
  nome: string;
  curso: string;
  curso_slug: string;
  aulas: { chave: string; numero: number; titulo: string }[];
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CODIGO = /^CYD-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/;

function base(url: string): string {
  return url.replace(/\/+$/, "");
}

function horas(h: number): string {
  const n = Number(h);
  if (!Number.isFinite(n) || n <= 0) return "";
  const t = Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
  return `${t} ${n === 1 ? "hora" : "horas"}`;
}

/** null quando o slug ou o código não têm o formato esperado: nada é enviado. */
export function montarCertificado(c: AvisoCertificado, academyUrl: string): EmailAcademy | null {
  if (!SLUG.test(c.curso_slug) || !CODIGO.test(c.codigo)) return null;
  const s = saudacao(c.nome);
  const curso = linha(c.curso, 100);
  const ch = horas(c.carga_horaria_h);
  const data = dataBr(c.concluido_em);
  const abrir = `${base(academyUrl)}/cursos/${c.curso_slug}/certificado`;
  const validar = `${base(academyUrl)}/certificado/${c.codigo}`;
  const detalhe = [ch && `carga horária de ${ch}`, data && `concluído em ${data}`].filter(Boolean).join(", ");
  return {
    to: c.email,
    subject: linha(`Seu certificado da CyDef Academy: ${curso}`, 140),
    text: `${s.texto}\n\nParabéns! Seu certificado do curso ${curso} foi emitido${detalhe ? ` (${detalhe})` : ""}.\n\nCódigo de validação: ${c.codigo}\n\nAbra, baixe o PDF ou adicione ao LinkedIn: ${abrir}\n${c.validacao_publica ? `\nQuem tiver o código confere o certificado em: ${validar}\n` : ""}\nCyDef Academy`,
    html: moldura(`${s.html}
<p ${P}>Parabéns! Seu certificado do curso <strong style="color:#f5f5f4">${escaparHtml(curso)}</strong> foi emitido${detalhe ? ` (${escaparHtml(detalhe)})` : ""}.</p>
<p ${P}>Código de validação: <strong style="color:#f5f5f4;letter-spacing:0.04em">${c.codigo}</strong></p>
${botao(abrir, "Abrir o certificado")}
<p ${NOTA}>Na página do certificado você baixa o PDF e adiciona ao seu perfil do LinkedIn.${c.validacao_publica ? ` Quem tiver o código confere a autenticidade em <a href="${escaparHtml(validar)}" style="color:#d6d6d6">${escaparHtml(validar.replace(/^https:\/\//, ""))}</a>.` : ""}</p>`),
  };
}

/** Um e-mail por aluno e curso, com as aulas novas daquele curso. */
export function montarAulasNovas(g: AvisoAulas, academyUrl: string): EmailAcademy | null {
  const aulas = g.aulas.filter((a) => Number.isInteger(a.numero) && a.numero > 0).slice(0, 20);
  if (!SLUG.test(g.curso_slug) || aulas.length === 0) return null;
  const s = saudacao(g.nome);
  const curso = linha(g.curso, 100);
  const primeira = aulas[0]!;
  const assistir = `${base(academyUrl)}/cursos/${g.curso_slug}/aulas/${primeira.numero}`;
  const conta = `${base(academyUrl)}/conta`;
  // Sem número: o portal conta as aulas dentro do módulo, e o número que vem
  // do banco é o do endereço (contado no curso inteiro).
  const rotulo = (a: { numero: number; titulo: string }) => linha(a.titulo, 140);
  const assunto = aulas.length === 1 ? `Aula nova em ${curso}: ${linha(primeira.titulo, 80)}` : `${aulas.length} aulas novas em ${curso}`;
  const sair = "Você recebe este aviso porque ligou o aviso de aula nova em Minha conta. Para não receber mais, desligue no mesmo lugar.";
  return {
    to: g.email,
    subject: linha(assunto, 140),
    text: `${s.texto}\n\n${aulas.length === 1 ? "Saiu aula nova" : "Saíram aulas novas"} no curso ${curso}:\n\n${aulas.map((a) => `- ${rotulo(a)}`).join("\n")}\n\nAssistir: ${assistir}\n\n${sair} ${conta}\n\nCyDef Academy`,
    html: moldura(`${s.html}
<p ${P}>${aulas.length === 1 ? "Saiu aula nova" : "Saíram aulas novas"} no curso <strong style="color:#f5f5f4">${escaparHtml(curso)}</strong>:</p>
<ul style="margin:0 0 24px;padding-left:20px;font-size:15px;line-height:1.7;color:#d6d6d6">${aulas.map((a) => `<li>${escaparHtml(rotulo(a))}</li>`).join("")}</ul>
${botao(assistir, aulas.length === 1 ? "Assistir à aula" : "Assistir à primeira")}
<p ${NOTA}>${sair} <a href="${escaparHtml(conta)}" style="color:#d6d6d6">Minha conta</a></p>`),
  };
}

// ---------------------------------------------------------------------------
// Fase 27: nova versão do Aviso de Privacidade (uma vez por conta e por versão)
// ---------------------------------------------------------------------------

export interface AvisoPrivacidade {
  chave: string;
  email: string;
  nome: string;
  versao: string;
  publicado_em: string;
  /** Endereço estável da versão, relativo ao site: /academy/privacidade/v2026.9 */
  url: string;
  /** Uma mudança por linha, como cadastrada em aviso_privacidade_comunicado. */
  resumo: string;
}

const VERSAO = /^v[0-9]{4}\.[0-9]{1,3}$/;
const URL_AVISO = /^\/academy\/privacidade\/v[0-9]{4}\.[0-9]{1,3}$/;

/** null quando a versão ou o endereço não têm o formato esperado, ou não há resumo: nada é enviado. */
export function montarPrivacidade(a: AvisoPrivacidade, siteUrl = "https://www.cydef.com.br"): EmailAcademy | null {
  if (!VERSAO.test(a.versao) || !URL_AVISO.test(a.url) || a.chave !== `privacidade:${a.versao}`) return null;
  const mudancas = a.resumo
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((x) => x.slice(0, 400));
  if (mudancas.length === 0) return null;
  const s = saudacao(a.nome);
  const data = dataBr(a.publicado_em);
  const ler = `${base(siteUrl)}/pt${a.url}/`;
  const vigor = `A versão em vigor agora é a ${a.versao}${data ? `, de ${data}` : ""}.`;
  const resto = "O restante continua igual: não recebemos dados de pagamento, não enviamos e-mails de divulgação sem o seu consentimento e você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento.";
  const contato = 'Para dúvidas ou pedidos sobre os seus dados, escreva para contato@cydef.com.br com o assunto "LGPD: Solicitação de titular".';
  return {
    to: a.email,
    subject: "Atualizamos o Aviso de Privacidade da CyDef Academy",
    text: `${s.texto}\n\nAtualizamos o Aviso de Privacidade da CyDef Academy. ${vigor}\n\nO que mudou:\n\n${mudancas.map((m) => `- ${m}`).join("\n\n")}\n\n${resto}\n\nTexto completo: ${ler}\n\n${contato}\n\nCyDef Academy`,
    html: moldura(`${s.html}
<p ${P}>Atualizamos o Aviso de Privacidade da CyDef Academy. ${escaparHtml(vigor)}</p>
<p ${P}>O que mudou:</p>
<ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.7;color:#d6d6d6">${mudancas.map((m) => `<li style="margin-bottom:8px">${escaparHtml(m)}</li>`).join("")}</ul>
<p ${P}>${escaparHtml(resto)}</p>
${botao(ler, "Ler o aviso completo")}
<p ${NOTA}>${escaparHtml(contato)}</p>`),
  };
}
