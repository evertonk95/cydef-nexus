import type { BlogPost } from "./posts";

/**
 * Campanha de phishing com blob URLs e Microsoft Teams - artigo PT.
 * Conteúdo convertido do original elaborado por Everton Nascimento (11/09/2026).
 * Capa: public/assets/blog/phishing-blob-urls-microsoft-teams-thumb.webp
 */
export const phishingBlobPost: BlogPost = {
  slug: "phishing-blob-urls-microsoft-teams-navegador",
  title:
    "Campanha de phishing cria páginas falsas de login diretamente no navegador das vítimas",
  category: "Inteligência de Ameaças",
  excerpt:
    "Uma campanha analisada pela Barracuda abandona a página de phishing hospedada e monta o conteúdo malicioso dentro do navegador da vítima, depois de uma cadeia de redirecionamentos que passa por Microsoft OAuth e Microsoft Teams.",
  date: "11 de Setembro, 2026",
  dateISO: "2026-09-11",
  readTime: "15 min",
  image: "/assets/blog/phishing-blob-urls-microsoft-teams-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "Phishing",
    "Microsoft 365",
    "Microsoft Teams",
    "OAuth",
    "Blob URL",
    "Threat Intelligence",
    "Blue Team",
    "SOC",
    "Identity Security",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "Uma campanha de phishing analisada pela Barracuda demonstra uma evolução importante nas técnicas de engenharia social: em vez de hospedar a página falsa de autenticação em um site convencional, os operadores montam o conteúdo de phishing **dentro do próprio navegador da vítima**, utilizando **blob URLs**, **service workers**, **iframes em sandbox** e uma cadeia de redirecionamentos que passa por serviços legítimos da Microsoft.",
        },
        {
          type: "p",
          text: "O fluxo observado começa com um e-mail com temática do DocuSign e utiliza um convite de calendário para reforçar a aparência de legitimidade. A vítima é então direcionada por infraestrutura legítima do Microsoft OAuth e pelo Microsoft Teams antes que um recurso externo seja carregado e convertido pelo navegador em uma blob URL.",
        },
        {
          type: "p",
          text: "O resultado é uma página falsa que pode existir apenas durante aquela sessão do navegador, reduzindo a utilidade de mecanismos de segurança baseados exclusivamente na reputação ou na inspeção prévia da URL final.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Avaliação CyDef",
            body: "Risco alto para organizações que dependem apenas de filtros de URL, reputação de domínio e conscientização baseada na verificação visual do endereço inicial.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipe CyDef. Fontes consultadas e verificadas em 11 de setembro de 2026.",
        },
      ],
    },
    {
      heading: "Resumo executivo",
      blocks: [
        {
          type: "p",
          text: "A campanha chama atenção porque modifica uma das premissas mais comuns do phishing tradicional: a existência de uma página maliciosa permanentemente hospedada em um domínio controlado pelo atacante.",
        },
        {
          type: "p",
          text: "No cenário analisado, a cadeia utiliza:",
        },
        {
          type: "list",
          items: [
            "e-mail com tema do DocuSign;",
            "convite de calendário como elemento de legitimidade;",
            "endpoint legítimo do Microsoft OAuth;",
            "Microsoft Teams como parte da cadeia de navegação;",
            "recurso externo hospedado em cdn.bloom[.]io;",
            "criação de uma **blob URL** pelo navegador;",
            "renderização local da página de phishing;",
            "**service worker** e **iframe em sandbox** para controlar partes do fluxo;",
            "infraestrutura remota para alterar dinamicamente o comportamento da campanha.",
          ],
        },
        {
          type: "p",
          text: "Segundo a Barracuda, a campanha não explora uma vulnerabilidade do Microsoft Teams. O que ocorre é o **abuso de serviços legítimos, recursos do navegador e mecanismos de redirecionamento** para construir uma cadeia mais convincente e menos visível para controles tradicionais.",
        },
      ],
    },
    {
      heading: "O que torna essa campanha diferente?",
      blocks: [
        {
          type: "p",
          text: "Em uma campanha convencional, o atacante normalmente registra ou compromete um domínio, publica uma página semelhante ao serviço legítimo e envia o link para a vítima.",
        },
        {
          type: "p",
          text: "Esse modelo oferece aos defensores diversos pontos de observação:",
        },
        {
          type: "list",
          items: [
            "reputação do domínio;",
            "idade do domínio;",
            "certificado;",
            "conteúdo HTML;",
            "hospedagem;",
            "screenshots automatizadas;",
            "análise em sandbox;",
            "mecanismos de crawling;",
            "inclusão da URL em blocklists.",
          ],
        },
        {
          type: "p",
          text: "A campanha analisada pela Barracuda reduz parte dessa superfície.",
        },
        {
          type: "p",
          text: "O conteúdo final de phishing é criado por meio de uma **blob URL**, ou seja, uma URL temporária gerada pelo navegador e associada a dados armazenados localmente na sessão.",
        },
        {
          type: "p",
          text: "Um endereço desse tipo pode assumir um formato semelhante a:",
        },
        { type: "code", text: "blob:https://exemplo/identificador" },
        {
          type: "p",
          text: "O ponto importante é que essa URL não representa, por si só, uma página tradicional hospedada em um servidor web que possa ser consultada posteriormente por uma solução de segurança.",
        },
        {
          type: "p",
          text: "Quando a sessão termina, o conteúdo pode deixar de existir.",
        },
        {
          type: "p",
          text: "Isso cria um problema relevante para análise preventiva e resposta a incidentes: **o que o usuário visualizou pode não estar mais disponível quando o SOC iniciar a investigação.**",
        },
      ],
    },
    {
      heading: "Cadeia de ataque observada",
      blocks: [
        {
          type: "p",
          text: "A sequência abaixo reproduz a ordem descrita pelos pesquisadores, da mensagem inicial até o controle da sessão do navegador.",
        },
      ],
    },
    {
      heading: "1. Engenharia social com tema do DocuSign",
      blocks: [
        {
          type: "p",
          text: "A vítima recebe um e-mail que simula uma solicitação relacionada ao DocuSign.",
        },
        {
          type: "p",
          text: "Esse tipo de abordagem explora um contexto comum em ambientes corporativos: documentos que precisam ser revisados, assinados ou aprovados.",
        },
      ],
    },
    {
      heading: "2. Convite de calendário como elemento de confiança",
      blocks: [
        {
          type: "p",
          text: "A mensagem inclui um arquivo de convite de calendário.",
        },
        {
          type: "p",
          text: "O convite não representa necessariamente a carga maliciosa principal. Sua função é tornar a comunicação mais compatível com um fluxo legítimo de negócios e reduzir a percepção de risco por parte do usuário.",
        },
      ],
    },
    {
      heading: "3. Redirecionamento por infraestrutura legítima do Microsoft OAuth",
      blocks: [
        {
          type: "p",
          text: "A navegação inicial utiliza login.microsoftonline.com, infraestrutura legítima da Microsoft.",
        },
        {
          type: "p",
          text: "Esse ponto é especialmente importante para análise defensiva.",
        },
        {
          type: "p",
          text: "**O domínio login.microsoftonline.com não deve ser tratado isoladamente como um indicador malicioso ou bloqueado.** Sua relevância existe dentro do **contexto da cadeia de redirecionamento**.",
        },
      ],
    },
    {
      heading: "4. Encaminhamento para o Microsoft Teams",
      blocks: [
        {
          type: "p",
          text: "Um parâmetro de redirecionamento elaborado conduz a vítima ao Microsoft Teams.",
        },
        {
          type: "p",
          text: "A presença de serviços Microsoft durante a navegação ajuda a reduzir sinais que normalmente levantariam suspeita em usuários e em determinados mecanismos automatizados de análise.",
        },
      ],
    },
    {
      heading: "5. Carregamento de recurso externo",
      blocks: [
        {
          type: "p",
          text: "Durante o fluxo observado pelos pesquisadores, o Microsoft Teams carrega um recurso externo hospedado em:",
        },
        { type: "code", text: "cdn.bloom[.]io" },
        {
          type: "p",
          text: "Esse domínio deve ser tratado como **artefato observado na campanha**, e não como evidência suficiente, isoladamente, para concluir comprometimento. Antes de aplicar qualquer bloqueio em produção, a organização deve validar contexto, uso legítimo, inteligência de ameaças disponível e possíveis impactos operacionais.",
        },
      ],
    },
    {
      heading: "6. Criação da blob URL",
      blocks: [
        {
          type: "p",
          text: "O navegador recebe o conteúdo e cria uma blob URL.",
        },
        {
          type: "p",
          text: "Nesse momento, o phishing deixa de depender de uma página final tradicionalmente hospedada e passa a ser renderizado localmente.",
        },
      ],
    },
    {
      heading: "7. Renderização da página falsa",
      blocks: [
        {
          type: "p",
          text: "A página de phishing é apresentada ao usuário dentro da sessão do navegador.",
        },
        {
          type: "p",
          text: "Para a vítima, a experiência pode se parecer com um fluxo comum de autenticação corporativa.",
        },
        {
          type: "p",
          text: "Para determinados mecanismos de segurança, entretanto, a página final pode não existir como um endereço HTTP ou HTTPS convencional que possa ser consultado posteriormente.",
        },
      ],
    },
    {
      heading: "8. Controle da sessão",
      blocks: [
        {
          type: "p",
          text: "A campanha utiliza recursos como:",
        },
        {
          type: "list",
          items: [
            "service workers;",
            "iframes em sandbox;",
            "mecanismos de comunicação do navegador;",
            "infraestrutura backend controlada pelos operadores.",
          ],
        },
        {
          type: "p",
          text: "Esses componentes permitem que o comportamento da página seja controlado e modificado dinamicamente.",
        },
        {
          type: "p",
          text: "A Barracuda também identificou configurações de comando e controle que indicam que o fluxo faz parte de uma plataforma administrável, em vez de uma página estática isolada.",
        },
      ],
    },
    {
      heading: "Diagrama simplificado da cadeia",
      blocks: [
        {
          type: "code",
          text: "E-mail com tema do DocuSign\n        |\n        v\nConvite de calendário\n        |\n        v\nMicrosoft OAuth\n(login.microsoftonline.com)\n        |\n        v\nMicrosoft Teams\n        |\n        v\nRecurso externo\n(cdn.bloom[.]io)\n        |\n        v\nConteúdo recebido pelo navegador\n        |\n        v\nCriação de blob URL\n        |\n        v\nPágina falsa renderizada localmente\n        |\n        +--> Service Worker\n        +--> Sandboxed iframe\n        +--> Backend do atacante\n        |\n        v\nPossível captura de credenciais\ne comprometimento de conta",
        },
      ],
    },
    {
      heading: "Por que blob URLs dificultam a detecção?",
      blocks: [
        {
          type: "p",
          text: "Blob URLs são recursos legítimos dos navegadores modernos. Aplicações web podem utilizá-las para representar objetos criados dinamicamente, como arquivos, imagens, documentos e conteúdo gerado durante a execução de uma aplicação.",
        },
        {
          type: "p",
          text: "O problema não está na tecnologia em si, mas no uso abusivo.",
        },
      ],
    },
    {
      heading: "Ausência de uma página final convencional",
      blocks: [
        {
          type: "p",
          text: "Uma ferramenta que tenta acessar posteriormente a URL de phishing pode não conseguir reproduzir o conteúdo visualizado pela vítima.",
        },
      ],
    },
    {
      heading: "Natureza temporária",
      blocks: [
        {
          type: "p",
          text: "A página pode existir somente enquanto o objeto permanecer associado à sessão do navegador.",
        },
      ],
    },
    {
      heading: "Menor valor da reputação de URL",
      blocks: [
        {
          type: "p",
          text: "Soluções que dependem fortemente de blocklists ou reputação de domínios podem ter dificuldade para avaliar uma URL criada localmente.",
        },
      ],
    },
    {
      heading: "Dependência do contexto de execução",
      blocks: [
        {
          type: "p",
          text: "Para compreender o ataque, pode ser necessário reconstruir:",
        },
        {
          type: "list",
          items: [
            "a mensagem recebida;",
            "o clique inicial;",
            "os redirecionamentos;",
            "o recurso externo carregado;",
            "o comportamento do navegador;",
            "a autenticação realizada posteriormente.",
          ],
        },
        {
          type: "p",
          text: "A análise deixa de ser puramente baseada em URL e passa a exigir **correlação entre e-mail, navegador, endpoint e identidade**.",
        },
      ],
    },
    {
      heading: "Uso de serviços legítimos como parte da cadeia",
      blocks: [
        {
          type: "p",
          text: "Outro aspecto importante é a utilização de infraestrutura legítima.",
        },
        {
          type: "p",
          text: "A presença de domínios Microsoft não torna a sessão segura automaticamente. Da mesma forma, a presença desses domínios em logs de uma investigação não significa que a infraestrutura da Microsoft esteja comprometida.",
        },
        {
          type: "p",
          text: "A técnica explora a confiança associada a serviços conhecidos e os utiliza como parte de uma sequência de navegação. Isso reforça uma mudança importante no modelo de detecção:",
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Mudança de premissa",
            body: "A reputação de um único domínio é insuficiente para determinar a legitimidade de uma cadeia completa de navegação.",
          },
        },
      ],
    },
    {
      heading: "Possíveis impactos",
      blocks: [
        {
          type: "p",
          text: "Caso a vítima informe credenciais na página falsa ou aprove uma etapa posterior controlada pelos operadores, os impactos podem incluir:",
        },
      ],
    },
    {
      heading: "Roubo de credenciais",
      blocks: [
        {
          type: "p",
          text: "Usuários podem fornecer nome de usuário, senha ou outros dados de autenticação em uma interface que aparenta ser legítima.",
        },
      ],
    },
    {
      heading: "Comprometimento de contas",
      blocks: [
        {
          type: "p",
          text: "Credenciais válidas podem permitir acesso indevido a serviços corporativos, especialmente quando controles adicionais de identidade não estiverem presentes.",
        },
      ],
    },
    {
      heading: "Acesso a recursos em nuvem",
      blocks: [
        {
          type: "p",
          text: "Uma conta comprometida pode expor, de acordo com seus privilégios:",
        },
        {
          type: "list",
          items: [
            "e-mail;",
            "documentos;",
            "arquivos compartilhados;",
            "informações corporativas;",
            "aplicações SaaS;",
            "dados armazenados em serviços de nuvem.",
          ],
        },
      ],
    },
    {
      heading: "Movimentação para outros ataques",
      blocks: [
        {
          type: "p",
          text: "O comprometimento inicial de identidade pode ser utilizado como ponto de partida para novas campanhas de phishing, fraude interna, coleta de informações e outras atividades pós-comprometimento.",
        },
      ],
    },
    {
      heading: "Redução de evidências disponíveis",
      blocks: [
        {
          type: "p",
          text: "Como parte do conteúdo é gerada durante a sessão, a investigação pode perder informações relevantes caso artefatos do navegador e eventos de identidade não sejam preservados rapidamente.",
        },
      ],
    },
    {
      heading: "Desafios para SOC e Blue Team",
      blocks: [
        {
          type: "p",
          text: "A campanha demonstra por que a defesa contra phishing moderno não deve depender exclusivamente de controles de e-mail ou listas de domínios maliciosos.",
        },
      ],
    },
    {
      heading: "1. O primeiro domínio pode ser legítimo",
      blocks: [
        {
          type: "p",
          text: "O usuário pode visualizar infraestrutura conhecida no início da navegação.",
        },
      ],
    },
    {
      heading: "2. O destino efetivo aparece depois de múltiplos redirecionamentos",
      blocks: [
        {
          type: "p",
          text: "Analisar apenas o primeiro link pode produzir uma conclusão incorreta.",
        },
      ],
    },
    {
      heading: "3. A página final pode não ser recuperável",
      blocks: [
        {
          type: "p",
          text: "Quando o analista tentar reproduzir o incidente, a blob URL poderá não existir mais.",
        },
      ],
    },
    {
      heading: "4. A detecção precisa atravessar múltiplas camadas",
      blocks: [
        {
          type: "p",
          text: "O SOC deve correlacionar dados provenientes de:",
        },
        {
          type: "list",
          items: [
            "Secure Email Gateway;",
            "EDR/XDR;",
            "navegador;",
            "proxy/SWG/SSE;",
            "DNS;",
            "identidade;",
            "Microsoft Entra ID;",
            "Microsoft 365;",
            "SIEM;",
            "ferramentas de proteção contra phishing.",
          ],
        },
      ],
    },
    {
      heading: "Indicadores e artefatos de investigação",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Tipo", "Valor / Artefato", "Classificação", "Orientação"],
            rows: [
              [
                "Domínio",
                "cdn.bloom[.]io",
                "Artefato observado na campanha",
                "Investigar acessos no contexto da cadeia; validar antes de bloquear",
              ],
              [
                "Domínio",
                "login.microsoftonline.com",
                "Infraestrutura legítima Microsoft",
                "Não tratar como IoC isolado e não bloquear",
              ],
              [
                "Serviço",
                "Microsoft Teams",
                "Serviço legítimo utilizado na cadeia",
                "Avaliar redirecionamentos e carregamentos externos associados",
              ],
              [
                "Esquema",
                "blob:",
                "Recurso legítimo de navegador",
                "Investigar quando associado a páginas de login ou fluxos suspeitos",
              ],
              [
                "Navegador",
                "Service Worker",
                "Recurso legítimo",
                "Avaliar registros ou comportamento anômalo em contexto de phishing",
              ],
              [
                "Navegador",
                "Sandboxed iframe",
                "Recurso legítimo",
                "Correlacionar com conteúdo externo e fluxos de autenticação suspeitos",
              ],
              [
                "E-mail",
                "Tema DocuSign",
                "Indicador comportamental",
                "Avaliar remetente, autenticação do e-mail, links e contexto da solicitação",
              ],
              [
                "Anexo",
                "Convite de calendário",
                "Indicador contextual",
                "Não considerar malicioso isoladamente; analisar URLs e cadeia associada",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "Observação sobre IoCs",
      blocks: [
        {
          type: "p",
          text: "Nem todos os elementos de uma cadeia de ataque devem ser tratados como IoCs bloqueáveis. Serviços como Microsoft OAuth e Teams possuem uso legítimo em larga escala.",
        },
        {
          type: "p",
          text: "Bloqueios indiscriminados podem gerar alto impacto operacional e elevado volume de falsos positivos. A abordagem recomendada é combinar **indicadores técnicos, sequência de eventos e comportamento**.",
        },
      ],
    },
    {
      heading: "Mapeamento MITRE ATT&CK",
      blocks: [
        {
          type: "p",
          text: "O mapeamento abaixo representa uma avaliação defensiva da CyDef com base no comportamento descrito publicamente e deve ser validado conforme as evidências disponíveis em cada incidente.",
        },
        {
          type: "table",
          table: {
            headers: ["Tática", "Técnica", "ID", "Relação com a atividade"],
            rows: [
              [
                "Initial Access",
                "Phishing",
                "T1566",
                "E-mail utilizado para conduzir a vítima ao fluxo malicioso",
              ],
              [
                "Initial Access",
                "Spearphishing Link",
                "T1566.002",
                "Navegação induzida por link/redirecionamento",
              ],
              [
                "Execution",
                "User Execution: Malicious Link",
                "T1204.001",
                "A cadeia depende da interação da vítima",
              ],
              [
                "Credential Access",
                "Input Capture",
                "T1056",
                "Página falsa busca capturar informações fornecidas pelo usuário",
              ],
              [
                "Credential Access",
                "Web Portal Capture",
                "T1056.003",
                "Compatível com a utilização de página de autenticação falsa para coleta de credenciais",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "Técnicas pós-comprometimento, como uso de contas válidas, só devem ser atribuídas caso existam evidências de que credenciais capturadas foram efetivamente utilizadas.",
        },
      ],
    },
    {
      heading: "Hipóteses de detecção",
      blocks: [
        {
          type: "p",
          text: "Em vez de criar uma regra baseada somente em um domínio, equipes de Detection Engineering podem trabalhar com hipóteses de correlação.",
        },
      ],
    },
    {
      heading: "Hipótese 1: E-mail de assinatura seguido por cadeia incomum",
      blocks: [
        {
          type: "p",
          text: "Procurar eventos em que:",
        },
        {
          type: "code",
          text: "mensagem com tema de assinatura/documento\nAND\nlink ou convite de calendário\nAND\nnavegação para serviço Microsoft legítimo\nAND\nredirecionamento ou acesso subsequente a domínio externo incomum",
        },
      ],
    },
    {
      heading: "Hipótese 2: Domínio externo logo após Teams/OAuth",
      blocks: [
        {
          type: "p",
          text: "Correlacionar, em uma janela temporal curta:",
        },
        {
          type: "code",
          text: "acesso a login.microsoftonline.com\nOR acesso a Microsoft Teams\nTHEN\nconexão com cdn.bloom.io ou outro domínio externo recém-observado\nTHEN\nevento de autenticação suspeito",
        },
        {
          type: "p",
          text: "O objetivo não é considerar a sequência automaticamente maliciosa, mas elevar sua prioridade para investigação quando houver contexto de e-mail suspeito.",
        },
      ],
    },
    {
      heading: "Hipótese 3: Autenticação anômala após clique reportado",
      blocks: [
        {
          type: "p",
          text: "Após um usuário relatar interação com uma mensagem suspeita, procurar:",
        },
        {
          type: "list",
          items: [
            "novos endereços IP;",
            "ASN incomum;",
            "localização incompatível com o padrão do usuário;",
            "dispositivo não reconhecido;",
            "user agent atípico;",
            "novas sessões;",
            "alterações em métodos de autenticação;",
            "criação de regras de caixa postal;",
            "consentimentos ou aplicações incomuns;",
            "acessos a arquivos e serviços logo após o evento.",
          ],
        },
      ],
    },
    {
      heading: "Hipótese 4: Blob URL utilizada em contexto de autenticação",
      blocks: [
        {
          type: "p",
          text: "Quando a organização possuir telemetria de navegador capaz de registrar esse comportamento, priorizar casos em que uma blob URL esteja associada a:",
        },
        {
          type: "list",
          items: [
            "formulário de login;",
            "solicitação de credenciais;",
            "navegação originada de e-mail;",
            "carregamento de scripts ou conteúdo externo incomum;",
            "registro recente de service worker.",
          ],
        },
        {
          type: "p",
          text: "A disponibilidade desses dados varia conforme navegador, EDR, extensão corporativa e arquitetura de segurança utilizada.",
        },
      ],
    },
    {
      heading: "Recomendações de proteção",
      blocks: [
        {
          type: "p",
          text: "As ações abaixo seguem as recomendações da fonte primária e a experiência de operação de SOC, com foco em controles que continuam válidos quando a página de phishing deixa de existir como URL.",
        },
      ],
    },
    {
      heading: "Monitorar a cadeia completa de redirecionamento",
      blocks: [
        {
          type: "p",
          text: "Ferramentas de proteção de e-mail e navegação devem, sempre que possível, analisar mais do que o primeiro endereço presente na mensagem.",
        },
        {
          type: "p",
          text: "O objetivo é identificar o destino e o comportamento ao longo de toda a cadeia.",
        },
      ],
    },
    {
      heading: "Fortalecer autenticação resistente a phishing",
      blocks: [
        {
          type: "p",
          text: "A Barracuda recomenda mecanismos como:",
        },
        {
          type: "list",
          items: ["FIDO2;", "security keys;", "passkeys."],
        },
        {
          type: "p",
          text: "Métodos resistentes a phishing reduzem o risco associado ao simples roubo de senha e representam uma camada importante de proteção contra campanhas modernas de coleta de credenciais.",
        },
      ],
    },
    {
      heading: "Correlacionar e-mail, identidade e endpoint",
      blocks: [
        {
          type: "p",
          text: "O clique no e-mail não deve ser analisado isoladamente. Uma investigação madura deve conseguir relacionar:",
        },
        {
          type: "code",
          text: "E-mail\n  -> Clique\n  -> Navegação\n  -> Endpoint\n  -> Identidade\n  -> Sessão\n  -> Recursos acessados",
        },
      ],
    },
    {
      heading: "Monitorar fluxos OAuth e redirecionamentos",
      blocks: [
        {
          type: "p",
          text: "Redirecionamentos inesperados, parâmetros incomuns e sequências envolvendo serviços de autenticação devem ser avaliados em contexto.",
        },
      ],
    },
    {
      heading: "Aumentar visibilidade do navegador",
      blocks: [
        {
          type: "p",
          text: "Organizações com maior exposição a phishing podem avaliar mecanismos de browser security, SSE/SWG, extensões corporativas e telemetria capaz de fornecer maior visibilidade sobre o comportamento ocorrido após o clique.",
        },
      ],
    },
    {
      heading: "Atualizar treinamentos de conscientização",
      blocks: [
        {
          type: "p",
          text: "Orientações como “verifique se o domínio parece legítimo” continuam úteis, mas já não são suficientes isoladamente. Os usuários também devem ser orientados a:",
        },
        {
          type: "list",
          items: [
            "desconfiar de solicitações inesperadas de assinatura;",
            "confirmar pedidos sensíveis por um canal conhecido;",
            "interromper o fluxo quando uma solicitação de autenticação surgir de forma inesperada;",
            "reportar rapidamente mensagens suspeitas, mesmo após terem clicado.",
          ],
        },
      ],
    },
    {
      heading: "Ações recomendadas em caso de interação",
      blocks: [
        {
          type: "p",
          text: "Se um usuário tiver interagido com uma campanha semelhante, a resposta deve considerar o grau de exposição.",
        },
      ],
    },
    {
      heading: "Quando houve apenas o clique",
      blocks: [
        {
          type: "list",
          items: [
            "1) preservar a mensagem original;",
            "2) registrar horário aproximado da interação;",
            "3) coletar a cadeia de URLs e redirecionamentos disponível;",
            "4) revisar telemetria do endpoint e do navegador;",
            "5) consultar eventos de proxy, DNS e EDR;",
            "6) revisar autenticações ocorridas logo após o clique;",
            "7) identificar outros destinatários da mesma campanha.",
          ],
        },
      ],
    },
    {
      heading: "Quando credenciais podem ter sido informadas",
      blocks: [
        {
          type: "p",
          text: "Além das ações anteriores:",
        },
        {
          type: "list",
          items: [
            "1) redefinir a credencial exposta;",
            "2) revogar sessões e tokens aplicáveis;",
            "3) revisar eventos de autenticação;",
            "4) verificar novos dispositivos e localizações;",
            "5) revisar alterações de MFA ou métodos de autenticação;",
            "6) procurar regras de encaminhamento ou caixa postal suspeitas;",
            "7) analisar acessos a arquivos e aplicações;",
            "8) verificar sinais de persistência ou uso posterior da conta.",
          ],
        },
      ],
    },
    {
      heading: "Quando houver evidência de comprometimento da conta",
      blocks: [
        {
          type: "p",
          text: "A organização deve ampliar o escopo da investigação para determinar:",
        },
        {
          type: "list",
          items: [
            "quais serviços foram acessados;",
            "quais dados foram consultados ou baixados;",
            "se houve envio de mensagens pela conta comprometida;",
            "se outras identidades foram alvo;",
            "se aplicações ou consentimentos foram adicionados;",
            "se credenciais ou tokens adicionais foram obtidos;",
            "se o incidente exige comunicação interna, jurídica, regulatória ou a clientes.",
          ],
        },
      ],
    },
    {
      heading: "O que essa campanha ensina",
      blocks: [
        {
          type: "p",
          text: "O principal aprendizado não está apenas no uso de blob URLs.",
        },
        {
          type: "p",
          text: "A campanha demonstra uma tendência maior: **atacantes estão deslocando etapas da cadeia de phishing para ambientes e serviços considerados confiáveis**, reduzindo o valor de controles baseados em indicadores estáticos.",
        },
        {
          type: "p",
          text: "A pergunta defensiva deixa de ser somente:",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Da URL para a sequência",
            body: "“Qual é a URL maliciosa?” deixa de ser a pergunta central e passa a incluir: “Qual foi a sequência completa de ações que levou o usuário até a solicitação de credenciais?”.",
          },
        },
        {
          type: "p",
          text: "Esse modelo exige maior integração entre segurança de e-mail, proteção de identidade, navegador, endpoint e SIEM.",
        },
      ],
    },
    {
      heading: "Conclusão",
      blocks: [
        {
          type: "p",
          text: "A campanha analisada pela Barracuda mostra como técnicas de phishing estão evoluindo para contornar mecanismos tradicionais de análise.",
        },
        {
          type: "p",
          text: "Ao utilizar Microsoft OAuth e Microsoft Teams como partes de uma cadeia de navegação e gerar a página falsa por meio de uma blob URL dentro do navegador, os operadores reduzem sinais tradicionais de comprometimento e tornam a investigação mais dependente de contexto e correlação.",
        },
        {
          type: "p",
          text: "Isso não representa uma vulnerabilidade do Microsoft Teams. Representa, porém, um exemplo relevante de **abuso de funcionalidades legítimas para construir uma experiência de phishing mais convincente e evasiva**.",
        },
        {
          type: "p",
          text: "Para equipes de SOC, Blue Team e Detection Engineering, a principal mudança de mentalidade é clara: **não basta analisar onde o clique começou. É necessário entender o que o navegador fez depois dele.**",
        },
      ],
    },
    {
      blocks: [
        {
          type: "note",
          text: "Este conteúdo tem caráter informativo e de conscientização em segurança cibernética. Indicadores técnicos devem ser validados no contexto de cada ambiente antes da aplicação de bloqueios ou outras ações de contenção.",
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Barracuda Networks: Phishing pages that exist only inside the victim’s browser (Ashitosh Deshnur, 09/09/2026)",
      url: "https://blog.barracuda.com/2026/09/09/browser-based-phishing-blob-urls-microsoft-redirects",
    },
    {
      label:
        "Cyber Security News: Hackers Use Blob URLs and Microsoft Teams to Create Phishing Pages Inside Victims’ Browsers (Tushar Subhra Dutta, 10/09/2026)",
      url: "https://cybersecuritynews.com/hackers-use-blob-urls/",
    },
  ],
  changelog: [
    "2026-09-11: primeira versão, baseada na análise pública da Barracuda Networks e na cobertura do Cyber Security News.",
  ],
};
