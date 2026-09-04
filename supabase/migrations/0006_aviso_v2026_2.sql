-- ============================================================================
-- 0006_aviso_v2026_2.sql - Aviso de Privacidade v2026.2 (canal contato@)
--
-- Decisao Everton (04/09/2026, SEC-003/D2): nao ha caixa exclusiva de
-- privacidade/DPO; o canal oficial passa a ser contato@cydef.com.br em todos
-- os documentos legais do site (Politica de Privacidade + Aviso da
-- pre-inscricao da Academy).
--
-- HEL-M01: conteudo publicado e imutavel. v2026.1 (rascunho) permanece como
-- historico (vigente=false) com o conteudo original; o texto com o novo canal
-- ganha nova versao v2026.2 (URL nova). Aditiva e compativel: nada de versoes
-- anteriores e alterado ou removido.
-- ============================================================================

-- v2026.1 deixa de ser a versao vigente (conteudo permanece intacto).
update public.aviso_privacidade
   set vigente = false
 where versao = 'v2026.1';

-- v2026.2 - texto de referencia (RASCUNHO; gate juridico/DPO SEC-003).
-- O hash e calculado pelo trigger a partir do conteudo armazenado; o conteudo
-- deve ser IDENTICO ao de AVISOS["v2026.2"] em src/lib/academy/consent.ts
-- (verificado por src/lib/academy/migration-consistency.test.ts).
insert into public.aviso_privacidade (versao, conteudo, url_estavel, vigente)
values (
  'v2026.2',
  E'# Aviso de Privacidade — CyDef Academy · Pré-inscrição\n\n> **RASCUNHO v2026.2 — aguarda revisão jurídica/DPO antes do go-live.**\n> Este texto é a versão de referência para build e testes; o conteúdo final\n> publicado pode divergir e, se divergir, receberá nova versão (URL nova),\n> preservando a imutabilidade por versão (HEL-M01).\n\n## 1. Quem é o controlador\n\nA CyDef (www.cydef.com.br) é a controladora dos dados pessoais tratados nesta\npágina de pré-inscrição.\n\n## 2. Quais dados coletamos e para quê\n\nColetamos apenas: nome completo, e-mail e perfil declarado (iniciante, em\ntransição para SOC, profissional ativo, estudante ou outro). Finalidade:\nprocessar sua pré-inscrição nos cursos gratuitos de entrada da CyDef Academy,\nenviar o e-mail de confirmação (token de validação com validade de 48 horas) e,\nse você for selecionado, acompanhar a entrega assistida do curso gratuito.\n\nNão coletamos CPF, dados financeiros, dados sensíveis (art. 5º II, LGPD) nem\nconteúdo de mensagens. Esta página é destinada a maiores de 16 anos.\n\n## 3. Base legal\n\nConsentimento (art. 7º I, LGPD), manifestado pelo opt-in explícito e não\npré-marcado. O registro do consentimento (aceite, data/hora, versão deste\naviso, hash do conteúdo e declaração de idade) é armazenado de forma imutável\npara comprovação de conformidade.\n\n## 4. Compartilhamento\n\nNão compartilhamos seus dados com terceiros para fins de marketing. O\nprocessamento técnico (armazenamento e envio de e-mail) é feito por provedores\ncom função de operador, com contratos e medidas de segurança adequadas.\n\n## 5. Retenção\n\nSeus dados serão mantidos durante a fase de validação (pré-inscrição e coorte)\ne por até 30 dias após o relatório de decisão GO/NO-GO, salvo obrigação legal.\nO registro de consentimento é mantido enquanto o dado associado existir.\nApós esse prazo, os dados são descartados ou anonimizados.\n\n## 6. Seus direitos (art. 18–22, LGPD)\n\nVocê pode solicitar confirmação, acesso, correção, anonimização, portabilidade,\neliminação ou revogação do consentimento a qualquer momento pelo canal de\ndireitos: contato@cydef.com.br. Também pode reclamar à ANPD.\n\n## 7. Segurança\n\nAdotamos controles de segurança e privacidade por design: acesso restrito à\nbase (RLS), registro imutável de consentimento, token de confirmação de uso\núnico e sem dados pessoais em logs ou métricas.\n\n## 8. Contato do encarregado\n\ncontato@cydef.com.br — respondemos no prazo legal.\n\n_Última atualização: 2026-09-04 (v2026.2)_',
  '/academy/privacidade/v2026.2',
  true
)
on conflict (versao) do nothing;
