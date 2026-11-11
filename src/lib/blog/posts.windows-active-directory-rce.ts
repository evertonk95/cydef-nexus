import type { BlogPost } from "./posts";

/**
 * Windows Active Directory: estouro de buffer baseado em pilha permite execução
 * remota de código (CVE-2026-119948, PT). Conteúdo elaborado a partir do guia de
 * atualização do MSRC e da publicação do Cyber Security News, verificados em
 * 11 de novembro de 2026. Capa: public/assets/blog/windows-active-directory-rce-thumb.webp
 */
export const windowsActiveDirectoryRcePost: BlogPost = {
  slug: "windows-active-directory-rce-cve-2026-119948",
  title:
    "Windows Active Directory: estouro de buffer permite execução remota de código por atacante autenticado",
  category: "Inteligência de Ameaças",
  excerpt:
    "A Microsoft corrigiu em 10 de novembro de 2026 uma falha de estouro de buffer baseado em pilha no Windows Active Directory (CVE-2026-119948) que pode permitir que um atacante autenticado execute código pela rede. A exploração exige privilégios baixos, não requer interação do usuário e tem complexidade alta.",
  date: "11 de Novembro, 2026",
  dateISO: "2026-11-11",
  readTime: "8 min",
  image: "/assets/blog/windows-active-directory-rce-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "Windows",
    "Active Directory",
    "CVE-2026-119948",
    "Estouro de buffer",
    "Execução remota de código",
    "Patch Tuesday",
    "Microsoft",
    "Inteligência de Ameaças",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "A Microsoft divulgou em 10 de novembro de 2026, no ciclo mensal de atualizações (Patch Tuesday), uma vulnerabilidade no **Windows Active Directory** que pode permitir que um atacante autenticado execute código pela rede. A falha recebeu a identificação **CVE-2026-119948** e classificação **Important**, com pontuação base **CVSS 3.1 de 7,5**.",
        },
        {
          type: "p",
          text: "A causa identificada é um **estouro de buffer baseado em pilha**: um programa grava mais dados na memória da pilha do que o espaço reservado para eles, o que pode sobrescrever dados adjacentes e, sob condições específicas, alterar o fluxo de execução do programa. A Microsoft confirma que o resultado pode incluir a capacidade de executar código remoto.",
        },
        {
          type: "p",
          text: "A avaliação do CVSS indica privilégios baixos, nenhuma interação do usuário e complexidade de ataque alta. Isso significa que a falha não é descrita como um ataque não autenticado que funciona contra qualquer sistema Windows acessível pela rede, e que condições específicas precisam existir para que a exploração seja bem-sucedida.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Avaliação CyDef",
            body: "O que exige atenção aqui não é o rótulo de gravidade isolado, e sim a combinação de três fatores: a falha vive no Active Directory, um componente central de autenticação e autorização em ambientes corporativos; a exploração exige apenas privilégios baixos, o que já coloca o atacante dentro da rede; e a complexidade alta significa que o risco real depende de configuração e contexto. A resposta correta é tratar como prioridade de atualização em controladores de domínio e em sistemas Windows afetados, sem assumir que acesso à rede e credencial válida garantem a exploração.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipe CyDef. Guia de atualização do MSRC e publicação do Cyber Security News verificados em 11 de novembro de 2026.",
        },
      ],
    },
    {
      heading: "Resumo executivo",
      blocks: [
        {
          type: "p",
          text: "O que se sabe até 11 de novembro de 2026, com base no guia de atualização do Microsoft Security Response Center (MSRC) e na publicação analisada:",
        },
        {
          type: "list",
          items: [
            "**CVE:** CVE-2026-119948, no Windows Active Directory.",
            "**Tipo de falha:** estouro de buffer baseado em pilha.",
            "**Classificação:** Important, com pontuação base CVSS 3.1 de 7,5.",
            "**Pré-requisitos:** privilégios baixos, sem interação do usuário e complexidade de ataque alta.",
            "**Resultado possível:** execução remota de código por um atacante autenticado, pela rede.",
            "**Impacto:** alto potencial sobre confidencialidade, integridade e disponibilidade.",
            "**Divulgação:** 10 de novembro de 2026, no Patch Tuesday de novembro.",
            "**Exploração conhecida:** nenhuma, e sem divulgação pública anterior no momento da publicação.",
            "**Reportada por:** pesquisador anônimo.",
            "**Avaliação da Microsoft:** exploração classificada como menos provável e maturidade do código de exploração como não comprovada.",
          ],
        },
      ],
    },
    {
      heading: "Produtos e versões afetadas",
      blocks: [
        {
          type: "p",
          text: "A cobertura varia por versão e por arquitetura. Os produtos e instalações listados no guia de atualização:",
        },
        {
          type: "table",
          table: {
            headers: ["Produto", "Instalação / arquitetura"],
            rows: [
              ["Windows Server 2025", "Standard e Server Core"],
              ["Windows Server 2022", "Standard e Server Core"],
              ["Windows Server 2019", "Standard e Server Core"],
              ["Windows Server 2016", "Standard e Server Core"],
              ["Windows 11, versão 26H2", "x64 e ARM64"],
              ["Windows 11, versão 26H1", "x64 e ARM64"],
              ["Windows 11, versão 25H2", "x64 e ARM64"],
              ["Windows 11, versão 24H2", "x64 e ARM64"],
              ["Windows 11, versão 23H2", "x64 e ARM64"],
              ["Windows 10, versão 22H2", "32 bits, x64 e ARM64"],
              ["Windows 10, versão 21H2", "32 bits, x64 e ARM64"],
              ["Windows 10, versão 1809", "32 bits e x64"],
              ["Windows 10, versão 1607", "32 bits e x64"],
            ],
          },
        },
        {
          type: "p",
          text: "A lista cobre sistemas desktop e servidores, incluindo instalações Server Core, que concentram o papel de controlador de domínio em muitas organizações. É essa amplitude que torna a atualização um esforço de inventário antes de ser um clique.",
        },
      ],
    },
    {
      heading: "Atualizações oficiais e builds corrigidas",
      blocks: [
        {
          type: "p",
          text: "A Microsoft disponibilizou o pacote correspondente a cada produto e versão. Aplicar o KB certo, na build corrigida, é o que encerra a exposição.",
        },
        {
          type: "table",
          table: {
            headers: ["Produto / versão", "KB", "Build(es) corrigida(s)"],
            rows: [
              ["Windows Server 2025", "KB5131080 / KB5131077", "10.0.26100.33822 / 10.0.26100.33730"],
              ["Windows Server 2022", "KB5131090", "10.0.20348.5870"],
              ["Windows Server 2019", "KB5131085", "10.0.17763.9487"],
              ["Windows Server 2016", "KB5131291", "10.0.14393.9688"],
              ["Windows 11, versão 26H2", "KB5132061 / KB5132043", "10.0.26300.9974 / 10.0.26300.9911"],
              ["Windows 11, versão 26H1", "KB5132059", "10.0.28000.3501"],
              ["Windows 11, versão 25H2", "KB5132061 / KB5132043", "10.0.26200.9974 / 10.0.26200.9911"],
              ["Windows 11, versão 24H2", "KB5132061 / KB5132043", "10.0.26100.9974 / 10.0.26100.9911"],
              ["Windows 11, versão 23H2", "KB5131087", "10.0.22631.7711"],
              ["Windows 10, versão 22H2", "KB5131096", "10.0.19045.7846"],
              ["Windows 10, versão 21H2", "KB5131096", "10.0.19044.7846"],
              ["Windows 10, versão 1809", "KB5131085", "10.0.17763.9487"],
              ["Windows 10, versão 1607", "KB5131291", "10.0.14393.9688"],
            ],
          },
        },
        {
          type: "p",
          text: "Um ponto operacional relevante: cada sistema precisa do pacote correspondente à própria versão e arquitetura. Não existe um único pacote que cubra todos os releases, então aplicar uma atualização genérica em todos os sistemas não substitui a verificação por release.",
        },
      ],
    },
    {
      heading: "O que a exploração exige e o que não está estabelecido",
      blocks: [
        {
          type: "p",
          text: "O registro da CVE delimita com precisão o que se pode afirmar e o que permanece em aberto. Vale separar os dois.",
        },
        {
          type: "list",
          items: [
            "**Não é um ataque não autenticado:** a exploração requer privilégios baixos, o que pressupõe um atacante já autenticado no ambiente.",
            "**Não garante SYSTEM ou controle de domínio:** o registro não estabelece que a exploração conceda privilégios SYSTEM ou controle de todo o domínio.",
            "**Método de solicitação não divulgado:** a função afetada, a solicitação de rede exata e um método de ataque funcional não foram detalhados no aviso.",
            "**Complexidade alta:** condições específicas, como configurações ou ajustes de protocolo, precisam existir para que a exploração ocorra.",
            "**Nenhuma organização alvo específica:** a publicação não identifica um tipo de organização como especialmente afetado.",
          ],
        },
        {
          type: "p",
          text: "Essa delimitação importa porque evita dois erros opostos: minimizar a falha por não haver exploração conhecida e, ao mesmo tempo, tratá-la como equivalente a uma falha de acesso não autenticado ou de escalonamento a SYSTEM.",
        },
      ],
    },
    {
      heading: "Recomendações de mitigação",
      blocks: [
        {
          type: "list",
          items: [
            "**Inventariar** os sistemas Windows nas versões afetadas, incluindo instalações Server Core e controladores de domínio.",
            "**Aplicar** a atualização oficial correspondente a cada versão e arquitetura.",
            "**Confirmar** a instalação e verificar que cada sistema atingiu a build corrigida, não apenas a mensagem de sucesso do painel.",
            "**Restringir** o acesso de rede aos sistemas afetados às conexões necessárias enquanto a atualização não puder ser aplicada.",
            "**Monitorar** os registros de segurança em busca de atividades suspeitas relacionadas aos sistemas afetados.",
            "**Revisar** as configurações de protocolo e de rede dos sistemas afetados.",
            "**Manter** inventário atualizado de versões, arquiteturas e atualizações instaladas.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Atualização imediata ou contenção de rede",
            body: "Quando a atualização não puder ser aplicada de imediato, o controle passa a ser a contenção de rede: restringir o acesso aos sistemas vulneráveis permitindo apenas as conexões necessárias, e acompanhar os comunicados oficiais da Microsoft enquanto monitora os sistemas afetados.",
          },
        },
      ],
    },
    {
      heading: "O que ainda não sabemos / limites deste artigo",
      blocks: [
        {
          type: "p",
          text: "Este artigo foi elaborado a partir do guia de atualização do MSRC e da publicação do Cyber Security News, com verificação em 11 de novembro de 2026. Não há telemetria própria da CyDef sobre esta vulnerabilidade e nenhuma exploração observada internamente.",
        },
        {
          type: "p",
          text: "Permanecem em aberto a função afetada, a solicitação de rede exata e um método de ataque funcional, que a Microsoft não detalhou no aviso. Como a Microsoft classificou a exploração como menos provável e a maturidade do código de exploração como não comprovada, o quadro pode mudar caso surja prova de conceito pública. Este texto será atualizado quando houver informação nova verificável.",
        },
      ],
    },
    {
      heading: "Próximos passos",
      blocks: [
        {
          type: "list",
          items: [
            "Levantar os sistemas Windows afetados no ambiente, com versão, arquitetura e papel (servidor, Server Core, controlador de domínio).",
            "Planejar a aplicação das atualizações de novembro de 2026 pelos KBs listados acima, priorizando controladores de domínio e sistemas expostos.",
            "Confirmar, após a aplicação, que cada sistema atingiu a build corrigida.",
            "Enquanto a atualização não estiver aplicada, restringir o acesso de rede ao mínimo necessário.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Microsoft Security Response Center: CVE-2026-119948",
      url: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-119948",
    },
    {
      label:
        "Cyber Security News: Windows Active Directory RCE Vulnerability Allows Attacker to Execute Code Over a Network",
      url: "https://cybersecuritynews.com/windows-active-directory-rce-vulnerability/",
    },
    {
      label: "CVE Program: CVE-2026-119948",
      url: "https://www.cve.org/CVERecord?id=CVE-2026-119948",
    },
  ],
  changelog: [
    "2026-11-11: primeira versão, baseada no guia de atualização do MSRC e na publicação do Cyber Security News, verificados nesta data.",
  ],
};
