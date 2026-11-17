-- ============================================================================
-- 0009_academy_catalogo_inicial.sql - Catálogo inicial da CyDef Academy
--
-- Estrutura dos dois cursos gratuitos (conteúdo programático de 11/09/2026),
-- da Formação Analista SOC e da trilha de Fundamentos, mais as competências
-- e o mapa aula x competência usado no painel do aluno.
--
-- TUDO ENTRA COMO NÃO PUBLICADO (publicado = false): as aulas ainda não foram
-- gravadas. A publicação é uma decisão do Everton, curso a curso, quando o
-- vídeo existir (ver academy/README.md, seção "Publicar conteúdo").
--
-- Idempotente: pode rodar de novo sem duplicar nada.
-- ============================================================================

insert into public.competencias (slug, titulo, ordem) values
  ('fundamentos-seguranca', 'Fundamentos de segurança', 1),
  ('redes-protocolos',      'Redes e protocolos',       2),
  ('analise-logs',          'Análise de logs',          3),
  ('triagem-alertas',       'Triagem de alertas',       4),
  ('mitre-attack',          'MITRE ATT&CK',             5),
  ('resposta-incidentes',   'Resposta a incidentes',    6)
on conflict (slug) do nothing;

insert into public.formacoes (slug, titulo, descricao, ordem, publicado) values
  ('analista-soc', 'Formação Analista SOC',
   'Do primeiro contato com segurança até a rotina de um analista de SOC: fundamentos, logs e SIEM, investigação e resposta.',
   1, false)
on conflict (slug) do nothing;

insert into public.trilhas (slug, formacao_slug, titulo, descricao, ordem, publicado) values
  ('fundamentos', 'analista-soc', 'Fundamentos',
   'A base de segurança da informação e o funcionamento de um SOC, com os dois cursos gratuitos da Academy.',
   1, false)
on conflict (slug) do nothing;

insert into public.cursos (slug, titulo, descricao, nivel, gratuito, publicado, ordem) values
  ('cybersecurity-fundamentals', 'Cybersecurity Fundamentals',
   'Base de segurança da informação para o dia a dia: princípios, redes, criptografia aplicada, ameaças comuns e boas práticas.',
   'iniciante', true, false, 1),
  ('fundamentos-para-soc', 'Fundamentos para SOC',
   'Como funciona um Centro de Operações de Segurança: papéis, sinais e dados, SIEM, triagem de alertas e uma rotina completa de phishing.',
   'iniciante', true, false, 2)
on conflict (slug) do nothing;

insert into public.trilha_cursos (trilha_slug, curso_slug, ordem) values
  ('fundamentos', 'cybersecurity-fundamentals', 1),
  ('fundamentos', 'fundamentos-para-soc', 2)
on conflict do nothing;

-- Módulos ----------------------------------------------------------------------
insert into public.modulos (curso_slug, ordem, titulo) values
  ('cybersecurity-fundamentals', 1, 'Princípios de segurança'),
  ('cybersecurity-fundamentals', 2, 'Redes e protocolos essenciais'),
  ('cybersecurity-fundamentals', 3, 'Criptografia aplicada'),
  ('cybersecurity-fundamentals', 4, 'Ameaças e vulnerabilidades'),
  ('cybersecurity-fundamentals', 5, 'Boas práticas'),
  ('fundamentos-para-soc', 1, 'O SOC por dentro'),
  ('fundamentos-para-soc', 2, 'Sinais e dados'),
  ('fundamentos-para-soc', 3, 'Triagem de alertas'),
  ('fundamentos-para-soc', 4, 'Prática guiada')
on conflict (curso_slug, ordem) do nothing;

