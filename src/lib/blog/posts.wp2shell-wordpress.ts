import type { BlogPost } from "./posts";

/**
 * WP2Shell: cadeia que combina CVE-2026-63030 e CVE-2026-60137 no WordPress Core (PT).
 * Conteúdo elaborado com base na análise da Seqrite e na publicação do Cyber Security News.
 * Capa: public/assets/blog/wp2shell-wordpress-thumb.webp
 */
export const wp2shellWordpressPost: BlogPost = {
  slug: "wp2shell-wordpress-admin-web-shell",
  title:
    "WP2Shell encadeia duas falhas do WordPress para criar administradores e instalar web shell sem login",
  category: "Inteligência de Ameaças",
  excerpt:
    "A cadeia WP2Shell combina a confusão de rotas da API REST em lote (CVE-2026-63030) com uma injeção SQL no parâmetro author_exclude (CVE-2026-60137) para chegar à execução de código em instalações WordPress sem autenticação.",
  date: "21 de Outubro, 2026",
  dateISO: "2026-10-21",
  readTime: "7 min",
  image: "/assets/blog/wp2shell-wordpress-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "WordPress",
    "WP2Shell",
    "Vulnerabilidades",
    "API REST",
    "Injeção SQL",
    "Web Shell",
    "Inteligência de Ameaças",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "A Seqrite documentou em 16 de outubro de 2026 uma cadeia de exploração contra o WordPress Core que recebeu o nome WP2Shell. Ela combina duas falhas, CVE-2026-63030 e CVE-2026-60137, para sair de uma requisição não autenticada à API REST e chegar à execução de código no servidor, passando pela criação de uma conta administrativa e pela instalação de um plugin que funciona como web shell.",
        },
        {
          type: "p",
          text: "O encadeamento é o ponto central: nenhuma das duas falhas, isolada, entrega uma web shell. A primeira abre caminho para uma funcionalidade que deveria exigir autenticação, e a segunda fornece a fraqueza de banco de dados explorada nesse caminho. A análise não estabelece exploração ativa em larga escala, o que muda a prioridade da resposta mas não a dispensa.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Avaliação CyDef",
            body: "WordPress é a base de uma parcela grande dos sites publicados na internet, e o que torna o WP2Shell relevante não é a severidade de cada CVE isolada, e sim a ausência de credencial no início da cadeia. A pergunta prática para quem administra sites não é apenas se a versão está atualizada, mas também se existe evidência de que a cadeia já foi executada: conta administrativa desconhecida, arquivo ZIP em uploads, diretório wp2shell_ em plugins. Atualizar sem essa verificação resolve a exposição futura e deixa aberta a possibilidade de um acesso criado antes do patch.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipe CyDef. Análise da Seqrite e publicação do Cyber Security News consultadas em 21 de Outubro de 2026.",
        },
      ],
    },
    {
      heading: "Resumo executivo",
      blocks: [
        {
          type: "p",
          text: "O que se sabe sobre o WP2Shell, com base na análise técnica da Seqrite e na publicação do Cyber Security News:",
        },
        {
          type: "list",
          items: [
            "**Nome:** WP2Shell, cadeia de exploração contra o WordPress Core documentada pela Seqrite em 16 de outubro de 2026.",
            "**Falhas encadeadas:** CVE-2026-63030, confusão de rotas no controlador de requisições em lote da API REST, e CVE-2026-60137, injeção SQL no endpoint de posts.",
            "**Ponto de entrada:** requisição ao endpoint /wp-json/batch/v1, sem autenticação.",
            "**Resultado demonstrado:** criação de conta administrativa, execução remota de código e instalação de plugin usado como web shell.",
            "**Versões vulneráveis à cadeia completa:** WordPress 6.9.0 a 6.9.4 e 7.0.0 a 7.0.1.",
            "**Versões corrigidas:** 6.8.6, 6.9.5 e 7.0.2, ou versão suportada posterior.",
            "**Divulgação das falhas:** julho de 2026, segundo a publicação analisada.",
            "**Exploração ativa:** a análise não estabelece exploração generalizada em ambiente real.",
          ],
        },
      ],
    },
    {
      heading: "Como a cadeia funciona",
      blocks: [
        {
          type: "p",
          text: "A sequência descrita na análise segue cinco etapas, da requisição pública até a persistência no servidor:",
        },
        {
          type: "table",
          table: {
            headers: ["Etapa", "Técnica", "Detalhe"],
            rows: [
              [
                "Acesso inicial",
                "Requisição à API REST",
                "Envio de requisição ao endpoint /wp-json/batch/v1, que processa várias chamadas em uma única submissão.",
              ],
              [
                "Confusão de rotas",
                "CVE-2026-63030",
                "Requisições aninhadas confundem o tratamento de rotas e alcançam funcionalidades que normalmente exigiriam autenticação. Sozinha, não executa código.",
              ],
              [
                "Injeção SQL",
                "CVE-2026-60137",
                "O parâmetro público author_exclude é mapeado para author__not_in em WP_Query, e o tratamento inadequado da entrada afeta a consulta ao banco.",
              ],
              [
                "Criação de conta",
                "Acesso administrativo",
                "A prova de conceito da Seqrite estabelece uma conta com nível administrativo e chega à execução remota de código.",
              ],
              [
                "Preparação de arquivos",
                "Gravação e extração de ZIP",
                "Arquivo é colocado em wp-content/uploads/2026/10/ e extraído em wp-content/upgrade/.",
              ],
              [
                "Instalação de web shell",
                "Diretório de plugin",
                "Diretório no padrão wp2shell_<hex> é movido para wp-content/plugins/.",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "Depois que o código executa no servidor, o atacante passa a ter um caminho para alterar o site fora do painel do WordPress. A análise cita ainda que o processo httpd.exe pode realizar gravações de arquivo, o que também ocorre em operações normais de plugin: o nome do processo, sozinho, não prova comprometimento.",
        },
      ],
    },
    {
      heading: "Versões afetadas e corrigidas",
      blocks: [
        {
          type: "p",
          text: "A exposição depende da versão e de qual das duas falhas ela carrega. A tabela abaixo reproduz o que a análise lista.",
        },
        {
          type: "table",
          table: {
            headers: ["Versão do WordPress", "Situação", "Falhas"],
            rows: [
              ["7.0.0 a 7.0.1", "Vulnerável à cadeia completa", "CVE-2026-63030 e CVE-2026-60137"],
              ["6.9.0 a 6.9.4", "Vulnerável à cadeia completa", "CVE-2026-63030 e CVE-2026-60137"],
              ["6.8.0 a 6.8.5", "Afetada pela injeção SQL", "CVE-2026-60137"],
              ["6.8.6", "Corrigida", "Versão mínima corrigida da linha 6.8"],
              ["6.9.5", "Corrigida", "Versão mínima corrigida da linha 6.9"],
              ["7.0.2", "Corrigida", "Versão mínima corrigida da linha 7.0"],
            ],
          },
        },
        {
          type: "p",
          text: "A recomendação da análise é atualizar para a versão corrigida correspondente, ou para uma versão suportada posterior, e confirmar que a atualização foi concluída. Confirmar significa verificar a versão em execução, não apenas a mensagem de sucesso do painel.",
        },
      ],
    },
    {
      heading: "Indicadores de comprometimento",
      blocks: [
        {
          type: "p",
          text: "Os indicadores abaixo descrevem artefatos e comportamentos observados na análise. Um deles isolado não fecha diagnóstico, e a combinação com o contexto do site é o que sustenta a conclusão.",
        },
        {
          type: "table",
          table: {
            headers: ["Tipo", "Valor", "Descrição"],
            rows: [
              ["Endpoint", "/wp-json/batch/v1", "Endpoint da API REST em lote"],
              ["Padrão de arquivo", "temp-write-test-*", "Arquivos temporários em wp-content/"],
              ["Arquivo ZIP", "wp2shell_4e9b3641.zip", "Exemplo de arquivo em wp-content/uploads/2026/10/"],
              ["Padrão de diretório", "wp2shell_<hex>", "Diretórios observados em upgrade e plugins"],
              ["Padrão de arquivo PHP", "wp2shell_<hex>.php", "Exemplo de arquivo extraído"],
              ["Arquivos PHP", "Novos ou alterados em plugins ou cache", "Comparar com a atividade esperada do site"],
              ["Conta", "Administrador inesperado", "Verificar a data de criação"],
              ["Detecção de rede", "HTTP/CVE-2026-63030!DP.50405", "Detecção de rede Quick Heal"],
              ["Detecção de rede", "HTTP/CVE-2026-63030!SP.50370", "Detecção de rede Quick Heal"],
              [
                "Detecção comportamental",
                "SL_A WP2Shell Suspicious PHP File Modification in WordPress Plugins",
                "Alteração suspeita de PHP em diretórios de plugins",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "Detecção e resposta",
      blocks: [
        {
          type: "list",
          title: "O que verificar no ambiente",
          items: [
            "**Contas administrativas:** listar administradores e conferir a data de criação de cada conta que não for reconhecida.",
            "**Diretórios de plugins:** procurar diretórios e arquivos no padrão wp2shell_<hex> em wp-content/plugins.",
            "**Uploads e upgrade:** verificar wp-content/uploads, com atenção ao diretório do mês corrente, e wp-content/upgrade.",
            "**Arquivos temporários:** procurar arquivos no padrão temp-write-test-* em wp-content.",
            "**Alterações de PHP:** comparar arquivos novos ou modificados em plugins e cache com a atividade esperada do site.",
            "**Registros de acesso:** revisar requisições ao endpoint /wp-json/batch/v1 e avaliar volume, origem e conteúdo das chamadas.",
          ],
        },
        {
          type: "p",
          text: "As detecções de rede da Quick Heal e a detecção comportamental de modificação de PHP em plugins complementam a inspeção manual. Elas ajudam a encontrar atividade em andamento, mas não substituem a verificação dos artefatos já gravados no servidor.",
        },
      ],
    },
    {
      heading: "Mitigação e ações recomendadas",
      blocks: [
        {
          type: "list",
          items: [
            "**Atualizar** instalações afetadas para WordPress 6.8.6, 6.9.5, 7.0.2 ou versão suportada posterior.",
            "**Confirmar** que a atualização foi concluída e que a instalação está executando a versão corrigida.",
            "**Restringir**, quando operacionalmente viável, o acesso não autenticado a funcionalidades sensíveis da API REST.",
            "**Investigar** contas administrativas desconhecidas e verificar suas datas de criação.",
            "**Inspecionar** diretórios de plugins, cache, uploads e upgrade em busca de arquivos PHP ou diretórios suspeitos.",
            "**Revisar** registros em busca de requisições suspeitas ao endpoint /wp-json/batch/v1.",
            "**Comparar** alterações em arquivos do site com a atividade esperada e usar as detecções disponíveis.",
          ],
        },
        {
          type: "p",
          text: "A restrição de acesso a funcionalidades da API REST reduz exposição onde é viável, mas não substitui a atualização. E a atualização, por si só, não remove um acesso criado antes dela: versão corrigida não é prova de que uma invasão anterior foi eliminada.",
        },
        {
          type: "list",
          title: "Em caso de comprometimento",
          items: [
            "**Preservar** evidências antes de qualquer limpeza, incluindo arquivos, diretórios e registros relevantes.",
            "**Desativar** plugins suspeitos.",
            "**Redefinir** credenciais afetadas.",
            "**Investigar** possíveis mecanismos de persistência que tenham permanecido no servidor.",
          ],
        },
      ],
    },
    {
      heading: "O que ainda não se sabe e limites do artigo",
      blocks: [
        {
          type: "p",
          text: "A análise consultada descreve uma prova de conceito e os artefatos esperados da cadeia, mas não estabelece exploração ativa em larga escala, não atribui a atividade a um grupo específico e não apresenta números de vítimas. O material recebido para esta publicação também não detalha a exploração passo a passo de cada CVE. O que se pode afirmar com segurança é a existência das duas falhas, o encadeamento descrito, as versões afetadas e as versões corrigidas.",
        },
        {
          type: "p",
          text: "O detalhe operacional que costuma ser subestimado é a verificação pós-atualização. Atualizar fecha a porta; inspecionar contas, plugins e diretórios mostra se alguém já entrou por ela. As duas ações pertencem à mesma resposta e não são alternativas entre si.",
        },
        {
          type: "p",
          text: "A CyDef atualizará seus relatórios de inteligência caso novos dados sobre exploração ativa do WP2Shell sejam divulgados.",
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Cyber Security News: WP2Shell Attack Lets Hackers Create WordPress Admin Accounts and Install Web Shells Without Login",
      url: "https://cybersecuritynews.com/wp2shell-attack/",
    },
    {
      label:
        "Seqrite: WP2Shell exploit chain, anatomy of a sophisticated WordPress attack",
      url: "https://www.seqrite.com/blog/wp2shell-exploit-chain-anatomy-of-a-sophisticated-wordpress-attack/",
    },
  ],
  changelog: [
    "2026-10-21: Primeira versão publicada, baseada na análise da Seqrite e na publicação do Cyber Security News.",
  ],
};
