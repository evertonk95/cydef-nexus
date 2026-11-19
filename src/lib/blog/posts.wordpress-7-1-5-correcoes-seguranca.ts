import type { BlogPost } from "./posts";

/**
 * WordPress 7.1.5 corrige 20 falhas de segurança (PT).
 * Base: anúncio oficial do WordPress.org (18/11/2026) e análise do Cyber Security News.
 * Capa: public/assets/blog/wordpress-7-1-5-correcoes-seguranca-capa.webp
 */
export const wordpress715CorrecoesSegurancaPost: BlogPost = {
  slug: "wordpress-7-1-5-correcoes-seguranca",
  title:
    "WordPress 7.1.5 corrige 20 falhas, incluindo escalada de privilégios e possível execução de código",
  category: "Inteligência de Ameaças",
  excerpt:
    "O WordPress publicou a versão 7.1.5 com correções para 20 problemas de segurança no núcleo, entre eles uma escalada de privilégios sem autenticação via atributos do bloco Template Part que pode levar à execução remota de código, duas injeções SQL e uma falha de Multisite que permite a um administrador assumir a conta Super Admin.",
  date: "19 de Novembro, 2026",
  dateISO: "2026-11-19",
  readTime: "8 min",
  image: "/assets/blog/wordpress-7-1-5-correcoes-seguranca-capa.webp",
  author: "Equipe CyDef",
  tags: [
    "WordPress",
    "Vulnerabilidades",
    "Execução de Código",
    "Injeção SQL",
    "Elevação de Privilégios",
    "Atualização de Segurança",
    "Inteligência de Ameaças",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "Em 18 de novembro de 2026, o WordPress publicou a versão 7.1.5 com correções para 20 problemas de segurança no núcleo da plataforma. O pacote inclui uma falha que permite a um invasor sem conta obter permissões indevidas por meio de atributos do bloco Template Part e que, segundo o anúncio oficial, pode levar à execução remota de código.",
        },
        {
          type: "p",
          text: "A mesma versão corrige duas injeções SQL, oito falhas de XSS, quatro casos de exposição de informações, uma negação de serviço por XML-RPC, um bypass de autorização na edição de comentários e uma escalada de privilégios em instalações Multisite. O WordPress classifica a atualização como prioridade imediata e não relata exploração ativa das falhas.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Avaliação CyDef",
            body: "WordPress concentra dois riscos ao mesmo tempo: é o CMS mais usado do mundo e roda em cima de plugins e temas de terceiros que raramente acompanham o mesmo ritmo de atualização do núcleo. Uma falha de escalada de privilégios sem autenticação no núcleo vale mais do que dez falhas que exigem conta, porque transforma qualquer site desatualizado em alvo imediato. O trabalho aqui não termina em atualizar um site: termina em provar a versão em cada instalação do inventário, incluindo as esquecidas em hospedagem compartilhada.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipe CyDef. Anúncio oficial do WordPress.org e reportagem do Cyber Security News consultados em 19 de Novembro de 2026.",
        },
      ],
    },
    {
      heading: "Resumo executivo",
      blocks: [
        {
          type: "p",
          text: "O que se sabe sobre a atualização, com base nas duas fontes consultadas:",
        },
        {
          type: "list",
          items: [
            "**Produto e versão corrigida:** WordPress 7.1.5, com versões de manutenção para branches anteriores.",
            "**Branches corrigidas:** 7.0.9, 6.9.12 e 4.7.40, além da 7.1.5. O WordPress 4.6 e anteriores não recebem mais atualizações de segurança.",
            "**Volume de correções:** 20 problemas de segurança no núcleo.",
            "**Data de publicação:** 18 de novembro de 2026.",
            "**Falha mais grave:** escalada de privilégios sem autenticação via atributos do bloco Template Part, com possibilidade de execução remota de código.",
            "**Exploração ativa:** o anúncio não relata ataques em andamento.",
            "**Próxima versão:** a 7.2 está planejada para 8 de dezembro e o Release Candidate 2 já contém as correções.",
          ],
        },
        {
          type: "table",
          table: {
            headers: ["Item", "Situação"],
            rows: [
              ["Versão principal corrigida", "7.1.5"],
              ["Branches com correção", "7.0.9, 6.9.12 e 4.7.40"],
              ["Total de falhas no núcleo", "20"],
              ["Falhas sem autenticação", "4 (privilégio, XSS, exposição e DoS)"],
              ["Exploração ativa confirmada", "Não informada"],
              ["Próxima versão estável", "7.2, planejada para 8 de dezembro"],
            ],
          },
        },
      ],
    },
    {
      heading: "As falhas de maior impacto",
      blocks: [
        {
          type: "p",
          text: "O anúncio oficial lista as 20 correções com o crédito de quem reportou cada uma, mas não detalha o caminho de exploração. As seis abaixo são as que mudam o nível de exposição de uma instalação:",
        },
        {
          type: "table",
          table: {
            headers: ["Falha", "Componente", "Impacto", "Crédito"],
            rows: [
              ["Escalada de privilégios sem autenticação", "Atributos do bloco Template Part", "Possível execução remota de código", "Logan Homolka"],
              ["Injeção SQL", "WP_Meta_Query com valores de relação aninhados", "Manipulação de consultas ao banco", "Christiaan Swiers"],
              ["Injeção SQL", "Previews de changeset do Customizer", "Manipulação de consultas ao banco", "Rudy Faile"],
              ["Escalada de privilégios", "Previews de menu do Customizer em Multisite", "Administrador de site assume a conta Super Admin", "Yuval Miller"],
              ["Exposição de informações sem autenticação", "Endpoint de busca da REST API", "Divulgação de termos de taxonomia privados", "Anthropic"],
              ["Negação de serviço sem autenticação", "Pingbacks em lote via XML-RPC", "Indisponibilidade do site", "Giovanni Cintolo"],
            ],
          },
        },
        {
          type: "p",
          text: "A falha do bloco Template Part é a que mais pesa. O bloco é usado para elementos compartilhados de layout, como cabeçalho e rodapé, e a validação inadequada dos atributos permite que alguém sem conta obtenha permissões indevidas. O anúncio não informa quais configurações de site permitem chegar à execução de código, o que limita o planejamento defensivo a tratar toda instalação desatualizada como potencialmente explorável.",
        },
        {
          type: "p",
          text: "As duas injeções SQL afetam caminhos diferentes: consultas de metadados com relações aninhadas e a prévia de alterações do Customizer, no ajuste de página inicial. Já a falha de Multisite merece atenção separada porque o alcance não é um site, é a rede inteira: um administrador de site pode assumir a conta Super Admin.",
        },
      ],
    },
    {
      heading: "O restante do pacote",
      blocks: [
        {
          type: "p",
          text: "As outras 14 correções se distribuem entre XSS, exposição de informações, bypass de autorização e duas mudanças preventivas:",
        },
        {
          type: "list",
          items: [
            "**XSS refletido na biblioteca de mídia legada**, reportado pela Anthropic.",
            "**XSS em wp_interactivity_data_wp_context()** pelo namespace de store, reportado por Juliette Reinders Folmer.",
            "**XSS armazenado sem autenticação** via atributos de shortcode em comentários, reportado por Rafie Muhammad, da Awesome Motive.",
            "**XSS para Contributor ou superior** via scripts em respostas de provedores oEmbed, reportado por vvh1te3zz.",
            "**XSS armazenado para administrador** nos previews do Customizer, reportado por Weston Ruter.",
            "**XSS armazenado no bloco Comment Date** pelo formato de data, reportado por Weston Ruter e Jeremy Felt.",
            "**XSS no editor de blocos** via metadados de imagens do Openverse e via nomes de arquivos de mídia ao converter um bloco de mídia em bloco File, reportados por Shu Takahashi e CryptoFox.",
            "**Exposição de informações e autorização:** e-mails de usuários pela REST API de comentários (Author+), atribuição de autor em posts e templates (Editor+), wp.getComments via XML-RPC (Subscriber+) e bypass de autorização na edição de comentários no admin (Author+).",
            "**Mudanças preventivas:** endurecimento na validação de expressões regulares de tipos de mídia JSON e remoção da variação de embed do Imgur no editor de blocos, cujo provedor já não existia.",
          ],
        },
        {
          type: "p",
          text: "Nenhum desses itens tem o impacto isolado da falha do bloco Template Part, mas o conjunto importa para quem opera sites com muitos autores. XSS armazenado em comentários e em previews do Customizer é o tipo de falha que aparece em cadeia com engenharia social, e a exposição de e-mails de usuários alimenta campanhas de phishing direcionadas.",
        },
      ],
    },
    {
      heading: "Produtos e versões corrigidas",
      blocks: [
        {
          type: "p",
          text: "A correção está disponível na versão principal e em branches anteriores, para quem não pode migrar de imediato:",
        },
        {
          type: "table",
          table: {
            headers: ["Branch", "Versão corrigida"],
            rows: [
              ["7.1", "7.1.5 ou superior"],
              ["7.0", "7.0.9 ou superior"],
              ["6.9", "6.9.12 ou superior"],
              ["4.7", "4.7.40 ou superior"],
              ["4.6 e anteriores", "Sem atualização de segurança"],
              ["7.2", "Release Candidate 2 já contém as correções"],
            ],
          },
        },
        {
          type: "p",
          text: "O WordPress reforça que apenas a versão mais recente tem suporte ativo. As versões de manutenção fecham as falhas desta rodada, mas não substituem a migração. A 7.1.5 é uma versão de ciclo curto: a próxima versão principal, 7.2, está planejada para 8 de dezembro.",
        },
      ],
    },
    {
      heading: "Por que a falha do bloco Template Part importa",
      blocks: [
        {
          type: "p",
          text: "O bloco Template Part é a peça que permite reaproveitar cabeçalho, rodapé e outras áreas entre templates. Como esses atributos são processados no servidor para montar a página, uma validação inadequada transforma um campo de configuração em caminho de execução.",
        },
        {
          type: "p",
          text: "O ponto crítico é não exigir autenticação. Falhas que pedem conta de autor ou editor reduzem muito o universo de atacantes; uma falha anônima, não. Em sites com comentários abertos e REST API exposta, que é o padrão do WordPress, a superfície fica acessível a qualquer pessoa que encontre a instalação.",
        },
        {
          type: "callout",
          callout: {
            kind: "aviso",
            title: "Possível impacto, não confirmado",
            body: "O anúncio não relata exploração ativa nem informa quais configurações permitem chegar à execução de código. O cenário descrito aqui é o impacto potencial de uma escalada de privilégios sem autenticação no núcleo, não um incidente observado. Tratar como risco a reduzir com a atualização, não como comprometimento comprovado.",
          },
        },
        {
          type: "list",
          title: "O que uma conta administrativa indevida permitiria, em tese",
          items: [
            "Instalar e alterar plugins e temas, incluindo código próprio.",
            "Criar ou promover outras contas e persistir o acesso depois da correção.",
            "Ler e exportar conteúdo, usuários e configurações do site.",
            "Em Multisite, alcançar a rede inteira quando a conta obtida é Super Admin.",
          ],
        },
      ],
    },
    {
      heading: "Recomendações de mitigação",
      blocks: [
        {
          type: "p",
          text: "A correção oficial existe e a atualização é simples. O que falha, na prática, é a comprovação de que ela chegou em todos os sites:",
        },
        {
          type: "list",
          items: [
            "**Atualizar para o WordPress 7.1.5** pelo painel, em Updates, ou baixar a versão em WordPress.org.",
            "**Confirmar a versão instalada** depois da atualização, no rodapé do painel ou em Ferramentas e Informações do site.",
            "**Aplicar a versão corrigida da branch** quando a migração para 7.1.5 não for possível: 7.0.9, 6.9.12 ou 4.7.40.",
            "**Revisar instalações Multisite** e conferir as contas com Super Admin, procurando acessos que não deveriam existir.",
            "**Verificar os sites com atualização automática em segundo plano**, porque o processo nem sempre conclui e o painel segue mostrando a versão antiga.",
            "**Manter inventário das versões do WordPress em uso**, incluindo os sites esquecidos em hospedagem compartilhada e os ambientes de teste.",
            "**Confirmar com o provedor de hospedagem** a disponibilidade das versões de segurança quando a atualização é gerenciada por ele.",
            "**Priorizar a migração para a versão mais recente**, que é a única com suporte ativo, em vez de tratar as branches antigas como destino.",
          ],
        },
        {
          type: "p",
          text: "Para quem administra vários sites, a pergunta que fecha o ciclo é a mesma de sempre: qual versão está em execução agora, em cada instalação, e quantas continuam em branches que já receberam correção mas não foram aplicadas?",
        },
      ],
    },
    {
      heading: "O que ainda não se sabe e limites do artigo",
      blocks: [
        {
          type: "p",
          text: "O WordPress não afirma que as falhas estejam em exploração ativa e não publica o detalhamento técnico de cada correção. Também não informa quais configurações de site permitem que a escalada de privilégios chegue à execução de código, o que impede uma priorização por tipo de instalação.",
        },
        {
          type: "p",
          text: "Este artigo não cobre plugins e temas de terceiros, que seguem o próprio ciclo de correções, nem substitui a leitura do anúncio oficial por quem precisa avaliar exposição específica. A CyDef atualizará a análise caso o WordPress ou pesquisadores publiquem novos dados sobre exploração.",
        },
      ],
    },
  ],
  sources: [
    {
      label: "WordPress.org: WordPress 7.1.5 Release (18/11/2026)",
      url: "https://wordpress.org/news/2026/11/wordpress-7-1-5-release/",
    },
    {
      label: "Cyber Security News: WordPress 7.1.5 Patches 20 Security Issues, Including Potential RCE and SQL Injection Flaws",
      url: "https://cybersecuritynews.com/wordpress-7-1-5-patches-20-security-issues/",
    },
  ],
  changelog: [
    "2026-11-19: primeira versão publicada, baseada no anúncio oficial do WordPress.org e na análise do Cyber Security News.",
  ],
};
