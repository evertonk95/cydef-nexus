/**
 * Consentimento LGPD versionado (HEL-M01 / SEC-001..SEC-003).
 * O servidor é a única fonte de verdade da versão do aviso: o contrato não
 * aceita `versao_aviso`; o registro é carimbado (server-stamped) com a versão
 * vigente + hash SHA-256 do conteúdo + relógio do servidor.
 * URL estável e imutável por versão: /academy/privacidade/v<versão>.
 */

export interface AvisoPrivacidade {
  versao: string;
  texto: string;
  urlEstavel: string;
  publicadoEm: string;
}

/**
 * Fonte de verdade local das versões (espelho da tabela `aviso_privacidade`).
 * O conteúdo publicado de uma versão NUNCA é sobrescrito — nova versão = nova
 * entrada com versão nova (a anterior permanece como histórico).
 *
 * ATENÇÃO (gate de go-live): o texto vigente (v2026.2) é RASCUNHO — o texto
 * final revisado por jurídico/DPO deve substituí-lo antes do go-live
 * (SEC-003), com nova entrada de versão se o conteúdo mudar (imutabilidade
 * preservada). v2026.1 permanece como histórico: registros de consentimento
 * referenciam o hash da versão aceita — nunca sobrescrever conteúdo publicado.
 */
