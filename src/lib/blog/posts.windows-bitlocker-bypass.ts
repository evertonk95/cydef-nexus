import type { BlogPost } from "./posts";

/**
 * Windows BitLocker: falhas permitem contornar a criptografia do disco
 * (CVE-2026-97015 e CVE-2026-119832, PT). Conteúdo elaborado a partir dos
 * registros CVE da Microsoft e da publicação do Cyber Security News,
 * verificados em 12 de novembro de 2026.
 * Capa: public/assets/blog/windows-bitlocker-bypass-thumb.webp
 */
export const windowsBitlockerBypassPost: BlogPost = {
  slug: "windows-bitlocker-bypass-cve-2026-97015",
  title:
    "BitLocker: duas falhas permitem contornar a criptografia do disco em dispositivos Windows",
  category: "Inteligência de Ameaças",
  excerpt:
    "A Microsoft divulgou em 10 de novembro de 2026 duas vulnerabilidades no Windows BitLocker, CVE-2026-97015 e CVE-2026-119832, que permitem contornar recursos de segurança por meio de ataque físico. A CVE-2026-119832 exige acesso físico e privilégios básicos para contornar a criptografia da unidade do sistema.",
  date: "12 de Novembro, 2026",
  dateISO: "2026-11-12",
  readTime: "8 min",
  image: "/assets/blog/windows-bitlocker-bypass-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "Windows",
    "BitLocker",
    "CVE-2026-97015",
    "CVE-2026-119832",
    "Criptografia",
    "Estouro de buffer",
    "Segurança de Endpoints",
    "Inteligência de Ameaças",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "Em 10 de novembro de 2026, a Microsoft divulgou duas vulnerabilidades no **Windows BitLocker**, identificadas como **CVE-2026-97015** e **CVE-2026-119832**. Ambas permitem contornar recursos de segurança do BitLocker por meio de um ataque físico ao equipamento, mas têm causas e requisitos de acesso diferentes.",
        },
        {
          type: "p",
          text: "A **CVE-2026-97015** é causada por um **estouro de buffer baseado em heap**, classificado como CWE-122. A **CVE-2026-119832** decorre de **controle de acesso inadequado**. No caso da CVE-2026-119832, a Microsoft confirma que um atacante com acesso físico e privilégios básicos pode contornar a criptografia da unidade de armazenamento do sistema e acessar dados criptografados.",
        },
        {
          type: "p",
          text: "A pontuação reflete a natureza física do vetor: a CVE-2026-97015 recebeu CVSS 6,8 e a CVE-2026-119832, CVSS 5,9, ambas classificadas como Important. Nenhuma das duas exige que a vítima clique em link, abra arquivo ou aprove um prompt.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Avaliação CyDef",
            body: "O BitLocker é a camada que protege os dados em repouso quando o equipamento é perdido, furtado ou acessado fisicamente sem o usuário. Falhas que permitem contornar essa camada por ataque físico atingem justamente o cenário que a criptografia de disco existe para cobrir. O risco prático depende de um dado que a telemetria de rede não enxerga: quem tem acesso físico ao equipamento. A resposta correta combina atualização com controle de acesso físico, e a prioridade deve recair sobre dispositivos que guardam dados sensíveis e que podem ser fisicamente acessados por terceiros.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipe CyDef. Registros CVE da Microsoft e publicação do Cyber Security News verificados em 12 de novembro de 2026.",
        },
      ],
    },
    {
      heading: "Resumo executivo",
      blocks: [
        {
          type: "p",
          text: "O que se sabe até 12 de novembro de 2026, com base nos registros CVE da Microsoft e na publicação analisada:",
        },
        {
          type: "list",
          items: [
            "**Divulgação:** 10 de novembro de 2026, no ciclo mensal de atualizações.",
            "**Falhas:** CVE-2026-97015 (estouro de buffer baseado em heap, CWE-122) e CVE-2026-119832 (controle de acesso inadequado).",
            "**Classificação:** ambas Important; CVSS 6,8 e 5,9, respectivamente.",
            "**Vetor:** ataque físico ao dispositivo; sem interação do usuário.",
            "**Privilégios:** CVE-2026-97015 não exige privilégios; CVE-2026-119832 exige privilégios básicos.",
            "**Resultado na CVE-2026-119832:** contorno da criptografia da unidade do sistema e acesso a dados criptografados.",
            "**Exploração conhecida:** a Microsoft informou que a CVE-2026-97015 não era conhecida publicamente nem explorada na data de publicação.",
            "**Alvo:** nenhum setor ou tipo de organização especificado como mais afetado.",
          ],
        },
      ],
    },
    {
      heading: "Produtos e versões afetadas",
      blocks: [
        {
          type: "p",
          text: "A lista de produtos afetados não é idêntica entre as duas CVE. A CVE-2026-97015 tem alcance maior, incluindo ramos antigos do Windows Server; a CVE-2026-119832 cobre um conjunto mais restrito. A tabela abaixo separa as duas.",
        },
        {
          type: "table",
          table: {
            headers: ["Produto / versão", "CVE-2026-97015", "CVE-2026-119832"],
            rows: [
              ["Windows 10 1607", "Afetado", "Não afetado"],
              ["Windows 10 1809", "Afetado", "Afetado"],
              ["Windows 10 21H2", "Afetado", "Afetado"],
              ["Windows 10 22H2", "Afetado", "Afetado"],
              ["Windows 11 23H2", "Afetado", "Afetado"],
              ["Windows 11 24H2", "Afetado", "Afetado"],
              ["Windows 11 25H2", "Afetado", "Afetado"],
              ["Windows 11 26H1", "Afetado", "Afetado"],
              ["Windows 11 26H2", "Afetado", "Afetado"],
              ["Windows Server 2012", "Afetado", "Não afetado"],
              ["Windows Server 2012 R2", "Afetado", "Não afetado"],
              ["Windows Server 2016", "Afetado", "Não afetado"],
              ["Windows Server 2019", "Afetado", "Afetado"],
              ["Windows Server 2022", "Afetado", "Afetado"],
              ["Windows Server 2025", "Afetado", "Afetado"],
            ],
          },
        },
        {
          type: "p",
          text: "A diferença de alcance é um ponto prático: um inventário que trate as duas falhas como uma lista única pode concluir que um Windows Server 2012 ou um Windows 10 1607 está protegido contra a CVE-2026-119832 quando, na verdade, ainda está exposto à CVE-2026-97015. Cada CVE deve ser verificada no próprio registro oficial.",
        },
      ],
    },
    {
      heading: "Builds corrigidas por CVE",
      blocks: [
        {
          type: "p",
          text: "A Microsoft disponibilizou atualizações de segurança com builds corrigidas específicas por produto e por falha. A tabela abaixo resume as builds mínimas corrigidas indicadas nos registros.",
        },
        {
          type: "table",
          table: {
            headers: ["Produto / versão", "CVE-2026-97015", "CVE-2026-119832"],
            rows: [
              ["Windows 10 1607", "10.0.14393.9612", "Não afetado"],
              ["Windows 10 1809", "10.0.17763.9376", "10.0.17763.9487"],
              ["Windows 10 21H2", "10.0.19044.7807", "10.0.19044.7846"],
              ["Windows 10 22H2", "10.0.19045.7807", "10.0.19045.7846"],
              ["Windows 11 23H2", "10.0.22631.7652", "10.0.22631.7711"],
              ["Windows 11 24H2", "10.0.26100.9711", "10.0.26100.9974"],
              ["Windows 11 25H2", "10.0.26200.9711", "10.0.26200.9974"],
              ["Windows 11 26H1", "10.0.28000.3231", "10.0.28000.3501"],
              ["Windows 11 26H2", "10.0.26300.9711", "10.0.26300.9974"],
              ["Windows Server 2012", "6.2.9200.26434", "Não afetado"],
              ["Windows Server 2012 R2", "6.3.9600.23470", "Não afetado"],
              ["Windows Server 2016", "10.0.14393.9612", "Não afetado"],
              ["Windows Server 2019", "10.0.17763.9376", "10.0.17763.9487"],
              ["Windows Server 2022", "10.0.20348.5761", "10.0.20348.5870"],
              ["Windows Server 2025", "10.0.26100.33650", "10.0.26100.33822"],
            ],
          },
        },
        {
          type: "p",
          text: "Aplicar uma atualização de novembro de 2026 não significa, por si só, estar protegido contra as duas falhas: as builds corrigidas diferem entre a CVE-2026-97015 e a CVE-2026-119832. A verificação deve confirmar a build em execução, não apenas a mensagem de sucesso do painel.",
        },
      ],
    },
    {
      heading: "Como o ataque funciona",
      blocks: [
        {
          type: "p",
          text: "As duas falhas compartilham o mesmo vetor de entrada: acesso físico ao equipamento. É o que distingue este caso de uma exploração remota. Não há link para clicar, arquivo para abrir ou prompt para aprovar.",
        },
        {
          type: "list",
          items: [
            "**CVE-2026-97015:** estouro de buffer baseado em heap (CWE-122) permite contornar um recurso de segurança por ataque físico. Não exige privilégios prévios.",
            "**CVE-2026-119832:** controle de acesso inadequado permite contornar a criptografia da unidade do sistema e acessar dados criptografados. Exige privilégios básicos.",
          ],
        },
        {
          type: "p",
          text: "A consequência é o que torna o caso relevante: em um dispositivo com BitLocker, a criptografia de disco é justamente o mecanismo que protege os dados caso o equipamento caia em mãos erradas. Contornar essa camada devolve ao atacante o acesso ao conteúdo que a criptografia deveria tornar inacessível.",
        },
      ],
    },
    {
      heading: "Impacto potencial",
      blocks: [
        {
          type: "list",
          items: [
            "**Confidencialidade:** possível acesso a dados criptografados na unidade do sistema, no caso da CVE-2026-119832.",
            "**Integridade:** o vetor da CVE-2026-97015 indica impacto potencial sobre integridade e confidencialidade dos dados protegidos.",
            "**Exposição local:** o risco concentra-se em dispositivos que possam ser fisicamente acessados por terceiros.",
            "**Sem vetor remoto:** a publicação não descreve exploração remota; o acesso físico é pré-requisito.",
          ],
        },
      ],
    },
    {
      heading: "Recomendações de mitigação",
      blocks: [
        {
          type: "list",
          items: [
            "**Inventariar** os dispositivos Windows com BitLocker e determinar versão e build de cada um.",
            "**Verificar** a aplicabilidade de cada CVE separadamente nos registros oficiais da Microsoft.",
            "**Aplicar** as atualizações de segurança correspondentes, confirmando que cada equipamento atingiu a build corrigida.",
            "**Priorizar** os dispositivos que armazenam dados sensíveis.",
            "**Restringir** o acesso físico aos equipamentos afetados e revisar os controles de acesso físico.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Quando a atualização não puder ser aplicada de imediato",
            body: "Restringir o acesso físico aos dispositivos afetados e mantê-los em locais controlados até a aplicação das atualizações. Para um vetor que depende de acesso físico, a contenção física é a mitigação que fecha o caminho enquanto o patch não é aplicado.",
          },
        },
      ],
    },
    {
      heading: "O que ainda não sabemos / limites deste artigo",
      blocks: [
        {
          type: "p",
          text: "Este artigo foi elaborado a partir dos registros CVE da Microsoft e da publicação do Cyber Security News, com verificação em 12 de novembro de 2026. Não há telemetria própria da CyDef sobre estas vulnerabilidades e nenhuma exploração observada internamente.",
        },
        {
          type: "p",
          text: "A Microsoft informou que a CVE-2026-97015 não era conhecida publicamente nem havia evidências de exploração na data de publicação. Não há, até a data de verificação, informação pública sobre exploração ativa de nenhuma das duas falhas, nem atribuição de autoria. Este texto será atualizado quando houver informação nova verificável.",
        },
      ],
    },
    {
      heading: "Próximos passos",
      blocks: [
        {
          type: "list",
          items: [
            "Levantar os dispositivos Windows com BitLocker do ambiente, com versão e build.",
            "Conferir a aplicabilidade de cada CVE nos registros oficiais da Microsoft.",
            "Aplicar as atualizações de novembro de 2026, priorizando dispositivos com dados sensíveis.",
            "Revisar os controles de acesso físico e confirmar que os equipamentos atingiram as builds corrigidas.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Microsoft Security Response Center: CVE-2026-97015",
      url: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-97015",
    },
    {
      label:
        "Microsoft Security Response Center: CVE-2026-119832",
      url: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-119832",
    },
    {
      label:
        "CVE Program: CVE-2026-97015",
      url: "https://www.cve.org/CVERecord?id=CVE-2026-97015",
    },
    {
      label:
        "CVE Program: CVE-2026-119832",
      url: "https://www.cve.org/CVERecord?id=CVE-2026-119832",
    },
    {
      label:
        "Cyber Security News: Windows BitLocker Vulnerabilities Allow Attackers to Bypass Security Feature",
      url: "https://cybersecuritynews.com/windows-bitlocker-security-bypass/",
    },
  ],
  changelog: [
    "2026-11-12: primeira versão, baseada nos registros CVE da Microsoft e na publicação do Cyber Security News, verificados nesta data.",
  ],
};
