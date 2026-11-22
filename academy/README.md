# Portal do aluno da CyDef Academy

Endereço: https://academy.cydef.com.br · Publicado no Cloudflare Pages a partir desta pasta.

O site institucional (raiz do repositório) não muda com este portal. Os dois usam o mesmo projeto do Supabase.

## O que existe nesta etapa

- Login por link no e-mail, sem senha, pedido pela função `supabase/functions/academy-acesso`.
- Painel do aluno: saudação pela hora, ação principal para continuar na próxima aula e a Matriz da Formação (módulo por coluna, aula por bloco; o que ainda não saiu aparece como "A publicar").
- Meus cursos e a página de cada curso, com módulos, aulas e progresso.
- Busca com Ctrl+K.
- Questões no fim de cada módulo, avaliação final e emissão do certificado (telas da 06b).
- Material complementar com quarentena e aprovação em duas pessoas: o instrutor envia, outra pessoa confere e aprova, e só então o aluno baixa (fase 11).
- Minha conta em `/conta`: nome, certificados com a validação pública ligada ou desligada, sair de todos os dispositivos, cópia dos dados e pedido de exclusão (fase 12).
- Certificado em PDF (modelos Clássico claro e Técnico), botão do LinkedIn e validação pública em `/certificado/CODIGO` (fase 10).
- Painel do instrutor em `/instrutor`, só para a equipe: cursos, módulos, aulas, vídeos, questões, regras do certificado, Boletim do SOC e equipe (fase 13).
- Sobre o curso na página de cada curso: objetivos, para quem é, pré-requisitos, ementa por módulo e quem ensina, editados no painel (fase 13b).

## Identidade do portal (fase 08, publicada em 19/11/2026)

