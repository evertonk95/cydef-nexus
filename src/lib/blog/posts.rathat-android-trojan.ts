import type { BlogPost } from "./posts";

/**
 * RatHat: trojan bancário para Android com controle orientado por IA (PT).
 * Conteúdo elaborado a partir do relatório da Malwarebytes divulgado em setembro
 * de 2026 (análise da Zimperium zLabs) e da publicação analisada pela
 * Cyber Security News. Capa: public/assets/blog/rathat-android-banking-trojan-thumb.webp
 */
export const rathatAndroidTrojanPost: BlogPost = {
  slug: "rathat-trojan-bancario-android-controle-ia",
  title:
    "RatHat: trojan bancário no Android usa IA para roubar credenciais, códigos e reconstruir PINs",
  category: "Inteligência de Ameaças",
  excerpt:
    "Um trojan bancário para Android identificado como RatHat combina engenharia social, abuso do serviço de acessibilidade e uso indevido do Android Debug Bridge para sobrepor telas de aplicativos financeiros, interceptar códigos de autenticação e reconstruir PINs e padrões de desbloqueio a partir das coordenadas de toque.",
  date: "21 de Setembro, 2026",
  dateISO: "2026-09-21",
  readTime: "10 min",
  image: "/assets/blog/rathat-android-banking-trojan-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "Android",
    "RatHat",
    "Trojan bancário",
    "Malware móvel",
    "Serviço de Acessibilidade",
    "Wireless Debugging",
    "ADB",
    "Engenharia social",
    "Inteligência de Ameaças",
    "Blue Team",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "Um trojan bancário para Android identificado como **RatHat** foi analisado em setembro de 2026 pela **Zimperium zLabs**, com divulgação da **Malwarebytes**. O malware não depende de uma falha de software para entrar no dispositivo: a campanha começa com engenharia social e termina com controle remoto de nível de sistema, alcançado pelo uso indevido de recursos legítimos do Android.",
        },
        {
          type: "p",
          text: "A cadeia abusa de três pilares do próprio sistema operacional: o **serviço de acessibilidade**, o **depurador sem fio** (Wireless Debugging) e o **Android Debug Bridge** (ADB). Com essa combinação, o RatHat obtém uma sessão em nível de shell, instala componentes nativos ocultos e passa a operar fora dos limites de um aplicativo comum.",
        },
        {
          type: "p",
          text: "O diferencial apontado na análise é o uso de um **assistente de IA em tempo real** para inspecionar a interface e decidir onde tocar ou rolar. Em vez de seguir apenas instruções fixas, o malware adapta a navegação ao que encontra na tela, o que tende a reduzir a eficácia de detecção baseada apenas em assinatura.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Avaliação CyDef",
            body: "O caso não é interessante por uma técnica exótica isolada, e sim pela composição: permissão de acessibilidade concedida por engano, depurador sem fio habilitado e ADB como ponte para execução de comandos. Cada um desses itens é legítimo e útil quando bem usado. O risco aparece quando os três coexistem, e é aí que controles de política em dispositivos corporativos e a educação sobre instalação de aplicativos passam a valer mais do que a assinatura de antivírus.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipe CyDef. Fontes consultadas e verificadas em 21 de setembro de 2026.",
        },
      ],
    },
    {
      heading: "Resumo executivo",
      blocks: [
        {
          type: "p",
          text: "O que se sabe até 21 de setembro de 2026, com base no relatório da Malwarebytes, na análise da Zimperium zLabs e na publicação consultada:",
        },
        {
          type: "list",
          items: [
            "**Família:** RatHat, trojan bancário para Android com controle orientado por IA.",
            "**Detecção informada:** Android/Trojan.Exploit.RatHat, conforme a Malwarebytes.",
            "**Vetor inicial:** SMS de phishing (smishing) ou anúncios maliciosos que levam a páginas falsas de download, imitando aplicativos conhecidos.",
            "**Pré-requisito:** instalação manual do APK fora de loja oficial (sideload) e concessão da permissão de serviço de acessibilidade.",
            "**Escalada:** habilitação do Wireless Debugging, leitura do código de pareamento de seis dígitos e pareamento por ADB até uma sessão em nível de shell.",
            "**Componentes:** agente nativo escrito em Go para executar comandos de sistema e componente de túnel reverso para servidor controlado pelo atacante.",
            "**Fraude:** sobreposição de telas falsas em aplicativos financeiros, interceptação de SMS e captura de coordenadas de toque para reconstruir PINs e padrões.",
            "**Persistência:** o aplicativo malicioso pode ser restaurado após a remoção convencional, por meio de componente oculto.",
            "**Alvo:** usuários de dispositivos Android e de aplicativos financeiros, com foco em campanhas distribuídas por smishing.",
            "**Escopo do incidente:** a atividade é uma campanha de crime financeiro em larga escala, não um ataque direcionado a uma organização específica.",
          ],
        },
      ],
    },
    {
      heading: "Perfil da atividade",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Atributo", "Detalhe"],
            rows: [
              ["Nome", "RatHat"],
              ["Tipo", "Trojan bancário para Android"],
              [
                "Motivação",
                "Roubo de credenciais bancárias, códigos de autenticação e PINs de desbloqueio",
              ],
              ["Distribuição", "Smishing e anúncios maliciosos com páginas falsas de download"],
              ["Divulgação", "Atividade analisada e divulgada em setembro de 2026"],
              ["Análise", "Zimperium zLabs, com divulgação pela Malwarebytes"],
              ["Alvo", "Usuários de dispositivos Android e aplicativos financeiros"],
              [
                "Técnica central",
                "Abuso de acessibilidade, Wireless Debugging, ADB e decisões orientadas por IA",
              ],
              [
                "Componentes",
                "APK malicioso, serviço de acessibilidade, ADB, agente em Go e túnel reverso",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "Como a cadeia de ataque funciona",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Etapa", "Técnica", "Detalhe"],
            rows: [
              [
                "1",
                "Engenharia social",
                "SMS de phishing ou anúncio malicioso com link para uma página falsa de download",
              ],
              [
                "2",
                "Sideload",
                "Indução da vítima a instalar um APK fora de loja oficial, muitas vezes imitando um aplicativo conhecido",
              ],
              [
                "3",
                "Abuso de acessibilidade",
                "Pedido da permissão de serviço de acessibilidade com justificativa falsa, como remover uma suposta restrição de rede",
              ],
              [
                "4",
                "Wireless Debugging",
                "Ativação das opções de desenvolvedor e leitura do código de pareamento de seis dígitos",
              ],
              [
                "5",
                "ADB",
                "Pareamento automático e obtenção de uma sessão em nível de shell no dispositivo",
              ],
              [
                "6",
                "Componentes ocultos",
                "Implantação de um agente em Go para executar comandos e de um componente de túnel reverso",
              ],
              [
                "7",
                "Fraude bancária",
                "Sobreposição de telas falsas, interceptação de SMS e reconstrução de PIN ou padrão",
              ],
            ],
          },
        },
        {
          type: "callout",
          callout: {
            kind: "aviso",
            title: "O primeiro pedido de permissão é o ponto de decisão",
            body: "A proteção mais forte continua sendo não conceder a primeira permissão. Um aplicativo de entretenimento, finanças ou navegador não tem motivo legítimo para pedir controle de acessibilidade, que permite ler a tela e agir em nome do usuário.",
          },
        },
      ],
    },
    {
      heading: "O que a IA muda na operação e na detecção",
      blocks: [
        {
          type: "p",
          text: "Segundo a análise divulgada, o RatHat pode usar um assistente de IA ao vivo para inspecionar a interface e decidir onde tocar ou rolar. Isso substitui roteiros rígidos de automação, que costumam falhar quando a versão do aplicativo muda ou quando um aviso aparece no meio do caminho.",
        },
        {
          type: "p",
          text: "Para detecção, a consequência prática é que o comportamento deixa de ser previsível em sequência fixa de eventos. Regras que dependem de uma ordem exata de toques ou de um fluxo único de telas perdem precisão. Ganham peso sinais de contexto: quais permissões foram concedidas, se o depurador sem fio foi habilitado, se há componente nativo sendo executado e se existem conexões persistentes para fora do dispositivo.",
        },
      ],
    },
    {
      heading: "Wireless Debugging e ADB: por que o abuso é tão eficaz",
      blocks: [
        {
          type: "p",
          text: "O Wireless Debugging é um recurso legítimo para desenvolvimento, que permite parear um dispositivo com uma estação de trabalho sem cabo. O pareamento exige um código de seis dígitos exibido no dispositivo, justamente para que alguém com acesso físico confirme a operação.",
        },
        {
          type: "p",
          text: "Com a permissão de acessibilidade já concedida, o malware consegue navegar pelas configurações, ativar o recurso e ler o código exibido na tela. A partir do pareamento, o ADB oferece uma sessão em nível de shell, muito além do que um aplicativo comum poderia fazer. É essa ponte que permite instalar os componentes ocultos e sustentar a operação.",
        },
      ],
    },
    {
      heading: "Captura de toque e reconstrução de PIN",
      blocks: [
        {
          type: "p",
          text: "O recurso mais incomum descrito na análise é a captura de coordenadas diretamente do driver de entrada do dispositivo, registrando onde o dedo toca a tela. O RatHat compara esses pontos com os layouts de teclados numéricos e de padrões de desbloqueio para reconstruir o PIN ou o padrão.",
        },
        {
          type: "p",
          text: "Como o método trabalha com a posição do toque, e não com a leitura do conteúdo da tela, ele contorna proteções pensadas para impedir captura de tela em aplicativos sensíveis. Em conjunto com a sobreposição de telas falsas e a interceptação de SMS, o resultado é um conjunto de técnicas que ataca justamente as camadas em que os aplicativos financeiros costumam confiar.",
        },
      ],
    },
    {
      heading: "Persistência: remover o aplicativo pode não bastar",
      blocks: [
        {
          type: "p",
          text: "Segundo a divulgação, o RatHat consegue restaurar o aplicativo malicioso após a remoção convencional, apoiando-se em um componente oculto em segundo plano. Na prática, apagar um aplicativo suspeito pode não encerrar o comprometimento, o que muda a recomendação de resposta.",
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Consequência para o playbook de resposta",
            body: "Em dispositivo com suspeita de comprometimento por essa família, o caminho indicado é a restauração de fábrica antes de restaurar dados, e não apenas a desinstalação do aplicativo. A troca de senhas e a revisão de acessos devem ser feitas de outro dispositivo confiável.",
          },
        },
      ],
    },
    {
      heading: "Indicadores de comprometimento e sinais de interesse",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Tipo", "Valor", "Descrição"],
            rows: [
              ["Família", "RatHat", "Trojan bancário para Android com controle orientado por IA"],
              [
                "Detecção",
                "Android/Trojan.Exploit.RatHat",
                "Identificação informada pela Malwarebytes",
              ],
              [
                "Aplicativo",
                "APK instalado por sideload",
                "Pacote malicioso distribuído fora de lojas oficiais",
              ],
              [
                "Serviço",
                "Accessibility Service",
                "Permissão usada para observar a tela e interagir com aplicativos",
              ],
              [
                "Recurso",
                "Wireless Debugging",
                "Funcionalidade abusada para habilitar o pareamento ADB",
              ],
              [
                "Ferramenta",
                "Android Debug Bridge",
                "Utilizada para obter sessão em nível de shell",
              ],
              ["Componente", "Agente nativo em Go", "Utilizado para executar comandos de sistema"],
              [
                "Componente",
                "Túnel reverso",
                "Conexão persistente com servidor controlado pelo atacante",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "Sinais que merecem investigação em dispositivo corporativo ou pessoal: permissão de acessibilidade concedida a aplicativo instalado fora de loja oficial, depurador sem fio habilitado sem uso de desenvolvimento, aplicativo que reaparece após ser desinstalado e tráfego persistente para destino desconhecido.",
        },
      ],
    },
    {
      heading: "Impacto potencial",
      blocks: [
        {
          type: "list",
          items: [
            "**Credenciais:** roubo de usuário e senha de aplicativos bancários por sobreposição de telas falsas.",
            "**Autenticação:** interceptação de SMS, códigos de uso único e códigos de autenticação multifator enviados por mensagem.",
            "**Bloqueio do dispositivo:** reconstrução de PINs e padrões de desbloqueio a partir das coordenadas de toque.",
            "**Controle remoto:** execução de comandos de sistema e comunicação por túnel persistente com o atacante.",
            "**Persistência:** restauração do aplicativo malicioso após a remoção convencional.",
            "**Fraude financeira:** acesso indevido a aplicativos financeiros e movimentação em contas bancárias.",
          ],
        },
      ],
    },
    {
      heading: "Mitigação",
      blocks: [
        {
          type: "list",
          items: [
            "Instalar aplicativos apenas do Google Play ou de outra loja oficial confiável, nunca por link, anúncio ou página de download.",
            "Remover aplicativos Android instalados por links, anúncios ou fontes não oficiais.",
            "Rejeitar pedidos de permissão de serviço de acessibilidade sem finalidade legítima e clara de acessibilidade.",
            "Manter as opções de desenvolvedor e o depurador sem fio desabilitados quando não houver necessidade real de desenvolvimento.",
            "Ativar o modo de proteção avançada (Advanced Protection Mode) em dispositivos compatíveis.",
            "Manter o Android e os aplicativos de segurança móvel atualizados.",
            "Trocar senhas bancárias a partir de outro dispositivo confiável, nunca do dispositivo suspeito.",
            "Contatar as instituições financeiras para revisar acessos e transações.",
          ],
        },
      ],
    },
    {
      heading: "Em caso de comprometimento",
      blocks: [
        {
          type: "list",
          items: [
            "Executar a restauração de fábrica do dispositivo antes de restaurar dados, trazendo de volta apenas o que for essencial e confiável.",
            "Não reutilizar backup do dispositivo feito após a infecção, pois ele pode conter o componente malicioso.",
            "Alterar as senhas das contas expostas a partir de outro dispositivo confiável.",
            "Revisar as contas bancárias e as transações recentes, com suporte da instituição financeira.",
            "Buscar suporte profissional quando o dispositivo for usado para acesso a sistemas corporativos.",
          ],
        },
      ],
    },
    {
      heading: "O que ainda não sabemos / limites deste artigo",
      blocks: [
        {
          type: "p",
          text: "Este artigo foi elaborado a partir do relatório divulgado pela Malwarebytes, da análise da Zimperium zLabs e da publicação consultada, com verificação em 21 de setembro de 2026. Não há telemetria própria da CyDef sobre esta campanha, nenhuma exploração observada internamente e nenhuma atribuição de autoria feita aqui.",
        },
        {
          type: "p",
          text: "Não há, até a data de verificação, estimativa pública consolidada de número de vítimas, nem lista pública completa de aplicativos financeiros sobrepostos pela campanha. Os indicadores divulgados são majoritariamente comportamentais (permissões, recursos abusados e componentes), e não valores fixos como hashes ou domínios, o que limita a detecção por listas prontas. Este texto será atualizado quando houver informação nova verificável.",
        },
      ],
    },
    {
      heading: "Próximos passos",
      blocks: [
        {
          type: "list",
          items: [
            "Revisar a política de dispositivos móveis quanto a permissões de acessibilidade e uso de opções de desenvolvedor.",
            "Verificar em MDM ou ferramenta de gestão quais aplicativos instalados fora de loja oficial permanecem ativos.",
            "Auditar dispositivos com depurador sem fio habilitado e remover a configuração onde não houver uso de desenvolvimento.",
            "Adicionar revisão periódica de permissões sensíveis nos dispositivos dos colaboradores que acessam sistemas financeiros.",
            "Reforçar a orientação sobre instalação de aplicativos e sobre links recebidos por SMS e anúncios.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Malwarebytes: New Android malware uses AI to steal bank logins and reconstruct your PIN",
      url: "https://www.malwarebytes.com/blog/news/2026/09/new-android-malware-uses-ai-to-steal-bank-logins-and-pins",
    },
    {
      label:
        "Cyber Security News: New Android Malware Uses AI to Steal Bank Logins and Reconstruct Your PIN",
      url: "https://cybersecuritynews.com/android-malware-uses-ai/",
    },
  ],
  changelog: [
    "2026-09-21: primeira versão, baseada no relatório da Malwarebytes e na análise da Zimperium zLabs divulgados em setembro de 2026.",
  ],
};