-- Aulas (duração planejada no conteúdo programático) -----------------------------
insert into public.aulas (modulo_id, ordem, numero, titulo, resumo, duracao_seg, publicado)
select m.id, v.ordem, v.numero, v.titulo, v.resumo, v.minutos * 60, false
  from (values
    ('cybersecurity-fundamentals', 1, 1,  1, 'Confidencialidade, integridade e disponibilidade', 'O vocabulário que sustenta todo o resto do curso.', 17),
    ('cybersecurity-fundamentals', 1, 2,  2, 'Risco, ameaça, vulnerabilidade e impacto', 'Quatro termos que quase todo mundo usa como sinônimo, e por que não são.', 17),
    ('cybersecurity-fundamentals', 1, 3,  3, 'Defesa em profundidade e menor privilégio', 'Por que uma camada só nunca basta.', 16),
    ('cybersecurity-fundamentals', 2, 1,  4, 'Como os dados viajam: pacotes, portas e endereços', 'O caminho de um clique, sem mistério.', 18),
    ('cybersecurity-fundamentals', 2, 2,  5, 'TCP, UDP e o que cada um promete', 'Como a escolha do protocolo muda o comportamento e a segurança.', 17),
    ('cybersecurity-fundamentals', 2, 3,  6, 'DNS, HTTP e HTTPS na prática', 'O que acontece antes de a página abrir.', 18),
    ('cybersecurity-fundamentals', 2, 4,  7, 'Firewall, proxy e segmentação', 'O que cada controle vê, e o que ele deixa passar.', 17),
    ('cybersecurity-fundamentals', 3, 1,  8, 'Simétrica e assimétrica, sem matemática pesada', 'Para que serve cada tipo de chave.', 17),
    ('cybersecurity-fundamentals', 3, 2,  9, 'Hash, integridade e assinatura digital', 'Como se prova que algo não mudou.', 17),
    ('cybersecurity-fundamentals', 3, 3, 10, 'Certificados e TLS no dia a dia', 'O que o cadeado do navegador significa de verdade.', 16),
    ('cybersecurity-fundamentals', 4, 1, 11, 'Malware: tipos e comportamento', 'Reconhecer pelo comportamento, não pelo nome.', 18),
    ('cybersecurity-fundamentals', 4, 2, 12, 'Engenharia social e phishing', 'O ataque começa por gente, não por máquina.', 18),
    ('cybersecurity-fundamentals', 4, 3, 13, 'Vulnerabilidades, CVE e gestão de patches', 'Como uma falha conhecida vira invasão real.', 18),
    ('cybersecurity-fundamentals', 4, 4, 14, 'Ameaças internas e uso indevido', 'O risco que vem de dentro, sem paranoia.', 18),
    ('cybersecurity-fundamentals', 5, 1, 15, 'Senhas, MFA e gestão de credenciais', 'Higiene de acesso que funciona de verdade.', 17),
    ('cybersecurity-fundamentals', 5, 2, 16, 'Backup, atualização e resposta a incidentes pessoais', 'O que fazer nos primeiros minutos de um problema.', 17),
    ('fundamentos-para-soc', 1, 1,  1, 'O que é um SOC e o que ele resolve', 'O mapa da área antes de qualquer ferramenta.', 15),
    ('fundamentos-para-soc', 1, 2,  2, 'Papéis e turnos: N1, N2, N3 e coordenação', 'Quem faz o quê, e onde você entra.', 15),
    ('fundamentos-para-soc', 1, 3,  3, 'O ciclo de vida da detecção e resposta', 'A espinha dorsal que organiza todas as aulas seguintes.', 15),
    ('fundamentos-para-soc', 2, 1,  4, 'Os logs que importam: Windows, Linux, firewall, proxy e EDR', 'A fonte certa para a pergunta certa.', 20),
    ('fundamentos-para-soc', 2, 2,  5, 'O que é um SIEM na prática', 'Coleta, normalização, correlação, regra e alerta, do começo ao fim.', 18),
    ('fundamentos-para-soc', 2, 3,  6, 'Ruído, falso positivo e o custo do alerta', 'Alerta demais é falha de segurança, não sinal de rigor.', 15),
    ('fundamentos-para-soc', 3, 1,  7, 'Anatomia de um alerta: campos, severidade e contexto', 'Parar de ler o título e começar a ler o alerta.', 18),
    ('fundamentos-para-soc', 3, 2,  8, 'Da suspeita à evidência: validar sem inventar', 'A disciplina que separa analista de opinador.', 20),
    ('fundamentos-para-soc', 3, 3,  9, 'Escalonamento: quando e como subir o caso', 'Critério para escalonar sem insegurança e sem atraso.', 15),
    ('fundamentos-para-soc', 3, 4, 10, 'Registro e passagem de turno', 'Como fazer o caso sobreviver à troca de analista.', 15),
    ('fundamentos-para-soc', 4, 1, 11, 'Anatomia de um ataque visto em logs', 'Um ataque lido de ponta a ponta, em ordem, sem adivinhar.', 20),
    ('fundamentos-para-soc', 4, 2, 12, 'Playbook de triagem de phishing, na prática', 'Uma rotina completa, aplicada passo a passo.', 20)
  ) as v(curso, modulo_ordem, ordem, numero, titulo, resumo, minutos)
  join public.modulos m on m.curso_slug = v.curso and m.ordem = v.modulo_ordem