- Tokens da marca com papel fixo: o laranja `#f97316` só no nome Academy, na ação principal e no "você está aqui"; o verde só em concluído. Fora desses casos a tela é neutra.
- Saíram o fundo de partículas, o texto decodificado, o contador animado, a JetBrains Mono, os rótulos em caixa alta, os brilhos, os degradês e as animações decorativas. Tipografia: Inter Variable no texto e Space Grotesk Variable nos títulos.
- Painel com a Matriz da Formação: cada módulo vira uma coluna, cada aula um bloco, e o que ainda não foi publicado fica tracejado como "A publicar". O boletim, as competências e a sequência continuam existindo como dado, mas saíram da home.
- Progresso honesto: curso com módulo ainda em produção não aparece como concluído, fica "Em dia, novas aulas em produção"; aula e módulo não publicados aparecem como "Em breve" e "A publicar".
- Rótulo do módulo passa de "Módulo N · Título" para "Módulo N: Título".
- Deploy: Cloudflare Pages, deployment `e391f20a` do merge `6c05fbb` (PR #225). Conferido em produção em `academy.cydef.com.br/entrar`: 200, "Academy" em laranja ao lado do logo, nenhum canvas de partículas e as duas fontes em `.woff2` respondendo 200.

## Como o login funciona

1. O aluno digita o e-mail. O widget do Turnstile gera um token de uso único.
2. A função `academy-acesso` confere a origem, o Turnstile e o limite de tentativas (por IP e por e-mail, com chaves em HMAC). Depois consulta no banco se o e-mail é de um aluno ou de uma pré-inscrição ativa com consentimento.
3. Para quem não é elegível, a resposta é a mesma de quem é elegível (202, com o mesmo tempo mínimo). De fora, ninguém descobre quem está cadastrado.
4. Para quem é elegível, a função cria o usuário de login (se ainda não existir), cria o registro de aluno e envia o link. O endereço de retorno é fixo no servidor (`ACADEMY_URL/entrar/retorno`).
5. O link do e-mail aponta para o próprio portal, no mesmo domínio do remetente: `https://academy.cydef.com.br/entrar/retorno?token_hash=...&type=email`. O portal tira o token da barra de endereço, mostra "Confirme a sua entrada" e só troca o token por sessão (`verifyOtp`) quando o aluno clica em "Entrar na Academy". Verificador automático de e-mail (como o Safe Links da Microsoft) abre o link, mas não clica, então não gasta o acesso de uso único. Links no formato antigo, que passam pelo Supabase e voltam com `#access_token`, continuam funcionando.
6. No retorno, o portal chama `academy_registrar_acesso`. Como abrir o link comprova que a pessoa é dona do e-mail, a pré-inscrição pendente passa a confirmada aqui, e o aluno é matriculado nos cursos gratuitos publicados.

### Modelo do e-mail no Supabase

Em produção o e-mail sai pelo Supabase (SMTP do Resend), com o modelo **Authentication > Emails > Magic Link** do painel. O botão do modelo precisa apontar para:

```
https://academy.cydef.com.br/entrar/retorno?token_hash={{ .TokenHash }}&type=email
```

e não para `{{ .ConfirmationURL }}`, que leva ao domínio `supabase.co`. Ordem segura para mudar o modelo: primeiro o portal com o suporte a `token_hash` no ar, depois o modelo. Com o envio direto pelo Resend ligado (`ACADEMY_EMAIL_ENABLED=true`), a função monta o mesmo link a partir do `hashed_token` do `generate_link`.

## Banco (migrações 0008 e 0009)

- Catálogo: formações, trilhas, cursos, módulos, aulas e competências. A leitura é pública só para o que está publicado e só nas colunas públicas. A referência do vídeo (`video_ref`) não é liberada para ninguém pela API de tabelas.
- Dados do aluno (matrícula, progresso, dias de estudo): cada aluno lê só os próprios. Ninguém grava direto nas tabelas; a escrita passa por funções do banco que conferem quem chama.
- Os testes em `tests/sql` rodam todas as migrações num Postgres real (PGlite) e conferem essas regras.
- Privilégios das funções: a 0012 fecha `EXECUTE` em todas as funções de `public` e reafirma a matriz (anon só em `contagem_alunos`, authenticated só nas quatro do portal, service_role em todas). O `alter default privileges` vai em duas camadas: `in schema public` tira o que o Supabase deixou concedido, e a forma global (`for role postgres`, sem `in schema`) remove o grant embutido que o Postgres dá a `PUBLIC`. O default global vale para tudo que o papel `postgres` criar, inclusive extensões. Função nova nasce com `proacl = {postgres=X/postgres}`. **O default agora fecha também a `service_role`**: toda função usada pelas Edge Functions precisa de `grant execute on function public.<nome>(<args>) to service_role` na migração que a cria, senão a chamada chega como `permission denied`. Quem liberar para `anon` ou `authenticated` concede do mesmo jeito, de propósito, e termina a migração com `revoke execute on function ... from public` como reforço.

## Publicar conteúdo

A migração 0009 cria a estrutura dos dois cursos gratuitos com tudo **não publicado**. A 0011 acrescenta ao Cybersecurity Fundamentals o módulo **Introdução** (ordem 0) com a aula 01, "Boas-vindas ao curso", já ligada ao vídeo `AKtr_lmAB6Y`. As demais aulas andaram uma posição, e a antiga aula 01 (CID) passou a ser a aula 02. A 0014 abre o módulo 1 com a aula "O que é cibersegurança, afinal?" (aula 02, vídeo `iKAWeoCtbmA`) e liga a aula de CID, que passa a ser a aula 03, ao vídeo `J1AD8CV8AHM`. O curso tem 18 aulas. Os títulos dos vídeos no YouTube trazem módulo e aula ("Módulo 1 · Aula 01"); na URL do portal vale o número da aula no curso (`/aulas/2`, `/aulas/3`).

### Vincular o vídeo de uma aula

O id é o trecho depois de `youtu.be/` ou de `v=` no link. Cadastre também a duração real em segundos: ela aparece na capa e define quando a aula conta como concluída.

```sql
update public.aulas a
   set video_provedor = 'youtube', video_ref = 'ID_DO_VIDEO', duracao_seg = 754
  from public.modulos m
 where m.id = a.modulo_id and m.curso_slug = 'cybersecurity-fundamentals' and a.numero = 2;
```

### Publicar

Ordem segura: merge, Pages no ar com a sala de aula, migração aplicada no banco e só então o SQL abaixo. Publicar é decisão do Everton.

Aplicação da migração neste projeto: até 18/11/2026 era por `psql` no pooler `aws-0-us-east-2.pooler.supabase.com:5432`, com a senha do `.env.local` em `PGPASSWORD`, `-v ON_ERROR_STOP=1 --single-transaction -f`, sem histórico, porque o `supabase_migrations.schema_migrations` só tinha `0006` a `0009`. Em 18/11/2026 o histórico foi alinhado com `supabase migration repair` (`0001` a `0012` marcadas como aplicadas) e o `supabase db push --dry-run` voltou a responder "Remote database is up to date". A partir daí, migração nova entra por `supabase db push`; o caminho por `psql` continua documentado para quando o histórico divergir de novo.

```sql
-- só a aula de boas-vindas, por enquanto
update public.aulas a set publicado = true
  from public.modulos m
 where m.id = a.modulo_id and m.curso_slug = 'cybersecurity-fundamentals' and m.ordem = 0 and a.numero = 1;

-- curso, trilha e formação
update public.cursos set publicado = true, atualizado_em = now() where slug = 'cybersecurity-fundamentals';
update public.trilhas set publicado = true where slug = 'fundamentos';
update public.formacoes set publicado = true where slug = 'analista-soc';
```

Aula não publicada aparece no catálogo como "em breve" e não abre a sala de aula. Aluno que já entrou antes da publicação é matriculado no próximo acesso.

### Sala de aula

- Endereço: `/cursos/<slug>/aulas/<numero>`. O número é o da aula no curso (1 a 17 no Cybersecurity Fundamentals).
- O vídeo só é entregue a aluno matriculado, pela função `academy_video_aula`; a coluna `video_ref` continua fora do alcance das consultas diretas.
- O player do YouTube é carregado em `youtube-nocookie.com` só depois do clique, sem script de terceiros. A conversa com ele é por `postMessage`, aceitando apenas mensagens da origem do YouTube.
- A posição é gravada a cada 15 s, ao pausar e ao sair da aba. A aula conta como concluída ao terminar o vídeo, ao passar de 92% ou pelo botão "Marcar como concluída". Conclusão não volta atrás.

### Questões, avaliação final e certificado (0013)

Os requisitos são de cada curso, na tabela `cursos_requisitos`, e se editam na aba Certificado do painel do instrutor (0015). Os dois cursos gratuitos usam os mesmos requisitos:

| Campo | Valor nos gratuitos | O que faz |
|---|---|---|
| `exige_todas_aulas` | sim | Todas as aulas do curso concluídas. Aula ainda não publicada impede o certificado. |
| `exige_modulos` | sim | Módulo com questões precisa ser aprovado para liberar o seguinte (vale também no servidor: aula de módulo bloqueado não entrega vídeo nem grava progresso). |
| `nota_minima_modulo` / `questoes_modulo` | 70 / 5 | Sorteio de 5 questões do módulo; 4 de 5 aprova. Refaz na hora. |
| `nota_minima_final` / `questoes_final` | 80 / 20 | Sorteio de 20 do banco do curso. Sem cronômetro; a prova aberta volta se o aluno fechar a aba. |
| `espera_final_horas` / `tentativas_final_max` | 24 / ilimitadas | Espera depois de reprovar. Vazio é ilimitado. |
| `carga_horaria_h` | 6 (Cybersecurity Fundamentals); vazio (Fundamentos para SOC) | Vazio: o curso não emite certificado. |

Módulo sem questões publicadas não bloqueia (a Introdução não tem). Questão só vai para o aluno publicada, com 2 a 8 alternativas e exatamente uma correta. Do banco da avaliação final (questões com `modulo_id` vazio) sai só a nota, nunca a correção.

Questões se cadastram pelo painel do instrutor. O SQL abaixo fica como referência (módulo: informe o `modulo_id`; avaliação final: deixe `null`):

```sql
with q as (
  insert into public.questoes (curso_slug, modulo_id, enunciado, explicacao, publicado)
  values ('cybersecurity-fundamentals', 'ID_DO_MODULO',
          'Qual pilar da tríade CID é afetado quando um ransomware cifra os arquivos?',
          'A informação continua lá, mas ninguém consegue usar: é a disponibilidade.', true)
  returning id
)
insert into public.questoes_alternativas (questao_id, ordem, texto, correta)
select q.id, x.ordem, x.texto, x.correta from q, (values
  (1, 'Disponibilidade', true),
  (2, 'Confidencialidade', false),
  (3, 'Integridade', false),
  (4, 'Autenticidade', false)) as x(ordem, texto, correta);
```

Certificado: o aluno confere o nome antes de emitir; depois de emitido, correção só pela CyDef. O código tem o formato `CYD-XXXX-XXXX-XXXX-XXXX`.

#### PDF e validação pública (fase 10, migração 0017)

- **Modelos:** curso gratuito usa o B, Clássico claro; curso pago usa o C, Técnico, com os módulos do curso. O A, Noturno, fica para o certificado de formação (etapa futura). O instrutor pode fixar o modelo do curso na aba Certificado do painel; vazio é o automático. Selo da CyDef Academy, sem assinatura e sem nota.
- **Na emissão** o banco grava no certificado o modelo e os títulos dos módulos com aula publicada. Mudar o curso depois não muda certificado já emitido.
- **PDF:** gerado no navegador do aluno (`src/lib/certificado-pdf.ts`, com pdf-lib), em A4 deitado, com texto e QR code em vetor. Fontes em `src/assets/certificado/` (SIL OFL 1.1, licença no `OFL.txt`). O gerador e as fontes só são baixados quando o aluno clica em "Baixar PDF". Os dados vêm de `academy_meu_certificado`, que só responde ao dono.
- **LinkedIn:** o botão "Adicionar ao LinkedIn" abre o formulário de certificação do LinkedIn já preenchido com curso, CyDef Academy, mês e ano, código e o link de validação.
- **Validação:** `academy.cydef.com.br/certificado/CODIGO`, sem login, e `/certificado` com um campo para digitar o código (aceita minúsculas e sem hífen). Mostra só nome, curso, carga horária e data, como diz o Aviso de Privacidade (v2026.3, item 4). Código inexistente e validação desativada recebem a mesma resposta.

O próprio aluno liga e desliga a validação pública de cada certificado em Minha conta (fase 12). Se o pedido chegar por e-mail, desative assim:

```sql
update public.certificados set validacao_publica = false where codigo = 'CYD-....';
```

#### Telas do aluno (06b)

| Endereço | O que mostra |
|---|---|
| `/cursos/<curso>/modulos/<ordem>/questoes` | Sorteio do módulo, envio só com tudo respondido, nota e correção com a explicação de cada questão. "Responder de novo" faz um sorteio novo. |
| `/cursos/<curso>/avaliacao` | O que falta para liberar, a espera entre tentativas, a prova (respostas guardadas no navegador até o envio, com confirmação antes de enviar) e só a nota no fim. |
| `/cursos/<curso>/certificado` | Conferência do nome (vem do cadastro, editável, mesmas regras do banco), confirmação e emissão. Depois, os dados e o código de validação. |

Na página do curso e na sala de aula, a linha "Questões do módulo" e o cadeado de módulo bloqueado só aparecem quando o módulo tem questões publicadas. O cartão da avaliação final só aparece quando ela existe para o aluno (liberada, em espera, em andamento ou aprovada) e o do certificado só quando ele está liberado ou emitido. Curso sem questões fica igual a antes. Se a consulta `academy_situacao_curso` falhar, a página do curso e a sala de aula seguem normais.

## Material complementar (fase 11, migração 0019)

Regra do Everton: só quem é da equipe do curso envia arquivo, e todo arquivo passa por uma **segunda pessoa** antes de chegar ao aluno (dupla checagem, como no CyDef Inora). Quem enviou nunca aprova o próprio arquivo, nem sendo admin; o banco garante isso por função e por restrição na tabela.

- **Quem aprova:** os admins e quem o admin marcar em Equipe como "Aprova materiais de outras pessoas". A página `/instrutor/aprovacoes` só aparece para eles.
- **Tipos e tamanhos:** PDF, DOCX, XLSX, XLS, PPTX, CSV, MD, TXT e ZIP. Documentos até 25 MB e ZIP até 50 MB. O teto de 50 MB é o limite de arquivo do plano Free do Supabase; no Pro, o ZIP pode ir a 100 MB mudando `academy__limite_material` e o `file_size_limit` do bucket numa migração nova.
- **Camadas:**
  1. No navegador, antes do envio: tipo conferido pelo conteúdo (assinatura do arquivo, não só a extensão), tamanho, Office com macro recusado (procura `vbaProject.bin`), texto só em UTF-8 sem binário, e SHA-256 calculado.
  2. Banco e bucket repetem a regra de tipo e tamanho. O bucket `academy-materiais` é privado e só aceita os MIME da lista.
  3. O arquivo só pode ser gravado no caminho criado pelo registro, por quem registrou, enquanto o estado é "enviando" (política do Storage). Na confirmação, o banco confere o tamanho gravado.
  4. Quarentena: aluno não lê arquivo pendente. O aprovador baixa pelo painel, o navegador confere o SHA-256 com o do envio e lista o conteúdo de ZIP e Office, destacando executáveis e scripts. Aprovar só fica disponível depois dessa conferência. Há um link para consultar o hash no VirusTotal (só o hash sai, não o arquivo). Recusa exige motivo, que quem enviou vê no painel.
  5. Aluno matriculado em curso publicado baixa por link assinado de 60 segundos, como anexo.
- **Depois de aprovado:** título, descrição e módulo mudam sem nova aprovação (o arquivo não muda). Para trocar o arquivo, envie um novo e tire o antigo do ar.
- Toda etapa vai para `academy_auditoria` (registrado, enviado, aprovado ou recusado, salvo, arquivado).

## Catálogo, trilhas e venda pela Hotmart (fase 14, migração 0020)

A venda é da Hotmart: pagamento, parcelamento, reembolso e nota ficam lá. A Academy só mostra o curso e leva ao checkout. O mesmo catálogo aparece em três lugares, todos lidos da função pública `academy_catalogo_publico`:

| Vitrine | Onde | O que muda |
|---|---|---|
| Site principal | `cydef.com.br/pt/academy` (blocos por trilha), `/academy/catalogo` (todos os cursos, com filtro por trilha e nível) e `/pt/cursos/<slug>` (página do curso) | É o que vai para o Google. O Comprar leva `sck=site`. |
| Portal | `/catalogo` e `/catalogo/<slug>`, para quem está logado | Curso que a pessoa já tem vira "Continuar". O Comprar abre a Hotmart com o e-mail da conta preenchido e `sck=portal`. |
| Hotmart | Página do produto, com área de membros externa apontando para o portal | Venda direta; a origem aparece separada no relatório da Hotmart. |

- **Quem edita:** só admin. Aba **Vitrine** do curso (situação, trilhas, link de checkout, código do produto, preço exibido) e página **Trilhas** do painel (criar, publicar, ordenar trilhas e os cursos dentro delas).
- **Situação:** fora das vitrines, em breve (ementa e Avise-me, sem preço) ou à venda (preço e Comprar). À venda exige curso publicado, link de checkout e preço; se o curso for despublicado depois, a vitrine volta sozinha para "em breve". Curso gratuito não entra na vitrine paga.
- **Checkout:** só `https://pay.hotmart.com/...` ou `https://checkout.hotmart.com/...`, conferido no navegador, no banco e no build do site.
- **Preço:** é só o que se exibe. O painel guarda quando ele foi conferido na Hotmart e avisa depois de 30 dias.
- **Código do produto:** um produto da Hotmart serve a um curso só. É por ele que o webhook da fase 16 vai liberar o acesso.
- **Site:** o build lê o catálogo do banco (`scripts/gen-catalogo-academy.mjs`) e grava `src/lib/academy/catalogo-snapshot.json`. De hora em hora, `.github/workflows/catalogo-academy.yml` compara a versão do banco com a publicada em `/catalogo-academy.json` e dispara o deploy quando muda. Os cursos são em português: a página do curso existe só em `/pt/`; em inglês e espanhol o endereço redireciona.
- Toda escrita vai para `academy_auditoria` (`vitrine_salva`, `trilha_criada`, `trilha_salva`, `trilha_movida`, `curso_movido_na_trilha`).

## Acesso pago e webhook da Hotmart (fase 16, migração 0021)

Todo acesso pago é uma **concessão** (`academy_concessoes`): origem (`hotmart`, `manual` ou, na fase de empresas, `empresa`), escopo (um curso, uma trilha ou a plataforma toda) e validade. A tabela `matriculas` continua sendo o que o portal lê: `academy__sincronizar` recalcula as matrículas pagas do aluno a partir das concessões ativas, sem tocar nas de curso gratuito e sem apagar progresso ou certificado.

| Produto na Hotmart | Onde se cadastra | O que libera |
|---|---|---|
| Curso individual | Aba Vitrine do curso (código do produto) | O curso, vitalício |
| Trilha completa | Painel, Vendas, Produtos | Os cursos pagos que a trilha tem no dia da compra, vitalício |
| Plataforma toda | Painel, Vendas, Produtos | Todos os cursos pagos, por 365 dias |

- **Webhook:** `supabase/functions/academy-hotmart` (publicada com `--no-verify-jwt`; quem chama é a Hotmart). Confere o header `X-HOTMART-HOTTOK` contra o secret `HOTMART_HOTTOK` em tempo constante, lê só transação, produto, e-mail, nome, situação e data, e chama `academy_hotmart_processar` (só service_role).
- **Eventos:** `PURCHASE_APPROVED` e `PURCHASE_COMPLETE` liberam; `PURCHASE_REFUNDED`, `PURCHASE_CHARGEBACK`, `PURCHASE_PROTEST` e `PURCHASE_CANCELED` encerram. O resto fica só registrado. Cada aviso é gravado uma vez (`academy_hotmart_eventos`); reembolso que chega antes da aprovação impede a liberação.
- **Respostas:** 200 para tudo que foi gravado (inclusive repetido ou de produto que não é da Academy), 401 com token errado, 500 se o banco falhar (a Hotmart reenvia).
- **E-mails da CyDef** (com o Resend ligado): acesso liberado e acesso encerrado. Sem link de login no e-mail: a pessoa pede o link na tela de entrada, com o e-mail da compra.
- **Quem compra sem pré-inscrição** pode pedir o link de acesso: a concessão ativa conta como elegibilidade, e o aluno é criado sem lead (`academy-acesso` e `academy_provisionar_aluno`).
- **Vencimento dos 12 meses:** na hora do login e, todo dia às 06:23 UTC, pelo pg_cron (`academy-expirar-concessoes`), quando a extensão está ligada.
- **Painel, página Vendas (só admin):** busca por e-mail ou transação, transferência de uma compra para o e-mail da conta, liberação manual (cortesia, parceria, conferência), encerramento com motivo, produtos de trilha e de plataforma e os últimos avisos da Hotmart. Tudo vai para `academy_auditoria`.

## Ofertas de trilha e de plataforma e aviso v2026.4 (fase 16b, migrações 0022 e 0023)

- **Trilha completa e plataforma toda nas vitrines:** o produto cadastrado em Vendas, Produtos ganha a parte **Vitrine** (fora das vitrines ou à venda, link de checkout, preço, observação e "Conferi o preço"). À venda exige produto ativo, checkout da Hotmart e preço, com as mesmas regras do curso individual.
- **Onde aparece:** `academy_catalogo_publico` passa a devolver `ofertas`. No site, a plataforma toda fica acima das trilhas em `/pt/academy` e acima dos filtros em `/academy/catalogo`; a trilha completa aparece no bloco da trilha e quando o catálogo é filtrado por ela. No portal, `/catalogo` mostra as duas, e o Comprar leva o e-mail da conta e `sck=portal`. Oferta de trilha só aparece com a trilha publicada e com cursos na vitrine.
- **Aviso de Privacidade v2026.4:** inclui a compra pela Hotmart (item 2.5), as bases legais de execução de contrato e de exercício regular de direitos, a Hotmart como controladora do pagamento e a guarda dos registros de compra por até 5 anos depois do fim do acesso. A 0022 marca a v2026.4 como vigente e o portal passa a apontar para ela. O registro de quem se inscreveu antes continua com a versão que aceitou; a CyDef avisa essas pessoas por e-mail da mudança.
- **Minha conta:** a exportação de dados inclui `acessos_pagos` (`academy_meus_acessos`), com o que foi comprado ou liberado e a validade. Sem a 0023 no banco, a exportação sai sem esse bloco.

## Meu perfil (fase 19, migrações 0030 e 0031)

- **Página `/perfil`**, no menu da conta, para qualquer papel. Só o nome é obrigatório; data de nascimento (16 anos ou mais), telefone, cidade, país, empresa, cargo, área de atuação, tempo de experiência, bio (até 600 caracteres) e LinkedIn são opcionais. Campo vazio apaga o valor. O e-mail é o login e aparece só para leitura.
- **"Minha conta"** deixa de editar o nome: o bloco "Seus dados" mostra nome e e-mail e leva para Meu perfil.
- **Banco:** tabela `academy_perfis`, fechada; leitura e gravação só por `academy_meu_perfil` e `academy_salvar_meu_perfil`. A validação fica em `academy__salvar_perfil(user, dados)`, que a fase 20 (painel do admin) reaproveita. Apagar a conta apaga o perfil.
- **Quem vê:** o próprio aluno e, a partir da fase 20, os administradores, que editam tudo menos o e-mail. Instrutores e gestão de empresa não veem.
- **Cópia dos dados** (Minha conta) inclui o perfil.
- **Aviso de Privacidade v2026.8:** item 2.8 (o perfil e quem vê), item 3 (consentimento, campo a campo) e item 8 (prazo).

## Indicadores e pessoas no painel do admin (fase 20, migração 0032)

Duas abas novas no painel, visíveis só para admin. Instrutor não vê as abas e recebe "página não encontrada" se abrir o endereço.

- **Indicadores (`/instrutor/indicadores`):** pré-inscrições, contas no portal, quem estudou nos últimos 7 e 30 dias e certificados emitidos; funil da pré-inscrição ao certificado; gráfico dos últimos 30 dias; tabela por curso (matriculados, começaram, concluíram, média de conclusão, aprovados na avaliação final e certificados); e a distribuição do perfil declarado na pré-inscrição, da área e do tempo de experiência informados em Meu perfil. Pré-inscrições inválidas ou descartadas não entram na conta.
- **Pessoas (`/instrutor/pessoas`):** todo mundo que tem conta e quem só fez a pré-inscrição, com e-mail, papel, perfil declarado, data de cadastro, último acesso, cursos e certificados. Busca por nome ou e-mail e filtros Todas, Com conta, Só pré-inscrição e Equipe, 50 por página. Quem fez a pré-inscrição e já tem conta aparece uma vez só.
- **Ficha da pessoa (`/instrutor/pessoas/:id`):** o admin edita todo o perfil com a mesma validação do aluno, menos o e-mail. Na mesma ficha define o papel (aluno, instrutor com os cursos que ensina, ou admin) sem precisar digitar o e-mail; por trás usa `academy_adm_definir_equipe` e `academy_adm_remover_equipe`, as mesmas da aba Equipe. Mostra ainda o progresso em cada curso, os certificados, as missões e a pré-inscrição.
- **Banco:** `academy_adm_indicadores`, `academy_adm_pessoas`, `academy_adm_pessoa` e `academy_adm_salvar_perfil`, todas com `academy__exigir_admin`. Cada edição de perfil feita pelo admin grava `perfil_editado` na auditoria, só com os nomes dos campos alterados, nunca os valores.
- **"Meu perfil" do instrutor** passou a se chamar **"Perfil de instrutor"**, para não confundir com o Meu perfil da conta.
- **Fora desta fase:** bloquear acesso e exportar a lista em CSV.

## Conta do dono da plataforma (fase 21, migração 0033)

Regra do Everton: a conta dele é absoluta. Dentro da plataforma ninguém além dele altera essa conta.

- **Quem é o dono:** `academy_dono`, uma linha só. A 0033 marca o primeiro admin cadastrado. Trocar o dono só por SQL no painel do Supabase; não existe função para isso.
- **O que fica protegido:** papel na equipe e aprovação de materiais, nome, Meu perfil, cartão de instrutor ligado à conta e os acessos comprados ou liberados manualmente. Outra pessoa logada recebe `conta_protegida`.
- **Onde está a regra:** em gatilhos nas tabelas (`academy_equipe`, `academy_equipe_cursos`, `alunos`, `academy_perfis`, `academy_concessoes`, `instrutores`), então vale para as funções de hoje e para as que vierem.
- **O dono continua admin sempre:** nem ele mesmo se rebaixa ou sai da equipe pelo painel (`dono_sempre_admin`).
- **Fora da plataforma** (webhook da Hotmart, tarefas agendadas, SQL no painel do Supabase, tudo sem usuário logado) o gatilho não interfere.
- **Empresas clientes:** o vínculo com uma empresa e as concessões de origem `empresa` seguem o contrato e ficam de fora.
- **Na tela:** na Equipe, a linha do dono mostra "Dono da plataforma" no lugar de Editar. Na ficha em Pessoas, outro admin vê o perfil do dono só para leitura; o próprio dono edita o perfil normalmente. O papel aparece como "Admin, sempre". A tela pergunta quem é o dono por `academy_adm_dono` (só admin).

## Material complementar dentro do módulo (fase 22, migrações 0034 e 0035)

Pedido do Everton (22/11/2026): o material complementar de cada módulo aparece também dentro do bloco do módulo, como um item com check, e é uma etapa antes das questões.

- **Na tela:** na página do curso e na lateral da sala de aula, o material do módulo entra entre as aulas e as "Questões do módulo". Clicar baixa o arquivo e marca o check ("Baixado"). Enquanto faltar material, a linha das questões mostra "Depois do material" e a tela de questões pede o download, com o botão ali mesmo. A lista "Material complementar" do fim da página continua, com o mesmo check.
- **A regra está no banco:** `academy_registrar_material` grava o primeiro download em `academy_materiais_baixados` (fechada; some com a conta e com o material) antes de o portal gerar o link. `academy_questoes_modulo` e `academy_responder_modulo` recusam com `material_pendente` enquanto houver material aprovado do módulo não baixado. Quem já passou no módulo não é travado de novo. Material pendente, recusado ou fora do ar não conta; material do "Curso todo" não trava nada.
- **Cópia dos dados** do aluno inclui os materiais baixados e a data.
- **Aviso de Privacidade v2026.9 (0035):** o item 2.3 passa a citar os materiais baixados e a data do primeiro download.

## E-mails de certificado emitido e de aula nova (fase 18, migrações 0028 e 0029)

- **Certificado emitido:** vai sempre para o aluno, com o código de validação, o botão para abrir o certificado (PDF e LinkedIn) e, se a validação pública estiver ligada, o endereço de validação. Certificados emitidos antes da 0028 ficam marcados como avisados e não geram e-mail.
- **Aula nova:** só para quem ligar "Avisar quando sair aula nova" em Minha conta (começa desligado). Um e-mail por aluno e curso, com a lista das aulas novas e o botão para a primeira. Entra a aula publicada há pelo menos 30 minutos (tempo para desfazer) e há no máximo 14 dias, em curso publicado, para quem já estava matriculado e com o aviso ligado antes da publicação. Aulas publicadas antes da 0028 não geram aviso (`aulas.publicada_em` nasce vazia nelas).
- **Quando sai:** na rotina diária `academy-avisos` (workflow `academy-avisos.yml`, 41 11 UTC), depois dos avisos de vencimento. A aula nova tem teto de 40 e-mails por dia (`LIMITES_AVISOS.aulaNovaPorDia`), para deixar folga no plano gratuito do Resend para o link de login; o que passar sai no dia seguinte. Cada aula e cada certificado é avisado uma vez só (`academy_avisos_enviados`, chaves `certificado:<código>` e `aula:<id>`).
- **Sem a 0028 no banco,** a função pula essas duas partes e o vencimento segue normal; em Minha conta, o bloco "Avisos por e-mail" não aparece.
- **Aviso de Privacidade v2026.7:** item 2.2 (a preferência), item 3 (certificado por execução de contrato; aula nova por consentimento, ligado em Minha conta) e item 8 (registro desses envios por até 12 meses).

## Missões de SOC (fase 15, migrações 0026 e 0027)

- **O que é:** um caso prático no fim de um curso. O aluno examina as evidências em abas (e-mail, cabeçalhos, tabela de logs, alerta do SIEM ou texto), fixa as linhas que provam o caso, responde a investigação e recebe a correção com a explicação de cada pergunta. Referência visual: `prototipo-missao-soc-animado-v1.html`, aprovado em 17/11/2026, no padrão da identidade da fase 08.
- **Liberação:** cada missão pertence a um curso. Por padrão, abre quando o aluno conclui as aulas publicadas do curso; pode abrir já com a matrícula.
- **Correção no banco:** o gabarito nunca sai antes do envio. O tempo é medido entre o início (`academy_iniciar_missao`) e o envio (`academy_enviar_missao`). A tentativa guarda a correção com o texto do momento, então editar a missão depois não muda o histórico. Aprovado com 80% ou mais; pode refazer, vale a melhor nota.
- **Competências e selo:** a missão aprovada soma o peso nas competências marcadas, como uma aula concluída, e dá o selo da missão. O resultado mostra cada competência antes e depois.
- **Portal:** `/missoes` (lista), `/missoes/:slug` (bloqueada, pronta, investigação, resultado), cartão "Próxima missão" no painel e link "Missões" no topo quando o aluno tem missão. As respostas e as evidências fixadas ficam no navegador enquanto a investigação está aberta, para sobreviver a um recarregamento.
- **Painel do instrutor:** aba "Missões" no curso, para quem edita o curso. A missão inteira se edita em campos simples (cabeçalhos e linhas do alerta como "Campo: valor", tabela com colunas separadas por |, alternativas uma por linha com * nas certas), com publicação e exclusão (só sem tentativas).
- **Primeira missão:** a MSN-001 (Triagem de phishing) do protótipo vem cadastrada no curso Fundamentos para SOC, sem publicar.
- **Aviso de Privacidade v2026.6:** o item 2.4 cita o que a tentativa de missão guarda, e o item 2.6 deixa claro que a gestão da empresa não vê as missões.

## Academy para empresas e aviso de vencimento (fase 17, migrações 0024 e 0025)

- **Sem preço público e sem Hotmart.** O contrato é negociado com a CyDef. Em Painel do instrutor, Empresas (só admin), a CyDef cadastra a empresa: tipo (consultoria ou plano para times), o que o contrato libera (plataforma toda, uma trilha ou um curso), o primeiro e o último dia de acesso, as vagas e o e-mail de quem vai cuidar da gestão. Prorrogar é editar o último dia. Encerrar antes da hora pede motivo e retira o acesso de todos.
- **Vagas:** toda pessoa do contrato ocupa uma vaga, inclusive quem está na gestão. Convite pendente também ocupa, até ser recusado ou cancelado.
- **Gestão** (`/empresa/:id`, link "Minha empresa"): convida até 50 e-mails por vez, reenvia ou cancela convites, remove pessoas e coloca ou tira alguém da gestão (a empresa nunca fica sem ninguém na gestão). Vê, só nos cursos do contrato, as aulas concluídas, a aprovação na avaliação final (sem nota), os certificados e o último acesso, e baixa isso em planilha. Deixa de ver quando a pessoa sai ou o contrato termina. O admin também abre esse painel.
- **Convite:** a Edge Function `academy-empresa` envia o e-mail com o token da sessão de quem convidou, e o banco confere a permissão. O e-mail não leva link de login. A pessoa entra com o e-mail convidado (o convite dá direito ao link, mesmo sem pré-inscrição), vê o convite na entrada e, em `/convites`, lê o que a gestão vai ver antes de aceitar. O aceite registra a versão e o hash do aviso vigente. Em Minha conta, a pessoa vê as empresas e pode sair; a cópia dos dados inclui as empresas.
- **Acesso:** cada aceite vira uma concessão com origem `empresa` e as datas do contrato. Editar o contrato atualiza as concessões; remover, sair ou encerrar as revoga. Conta, progresso e certificados ficam com a pessoa.
- **Aviso de vencimento:** a Edge Function `academy-avisos`, chamada uma vez por dia pelo workflow `academy-avisos.yml` com o token `ACADEMY_CRON_TOKEN`, recalcula os acessos que começaram ou venceram e envia os e-mails: plano de 12 meses (ou liberação de 60 dias ou mais) 30 e 7 dias antes, com o checkout da plataforma quando está à venda; membro de empresa 7 dias antes; gestão 30 dias antes do fim do contrato. Ninguém recebe aviso se outro acesso continuar cobrindo o mesmo conteúdo, e cada aviso sai uma vez só.
- **Aviso de Privacidade v2026.5:** acrescenta o item 2.6 (acesso pela empresa e o que a gestão vê), as bases legais do acesso pela empresa e do aviso de vencimento, o compartilhamento com a gestão da empresa e a guarda dos registros.
- **Site:** `/pt/academy` ganha a seção "Academy para empresas" (`#empresas`), com as duas formas e o botão "Falar com a CyDef" (e-mail pronto).

## Minha conta (fase 12, migração 0018)

Em `/conta`, pelo menu da conta. Coloca ao alcance do aluno o que o Aviso de Privacidade da Academy (v2026.3) já promete, sem regra nova:

| Bloco | O que faz | Função |
|---|---|---|
| Seus dados | Corrige o nome (2 a 80 caracteres). Certificado já emitido não muda. O e-mail é o login e só muda pelo contato@cydef.com.br. | `academy_atualizar_nome` |
| Certificados | Lista os certificados e liga ou desliga a validação pública de cada um (item 4 do aviso). | `academy_meus_certificados`, `academy_validacao_publica` |
| Acesso | Sair de todos os dispositivos (encerra a sessão em todos os navegadores). | Supabase Auth, `signOut({ scope: "global" })` |
| Privacidade | Baixa uma cópia dos dados em JSON: conta, pré-inscrição e consentimento, matrículas, progresso, questões e avaliações com as respostas em texto (sem a correção) e certificados. O pedido de exclusão abre um e-mail para contato@cydef.com.br com o assunto "LGPD: Solicitação de titular" (item 11; resposta em até 15 dias). | `academy_meus_dados` |

Tudo só do próprio aluno: cada função confere `auth.uid()`.

## Painel do instrutor (0015)

Em `academy.cydef.com.br/instrutor`, para quem é da equipe. Para os demais a rota responde 404 e o link "Instrutor" não aparece no topo. Toda leitura e escrita passa pelas funções `academy_adm_*`, que conferem o papel no banco; as tabelas `academy_equipe`, `academy_equipe_cursos` e `academy_auditoria` não têm grant para `anon` nem para `authenticated`.

| Papel | Pode |
|---|---|
| admin | Tudo, em todos os cursos: criar curso, publicar curso, definir se é gratuito, Boletim do SOC e equipe. |
| instrutor | Só nos cursos atribuídos: módulos, aulas, vídeos, publicação de aulas, questões, regras do certificado, título, descrição e nível do curso. |

| Endereço | O que faz |
|---|---|
| `/instrutor` | Cursos com aulas e questões publicadas e aulas sem vídeo. O admin cria curso novo (nasce rascunho). |
| `/instrutor/cursos/<curso>` | Abas Estrutura (módulos e aulas, ordem, renomear, criar), Questões, Certificado (`cursos_requisitos`) e Dados do curso. |
| `/instrutor/cursos/<curso>/aulas/<id>` | Título, módulo, vídeo (cola o link do YouTube; o portal guarda só o código), duração em mm:ss, resumo e publicação. `nova?modulo=<id>` cria no fim do módulo. |
| `/instrutor/cursos/<curso>/questoes/<id>` | Enunciado, 2 a 8 alternativas com uma correta, explicação, módulo ou avaliação final, publicação. |
| `/instrutor/boletim` e `/instrutor/equipe` | Só admin. |

Regras que o banco garante:

- O número da aula (o da URL) é refeito a cada mudança de ordem, na ordem de módulos e aulas. Progresso e questões ficam presos ao id da aula, então mover aula não apaga nada do aluno.
- Publicar aula exige vídeo. Aula publicada ou com progresso de aluno não pode ser excluída, só despublicada. Módulo só sai vazio. A Introdução (ordem 0) não muda de lugar.
- Questão já respondida (módulo ou avaliação final) não pode ser excluída. As alternativas são atualizadas por posição, para manter as respostas gravadas.
- A pessoa precisa ter entrado na Academy uma vez para ser adicionada à equipe. A Academy nunca fica sem admin.
- Toda escrita grava em `academy_auditoria` quem fez, o quê e quando.

Primeiro admin, depois de aplicar a 0015 (troque pelo e-mail com que o Everton entra no portal):

```sql
insert into public.academy_equipe (user_id, papel)
select id, 'admin' from auth.users where lower(email) = lower('EMAIL_DO_EVERTON')
on conflict (user_id) do update set papel = 'admin';
```

Daí em diante a equipe é gerida em `/instrutor/equipe`.

### Sobre o curso e quem ensina (0016)

| Onde | O que faz |
|---|---|
| Aba **Sobre o curso** | Objetivos ("O que você vai aprender", até 10 de até 200 caracteres), "Para quem é" e "Pré-requisitos" (até 600). Também a lista **Quem ensina**: ordem, papel (Instrutor ou Convidado), acrescentar perfil existente e convidar alguém de fora da equipe. |
| Estrutura, editar módulo | Título e **ementa do módulo** (até 400 caracteres). A ementa aparece na página do curso, inclusive em módulo "Em breve". |
| `/instrutor/perfil` | **Meu perfil**: nome público, cargo, mini bio, LinkedIn e site de quem é da equipe. Sem foto por enquanto: o portal mostra as iniciais. |

Na página do curso, o aluno vê os blocos "O que você vai aprender", "Para quem é", "Pré-requisitos" e "Quem ensina" embaixo dos módulos. Bloco vazio não aparece, então curso sem nada cadastrado fica igual a antes.

Regras: convidado (perfil sem conta) aparece no curso sem acesso ao painel; para editar o curso a pessoa precisa estar na Equipe. Perfil de alguém da equipe só a própria pessoa ou o admin edita; convidado, o admin ou quem edita um curso em que ele aparece. O aluno lê só nome, cargo, bio e links, e só de quem está em curso publicado. Toda escrita vai para `academy_auditoria`.

A 0016 depende da 0015. O portal funciona antes e depois dela: sem a 0016, a página do curso usa a consulta antiga e o painel salva só o título do módulo. Para conferir o que foi feito: `select * from public.academy_auditoria order by id desc limit 50;`

## Boletim do SOC

Pelo painel do instrutor (admin). O SQL fica como referência:

```sql
insert into public.boletim (tipo, titulo, link, publicado)
values ('ameaca', 'Campanha de phishing com QR code mira equipes financeiras', 'https://www.cydef.com.br/blog/...', true);
```

`tipo`: `atualizacao`, `ameaca`, `missao` ou `aula`. O link precisa começar com `https://`. Com `publicado_em` no futuro, o aviso só aparece na data.

## Desenvolvimento

```
cd academy
npm ci
cp .env.example .env.local   # preencher os valores públicos
npm run dev                  # http://localhost:5180
npm run lint && npm run typecheck && npm test && npm run build
```

Para testar o login no ambiente local, `http://localhost:5180` precisa estar em `ACADEMY_ALLOWED_ORIGINS` da função e nas Redirect URLs do Supabase.

### Testes de ponta a ponta

`npm run e2e` sobe o build de produção (`vite preview`, porta 4180) e um Supabase falso (`e2e/supabase-falso.mjs`, porta 54399) e percorre o portal num navegador de verdade: pedido de link, link do e-mail com a tela de confirmação, link vencido, painel, sala de aula (o vídeo carrega uma vez, grava o progresso e conclui sem recarregar), navegação entre aulas, questões do módulo (erra, vê a explicação, refaz e passa), avaliação final aprovada e reprovada, emissão do certificado e o celular sem rolagem lateral. Turnstile e YouTube são simulados nos testes; nada sai para a internet.

```
npx playwright install chromium   # uma vez
npm run e2e
```

O build do e2e usa o `postcss.config.js` da raiz do repositório: rode `npm ci` na raiz antes, num clone novo. Com um Chrome já instalado, dá para pular o download: `PW_CHROME=<caminho do chrome> npm run e2e`. O CI roda os mesmos testes no job do portal e guarda o relatório quando algo falha.

## Cloudflare Pages

- Repositório: `evertonk95/cydef-nexus`, branch de produção `main`.
- Root directory: `academy` · Build command: `npm ci && npm run build` · Output: `dist`.
- Variáveis de ambiente (todas públicas, configuradas no painel do Pages, Production e Preview): `NODE_VERSION=22`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ACESSO_API_URL`, `VITE_TURNSTILE_SITE_KEY`. O repositório não versiona arquivos `.env.*` (regra S-07).
- Domínio personalizado: `academy.cydef.com.br`.
- `public/_headers` aplica CSP, HSTS, bloqueio de iframe e `noindex`. `public/_redirects` faz o roteamento da SPA.
- Cloudflare Web Analytics desligado no portal; medição, se houver, só pela telemetria própria com consentimento.

## Regras de interface

- Animação de entrada e de interação entre 120 e 240 ms, só nas transições que comunicam estado; progresso anima por `transform`, nunca por largura.
- Esqueleto com a silhueta do conteúdo em todo bloco que depende do banco.
- `prefers-reduced-motion` deixa tudo estático. Não há mais fundo animado: a superfície é lisa.
- O que ainda não foi publicado aparece marcado ("Em breve" na aula, "A publicar" no módulo) e não conta como concluído.