export const AVISOS: Record<string, Omit<AvisoPrivacidade, "versao">> = {
  "v2026.1": {
    urlEstavel: "/academy/privacidade/v2026.1",
    publicadoEm: "2026-08-24T00:00:00Z",
    texto: `# Aviso de Privacidade — CyDef Academy · Pré-inscrição

> **RASCUNHO v2026.1 — aguarda revisão jurídica/DPO antes do go-live.**
> Este texto é a versão de referência para build e testes; o conteúdo final
> publicado pode divergir e, se divergir, receberá nova versão (URL nova),
> preservando a imutabilidade por versão (HEL-M01).

## 1. Quem é o controlador

A CyDef (www.cydef.com.br) é a controladora dos dados pessoais tratados nesta
página de pré-inscrição.

## 2. Quais dados coletamos e para quê

Coletamos apenas: nome completo, e-mail e perfil declarado (iniciante, em
transição para SOC, profissional ativo, estudante ou outro). Finalidade:
processar sua pré-inscrição nos cursos gratuitos de entrada da CyDef Academy,
enviar o e-mail de confirmação (token de validação com validade de 48 horas) e,
se você for selecionado, acompanhar a entrega assistida do curso gratuito.

Não coletamos CPF, dados financeiros, dados sensíveis (art. 5º II, LGPD) nem
conteúdo de mensagens. Esta página é destinada a maiores de 16 anos.

## 3. Base legal

Consentimento (art. 7º I, LGPD), manifestado pelo opt-in explícito e não
pré-marcado. O registro do consentimento (aceite, data/hora, versão deste
aviso, hash do conteúdo e declaração de idade) é armazenado de forma imutável
para comprovação de conformidade.

## 4. Compartilhamento

Não compartilhamos seus dados com terceiros para fins de marketing. O
processamento técnico (armazenamento e envio de e-mail) é feito por provedores
com função de operador, com contratos e medidas de segurança adequadas.

## 5. Retenção

Seus dados serão mantidos durante a fase de validação (pré-inscrição e coorte)
e por até 30 dias após o relatório de decisão GO/NO-GO, salvo obrigação legal.
O registro de consentimento é mantido enquanto o dado associado existir.
Após esse prazo, os dados são descartados ou anonimizados.

## 6. Seus direitos (art. 18–22, LGPD)

Você pode solicitar confirmação, acesso, correção, anonimização, portabilidade,
eliminação ou revogação do consentimento a qualquer momento pelo canal de
direitos: privacidade@cydef.com.br (canal a ser validado no go-live). Também
pode reclamar à ANPD.

## 7. Segurança

Adotamos controles de segurança e privacidade por design: acesso restrito à
base (RLS), registro imutável de consentimento, token de confirmação de uso
único e sem dados pessoais em logs ou métricas.

## 8. Contato do encarregado

privacidade@cydef.com.br — respondemos no prazo legal.

_Última atualização: 2026-08-24 (v2026.1)_`,
  },
  "v2026.2": {
    urlEstavel: "/academy/privacidade/v2026.2",
    publicadoEm: "2026-09-04T00:00:00Z",
    texto: `# Aviso de Privacidade — CyDef Academy · Pré-inscrição

> **RASCUNHO v2026.2 — aguarda revisão jurídica/DPO antes do go-live.**
> Este texto é a versão de referência para build e testes; o conteúdo final
> publicado pode divergir e, se divergir, receberá nova versão (URL nova),
> preservando a imutabilidade por versão (HEL-M01).

## 1. Quem é o controlador

A CyDef (www.cydef.com.br) é a controladora dos dados pessoais tratados nesta
página de pré-inscrição.

## 2. Quais dados coletamos e para quê

Coletamos apenas: nome completo, e-mail e perfil declarado (iniciante, em
transição para SOC, profissional ativo, estudante ou outro). Finalidade:
processar sua pré-inscrição nos cursos gratuitos de entrada da CyDef Academy,
enviar o e-mail de confirmação (token de validação com validade de 48 horas) e,
se você for selecionado, acompanhar a entrega assistida do curso gratuito.

Não coletamos CPF, dados financeiros, dados sensíveis (art. 5º II, LGPD) nem
conteúdo de mensagens. Esta página é destinada a maiores de 16 anos.

## 3. Base legal

Consentimento (art. 7º I, LGPD), manifestado pelo opt-in explícito e não
pré-marcado. O registro do consentimento (aceite, data/hora, versão deste
aviso, hash do conteúdo e declaração de idade) é armazenado de forma imutável
para comprovação de conformidade.

## 4. Compartilhamento

Não compartilhamos seus dados com terceiros para fins de marketing. O
processamento técnico (armazenamento e envio de e-mail) é feito por provedores
com função de operador, com contratos e medidas de segurança adequadas.

## 5. Retenção

Seus dados serão mantidos durante a fase de validação (pré-inscrição e coorte)
e por até 30 dias após o relatório de decisão GO/NO-GO, salvo obrigação legal.
O registro de consentimento é mantido enquanto o dado associado existir.
Após esse prazo, os dados são descartados ou anonimizados.

## 6. Seus direitos (art. 18–22, LGPD)

Você pode solicitar confirmação, acesso, correção, anonimização, portabilidade,
eliminação ou revogação do consentimento a qualquer momento pelo canal de
direitos: contato@cydef.com.br. Também pode reclamar à ANPD.

## 7. Segurança

Adotamos controles de segurança e privacidade por design: acesso restrito à
base (RLS), registro imutável de consentimento, token de confirmação de uso
único e sem dados pessoais em logs ou métricas.

## 8. Contato do encarregado

contato@cydef.com.br — respondemos no prazo legal.

_Última atualização: 2026-09-04 (v2026.2)_`,
  },
};

export function versaoVigente(): string {
  return Object.keys(AVISOS)[Object.keys(AVISOS).length - 1] ?? "v2026.1";
}

export function obterAviso(versao: string): AvisoPrivacidade | undefined {
  const a = AVISOS[versao];
  if (!a) return undefined;
  return { versao, ...a };
}

export async function sha256Hex(texto: string): Promise<string> {
  const data = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Hash do conteúdo servido na URL estável da versão (verificação HEL-M01). */
export function hashDoAviso(versao: string): Promise<string> {
  const aviso = obterAviso(versao);
  if (!aviso) {
    return Promise.reject(new Error(`versao_inexistente: ${versao}`));
  }
  return sha256Hex(aviso.texto);
}
