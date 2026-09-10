import type { BlogPost } from "./posts";

/**
 * Claude Skills para Segurança da Informação - artigo PT.
 * Conteúdo convertido do editorial v2 aprovado (10/09/2026).
 * Capa: public/assets/blog/claude-skills-seguranca-da-informacao-thumb.webp
 */
export const claudeSkillsPost: BlogPost = {
  "slug": "claude-skills-seguranca-da-informacao",
  "title": "Claude Skills para Segurança da Informação: o que são, como funcionam e 50 skills que valem a pena",
  "category": "IA Aplicada",
  "excerpt": "Uma skill é uma pasta com um SKILL.md que ensina o agente a executar uma tarefa do seu jeito, carregada só quando a tarefa aparece. Este guia explica o mecanismo (descoberta, carregamento em três níveis, riscos de instalar instrução de terceiro) e organiza 50 skills úteis para quem trabalha com segurança da informação.",
  "date": "10 de Setembro, 2026",
  "dateISO": "2026-09-10",
  "readTime": "16 min",
  "image": "/assets/blog/claude-skills-seguranca-da-informacao-thumb.webp",
  "author": "Equipe CyDef",
  "tags": [
    "Claude Skills",
    "Agentes de IA",
    "SKILL.md",
    "AppSec",
    "Blue Team",
    "DevSecOps",
    "Análise Estática"
  ],
  "toc": true,
  "sections": [
    {
      "blocks": [
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "Ideia central",
            "body": "Skill não é plugin, não é comando de barra e não é prompt salvo. É uma pasta com um arquivo SKILL.md que ensina o agente a executar uma tarefa do seu jeito, carregada apenas quando a tarefa aparece. O ganho não vem de colecionar skills: vem de transformar o seu processo em instrução reutilizável."
          }
        },
        {
          "type": "note",
          "text": "Autor: Equipe CyDef. Data de verificação das fontes: 10 de setembro de 2026."
        }
      ]
    },
    {
      "heading": "Como esta lista foi montada",
      "blocks": [
        {
          "type": "p",
          "text": "Esta curadoria é feita na perspectiva de quem trabalha com segurança da informação: análise de código, AppSec, SOC e detecção, resposta a incidente, análise de malware, cadeia de suprimentos e gestão de vulnerabilidade. O critério não foi popularidade, e sim utilidade prática: cada item entra porque resolve uma etapa concreta do trabalho. As descrições foram escritas a partir da documentação dos próprios projetos, lendo o SKILL.md e o README de cada repositório, e não a partir de resenhas de terceiros. Os 50 links foram verificados em 10 de setembro de 2026 e todos responderam HTTP 200 na data."
        }
      ]
    },
    {
      "heading": "Resumo executivo",
      "blocks": [
        {
          "type": "p",
          "text": "Instalar uma skill leva um minuto. Escolher a skill certa, e entender o que você está entregando ao agente quando instala, leva mais tempo. O artigo tem duas partes. A primeira explica o mecanismo: o que é uma skill, como o agente descobre e carrega, o que muda em relação a prompt, plugin, comando e MCP, e quais riscos existem ao instalar instrução de terceiro. A segunda é a lista de 50 skills organizadas em oito categorias por etapa do trabalho de segurança, com link, origem e descrição curta."
        }
      ]
    },
    {
      "heading": "1. O gargalo não é o modelo. É a instrução",
      "blocks": [
        {
          "type": "p",
          "text": "Quem usa agente de código ou assistente de IA com frequência reconhece o padrão: o resultado melhora muito quando a instrução é boa e piora muito quando a instrução é vaga. O problema é que a instrução boa costuma existir só na cabeça de quem pediu. Ela é reescrita a cada sessão, com variação, e o agente reaprende o mesmo contexto do zero toda vez."
        },
        {
          "type": "p",
          "text": "Existem três formas comuns de resolver isso, e apenas uma delas escala bem:"
        },
        {
          "type": "list",
          "items": [
            "**Repetir no prompt.** Funciona, mas você paga o custo de digitar e revisar toda vez, e cada sessão tem uma versão ligeiramente diferente do seu processo.",
            "**Guardar em documento.** Melhora a consistência, mas o agente só usa se você lembrar de anexar. Documento não é acionado por contexto, é anexado por decisão humana.",
            "**Empacotar como skill.** O procedimento fica em arquivo, com metadados que dizem quando ele deve ser usado, e o agente carrega sozinho na hora certa."
          ]
        },
        {
          "type": "p",
          "text": "Skill é a terceira opção. Ela resolve um problema antigo de engenharia de prompt: a instrução deixa de ser texto descartável e passa a ser artefato versionável, revisável e reutilizável."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Ponto de partida",
            "body": "Se uma skill não muda o comportamento do agente, ela é só decoração. O critério de sucesso não é ter muitas instaladas, é o agente acertar mais na segunda vez do que acertou na primeira."
          }
        }
      ]
    },
    {
      "heading": "2. O que é uma skill, na prática",
      "blocks": [
        {
          "type": "p",
          "text": "Uma skill é um diretório com um arquivo obrigatório chamado SKILL.md. O nome do diretório é a identidade da skill. Dentro do SKILL.md existem duas partes:"
        },
        {
          "type": "list",
          "items": [
            "**Frontmatter YAML**, com metadados. Os dois campos essenciais são name (o nome da skill) e description (o que ela faz e quando deve ser usada).",
            "**Corpo em Markdown**, com o procedimento: passos em ordem, critérios de conclusão, exemplos e armadilhas conhecidas."
          ]
        },
        {
          "type": "p",
          "text": "Opcionalmente, a skill pode trazer arquivos de apoio, como scripts, referências longas, templates e exemplos. Esses arquivos não precisam ser lidos de imediato: entram em cena só quando o próprio procedimento aponta para eles. É isso que permite uma skill ter bastante conteúdo sem inflar o contexto do agente o tempo todo."
        },
        {
          "type": "p",
          "text": "O esqueleto mínimo é este:"
        },
        {
          "type": "code",
          "text": "---\nname: revisar-alerta-soc\ndescription: Revisa um alerta de SIEM e produz hipótese, evidências e próximo passo.\n  Use quando o usuário colar um alerta bruto ou pedir triagem de alerta.\n---\n\n# Revisão de alerta de SOC\n\n1. Extraia do alerta: regra, host, usuário, processo, horário e origem.\n2. Separe o que é fato do que é inferência.\n3. Levante no máximo três hipóteses, da mais provável para a menos provável.\n4. Para cada hipótese, liste a evidência que a sustentaria ou a derrubaria.\n5. Feche com recomendação, nível de confiança e próximo passo.\n6. Não conclua \"falso positivo\" sem citar a evidência que sustenta a conclusão."
        },
        {
          "type": "p",
          "text": "Repare no que faz esse exemplo funcionar: a descrição diz o que a skill faz e quando usá-la, os passos são imperativos, existe critério de conclusão e existe uma proibição explícita. Skill não é texto bonito sobre um assunto. É instrução operacional."
        }
      ]
    },
    {
      "heading": "3. Como a skill entra em cena: o carregamento em três níveis",
      "blocks": [
        {
          "type": "p",
          "text": "Skill não é carregada inteira na conversa. O carregamento é progressivo, em três níveis, e isso explica por que um agente pode ter dezenas de skills instaladas sem custo absurdo de contexto."
        },
        {
          "type": "table",
          "table": {
            "headers": ["Nível", "O que carrega", "Quando"],
            "rows": [
              ["1. Metadados", "name e description de todas as skills disponíveis", "Sempre, no início da sessão"],
              ["2. Corpo", "O conteúdo do SKILL.md", "Quando a tarefa casa com a descrição"],
              ["3. Apoio", "Scripts, referências, templates e exemplos", "Quando o procedimento pede aquele arquivo"]
            ]
          }
        },
        {
          "type": "p",
          "text": "A consequência prática é direta: **a descrição é a parte mais importante da skill**. É ela que o agente lê antes de decidir, e é ela que define se a skill vai ser acionada na hora certa ou nunca. Descrição genérica como \"ajuda com segurança\" nunca é acionada. Descrição com gatilho, do tipo \"use quando o usuário colar um alerta bruto\", é acionada sem você precisar pedir pelo nome."
        },
        {
          "type": "p",
          "text": "Esse desenho também explica a diferença de custo em relação a outras formas de extensão. Uma integração que despeja 16 mil tokens de ferramentas no contexto é caríssima em toda sessão. A mesma capacidade empacotada como skill ocupa alguns poucos tokens até o momento em que é realmente necessária."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "aviso",
            "title": "Consequência prática",
            "body": "Instalar 40 skills não quebra o agente. Instalar 40 skills com descrições vagas, sim: o agente passa a escolher errado, e às vezes aciona procedimento que não era o caso."
          }
        }
      ]
    },
    {
      "heading": "4. Skill, comando, plugin, MCP: o que é o quê",
      "blocks": [
        {
          "type": "p",
          "text": "O ecossistema usa nomes parecidos para coisas diferentes, e isso gera confusão na hora de escolher. A tabela abaixo separa os conceitos."
        },
        {
          "type": "table",
          "table": {
            "headers": ["Recurso", "O que é", "Quem aciona", "Serve para"],
            "rows": [
              ["Skill", "Pasta com SKILL.md e arquivos de apoio", "O agente, por contexto", "Procedimento, conhecimento e padrão de execução"],
              ["Prompt salvo", "Texto reutilizável", "A pessoa", "Frase de partida, não processo"],
              ["Comando de barra", "Atalho explícito digitado na interface", "A pessoa", "Iniciar um fluxo nomeado"],
              ["Plugin", "Pacote que agrupa skills, comandos, agentes e integrações", "A pessoa instala, o agente usa", "Distribuição de várias capacidades juntas"],
              ["MCP", "Conexão com ferramentas e dados externos", "O agente, via ferramenta", "Acessar sistema, banco e API"],
              ["Subagente", "Sessão separada com contexto próprio", "O agente", "Delegar trabalho longo sem poluir o contexto principal"]
            ]
          }
        },
        {
          "type": "p",
          "text": "A distinção que mais importa: **MCP dá acesso, skill dá método**. Conectar um MCP sem procedimento é entregar uma chave e nenhum manual. Skill sem acesso, por outro lado, ainda é útil: um procedimento de revisão de código, um checklist de hardening ou um padrão de escrita funcionam sem tocar em sistema nenhum."
        }
      ]
    },
    {
      "heading": "5. O que separa uma skill boa de uma pasta bonita",
      "blocks": [
        {
          "type": "p",
          "text": "Ao escrever ou revisar uma skill, estes critérios são os que mais mudam o resultado:"
        },
        {
          "type": "list",
          "items": [
            "**Descrição com gatilho e exclusão.** Diga quando usar e quando não usar. A exclusão evita acionamento errado em tarefa parecida.",
            "**Passos imperativos e curta duração.** \"Execute X, depois verifique Y\" envelhece bem. \"Considere a possibilidade de talvez avaliar\" não muda comportamento.",
            "**Critério de conclusão por passo.** Cada passo precisa de uma condição verificável. Sem isso, o agente considera pronto quando parece pronto.",
            "**Escopo estreito.** Uma skill que faz tudo não é acionada para nada. Prefira várias skills pequenas a uma enciclopédia.",
            "**Sem redundância.** Frase que repete o comportamento padrão do modelo é ruído. Se a linha não muda o comportamento, apague a linha.",
            "**Referência longa em arquivo separado.** O corpo do SKILL.md é o procedimento. Tabela gigante, catálogo de exemplos e documentação extensa vão para arquivos de apoio, carregados só quando necessários.",
            "**Ações perigosas exigem confirmação.** Comando destrutivo, escrita externa e operação em produção precisam de freio explícito."
          ]
        }
      ]
    },
    {
      "heading": "6. Onde as skills ficam e por que isso é portável",
      "blocks": [
        {
          "type": "p",
          "text": "O formato é baseado em arquivo, o que significa que instalar é copiar e organizar diretório. No Claude Code, os locais usuais são a pasta pessoal (~/.claude/skills/) e a pasta do projeto (.claude/skills/). A diferença entre elas é de escopo: skill pessoal vale para todos os seus projetos, skill de projeto acompanha o repositório, vale para o time e entra em revisão de código como qualquer outro arquivo."
        },
        {
          "type": "p",
          "text": "O ponto que costuma passar batido: o formato de skills foi publicado como padrão aberto, o Agent Skills. Uma skill que usa apenas name, description e instruções em Markdown é portável entre ferramentas que implementem o padrão. Isso reduz o risco de apostar em um fornecedor específico: o conhecimento que você escreveu continua utilizável quando a ferramenta mudar."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "Consequência para times de segurança",
            "body": "Skill de projeto é documentação executável do procedimento operacional. Diferente de um wiki, o agente lê e aplica no momento da execução, e a revisão acontece no mesmo pull request que muda o processo."
          }
        }
      ]
    },
    {
      "heading": "7. Segurança: trate skill de terceiro como código de terceiro",
      "blocks": [
        {
          "type": "p",
          "text": "Aqui está o ponto que merece mais atenção do que costuma receber. Skill não é conteúdo inerte. É **instrução que o agente obedece** e, com frequência, **script que o agente executa** com as permissões que ele tem. Isso muda o modelo de risco."
        },
        {
          "type": "p",
          "text": "Riscos concretos ao instalar skill de origem desconhecida:"
        },
        {
          "type": "list",
          "items": [
            "**Injeção de instrução.** O corpo do SKILL.md pode conter instrução que desvia o agente do objetivo do usuário, com ou sem má intenção do autor original.",
            "**Execução com os seus privilégios.** Script de apoio roda no seu ambiente, com acesso a arquivos, variáveis de ambiente e credenciais que estiverem disponíveis na sessão.",
            "**Comando destrutivo.** git push indevido, reset --hard, limpeza de diretório e alteração de configuração: ações que não se desfazem com um Ctrl+Z.",
            "**Exfiltração de dados.** Coleta de arquivos, histórico ou trecho de código e envio para endpoint externo.",
            "**Cadeia de suprimentos.** Repositório abandonado, troca de dono, dependência adicionada depois da sua revisão. A skill que você revisou hoje não é necessariamente a que vai rodar no mês que vem."
          ]
        },
        {
          "type": "p",
          "text": "Checklist antes de instalar uma skill de terceiro:"
        },
        {
          "type": "list",
          "items": [
            "Existe SKILL.md claro e legível de ponta a ponta?",
            "A descrição diz quando a skill deve e quando não deve ser acionada?",
            "Existem exemplos concretos de uso?",
            "Ações perigosas estão condicionadas a confirmação explícita?",
            "O repositório foi atualizado recentemente e tem dono identificável?",
            "A skill resolve uma dor real do seu fluxo, ou é curiosidade?",
            "Os scripts de apoio foram lidos linha por linha?",
            "Algum passo pede credencial, token ou acesso de rede? Se pede, para onde o dado vai?",
            "O comportamento foi testado em repositório isolado antes do repositório de produção?",
            "Existe revisão obrigatória a cada atualização da skill?"
          ]
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Regra prática",
            "body": "Skill de terceiro entra na mesma política de qualquer dependência: dono, versão, escopo, revisão e possibilidade de remoção. Instalar sem ler é o equivalente a rodar script baixado da internet com o seu usuário."
          }
        }
      ]
    },
    {
      "heading": "8. As 50 skills, por etapa do trabalho",
      "blocks": [
        {
          "type": "p",
          "text": "A lista está organizada por etapa do fluxo de segurança, não por popularidade. Cada item traz a origem, que ajuda a calibrar o nível de revisão antes de instalar:"
        },
        {
          "type": "list",
          "items": [
            "**Oficial:** mantida pela Anthropic, no repositório oficial de skills.",
            "**Trail of Bits:** pacote de segurança da Trail of Bits, com skills voltadas a auditoria, análise de código e teste de aplicação. Muitas delas fazem parte do material do Application Security Testing Handbook.",
            "**Comunidade:** projetos independentes, com boa adoção, mas que exigem a leitura do SKILL.md antes do uso em ambiente de produção."
          ]
        },
        {
          "type": "p",
          "text": "Nem toda skill é voltada a teste ofensivo. Boa parte do trabalho de segurança é ler código, escrever relatório, organizar evidência e comunicar risco: por isso a lista inclui documento, planilha e apresentação."
        }
      ]
    },
    {
      "heading": "8.1 Entender o alvo antes de procurar o bug (4)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**audit-context-building** (Trail of Bits): lê o código função por função e grava em arquivo o que cada uma assume e de que depende, antes de começar a caçar bug, sem encher o contexto da conversa. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/audit-context-building/skills/audit-context-building)",
            "**trailmark** (Trail of Bits): constrói grafo de código e de binário para mapear superfície de ataque, raio de impacto, propagação de taint, pontos de entrada e diferenças estruturais; gera diagramas Mermaid e pacotes de contexto para delegar análise a modelos menores. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/trailmark/skills/trailmark)",
            "**entry-point-analyzer** (Trail of Bits): identifica funções externamente chamáveis que alteram estado e as classifica por nível de acesso, gerando relatório estruturado de auditoria. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/entry-point-analyzer/skills/entry-point-analyzer)",
            "**building-secure-contracts** (Trail of Bits): kit de segurança para contratos inteligentes, com scanners de vulnerabilidade para seis blockchains e assistentes de guideline de desenvolvimento. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/building-secure-contracts/skills/secure-workflow-guide)"
          ]
        }
      ]
    },
    {
      "heading": "8.2 Análise estática e detecção no código (6)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**codeql** (Trail of Bits): análise de fluxo de dados e de taint entre funções, com suporte a Python, JavaScript e TypeScript, Go, Java e Kotlin, C e C++, C#, Ruby e Swift. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/static-analysis/skills/codeql)",
            "**semgrep** (Trail of Bits): varredura por padrões com rulesets selecionados e aprovação explícita antes de executar, saída consolidada em SARIF e uso do Semgrep Pro para taint entre arquivos quando disponível. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/static-analysis/skills/semgrep)",
            "**sarif-parsing** (Trail of Bits): lê, agrega, deduplica e filtra SARIF de CodeQL, Semgrep e outros scanners, com integração a pipeline de CI/CD. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/static-analysis/skills/sarif-parsing)",
            "**semgrep-rule-creator** (Trail of Bits): cria regras Semgrep próprias para padrões de bug e vulnerabilidade, com teste e validação da regra antes de usar. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/semgrep-rule-creator/skills/semgrep-rule-creator)",
            "**semgrep-rule-variant-creator** (Trail of Bits): gera variantes de uma regra existente para outras linguagens, com análise de aplicabilidade e validação guiada por teste. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/semgrep-rule-variant-creator/skills/semgrep-rule-variant-creator)",
            "**variant-analysis** (Trail of Bits): a partir de um achado conhecido, procura vulnerabilidades e bugs do mesmo padrão em outras partes do código. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/variant-analysis/skills/variant-analysis)"
          ]
        }
      ]
    },
    {
      "heading": "8.3 Revisão de código e triagem de achados (8)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**differential-review** (Trail of Bits): revisão de segurança focada no que mudou, com análise de histórico via git blame, raio de impacto por contagem de chamadores, verificação de cobertura de teste no código alterado e relatório em markdown. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/differential-review/skills/differential-review)",
            "**fp-check** (Trail of Bits): verifica se um achado é real ou falso positivo, com evidência documentada e veredito explícito para cada item. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/fp-check/skills/fp-check)",
            "**vulnerability-triage-brocards** (Trail of Bits): triagem de relato de vulnerabilidade, CVE ou submissão de bug bounty com sete regras de bolso, decidindo aceitar, descartar ou pedir mais informação antes de escalar para análise profunda. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/vulnerability-triage-brocards/skills/vulnerability-triage-brocards)",
            "**sharp-edges** (Trail of Bits): identifica API propensa a erro, configuração perigosa e desenho que induz a falha de segurança, avaliando se o caminho fácil leva ao uso inseguro. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/sharp-edges/skills/sharp-edges)",
            "**spec-to-code-compliance** (Trail of Bits): confere se o código cumpre a documentação que o especifica, com um agente por requisito, divergência refutada antes de ser reportada e evidência citada linha a linha. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/spec-to-code-compliance/skills/spec-to-code-compliance)",
            "**c-review** (Trail of Bits): revisão de segurança de código C e C++, com cobertura verificada contra um parse do fonte. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/c-review/skills/c-review)",
            "**rust-review** (Trail of Bits): revisão de segurança de Rust com agentes especializados na fronteira safe/unsafe, memória em bloco unsafe, concorrência, negação de serviço por panic, estouro de pilha por recursão, FFI e riscos de runtime assíncrono. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/rust-review/skills/rust-review)",
            "**second-opinion** (Trail of Bits): roda revisão por CLI de LLM externo sobre alterações não commitadas, diffs de branch ou commits específicos, útil como segunda opinião em achado controverso. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/second-opinion/skills/second-opinion)"
          ]
        }
      ]
    },
    {
      "heading": "8.4 Teste, fuzzing e análise de baixo nível (9)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**testing-handbook-skills** (Trail of Bits): conjunto de skills derivado do Application Security Testing Handbook, com libFuzzer, AFL++, Atheris, cargo-fuzz, libafl, OSS-Fuzz, Wycheproof, AddressSanitizer, análise de cobertura e escrita de harness de fuzzing. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/testing-handbook-skills)",
            "**property-based-testing** (Trail of Bits): escreve, revisa e depura teste baseado em propriedade com Hypothesis, fast-check, proptest, jqwik, Echidna e Medusa, cobrindo domínio de entrada em vez de exemplos escolhidos a dedo. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/property-based-testing/skills/property-based-testing)",
            "**mutation-testing** (Trail of Bits): configura campanhas de teste de mutação com mewt para linguagens gerais e muton para contratos TON, definindo escopo, timeout e otimização de execução longa. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/mutation-testing/skills/mutation-testing)",
            "**webapp-testing** (oficial): interage com aplicação web local usando Playwright, verifica funcionalidade, depura comportamento de interface, captura tela e lê log do navegador. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/webapp-testing)",
            "**playwright-skill** (comunidade): exploração e teste de aplicação com Playwright em formato mais leve que integrações MCP grandes. [github.com/lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill)",
            "**firebase-apk-scanner** (Trail of Bits): varre APK Android em busca de configuração insegura de Firebase, incluindo banco aberto, bucket de armazenamento, falha de autenticação e função em nuvem exposta. Para pesquisa autorizada. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/firebase-apk-scanner/skills/firebase-apk-scanner)",
            "**burpsuite-project-parser** (Trail of Bits): busca e extrai dados de arquivo de projeto do Burp Suite para análise de segurança. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/burpsuite-project-parser/skills/burpsuite-project-parser)",
            "**constant-time-analysis** (Trail of Bits): detecta canal lateral de tempo induzido pelo compilador em código criptográfico. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/constant-time-analysis/skills/constant-time-analysis)",
            "**zeroize-audit** (Trail of Bits): detecta ausência de zeragem de dado sensível ou zeragem removida pela otimização do compilador, com análise de assembly e de fluxo de controle. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/zeroize-audit/skills/zeroize-audit)"
          ]
        }
      ]
    },
    {
      "heading": "8.5 Detecção, ameaça e resposta (4)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**yara-rule-authoring** (Trail of Bits): autoria de regra YARA-X com lint e análise de qualidade, cobrindo convenção de nome, seleção de string, otimização de desempenho, migração de YARA legado e redução de falso positivo. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/yara-authoring/skills/yara-rule-authoring)",
            "**last30days** (comunidade): pesquisa discussões recentes em X, Reddit, Hacker News, YouTube e web, útil para acompanhar exploração ativa, debate de técnica e rumor ainda não documentado. [github.com/mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill/tree/main/skills/last30days)",
            "**firecrawl-agent** (comunidade): raspagem, pesquisa e automação de navegador para coleta estruturada de fonte aberta. [github.com/firecrawl/cli](https://github.com/firecrawl/cli/tree/main/skills/firecrawl-agent)",
            "**printing-press** (comunidade): transforma site ou API em interface e CLI mais fácil para o agente operar, caminho curto para montar ferramenta interna de consulta. [github.com/mvanhorn/cli-printing-press](https://github.com/mvanhorn/cli-printing-press/tree/main/skills/printing-press)"
          ]
        }
      ]
    },
    {
      "heading": "8.6 Cadeia de suprimentos e postura de repositório (6)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**supply-chain-risk-auditor** (Trail of Bits): audita dependências npm, PyPI e Go com avisos casados por versão na árvore completa do lockfile, upstream abandonado, concentração de publisher e execução de script na instalação. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/supply-chain-risk-auditor/skills/supply-chain-risk-auditor)",
            "**agentic-actions-auditor** (Trail of Bits): audita workflow de GitHub Actions em busca de vulnerabilidade na integração com agente de IA, incluindo Claude Code Action, Gemini CLI, OpenAI Codex e GitHub AI Inference. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/agentic-actions-auditor/skills/agentic-actions-auditor)",
            "**open-sourcing** (Trail of Bits): prepara repositório para publicação, com higiene de segredo no histórico, escolha de licença, checagem de documentação e CI, e orientação de empacotamento e release. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/open-sourcing/skills/open-sourcing)",
            "**gh-cli** (Trail of Bits): intercepta busca de URL do GitHub e comandos curl e wget, redirecionando para o gh CLI autenticado. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/gh-cli/skills/gh-cli)",
            "**github-triage** (Trail of Bits): faz triagem de issues e pull requests abertos via gh CLI, com merge opcional de PR pronto, fechamento de issue já resolvida com explicação e vínculo com o PR de correção pendente. [github.com/trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/github-triage/skills/github-triage)",
            "**git-guardrails** (comunidade): evita ação perigosa no Git, como push indevido, reset --hard, clean e remoção de branch. [github.com/mattpocock/skills](https://github.com/mattpocock/skills/tree/main/skills/misc/git-guardrails-claude-code)"
          ]
        }
      ]
    },
    {
      "heading": "8.7 Documento, relatório e comunicação (6)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**pdf** (oficial): lê e extrai texto e tabela, junta, divide, gira página, adiciona marca d'água, preenche formulário, criptografa e faz OCR em PDF escaneado. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/pdf)",
            "**docx** (oficial): cria, edita e analisa documento Word, útil para relatório de assessment e plano de ação. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/docx)",
            "**xlsx** (oficial): abre, lê, edita e corrige planilha, com fórmula, formatação e gráfico, incluindo limpeza de dado tabular malformado. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/xlsx)",
            "**pptx** (oficial): cria e edita apresentação, útil para comitê de segurança e briefing de liderança. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/pptx)",
            "**doc-coauthoring** (oficial): coautoria, revisão e edição colaborativa de documento, com foco em consistência entre versões. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring)",
            "**internal-comms** (oficial): escreve aviso interno, atualização de status e comunicado de time, aplicável a comunicado de incidente e aviso de manutenção. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/internal-comms)"
          ]
        }
      ]
    },
    {
      "heading": "8.8 Base de trabalho do profissional de segurança (7)",
      "blocks": [
        {
          "type": "list",
          "items": [
            "**skill-creator** (oficial): cria skill própria com estrutura e instrução reutilizável. É o caminho para transformar o procedimento do seu time em execução automática. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/skill-creator)",
            "**find-skills** (comunidade): encontra skill relevante para uma tarefa específica antes de sair instalando por conta própria. [github.com/vercel-labs/skills](https://github.com/vercel-labs/skills/tree/main/skills/find-skills)",
            "**superpowers** (comunidade): transforma o agente em fluxo de engenharia completo, com brainstorm, especificação, plano, TDD, subagentes, revisão e depuração. [github.com/obra/superpowers](https://github.com/obra/superpowers)",
            "**planning-with-files** (comunidade): cria planos persistentes em arquivo para tarefa longa, evitando perda de contexto entre sessões. [github.com/OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files)",
            "**karpathy-guidelines** (comunidade): força simplicidade, mudança cirúrgica, checagem e raciocínio antes de sair codando. [github.com/multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills/tree/main/skills/karpathy-guidelines)",
            "**mcp-builder** (oficial): cria servidor MCP para conectar o agente a ferramenta interna, como SIEM, fila de ticket, inventário ou base de conhecimento. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/mcp-builder)",
            "**claude-api** (oficial): apoio para integrar a API em produto e automação interna, incluindo tratamento de erro e custo. [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/claude-api)"
          ]
        }
      ]
    },
    {
      "heading": "9. Como escolher sem virar acumulador digital",
      "blocks": [
        {
          "type": "p",
          "text": "O erro mais comum não é instalar a skill errada. É instalar trinta de uma vez, não perceber qual delas mudou o resultado e continuar carregando peso morto."
        },
        {
          "type": "list",
          "items": [
            "**Escolha pela dor, não pela curiosidade.** Liste o que você repete toda semana: triagem de achado, revisão de diff, escrita de relatório, checagem de dependência. Comece pelas skills que atacam isso.",
            "**Instale de três a cinco, não cinquenta.** Cada skill nova muda o comportamento do agente. Mudança em bloco é mudança que você não consegue atribuir.",
            "**Meça a diferença.** Antes e depois, na mesma tarefa. Se o resultado não mudou, a skill não está funcionando, e o problema costuma estar na descrição.",
            "**Remova sem drama.** Skill que não é acionada há um mês é candidata a sair. Contexto limpo é parte do desempenho.",
            "**Escreva as suas.** As 50 desta lista resolvem dores comuns da área. A skill que mais muda o seu resultado é a que descreve o seu processo: o seu checklist de triagem, o seu formato de relatório, o seu critério de severidade, a sua regra de detecção.",
            "**Versione o que é do time.** Skill de projeto vive no repositório e passa por revisão. É a forma mais barata de transformar padrão interno em execução automática."
          ]
        },
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "O ponto que fecha o artigo",
            "body": "O melhor uso de skills não é colecionar. É transformar o seu jeito de trabalhar em instrução reutilizável, revisável e portável."
          }
        }
      ]
    },
    {
      "heading": "10. Conclusão",
      "blocks": [
        {
          "type": "p",
          "text": "Skill é uma tecnologia simples: uma pasta, um arquivo, metadados e um procedimento. O que ela muda não é a capacidade do modelo, é a repetibilidade do resultado. Em vez de reexplicar contexto a cada sessão, o processo fica escrito, versionado, acionado por contexto e auditável."
        },
        {
          "type": "p",
          "text": "Para quem trabalha com segurança, a leitura tem duas camadas. A primeira é de produtividade: triagem de achado, revisão de diff, caça a variante, checagem de dependência, relatório de assessment e padrão de escrita deixam de ser conhecimento tácito. A segunda é de risco: skill de terceiro é código de terceiro, com privilégio do agente e execução no seu ambiente. Quem instala sem ler está ampliando superfície de ataque com um clique."
        },
        {
          "type": "p",
          "text": "Comece pequeno, escolha pela dor, meça o efeito e escreva a skill que descreve o seu processo. Esse é o ganho que se acumula."
        }
      ]
    }
  ],
  "sources": [
    { "label": "Anthropic: documentação oficial de Agent Skills", "url": "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview" },
    { "label": "Anthropic: repositório oficial de skills", "url": "https://github.com/anthropics/skills" },
    { "label": "Trail of Bits: pacote de skills de segurança", "url": "https://github.com/trailofbits/skills" },
    { "label": "Trail of Bits: Application Security Testing Handbook", "url": "https://appsec.guide" },
    { "label": "Vercel Labs: repositório de skills", "url": "https://github.com/vercel-labs/skills" }
  ]
};
