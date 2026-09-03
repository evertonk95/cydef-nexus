// GERADO AUTOMATICAMENTE por scripts/convert-blog-posts.mjs — não editar manualmente.
// Fonte: squad cydef-security-editorial (output/2026-08-24-183100-article02..08).
import type { BlogPost } from "./posts";

export const extraPosts: BlogPost[] = [
  {
    "slug": "mitre-attack-deteccao-tecnicas-adversarios",
    "title": "MITRE ATT&CK na prática: Detectando técnicas de adversários",
    "category": "Blue Team",
    "excerpt": "Entenda como usar o framework MITRE ATT&CK para mapear ameaças e criar regras de detecção eficazes no seu ambiente.",
    "date": "24 de Agosto, 2026",
    "dateISO": "2026-08-24",
    "readTime": "9 min",
    "image": "/assets/blog/mitre-attack-thumb.webp",
    "author": "Equipe CyDef",
    "sections": [
      {
        "paragraphs": [
          "A versão vigente do MITRE ATT&CK, a v19.2, reestruturou a taxonomia que muitas equipes usam para nomear comportamento de adversários: a tática Defense Evasion foi dividida em duas, e regras, dashboards e playbooks que referenciam IDs antigos precisam ser revisados. Analistas de SOC e Blue Team que usam ATT&CK para orientar detecção devem conferir se seus mapeamentos ainda correspondem à versão vigente — e, mais importante, aprender a mapear por comportamento observado, não por intuição. Este artigo apresenta um fluxo prático para transformar observações em regras de detecção testáveis, com referências oficiais verificadas em 24/08/2026. Nenhuma ferramenta específica é obrigatória: o que importa é o método e a telemetria que você já coleta."
        ]
      },
      {
        "heading": "O que é o MITRE ATT&CK e por que ele importa para detecção",
        "paragraphs": [
          "Segundo a própria MITRE, o ATT&CK é uma base de conhecimento global de táticas e técnicas de adversários construída a partir de observações reais — não uma lista teórica de ataques (F01). O framework organiza o comportamento em três níveis: **táticas** (o objetivo do adversário, o \"porquê\"), **técnicas** (o \"o quê\") e **sub-técnicas** (variações de \"como\"), distribuídas nas matrizes Enterprise, Mobile e ICS.",
          "Para detecção, o valor está em dois pontos. Primeiro, ele oferece uma linguagem comum: analistas, ferramentas e inteligência de ameaças podem falar da mesma técnica sem ambiguidade. Segundo, ele permite medir cobertura: quais comportamentos sua telemetria consegue enxergar e quais ficam fora do alcance.",
          "Uma distinção essencial: **ATT&CK descreve TTPs (táticas, técnicas e procedimentos), não IOCs**. Um hash, um IP ou um domínio são indicadores voláteis — mudam e expiram. A técnica (por exemplo, usar um interpretador de comandos) é um comportamento durável, que persiste mesmo quando os indicadores mudam. Por isso, mapear comportamento tende a envelhecer melhor do que depender apenas de listas de indicadores. Atenção a um limite: o ATT&CK não é um catálogo exaustivo de todos os procedimentos possíveis — ele registra o que foi observado. A ausência de uma técnica listada não prova que o comportamento não existe."
        ],
        "lists": []
      },
      {
        "heading": "O que mudou na v19 — e por que revisar seus mapeamentos",
        "paragraphs": [
          "A v19, lançada em 28 de abril de 2026, trouxe a maior mudança estrutural do framework em anos (F04). A tática **Defense Evasion** (Enterprise) foi dividida em duas, separadas pela intenção do adversário:",
          "A reestruturação também atingiu técnicas. A conhecida **Impair Defenses (T1562)** foi reorganizada: segundo a documentação de migração da Elastic, T1562, T1562.001 e T1562.006 foram mescladas na nova técnica **Disable or Modify Tools (T1685)**, e as demais sub-técnicas foram revogadas e reemitidas sob Defense Impairment (F11). Em agosto de 2026, a v19.2 — a primeira release \"Agile\" do projeto — atualizou grupos e softwares da matriz Enterprise, sem mudar as táticas (F03).",
          "O impacto prático é direto. Regras que referenciam TA0005 continuam casando com técnicas de Stealth (o ID foi herdado), mas o comportamento de desativar controles agora vive em outro lugar da matriz. Se os seus mapeamentos não forem revisados, você pode ter uma cobertura nominal — regras mapeadas para táticas aposentadas — que não reflete o que realmente monitora. A ação recomendada: audite buscas, exceções, dashboards e playbooks que citam \"Defense Evasion\", \"TA0005\", \"T1562\" e sub-técnicas, e remapeie cada regra pela intenção do comportamento (esconder atividade ou desativar controle). Detalhes de IDs são da documentação de migração da Elastic; as notas oficiais da MITRE confirmam o split (F04)."
        ],
        "lists": [
          {
            "items": [
              "**Stealth (TA0005)** — esconder atividade maliciosa dentro de comportamento legítimo. A nova tática herdou o ID antigo TA0005.",
              "**Defense Impairment (TA0112)** — desativar, degradar ou comprometer controles de segurança. Recebeu um ID novo."
            ]
          }
        ]
      },
      {
        "heading": "Do comportamento observado à regra de detecção",
        "paragraphs": [
          "Agora o fluxo que transforma observação em detecção, em cinco passos:",
          "1. **Parta de uma observação, não de um nome de técnica.** Exemplo: \"um processo iniciou um interpretador de comandos de forma inesperada\". Isso se aproxima de técnicas como Command and Scripting Interpreter (T1059), cuja página oficial lista plataformas, fontes de dados e exemplos (F12). 2. **Confirme na página da técnica.** Veja as fontes de dados sugeridas e os requisitos. Se a técnica que você pensou não se sustenta pelo comportamento observado, escolha outra — ou não mapeie. 3. **Escolha a fonte de dados que você realmente coleta.** Logs de criação de processo, de criação de script, de autenticação. Sem o dado, não existe regra. 4. **Escreva a regra no formato da sua stack.** Sigma é um formato aberto e estruturado para descrever detecções em logs, compartilhável entre ferramentas (F08, F09). 5. **Teste, meça falsos positivos e ajuste.** Uma regra que nunca gerou um alerta revisável não é uma detecção validada.",
          "Um exemplo **conceitual** de seleção Sigma — não testado neste ambiente; adapte ao seu schema e valide em laboratório:",
          "Repare no que o exemplo não faz: ele não é uma detecção acabada. `cmd.exe` e `powershell.exe` são legítimos em quase toda organização. O passo seguinte é estreitar com contexto — processo pai incomum, correlação com outros eventos, comportamento posterior — e usar a tática para decidir o \"porquê\". A orientação oficial da MITRE para detecção e analytics segue exatamente essa lógica de desenvolvimento, teste e refinamento de analytics comportamentais (F05)."
        ],
        "lists": [],
        "code": "title: Execução de interpretador de comandos (exemplo conceitual)\nlogsource:\n  product: windows\n  category: process_creation\ndetection:\n  selection:\n    Image|endswith:\n      - '\\cmd.exe'\n      - '\\powershell.exe'\n  condition: selection\nfalsepositives:\n  - Administração legítima e automação\n  - Tarefas agendadas e scripts operacionais\nlevel: low"
      },
      {
        "heading": "Referências oficiais para detecção: CAR, D3FEND e Sigma",
        "paragraphs": [
          "Além da matriz, a MITRE e a comunidade mantêm referências diretas para quem trabalha com detecção:",
          "Regras de terceiros, inclusive as da Sigma, precisam de revisão: entenda a lógica, confira os falsepositives declarados e valide no seu ambiente antes de produzir alertas."
        ],
        "lists": [
          {
            "items": [
              "**CAR (Cyber Analytics Repository)** — base de conhecimento da MITRE com analytics baseados em ATT&CK. Cada analytic traz hipótese, domínio de informação, referências às técnicas, pseudocódigo de implementação e um teste unitário (F06).",
              "**D3FEND** — grafo de conhecimento de contramedidas da MITRE: o lado defensivo da moeda, útil para pensar em controles a partir do comportamento (F07).",
              "**Sigma** — formato aberto de detecção; o repositório principal reúne mais de 3.000 regras de tipos variados (genéricas, threat hunting, emerging threats, compliance) (F08, F09).",
              "**Get Started – Detections and Analytics** — ponto de entrada oficial da MITRE para desenvolver analytics (F05).",
              "**attack-stix-data** — o catálogo ATT&CK em STIX 2.1, para integrar o framework a ferramentas de forma automatizada (F13).",
              "**ATT&CK Navigator** — visualização de cobertura em camadas, referenciada pela própria CAR; revalide o endereço antes de publicar (F06, F14)."
            ]
          }
        ]
      },
      {
        "heading": "Armadilhas comuns ao mapear e detectar com ATT&CK",
        "paragraphs": [
          "1. **Mapear por intuição ou semelhança superficial.** A técnica precisa ser sustentada pelo comportamento observado; \"parece com\" não é evidência. 2. **Confundir IOC com TTP.** Indicadores expiram; comportamento persiste. Usar os dois é saudável; tratá-los como a mesma coisa não é. 3. **Tratar uma regra como cobertura da técnica inteira.** Uma regra detecta uma variação, não a técnica completa. Falsos negativos existem e devem ser assumidos. 4. **Ignorar falsos positivos.** Regra sem ajuste vira ruído e dessensibiliza o SOC. 5. **Não revisar versões.** IDs revogados (como T1562 e sub-técnicas) deixam mapeamentos órfãos e relatórios fora de alinhamento (F04, F11). 6. **Prometer detecção completa.** Nenhum controle cobre 100% dos cenários; qualquer promessa desse tipo deve ser tratada com ceticismo."
        ],
        "lists": []
      },
      {
        "heading": "O que ainda não sabemos",
        "paragraphs": [],
        "lists": [
          {
            "items": [
              "A cobertura real de detecção depende da telemetria local de cada ambiente; este artigo não afirma dados de nenhuma organização específica nem telemetria interna da CyDef.",
              "A MITRE segue publicando releases (a v19.2 foi a primeira Agile); novos IDs e reorganizações podem surgir após a data de verificação.",
              "O conteúdo da página da técnica T1562 não pôde ser extraído diretamente no momento da verificação; a reestruturação foi confirmada pelas notas oficiais (F04) e o detalhe de IDs pela documentação da Elastic (F11).",
              "A página antiga de versionamento (`/resources/versioning`) retorna 404; a página vigente é `/resources/versions` (F02). O mesmo vale para `/resources/get-started/`, substituída por páginas temáticas (F05).",
              "Autor e revisor técnico deste artigo ainda não foram definidos (`PENDENTE`)."
            ]
          }
        ]
      },
      {
        "heading": "Próximos passos",
        "paragraphs": [
          "1. Confira a versão vigente na página de versionamento oficial (F02). 2. Audite regras, exceções, dashboards e playbooks com referências a \"Defense Evasion\", \"TA0005\", \"T1562\" e sub-técnicas. 3. Separe por intenção: Stealth (esconder) versus Defense Impairment (desativar controles) — e revise a prioridade de monitoramento de integridade dos seus controles. 4. Revise a cobertura com o Navigator ou planilha própria, e consulte CAR e D3FEND para fechar lacunas. 5. Teste qualquer regra nova em ambiente controlado, com eventos conhecidos, antes de produção.",
          "Se a sua equipe está começando a estruturar esse trabalho, as práticas de Blue Team da CyDef (https://www.cydef.com.br/servicos#blue-team) e os serviços de SOC (https://www.cydef.com.br/servicos#soc) são pontos de partida para desenhar o serviço; a formação em detecção segue na CyDef Academy (https://www.cydef.com.br/academy)."
        ],
        "lists": []
      }
    ],
    "sources": [
      {
        "label": "MITRE ATT&CK (site oficial)",
        "url": "https://attack.mitre.org/"
      },
      {
        "label": "Version History",
        "url": "https://attack.mitre.org/resources/versions"
      },
      {
        "label": "Updates – August 2026 (v19.2)",
        "url": "https://attack.mitre.org/resources/updates"
      },
      {
        "label": "Updates – April 2026 (v19)",
        "url": "https://attack.mitre.org/resources/updates/updates-april-2026"
      },
      {
        "label": "Get Started – Detections and Analytics",
        "url": "https://attack.mitre.org/resources/get-started/detections-and-analytics"
      },
      {
        "label": "Cyber Analytics Repository (CAR)",
        "url": "https://car.mitre.org/"
      },
      {
        "label": "MITRE D3FEND",
        "url": "https://d3fend.mitre.org/"
      },
      {
        "label": "Sigma (site oficial)",
        "url": "https://sigmahq.io/"
      },
      {
        "label": "SigmaHQ/sigma (repositório de regras)",
        "url": "https://github.com/SigmaHQ/sigma"
      },
      {
        "label": "Blog oficial MITRE ATT&CK – ATT&CK v19",
        "url": "https://medium.com/mitre-attack/attack-v19-ff329cb65d66"
      },
      {
        "label": "Elastic – Remap detection rules to MITRE ATT&CK v19",
        "url": "https://www.elastic.co/docs/solutions/security/detect-and-alert/remap-mitre-attack"
      },
      {
        "label": "Technique T1059 – Command and Scripting Interpreter",
        "url": "https://attack.mitre.org/techniques/T1059/"
      },
      {
        "label": "attack-stix-data (dados ATT&CK em STIX 2.1)",
        "url": "https://github.com/mitre-attack/attack-stix-data"
      }
    ],
    "changelog": [
      "2026-08-24: primeira versão, baseada no dossiê verificado (evergreen-attack-02, READY). Fontes oficiais verificadas em 24/08/2026; versão ATT&CK v19.2 registrada como vigente na data de corte."
    ]
  },
  {
    "slug": "threat-hunting-por-onde-comecar",
    "title": "Threat Hunting: por onde começar?",
    "category": "Detecção e Resposta",
    "excerpt": "Introdução ao threat hunting com metodologias, ferramentas e dicas práticas para caçar ameaças proativamente.",
    "date": "24 de Agosto, 2026",
    "dateISO": "2026-08-24",
    "readTime": "8 min",
    "image": "/assets/blog/threat-hunting-thumb.webp",
    "author": "Equipe CyDef",
    "sections": [
      {
        "paragraphs": [
          "Segundo a SANS 2025 Threat Hunting Survey, apenas 51% das organizações medem formalmente a eficácia dos seus programas de threat hunting — e 61% apontam a escassez de profissionais como a principal barreira. Para analistas de SOC e Blue Team que querem sair do modo reativo, a boa notícia é que caçar não exige ferramenta cara nem equipe gigante: exige método. Este guia apresenta o ciclo de uma caçada — da hipótese à validação — ancorado em referências públicas e vigentes: MITRE ATT&CK, a metodologia TTP-Based Hunting do MITRE, o hunting loop do Sqrrl, o framework PEAK e a Pirâmide da Dor. Até a data de corte desta verificação (24/08/2026), essas eram as referências consultadas. O ponto de partida é sempre o mesmo: uma hipótese testável sobre comportamento adversário no seu ambiente."
        ]
      },
      {
        "heading": "O que é threat hunting (e o que não é)",
        "paragraphs": [
          "Threat hunting é a busca proativa por comportamento adversário que não foi sinalizado por alertas automáticos. Diferente da resposta a incidentes — que começa de um alerta ou incidente conhecido —, a caçada começa de uma pergunta: \"se houvesse um adversário aqui, o que eu esperaria ver?\" É o que formalizam o hunting loop do Sqrrl e o framework PEAK da Splunk, ambos com hipótese como ponto de partida.",
          "Três distinções evitam os erros mais comuns:",
          "O valor está no que a equipe aprende mesmo quando não encontra nada — desde que documente."
        ],
        "lists": [
          {
            "items": [
              "**Hunting não é varredura aleatória de logs.** Sem hipótese, escopo e janela, a busca vira ruído e consome horas sem conclusão.",
              "**Hunting não substitui detecção automática.** Ele complementa, encontra o que as regras não pegaram e melhora as regras existentes.",
              "**Hunting não é resposta a incidentes.** Ele alimenta o processo: quando a caçada confirma algo, o caso é escalado com evidências."
            ]
          }
        ]
      },
      {
        "heading": "O ciclo de uma caçada: da hipótese à ação",
        "paragraphs": [
          "O hunting loop formalizado pelo Sqrrl em 2016 (whitepaper arquivado e ainda amplamente citado) define quatro estágios: **criar hipótese → investigar com ferramentas e técnicas → descobrir novos padrões e TTPs → informar e enriquecer as análises automáticas**. O loop é cíclico: cada caçada concluída alimenta a próxima e a detecção automatizada.",
          "O framework PEAK (Prepare, Execute e Act with Knowledge), do time SURGe da Splunk, organiza o mesmo raciocínio em três fases e distingue três tipos de caçada: **por hipótese**, **por baseline** (o que é \"normal\" no ambiente) e **assistida por modelo**. O conhecimento — arquitetura da rede, incidentes passados, inteligência de ameaças — entra em todas as fases, não apenas no início."
        ],
        "lists": []
      },
      {
        "heading": "Como formular uma hipótese baseada em comportamento",
        "paragraphs": [
          "Uma hipótese boa é específica e testável. Em vez de \"verificar se há malware\", use: \"uma conta autenticando em várias estações em um curto intervalo sugere movimento lateral com contas válidas\". Os componentes de uma hipótese são quatro: o **comportamento esperado**, o **ativo ou ator em escopo**, a **fonte de dado** que evidenciaria o comportamento e a **janela temporal**.",
          "Fontes de hipótese: inteligência de ameaças, técnicas do ATT&CK relevantes ao seu setor, lacunas de visibilidade conhecidas, achados de caçadas anteriores e anomalias que os alertas não explicaram.",
          "O **MITRE ATT&CK** — base de conhecimento de táticas e técnicas baseada em observações reais, na versão vigente v19.2 — funciona como vocabulário comum para descrever o comportamento que você procura. A metodologia **TTP-Based Hunting** do MITRE usa essas técnicas para definir requisitos de dados e conduzir a caçada de forma agnóstica de sistema operacional; o treinamento oficial descreve o caminho em seis módulos, de fundamentos e hipóteses até implementação de análises e investigação.",
          "> Exemplo conceitual (não testado em nenhum ambiente específico): hipótese de execução de scripts via interpretadores legítimos fora de estações administrativas; evidência esperada em logs de processo; janela de 14 dias; comparação com baseline de comportamento normal antes de qualquer conclusão."
        ],
        "lists": []
      },
      {
        "heading": "Fontes de dados: o que você precisa antes de caçar",
        "paragraphs": [
          "Antes de escolher a técnica, mapeie a telemetria que você já tem: logs de autenticação, de processo (endpoints), de rede (DNS e conexões), de e-mail e de nuvem. O MITRE é explícito sobre a ordem: **determinar os requisitos de dados antes da técnica** — se a telemetria não captura o comportamento, a caçada não consegue confirmá-lo.",
          "Na prática:",
          "Uma lacuna de visibilidade descoberta durante a preparação é um achado legítimo: saber que um comportamento não é observável já orienta o próximo investimento."
        ],
        "lists": [
          {
            "items": [
              "Inventarie fontes e registre lacunas de visibilidade.",
              "Valide qualidade e retenção. Por exemplo, o advanced hunting do Microsoft Defender XDR permite explorar até 30 dias de dados brutos por consulta — e as consultas podem virar detecções personalizadas.",
              "Comece pelas fontes mais confiáveis e pelas técnicas que elas conseguem evidenciar."
            ]
          }
        ]
      },
      {
        "heading": "Como conduzir e validar os achados",
        "paragraphs": [
          "Execute a caçada com consultas direcionadas, examine os resultados e classifique cada item. Nem todo \"match\" é incidente: separe **falso positivo**, **comportamento normal atípico**, **achado a investigar** e **confirmação**. Critérios de triagem explícitos e escritos reduzem o viés do analista.",
          "Duas referências ajudam na priorização e no contexto:",
          "Achado confirmado ou provável → escale para resposta a incidentes com evidências preservadas (quem, o quê, quando, fonte de dado e janela). Achado refutado → documente: refutar uma hipótese também é resultado — ou o comportamento não ocorreu na janela, ou a telemetria não cobre."
        ],
        "lists": [
          {
            "items": [
              "A **Pirâmide da Dor** (David Bianco, 2013) classifica indicadores de hashes a TTPs. Hashes e endereços IP mudam com facilidade; técnicas, táticas e procedimentos (TTPs) são caros de mudar — por isso são os indicadores mais valiosos para caçar.",
              "O **Cyber Kill Chain** da Lockheed Martin descreve sete etapas, de reconhecimento a ações no objetivo, e ajuda a situar em qual fase da intrusão o comportamento observado se encaixa."
            ]
          }
        ]
      },
      {
        "heading": "Transformar achados em detecção e medir o programa",
        "paragraphs": [
          "O ciclo só se completa quando o conhecimento vira capacidade: crie ou ajuste detecções, enriqueça dados, corrija lacunas de coleta e registre novas hipóteses para o próximo ciclo — é o estágio final do hunting loop.",
          "O contexto da SANS 2025 mostra por que isso importa: apenas 51% das organizações medem formalmente a eficácia do hunting (queda de 64% em 2024), e 61% citam a falta de profissionais como barreira principal. Métricas de hunting devem ser definidas localmente — por exemplo, hipóteses por período, taxa de confirmação, lacunas de coleta fechadas e detecções criadas — e nunca comparadas fora de contexto: uma organização com escopo, equipe e telemetria diferentes produz números diferentes."
        ],
        "lists": []
      },
      {
        "heading": "Por onde começar na prática",
        "paragraphs": [
          "Uma sequência executável para a primeira caçada:",
          "1. Escolha 2–3 técnicas do ATT&CK relevantes ao seu setor e ao que você já viu em incidentes. 2. Confirme quais fontes de dado podem evidenciá-las; se faltar alguma, registre a lacuna. 3. Escreva uma hipótese específica com escopo e janela. 4. Execute a caçada em tempo limitado (por exemplo, 1–2 horas) e documente. 5. Classifique os achados, preserve evidências e escale quando aplicar. 6. Converta o que funcionou em detecção e repita o ciclo.",
          "Recursos públicos gratuitos ajudam: o guia prático da Elastic, a documentação de advanced hunting da Microsoft, o repositório aberto do PEAK e, no Brasil, o CERT.br, que publica estatísticas e orientações de tratamento de incidentes."
        ],
        "lists": []
      },
      {
        "heading": "O que ainda não sabemos",
        "paragraphs": [],
        "lists": [
          {
            "items": [
              "Nenhuma telemetria, teste ou experiência interna da CyDef é afirmada neste artigo.",
              "A eficácia de cada método varia com ambiente, maturidade e fontes de dado; não existe receita universal.",
              "Os números da SANS 2025 vêm de respostas de profissionais — são percepção, não medição objetiva das organizações.",
              "Versões mudam: o ATT&CK v19.2 foi verificado em 24/08/2026 e deve ser revalidado antes da publicação.",
              "Autor e revisor técnico deste artigo ainda não foram definidos."
            ]
          }
        ]
      },
      {
        "heading": "Próximos passos",
        "paragraphs": [
          "Defina uma hipótese, escolha uma fonte de dado e execute a primeira caçada ainda esta semana — escopo pequeno, janela curta e documentação. Consulte as fontes oficiais abaixo antes de investir em ferramenta."
        ],
        "lists": []
      }
    ],
    "sources": [
      {
        "label": "F01 – MITRE ATT&CK (v19.2, vigente em 24/08/2026)",
        "url": "https://attack.mitre.org/"
      },
      {
        "label": "F02 – MITRE, TTP-Based Hunting",
        "url": "https://www.mitre.org/news-insights/publication/ttp-based-hunting"
      },
      {
        "label": "F03 – MITRE ATT&CK Training – TTP-Based Threat Hunting and Detection Engineering",
        "url": "https://attack.mitre.org/resources/learn-more-about-attack/training/threat-hunting"
      },
      {
        "label": "F04 – SANS, The Pyramid of Pain (David Bianco)",
        "url": "https://www.sans.org/tools/the-pyramid-of-pain"
      },
      {
        "label": "F05 – Splunk SURGe, PEAK Threat Hunting Framework: https://www.splunk.com/en_us/blog/security/peak-threat-hunting-framework.html +",
        "url": "https://github.com/splunk/PEAK"
      },
      {
        "label": "F06 – Elastic, The Elastic guide to threat hunting",
        "url": "https://www.elastic.co/campaigns/elastic-guide-to-threat-hunting"
      },
      {
        "label": "F07 – Sqrrl, A Framework for Cyber Threat Hunting (2016, arquivado)",
        "url": "https://www.threathunting.net/files/framework-for-threat-hunting-whitepaper.pdf"
      },
      {
        "label": "F08 – Microsoft, Advanced hunting overview",
        "url": "https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-overview"
      },
      {
        "label": "F09 – Lockheed Martin, Cyber Kill Chain",
        "url": "https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html"
      },
      {
        "label": "F10 – SANS 2025 Threat Hunting Survey",
        "url": "https://www.sans.org/white-papers/sans-2025-threat-hunting-survey-advancements-threat-hunting-amid-ai-cloud-challenges"
      },
      {
        "label": "F11 – CERT.br",
        "url": "https://cert.br/"
      }
    ],
    "changelog": [
      "2026-08-24: primeira versão, baseada no dossiê verificado (evergreen-hunting-03, READY). Fontes consultadas e datadas no ledger; ATT&CK v19.2 confirmado via https://attack.mitre.org/resources/versions."
    ]
  },
  {
    "slug": "hardening-linux-cis-benchmarks",
    "title": "Hardening de servidores Linux com CIS Benchmarks",
    "category": "Hardening",
    "excerpt": "Passo a passo para implementar hardening em servidores Linux seguindo as recomendações do CIS Benchmark.",
    "date": "24 de Agosto, 2026",
    "dateISO": "2026-08-24",
    "readTime": "8 min",
    "image": "/assets/blog/hardening-linux-thumb.webp",
    "author": "Equipe CyDef",
    "sections": [
      {
        "paragraphs": [
          "Os CIS Benchmarks são guias de configuração segura desenvolvidos por consenso comunitário e mantidos pelo Center for Internet Security (CIS) — são mais de 100 benchmarks para mais de 25 famílias de produtos, disponíveis em PDF gratuito para uso não comercial e mapeados aos CIS Controls (F01, F10). Administradores Linux, equipes de DevOps e Blue Team que precisam reduzir a superfície de ataque de servidores devem começar por aqui: escolher o benchmark oficial da sua distribuição, aplicar as recomendações por fases em ambiente de teste e auditar o resultado com ferramentas como o CIS-CAT. Este guia apresenta esse ciclo em quatro fases — identificar, proteger, detectar e validar — com comandos conceituais, teste e rollback. As versões citadas foram verificadas em 24/08/2026 nas páginas oficiais; confirme-as antes de publicar ou aplicar."
        ]
      },
      {
        "heading": "O que são os CIS Benchmarks",
        "paragraphs": [
          "Um CIS Benchmark é um conjunto de recomendações de configuração segura para uma tecnologia específica — no caso deste artigo, sistemas operacionais Linux. Segundo a CIS, os benchmarks são \"o produto de um processo de consenso comunitário\" e consistem em diretrizes de configuração segura (F03). Dois pontos práticos definem o programa:",
          "Há também recursos complementares: CIS Build Kits (scripts de automação), CIS Hardened Images (imagens de VM pré-endurecidas) e o CIS-CAT, ferramenta de auditoria (F03, F06). Para a maioria das organizações, o ponto de partida é o PDF do benchmark — e ele é gratuito."
        ],
        "lists": [
          {
            "items": [
              "**Cobertura e acesso:** mais de 100 benchmarks em mais de 25 famílias de produtos, com download gratuito em PDF para uso não comercial mediante registro (F01, F10).",
              "**Vínculo com controles:** cada recomendação mapeia aos CIS Critical Security Controls, o que ajuda a demonstrar conformidade com regulamentos como PCI DSS e frameworks como o NIST (F01, F02)."
            ]
          }
        ]
      },
      {
        "heading": "CIS Controls v8.1: o hardening dentro de um programa",
        "paragraphs": [
          "O hardening por configuração não substitui um programa de segurança — ele é um dos controles. A versão vigente dos CIS Controls é a v8.1, que dá ênfase à transição para ambientes híbridos/cloud e à gestão da cadeia de suprimentos (F02). Na prática, os benchmarks funcionam como a camada técnica de \"configuração segura\" dentro desse programa.",
          "Um limite importante: **conformidade com benchmark não é proteção total**. Um servidor que passa em todas as regras ainda pode estar desatualizado, mal segmentado ou comprometido. O valor do benchmark é reduzir a superfície de ataque e dar base auditável — não substituir inventário, gestão de vulnerabilidades, detecção e resposta. Priorize os controles que já existem na sua organização e use o benchmark como complemento, não como atalho."
        ],
        "lists": []
      },
      {
        "heading": "Escolhendo o benchmark oficial da sua distribuição",
        "paragraphs": [
          "Baixe o benchmark **na página oficial da CIS**, da versão exata do seu sistema. Cópias de terceiros, blogs ou repositórios não oficiais podem estar desatualizados ou adulterados. As versões vigentes listadas nas páginas oficiais em 24/08/2026 eram:",
          "O reconhecimento institucional reforça a relevância: o National Checklist Program do NIST (NIST NCP) lista o \"CIS Ubuntu Linux 24.04 LTS STIG Benchmark 1.0.0\" como checklist oficial (F08). Ao escolher, prefira a versão LTS que você realmente opera; benchmarks de versões antigas não suportadas são arquivados pela CIS e devem ser evitados (F03)."
        ],
        "lists": [
          {
            "items": [
              "**Ubuntu Linux:** 24.04 LTS (v2.0.0), 22.04 LTS (v3.0.0), 20.04 LTS (v3.0.0) — além de versões STIG (F03).",
              "**Debian Linux:** 13 (v1.0.0), 12 (v2.0.0), 11 (v2.0.0) (F04).",
              "**Red Hat Enterprise Linux:** 10 (v1.0.1), 9 (v2.0.0), 8 (v4.0.0) — além de versões STIG (F05)."
            ]
          }
        ]
      },
      {
        "heading": "Fase 1 — Identificar: inventário antes da mudança",
        "paragraphs": [
          "Antes de alterar qualquer coisa, saiba o que você tem. Esta fase é somente leitura:",
          "Com o inventário em mãos, baixe o benchmark da versão exata identificada. Se a distribuição não tiver benchmark oficial (por exemplo, uma distro derivada sem página própria), avalie o benchmark da família mais próxima com cuidado e documente a decisão — ou considere a imagem endurecida da CIS para o seu provedor (F03)."
        ],
        "lists": [
          {
            "items": [
              "Confirme distribuição, versão e kernel. Exemplo conceitual: `cat /etc/os-release` e `uname -r`.",
              "Liste serviços e portas em escuta. Exemplo conceitual: `ss -tulpn` (exige privilégio para nomes de processo) e `systemctl list-unit-files --type=service`.",
              "Registre um baseline: pacotes instalados, usuários com acesso, cron jobs e o que está exposto à rede."
            ]
          }
        ]
      },
      {
        "heading": "Fase 2 — Proteger: mudanças testadas, uma por vez",
        "paragraphs": [
          "Aplique as recomendações **por fases, uma mudança por vez**, começando pelas regras de nível 1 (baseline prático) e avaliando o nível 2 conforme a criticidade do ativo — a distinção exata entre níveis está descrita no PDF do benchmark da sua versão. Os exemplos abaixo são **conceituais**: os valores exatos e a lista completa de regras estão no documento oficial.",
          "Regra de ouro: **uma mudança por vez, validada, com backup e rollback conhecido**. Hardening que derruba um serviço em produção não é segurança — é incidente."
        ],
        "lists": [
          {
            "items": [
              "**Acesso remoto (SSH):** revise `/etc/ssh/sshd_config` (ex.: autenticação por chave, restrição de login root). Antes de reiniciar o serviço, valide a sintaxe: `sudo sshd -t`. Reinicie com `sudo systemctl restart ssh`. **Rollback:** faça backup antes de editar (`sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak-$(date +%F)`) e restaure se algo falhar.",
              "**Permissões de arquivos sensíveis:** verifique com `stat -c '%a %U %G' /etc/shadow` e ajuste apenas se o benchmark da sua versão indicar.",
              "**Serviços desnecessários:** desative com `sudo systemctl disable --now <serviço>`. **Rollback:** `sudo systemctl enable --now <serviço>`.",
              "**Parâmetros de kernel:** crie um arquivo em `/etc/sysctl.d/` (ex.: `kernel.randomize_va_space=2`, `net.ipv4.ip_forward=0` como exemplos conceituais) e aplique com `sudo sysctl --system`. **Rollback:** remova o arquivo e reaplique.",
              "**Atualizações:** teste `sudo apt update && sudo apt upgrade` (Debian/Ubuntu) ou `sudo dnf update` (RHEL) em laboratório antes de produção.",
              "**Firewall local:** configure conforme a política da organização (ufw, nftables ou iptables) e garanta que o acesso de administração não seja bloqueado durante o teste."
            ]
          }
        ]
      },
      {
        "heading": "Fase 3 — Detectar: auditoria contínua com CIS-CAT e USG",
        "paragraphs": [
          "Configurar não basta; é preciso medir. A ferramenta oficial da CIS para auditar sistemas contra os benchmarks é o **CIS-CAT Pro Assessor**, que gera relatórios de conformidade mapeados aos CIS Controls e aos Implementation Groups (F06, F07). O acesso completo ao CIS-CAT Pro exige assinatura SecureSuite, mas a CIS oferece o **CIS-CAT Lite**, gratuito, com escaneamentos ilimitados contra um conjunto selecionado de benchmarks — que inclui Ubuntu Linux (F06). Em Ubuntu, a Canonical também documenta o **Ubuntu Security Guide (USG)** para auditar e aplicar perfis CIS (ex.: `sudo usg audit <perfil>`) — na documentação vigente, o escopo cobre 20.04 e 22.04; revalide antes de depender disso em 24.04 (F09).",
          "Complemente a auditoria com logs: autenticação, mudanças de configuração e eventos do sistema (journald, auditd) alimentam o SOC e o Blue Team. Trate o score da auditoria como baseline: registre o valor antes e depois de cada lote de mudanças."
        ],
        "lists": []
      },
      {
        "heading": "Fase 4 — Validar: re-auditar, documentar exceções e automatizar",
        "paragraphs": [
          "Depois de cada lote de mudanças, repita a auditoria e compare com o baseline. Conformidade não pode quebrar a operação: valide que serviços respondem, aplicações funcionam e backups restauram. Regras que não se aplicam ao seu ambiente devem ser **documentadas como exceção justificada** (tailoring), não simplesmente ignoradas — é isso que mantém a auditoria honesta e defensável.",
          "Somente depois que o processo manual estiver estável, considere automatizar com CIS Build Kits ou ferramentas de configuração declarativa (F03). Automação amplifica um processo bom e acelera um processo ruim — primeiro o processo, depois o script."
        ],
        "lists": []
      },
      {
        "heading": "O que ainda não sabemos",
        "paragraphs": [
          "Este guia tem limites explícitos. O texto integral dos benchmarks (regras individuais, valores exatos e níveis) não é reproduzido aqui: o download é gratuito, mas exige registro, e cada regra deve ser lida no PDF da sua versão. As versões citadas foram verificadas em 24/08/2026 e podem mudar — revalide antes de publicar. Ferramentas pagas (CIS-CAT Pro) dependem de assinatura; o USG tem escopo de versão documentado a revalidar. Nenhuma telemetria ou experiência interna da CyDef é afirmada neste artigo, e autor e revisor técnico ainda não foram definidos."
        ],
        "lists": []
      },
      {
        "heading": "Próximos passos",
        "paragraphs": [
          "Comece por um servidor de laboratório: identifique a distribuição exata, baixe o benchmark oficial na página da CIS, aplique as recomendações de nível 1 uma por vez com backup e rollback, e audite com CIS-CAT Lite antes e depois. Só então leve o processo, já validado, para produção. Consulte as fontes oficiais abaixo antes de aplicar qualquer mudança."
        ],
        "lists": []
      }
    ],
    "sources": [
      {
        "label": "CIS Benchmarks (visão geral)",
        "url": "https://www.cisecurity.org/cis-benchmarks-overview"
      },
      {
        "label": "CIS Controls v8.1",
        "url": "https://www.cisecurity.org/controls"
      },
      {
        "label": "CIS Ubuntu Linux Benchmark",
        "url": "https://www.cisecurity.org/benchmark/ubuntu_linux"
      },
      {
        "label": "CIS Debian Linux Benchmark",
        "url": "https://www.cisecurity.org/benchmark/debian_linux"
      },
      {
        "label": "CIS Red Hat Enterprise Linux Benchmark",
        "url": "https://www.cisecurity.org/benchmark/red_hat_linux"
      },
      {
        "label": "CIS-CAT Pro Assessor",
        "url": "https://www.cisecurity.org/cybersecurity-tools/cis-cat-pro"
      },
      {
        "label": "CIS-CAT Pro Assessor v4 Guide",
        "url": "https://ciscat-assessor.docs.cisecurity.org"
      },
      {
        "label": "NIST National Checklist Program, checklist 1287",
        "url": "https://ncp.nist.gov/checklist/1287"
      },
      {
        "label": "Ubuntu Security Guide (conformidade CIS)",
        "url": "https://ubuntu.com/security/certifications/docs/usg/cis/compliance"
      },
      {
        "label": "Download dos CIS Benchmarks (PDF gratuito, registro)",
        "url": "https://learn.cisecurity.org/benchmarks"
      }
    ],
    "changelog": [
      "2026-08-24: primeira versão, baseada no dossiê verificado (evergreen-hardening-04, READY). Versões de benchmarks e ferramentas verificadas nas páginas oficiais nesta data."
    ]
  },
  {
    "slug": "certificacoes-ciberseguranca-carreira",
    "title": "Carreira em Cibersegurança: certificações que fazem diferença",
    "category": "Carreira e Certificações",
    "excerpt": "Análise das principais certificações de segurança e como escolher as mais adequadas para seu momento profissional.",
    "date": "24 de Agosto, 2026",
    "dateISO": "2026-08-24",
    "readTime": "9 min",
    "image": "/assets/blog/carreira-thumb.webp",
    "author": "Equipe CyDef",
    "sections": [
      {
        "paragraphs": [
          "O mercado de segurança usa certificações como um sinal verificável de conhecimento — e os exames mudam: em 2026, o CySA+ ganhou uma nova versão (CS0-004), o ISC2 CC terá um novo conteúdo a partir de setembro e o PenTest+ já opera na versão PT0-003. Quem está começando ou planejando o próximo passo precisa conferir o código do exame vigente, os pré-requisitos e o custo total na fonte oficial antes de comprar qualquer voucher. Este guia organiza as principais certificações por momento de carreira, com dados verificados nas páginas oficiais em 24/08/2026. Nenhuma certificação garante vaga, salário ou aprovação — o valor real está no que ela representa e no que você faz com o conhecimento."
        ]
      },
      {
        "heading": "Por que certificações fazem diferença (e o que elas não garantem)",
        "paragraphs": [
          "Certificações funcionam como triagem: em processos seletivos, elas ajudam recrutadores e times a identificar quem tem uma base mínima documentada de conhecimento. Credenciamentos como ISO/IEC 17024 (usado pela ISC2) e o reconhecimento em programas como o DoDM 8140 dos Estados Unidos aumentam a rastreabilidade do exame — mas não medem sua experiência real. Um certificado sem prática não substitui competência operacional, e nenhum exame promete proteção total, emprego ou salário.",
          "O custo real de uma certificação inclui o exame **e** a manutenção: a CompTIA exige CEUs (unidades de educação continuada) a cada três anos, a ISC2 cobra taxa anual de manutenção (AMF) e a Microsoft exige renovação anual via avaliação online gratuita. Antes de decidir, considere o ciclo completo."
        ],
        "lists": []
      },
      {
        "heading": "Começando agora: Security+ e ISC2 CC",
        "paragraphs": [
          "Para quem não tem experiência formal, as duas portas de entrada mais reconhecidas são o **CompTIA Security+** e o **ISC2 CC (Certified in Cybersecurity)**.",
          "O Security+ é a certificação de entrada da CompTIA. O exame vigente é o **SY0-701** (versão V7, lançada em 07/11/2023): até 90 questões, 90 minutos, nota de corte 750 em escala de 100–900, sem pré-requisitos formais — a CompTIA recomenda Network+ e cerca de dois anos em administração de sistemas com foco em segurança. Está disponível em português e é renovado a cada três anos com 50 CEUs (taxa de US$ 150 por ciclo, segundo a página oficial de CEUs da CompTIA).",
          "O **CC da ISC2** é uma alternativa de entrada sem exigência de experiência, com exame de US$ 199 e taxa anual de manutenção de US$ 50. Atenção a duas mudanças: o exame terá um novo outline a partir de **01/09/2026** (primeira grande atualização desde 2022, com novo peso para governança, IAM e cloud), e o programa \"One Million Certified in Cybersecurity\", que ofereceu exames gratuitos, **encerrou novas inscrições em 20/05/2026** — não conte com gratuidade ao planejar.",
          "Como escolher entre os dois? Pelo objetivo: o Security+ entrega base ampla e é muito pedido em requisitos de vaga; o CC é mais enxuto, barato e bom primeiro contato com a metodologia da ISC2. Nenhum dos dois é obrigatório."
        ],
        "lists": []
      },
      {
        "heading": "Atuando em SOC: CySA+, SC-200 e SSCP",
        "paragraphs": [
          "Quem já opera detecção e resposta encontra certificações desenhadas para o trabalho de SOC e Blue Team.",
          "O **CySA+** (Cybersecurity Analyst) validou em 23/06/2026 a nova versão **V4 (CS0-004)**: até 85 questões, 165 minutos, nota 750, com foco em operações de segurança (34%), gestão de vulnerabilidades (26%), resposta a incidentes (24%) e comunicação (16%). A CompTIA recomenda cerca de quatro anos em SOC ou análise de vulnerabilidade; o exame custa US$ 425 e é renovado a cada três anos com 60 CEUs. Na estreia o idioma é inglês, com português previsto.",
          "O **SC-200** (Microsoft Certified: Security Operations Analyst Associate) é a certificação da Microsoft para quem opera Sentinel, Defender XDR e Defender for Cloud, incluindo hunting com KQL. São 100 minutos e nota 700, sem pré-requisitos formais, disponível em português do Brasil. A Microsoft define o preço por país/região — o valor padrão divulgado é US$ 165 — e a renovação é anual, gratuita, por avaliação online.",
          "O **SSCP** (Systems Security Certified Practitioner), da ISC2, exige um ano de experiência em um ou mais dos sete domínios (um curso superior em TI/CS pode abater até um ano; existe o caminho Associate). Custa US$ 249 e cobre administração operacional de infraestrutura — um bom encaixe para quem já trabalha com hands-on e quer credencial ISC2 antes do CISSP."
        ],
        "lists": []
      },
      {
        "heading": "Para avançar: CISSP e CCSP",
        "paragraphs": [
          "Nos níveis de gestão e arquitetura, o **CISSP** (US$ 749) é o marco mais reconhecido da ISC2: exige cinco anos de experiência em dois ou mais dos oito domínios, com redução de até um ano para quem tem curso superior em TI/CS ou credencial aprovada. Quem ainda não tem a experiência pode tirar o exame e seguir como Associate da ISC2, com seis anos para completar o requisito.",
          "O **CCSP** (US$ 599) foca segurança de cloud: exige cinco anos de TI, sendo três em segurança e um em um dos seis domínios CCSP — o certificado CCSK da CSA substitui um ano, e quem já é CISSP tem o requisito dispensado. A AMF da ISC2 é única: US$ 135 por ano para CISSP, SSCP, CCSP e demais (US$ 50 apenas para quem tem só o CC), independentemente de quantas certificações você acumula."
        ],
        "lists": []
      },
      {
        "heading": "Conhecimento ofensivo com propósito defensivo: PenTest+ e CEH",
        "paragraphs": [
          "Entender como um atacante pensa fortalece a defesa — desde que a prática ocorra em ambiente autorizado. Duas certificações cobrem esse terreno com enfoques diferentes.",
          "O **PenTest+** da CompTIA (versão vigente **PT0-003**, lançada em 17/12/2024) cobre planejamento e escopo de teste de penetração, análise de vulnerabilidades e relatórios com remediação. São até 90 questões em 165 minutos, nota 750; a CompTIA recomenda três a quatro anos em pentest, com Network+ e Security+. Está disponível em português.",
          "O **CEH v13** da EC-Council (125 questões, quatro horas) combina 20 módulos e mais de 550 técnicas com laboratórios. A elegibilidade tem dois caminhos: fazer o treinamento oficial (on-demand a partir de US$ 1.699) ou solicitar aprovação com dois anos de experiência documentada em segurança da informação e taxa de US$ 100. O valor do exame isolado não aparece como valor fixo na página oficial consultada — confirme com a EC-Council antes de planejar o orçamento.",
          "O artigo não entra em métodos ofensivos: o valor dessas certificações para um defensor é a capacidade de avaliar exposição e melhorar detecção, não de executar ataques."
        ],
        "lists": []
      },
      {
        "heading": "Como escolher a certificação certa para o seu momento",
        "paragraphs": [
          "Use este processo de cinco passos antes de comprar qualquer voucher:",
          "1. **Defina o momento profissional**: entrada, operação de SOC, gestão/arquitetura ou especialização em teste autorizado. 2. **Confira o código do exame vigente** na página oficial — versões aposentam (o CySA+ CS0-003 saiu de linha com o lançamento do CS0-004 em junho de 2026). 3. **Valide pré-requisitos**: CISSP e CCSP exigem experiência comprovada; SSCP exige um ano; Security+ e CC não têm pré-requisitos formais. 4. **Calcule o custo total do ciclo**: exame + renovação (CEUs da CompTIA, AMF da ISC2, renovação anual da Microsoft) + material de estudo. 5. **Verifique idioma e região**: Security+, PenTest+ e SC-200 têm versão em português; CySA+ V4 prevê português; preços variam por país.",
          "Desconfie de \"última chance\" sem anúncio oficial e de materiais que prometam aprovação rápida: o exame mede o que você sabe, não o que você decorou."
        ],
        "lists": []
      },
      {
        "heading": "O que ainda não sabemos",
        "paragraphs": [],
        "lists": [
          {
            "items": [
              "O valor do voucher de Security+ e PenTest+ não aparece como preço fixo nas páginas oficiais consultadas em 24/08/2026; fontes de 2025–2026 reportam faixa aproximada de US$ 404–439. Confirme na loja oficial.",
              "O preço do exame CEH isolado não consta na página oficial consultada (só pacotes de treinamento).",
              "Circulam rumores não oficiais de um sucessor do Security+ (possível SY0-801) com datas provisórias em novembro de 2026; até a data de corte, o SY0-701 segue como versão vigente oficial.",
              "Autor e revisor técnico deste artigo ainda não foram definidos."
            ]
          }
        ]
      },
      {
        "heading": "Próximos passos",
        "paragraphs": [
          "Escolha o momento de carreira, abra a página oficial da certificação candidata, confira código do exame, pré-requisitos e valor atual — e só então compre o voucher. Se a equipe inteira vai se certificar, use os objetivos oficiais do exame como roteiro de treinamento. A certificação certa é a que combina com o seu plano — não com a moda do momento."
        ],
        "lists": []
      }
    ],
    "sources": [
      {
        "label": "CompTIA Security+ (SY0-701)",
        "url": "https://www.comptia.org/en-us/certifications/security"
      },
      {
        "label": "CompTIA CySA+ V4 (CS0-004)",
        "url": "https://www.comptia.org/en-us/certifications/cybersecurity-analyst/v4"
      },
      {
        "label": "Blog oficial CompTIA — CySA+ V4 (preço US$ 425)",
        "url": "https://www.comptia.org/en-us/blog/the-new-comptia-cybersecurity-analyst-cysa-your-questions-answered"
      },
      {
        "label": "CompTIA PenTest+ (PT0-003)",
        "url": "https://www.comptia.org/en-us/certifications/pentest"
      },
      {
        "label": "ISC2 CC",
        "url": "https://www.isc2.org/certifications/cc"
      },
      {
        "label": "ISC2 One Million Certified in Cybersecurity",
        "url": "https://www.isc2.org/landing/1mcc"
      },
      {
        "label": "ISC2 — preços de exames",
        "url": "https://www.isc2.org/register-for-exam/isc2-exam-pricing"
      },
      {
        "label": "CompTIA — CEUs e renovação",
        "url": "https://www.comptia.org/en-us/resources/ce/learn/earn-continuing-education-units-ceus"
      },
      {
        "label": "ISC2 CISSP — requisitos",
        "url": "https://www.isc2.org/certifications/cissp/cissp-experience-requirements"
      },
      {
        "label": "ISC2 CCSP — requisitos",
        "url": "https://www.isc2.org/certifications/ccsp/ccsp-experience-requirements"
      },
      {
        "label": "ISC2 — AMF",
        "url": "https://www.isc2.org/policies-procedures/amfs-overview"
      },
      {
        "label": "EC-Council CEH v13",
        "url": "https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/"
      },
      {
        "label": "ISC2 SSCP — requisitos",
        "url": "https://www.isc2.org/certifications/sscp/sscp-experience-requirements"
      },
      {
        "label": "Microsoft SC-200",
        "url": "https://learn.microsoft.com/en-us/credentials/certifications/security-operations-analyst"
      },
      {
        "label": "Microsoft SC-200 — guia de estudo",
        "url": "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-200"
      },
      {
        "label": "ISC2 Insights — novo outline do CC",
        "url": "https://www.isc2.org/Insights/2026/08/inside-the-updated-isc2-cc-exam"
      }
    ],
    "changelog": [
      "2026-08-24: primeira versão, baseada no dossiê verificado (evergreen-career-05, READY). Códigos de exame, requisitos e preços confirmados em fontes oficiais na data de corte."
    ]
  },
  {
    "slug": "seguranca-cloud-aws-melhores-praticas",
    "title": "Segurança em Cloud AWS: Melhores práticas essenciais",
    "category": "Cloud Security",
    "excerpt": "Guia prático de segurança para ambientes AWS com foco em IAM, VPC, CloudTrail e outros serviços críticos.",
    "date": "24 de Agosto, 2026",
    "dateISO": "2026-08-24",
    "readTime": "8 min",
    "image": "/assets/blog/cloud-aws-thumb.webp",
    "author": "Equipe CyDef",
    "sections": [
      {
        "paragraphs": [
          "Na nuvem da AWS, a segurança não é um interruptor que a AWS liga por você: é uma responsabilidade compartilhada, e a parte que cabe à sua organização cresce conforme o que você configura e executa. Engenheiros, arquitetos, equipes DevSecOps e analistas que operam ambientes AWS precisam saber onde termina a responsabilidade do provedor e onde começa a deles — porque é nessa fronteira que acontecem as falhas mais comuns: permissões amplas demais, recursos expostos e ausência de logs. Este guia apresenta, em ordem, as práticas essenciais documentadas pela AWS: identidades (IAM), rede (VPC), registro e detecção (CloudTrail, GuardDuty, Security Hub) e proteção de dados (KMS). A aplicação de cada prática depende do seu ambiente; nenhuma configuração universal é prescrita aqui."
        ]
      },
      {
        "heading": "O que a AWS protege e o que é responsabilidade sua",
        "paragraphs": [
          "O ponto de partida é o modelo de responsabilidade compartilhada, descrito na página oficial de compliance da AWS. A AWS é responsável pela \"segurança da nuvem\": a infraestrutura que executa os serviços — datacenters, rede, hardware, virtualização. O cliente é responsável pela \"segurança na nuvem\": o que ele configura, executa e armazena, incluindo sistema operacional convidado, aplicações, gerenciamento de acesso, criptografia e monitoramento.",
          "A fronteira muda conforme o serviço: em um banco de dados gerenciado, a AWS assume mais camadas do que em uma instância EC2, onde o cliente responde pela configuração do sistema operacional. Essa distinção é o eixo do Security Pillar do AWS Well-Architected Framework, publicado em novembro de 2024 e vigente na data de corte desta verificação. Antes de escolher um serviço ou corrigir uma configuração, responda: quem é responsável por esta camada aqui? A resposta define o que auditar primeiro."
        ],
        "lists": []
      },
      {
        "heading": "IAM: identidades, mínimo privilégio e credenciais",
        "paragraphs": [
          "A gestão de identidades é onde a maioria das decisões de segurança em AWS começa. A documentação oficial de boas práticas do IAM recomenda, entre outros pontos:",
          "Na prática, a recomendação é começar com políticas gerenciadas da AWS e reduzir progressivamente em direção ao mínimo privilégio — não o contrário. Alterações de política devem ser testadas em ambiente controlado (por exemplo, uma conta de desenvolvimento) e podem ser revertidas restaurando a versão anterior da política. Um bom teste de sanidade: nenhuma alteração de permissão deve sair de uma conta de teste direto para produção sem validação do workload."
        ],
        "lists": [
          {
            "items": [
              "**Proteja o usuário root.** Ele tem acesso irrestrito à conta; deve ser usado apenas para tarefas que exigem esse nível, com MFA (autenticação multifator) habilitado.",
              "**Prefira credenciais temporárias.** A AWS recomenda que humanos acessem via federação com um provedor de identidade (o IAM Identity Center é a opção centralizada indicada) e que workloads usem IAM roles — ambos emitem credenciais temporárias, em vez de chaves de longa duração.",
              "**Aplique mínimo privilégio.** Conceda apenas as permissões necessárias para a tarefa. O IAM oferece informações de último acesso (\"last accessed\") e o IAM Access Analyzer pode gerar políticas baseadas na atividade observada e validar políticas existentes.",
              "**Revise regularmente.** Remova usuários, roles, chaves e permissões não utilizados; use condições em políticas para restringir acesso; considere guardrails de permissão em contas múltiplas."
            ]
          }
        ]
      },
      {
        "heading": "VPC: isolamento e controle de tráfego",
        "paragraphs": [
          "A Amazon VPC permite executar recursos em uma rede virtual logicamente isolada, definida por você. A segurança de rede se apoia em duas camadas complementares, documentadas no guia da VPC:",
          "A orientação estrutural é manter workloads de backend em subnets privadas e expor publicamente apenas o necessário. Mudanças em security groups e network ACLs têm efeito imediato: aplique em janela controlada, valide o tráfego legítimo e esteja pronto para reverter a regra em caso de regressão. Não existe regra de portas universal — o desenho depende do workload e da política de rede da organização."
        ],
        "lists": [
          {
            "items": [
              "**Security groups:** atuam como firewall virtual no nível da instância/interface, de forma stateful — o tráfego de retorno é permitido automaticamente. A recomendação é liberar apenas as portas e origens necessárias.",
              "**Network ACLs:** camada adicional no nível do subnet, de forma stateless, com regras numeradas avaliadas em ordem. Úteis para defesa em profundidade."
            ]
          }
        ]
      },
      {
        "heading": "Logging e detecção: CloudTrail, GuardDuty e Security Hub",
        "paragraphs": [
          "Sem visibilidade, não há resposta. Três serviços oficiais formam a base recomendada de observabilidade e detecção:",
          "O caminho defensivo recomendado é: habilite CloudTrail com cobertura das regiões e contas relevantes, ative GuardDuty e agregue os resultados no Security Hub. Habilitação é aditiva, mas tem custo e volume de dados — comece em escopo reduzido e expanda. Findings e controles geram ruído: defina triagem e critérios de escalonamento antes de tratar cada alerta como incidente."
        ],
        "lists": [
          {
            "items": [
              "**AWS CloudTrail** registra ações de usuários, roles e serviços como eventos — incluindo o console, a CLI e as APIs. O event history permite consultar os últimos 90 dias de eventos de gerenciamento; trails entregam logs a um bucket S3, com opção de envio ao CloudWatch Logs e ao Amazon EventBridge para monitoramento e automação.",
              "**Amazon GuardDuty** monitora continuamente fontes de dados da conta (como eventos do CloudTrail, VPC flow logs e DNS) e gera findings de atividade suspeita — por exemplo, acesso de geolocalização incomum ou chamadas de API atípicas. Um finding é uma indicação para investigar, não uma confirmação automática de comprometimento.",
              "**AWS Security Hub** (CSPM — Cloud Security Posture Management) agrega e correlaciona achados de múltiplas fontes e avalia o ambiente contra padrões de segurança, incluindo o padrão da própria AWS (Foundational Security Best Practices — FSBP) e frameworks externos como CIS, PCI DSS e NIST. Isso ajuda a priorizar correções por severidade e contexto."
            ]
          }
        ]
      },
      {
        "heading": "Dados: criptografia e controle de chaves",
        "paragraphs": [
          "Proteger dados em repouso e em trânsito é parte das boas práticas do Security Pillar. O AWS Key Management Service (KMS) centraliza a criação e o controle das chaves usadas para criptografar e assinar dados, integrando-se a vários serviços AWS. As chaves ficam protegidas por módulos de hardware validados e nunca saem do serviço de forma não criptografada. Vale distinguir, no nível de conceito, chaves gerenciadas pelo cliente (você cria e controla) das gerenciadas pela AWS — a escolha depende do grau de controle que a organização precisa, e as políticas de chave definem quem pode gerenciar e quem pode usar cada chave.",
          "Complementarmente, o AWS Config registra o histórico de configuração dos recursos da conta, permitindo ver como as configurações mudaram ao longo do tempo e avaliar a conformidade com regras definidas. Isso é útil para auditoria e para entender o impacto de uma mudança antes e depois de aplicá-la. Nenhum destes serviços substitui inventário e governança: eles tornam o ambiente auditável."
        ],
        "lists": []
      },
      {
        "heading": "O que ainda não sabemos",
        "paragraphs": [
          "Este guia não cobre custos (retenção de logs, volume de dados e regiões variam), nem configurações específicas de cada workload — a aplicação correta depende do inventário, da criticidade e dos controles existentes. Não afirmamos telemetria, testes ou experiência interna da CyDef, e nenhuma ferramenta é obrigatória. As revisões da documentação AWS podem mudar; as fontes foram verificadas em 24/08/2026 e devem ser revalidadas antes da publicação. Autor e revisor técnico deste artigo ainda não foram definidos."
        ],
        "lists": []
      },
      {
        "heading": "Próximos passos",
        "paragraphs": [
          "Audite o ambiente camada a camada: mapeie a fronteira de responsabilidade, revise identidades e permissões (root, MFA, credenciais temporárias, mínimo privilégio), reduza exposição de rede, garanta registro e detecção (CloudTrail, GuardDuty, Security Hub) e revise criptografia e chaves. Priorize pelo contexto local, teste mudanças em ambiente controlado com rollback e consulte a documentação oficial da AWS antes de alterar produção."
        ],
        "lists": []
      }
    ],
    "sources": [
      {
        "label": "AWS Well-Architected Framework, Security Pillar (pub. 06/11/2024)",
        "url": "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html"
      },
      {
        "label": "AWS Well-Architected Framework, seção Security",
        "url": "https://docs.aws.amazon.com/wellarchitected/latest/framework/security.html"
      },
      {
        "label": "AWS IAM, Security best practices",
        "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html"
      },
      {
        "label": "AWS IAM, Prepare for least-privilege permissions",
        "url": "https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started-reduce-permissions.html"
      },
      {
        "label": "AWS Shared Responsibility Model",
        "url": "https://aws.amazon.com/compliance/shared-responsibility-model/"
      },
      {
        "label": "AWS CloudTrail, What Is AWS CloudTrail",
        "url": "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html"
      },
      {
        "label": "Amazon VPC, What is Amazon VPC",
        "url": "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html"
      },
      {
        "label": "Amazon VPC, Security groups",
        "url": "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html"
      },
      {
        "label": "Amazon VPC, Network ACLs",
        "url": "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html"
      },
      {
        "label": "AWS Security Hub, Introduction (CSPM)",
        "url": "https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html"
      },
      {
        "label": "Amazon GuardDuty, What is Amazon GuardDuty",
        "url": "https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html"
      },
      {
        "label": "AWS KMS, Developer Guide (overview)",
        "url": "https://docs.aws.amazon.com/kms/latest/developerguide/overview.html"
      },
      {
        "label": "AWS Config, What Is AWS Config",
        "url": "https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html"
      },
      {
        "label": "AWS Cloud Security (hub oficial)",
        "url": "https://aws.amazon.com/security/"
      }
    ],
    "changelog": [
      "2026-08-24: primeira versão, baseada no dossiê verificado (evergreen-cloud-06, READY). Fontes oficiais AWS acessadas e confirmadas em 24/08/2026."
    ]
  },
  {
    "slug": "analise-de-logs-comportamentos-maliciosos",
    "title": "Análise de logs: identificando comportamentos maliciosos",
    "category": "SOC",
    "excerpt": "Aprenda a correlacionar eventos de log e identificar padrões que indicam atividades suspeitas ou maliciosas.",
    "date": "24 de Agosto, 2026",
    "dateISO": "2026-08-24",
    "readTime": "7 min",
    "image": "/assets/blog/analise-logs-thumb.webp",
    "author": "Equipe CyDef",
    "sections": [
      {
        "paragraphs": [
          "Analistas de SOC recebem diariamente milhares de eventos de log, e a diferença entre uma fila de alertas e uma investigação eficaz está na forma de correlacionar esses eventos. Este guia apresenta um método em quatro passos — fontes de dado, normalização, linha do tempo e reconhecimento de padrões — para transformar logs soltos em hipóteses investigáveis, com base em fontes oficiais vigentes: NIST, OWASP, MITRE, CIS e IETF. Até a data de corte desta verificação (24/08/2026), essas eram as referências consultadas. O próximo passo, ao terminar de ler, é aplicar o método à sua própria fila de alertas."
        ]
      },
      {
        "heading": "Por que a análise de logs é a base da detecção",
        "paragraphs": [
          "Um log é um registro de eventos que ocorrem nos ativos computacionais da organização, e a gestão de logs é o processo de gerar, transmitir, armazenar, acessar e descartar esses dados — conforme a definição do [NIST SP 800-92 Rev. 1 (draft)](https://csrc.nist.gov/pubs/sp/800/92/r1/ipd), o guia de planejamento de log management do NIST. O documento final vigente, [NIST SP 800-92](https://csrc.nist.gov/pubs/sp/800/92/final) (2006), já consolidava a prática: sem infraestrutura e processos de log bem definidos, a análise fica limitada ao que eventualmente foi registrado.",
          "A consequência de logging insuficiente é reconhecida no [OWASP Top 10:2025, categoria A09 — Security Logging and Alerting Failures](https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures): sem registros e monitoramento, ataques e violações não são detectados — e, sem alerta, é difícil responder a tempo. Em outras palavras: logs não são burocracia, são matéria-prima da detecção."
        ],
        "lists": []
      },
      {
        "heading": "Passo 1 — Conheça suas fontes de dado (e as lacunas)",
        "paragraphs": [
          "Antes de correlacionar, é preciso saber o que está sendo coletado. Fontes típicas incluem autenticação, sistema operacional, aplicação, rede e DNS. O [CIS Controls v8.1, Control 8 (Audit Log Management)](https://www.cisecurity.org/controls/audit-log-management) resume o objetivo: coletar, alertar, revisar e reter logs de eventos que ajudem a detectar, entender ou recuperar de um ataque.",
          "O mínimo recomendado pela [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) para logs de aplicação inclui:",
          "A etapa termina com um inventário honesto de lacunas: o que deveria ser logado e não é. Uma lacuna de coleta não é um problema de ferramenta — é um limite de visibilidade que precisa ser declarado."
        ],
        "lists": [
          {
            "items": [
              "Sucessos e falhas de autenticação — falhas repetidas são indicadores precoces de ataques baseados em credenciais.",
              "Falhas de autorização (controle de acesso).",
              "Falhas de validação de entrada.",
              "Erros de aplicação e eventos de sistema (início/fim de serviço, mudanças de configuração).",
              "Uso de privilégios administrativos e contas de exceção."
            ]
          }
        ]
      },
      {
        "heading": "Passo 2 — Normalize antes de correlacionar",
        "paragraphs": [
          "Eventos de fontes diferentes raramente conversam entre si no formato bruto: o campo \"usuário\" pode se chamar `user`, `username` ou `sAMAccountName`, e o horário pode vir em fusos distintos. Correlacionar sem normalizar produz falsas conclusões.",
          "O [RFC 5424](https://www.rfc-editor.org/rfc/rfc5424), padrão IETF de syslog estruturado, é uma referência útil: ele define campos como timestamp, hostname, nome da aplicação e dados estruturados, o que facilita o consumo e a correlação por sistemas diversos. Na prática, os campos mínimos que uma análise precisa ter de forma consistente são:",
          "Um detalhe que parece operacional e é na verdade analítico: relógios dessincronizados inviabilizam linha do tempo. Por isso o CIS Control 8 inclui a padronização da sincronização de tempo entre os ativos (safeguard 8.4). Se o relógio do servidor de autenticação está cinco minutos atrás do firewall, a sequência real dos eventos fica ilegível."
        ],
        "lists": [
          {
            "items": [
              "**Timestamp normalizado (idealmente UTC)**, para comparar eventos entre fusos.",
              "**Host/entidade de origem**.",
              "**Usuário ou conta envolvida**.",
              "**Ação executada** e **resultado** (sucesso/falha)."
            ]
          }
        ]
      },
      {
        "heading": "Passo 3 — Monte a linha do tempo e correlacione",
        "paragraphs": [
          "Com os dados normalizados, o próximo passo é correlacionar por entidade e por tempo. A pergunta orientadora é: \"o que este usuário (ou host) fez, em que ordem, e o que isso significa no contexto?\".",
          "Exemplos de correlação que valem a pena:",
          "O [MITRE ATT&CK](https://attack.mitre.org/) (versão vigente: v19.2, publicada em agosto de 2026) é a referência para descrever esse comportamento em linguagem comum: em vez de \"o usuário fez algo estranho\", a equipe conversa sobre fases do ataque, como acesso inicial, movimento lateral ou exfiltração. Um detalhe importante: o ATT&CK é um vocabulário para formular hipóteses — mapear um observável a uma técnica não prova que o evento é malicioso. Por isso, este guia evita fixar IDs de técnica: a v19 reestruturou táticas como Defense Evasion, e IDs mudam entre versões."
        ],
        "lists": [
          {
            "items": [
              "A mesma conta aparece com falhas de autenticação em vários hosts e depois com sucesso vindo de um endereço incomum.",
              "Um acesso bem-sucedido é seguido, em poucos minutos, de alteração de privilégio e de acesso a dados sensíveis.",
              "Um host de baixa atividade passa a executar ações administrativas com conta de serviço."
            ]
          }
        ]
      },
      {
        "heading": "Passo 4 — Reconheça padrões suspeitos (e valide)",
        "paragraphs": [
          "Padrões são sinais para investigar, nunca confirmação. Os exemplos abaixo são conceituais e anonimizados — servem para calibrar o olhar, não como regra universal:",
          "Antes de escalar qualquer padrão, valide com uma segunda fonte independente: o evento aparece no controlador de domínio e no firewall? O horário bate no fuso correto? Um único log não sustenta um incidente; duas fontes concordando formam uma hipótese defensável."
        ],
        "lists": [
          {
            "items": [
              "**Força bruta / credential stuffing:** muitas falhas de autenticação para a mesma conta, seguidas de sucesso, vindas de endereço ou intervalo de tempo incomum. A OWASP recomenda logar falhas de autenticação justamente por isso.",
              "**Acesso fora do padrão:** uso de conta administrativa em horário incomum, sem ticket ou justificativa.",
              "**Cadeia login → privilégio → dados:** autenticação, elevação e acesso a dados sensíveis em sequência rápida.",
              "**Defesa comprometida:** desativação de logs, agentes de coleta parados ou lacunas repentinas de eventos, acompanhadas de falhas de serviço."
            ]
          }
        ]
      },
      {
        "heading": "Falsos positivos, evidência e preservação",
        "paragraphs": [
          "Dois erros comuns destroem o valor da análise: regras amplas demais e logs frágeis. Regras excessivamente amplas produzem o que a OWASP chama de \"alarm fog\" — tanto ruído que os problemas reais passam despercebidos. Regras de detecção devem ser testadas contra baseline e ajustadas com base na taxa de falso positivo, sem perder os eventos-alvo.",
          "A integridade do log também é parte da análise: logs alteráveis não servem como evidência. O CIS Control 8 orienta proteger a coleta e a retenção; o [NIST SP 800-61r3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) (finalizado em abril de 2025), guia vigente de resposta a incidentes, reforça a preservação de evidências como parte do ciclo de detecção e resposta. Na prática: preserve os logs originais antes de qualquer ação de contenção, não sobrescreva dados, registre quem coletou o quê e quando, e siga a cadeia de custódia definida no processo interno da organização."
        ],
        "lists": []
      },
      {
        "heading": "O que ainda não sabemos",
        "paragraphs": [
          "Este guia não prescreve ferramentas específicas e não afirma telemetria ou experiência interna da CyDef. O NIST SP 800-92r1 ainda é um draft (o documento final vigente é o SP 800-92 de 2006) e deve ser acompanhado até sua publicação definitiva. As versões citadas — ATT&CK v19.2, CIS Controls v8.1 — foram verificadas em 24/08/2026 e precisam ser revalidadas antes da publicação. Autor e revisor técnico deste artigo ainda não foram definidos."
        ],
        "lists": []
      },
      {
        "heading": "Próximos passos",
        "paragraphs": [
          "Aplique os quatro passos à sua fila de alertas: mapeie as fontes de dado e as lacunas, normalize campos e relógios, monte a linha do tempo por entidade, documente hipóteses com o vocabulário do ATT&CK e valide cada padrão com uma segunda fonte antes de escalar. Consulte as referências oficiais abaixo para aprofundar."
        ],
        "lists": []
      }
    ],
    "sources": [
      {
        "label": "NIST SP 800-92 (final, 2006)",
        "url": "https://csrc.nist.gov/pubs/sp/800/92/final"
      },
      {
        "label": "NIST SP 800-92 Rev. 1 (draft, 2023)",
        "url": "https://csrc.nist.gov/pubs/sp/800/92/r1/ipd"
      },
      {
        "label": "OWASP Logging Cheat Sheet",
        "url": "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html"
      },
      {
        "label": "OWASP Top 10:2025, A09 Security Logging and Alerting Failures",
        "url": "https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures"
      },
      {
        "label": "MITRE ATT&CK (v19.2)",
        "url": "https://attack.mitre.org/"
      },
      {
        "label": "CIS Controls v8.1, Control 8 (Audit Log Management)",
        "url": "https://www.cisecurity.org/controls/audit-log-management"
      },
      {
        "label": "NIST SP 800-61r3 (final, 2025)",
        "url": "https://csrc.nist.gov/pubs/sp/800/61/r3/final"
      },
      {
        "label": "RFC 5424, The Syslog Protocol (IETF)",
        "url": "https://www.rfc-editor.org/rfc/rfc5424"
      }
    ],
    "changelog": [
      "2026-08-24: primeira versão, baseada no dossiê verificado (evergreen-logs-07, READY). Fontes acessadas e verificadas em 2026-08-24."
    ]
  },
  {
    "slug": "inteligencia-de-ameacas-como-usar-iocs",
    "title": "Inteligência de Ameaças: Como usar IOCs efetivamente",
    "category": "Inteligência de Ameaças",
    "excerpt": "Entenda como coletar, validar e aplicar Indicadores de Comprometimento no contexto de defesa proativa.",
    "date": "24 de Agosto, 2026",
    "dateISO": "2026-08-24",
    "readTime": "9 min",
    "image": "/assets/blog/threat-intel-thumb.webp",
    "author": "Equipe CyDef",
    "sections": [
      {
        "paragraphs": [
          "Um feed de Indicadores de Comprometimento (IOCs) não protege ninguém por si só: um indicador mal validado gera bloqueio indevido, e um indicador ignorado gera detecção perdida. Este guia apresenta um ciclo de vida em quatro etapas — coletar, validar, aplicar e expirar — para quem opera SOC, Blue Team ou detecção, com base em fontes oficiais vigentes: OASIS STIX 2.1 e TAXII 2.1, CISA, FIRST, MITRE ATT&CK, NIST, MISP e AlienVault OTX. Até a data de corte desta verificação (24/08/2026), essas eram as referências consultadas. Nenhum IOC real é citado aqui: os exemplos são conceituais e servem para calibrar o processo, não para copiar valores. O próximo passo, ao terminar de ler, é aplicar o ciclo aos feeds que sua equipe já consome."
        ]
      },
      {
        "heading": "O que é um IOC (e o que ele não é)",
        "paragraphs": [
          "Um indicador de comprometimento é um observável — endereço IP, domínio, hash de arquivo, caminho, endereço de e-mail, chave de registro — associado a atividade maliciosa conhecida ou suspeita. O guia oficial de compartilhamento de informações de ameaça do NIST, o [NIST SP 800-150](https://csrc.nist.gov/pubs/sp/800/150/final) (publicado em outubro de 2016), trata indicadores como peça central do compartilhamento de inteligência cibernética entre organizações.",
          "O formato técnico mais usado para representar um IOC vem do [padrão OASIS STIX 2.1](https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html) (publicado em junho de 2021): o objeto `indicator` carrega um `pattern` — uma expressão estruturada que descreve o observável a ser procurado —, uma janela de validade, rótulos e as fases de ataque em que ele se aplica. Na prática, um indicador responde a uma pergunta objetiva: \"este observável já esteve associado a atividade maliciosa?\".",
          "O ponto que mais gera erro de interpretação é este: **um IOC é evidência para triagem, não a identidade do atacante e não a confirmação de comprometimento**. Um endereço visto em uma campanha pode ser compartilhado por uma CDN; um domínio pode ser sinkholed por um pesquisador; um hash pode reaparecer em um binário legítimo. O match de um indicador abre uma investigação — e só."
        ],
        "lists": []
      },
      {
        "heading": "Por que IOCs expiram: volátil vs. durável",
        "paragraphs": [
          "Indicadores são voláteis por natureza. O adversário troca de infraestrutura, registra novos domínios, rotaciona IPs e recompila amostras — o que torna cada indicador uma fotografia de um momento específico. O próprio padrão STIX 2.1 reconhece essa realidade: o objeto `indicator` define campos `valid_from` e `valid_until`, ou seja, o padrão formal prevê que um indicador tem uma janela de utilidade e expira.",
          "O contraste está nas TTPs — táticas, técnicas e procedimentos. O [MITRE ATT&CK](https://attack.mitre.org/) (versão vigente: v19.2, publicada em agosto de 2026) organiza o comportamento adversário em táticas e técnicas observadas em intrusões reais; o [Cyber Kill Chain da Lockheed Martin](https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html), framework parte do modelo Intelligence Driven Defense, descreve as fases que o adversário precisa completar para atingir o objetivo. Enquanto o IOC responde \"o que procurar\", as TTPs respondem \"como o adversário age\" — e comportamento é mais durável que infraestrutura.",
          "Esta distinção é uma síntese editorial apoiada nessas três referências: um IOC expira, um TTP persiste, e uma operação madura usa ambos — IOC para detectar o conhecido, TTP para caçar o desconhecido."
        ],
        "lists": []
      },
      {
        "heading": "Como coletar IOCs com qualidade",
        "paragraphs": [
          "A coleta começa com uma pergunta de propósito, não com volume: que decisão este indicador vai apoiar — detecção, bloqueio, triagem ou priorização? O NIST SP 800-150 orienta que o compartilhamento de informações de ameaça seja feito dentro de relações e processos definidos, não como acúmulo indiscriminado de dados.",
          "As fontes se organizam em camadas:",
          "Ao coletar, registre metadados: quem publicou, quando, com qual confiança e sob qual rótulo de compartilhamento. O [Traffic Light Protocol (TLP) 2.0 do FIRST](https://www.first.org/tlp/) (autoritativo desde agosto de 2022) define quatro rótulos — RED, AMBER, GREEN e CLEAR — que indicam até onde a informação pode ser repassada. Um IOC AMBER não é republicado sem autorização; respeitar o rótulo é parte do uso responsável da inteligência."
        ],
        "lists": [
          {
            "items": [
              "**Telemetria e incidentes próprios** — a fonte mais confiável para o seu contexto, desde que registrada com data, origem e evidência.",
              "**Comunidades e plataformas abertas** — [MISP](https://www.misp-project.org/) é uma plataforma open source de coleta, armazenamento, distribuição e compartilhamento de indicadores, usada por CERTs e organizações; o [AlienVault OTX](https://otx.alienvault.com/) (operado pela LevelBlue) é um exchange comunitário em que \"pulses\" reúnem IOCs e rótulos de compartilhamento.",
              "**Programas governamentais** — o [Automated Indicator Sharing (AIS) da CISA](https://www.cisa.gov/topics/cyber-threats-and-advisories/information-sharing/automated-indicator-sharing-ais) é o hub designado de troca de indicadores entre o governo federal dos EUA e o setor privado, operacional desde março de 2016, usando STIX/TAXII; o [catálogo KEV da CISA](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) reúne vulnerabilidades com exploração conhecida no mundo real.",
              "**Feeds comerciais** — úteis, mas devem passar pelo mesmo processo de validação que qualquer outra fonte."
            ]
          }
        ]
      },
      {
        "heading": "Como validar antes de agir",
        "paragraphs": [
          "A regra defensiva mais barata que existe é: **nenhum bloqueio automático baseado em IOC único de baixa confiança**. Antes de agir, valide quatro coisas:",
          "1. **Fonte e confiança** — quem publicou e qual o histórico dessa fonte? Em plataformas comunitárias como o OTX, a qualidade varia por ser crowdsourced: um pulse não é um relatório de laboratório. 2. **Idade** — o indicador ainda está dentro da janela de utilidade? Indicador antigo sem revalidação perde valor e vira ruído. 3. **Contexto** — o observável é exclusivo da atividade descrita ou pode ser infraestrutura compartilhada (IP dinâmico, CDN, hospedagem)? 4. **Confirmação independente** — uma segunda fonte ou a sua própria telemetria sustentam a mesma conclusão?",
          "O mesmo princípio de priorização existe no lado de vulnerabilidades, e é bom não confundir as métricas: o [EPSS do FIRST](https://www.first.org/epss/) estima a probabilidade de uma CVE ser explorada nos próximos 30 dias — é probabilidade, não confirmação de ataque; o KEV da CISA indica exploração conhecida — não prova comprometimento local. Usar os dois como insumo de priorização é correto; tratá-los como alarme de comprometimento não é."
        ],
        "lists": []
      },
      {
        "heading": "Como aplicar IOCs na detecção",
        "paragraphs": [
          "IOCs entram na operação em camadas, com contexto. Um match de indicador em SIEM, EDR ou firewall é um gatilho de triagem — um sinal de baixa fidelidade que merece investigação, não um veredito. Duas práticas tornam a aplicação sustentável:",
          "Teste sempre em modo de detecção antes de bloquear: ative o alerta, meça falsos positivos por um período definido e só então considere o bloqueio, com janela de expiração e procedimento de rollback."
        ],
        "lists": [
          {
            "items": [
              "**Transporte estruturado.** O [protocolo TAXII 2.1 da OASIS](https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html) define uma API RESTful para comunicar informações de ameaça entre cliente e servidor; combinado ao STIX, ele permite importar feeds com padrão, validade e contexto — em vez de listas soltas de valores. É o mesmo mecanismo usado pelo AIS da CISA.",
              "**Complemento com TTP.** Uma lista de IOCs detecta o que já é conhecido. Para o desconhecido, a operação precisa de hipóteses de comportamento: descrever o padrão observado com o vocabulário do ATT&CK e com as fases do kill chain, e caçar por comportamento, não apenas por valor. Um detalhe importante: o ATT&CK é uma taxonomia — mapear um observável a uma técnica é análise, não prova, e IDs de técnica mudam entre versões."
            ]
          }
        ]
      },
      {
        "heading": "Expiração e higiene do IOC",
        "paragraphs": [
          "Manter a lista limpa é tão defensivo quanto alimentá-la. Use a janela de validade do indicador (o `valid_until` do STIX, quando a fonte fornecer), defina uma cadência de revisão e remova IOCs vencidos ou não confirmados. Métricas simples ajudam: quantos alertas cada feed gera e quantos se convertem em investigação útil? Um feed que só produz ruído está custando atenção do analista — o \"alarm fog\" que esconde os sinais reais.",
          "Registre também as decisões: por que um IOC foi bloqueado e por que foi removido. Bloqueios indevidos acontecem — IP compartilhado, domínio reaproveitado — e precisam de reversão rápida e documentada."
        ],
        "lists": []
      },
      {
        "heading": "O que ainda não sabemos",
        "paragraphs": [
          "Este guia não prescreve ferramentas específicas, não cita IOCs reais e não afirma telemetria ou experiência interna da CyDef. As versões citadas — STIX 2.1 e TAXII 2.1 (junho de 2021), TLP 2.0 (agosto de 2022), ATT&CK v19.2 (agosto de 2026) — foram verificadas em 24/08/2026 e precisam ser revalidadas antes da publicação. Nenhuma métrica de eficácia de feeds ou de prevalência de campanhas foi encontrada nas fontes consultadas, e nenhuma será inventada. Autor e revisor técnico deste artigo ainda não foram definidos."
        ],
        "lists": []
      },
      {
        "heading": "Próximos passos",
        "paragraphs": [
          "Aplique o ciclo às fontes que sua equipe já consome: registre origem e confiança de cada IOC, defina janela de validade, ative detecção em alert-only, meça falsos positivos e documente a política de expiração — antes de qualquer bloqueio automático. Consulte as referências oficiais abaixo para aprofundar e revalide as fontes voláteis imediatamente antes de publicar."
        ],
        "lists": []
      }
    ],
    "sources": [
      {
        "label": "NIST SP 800-150, Guide to Cyber Threat Information Sharing (final, 2016)",
        "url": "https://csrc.nist.gov/pubs/sp/800/150/final"
      },
      {
        "label": "OASIS STIX Version 2.1 (OASIS Standard, 2021)",
        "url": "https://docs.oasis-open.org/cti/stix/v2.1/os/stix-v2.1-os.html"
      },
      {
        "label": "OASIS TAXII Version 2.1 (OASIS Standard, 2021)",
        "url": "https://docs.oasis-open.org/cti/taxii/v2.1/os/taxii-v2.1-os.html"
      },
      {
        "label": "CISA Known Exploited Vulnerabilities (KEV) Catalog",
        "url": "https://www.cisa.gov/known-exploited-vulnerabilities-catalog"
      },
      {
        "label": "FIRST Exploit Prediction Scoring System (EPSS)",
        "url": "https://www.first.org/epss/"
      },
      {
        "label": "FIRST Traffic Light Protocol (TLP) 2.0",
        "url": "https://www.first.org/tlp/"
      },
      {
        "label": "MITRE ATT&CK (v19.2)",
        "url": "https://attack.mitre.org/"
      },
      {
        "label": "MISP",
        "url": "https://www.misp-project.org/"
      },
      {
        "label": "AlienVault OTX (LevelBlue)",
        "url": "https://otx.alienvault.com/"
      },
      {
        "label": "Lockheed Martin Cyber Kill Chain",
        "url": "https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html"
      },
      {
        "label": "CISA Automated Indicator Sharing (AIS)",
        "url": "https://www.cisa.gov/topics/cyber-threats-and-advisories/information-sharing/automated-indicator-sharing-ais"
      }
    ],
    "changelog": [
      "2026-08-24: primeira versão, baseada no dossiê verificado (evergreen-threatintel-08, READY). Fontes acessadas e verificadas em 2026-08-24."
    ]
  }
];
