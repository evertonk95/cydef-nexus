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
 * Versão vigente: v2026.6 (20/11/2026), que acrescenta à v2026.5 as missões
 * práticas (fase 15): o que cada tentativa guarda, e que a gestão da empresa
 * não as vê. v2026.5 (20/11/2026) acrescentou o acesso contratado por
 * empresas, o que a gestão da empresa vê e os avisos de vencimento (fase 17). v2026.4 (20/11/2026) acrescentou a compra pela
 * Hotmart e o acesso pago (fase 16). v2026.3 (17/11/2026) cobria a
 * pré-inscrição e o portal do aluno (conta, progresso, questões, avaliações e
 * certificado). v2026.1 e v2026.2 (rascunhos) permanecem como histórico:
 * registros de consentimento referenciam o hash da versão aceita. Nunca
 * sobrescrever conteúdo publicado; mudança de texto = nova versão (HEL-M01).
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
  "v2026.3": {
    urlEstavel: "/academy/privacidade/v2026.3",
    publicadoEm: "2026-11-17T00:00:00Z",
    texto: `# Aviso de Privacidade: CyDef Academy

Este aviso explica como a CyDef trata os seus dados pessoais na CyDef Academy, tanto na pré-inscrição pelo site (www.cydef.com.br/academy) quanto no portal do aluno (academy.cydef.com.br). Ele complementa a Política de Privacidade do site (www.cydef.com.br/privacidade).

## 1. Quem é o controlador

A CyDef (www.cydef.com.br) é a controladora dos dados pessoais tratados na CyDef Academy, nos termos da Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018). O contato do encarregado está no item 12.

## 2. Quais dados tratamos

2.1. Pré-inscrição: Nome completo, e-mail e perfil declarado (iniciante, em transição para SOC, profissional ativo, estudante ou outro), além do registro do seu consentimento: aceite, data e hora, versão deste aviso, código de verificação do texto aceito e declaração de idade.

2.2. Conta de aluno: Identificador interno, nome, e-mail, data de criação da conta e data do último acesso. O acesso ao portal é feito por um link enviado ao seu e-mail, sem senha.

2.3. Estudo e progresso: Cursos em que você está matriculado, aulas iniciadas e concluídas, o ponto em que você parou em cada vídeo e os dias em que estudou.

2.4. Questões, avaliações e certificado: Respostas e notas das questões de cada módulo e da avaliação final. Quando você conclui um curso com a nota mínima exigida, emitimos um certificado com seu nome, o curso, a carga horária, a data de conclusão e um código de validação.

2.5. Segurança: Para evitar abuso, como tentativas automatizadas e envio em massa de links, usamos uma verificação antirrobô e limites de tentativas. O endereço IP e o e-mail usados nesse controle são convertidos em um código irreversível, gerado com chave secreta, e não ficam guardados em texto. Os provedores de infraestrutura mantêm registros técnicos de acesso.

Não tratamos CPF, dados de pagamento nem dados pessoais sensíveis (art. 5º, II, da LGPD) na CyDef Academy. Se um curso futuro exigir outros dados, este aviso ganhará uma nova versão antes disso.

## 3. Para que usamos e com qual base legal

• Processar a pré-inscrição e enviar o e-mail de confirmação: consentimento (art. 7º, I), manifestado no aceite não pré-marcado da pré-inscrição.
• Criar e manter sua conta, enviar o link de acesso, registrar seu progresso, corrigir questões e avaliações e emitir o certificado: execução de contrato ou de procedimentos preliminares, a seu pedido (art. 7º, V).
• Permitir que outras pessoas confirmem a autenticidade do seu certificado, quando você compartilhar o código de validação: execução de contrato (art. 7º, V).
• Proteger o portal contra fraude, abuso e ataques: legítimo interesse (art. 7º, IX).
• Guardar os registros de acesso à aplicação pelo prazo legal: cumprimento de obrigação legal (art. 7º, II, e art. 15 do Marco Civil da Internet).

Não enviamos e-mails de divulgação sem o seu consentimento específico e não usamos seus dados para finalidades incompatíveis com as descritas acima.

## 4. Certificado e validação pública

O certificado traz um código de validação. Quem tiver esse código pode confirmar, em uma página pública da CyDef, que o certificado é autêntico. A página mostra apenas o seu nome, o curso, a carga horária e a data de conclusão, e só pode ser consultada com o código. Você pode pedir a desativação da validação pública pelo canal do item 11.

## 5. Com quem compartilhamos

Não vendemos seus dados e não os compartilhamos para marketing de terceiros. Para operar a Academy, usamos provedores que tratam dados em nosso nome (operadores), com obrigações contratuais de segurança e confidencialidade:

• Supabase: banco de dados, autenticação e funções do servidor;
• Cloudflare: hospedagem do portal, DNS, proteção de rede e verificação antirrobô (Turnstile);
• Resend: envio dos e-mails da Academy, como o link de acesso;
• GitHub: hospedagem do site institucional;
• Provedores de vídeo, como o YouTube em modo de privacidade aprimorada, para exibir as aulas. Ao assistir, o provedor pode coletar dados técnicos do seu navegador, conforme a política dele.

Também podemos compartilhar dados com autoridades públicas quando a lei ou uma ordem judicial exigir.

## 6. Transferência internacional

Alguns desses provedores processam ou armazenam dados fora do Brasil. Nesses casos, a transferência é feita nas hipóteses do art. 33 da LGPD, com garantias de proteção compatíveis com a lei brasileira.

## 7. Armazenamento no navegador

O portal guarda a sua sessão no armazenamento local do navegador, para que você não precise pedir um link novo a cada visita. Ao sair da conta pelo botão Sair, a sessão é apagada do navegador. Não usamos cookies de publicidade nem rastreamento entre sites.

## 8. Retenção: por quanto tempo guardamos

• Pré-inscrição sem conta criada: até 12 meses após o último contato, ou até você pedir a exclusão;
• Conta, progresso, questões e avaliações: enquanto a conta estiver ativa. Contas sem acesso por 24 meses são eliminadas ou anonimizadas, com aviso prévio por e-mail;
• Certificado e código de validação: mantidos para que o certificado continue verificável, até que você peça a remoção;
• Registro de consentimento: enquanto existir o dado associado e pelo prazo necessário para comprovar a regularidade do tratamento;
• Registros de acesso à aplicação: 6 meses (art. 15 do Marco Civil da Internet);
• Controle antirrobô e limites de tentativas: apenas pelo tempo necessário a esse controle.

Ao fim de cada prazo, os dados são eliminados ou anonimizados, salvo obrigação legal de guarda.

## 9. Segurança

Adotamos privacidade desde a concepção: acesso por link de uso único, válido por 60 minutos e sem senha; isolamento dos dados no banco, para que cada aluno acesse apenas os próprios dados; conexões criptografadas (HTTPS); segredos guardados apenas nos provedores; e registros técnicos sem dados pessoais em texto aberto sempre que possível.

## 10. Idade mínima

A CyDef Academy é destinada a maiores de 16 anos.

## 11. Seus direitos (arts. 18 a 22 da LGPD)

Você pode pedir, a qualquer momento: confirmação da existência de tratamento; acesso aos dados; correção de dados incompletos, inexatos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos; portabilidade; eliminação dos dados tratados com base no consentimento; informação sobre com quem compartilhamos; e revogação do consentimento.

Envie o pedido para contato@cydef.com.br com o assunto "LGPD: Solicitação de titular". Respondemos em até 15 dias. Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).

A eliminação da conta encerra o acesso aos cursos e ao histórico de estudo, e desativa a validação dos certificados emitidos.

## 12. Encarregado pelo tratamento de dados

contato@cydef.com.br

## 13. Mudanças neste aviso

Cada versão deste aviso tem endereço próprio e não é alterada depois de publicada. Quando houver mudança relevante, publicamos uma nova versão e avisamos por e-mail quem tem conta na Academy.

Última atualização: 17 de novembro de 2026 (v2026.3)`,
  },
  "v2026.4": {
    urlEstavel: "/academy/privacidade/v2026.4",
    publicadoEm: "2026-11-20T00:00:00Z",
    texto: `# Aviso de Privacidade: CyDef Academy

Este aviso explica como a CyDef trata os seus dados pessoais na CyDef Academy, na pré-inscrição pelo site (www.cydef.com.br/academy), no portal do aluno (academy.cydef.com.br) e na compra de cursos pela Hotmart. Ele complementa a Política de Privacidade do site (www.cydef.com.br/privacidade).

## 1. Quem é o controlador

A CyDef (www.cydef.com.br) é a controladora dos dados pessoais tratados na CyDef Academy, nos termos da Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018). O contato do encarregado está no item 12.

## 2. Quais dados tratamos

2.1. Pré-inscrição: Nome completo, e-mail e perfil declarado (iniciante, em transição para SOC, profissional ativo, estudante ou outro), além do registro do seu consentimento: aceite, data e hora, versão deste aviso, código de verificação do texto aceito e declaração de idade.

2.2. Conta de aluno: Identificador interno, nome, e-mail, data de criação da conta e data do último acesso. O acesso ao portal é feito por um link enviado ao seu e-mail, sem senha. Se você comprou um curso sem ter feito a pré-inscrição, a conta é criada com o nome e o e-mail informados na compra.

2.3. Estudo e progresso: Cursos em que você está matriculado, aulas iniciadas e concluídas, o ponto em que você parou em cada vídeo e os dias em que estudou.

2.4. Questões, avaliações e certificado: Respostas e notas das questões de cada módulo e da avaliação final. Quando você conclui um curso com a nota mínima exigida, emitimos um certificado com seu nome, o curso, a carga horária, a data de conclusão e um código de validação.

2.5. Compra e acesso pago: Quando você compra um curso, uma trilha ou o acesso à plataforma pela Hotmart, ela nos informa o número da transação, o produto comprado, seu nome, seu e-mail, a situação da compra (aprovada, reembolsada, contestada ou cancelada) e a data. Com isso, registramos o acesso liberado: o que ele cobre, desde quando e até quando vale. Também registramos os acessos liberados diretamente pela CyDef, como cortesias e parcerias, com o motivo da liberação. Não recebemos dados de pagamento, como cartão, boleto, Pix, CPF ou endereço: eles ficam com a Hotmart.

2.6. Segurança: Para evitar abuso, como tentativas automatizadas e envio em massa de links, usamos uma verificação antirrobô e limites de tentativas. O endereço IP e o e-mail usados nesse controle são convertidos em um código irreversível, gerado com chave secreta, e não ficam guardados em texto. Os provedores de infraestrutura mantêm registros técnicos de acesso.

Não tratamos CPF, dados de pagamento nem dados pessoais sensíveis (art. 5º, II, da LGPD) na CyDef Academy. Se um curso futuro exigir outros dados, este aviso ganhará uma nova versão antes disso.

## 3. Para que usamos e com qual base legal

• Processar a pré-inscrição e enviar o e-mail de confirmação: consentimento (art. 7º, I), manifestado no aceite não pré-marcado da pré-inscrição.
• Criar e manter sua conta, enviar o link de acesso, registrar seu progresso, corrigir questões e avaliações e emitir o certificado: execução de contrato ou de procedimentos preliminares, a seu pedido (art. 7º, V).
• Liberar o acesso comprado, mantê-lo pelo período contratado, encerrá-lo em caso de reembolso, contestação ou cancelamento e avisar você por e-mail quando o acesso for liberado ou encerrado: execução de contrato (art. 7º, V).
• Guardar o registro das compras e dos acessos depois que eles terminam, para responder a pedidos de reembolso e contestações: exercício regular de direitos (art. 7º, VI).
• Permitir que outras pessoas confirmem a autenticidade do seu certificado, quando você compartilhar o código de validação: execução de contrato (art. 7º, V).
• Proteger o portal contra fraude, abuso e ataques: legítimo interesse (art. 7º, IX).
• Guardar os registros de acesso à aplicação pelo prazo legal: cumprimento de obrigação legal (art. 7º, II, e art. 15 do Marco Civil da Internet).

Não enviamos e-mails de divulgação sem o seu consentimento específico e não usamos seus dados para finalidades incompatíveis com as descritas acima.

## 4. Certificado e validação pública

O certificado traz um código de validação. Quem tiver esse código pode confirmar, em uma página pública da CyDef, que o certificado é autêntico. A página mostra apenas o seu nome, o curso, a carga horária e a data de conclusão, e só pode ser consultada com o código. Você pode pedir a desativação da validação pública pelo canal do item 11.

## 5. Com quem compartilhamos

Não vendemos seus dados e não os compartilhamos para marketing de terceiros.

A compra dos cursos pagos é feita na Hotmart. Ela trata os dados de pagamento, parcelamento, nota fiscal e reembolso como controladora, conforme a política de privacidade dela, e nos repassa apenas os dados do item 2.5. Recibos, cobranças e reembolsos são enviados e resolvidos pela Hotmart.

Para operar a Academy, usamos provedores que tratam dados em nosso nome (operadores), com obrigações contratuais de segurança e confidencialidade:

• Supabase: banco de dados, autenticação e funções do servidor;
• Cloudflare: hospedagem do portal, DNS, proteção de rede e verificação antirrobô (Turnstile);
• Resend: envio dos e-mails da Academy, como o link de acesso;
• GitHub: hospedagem do site institucional;
• Provedores de vídeo, como o YouTube em modo de privacidade aprimorada, para exibir as aulas. Ao assistir, o provedor pode coletar dados técnicos do seu navegador, conforme a política dele.

Também podemos compartilhar dados com autoridades públicas quando a lei ou uma ordem judicial exigir.

## 6. Transferência internacional

Alguns desses provedores processam ou armazenam dados fora do Brasil. Nesses casos, a transferência é feita nas hipóteses do art. 33 da LGPD, com garantias de proteção compatíveis com a lei brasileira.

## 7. Armazenamento no navegador

O portal guarda a sua sessão no armazenamento local do navegador, para que você não precise pedir um link novo a cada visita. Ao sair da conta pelo botão Sair, a sessão é apagada do navegador. Não usamos cookies de publicidade nem rastreamento entre sites.

## 8. Retenção: por quanto tempo guardamos

• Pré-inscrição sem conta criada: até 12 meses após o último contato, ou até você pedir a exclusão;
• Conta, progresso, questões e avaliações: enquanto a conta estiver ativa. Contas sem acesso por 24 meses são eliminadas ou anonimizadas, com aviso prévio por e-mail, exceto enquanto houver acesso pago em vigor;
• Registro de compras e de acessos pagos: enquanto o acesso estiver em vigor e por até 5 anos depois que ele terminar, para responder a pedidos de reembolso e contestações;
• Avisos de compra recebidos da Hotmart: 5 anos, pelo mesmo motivo;
• Certificado e código de validação: mantidos para que o certificado continue verificável, até que você peça a remoção;
• Registro de consentimento: enquanto existir o dado associado e pelo prazo necessário para comprovar a regularidade do tratamento;
• Registros de acesso à aplicação: 6 meses (art. 15 do Marco Civil da Internet);
• Controle antirrobô e limites de tentativas: apenas pelo tempo necessário a esse controle.

Ao fim de cada prazo, os dados são eliminados ou anonimizados, salvo obrigação legal de guarda.

## 9. Segurança

Adotamos privacidade desde a concepção: acesso por link de uso único, válido por 60 minutos e sem senha; isolamento dos dados no banco, para que cada aluno acesse apenas os próprios dados; conexões criptografadas (HTTPS); segredos guardados apenas nos provedores; e registros técnicos sem dados pessoais em texto aberto sempre que possível.

## 10. Idade mínima

A CyDef Academy é destinada a maiores de 16 anos.

## 11. Seus direitos (arts. 18 a 22 da LGPD)

Você pode pedir, a qualquer momento: confirmação da existência de tratamento; acesso aos dados; correção de dados incompletos, inexatos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos; portabilidade; eliminação dos dados tratados com base no consentimento; informação sobre com quem compartilhamos; e revogação do consentimento.

Envie o pedido para contato@cydef.com.br com o assunto "LGPD: Solicitação de titular". Respondemos em até 15 dias. Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).

A eliminação da conta encerra o acesso aos cursos, inclusive os comprados, e ao histórico de estudo, e desativa a validação dos certificados emitidos. Pedidos de reembolso são feitos na Hotmart, nos prazos dela.

## 12. Encarregado pelo tratamento de dados

contato@cydef.com.br

## 13. Mudanças neste aviso

Cada versão deste aviso tem endereço próprio e não é alterada depois de publicada. Quando houver mudança relevante, publicamos uma nova versão e avisamos por e-mail quem tem conta na Academy.

Última atualização: 20 de novembro de 2026 (v2026.4)`,
  },
  "v2026.5": {
    urlEstavel: "/academy/privacidade/v2026.5",
    publicadoEm: "2026-11-20T12:00:00Z",
    texto: `# Aviso de Privacidade: CyDef Academy

Este aviso explica como a CyDef trata os seus dados pessoais na CyDef Academy, na pré-inscrição pelo site (www.cydef.com.br/academy), no portal do aluno (academy.cydef.com.br), na compra de cursos pela Hotmart e no acesso contratado por empresas para as suas equipes. Ele complementa a Política de Privacidade do site (www.cydef.com.br/privacidade).

## 1. Quem é o controlador

A CyDef (www.cydef.com.br) é a controladora dos dados pessoais tratados na CyDef Academy, nos termos da Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018). O contato do encarregado está no item 12.

## 2. Quais dados tratamos

2.1. Pré-inscrição: Nome completo, e-mail e perfil declarado (iniciante, em transição para SOC, profissional ativo, estudante ou outro), além do registro do seu consentimento: aceite, data e hora, versão deste aviso, código de verificação do texto aceito e declaração de idade.

2.2. Conta de aluno: Identificador interno, nome, e-mail, data de criação da conta e data do último acesso. O acesso ao portal é feito por um link enviado ao seu e-mail, sem senha. Se você comprou um curso sem ter feito a pré-inscrição, a conta é criada com o nome e o e-mail informados na compra. Se você foi convidado por uma empresa, a conta é criada com o e-mail do convite.

2.3. Estudo e progresso: Cursos em que você está matriculado, aulas iniciadas e concluídas, o ponto em que você parou em cada vídeo e os dias em que estudou.

2.4. Questões, avaliações e certificado: Respostas e notas das questões de cada módulo e da avaliação final. Quando você conclui um curso com a nota mínima exigida, emitimos um certificado com seu nome, o curso, a carga horária, a data de conclusão e um código de validação.

2.5. Compra e acesso pago: Quando você compra um curso, uma trilha ou o acesso à plataforma pela Hotmart, ela nos informa o número da transação, o produto comprado, seu nome, seu e-mail, a situação da compra (aprovada, reembolsada, contestada ou cancelada) e a data. Com isso, registramos o acesso liberado: o que ele cobre, desde quando e até quando vale. Também registramos os acessos liberados diretamente pela CyDef, como cortesias e parcerias, com o motivo da liberação. Não recebemos dados de pagamento, como cartão, boleto, Pix, CPF ou endereço: eles ficam com a Hotmart.

2.6. Acesso pela sua empresa: Quando uma empresa contrata a CyDef Academy para a equipe, registramos o nome da empresa, o que o contrato libera, as datas de início e de fim, o número de vagas, os e-mails convidados, quem convidou e quem cuida da gestão. Quando você aceita o convite, registramos a data do aceite e a versão deste aviso. Enquanto você fizer parte da empresa e o contrato estiver em vigor, as pessoas da gestão da empresa veem, apenas nos cursos do contrato: seu nome e seu e-mail, as aulas que você concluiu em cada curso, se você foi aprovado na avaliação final, os certificados emitidos e a data do seu último acesso. Elas não veem suas notas, suas respostas nem os cursos que não fazem parte do contrato. Você é informado disso antes de aceitar o convite e pode sair da empresa a qualquer momento, em Minha conta. Quando você sai, é removido pela empresa ou o contrato termina, a gestão deixa de ver o seu progresso, e a sua conta, o progresso e os certificados continuam com você.

2.7. Segurança: Para evitar abuso, como tentativas automatizadas e envio em massa de links, usamos uma verificação antirrobô e limites de tentativas. O endereço IP e o e-mail usados nesse controle são convertidos em um código irreversível, gerado com chave secreta, e não ficam guardados em texto. Os provedores de infraestrutura mantêm registros técnicos de acesso.

Não tratamos CPF, dados de pagamento nem dados pessoais sensíveis (art. 5º, II, da LGPD) na CyDef Academy. Se um curso futuro exigir outros dados, este aviso ganhará uma nova versão antes disso.

## 3. Para que usamos e com qual base legal

• Processar a pré-inscrição e enviar o e-mail de confirmação: consentimento (art. 7º, I), manifestado no aceite não pré-marcado da pré-inscrição.
• Criar e manter sua conta, enviar o link de acesso, registrar seu progresso, corrigir questões e avaliações e emitir o certificado: execução de contrato ou de procedimentos preliminares, a seu pedido (art. 7º, V).
• Liberar o acesso comprado, mantê-lo pelo período contratado, encerrá-lo em caso de reembolso, contestação ou cancelamento e avisar você por e-mail quando o acesso for liberado ou encerrado: execução de contrato (art. 7º, V).
• Avisar você por e-mail antes que um acesso com prazo, como o plano de 12 meses ou o acesso pela empresa, chegue ao fim: execução de contrato (art. 7º, V).
• Liberar o acesso contratado pela empresa, enviar o convite e mostrar às pessoas da gestão o progresso descrito no item 2.6: execução do contrato firmado com a empresa e legítimo interesse dela em acompanhar a capacitação que contratou para a equipe (art. 7º, V e IX), com aviso antes do aceite e a opção de sair a qualquer momento.
• Guardar o registro das compras e dos acessos depois que eles terminam, para responder a pedidos de reembolso e contestações: exercício regular de direitos (art. 7º, VI).
• Permitir que outras pessoas confirmem a autenticidade do seu certificado, quando você compartilhar o código de validação: execução de contrato (art. 7º, V).
• Proteger o portal contra fraude, abuso e ataques: legítimo interesse (art. 7º, IX).
• Guardar os registros de acesso à aplicação pelo prazo legal: cumprimento de obrigação legal (art. 7º, II, e art. 15 do Marco Civil da Internet).

Não enviamos e-mails de divulgação sem o seu consentimento específico e não usamos seus dados para finalidades incompatíveis com as descritas acima.

## 4. Certificado e validação pública

O certificado traz um código de validação. Quem tiver esse código pode confirmar, em uma página pública da CyDef, que o certificado é autêntico. A página mostra apenas o seu nome, o curso, a carga horária e a data de conclusão, e só pode ser consultada com o código. Você pode pedir a desativação da validação pública pelo canal do item 11.

## 5. Com quem compartilhamos

Não vendemos seus dados e não os compartilhamos para marketing de terceiros.

A compra dos cursos pagos é feita na Hotmart. Ela trata os dados de pagamento, parcelamento, nota fiscal e reembolso como controladora, conforme a política de privacidade dela, e nos repassa apenas os dados do item 2.5. Recibos, cobranças e reembolsos são enviados e resolvidos pela Hotmart.

Se você entrou pela sua empresa, compartilhamos com as pessoas da gestão dela apenas o que está no item 2.6. A empresa usa essas informações sob a responsabilidade dela, como controladora, para acompanhar a capacitação da equipe.

Para operar a Academy, usamos provedores que tratam dados em nosso nome (operadores), com obrigações contratuais de segurança e confidencialidade:

• Supabase: banco de dados, autenticação e funções do servidor;
• Cloudflare: hospedagem do portal, DNS, proteção de rede e verificação antirrobô (Turnstile);
• Resend: envio dos e-mails da Academy, como o link de acesso;
• GitHub: hospedagem do site institucional;
• Provedores de vídeo, como o YouTube em modo de privacidade aprimorada, para exibir as aulas. Ao assistir, o provedor pode coletar dados técnicos do seu navegador, conforme a política dele.

Também podemos compartilhar dados com autoridades públicas quando a lei ou uma ordem judicial exigir.

## 6. Transferência internacional

Alguns desses provedores processam ou armazenam dados fora do Brasil. Nesses casos, a transferência é feita nas hipóteses do art. 33 da LGPD, com garantias de proteção compatíveis com a lei brasileira.

## 7. Armazenamento no navegador

O portal guarda a sua sessão no armazenamento local do navegador, para que você não precise pedir um link novo a cada visita. Ao sair da conta pelo botão Sair, a sessão é apagada do navegador. Não usamos cookies de publicidade nem rastreamento entre sites.

## 8. Retenção: por quanto tempo guardamos

• Pré-inscrição sem conta criada: até 12 meses após o último contato, ou até você pedir a exclusão;
• Conta, progresso, questões e avaliações: enquanto a conta estiver ativa. Contas sem acesso por 24 meses são eliminadas ou anonimizadas, com aviso prévio por e-mail, exceto enquanto houver acesso pago em vigor;
• Registro de compras e de acessos pagos: enquanto o acesso estiver em vigor e por até 5 anos depois que ele terminar, para responder a pedidos de reembolso e contestações;
• Avisos de compra recebidos da Hotmart: 5 anos, pelo mesmo motivo;
• Registro de empresas, convites e aceites: enquanto o contrato estiver em vigor e por até 5 anos depois que ele terminar, pelo mesmo motivo;
• Registro dos avisos de vencimento enviados: até 5 anos depois do fim do acesso a que se referem;
• Certificado e código de validação: mantidos para que o certificado continue verificável, até que você peça a remoção;
• Registro de consentimento: enquanto existir o dado associado e pelo prazo necessário para comprovar a regularidade do tratamento;
• Registros de acesso à aplicação: 6 meses (art. 15 do Marco Civil da Internet);
• Controle antirrobô e limites de tentativas: apenas pelo tempo necessário a esse controle.

Ao fim de cada prazo, os dados são eliminados ou anonimizados, salvo obrigação legal de guarda.

## 9. Segurança

Adotamos privacidade desde a concepção: acesso por link de uso único, válido por 60 minutos e sem senha; isolamento dos dados no banco, para que cada aluno acesse apenas os próprios dados; conexões criptografadas (HTTPS); segredos guardados apenas nos provedores; e registros técnicos sem dados pessoais em texto aberto sempre que possível.

## 10. Idade mínima

A CyDef Academy é destinada a maiores de 16 anos.

## 11. Seus direitos (arts. 18 a 22 da LGPD)

Você pode pedir, a qualquer momento: confirmação da existência de tratamento; acesso aos dados; correção de dados incompletos, inexatos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos; portabilidade; eliminação dos dados tratados com base no consentimento; informação sobre com quem compartilhamos; e revogação do consentimento.

Envie o pedido para contato@cydef.com.br com o assunto "LGPD: Solicitação de titular". Respondemos em até 15 dias. Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).

A eliminação da conta encerra o acesso aos cursos, inclusive os comprados e os liberados pela empresa, e ao histórico de estudo, e desativa a validação dos certificados emitidos. Pedidos de reembolso são feitos na Hotmart, nos prazos dela.

## 12. Encarregado pelo tratamento de dados

contato@cydef.com.br

## 13. Mudanças neste aviso

Cada versão deste aviso tem endereço próprio e não é alterada depois de publicada. Quando houver mudança relevante, publicamos uma nova versão e avisamos por e-mail quem tem conta na Academy.

Última atualização: 20 de novembro de 2026 (v2026.5)`,
  },
  "v2026.6": {
    urlEstavel: "/academy/privacidade/v2026.6",
    publicadoEm: "2026-11-20T18:00:00Z",
    texto: `# Aviso de Privacidade: CyDef Academy

Este aviso explica como a CyDef trata os seus dados pessoais na CyDef Academy, na pré-inscrição pelo site (www.cydef.com.br/academy), no portal do aluno (academy.cydef.com.br), na compra de cursos pela Hotmart e no acesso contratado por empresas para as suas equipes. Ele complementa a Política de Privacidade do site (www.cydef.com.br/privacidade).

## 1. Quem é o controlador

A CyDef (www.cydef.com.br) é a controladora dos dados pessoais tratados na CyDef Academy, nos termos da Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018). O contato do encarregado está no item 12.

## 2. Quais dados tratamos

2.1. Pré-inscrição: Nome completo, e-mail e perfil declarado (iniciante, em transição para SOC, profissional ativo, estudante ou outro), além do registro do seu consentimento: aceite, data e hora, versão deste aviso, código de verificação do texto aceito e declaração de idade.

2.2. Conta de aluno: Identificador interno, nome, e-mail, data de criação da conta e data do último acesso. O acesso ao portal é feito por um link enviado ao seu e-mail, sem senha. Se você comprou um curso sem ter feito a pré-inscrição, a conta é criada com o nome e o e-mail informados na compra. Se você foi convidado por uma empresa, a conta é criada com o e-mail do convite.

2.3. Estudo e progresso: Cursos em que você está matriculado, aulas iniciadas e concluídas, o ponto em que você parou em cada vídeo e os dias em que estudou.

2.4. Questões, avaliações e certificado: Respostas e notas das questões de cada módulo e da avaliação final. Quando você conclui um curso com a nota mínima exigida, emitimos um certificado com seu nome, o curso, a carga horária, a data de conclusão e um código de validação. Nas missões práticas, que simulam casos de um SOC, guardamos de cada tentativa as respostas, as evidências que você marcou, a nota, o tempo gasto e a variação das suas competências.

2.5. Compra e acesso pago: Quando você compra um curso, uma trilha ou o acesso à plataforma pela Hotmart, ela nos informa o número da transação, o produto comprado, seu nome, seu e-mail, a situação da compra (aprovada, reembolsada, contestada ou cancelada) e a data. Com isso, registramos o acesso liberado: o que ele cobre, desde quando e até quando vale. Também registramos os acessos liberados diretamente pela CyDef, como cortesias e parcerias, com o motivo da liberação. Não recebemos dados de pagamento, como cartão, boleto, Pix, CPF ou endereço: eles ficam com a Hotmart.

2.6. Acesso pela sua empresa: Quando uma empresa contrata a CyDef Academy para a equipe, registramos o nome da empresa, o que o contrato libera, as datas de início e de fim, o número de vagas, os e-mails convidados, quem convidou e quem cuida da gestão. Quando você aceita o convite, registramos a data do aceite e a versão deste aviso. Enquanto você fizer parte da empresa e o contrato estiver em vigor, as pessoas da gestão da empresa veem, apenas nos cursos do contrato: seu nome e seu e-mail, as aulas que você concluiu em cada curso, se você foi aprovado na avaliação final, os certificados emitidos e a data do seu último acesso. Elas não veem suas notas, suas respostas, as missões práticas nem os cursos que não fazem parte do contrato. Você é informado disso antes de aceitar o convite e pode sair da empresa a qualquer momento, em Minha conta. Quando você sai, é removido pela empresa ou o contrato termina, a gestão deixa de ver o seu progresso, e a sua conta, o progresso e os certificados continuam com você.

2.7. Segurança: Para evitar abuso, como tentativas automatizadas e envio em massa de links, usamos uma verificação antirrobô e limites de tentativas. O endereço IP e o e-mail usados nesse controle são convertidos em um código irreversível, gerado com chave secreta, e não ficam guardados em texto. Os provedores de infraestrutura mantêm registros técnicos de acesso.

Não tratamos CPF, dados de pagamento nem dados pessoais sensíveis (art. 5º, II, da LGPD) na CyDef Academy. Se um curso futuro exigir outros dados, este aviso ganhará uma nova versão antes disso.

## 3. Para que usamos e com qual base legal

• Processar a pré-inscrição e enviar o e-mail de confirmação: consentimento (art. 7º, I), manifestado no aceite não pré-marcado da pré-inscrição.
• Criar e manter sua conta, enviar o link de acesso, registrar seu progresso, corrigir questões, avaliações e missões práticas e emitir o certificado: execução de contrato ou de procedimentos preliminares, a seu pedido (art. 7º, V).
• Liberar o acesso comprado, mantê-lo pelo período contratado, encerrá-lo em caso de reembolso, contestação ou cancelamento e avisar você por e-mail quando o acesso for liberado ou encerrado: execução de contrato (art. 7º, V).
• Avisar você por e-mail antes que um acesso com prazo, como o plano de 12 meses ou o acesso pela empresa, chegue ao fim: execução de contrato (art. 7º, V).
• Liberar o acesso contratado pela empresa, enviar o convite e mostrar às pessoas da gestão o progresso descrito no item 2.6: execução do contrato firmado com a empresa e legítimo interesse dela em acompanhar a capacitação que contratou para a equipe (art. 7º, V e IX), com aviso antes do aceite e a opção de sair a qualquer momento.
• Guardar o registro das compras e dos acessos depois que eles terminam, para responder a pedidos de reembolso e contestações: exercício regular de direitos (art. 7º, VI).
• Permitir que outras pessoas confirmem a autenticidade do seu certificado, quando você compartilhar o código de validação: execução de contrato (art. 7º, V).
• Proteger o portal contra fraude, abuso e ataques: legítimo interesse (art. 7º, IX).
• Guardar os registros de acesso à aplicação pelo prazo legal: cumprimento de obrigação legal (art. 7º, II, e art. 15 do Marco Civil da Internet).

Não enviamos e-mails de divulgação sem o seu consentimento específico e não usamos seus dados para finalidades incompatíveis com as descritas acima.

## 4. Certificado e validação pública

O certificado traz um código de validação. Quem tiver esse código pode confirmar, em uma página pública da CyDef, que o certificado é autêntico. A página mostra apenas o seu nome, o curso, a carga horária e a data de conclusão, e só pode ser consultada com o código. Você pode pedir a desativação da validação pública pelo canal do item 11.

## 5. Com quem compartilhamos

Não vendemos seus dados e não os compartilhamos para marketing de terceiros.

A compra dos cursos pagos é feita na Hotmart. Ela trata os dados de pagamento, parcelamento, nota fiscal e reembolso como controladora, conforme a política de privacidade dela, e nos repassa apenas os dados do item 2.5. Recibos, cobranças e reembolsos são enviados e resolvidos pela Hotmart.

Se você entrou pela sua empresa, compartilhamos com as pessoas da gestão dela apenas o que está no item 2.6. A empresa usa essas informações sob a responsabilidade dela, como controladora, para acompanhar a capacitação da equipe.

Para operar a Academy, usamos provedores que tratam dados em nosso nome (operadores), com obrigações contratuais de segurança e confidencialidade:

• Supabase: banco de dados, autenticação e funções do servidor;
• Cloudflare: hospedagem do portal, DNS, proteção de rede e verificação antirrobô (Turnstile);
• Resend: envio dos e-mails da Academy, como o link de acesso;
• GitHub: hospedagem do site institucional;
• Provedores de vídeo, como o YouTube em modo de privacidade aprimorada, para exibir as aulas. Ao assistir, o provedor pode coletar dados técnicos do seu navegador, conforme a política dele.

Também podemos compartilhar dados com autoridades públicas quando a lei ou uma ordem judicial exigir.

## 6. Transferência internacional

Alguns desses provedores processam ou armazenam dados fora do Brasil. Nesses casos, a transferência é feita nas hipóteses do art. 33 da LGPD, com garantias de proteção compatíveis com a lei brasileira.

## 7. Armazenamento no navegador

O portal guarda a sua sessão no armazenamento local do navegador, para que você não precise pedir um link novo a cada visita. Ao sair da conta pelo botão Sair, a sessão é apagada do navegador. Não usamos cookies de publicidade nem rastreamento entre sites.

## 8. Retenção: por quanto tempo guardamos

• Pré-inscrição sem conta criada: até 12 meses após o último contato, ou até você pedir a exclusão;
• Conta, progresso, questões e avaliações: enquanto a conta estiver ativa. Contas sem acesso por 24 meses são eliminadas ou anonimizadas, com aviso prévio por e-mail, exceto enquanto houver acesso pago em vigor;
• Registro de compras e de acessos pagos: enquanto o acesso estiver em vigor e por até 5 anos depois que ele terminar, para responder a pedidos de reembolso e contestações;
• Avisos de compra recebidos da Hotmart: 5 anos, pelo mesmo motivo;
• Registro de empresas, convites e aceites: enquanto o contrato estiver em vigor e por até 5 anos depois que ele terminar, pelo mesmo motivo;
• Registro dos avisos de vencimento enviados: até 5 anos depois do fim do acesso a que se referem;
• Certificado e código de validação: mantidos para que o certificado continue verificável, até que você peça a remoção;
• Registro de consentimento: enquanto existir o dado associado e pelo prazo necessário para comprovar a regularidade do tratamento;
• Registros de acesso à aplicação: 6 meses (art. 15 do Marco Civil da Internet);
• Controle antirrobô e limites de tentativas: apenas pelo tempo necessário a esse controle.

Ao fim de cada prazo, os dados são eliminados ou anonimizados, salvo obrigação legal de guarda.

## 9. Segurança

Adotamos privacidade desde a concepção: acesso por link de uso único, válido por 60 minutos e sem senha; isolamento dos dados no banco, para que cada aluno acesse apenas os próprios dados; conexões criptografadas (HTTPS); segredos guardados apenas nos provedores; e registros técnicos sem dados pessoais em texto aberto sempre que possível.

## 10. Idade mínima

A CyDef Academy é destinada a maiores de 16 anos.

## 11. Seus direitos (arts. 18 a 22 da LGPD)

Você pode pedir, a qualquer momento: confirmação da existência de tratamento; acesso aos dados; correção de dados incompletos, inexatos ou desatualizados; anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos; portabilidade; eliminação dos dados tratados com base no consentimento; informação sobre com quem compartilhamos; e revogação do consentimento.

Envie o pedido para contato@cydef.com.br com o assunto "LGPD: Solicitação de titular". Respondemos em até 15 dias. Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).

A eliminação da conta encerra o acesso aos cursos, inclusive os comprados e os liberados pela empresa, e ao histórico de estudo, e desativa a validação dos certificados emitidos. Pedidos de reembolso são feitos na Hotmart, nos prazos dela.

## 12. Encarregado pelo tratamento de dados

contato@cydef.com.br

## 13. Mudanças neste aviso

Cada versão deste aviso tem endereço próprio e não é alterada depois de publicada. Quando houver mudança relevante, publicamos uma nova versão e avisamos por e-mail quem tem conta na Academy.

Última atualização: 20 de novembro de 2026 (v2026.6)`,
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
