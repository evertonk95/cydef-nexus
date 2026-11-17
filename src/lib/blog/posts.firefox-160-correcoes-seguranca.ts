import type { BlogPost } from "./posts";

/**
 * Mozilla corrige 99 falhas no Firefox 160 (PT).
 * Base: MFSA 2026-125 (Mozilla) e análise do Cyber Security News.
 * Capa: public/assets/blog/firefox-160-correcoes-seguranca-thumb.webp
 */
export const firefox160CorrecoesSegurancaPost: BlogPost = {
  slug: "firefox-160-correcoes-seguranca",
  title:
    "Mozilla corrige 99 falhas no Firefox 160, incluindo escapes de sandbox e elevação de privilégios",
  category: "Inteligência de Ameaças",
  excerpt:
    "A Mozilla publicou o Firefox 160 com correções para 99 vulnerabilidades, sendo 57 de impacto alto, entre escapes de sandbox, elevação de privilégios, bypass da política de mesma origem e erros de memória em componentes gráficos, de rede e de armazenamento.",
  date: "17 de Novembro, 2026",
  dateISO: "2026-11-17",
  readTime: "7 min",
  image: "/assets/blog/firefox-160-correcoes-seguranca-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "Mozilla Firefox",
    "Vulnerabilidades",
    "Sandbox Escape",
    "Elevação de Privilégios",
    "Atualização de Segurança",
    "Navegador",
    "Inteligência de Ameaças",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "Em 10 de novembro de 2026, a Mozilla publicou o Firefox 160 e o aviso de segurança MFSA 2026-125, que reúne correções para 99 vulnerabilidades classificadas com impacto geral alto. O pacote cobre escapes de sandbox, elevação de privilégios, bypass da política de mesma origem, divulgação de informações e erros de memória em componentes centrais do navegador, como gráficos, rede, armazenamento, áudio e vídeo, IPC e o motor JavaScript.",
        },
        {
          type: "p",
          text: "Segundo o levantamento publicado pelo Cyber Security News com base no aviso da Mozilla, a distribuição por severidade é de 57 falhas de impacto alto, 24 de impacto moderado e 18 de impacto baixo. A Mozilla não informou que essas vulnerabilidades estejam sendo exploradas em ataques ativos.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Avaliação CyDef",
            body: "Escape de sandbox e elevação de privilégios aparecem no mesmo aviso e no mesmo navegador. Cada um desses grupos só se torna grave quando encadeado com uma falha de execução no processo de conteúdo, mas é exatamente esse encadeamento que interessa a um atacante: primeiro comprometer o renderizador, depois romper o isolamento. O navegador segue sendo uma das maiores superfícies de ataque do endpoint, e uma janela de atualização de uma semana entre a publicação do aviso e a aplicação em toda a frota já é tempo suficiente para exploração oportunista.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipe CyDef. Aviso MFSA 2026-125 e reportagem do Cyber Security News consultados em 17 de Novembro de 2026.",
        },
      ],
    },
    {
      heading: "Resumo executivo",
      blocks: [
        {
          type: "p",
          text: "O que se sabe sobre a atualização, com base no aviso oficial da Mozilla e na análise do Cyber Security News:",
        },
        {
          type: "list",
          items: [
            "**Produto e versão corrigida:** Mozilla Firefox 160 para desktop e Firefox para Android, ambos na versão 160 ou superior.",
            "**Volume de correções:** 99 vulnerabilidades, das quais 57 de impacto alto, 24 de impacto moderado e 18 de impacto baixo.",
            "**Data de publicação:** 10 de novembro de 2026, no aviso MFSA 2026-125.",
            "**Tipos de falha:** escape de sandbox, elevação de privilégios, bypass da política de mesma origem, divulgação de informações, uso após liberação (use-after-free), ponteiros inválidos, condições de limite incorretas e falhas de isolamento entre sites.",
            "**Componentes mais citados:** Graphics (CanvasWebGL, Text, WebRender, WebGPU), DOM (Navigation, Core & HTML, Service Workers, Editor, Selection), Networking (HTTP, Cache, Cookies), Storage (Cache API, localStorage), Audio/Video, IPC, Layout e JavaScript.",
            "**Exploração ativa:** a Mozilla não relata exploração em ataques reais no aviso.",
            "**Derivados:** o aviso não apresenta correções equivalentes para Firefox ESR ou Thunderbird, que precisam ser verificados separadamente.",
          ],
        },
        {
          type: "table",
          table: {
            headers: ["Impacto", "Quantidade"],
            rows: [
              ["Alto", "57"],
              ["Moderado", "24"],
              ["Baixo", "18"],
              ["Total", "99"],
            ],
          },
        },
      ],
    },
    {
      heading: "Principais vulnerabilidades do aviso",
      blocks: [
        {
          type: "p",
          text: "O aviso descreve cada falha de forma individual, sem apresentar cadeia de exploração única. As entradas abaixo são as que aparecem destacadas nas duas fontes consultadas ou que quebram diretamente os limites de isolamento do navegador:",
        },
        {
          type: "list",
          items: [
            "**CVE-2026-124907 (Alta):** use-after-free em Graphics: CanvasWebGL, com elevação de privilégios e escape de sandbox entre os impactos possíveis. É a falha destacada como mais relevante na análise do Cyber Security News.",
            "**CVE-2026-124853 (Alta):** condições de limite incorretas em Graphics: Text, com escape de sandbox.",
            "**CVE-2026-124855 e CVE-2026-124905 (Alta):** escape de sandbox em DOM: Navigation. A primeira tem crédito ao pesquisador Tran Quac.",
            "**CVE-2026-124859 (Alta):** escape de sandbox por condições de limite incorretas em Storage: Cache API.",
            "**CVE-2026-124861 (Alta):** escape de sandbox por use-after-free em Audio/Video: cubeb.",
            "**CVE-2026-124864 e CVE-2026-124900 (Alta):** escape de sandbox por use-after-free em DOM: Service Workers.",
            "**CVE-2026-124903 (Alta):** escape de sandbox por use-after-free em IPC, o componente que faz a comunicação entre os processos do navegador.",
            "**CVE-2026-124874 (Alta):** bypass da política de mesma origem em Networking: HTTP, com crédito a Minseong Kim.",
            "**CVE-2026-124909:** divulgação de informações na navegação privada.",
            "**CVE-2026-124911:** clickjacking no preenchimento automático do Firefox para Android.",
            "**CVE-2026-124858 (Alta):** use-after-free em DOM: HTML Parser, com crédito a Amy Burnett, da OpenAI. A OpenAI Codex Security, identificada como kylebot, assina diversos outros achados em layout, armazenamento, coleta de lixo do JavaScript e gráficos.",
          ],
        },
        {
          type: "p",
          text: "Os créditos indicam quem reportou cada falha, mas não informam se a descoberta veio de revisão manual ou de ferramentas automatizadas. Também não há detalhamento público sobre exploração prática de cada CVE, o que é o comportamento padrão da Mozilla nesse tipo de aviso.",
        },
      ],
    },
    {
      heading: "Produtos e versões afetadas",
      blocks: [
        {
          type: "p",
          text: "O aviso indica o Firefox 160 como versão que contém as correções. Versões anteriores do navegador são, por consequência, as potencialmente afetadas. O comunicado não detalha o intervalo completo de versões impactadas nem lista quais falhas atingem apenas o Android.",
        },
        {
          type: "table",
          table: {
            headers: ["Plataforma", "Versão corrigida"],
            rows: [
              ["Firefox para Windows", "160 ou superior"],
              ["Firefox para macOS", "160 ou superior"],
              ["Firefox para Linux", "160 ou superior"],
              ["Firefox para Android", "160 ou superior, pela loja de aplicativos"],
            ],
          },
        },
        {
          type: "p",
          text: "Administradores que operam Firefox ESR ou Thunderbird devem consultar os avisos desses produtos em separado. O MFSA 2026-125 não confirma que as mesmas falhas foram corrigidas nessas versões.",
        },
      ],
    },
    {
      heading: "Recomendações de mitigação",
      blocks: [
        {
          type: "p",
          text: "A correção oficial existe e está disponível. A prioridade é aplicar a atualização e comprovar a versão instalada, não apenas disparar o pacote:",
        },
        {
          type: "list",
          items: [
            "**Atualizar para o Firefox 160 ou superior** em todas as estações de trabalho e servidores com interface gráfica.",
            "**Confirmar a versão instalada** pelo menu Ajuda, opção Sobre o Firefox, e reiniciar o navegador para concluir a aplicação.",
            "**Atualizar o Firefox para Android** pela loja de aplicativos e verificar a versão após a instalação.",
            "**Revisar o inventário de navegadores** e identificar endpoints com versões anteriores à 160, incluindo máquinas de acesso remoto e ambientes de teste.",
            "**Consultar separadamente os avisos de Firefox ESR e Thunderbird**, sem presumir que receberam as mesmas correções.",
            "**Automatizar a atualização** por política de grupo, MDM ou gerenciador de pacotes, com reinício programado, para reduzir a janela entre a publicação do aviso e a correção na frota.",
            "**Onde a atualização não puder ser aplicada de imediato**, restringir a navegação externa a sites necessários, manter o monitoramento de telemetria de endpoint e acompanhar os avisos da Mozilla.",
          ],
        },
      ],
    },
    {
      heading: "O que ainda não se sabe e limites do artigo",
      blocks: [
        {
          type: "p",
          text: "A Mozilla não afirma que as 99 vulnerabilidades estejam em exploração ativa, nem publica cadeia de ataque detalhada. Não há, nas fontes consultadas, indicação de que exista exploit público para o conjunto, o que não significa ausência de risco: falhas de use-after-free em componentes gráficos e de mídia costumam ser alvo de pesquisa ofensiva após a publicação do aviso.",
        },
        {
          type: "p",
          text: "Este artigo não cobre o conteúdo interno dos relatórios de bug, que permanecem restritos, e não substitui a leitura do MFSA 2026-125 por quem precisa avaliar exposição específica. A CyDef atualizará a análise caso a Mozilla publique novos dados sobre exploração ou correções para ESR e Thunderbird.",
        },
      ],
    },
  ],
  sources: [
    {
      label: "Mozilla: Security Vulnerabilities fixed in Firefox 160 (MFSA 2026-125)",
      url: "https://www.mozilla.org/en-US/security/advisories/mfsa2026-125/",
    },
    {
      label: "Cyber Security News: Mozilla Patches 160 Firefox Vulnerabilities, Including Sandbox Escape",
      url: "https://cybersecuritynews.com/mozilla-patches-160-firefox-vulnerabilities/",
    },
  ],
  changelog: [
    "2026-11-17: primeira versão publicada, baseada no aviso MFSA 2026-125 e na análise do Cyber Security News.",
  ],
};