on conflict (modulo_id, ordem) do nothing;

-- Mapa aula x competência --------------------------------------------------------
insert into public.aula_competencias (aula_id, competencia_slug, peso)
select a.id, v.competencia, 1
  from (values
    ('cybersecurity-fundamentals', 1, 'fundamentos-seguranca'),
    ('cybersecurity-fundamentals', 2, 'fundamentos-seguranca'),
    ('cybersecurity-fundamentals', 3, 'fundamentos-seguranca'),
    ('cybersecurity-fundamentals', 4, 'redes-protocolos'),
    ('cybersecurity-fundamentals', 5, 'redes-protocolos'),
    ('cybersecurity-fundamentals', 6, 'redes-protocolos'),
    ('cybersecurity-fundamentals', 7, 'redes-protocolos'),
    ('cybersecurity-fundamentals', 8, 'fundamentos-seguranca'),
    ('cybersecurity-fundamentals', 9, 'fundamentos-seguranca'),
    ('cybersecurity-fundamentals', 10, 'fundamentos-seguranca'),
    ('cybersecurity-fundamentals', 11, 'fundamentos-seguranca'),
    ('cybersecurity-fundamentals', 12, 'fundamentos-seguranca'),
    ('cybersecurity-fundamentals', 13, 'fundamentos-seguranca'),
    ('cybersecurity-fundamentals', 14, 'fundamentos-seguranca'),
    ('cybersecurity-fundamentals', 15, 'fundamentos-seguranca'),
    ('cybersecurity-fundamentals', 16, 'resposta-incidentes'),
    ('fundamentos-para-soc', 1, 'triagem-alertas'),
    ('fundamentos-para-soc', 2, 'triagem-alertas'),
    ('fundamentos-para-soc', 3, 'resposta-incidentes'),
    ('fundamentos-para-soc', 4, 'analise-logs'),
    ('fundamentos-para-soc', 5, 'analise-logs'),
    ('fundamentos-para-soc', 6, 'analise-logs'),
    ('fundamentos-para-soc', 7, 'triagem-alertas'),
    ('fundamentos-para-soc', 8, 'triagem-alertas'),
    ('fundamentos-para-soc', 9, 'resposta-incidentes'),
    ('fundamentos-para-soc', 10, 'triagem-alertas'),
    ('fundamentos-para-soc', 11, 'analise-logs'),
    ('fundamentos-para-soc', 11, 'mitre-attack'),
    ('fundamentos-para-soc', 12, 'triagem-alertas'),
    ('fundamentos-para-soc', 12, 'resposta-incidentes')
  ) as v(curso, numero, competencia)
  join public.modulos m on m.curso_slug = v.curso
  join public.aulas a on a.modulo_id = m.id and a.numero = v.numero
on conflict do nothing;
