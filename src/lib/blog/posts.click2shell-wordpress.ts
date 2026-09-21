import type { BlogPost } from "./posts";

/**
 * Click2Shell: falha no instalador de temas do WordPress (PT).
 * Conteúdo elaborado a partir da publicação analisada pela Cyber Security News
 * (18/09/2026), do relatório técnico da pwn.ai e do lançamento do WordPress 7.1.1.
 * Capa: public/assets/blog/click2shell-wordpress-thumb.webp
 * (arte gerada pelo Everton, 1200x675 webp q82; asset entra em commit próprio).
 */
export const click2shellWordpressPost: BlogPost = {
  slug: "click2shell-wordpress-instalacao-tema-execucao-remota",
  title:
    "Click2Shell: falha no WordPress instala tema pelo link e leva à execução remota de código",
  category: "Inteligência de Ameaças",
  excerpt:
    "Uma cadeia de exploração no recurso de visualização de temas do WordPress instala silenciosamente um tema do diretório oficial depois que um administrador autenticado abre um link malicioso. Encadeada com código inseguro do tema instalado, a falha termina em execução remota de código no servidor. A correção chegou na versão 7.1.1.",
  date: "21 de Setembro, 2026",
  dateISO: "2026-09-21",
  readTime: "9 min",
  image: "/assets/blog/click2shell-wordpress-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "WordPress",
    "Click2Shell",
    "Execução remota de código",
    "Injeção em seletor jQuery",
    "Theme Installer",
    "Customizer",
    "Gestão de Vulnerabilidades",
    "Hardening",
    "Blue Team",
    "SOC",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "O WordPress publicou em 17 de setembro de 2026 a versão **7.1.1**, que corrige uma falha no recurso de visualização de temas explorada em uma cadeia batizada de **Click2Shell**. O problema de base estava no núcleo do CMS e permitia instalar, de forma silenciosa, um tema escolhido pelo atacante a partir do diretório oficial do WordPress.org.",
        },
        {
          type: "p",
          text: "A falha isolada não entrega execução de código: ela é uma **primitiva de instalação forçada**. O que transforma o caso em comprometimento de servidor é o encadeamento com um tema que carrega código PHP inseguro. No cenário demonstrado pelos pesquisadores, o tema **Mobile Repair Zone 2.5.4** expunha um manipulador AJAX sem verificação de nonce e sem verificação de capacidade, o que resultou em execução de código com as permissões da conta do servidor web.",
        },
        {
          type: "p",
          text: "O vetor exige interação humana, mas não exige conta no site: o atacante precisa apenas que um **administrador autenticado** abra um link especialmente construído. A sessão do administrador fornece a capacidade de instalação e o nonce, e o próprio JavaScript confiável do WordPress executa a ação sensível em nome do atacante.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Avaliação CyDef",
            body: "Risco alto para qualquer site WordPress com contas administrativas ativas e personalização de tema habilitada, e risco ainda maior em hospedagem compartilhada: a execução na conta do servidor web alcança credenciais de banco e arquivos de outros contextos que convivam no mesmo ambiente. A combinação de instalação silenciosa com ausência de mudança visual é o que torna a atividade difícil de perceber sem monitoramento dedicado.",
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
          text: "O que se sabe até 21 de setembro de 2026, com base na publicação analisada, no relatório técnico da pwn.ai e no lançamento de correção do WordPress:",
        },
        {
          type: "list",
          items: [
            "**Identificador:** na divulgação, o WordPress ainda não havia publicado um CVE definitivo para a falha de núcleo; a cadeia é referenciada publicamente como Click2Shell.",
            "**Severidade:** a instalação forçada isolada foi classificada como alta, com CVSS 3.1 de 7.1; a cadeia completa com execução remota de código foi considerada crítica.",
            "**Produtos afetados:** WordPress Core anterior à 7.1.1 e ramificações de segurança suportadas anteriores à correção correspondente, com retroportabilidade até a 4.7.",
            "**Vetor:** link especialmente construído, aberto por um administrador autenticado, que dispara instalação e visualização de um tema inativo do diretório oficial.",
            "**Pré-requisito humano:** sim. O atacante não precisa de conta no site, mas depende da sessão autenticada de um administrador.",
            "**Segundo estágio:** tema instalado com código de pré-ativação inseguro, que expõe um manipulador AJAX sem nonce e sem checagem de capacidade.",
            "**Impacto final:** execução remota de código com as permissões da conta do servidor web, acesso ao wp-config.php e a credenciais de banco, leitura de dados de WordPress e WooCommerce, alteração de arquivos e conteúdo, criação de usuários e roubo de segredos disponíveis ao processo PHP.",
            "**Correção:** atualização para o WordPress 7.1.1 ou para a versão corrigida da ramificação suportada em uso. A correção do seletor entrou no changeset 63664.",
            "**Exploração em campo:** a divulgação pública não apresentou evidência de exploração em ataques reais.",
          ],
        },
      ],
    },
    {
      heading: "O que é a vulnerabilidade",
      blocks: [
        {
          type: "p",
          text: "A raiz do problema é uma **injeção em seletor jQuery** na rota do instalador de temas. O valor do tema enviado na URL é processado de duas formas inconsistentes: a API de temas do WordPress.org canonicaliza a entrada para um slug válido do catálogo, enquanto o navegador do administrador mantém a pontuação original e a insere em um seletor jQuery.",
        },
        {
          type: "p",
          text: "Caracteres de seletor especialmente construídos escapam da correspondência de atributo pretendida, percorrem o cartão de tema retornado e alcançam o controle real de instalação, que o WordPress então aciona programaticamente. É uma quebra de validação: a entrada que deveria identificar um item do catálogo passa a ser interpretada como estrutura executável de seletor.",
        },
        {
          type: "p",
          text: "A correção no changeset 63664 restringe a correspondência a um cartão genuíno da interface e aplica **escapeSelector()** do jQuery ao slug derivado da URL antes de montar o seletor. Com isso, aspas, combinadores e sintaxe de comentário injetados passam a ser tratados como caracteres literais do slug, e não como estrutura de CSS.",
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Ponto de atenção",
            body: "O tema instalado permanece inativo e a aparência do site não muda. Não há sinal visível para o administrador, o que explica por que a segunda etapa da cadeia é decisiva para o atacante e por que a detecção precisa vir de telemetria, não de inspeção visual.",
          },
        },
      ],
    },
    {
      heading: "Como a cadeia Click2Shell funciona",
      blocks: [
        {
          type: "list",
          items: [
            "O atacante monta uma URL com o valor de tema manipulado, capaz de escapar da correspondência de atributo dentro do instalador.",
            "A URL é entregue a um administrador autenticado, que a acessa com a sessão ativa no painel.",
            "O WordPress.org canonicaliza o valor como slug do catálogo, e o navegador do administrador insere a pontuação original no seletor jQuery.",
            "O seletor manipulado alcança o controle legítimo de instalação, acionado de forma programática pelo JavaScript do próprio painel.",
            "Um tema atual do diretório oficial é instalado e permanece inativo, sem alterar a aparência do site.",
            "A sessão do administrador é usada para abrir a visualização do tema no Customizer, o que carrega o PHP do tema inativo.",
            "O tema inseguro expõe um manipulador AJAX sem verificação de nonce e sem verificação de capacidade.",
            "O manipulador aceita detalhes de plugin e uma URL de pacote controlados pelo atacante, baixa e descompacta o arquivo enviado e carrega seu ponto de entrada PHP.",
            "O resultado é execução de código com as permissões da conta do servidor web.",
          ],
        },
        {
          type: "p",
          text: "Vale registrar a limitação do primeiro estágio: a falha de núcleo **não permite instalar um arquivo arbitrário de tema**. Ela instala um pacote do catálogo confiável e mantém o tema inativo. O comprometimento só acontece quando existe, no ambiente, um tema com código de pré-ativação inseguro que sirva de ponte entre um pacote inativo e PHP controlado pelo atacante.",
        },
      ],
    },
    {
      heading: "O segundo estágio: o tema que serve de ponte",
      blocks: [
        {
          type: "p",
          text: "Durante a visualização no Customizer, o WordPress carrega o PHP do tema inativo para renderizar a prévia. Esse é o momento em que o código de pré-ativação passa a executar. No caso demonstrado, o tema **Mobile Repair Zone 2.5.4** registrava um manipulador AJAX acessível a usuários autenticados e sem as duas verificações que deveriam existir: checagem de nonce e checagem de capacidade.",
        },
        {
          type: "p",
          text: "Sem essas verificações, o manipulador aceitava dados arbitrários de plugin e uma URL de pacote, baixava o arquivo indicado, o descompactava no servidor e carregava seu ponto de entrada. Qualquer tema ou plugin com esse mesmo padrão produz o mesmo efeito quando encadeado à falha de núcleo.",
        },
        {
          type: "callout",
          callout: {
            kind: "exemplo",
            title: "O padrão que importa para o seu inventário",
            body: "O problema do segundo estágio não é específico do tema usado na demonstração: é a ausência de verificação de nonce e de capacidade em manipuladores AJAX que aceitam pacotes externos. Além de atualizar o núcleo, vale varrer o inventário de temas e plugins atrás desse padrão, inclusive em itens inativos.",
          },
        },
      ],
    },
    {
      heading: "Impacto potencial",
      blocks: [
        {
          type: "list",
          items: [
            "Execução de código com as permissões da conta do servidor web.",
            "Acesso ao wp-config.php e às credenciais de banco de dados da aplicação.",
            "Leitura de dados de WordPress e WooCommerce, incluindo informações de clientes e pedidos, quando presentes.",
            "Alteração de arquivos e de conteúdo publicado, com risco de desfiguração e de injeção de conteúdo.",
            "Criação de usuários e alteração de permissões dentro do painel.",
            "Roubo de segredos disponíveis ao processo PHP, como chaves de API e tokens de integrações.",
            "Risco ampliado em hospedagem compartilhada, onde a conta comprometida pode alcançar outros contextos do mesmo ambiente.",
          ],
        },
      ],
    },
    {
      heading: "Detecção: onde procurar",
      blocks: [
        {
          type: "list",
          items: [
            "Requisições a **theme-install.php** que não correspondam a uma ação legítima de instalação registrada pela equipe.",
            "Chamadas a **admin-ajax.php** associadas a fluxos do Customizer, especialmente com origem incomum ou em janelas fora do horário de manutenção.",
            "Temas instalados recentemente que ninguém reconhece, inclusive temas inativos.",
            "Arquivos PHP inesperados em diretórios de tema e de uploads.",
            "Alterações em arquivos, em conteúdo e em contas administrativas, com atenção a usuários criados fora do processo de provisionamento.",
            "Padrões de acesso administrativo a partir de origens novas, correlacionados no tempo com as requisições acima.",
          ],
        },
      ],
    },
    {
      heading: "Mitigação",
      blocks: [
        {
          type: "p",
          text: "A correção oficial é a atualização do núcleo. Depois dela, as ações abaixo reduzem a superfície e ajudam a identificar comprometimento anterior:",
        },
        {
          type: "list",
          items: [
            "Atualizar o WordPress para a versão **7.1.1 ou superior**.",
            "Aplicar a versão corrigida correspondente nas ramificações de segurança suportadas, incluindo as que receberam retroportabilidade até a 4.7.",
            "Verificar se as atualizações automáticas foram de fato aplicadas nos ambientes em produção.",
            "Revisar temas e plugins instalados recentemente e remover o que não tem uso justificado.",
            "Inspecionar arquivos PHP inesperados e alterações em contas de usuário.",
            "Investigar requisições suspeitas a theme-install.php.",
            "Investigar chamadas suspeitas a endpoints admin-ajax.php relacionados ao Customizer.",
            "Verificar alterações não autorizadas em arquivos, conteúdo e usuários administrativos.",
            "Revisar o padrão de nonce e de checagem de capacidade nos manipuladores AJAX de temas e plugins próprios.",
          ],
        },
      ],
    },
    {
      heading: "Quando a atualização não pode ser aplicada imediatamente",
      blocks: [
        {
          type: "list",
          items: [
            "Restringir o acesso às contas administrativas, com autenticação multifator e princípio do menor privilégio.",
            "Monitorar requisições de instalação de temas e chamadas administrativas do Customizer.",
            "Reduzir ao mínimo o número de administradores ativos e revisar contas com privilégios elevados que não sejam necessárias.",
            "Manter cópias de segurança verificadas e restauráveis, com teste periódico de restauração.",
          ],
        },
        {
          type: "p",
          text: "Essas medidas reduzem a janela de exposição, mas não corrigem a falha. A atualização do núcleo continua sendo a ação que remove a primitiva de instalação forçada.",
        },
      ],
    },
    {
      heading: "O que ainda não sabemos / limites deste artigo",
      blocks: [
        {
          type: "p",
          text: "Este artigo foi elaborado a partir da publicação analisada, do relatório técnico dos pesquisadores e do lançamento de correção do WordPress, com verificação em 21 de setembro de 2026. Não há telemetria própria da CyDef sobre este caso, nenhuma exploração observada internamente e nenhuma atribuição de autoria feita aqui.",
        },
        {
          type: "p",
          text: "Até a data de verificação, não havia evidência pública de exploração em ataques reais nem CVE definitivo publicado para a falha de núcleo. Os números de versão corrigida, a abrangência das retroportabilidades e a lista de temas ou plugins que servem de segundo estágio devem ser confirmados nas fontes oficiais antes de qualquer decisão de mudança em produção. Este texto será atualizado quando houver informação nova verificável.",
        },
      ],
    },
    {
      heading: "Próximos passos",
      blocks: [
        {
          type: "list",
          items: [
            "Inventariar todos os sites WordPress sob sua responsabilidade, incluindo ambientes de homologação e sites esquecidos.",
            "Confirmar a versão do núcleo em cada um e priorizar os que permitem acesso administrativo pela internet.",
            "Planejar a janela de atualização para a versão 7.1.1 ou para a corrigida da ramificação em uso.",
            "Rodar a busca em logs por theme-install.php e por chamadas ao Customizer via admin-ajax.php.",
            "Revisar o inventário de temas e plugins quanto a manipuladores AJAX sem nonce e sem checagem de capacidade.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Cyber Security News: Click2Shell WordPress Flaw Lets Attackers Gain RCE With a Single Malicious Link",
      url: "https://cybersecuritynews.com/click2shell-wordpress-vulnerability/",
    },
    {
      label: "pwn.ai: análise técnica da cadeia Click2Shell",
      url: "https://pwn.ai/blog/click2shell",
    },
    {
      label: "WordPress 7.1.1 security update (Cyber Security News)",
      url: "https://cybersecuritynews.com/wordpress-7-1-1-security-update/",
    },
    {
      label: "WordPress Core changeset 63664 (correção do seletor no instalador de temas)",
      url: "https://core.trac.wordpress.org/changeset/63664",
    },
  ],
  changelog: [
    "2026-09-21: primeira versão, baseada na publicação analisada (18/09/2026), no relatório técnico da pwn.ai e no lançamento do WordPress 7.1.1 (17/09/2026).",
  ],
};
