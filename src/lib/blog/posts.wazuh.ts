import type { BlogPost } from "./posts";

/**
 * Wazuh em Movimento — artigo PT (Fase 2/3 do projeto CyDef Labs).
 * Conteúdo convertido do editorial aprovado (v1, 04/09/2026); ver changelog.
 */
export const wazuhEmMovimentoPost: BlogPost = {
  "slug": "wazuh-em-movimento",
  "title": "Wazuh em Movimento: como avaliar, estabilizar e amadurecer um SIEM que já está em produção",
  "category": "SOC Engineering",
  "excerpt": "Um framework prático para quem herda um Wazuh já em produção: medir o caminho do evento entre a fonte e o analista, provar drops e lacunas de cobertura e evoluir o SIEM sem transformar produção em laboratório.",
  "date": "04 de Setembro, 2026",
  "dateISO": "2026-09-04",
  "readTime": "31 min",
  "image": "/assets/blog/wazuh-em-movimento-thumb.webp",
  "author": "Everton Nascimento",
  "authorRole": "Cybersecurity | SOC | Incident Response | Detection Engineering | Wazuh",
  "tags": [
    "Wazuh",
    "SIEM",
    "SOC",
    "Detection Engineering",
    "Blue Team",
    "Security Operations"
  ],
  "toc": true,
  "sections": [
    {
      "heading": "Nota de publicação e anonimização",
      "blocks": [
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "Ideia central",
            "body": "Um Wazuh pode estar \"verde\" no dashboard, com serviços ativos e agentes conectados, e ainda assim perder eventos, concentrar carga em um único nó, indexar ruído demais, operar com inventário obsoleto e oferecer menos cobertura de detecção do que parece. O assessment serve para provar o que acontece entre a fonte e o analista, antes de começar a mexer."
          }
        },
        {
          "type": "p",
          "text": "Este material nasceu de um cenário recorrente em operações de segurança: assumir a responsabilidade por um Wazuh que já existe, já recebe dados e já suporta uma operação real. Os exemplos práticos foram derivados de um assessment técnico real, mas foram deliberadamente anonimizados. Nenhum nome de empresa, endereço IP real, hostname, domínio, segredo, token ou informação que permita identificar o ambiente é reproduzido neste documento. Os números são apresentados de forma agregada ou arredondada quando o objetivo é demonstrar o raciocínio. O foco não é expor um ambiente específico: é mostrar uma metodologia que pode ser reaplicada em qualquer organização que precise entender se o SIEM está apenas funcionando ou se está realmente entregando segurança."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Regra de ouro",
            "body": "este artigo não é um roteiro de mudança cega. Ele é um roteiro de investigação. Em produção, primeiro se mede. Depois se explica. Só então se muda, com rollback e critério de validação."
          }
        }
      ]
    },
    {
      "heading": "Resumo executivo",
      "blocks": [
        {
          "type": "p",
          "text": "A maior parte do conteúdo sobre Wazuh ensina a instalar, integrar e criar regras. Isso é necessário, mas existe um problema menos discutido: o que fazer quando você herda um ambiente que já está em produção e não sabe exatamente como ele foi construído, quais decisões foram tomadas, o que está sendo perdido e quais controles estão realmente funcionando."
        },
        {
          "type": "p",
          "text": "Nesse contexto, a primeira tarefa não deveria ser criar mais regras, aumentar filas ou adicionar CPU. A primeira tarefa deveria ser **transformar o ambiente em algo observável**. Isso significa reconstruir a arquitetura, medir o caminho dos eventos, comparar carga entre nós, identificar drops, revisar buffers, entender as fontes de log, avaliar o Indexer, mapear regras e decoders, medir cobertura de detecção, revisar a segurança do próprio SIEM e converter tudo em um plano de ação priorizado."
        },
        {
          "type": "p",
          "text": "O framework proposto divide essa atividade em fases. Cada fase tem objetivo, perguntas, evidências, comandos, critérios de decisão e entregáveis. O resultado final não é uma coleção de prints: é um **AS IS técnico**, uma **análise de gaps**, uma **visão de maturidade**, um desenho **TO BE** e um **roadmap** que permita evoluir o Wazuh sem transformar a produção em laboratório."
        },
        {
          "type": "figure",
          "figure": {
            "src": "/assets/blog/wazuh-em-movimento-fig1.svg",
            "alt": "O caminho que precisa ser provado durante o assessment — da fonte de log ao analista.",
            "caption": "O caminho que precisa ser provado durante o assessment — da fonte de log ao analista."
          }
        }
      ]
    },
    {
      "heading": "1. O problema que quase ninguém discute: entrar no carro em movimento",
      "blocks": [
        {
          "type": "p",
          "text": "Instalar Wazuh do zero é um problema de projeto. Herdar Wazuh em produção é um problema de investigação. No primeiro caso, você escolhe arquitetura, grupos, retenção, fontes, casos de uso e critérios de capacidade. No segundo, todas essas escolhas já foram feitas por alguém, em algum momento, com premissas que podem não existir mais."
        },
        {
          "type": "p",
          "text": "O ambiente pode ter sido implantado por etapas. Pode ter recebido integrações emergenciais. Pode ter sido ajustado após incidentes. Pode ter configurações legadas, regras abandonadas, agentes que não existem mais, portas abertas para tecnologias descontinuadas, filas aumentadas sem análise de causa e um cluster que existe no diagrama, mas não distribui carga de verdade."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "O ponto mais importante",
            "body": "quando você assume um SIEM em movimento, o primeiro objetivo não é \"melhorar o Wazuh\". É descobrir qual Wazuh você realmente tem."
          }
        },
        {
          "type": "p",
          "text": "É por isso que o assessment precisa acontecer antes do tuning. O tuning modifica sintomas. O assessment explica o sistema."
        }
      ]
    },
    {
      "heading": "2. Os princípios que evitam diagnósticos ruins",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Princípio",
              "Aplicação prática"
            ],
            "rows": [
              [
                "Observe antes de alterar",
                "A primeira coleta deve ser uma fotografia do estado atual. Mudanças prematuras contaminam a evidência e dificultam provar a causa."
              ],
              [
                "Separe incidente de maturidade",
                "Um incidente pode revelar um gargalo, mas não deve limitar o assessment. A causa do incidente e as dívidas estruturais precisam ser registradas separadamente."
              ],
              [
                "Siga o evento ponta a ponta",
                "Quando um evento \"não aparece\", descubra em qual camada ele deixou de existir. Agent, rede, remoted, analysisd, arquivo de alerta, Filebeat, Indexer e Dashboard são problemas diferentes."
              ],
              [
                "Contador acumulado não é fotografia",
                "Queue usage igual a zero agora não invalida um contador histórico de drops. Picos transitórios desaparecem rápido. Combine estado atual, contadores e séries temporais."
              ],
              [
                "Cluster não significa distribuição",
                "Dois Managers conectados podem representar um cluster saudável do ponto de vista de sincronização e, ao mesmo tempo, 99% da carga pode estar em um único nó."
              ],
              [
                "Fila maior não é capacity planning",
                "Aumentar buffer pode absorver burst, mas não resolve geração sustentada acima da capacidade de processamento. Em alguns casos, apenas adia a perda."
              ],
              [
                "Log não é sinônimo de valor",
                "Coletar tudo pode ser útil para forense, mas fazer toda telemetria competir no mesmo pipeline de detecção pode reduzir a capacidade de identificar o que é realmente importante."
              ],
              [
                "Toda mudança precisa de hipótese e critério de sucesso",
                "Se não existe uma métrica que prove que a mudança funcionou, ela não está concluída."
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "3. O framework de assessment",
      "blocks": [
        {
          "type": "p",
          "text": "A sequência abaixo foi desenhada para reduzir o risco de conclusões precipitadas. Ela começa pela infraestrutura, atravessa o pipeline de dados, chega à qualidade de detecção e termina em governança e evolução contínua."
        },
        {
          "type": "figure",
          "figure": {
            "src": "/assets/blog/wazuh-em-movimento-fig2.svg",
            "alt": "Visão geral das fases do framework.",
            "caption": "Visão geral das fases do framework."
          }
        }
      ]
    },
    {
      "heading": "Fase 0 — Preparação, escopo e preservação da evidência",
      "blocks": [
        {
          "type": "p",
          "text": "Antes do primeiro comando, defina o que o assessment precisa responder. Uma investigação sem perguntas claras tende a produzir centenas de evidências sem conclusão."
        },
        {
          "type": "p",
          "text": "**Objetivos**"
        },
        {
          "type": "list",
          "items": [
            "Identificar o escopo: Managers, Workers, Indexers, Dashboard, collectors, agentes, integrações e serviços dependentes.",
            "Definir a janela de observação e o período de retenção disponível.",
            "Registrar o incidente ou motivador sem transformar o incidente no único objetivo do trabalho.",
            "Congelar mudanças não emergenciais durante a coleta inicial, sempre que operacionalmente possível.",
            "Definir responsáveis por Wazuh, rede, firewall, Linux, Windows, banco, cloud e aplicações para validações posteriores."
          ]
        },
        {
          "type": "p",
          "text": "**O que não coletar**"
        },
        {
          "type": "p",
          "text": "Evite colocar segredos dentro do assessment. Não copie `client.keys`, private keys, senhas, tokens, webhooks completos ou certificados privados. Se um segredo aparecer em um arquivo de configuração, registre o achado e mascare o valor."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Boa prática",
            "body": "crie um diretório ou repositório de evidências com data, host, comando, responsável e hash do arquivo quando o contexto exigir rastreabilidade. Assessment sem organização vira retrabalho."
          }
        }
      ]
    },
    {
      "heading": "Fase 1 — Inventário técnico e arquitetura real",
      "blocks": [
        {
          "type": "p",
          "text": "O primeiro produto do assessment é o AS IS. Não confie apenas em um desenho existente: prove a função de cada nó, versão, capacidade, interface, serviço e dependência."
        },
        {
          "type": "p",
          "text": "**Perguntas que precisam ser respondidas**"
        },
        {
          "type": "list",
          "items": [
            "Quantos servidores compõem a solução e qual papel cada um executa?",
            "Quais versões de Wazuh, Filebeat, Indexer, Dashboard, Java e sistema operacional estão instaladas?",
            "CPU, RAM, disco e inode são suficientes para o comportamento atual?",
            "Os relógios estão sincronizados? Existe diferença de timezone ou clock skew entre fontes e SIEM?",
            "Existe manutenção pendente, reboot required, patch debt ou uptime excessivamente longo?",
            "Quais portas estão abertas e em quais interfaces os serviços escutam?"
          ]
        },
        {
          "type": "p",
          "text": "**Coleta base**"
        },
        {
          "type": "code",
          "text": "hostnamectl / ip -br a / timedatectl / uptime / nproc / free -h / df -hT / df -i / lsblk\nsystemctl --failed / /var/ossec/bin/wazuh-control info"
        },
        {
          "type": "p",
          "text": "Em Indexers, complemente com versão do pacote, JVM, swap, limites de memória e utilização de storage. Em ambientes herdados, problemas aparentemente \"de Wazuh\" podem ser pressão de memória, swap, disco ou relógio."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Exemplo anonimizado",
            "body": "em um assessment real, os serviços apareciam ativos e o ambiente parecia estável. A coleta básica revelou relógios sem sincronização efetiva, cerca de 40 segundos de diferença entre uma fonte crítica e o Manager, mais de um ano de uptime em componentes centrais, Indexers com aproximadamente 70% do disco ocupado e uso relevante de swap. Nada disso aparecia como \"incidente Wazuh\" no dashboard."
          }
        }
      ]
    },
    {
      "heading": "Fase 2 — Cluster de Managers e distribuição de carga",
      "blocks": [
        {
          "type": "p",
          "text": "Um cluster Wazuh precisa ser avaliado em duas dimensões: **sincronização** e **utilização**. A primeira mostra se os nós compartilham estado. A segunda mostra se a capacidade horizontal está realmente sendo usada."
        },
        {
          "type": "p",
          "text": "**Coletas essenciais**"
        },
        {
          "type": "code",
          "text": "sudo /var/ossec/bin/wazuh-control status\nsudo /var/ossec/bin/cluster_control -l\nsudo /var/ossec/bin/cluster_control -i more\nsudo /var/ossec/bin/cluster_control -a"
        },
        {
          "type": "p",
          "text": "A documentação do Wazuh recomenda distribuir conexões de agentes entre nós e apresenta load balancer como abordagem preferencial para ambientes clusterizados [1][2]."
        },
        {
          "type": "p",
          "text": "**O que medir**"
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Métrica",
              "Por que importa"
            ],
            "rows": [
              [
                "Agentes ativos por nó",
                "Mostra se a capacidade está distribuída ou se um Manager virou ponto de concentração."
              ],
              [
                "Sessões TCP por nó",
                "Ajuda a confirmar a distribuição observada no cluster_control."
              ],
              [
                "Eventos por nó",
                "Compara carga real, não apenas quantidade de agentes."
              ],
              [
                "Sincronização de grupos, rules e decoders",
                "Evita que um Worker processe com configuração diferente."
              ],
              [
                "Falhas no cluster.log",
                "Revela problemas transitórios de integridade ou conectividade."
              ]
            ]
          }
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Exemplo anonimizado",
            "body": "o cluster tinha Master e Worker aparentemente saudáveis. Porém 97 agentes ativos estavam no Master e apenas 1 no Worker. O mesmo desequilíbrio aparecia nas sessões TCP. A lição é simples: ter cluster não significa ter distribuição."
          }
        },
        {
          "type": "p",
          "text": "**Conclusão que o assessment deve produzir:** classifique o cluster como *sincronizado ou não sincronizado* e, separadamente, como *balanceado ou desbalanceado*. Não misture os dois conceitos."
        }
      ]
    },
    {
      "heading": "Fase 3 — Pipeline de ingestão, filas e drops",
      "blocks": [
        {
          "type": "p",
          "text": "Esta fase responde à pergunta mais importante de um SIEM: **o que chega ao ambiente é processado integralmente?** A resposta precisa ser baseada em contadores, não em sensação."
        },
        {
          "type": "p",
          "text": "**Comece pelo remoted e pelo analysisd**"
        },
        {
          "type": "code",
          "text": "sudo cat /var/ossec/var/run/wazuh-remoted.state\nsudo cat /var/ossec/var/run/wazuh-analysisd.state"
        },
        {
          "type": "p",
          "text": "O arquivo `wazuh-analysisd.state` é atualizado periodicamente e expõe eventos recebidos, processados, descartados, além de utilização e tamanho das filas internas [6]. O Wazuh também disponibiliza estatísticas detalhadas por tipo de evento via API. Se a fila selecionada no analysisd estiver cheia, o evento é descartado [7][8]."
        },
        {
          "type": "p",
          "text": "**Por que separar remoted de analysisd**"
        },
        {
          "type": "p",
          "text": "O remoted recebe eventos de agentes em conexões seguras. Já o analysisd processa diferentes categorias de eventos. Um contador de `discarded_count` igual a zero no remoted não prova que o pipeline está íntegro — o drop pode ocorrer depois."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Exemplo anonimizado",
            "body": "em um ambiente real, o remoted apresentava zero descartes, enquanto o analysisd acumulava mais de 211 mil eventos descartados. O breakdown mostrou que mais de 209 mil eram Syslog, e Syslog representava aproximadamente três quartos da carga recebida pelo motor de análise. Os contadores pertenciam a menos de dois dias de uptime do daemon, não ao longo uptime do servidor. O problema deixou de ser \"o Wazuh está perdendo evento\" e passou a ser \"o analysisd está descartando Syslog\". Essa mudança de precisão transforma o plano de ação."
          }
        },
        {
          "type": "p",
          "text": "**Não confunda estado atual com histórico**"
        },
        {
          "type": "p",
          "text": "É comum encontrar `event_queue_usage` igual a 0% ao mesmo tempo em que `events_dropped` é maior que zero. Isso acontece quando a saturação foi transitória. Para capturar o comportamento, monitore o arquivo de estado em intervalos curtos durante períodos de carga."
        },
        {
          "type": "code",
          "text": "while true; do\n  echo \"===== $(date -Is) =====\"\n  grep -E \"events_received|events_dropped|event_queue_usage|rule_matching_queue_usage\" \\\n    /var/ossec/var/run/wazuh-analysisd.state\n  sleep 5\ndone | tee /tmp/analysisd_watch.log"
        },
        {
          "type": "p",
          "text": "**Use o breakdown para localizar o tipo de evento**"
        },
        {
          "type": "p",
          "text": "Ajustar todas as queues ao mesmo tempo é uma resposta ruim. A própria documentação recomenda observar quais categorias apresentam drop e ajustar somente o que precisa ser ajustado [8]. A investigação deve responder: Syslog? EventChannel? Logcollector? Syscheck? Syscollector? Rule matching? A resposta define o próximo passo."
        },
        {
          "type": "p",
          "text": "Se as filas internas continuam no valor padrão de 16.384 e existe drop comprovado, isso passa a ser evidência para capacity analysis. O valor padrão, sozinho, não é um problema. O problema é manter o padrão diante de um comportamento que já demonstrou ultrapassar a capacidade momentânea."
        }
      ]
    },
    {
      "heading": "3.1 — Quando o problema é Syslog",
      "blocks": [
        {
          "type": "p",
          "text": "Syslog remoto merece uma trilha própria, porque a fila remota de eventos de agentes não se aplica a Syslog. No Wazuh, `queue_size` do bloco `remote` em conexão `secure` está relacionado a eventos de agentes, não aos eventos Syslog [9]."
        },
        {
          "type": "code",
          "text": "sudo grep -n -A15 -B3 '<remote>' /var/ossec/etc/ossec.conf\nsudo ss -lunp | grep -E ':<PORTA1>|:<PORTA2>|:<PORTA3>'"
        },
        {
          "type": "p",
          "text": "Mapeie protocolo, porta, allowed-ips, interface de escuta e redundância. Syslog UDP precisa ser tratado com atenção porque a perda pode acontecer antes de o evento chegar à aplicação e, portanto, não aparecer no contador de drops do analysisd."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Exemplo anonimizado",
            "body": "em uma janela de 60 segundos, praticamente todo o Syslog observado pertencia a firewalls, com algo próximo de 1.000 datagramas por segundo. Duas fontes respondiam por cerca de 95% do volume. O Worker recebia zero Syslog: todo o fluxo estava concentrado no Master via UDP."
          }
        }
      ]
    },
    {
      "heading": "3.2 — Descubra o conteúdo antes de reduzir o volume",
      "blocks": [
        {
          "type": "p",
          "text": "Volume alto não é sinônimo de ruído. Em uma análise de firewalls, o perfil das três principais fontes mostrou aproximadamente 72% a 81% de TRAFFIC e 17% a 26% de THREAT. Isso muda completamente a decisão: filtrar indiscriminadamente poderia eliminar telemetria importante."
        },
        {
          "type": "p",
          "text": "O objetivo é classificar o que precisa ser analisado em tempo real, o que precisa ser retido para investigação e o que representa telemetria operacional repetitiva. THREAT, SYSTEM, USERID, autenticação, mudanças administrativas e eventos de segurança normalmente exigem prioridade. TRAFFIC permitido pode ter alto valor forense, mas precisa ser dimensionado e tratado conscientemente."
        }
      ]
    },
    {
      "heading": "3.3 — Use archives para descobrir top talkers",
      "blocks": [
        {
          "type": "p",
          "text": "Quando os archives estão habilitados, eles permitem analisar todos os eventos recebidos, inclusive os que não geraram alertas [10]. Isso é extremamente útil para descobrir origens, locations, aplicações e padrões de volume."
        },
        {
          "type": "code",
          "text": "sudo tail -n 500000 /var/ossec/logs/archives/archives.json | \\\n  jq -r '.location // \"sem_location\"' | sort | uniq -c | sort -nr | head -50"
        },
        {
          "type": "p",
          "text": "Atenção ao custo: archives podem consumir storage de forma significativa e precisam fazer parte do capacity planning e da política de retenção [10]."
        }
      ]
    },
    {
      "heading": "Fase 4 — Agents, client_buffer, grupos e lifecycle",
      "blocks": [
        {
          "type": "p",
          "text": "A Fase 3 olha o que acontece no Manager. A Fase 4 olha o que pode estar sendo perdido antes de o evento chegar ao Manager. É aqui que entram client_buffer, antiflooding, grupos, sincronização e higiene do inventário."
        }
      ]
    },
    {
      "heading": "4.1 — Inventarie grupos e configuração centralizada",
      "blocks": [
        {
          "type": "code",
          "text": "sudo /var/ossec/bin/agent_groups -l\nsudo find /var/ossec/etc/shared -maxdepth 2 -type f -name 'agent.conf' -print\nsudo grep -Rni -A8 -B3 '<client_buffer>' /var/ossec/etc/shared/"
        },
        {
          "type": "p",
          "text": "O Wazuh permite distribuir configuração por `agent.conf`, e um agente pode pertencer a vários grupos. As configurações são mescladas e o último grupo tem maior prioridade em caso de conflito [5]. Por isso, \"o agente está no grupo Windows\" não é suficiente: é necessário entender a **configuração resultante**."
        }
      ]
    },
    {
      "heading": "4.2 — Entenda o client_buffer antes de mexer",
      "blocks": [
        {
          "type": "p",
          "text": "Por padrão, o client_buffer tem `queue_size` de 5.000 eventos e `events_per_second` de 500. O tamanho permitido vai até 100.000 e o throughput até 1.000 EPS [3]."
        },
        {
          "type": "code",
          "text": "<client_buffer>\n  <disabled>no</disabled>\n  <queue_size>5000</queue_size>\n  <events_per_second>500</events_per_second>\n</client_buffer>"
        },
        {
          "type": "callout",
          "callout": {
            "kind": "ponto",
            "title": "Ponto crítico",
            "body": "buffer grande não aumenta automaticamente a capacidade de escoamento. Se o agente produz 800 EPS de forma sustentada e só pode transmitir 500 EPS, a fila cresce 300 eventos por segundo até ficar cheia."
          }
        },
        {
          "type": "p",
          "text": "Com `queue_size` de 100.000, uma diferença sustentada de 300 EPS encheria a fila em pouco mais de cinco minutos. É por isso que `queue_size` e `events_per_second` precisam ser avaliados juntos."
        }
      ]
    },
    {
      "heading": "4.3 — Procure evidência de antiflooding",
      "blocks": [
        {
          "type": "p",
          "text": "As regras 202 a 205 do Wazuh ajudam a identificar o estado da fila do agente. A regra 203 indica queue cheia e alerta que eventos podem ser perdidos; a 204 indica flooding; a 205 registra retorno ao normal [4][8]."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Rule ID",
              "Interpretação operacional"
            ],
            "rows": [
              [
                "202",
                "Fila atingiu o nível de warning, por padrão 90%."
              ],
              [
                "203",
                "Fila cheia. Eventos podem ser perdidos."
              ],
              [
                "204",
                "Fila em estado flooded. Investigar configuração e geração de eventos."
              ],
              [
                "205",
                "Fila voltou ao nível normal."
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "Pesquise por um período representativo, por exemplo 30 dias, e agregue por `agent.name` e `rule.id`. O número bruto de rule 203 não é igual ao número de incidentes, porque a regra pode repetir enquanto a fila permanece cheia. Construa **episódios** a partir da sequência 202 → 203/204 → 205."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Exemplo anonimizado",
            "body": "em 30 dias, um ambiente apresentou 908 alertas de antiflooding, correspondentes a 83 episódios distintos de saturação. Foram 681 registros de queue full, e em 47 episódios a fila chegou ao estado flooded. Quatro agentes concentraram todo o problema. O buffer já estava configurado em 100.000 eventos (o limite máximo) e o throughput permanecia em 500 EPS. Um dos top talkers era justamente o único agente conectado ao Worker, enquanto o Worker não apresentava drops. Esse cruzamento foi decisivo: o gargalo daquele caso estava no próprio agente ou na geração local, não na capacidade do Manager. A conclusão não foi \"aumentar a fila\" — a fila já estava no máximo. A investigação passou a ser \"qual workload local produz o burst e por quê?\"."
          }
        }
      ]
    },
    {
      "heading": "4.4 — Procure padrão temporal e causalidade local",
      "blocks": [
        {
          "type": "p",
          "text": "Em um dos agentes Linux, os episódios de flooding apareciam repetidamente por volta do mesmo horário. Isso é sinal para correlacionar cron, systemd timers, backups, pipelines, rotação de logs, scanners, FIM e jobs de aplicação. Em um servidor de banco, o maior episódio permaneceu saturado por cerca de dez minutos. São problemas que exigem análise do host, não do Manager."
        }
      ]
    },
    {
      "heading": "4.5 — Não confunda agentes desconectados com falha atual",
      "blocks": [
        {
          "type": "p",
          "text": "Um inventário com muitos agentes disconnected pode indicar problema grave, ou apenas dívida histórica. Use `lastKeepAlive`, `disconnection_time` e reconciliação com CMDB. Em um caso real, havia 235 agentes registrados, 137 desconectados — mas 136 desses estavam sem comunicar havia pelo menos 30 dias e dezenas não reportavam havia mais de um ano. A leitura correta era \"inventário não higienizado\", não \"58% do parque caiu hoje\"."
        }
      ]
    },
    {
      "heading": "4.6 — Verifique consistência de grupos e sincronização",
      "blocks": [
        {
          "type": "p",
          "text": "Compare sistema operacional detectado, grupos atribuídos e `group_config_status`. Em um ambiente analisado, todos os 98 agentes ativos estavam synced. Apenas três agentes ativos estavam fora do grupo especializado esperado para o sistema operacional. Esse detalhe evitou uma conclusão injusta de que todo o modelo de grupos estava quebrado."
        }
      ]
    },
    {
      "heading": "4.7 — Versionamento também é maturidade",
      "blocks": [
        {
          "type": "p",
          "text": "Registre versões de agentes e compare com o Manager. Fragmentação excessiva indica ausência de lifecycle. O Wazuh, por padrão, não aceita agentes com versão superior ao Manager quando a opção `allow_higher_versions` permanece desabilitada [11]. Mesmo quando a comunicação funciona, o assessment precisa registrar a condição fora do padrão de compatibilidade garantida e propor política de atualização."
        }
      ]
    },
    {
      "heading": "Fase 5 — Cobertura de fontes de log e qualidade da telemetria",
      "blocks": [
        {
          "type": "p",
          "text": "Depois de provar que o pipeline funciona, chega a pergunta mais incômoda: **estamos recebendo aquilo que deveríamos receber?** Um SIEM pode processar milhões de eventos e ainda estar cego para os ativos que realmente importam."
        },
        {
          "type": "p",
          "text": "**Construa uma matriz de Log Source Coverage**"
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Fonte",
              "Valor de segurança",
              "Perguntas"
            ],
            "rows": [
              [
                "Windows Security",
                "Identidade, autenticação, privilégio",
                "Integrado? Canais? Retenção?"
              ],
              [
                "PowerShell",
                "Execução e administração",
                "Operational e ScriptBlock?"
              ],
              [
                "Sysmon",
                "Telemetria de endpoint",
                "Existe? Configuração? Ruído?"
              ],
              [
                "Linux auth/auditd",
                "Autenticação e atividade privilegiada",
                "Quais hosts e regras?"
              ],
              [
                "Firewall/WAF/F5",
                "Rede, ataques, políticas",
                "Protocolo, EPS, log type, criticidade"
              ],
              [
                "AD/Entra/IdP",
                "Identidade",
                "Cobertura de sign-in, admin, MFA, mudanças"
              ],
              [
                "DNS/Proxy/VPN",
                "Navegação e acesso remoto",
                "Fontes, volume e casos de uso"
              ],
              [
                "Cloud",
                "CloudTrail, Azure, GCP etc.",
                "Contas, regiões, buckets, APIs"
              ],
              [
                "EDR/XDR",
                "Detecção de endpoint",
                "Integração e redundância"
              ],
              [
                "Bancos e aplicações críticas",
                "Transações e trilha de auditoria",
                "Eventos úteis e volume"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "Não avalie apenas \"integrado ou não\". Registre volume, formato, decoder, timestamp, criticidade, owner, casos de uso dependentes e qualidade do dado."
        },
        {
          "type": "p",
          "text": "**O que fazer com uma fonte muito volumosa**"
        },
        {
          "type": "list",
          "items": [
            "Provar quem gera o volume e em qual horário.",
            "Classificar tipos de evento e severidades.",
            "Descobrir se poucas políticas ou aplicações geram a maior parte dos logs.",
            "Separar telemetria necessária para detecção em tempo real de telemetria voltada a hunting e forense.",
            "Avaliar redução de ruído na origem antes de aumentar infraestrutura.",
            "Preservar eventos de alto valor e validar qualquer filtro com casos de uso existentes."
          ]
        }
      ]
    },
    {
      "heading": "Fase 6 — Transporte de alertas, Indexer e Dashboard",
      "blocks": [
        {
          "type": "p",
          "text": "O evento pode ter sido processado e ainda assim não aparecer no Dashboard. Por isso a investigação precisa continuar após `alerts.json`."
        }
      ]
    },
    {
      "heading": "6.1 — Filebeat e forwarding",
      "blocks": [
        {
          "type": "code",
          "text": "sudo systemctl status filebeat --no-pager -l\nsudo filebeat test config\nsudo filebeat test output\nsudo journalctl -u filebeat --since \"24 hours ago\" --no-pager"
        },
        {
          "type": "p",
          "text": "Procure retries, timeout, connection reset, bulk errors, backoff, falha de TLS e backlog. O objetivo é responder: o Manager gerou o alerta, mas o transporte falhou?"
        }
      ]
    },
    {
      "heading": "6.2 — Saúde do Indexer",
      "blocks": [
        {
          "type": "code",
          "text": "curl -k -u <usuario> https://localhost:9200/_cluster/health?pretty\ncurl -k -u <usuario> https://localhost:9200/_cat/nodes?v\ncurl -k -u <usuario> https://localhost:9200/_cat/indices?v\ncurl -k -u <usuario> https://localhost:9200/_cat/shards?v\ncurl -k -u <usuario> https://localhost:9200/_cat/thread_pool/write?v"
        },
        {
          "type": "callout",
          "callout": {
            "kind": "aviso",
            "title": "Aviso",
            "body": "nunca coloque senha em evidência ou print. Use entrada interativa, variável protegida ou mecanismo de autenticação adequado."
          }
        }
      ]
    },
    {
      "heading": "6.3 — Memória, heap e swap",
      "blocks": [
        {
          "type": "p",
          "text": "A documentação do Wazuh recomenda evitar que a JVM do Indexer seja swapada e sugere heap em torno de metade da RAM, com Xms e Xmx iguais [12]."
        },
        {
          "type": "code",
          "text": "grep -E '^-Xm[sx]' /etc/wazuh-indexer/jvm.options\nswapon --show\nsysctl vm.swappiness\nsystemctl show wazuh-indexer -p LimitMEMLOCK\nPID=$(pgrep -f 'org.opensearch.bootstrap.OpenSearch' | head -1)\ngrep -E 'VmRSS|VmSwap' /proc/$PID/status"
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Exemplo anonimizado",
            "body": "dois Indexers tinham o mesmo volume de storage e recursos de memória bastante diferentes. Um deles utilizava 100% do swap configurado e o outro apresentava uso relevante. Ambos estavam próximos de 70% de ocupação em disco. Isso não provava sozinho a causa de drops, mas exigia investigação antes de qualquer crescimento de ingestão."
          }
        }
      ]
    },
    {
      "heading": "6.4 — Alta disponibilidade e quorum",
      "blocks": [
        {
          "type": "p",
          "text": "OpenSearch usa quorum para decisões de cluster. Com dois nós votantes, a tolerância a falha é zero: ambos precisam permanecer disponíveis para manter maioria. Três nós votantes toleram a perda de um [13]. Por isso, não basta dizer \"tem dois Indexers, então tem HA\". É necessário verificar `node.roles`, voting configuration, replicas e comportamento durante falha."
        }
      ]
    },
    {
      "heading": "Fase 7 — Controles funcionais do Wazuh",
      "blocks": [
        {
          "type": "p",
          "text": "Depois de estabilizar infraestrutura e pipeline, revise o que a plataforma está efetivamente fazendo nos endpoints. Classifique cada módulo como **inexistente, default, customizado, validado ou monitorado**."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Módulo",
              "O que verificar"
            ],
            "rows": [
              [
                "FIM / syscheck",
                "Diretórios, frequência, realtime/whodata, report_changes, exclusions"
              ],
              [
                "SCA",
                "Políticas aplicadas, cobertura, periodicidade, exceções"
              ],
              [
                "Syscollector",
                "Inventário de hardware, software, portas e processos"
              ],
              [
                "Vulnerability Detection",
                "Feeds, cobertura, atraso e tratamento"
              ],
              [
                "Rootcheck",
                "Escopo e relevância operacional"
              ],
              [
                "Logcollector",
                "Arquivos, EventChannel, comandos e aplicações"
              ],
              [
                "Active Response",
                "Ações habilitadas, segurança, escopo e rollback"
              ],
              [
                "Integrations",
                "Cloud, Office 365, APIs, CTI, notificações"
              ],
              [
                "Agent upgrade",
                "Política de versionamento e rollout"
              ],
              [
                "Labels",
                "Contexto de negócio, criticidade e ownership"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "A maturidade aparece quando a configuração é explicável. \"Está habilitado\" é apenas o primeiro nível."
        }
      ]
    },
    {
      "heading": "Fase 8 — Rules, decoders e Detection Engineering",
      "blocks": [
        {
          "type": "p",
          "text": "Um Wazuh maduro não é medido pelo número de regras instaladas. É medido pela capacidade de detectar comportamentos relevantes com dados confiáveis, baixo ruído e resposta operacional definida."
        },
        {
          "type": "p",
          "text": "**Inventário mínimo**"
        },
        {
          "type": "code",
          "text": "/var/ossec/etc/rules/\n/var/ossec/etc/decoders/\n/var/ossec/etc/rules/local_rules.xml\n/var/ossec/etc/decoders/local_decoder.xml"
        },
        {
          "type": "list",
          "items": [
            "Quantas regras customizadas existem?",
            "Quais regras mais alertam?",
            "Quais nunca alertaram?",
            "Quais dependem de log source que já não existe?",
            "Quais tecnologias chegam sem decoder adequado?",
            "Quais regras geram falso positivo recorrente?",
            "Quais regras têm owner e playbook associado?"
          ]
        },
        {
          "type": "p",
          "text": "**Construa um catálogo de casos de uso**"
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "ID",
              "Caso de uso",
              "Fonte",
              "MITRE",
              "Detecção",
              "Status"
            ],
            "rows": [
              [
                "UC-001",
                "Brute force de identidade",
                "Windows/IdP",
                "T1110",
                "Regra / correlação",
                "Validar"
              ],
              [
                "UC-002",
                "PowerShell suspeito",
                "Windows",
                "T1059.001",
                "EventChannel / Sysmon",
                "Validar"
              ],
              [
                "UC-003",
                "Escalada de privilégio",
                "Windows/Linux",
                "T1548",
                "Regras e contexto",
                "Validar"
              ],
              [
                "UC-004",
                "Persistência",
                "Endpoint",
                "Vários",
                "FIM / eventos",
                "Validar"
              ],
              [
                "UC-005",
                "Ataque web",
                "WAF/F5",
                "Vários",
                "Decoder / regra",
                "Validar"
              ],
              [
                "UC-006",
                "Movimentação lateral",
                "Endpoint/Rede",
                "Vários",
                "Correlação",
                "Validar"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "A pergunta que a operação precisa conseguir responder é: **o que exatamente este SIEM foi desenhado para detectar?**"
        }
      ]
    },
    {
      "heading": "Fase 9 — Qualidade de alertas e operação do SOC",
      "blocks": [
        {
          "type": "p",
          "text": "Um SIEM saudável pode ser operacionalmente inútil se o analista recebe milhares de alertas repetitivos sem contexto. Por isso o assessment precisa sair da infraestrutura e entrar na rotina do SOC."
        },
        {
          "type": "list",
          "items": [
            "Top 20 regras por volume.",
            "Alertas por severidade, agente, usuário, tecnologia e horário.",
            "Regras com repetição alta e baixa ação operacional.",
            "False positives conhecidos e tuning existente.",
            "Alertas sem playbook ou owner.",
            "MTTA, MTTR e aderência a SLA quando disponíveis.",
            "Qualidade do contexto: hostname, usuário, IP, técnica MITRE, ativo crítico, owner e link de investigação."
          ]
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Regra prática",
            "body": "um milhão de alertas não é evidência de boa detecção. Pode ser evidência de que o SIEM está transformando telemetria em ruído."
          }
        }
      ]
    },
    {
      "heading": "Fase 10 — Segurança do próprio SIEM",
      "blocks": [
        {
          "type": "p",
          "text": "O SIEM concentra telemetria sensível, credenciais de integração, inventário e capacidade de resposta. Ele precisa ser tratado como ativo crítico."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Controle",
              "Perguntas"
            ],
            "rows": [
              [
                "TLS e certificados",
                "Validade, cadeia, algoritmo, expiração, distribuição de chaves"
              ],
              [
                "RBAC",
                "Privilégio mínimo, contas administrativas, perfis do SOC"
              ],
              [
                "MFA/SSO",
                "Integração, exigência para contas privilegiadas"
              ],
              [
                "API",
                "Exposição de rede, autenticação e auditoria"
              ],
              [
                "Dashboard",
                "Exposição, TLS, sessão e acesso administrativo"
              ],
              [
                "SSH",
                "Origem permitida, chaves, root, logging"
              ],
              [
                "Firewall/ACL",
                "Portas estritamente necessárias"
              ],
              [
                "Secrets",
                "Tokens, webhooks, passwords e private keys fora de texto claro"
              ],
              [
                "Configuração legada",
                "Listeners e integrações de produtos descontinuados"
              ]
            ]
          }
        },
        {
          "type": "callout",
          "callout": {
            "kind": "exemplo",
            "title": "Exemplo anonimizado",
            "body": "durante uma revisão de configuração foi encontrado um listener Syslog legado ainda ativo para uma tecnologia que já não existia no ambiente, aceitando origem ampla, além de um webhook antigo armazenado em texto claro dentro de configuração comentada. Outro listener crítico também usava allowlist excessivamente permissiva. O ambiente funcionava, mas a superfície de exposição havia crescido silenciosamente. A correção correta é inventariar fontes legítimas, validar ACLs de rede e só então restringir ou remover listeners — para não interromper telemetria válida."
          }
        }
      ]
    },
    {
      "heading": "Fase 11 — Backup, Disaster Recovery e resiliência",
      "blocks": [
        {
          "type": "p",
          "text": "A pergunta não é \"tem backup?\". A pergunta é **\"quanto tempo leva para recuperar o SIEM e qual quantidade de dados pode ser perdida?\"**"
        },
        {
          "type": "list",
          "items": [
            "Backup de `ossec.conf`, `agent.conf`, rules, decoders, CDB lists e configurações de integração.",
            "Proteção e recuperação de certificados e segredos por mecanismo seguro.",
            "Snapshots do Indexer e política de retenção.",
            "Procedimento de restauração documentado e testado.",
            "RTO e RPO definidos.",
            "Teste de falha de Manager, Worker, Indexer e Dashboard.",
            "Validação de comportamento dos agentes durante indisponibilidade.",
            "Validação de quorum e replicas no OpenSearch."
          ]
        },
        {
          "type": "p",
          "text": "Um backup nunca restaurado é apenas uma hipótese de recuperação."
        }
      ]
    },
    {
      "heading": "Fase 12 — Capacity Planning e monitoramento do próprio SIEM",
      "blocks": [
        {
          "type": "p",
          "text": "Capacity planning transforma crescimento em decisão antecipada. Sem ele, o ambiente só descobre que cresceu demais quando o incidente já aconteceu."
        },
        {
          "type": "p",
          "text": "**Métricas mínimas**"
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Categoria",
              "Métricas"
            ],
            "rows": [
              [
                "Ingestão",
                "EPS médio, EPS pico, eventos/dia, alertas/dia, bytes/dia"
              ],
              [
                "Managers",
                "CPU, RAM, filas, drops, threads, sessões, agentes por nó"
              ],
              [
                "Agents",
                "buffer usage, rules 202–205, EPS local, top talkers"
              ],
              [
                "Indexer",
                "CPU, heap, swap, write rejected, shards, replicas, search latency"
              ],
              [
                "Storage",
                "GB/dia, retenção, crescimento, watermark, archives"
              ],
              [
                "Operação",
                "FP rate, alertas por regra, MTTA, MTTR, SLA"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "**O SIEM precisa monitorar o SIEM**"
        },
        {
          "type": "list",
          "items": [
            "Agent disconnected acima do baseline.",
            "Agent buffer warning, full ou flooded.",
            "`events_dropped` maior que zero.",
            "Node de cluster indisponível.",
            "Cluster Indexer yellow/red.",
            "Disco acima de thresholds definidos.",
            "Heap pressure, swap ou write rejection.",
            "Filebeat sem conectividade.",
            "Certificado próximo de expirar.",
            "Backup ou snapshot com falha.",
            "Ingestão parada ou EPS anormalmente alto/baixo."
          ]
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Objetivo de maturidade",
            "body": "o SOC deve descobrir que o SIEM está doente antes de descobrir que faltaram logs durante um incidente."
          }
        }
      ]
    },
    {
      "heading": "Fase 13 — Converter evidência em maturidade e plano de ação",
      "blocks": [
        {
          "type": "p",
          "text": "A coleta só gera valor quando termina em decisão. Prints e outputs são matéria-prima. O produto final é um plano que liga evidência a risco, ação e validação."
        },
        {
          "type": "figure",
          "figure": {
            "src": "/assets/blog/wazuh-em-movimento-fig3.svg",
            "alt": "A cadeia que transforma coleta técnica em melhoria controlada.",
            "caption": "A cadeia que transforma coleta técnica em melhoria controlada."
          }
        }
      ]
    },
    {
      "heading": "13.1 — Modelo de registro de gap",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Campo",
              "Exemplo"
            ],
            "rows": [
              [
                "ID",
                "WAZUH-ING-001"
              ],
              [
                "Domínio",
                "Ingestão"
              ],
              [
                "Achado",
                "Eventos descartados pelo analysisd"
              ],
              [
                "Evidência",
                "state/API com contador e breakdown"
              ],
              [
                "Causa provável",
                "Saturação transitória em categoria específica"
              ],
              [
                "Impacto",
                "Perda de telemetria antes da correlação"
              ],
              [
                "Risco",
                "Possível perda de evento de segurança"
              ],
              [
                "Prioridade",
                "P0"
              ],
              [
                "Ação",
                "Tratar fonte, distribuição, capacidade e tuning"
              ],
              [
                "Rollback",
                "Restaurar configuração anterior"
              ],
              [
                "Validação",
                "events_dropped permanece estável em zero incremento"
              ],
              [
                "KPI",
                "Drops/hora, EPS pico, queue usage"
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "13.2 — Priorização",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Prioridade",
              "Quando usar"
            ],
            "rows": [
              [
                "P0",
                "Perda de dados, risco de cegueira, indisponibilidade, exposição crítica, falha de segurança diretamente explorável."
              ],
              [
                "P1",
                "Alta disponibilidade, distribuição, capacidade, arquitetura e riscos altos que podem gerar P0."
              ],
              [
                "P2",
                "Cobertura de logs, detecção, tuning, lifecycle e qualidade operacional."
              ],
              [
                "P3",
                "Otimização, dashboards, automação, documentação e governança incremental."
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "13.3 — Score de maturidade",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Score",
              "Significado"
            ],
            "rows": [
              [
                "0",
                "Inexistente"
              ],
              [
                "1",
                "Inicial ou default, sem gestão"
              ],
              [
                "2",
                "Implementado"
              ],
              [
                "3",
                "Gerenciado e mensurado"
              ],
              [
                "4",
                "Otimizado e continuamente melhorado"
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "Aplique a escala por domínio: arquitetura, alta disponibilidade, agentes, log sources, ingestão, performance, storage, rules/decoders, detecção, FIM, SCA, vulnerabilidades, IAM/RBAC, hardening, backup/DR, monitoramento e governança."
        }
      ]
    },
    {
      "heading": "14. Estudo de caso anonimizado: como várias pequenas \"normalidades\" se somam",
      "blocks": [
        {
          "type": "p",
          "text": "O valor do framework aparece quando os achados deixam de ser tratados isoladamente. O caso abaixo resume padrões encontrados em um único assessment real, sem qualquer identificação do ambiente."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Domínio",
              "Padrão observado"
            ],
            "rows": [
              [
                "Infraestrutura",
                "Serviços ativos, mas relógios sem sincronização efetiva, clock skew observável, uptime muito longo e manutenção pendente."
              ],
              [
                "Managers",
                "Cluster sincronizado, porém 97 agentes ativos em um nó e apenas 1 no outro."
              ],
              [
                "Ingestão",
                "remoted sem descarte, analysisd com mais de 211 mil drops."
              ],
              [
                "Syslog",
                "Mais de 99% dos drops pertenciam a Syslog; fluxo concentrado em firewall e recebido via UDP no Master."
              ],
              [
                "Top talkers",
                "Poucas fontes respondiam por quase todo o volume de Firewall, próximo de 1.000 datagramas/s em uma janela observada."
              ],
              [
                "Qualidade",
                "Firewalls não enviavam apenas ruído. Havia mistura consistente de TRAFFIC e THREAT, exigindo engenharia de ingestão em vez de filtro cego."
              ],
              [
                "Agents",
                "client_buffer em 100.000 eventos e 500 EPS, mesmo assim 83 episódios de saturação em 30 dias, com flooding em parte deles."
              ],
              [
                "Inventário",
                "235 agentes cadastrados, 137 disconnected, mas quase todos os desconectados eram históricos e precisavam de saneamento de inventário."
              ],
              [
                "Sincronização",
                "100% dos agentes ativos estavam com group_config_status synced."
              ],
              [
                "Lifecycle",
                "Frota fragmentada em várias versões de agent, incluindo agentes mais novos que o Manager e registros legados duplicados."
              ],
              [
                "Indexer",
                "Storage perto de 70%, swap relevante e assimetria de memória entre nós."
              ],
              [
                "Hardening",
                "Listener legado, allowlist ampla e segredo antigo encontrado em configuração."
              ],
              [
                "Retenção",
                "Archives habilitados geravam arquivos correntes na casa de dezenas de gigabytes, reforçando a necessidade de política de retenção e capacity planning."
              ],
              [
                "Resiliência",
                "A topologia precisava ser validada quanto a quorum, replicas e tolerância real a falha."
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "Nenhum desses itens sozinho descreve o ambiente. Juntos, eles contam uma história: o Wazuh estava funcional, mas havia dívida de arquitetura, ingestão, lifecycle, segurança e capacidade. A ferramenta não precisava ser substituída. Precisava ser compreendida e amadurecida."
        }
      ]
    },
    {
      "heading": "15. As armadilhas mais comuns quando se herda um Wazuh",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Atalho perigoso",
              "Por que falha"
            ],
            "rows": [
              [
                "\"Aumenta a queue\"",
                "Pode esconder o problema por mais tempo. Primeiro descubra quem produz o burst, qual fila satura e se a geração é necessária."
              ],
              [
                "\"Tem dois nós, então tem HA\"",
                "Distribuição, quorum, replicas e failover precisam ser provados."
              ],
              [
                "\"O dashboard está verde\"",
                "Saúde visual não garante integridade do pipeline."
              ],
              [
                "\"Tem muito disconnected, então metade do parque está fora\"",
                "Compare lastKeepAlive e CMDB antes de declarar impacto."
              ],
              [
                "\"Vamos filtrar ALLOW\"",
                "Telemetria de rede pode ser importante para hunting e o mesmo fluxo pode carregar eventos THREAT."
              ],
              [
                "\"Tudo no default é ruim\"",
                "Default só é problema quando não atende o comportamento observado. Não confunda personalização com maturidade."
              ],
              [
                "\"Mais alertas significa mais segurança\"",
                "Volume sem contexto e playbook pode reduzir a capacidade do SOC."
              ],
              [
                "\"Backup existe\"",
                "Sem teste de restauração, RTO e RPO, não existe evidência de recuperabilidade."
              ],
              [
                "\"Atualiza os agentes e depois o Manager\"",
                "Lifecycle precisa respeitar compatibilidade e política de rollout."
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "16. Como transformar o assessment em roadmap",
      "blocks": [
        {
          "type": "p",
          "text": "Depois da coleta, agrupe ações por ondas. Isso reduz risco e mostra valor cedo."
        },
        {
          "type": "table",
          "table": {
            "headers": [
              "Onda",
              "Objetivo",
              "Exemplos"
            ],
            "rows": [
              [
                "0. Contenção",
                "Interromper perda ou exposição crítica",
                "Drops, segredo exposto, listener desnecessário, cluster red."
              ],
              [
                "1. Estabilização",
                "Fazer o pipeline operar de forma previsível",
                "NTP, distribuição, buffers, sources, Filebeat, Indexer."
              ],
              [
                "2. Arquitetura",
                "Remover pontos únicos e preparar crescimento",
                "Load balancer, Syslog relay, quorum, replicas, storage."
              ],
              [
                "3. Detection Engineering",
                "Melhorar o que o SIEM detecta",
                "Decoders, rules, use cases, MITRE, tuning."
              ],
              [
                "4. Operação",
                "Transformar detecção em resposta",
                "Playbooks, ownership, SLA, dashboards, KPIs."
              ],
              [
                "5. Otimização contínua",
                "Evitar regressão",
                "Self monitoring, capacity review, lifecycle, maturity reassessment."
              ]
            ]
          }
        },
        {
          "type": "p",
          "text": "Cada ação precisa ter owner, dependência, esforço, risco da mudança, GMUD quando aplicável, rollback, critério de aceite e métrica pós mudança."
        }
      ]
    },
    {
      "heading": "17. Critérios de aceite que valem mais do que \"funcionou\"",
      "blocks": [
        {
          "type": "table",
          "table": {
            "headers": [
              "Domínio",
              "Critério de aceite"
            ],
            "rows": [
              [
                "Drops",
                "Nenhum incremento de events_dropped durante janelas normais e de pico definidas."
              ],
              [
                "Agent buffer",
                "Zero rule 203/204 recorrente após tratar top talkers, salvo exceção documentada."
              ],
              [
                "Distribuição",
                "Carga entre Managers dentro da faixa operacional definida, não apenas agentes \"espalhados\"."
              ],
              [
                "Indexer",
                "Cluster health esperado, sem write rejection, heap e swap dentro de limites, storage com headroom."
              ],
              [
                "Log sources",
                "Fontes críticas inventariadas, com owner, formato, volume e casos de uso mapeados."
              ],
              [
                "Detecção",
                "Casos de uso testados com evidência de disparo e playbook."
              ],
              [
                "Inventário",
                "Agentes stale reconciliados e processo de descomissionamento estabelecido."
              ],
              [
                "Resiliência",
                "Failover e restauração testados com RTO/RPO medidos."
              ],
              [
                "Segurança",
                "Sem segredo em texto claro, RBAC revisado e listeners estritamente necessários."
              ]
            ]
          }
        }
      ]
    },
    {
      "heading": "18. Playbook de coleta rápida (anexo)",
      "blocks": [
        {
          "type": "p",
          "text": "O anexo abaixo resume uma ordem eficiente para a primeira rodada. Ele não substitui o restante do artigo, mas ajuda a iniciar sem perder a linha de investigação."
        },
        {
          "type": "p",
          "text": "**Managers**"
        },
        {
          "type": "code",
          "text": "hostnamectl / nproc / free -h / df -hT / timedatectl\n/var/ossec/bin/wazuh-control info\n/var/ossec/bin/wazuh-control status\n/var/ossec/bin/cluster_control -l\n/var/ossec/bin/cluster_control -i more\ncat /var/ossec/var/run/wazuh-remoted.state\ncat /var/ossec/var/run/wazuh-analysisd.state"
        },
        {
          "type": "p",
          "text": "**Groups e agents**"
        },
        {
          "type": "code",
          "text": "/var/ossec/bin/agent_groups -l\n/var/ossec/bin/cluster_control -a\n/var/ossec/bin/agent_control -l\ngrep -Rni -A8 -B3 '<client_buffer>' /var/ossec/etc/shared/"
        },
        {
          "type": "p",
          "text": "**Filebeat**"
        },
        {
          "type": "code",
          "text": "systemctl status filebeat --no-pager -l\nfilebeat test config\nfilebeat test output\njournalctl -u filebeat --since \"24 hours ago\" --no-pager"
        },
        {
          "type": "p",
          "text": "**Indexers**"
        },
        {
          "type": "code",
          "text": "systemctl status wazuh-indexer --no-pager -l\ngrep -Ev '^\\s*(#|$)' /etc/wazuh-indexer/opensearch.yml\ngrep -E '^-Xm[sx]' /etc/wazuh-indexer/jvm.options\nswapon --show\ncurl -k -u <usuario> https://localhost:9200/_cluster/health?pretty\ncurl -k -u <usuario> https://localhost:9200/_cat/nodes?v\ncurl -k -u <usuario> https://localhost:9200/_cat/shards?v\ncurl -k -u <usuario> https://localhost:9200/_cat/thread_pool/write?v"
        },
        {
          "type": "p",
          "text": "**Syslog e volume**"
        },
        {
          "type": "code",
          "text": "grep -n -A15 -B3 '<remote>' /var/ossec/etc/ossec.conf\nss -lunp\n# Amostra agregada de archives\ntail -n 500000 /var/ossec/logs/archives/archives.json | \\\n  jq -r '.location // \"sem_location\"' | sort | uniq -c | sort -nr | head -50"
        },
        {
          "type": "p",
          "text": "**Antiflooding**"
        },
        {
          "type": "p",
          "text": "No Dashboard, pesquise por rule.id 202, 203, 204 e 205 e agregue por `agent.name`. Construa episódios por sequência temporal, não apenas contagem bruta."
        }
      ]
    },
    {
      "heading": "19. Checklist final do assessment",
      "blocks": [
        {
          "type": "list",
          "items": [
            "Arquitetura AS IS desenhada e validada.",
            "Função e capacidade de cada nó documentadas.",
            "NTP e clock skew validados.",
            "Cluster de Managers avaliado em sincronização e distribuição.",
            "remoted e analysisd avaliados com contadores de drop.",
            "Drops classificados por categoria de evento.",
            "Syslog mapeado por origem, porta, protocolo e volume.",
            "Top talkers e event types identificados.",
            "client_buffer, EPS e antiflooding avaliados.",
            "Agentes stale e duplicados reconciliados.",
            "Grupos, precedência e config sync validados.",
            "Versões de agentes e lifecycle revisados.",
            "Filebeat testado.",
            "Indexer avaliado em health, heap, swap, shards, replicas, write rejection e storage.",
            "Log Source Coverage concluída.",
            "Controles Wazuh avaliados.",
            "Rules e decoders inventariados.",
            "Catálogo de casos de uso iniciado.",
            "MITRE coverage e qualidade de alertas avaliadas.",
            "Hardening e secrets revisados.",
            "Backup, DR, RTO e RPO avaliados.",
            "Capacity planning elaborado.",
            "Self monitoring definido.",
            "Maturity score calculado.",
            "Gap register, prioridades, roadmap, rollback e critérios de aceite definidos."
          ]
        }
      ]
    },
    {
      "heading": "20. Conclusão",
      "blocks": [
        {
          "type": "p",
          "text": "O maior ganho de um assessment desse tipo não é descobrir que uma queue está cheia. É mudar a forma como a organização enxerga o SIEM. O Wazuh deixa de ser um conjunto de servidores e passa a ser tratado como um pipeline de segurança que precisa ser observado, medido, protegido e continuamente melhorado."
        },
        {
          "type": "p",
          "text": "Quando você entra no carro em movimento, a pior coisa que pode fazer é começar a trocar peças sem entender o comportamento do veículo. Primeiro você lê o painel. Depois escuta o motor. Confere combustível, temperatura, pressão, alinhamento e histórico de manutenção. Só então decide o que precisa ser corrigido."
        },
        {
          "type": "p",
          "text": "Com Wazuh é a mesma coisa. Arquitetura, ingestão, buffers, fontes, Indexer, detecção, operação e resiliência fazem parte do mesmo sistema. A ferramenta pode ter enorme potencial, mas esse potencial só aparece quando a operação sabe o que recebe, o que perde, o que detecta e como reage."
        },
        {
          "type": "callout",
          "callout": {
            "kind": "regra",
            "title": "Mensagem final",
            "body": "o objetivo não é ter um Wazuh \"customizado\". O objetivo é ter um Wazuh explicável, mensurável, resiliente e alinhado ao risco do negócio."
          }
        }
      ]
    }
  ],
  "sources": [
    {
      "label": "Agent connections in a Wazuh server cluster",
      "url": "https://documentation.wazuh.com/current/user-manual/wazuh-server-cluster/agent-connections.html"
    },
    {
      "label": "Load balancers for Wazuh server cluster",
      "url": "https://documentation.wazuh.com/current/user-manual/wazuh-server-cluster/load-balancers.html"
    },
    {
      "label": "client_buffer configuration",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/client-buffer.html"
    },
    {
      "label": "Wazuh agent queue and antiflooding",
      "url": "https://documentation.wazuh.com/current/user-manual/agent/agent-management/antiflooding.html"
    },
    {
      "label": "Centralized configuration (agent.conf)",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/centralized-configuration.html"
    },
    {
      "label": "wazuh-analysisd.state statistics",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/statistics-files/wazuh-analysisd-state.html"
    },
    {
      "label": "wazuh-analysisd daemon",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/daemons/wazuh-analysisd.html"
    },
    {
      "label": "Queuing mechanisms",
      "url": "https://documentation.wazuh.com/current/user-manual/manager/wazuh-server-queue.html"
    },
    {
      "label": "remote configuration",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/remote.html"
    },
    {
      "label": "Event logging and archives",
      "url": "https://documentation.wazuh.com/current/user-manual/manager/event-logging.html"
    },
    {
      "label": "auth configuration and allow_higher_versions",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/auth.html"
    },
    {
      "label": "Wazuh indexer tuning",
      "url": "https://documentation.wazuh.com/current/user-manual/wazuh-indexer/wazuh-indexer-tuning.html"
    },
    {
      "label": "Voting and quorum",
      "url": "https://docs.opensearch.org/latest/tuning-your-cluster/discovery-cluster-formation/voting-quorums/"
    },
    {
      "label": "Wazuh server cluster overview",
      "url": "https://documentation.wazuh.com/current/user-manual/wazuh-server-cluster/index.html"
    },
    {
      "label": "Local configuration reference",
      "url": "https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/index.html"
    }
  ],
  "changelog": [
    "v1 (04/09/2026): estruturação do documento original em formato de artigo web; anonimização verificada por scan automatizado (0 IPs, 0 e-mails, 0 telefones, 0 segredos); referências verificadas (15/15 HTTP 200 em 04/09/2026); marcações de figuras FIG-1/2/3 posicionadas; tabelas e blocos de código convertidos para o modelo de conteúdo rico do blog (Fase 3 implementa)."
  ]
};
