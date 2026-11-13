import type { BlogPost } from "./posts";

/**
 * Apache HTTP Server: vulnerabilidade crítica no mod_http2 permite execução
 * remota de código (CVE-2026-119618, PT). Conteúdo elaborado a partir do aviso
 * oficial do Apache (vulnerabilities_24.html), do registro CVE e da publicação
 * do Cyber Security News, verificados em 13 de novembro de 2026.
 * Capa: public/assets/blog/apache-http-server-2-4-71-mod-http2-rce-thumb.webp
 */
export const apacheHttp2RcePost: BlogPost = {
  slug: "apache-http-server-mod-http2-rce-cve-2026-119618",
  title:
    "Apache corrige vulnerabilidade crítica no mod_http2 que permite execução remota de código",
  category: "Inteligência de Ameaças",
  excerpt:
    "O Apache lançou em 11 de novembro de 2026 a versão 2.4.71 do HTTP Server, corrigindo a CVE-2026-119618, uma falha crítica no módulo mod_http2 que pode permitir execução remota de código por corrupção de heap na função assign_headers().",
  date: "13 de Novembro, 2026",
  dateISO: "2026-11-13",
  readTime: "8 min",
  image: "/assets/blog/apache-http-server-2-4-71-mod-http2-rce-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "Apache",
    "HTTP Server",
    "mod_http2",
    "CVE-2026-119618",
    "Execução remota de código",
    "Corrupção de heap",
    "HTTP/2",
    "Inteligência de Ameaças",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "Em 11 de novembro de 2026, o projeto Apache lançou a versão **2.4.71** do HTTP Server, corrigindo uma vulnerabilidade crítica no módulo **mod_http2**, identificada como **CVE-2026-119618**. A falha pode permitir que um atacante remoto execute código no servidor.",
        },
        {
          type: "p",
          text: "O problema está na função **assign_headers()** e envolve corrupção de heap causada pelo uso concorrente de recursos compartilhados sem sincronização adequada (CWE-362). Na prática, duas partes do código podem acessar a mesma área de memória ao mesmo tempo, o que corrompe o heap e abre caminho para execução remota de código.",
        },
        {
          type: "p",
          text: "O Apache classifica a falha como crítica em sua própria escala de impacto, reservada a bugs que um atacante remoto pode usar para executar código no servidor. A análise do CISA ADP atribuiu CVSS 3.1 de **8,1** (High), com complexidade de ataque alta e nenhuma interação do usuário.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Avaliação CyDef",
            body: "O HTTP/2 é habilitado por padrão em instalações modernas do Apache, e a falha vive justamente nesse módulo. Isso transforma servidores web públicos em alvo natural, sem depender de configuração exótica. O ponto que decide a urgência real é simples: o servidor está exposto a tráfego HTTP/2 vindo da internet? Se estiver, a atualização é prioridade imediata. O Apache não listou um workaround, então a mitigação alternativa, limitar o servidor a HTTP/1.1, precisa ser testada antes de ir a produção.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipe CyDef. Aviso oficial do Apache, registro CVE e publicação do Cyber Security News verificados em 13 de novembro de 2026.",
        },
      ],
    },
    {
      heading: "Resumo executivo",
      blocks: [
        {
          type: "p",
          text: "O que se sabe até 13 de novembro de 2026, com base no aviso oficial do Apache, no registro CVE e na publicação analisada:",
        },
        {
          type: "list",
          items: [
            "**CVE:** CVE-2026-119618, no módulo mod_http2.",
            "**Tipo:** corrupção de heap e execução remota de código na função assign_headers(), por uso concorrente de recurso compartilhado sem sincronização (CWE-362).",
            "**Classificação:** crítica na escala do Apache; CVSS 3.1 de 8,1 (High) na análise do CISA ADP.",
            "**Produtos afetados:** Apache HTTP Server 2.4.55 a 2.4.70; mod_h2 distribuído separadamente pelo GitHub, 2.0.8 a 2.0.42.",
            "**Correção:** Apache HTTP Server 2.4.71 (11/11/2026).",
            "**Vetor:** remoto, sem interação do usuário; complexidade de ataque alta.",
            "**Exploração conhecida:** o CISA ADP registra exploração como nenhuma e não automatizável na data de verificação.",
            "**Alvo:** nenhum setor específico identificado; o foco são servidores com HTTP/2 habilitado.",
          ],
        },
      ],
    },
    {
      heading: "Produtos e versões afetadas",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Produto", "Versões afetadas", "Correção"],
            rows: [
              ["Apache HTTP Server", "2.4.55 a 2.4.70", "2.4.71 ou superior"],
              ["mod_h2 (GitHub)", "2.0.8 a 2.0.42", "Versão corrigida correspondente"],
            ],
          },
        },
        {
          type: "p",
          text: "Há dois públicos distintos a considerar: quem usa o Apache HTTP Server com o mod_http2 embutido, e quem usa o mod_h2 distribuído separadamente pelo GitHub. Cada um tem sua própria tabela de versões afetadas e de correção.",
        },
      ],
    },
    {
      heading: "Como a falha funciona",
      blocks: [
        {
          type: "p",
          text: "A causa raiz é um problema de concorrência, e não uma falha de lógica simples: duas partes do código podem tocar a mesma área de memória ao mesmo tempo. O Apache descreve isso como uso concorrente de recurso compartilhado com sincronização inadequada (CWE-362), na função assign_headers() do mod_http2.",
        },
        {
          type: "list",
          items: [
            "**Gatilho:** processamento de requisições HTTP/2 no módulo mod_http2.",
            "**Efeito:** corrupção de heap, que pode escalar para execução remota de código.",
            "**Requisito:** servidor servindo tráfego HTTP/2.",
            "**Interação do usuário:** nenhuma.",
          ],
        },
        {
          type: "p",
          text: "O registro CVE marca a complexidade de ataque como alta, o que significa que a exploração não é trivial ou automática. Mas a classificação crítica do Apache reflete o pior caso possível: execução de código em um servidor web exposto.",
        },
      ],
    },
    {
      heading: "Impacto potencial",
      blocks: [
        {
          type: "list",
          items: [
            "**Execução remota de código** no servidor web, no pior caso.",
            "**Corrupção de heap** durante o processamento de requisições HTTP/2.",
            "**Comprometimento de servidores públicos** com HTTP/2 habilitado, que ficam expostos a tráfego remoto.",
            "**Sem interação do usuário:** o ataque não depende de clique, abertura de arquivo ou aprovação.",
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
            "**Atualizar** o Apache HTTP Server para a versão 2.4.71 ou superior.",
            "**Priorizar** servidores expostos publicamente com HTTP/2 habilitado.",
            "**Identificar** os servidores e contêineres que usam as versões afetadas.",
            "**Verificar** os avisos e registros de atualização do fornecedor da distribuição Linux.",
            "**Confirmar** a instalação da atualização em cada servidor e contêiner afetado.",
            "**Monitorar** logs em busca de encerramentos inesperados ou reinicializações de processos de trabalho.",
            "**Testar** as alterações em ambiente controlado antes de aplicar em produção.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Quando a atualização não puder ser aplicada de imediato",
            body: "Considerar limitar o servidor a HTTP/1.1 até a aplicação da atualização, testando antes o impacto em desempenho e clientes. Monitorar logs em busca de encerramentos ou reinicializações incomuns de processos, que podem indicar sondagem do servidor.",
          },
        },
      ],
    },
    {
      heading: "O que ainda não sabemos / limites deste artigo",
      blocks: [
        {
          type: "p",
          text: "Este artigo foi elaborado a partir do aviso oficial do Apache, do registro CVE e da publicação do Cyber Security News, com verificação em 13 de novembro de 2026. Não há telemetria própria da CyDef sobre esta vulnerabilidade e nenhuma exploração observada internamente.",
        },
        {
          type: "p",
          text: "O CISA ADP registra a exploração como nenhuma e o ataque como não automatizável na data de verificação. A complexidade de ataque é alta, o que afasta a ideia de exploração em massa trivial, mas não reduz a urgência para servidores expostos. Este texto será atualizado quando houver informação nova verificável.",
        },
      ],
    },
    {
      heading: "Próximos passos",
      blocks: [
        {
          type: "list",
          items: [
            "Levantar os servidores Apache do ambiente, com versão e uso do módulo mod_http2.",
            "Confirmar se há tráfego HTTP/2 exposto publicamente.",
            "Aplicar a versão 2.4.71 ou superior, priorizando servidores públicos.",
            "Verificar avisos do fornecedor da distribuição Linux e confirmar a build em execução.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Apache HTTP Server Project: Apache HTTP Server 2.4 vulnerabilities (2.4.71)",
      url: "https://httpd.apache.org/security/vulnerabilities_24.html",
    },
    {
      label: "CVE Program: CVE-2026-119618",
      url: "https://www.cve.org/CVERecord?id=CVE-2026-119618",
    },
    {
      label:
        "Cyber Security News: Apache Patches Critical HTTP/2 Flaw Allowing Remote Code Execution on Web Servers",
      url: "https://cybersecuritynews.com/apache-patches-critical-http-2-flaw/",
    },
  ],
  changelog: [
    "2026-11-13: primeira versão, baseada no aviso oficial do Apache, no registro CVE e na publicação do Cyber Security News, verificados nesta data.",
  ],
};
