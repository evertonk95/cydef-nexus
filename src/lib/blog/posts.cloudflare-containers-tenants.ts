import type { BlogPost } from "./posts";

/**
 * Cloudflare Containers: exposição de dados residuais entre tenants (PT).
 * Conteúdo elaborado a partir da análise técnica publicada pela Cloudflare em
 * 24/09/2026, do relatório da Accomplish (divulgação responsável em 04/09/2026)
 * e da publicação analisada pela Cyber Security News.
 * Capa: public/assets/blog/cloudflare-containers-cross-tenant-thumb.webp
 */
export const cloudflareContainersTenantsPost: BlogPost = {
  slug: "cloudflare-containers-isolamento-entre-tenants",
  title:
    "Cloudflare Containers: falha de isolamento entre tenants expunha dados residuais de cargas de trabalho anteriores",
  category: "Cloud Security",
  excerpt:
    "Uma falha na camada de armazenamento dos pools compartilhados do Cloudflare Containers permitia que uma carga de trabalho recuperasse blocos de disco residuais de contêineres de outros clientes no mesmo host físico. A exposição alcançava metadados de sistema de arquivos, páginas de banco de dados e bancos SQLite estruturalmente completos. A correção já foi aplicada em toda a frota, sem alteração de configuração do lado do cliente.",
  date: "25 de Setembro, 2026",
  dateISO: "2026-09-25",
  readTime: "11 min",
  image: "/assets/blog/cloudflare-containers-cross-tenant-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "Cloudflare",
    "Cloudflare Containers",
    "Cloudflare Sandboxes",
    "Isolamento entre tenants",
    "dm-thin",
    "Firecracker",
    "Cloud Security",
    "Exposição de dados",
    "Multi-tenant",
    "Blue Team",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "A Cloudflare corrigiu uma vulnerabilidade de exposição de dados entre tenants na plataforma **Cloudflare Containers**, que também afetava o **Cloudflare Sandboxes**, construído sobre Containers. A falha permitia que uma carga de trabalho recuperasse blocos de disco residuais deixados por contêineres de outros clientes no mesmo host físico.",
        },
        {
          type: "p",
          text: "O problema não estava em um contêiner convencional nem em um escape de máquina virtual. A origem era a **camada de armazenamento**: o provisionamento fino do device mapper (**dm-thin**) operava com a opção `skip_block_zeroing` habilitada nos pools compartilhados, o que fazia blocos físicos reciclados serem entregues sem limpeza prévia.",
        },
        {
          type: "p",
          text: "A divulgação responsável foi feita em **4 de setembro de 2026** pelo pesquisador **Oren Yomtov**, da **Accomplish**, pelo programa de bug bounty da Cloudflare no HackerOne. A Cloudflare publicou a análise técnica em **24 de setembro de 2026** e afirma não ter encontrado, na telemetria histórica de E/S de disco que retém, evidência de exploração maliciosa por terceiros.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Avaliação CyDef",
            body: "O caso é relevante menos pela técnica e mais pela camada atingida. No modelo de nuvem compartilhada, o isolamento entre clientes é uma promessa que a organização não controla e não consegue verificar sozinha: ela depende do provedor. Por isso a resposta correta tem duas partes. A primeira é técnica, e a Cloudflare já executou (zeragem das novas alocações, aposentadoria dos discos em execução e limpeza dos snapshots em cache). A segunda é de governança: revisar quais segredos e dados sensíveis estavam em cargas de trabalho multi-tenant e decidir sobre rotação preventiva, conforme a política de risco de cada organização.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipe CyDef. Fontes consultadas e verificadas em 25 de setembro de 2026.",
        },
      ],
    },
    {
      heading: "Resumo executivo",
      blocks: [
        {
          type: "p",
          text: "O que se sabe até 25 de setembro de 2026, com base na análise técnica publicada pela Cloudflare, no relatório da Accomplish e na publicação consultada:",
        },
        {
          type: "list",
          items: [
            "**Produtos afetados:** Cloudflare Containers e Cloudflare Sandboxes, em infraestrutura compartilhada multi-tenant.",
            "**Camada da falha:** armazenamento, no provisionamento fino dm-thin, com a opção `skip_block_zeroing` habilitada nos pools compartilhados.",
            "**Pré-requisito de exploração:** conta Workers Paid. O atacante não podia escolher a vítima, o host, a carga de trabalho nem o dado exposto.",
            "**Mecanismo:** blocos físicos reciclados de 64 KiB eram entregues sem zeragem, o que permitia ler até 60 KiB de dados residuais de outro cliente após uma escrita de apenas 4 KiB.",
            "**Escala observada na validação:** material residual em 18 de 24 posicionamentos e em 20 de 22 nós subjacentes, em quatro continentes.",
            "**Tipos de dado recuperados:** estruturas de diretório, páginas de banco de dados e bancos SQLite estruturalmente completos.",
            "**O que a falha não permitia:** acesso a discos ativamente conectados, alteração de dados ativos de outro cliente ou indisponibilidade das cargas de trabalho.",
            "**Divulgação:** relato em 4 de setembro de 2026, via HackerOne, pelo pesquisador Oren Yomtov, da Accomplish.",
            "**Correção:** remoção global de `skip_block_zeroing`, aposentadoria dos discos em execução, limpeza dos snapshots em cache e reinício das VMs, sem ação necessária do lado do cliente.",
            "**Exploração maliciosa:** nenhuma atividade identificada além das validações autorizadas dos pesquisadores e dos engenheiros da Cloudflare.",
          ],
        },
      ],
    },
    {
      heading: "Perfil do caso",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Atributo", "Detalhe"],
            rows: [
              [
                "Nome",
                "Exposição de dados residuais entre tenants no Cloudflare Containers",
              ],
              ["Tipo", "Falha de isolamento entre tenants na camada de armazenamento"],
              [
                "Camada afetada",
                "Provisionamento fino dm-thin com skip_block_zeroing habilitado",
              ],
              ["Produtos", "Cloudflare Containers e Cloudflare Sandboxes"],
              [
                "Isolamento de execução",
                "microVM dedicada do Firecracker por contêiner",
              ],
              ["Disco apresentado à VM", "/dev/vdc (disco raiz gravável)"],
              ["Tamanho do bloco fino", "64 KiB"],
              ["Pré-requisito", "Conta Workers Paid"],
              ["Divulgação", "4 de setembro de 2026, via HackerOne"],
              ["Pesquisador", "Oren Yomtov, da Accomplish"],
              ["Publicação da análise", "24 de setembro de 2026, no blog da Cloudflare"],
              ["CVE", "Não informado nas fontes consultadas"],
              ["Remediação", "Aplicada em toda a frota, sem configuração do cliente"],
            ],
          },
        },
      ],
    },
    {
      heading: "Como o armazenamento dos contêineres funcionava",
      blocks: [
        {
          type: "p",
          text: "Cada contêiner roda dentro de uma **microVM dedicada** do monitor de máquinas virtuais **Firecracker**. A Cloudflare apresenta o disco raiz gravável dessa VM como `/dev/vdc`. Cada contêiner recebe o próprio disco, e é o `dm-thin` que materializa esse disco em armazenamento físico.",
        },
        {
          type: "p",
          text: "O provisionamento fino aloca espaço físico **apenas quando** o disco virtual escreve em uma região ainda não mapeada. Nos pools afetados, o tamanho do bloco fino era de **64 KiB**. Quando o volume fino que sustentava o disco raiz de um contêiner era excluído, seus blocos físicos voltavam para um pool que atendia cargas de trabalho de **várias contas de clientes**.",
        },
        {
          type: "p",
          text: "O ponto central está em uma opção de configuração do pool, o `skip_block_zeroing`. Com essa opção habilitada, o `dm-thin` **deixava de zerar** os blocos recém-alocados antes de entregá-los. Uma escrita do tamanho do bloco substituía todo o conteúdo anterior, mas uma escrita menor alterava apenas a parte gravada. O restante podia manter dados do dono anterior daquele bloco físico.",
        },
      ],
    },
    {
      heading: "Como a exploração funcionava",
      blocks: [
        {
          type: "p",
          text: "Ler uma região não mapeada de um disco fino novo não revela dados residuais: nesse caso, o `dm-thin` retorna zeros **sem alocar bloco físico**. É por isso que a técnica relatada precisa de um passo intermediário, quase contraintuitivo, para forçar a alocação.",
        },
        {
          type: "p",
          text: "A prova de conceito identificava regiões alinhadas em **64 KiB** que correspondiam a **espaço livre** no sistema de arquivos ext4 do convidado e gravava um bloco alinhado de **4 KiB** em cada região. Essa escrita pequena obrigava o `dm-thin` a alocar um bloco físico de 64 KiB reciclado, substituindo apenas 4 KiB. Como a zeragem estava desabilitada, os **60 KiB restantes** podiam manter dados de um contêiner anterior. Uma leitura crua do dispositivo, na sequência, podia revelar bytes que o novo contêiner nunca havia escrito.",
        },
        {
          type: "p",
          text: "A prova de conceito executava, em ordem:",
        },
        {
          type: "list",
          items: [
            "Criar um contêiner usando uma conta Workers Paid.",
            "Abrir o disco raiz gravável em `/dev/vdc`.",
            "Ler o disco e registrar uma linha de base.",
            "Gravar um bloco de 4 KiB em cada região de 64 KiB correspondente a espaço livre do ext4.",
            "Ler os blocos resultantes novamente.",
            "Examinar apenas as porções não sobrescritas pelo novo contêiner.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "aviso",
            title: "Por que a leitura crua importa",
            body: "O conteúdo recuperado não vem de uma interface de aplicação nem de uma API: ele vem da leitura direta do dispositivo de bloco. Isso significa que nenhum controle de acesso de aplicação, permissão de arquivo ou criptografia de dados em repouso no nível da aplicação interrompe a técnica. A proteção, nesse caso, é a limpeza dos blocos na camada de armazenamento, exatamente o que a correção restaura.",
          },
        },
      ],
    },
    {
      heading: "Como a falha foi validada",
      blocks: [
        {
          type: "p",
          text: "Os pesquisadores usaram os **checksums de blocos de diretório do ext4** (recurso `metadata_csum`) para separar blocos do próprio sistema de arquivos de teste dos blocos originados de outros sistemas de arquivos. Quando o ext4 usa esse recurso, o checksum do bloco de diretório incorpora valores associados ao sistema de arquivos e ao inode, o que permite atribuir um bloco à sua origem.",
        },
        {
          type: "p",
          text: "O método foi antes calibrado contra blocos que os próprios pesquisadores criaram e excluíram no sistema de arquivos controlado da prova de conceito: **162 de 162** blocos foram atribuídos corretamente. Só então a medição foi aplicada aos posicionamentos de produção.",
        },
        {
          type: "table",
          table: {
            headers: ["Métrica", "Resultado relatado"],
            rows: [
              [
                "Blocos de diretório testáveis",
                "5.614, distribuídos em seis posicionamentos de produção",
              ],
              [
                "Blocos atribuídos ao sistema de arquivos dos pesquisadores",
                "0",
              ],
              [
                "Inodes de diretório estrangeiros identificados",
                "2.700",
              ],
              [
                "Controle do método (blocos criados e excluídos pelos pesquisadores)",
                "162 de 162 atribuídos corretamente",
              ],
              ["Posicionamentos com material residual", "18 de 24"],
              ["Nós subjacentes com material residual", "20 de 22"],
              ["Abrangência geográfica", "Quatro continentes"],
              [
                "Formatos observados",
                "Estruturas de diretório, páginas de banco de dados e bancos SQLite estruturalmente completos",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "Segundo o relato, os scripts usados produziam apenas **contagens agregadas** e verificações de formato, sem conteúdo de arquivos recuperados. Os materiais enviados à Cloudflare não continham valores de conteúdo recuperado nem identificadores de terceiros, e os pesquisadores confirmaram a exclusão segura dos dados recuperados após a submissão, conforme a política de divulgação do HackerOne.",
        },
      ],
    },
    {
      heading: "Impacto potencial",
      blocks: [
        {
          type: "list",
          items: [
            "**Exposição de dados residuais:** possibilidade de recuperar bytes deixados por cargas de trabalho de outros clientes no mesmo host físico.",
            "**Metadados de sistema de arquivos:** estruturas de diretório e outros metadados legíveis em blocos reciclados.",
            "**Bancos de dados:** páginas de banco de dados e bancos SQLite estruturalmente completos entre os formatos observados.",
            "**Quebra do isolamento:** a falha cruzava o limite de isolamento entre tenants em infraestrutura compartilhada.",
            "**Segredos e dados de aplicação:** risco direto para cargas de trabalho que processam credenciais, tokens ou informações sensíveis em ambientes multi-tenant.",
          ],
        },
      ],
    },
    {
      heading: "O que a falha não permitia",
      blocks: [
        {
          type: "p",
          text: "Delimitar o alcance da falha é parte da análise. Segundo as fontes consultadas, a técnica:",
        },
        {
          type: "list",
          items: [
            "Não permitia escolher a vítima, o host, a carga de trabalho ou o dado específico exposto: o posicionamento das cargas de trabalho é automático e o cliente não seleciona o host.",
            "Não permitia acessar discos ativamente conectados.",
            "Não permitia modificar dados ativos de outro cliente.",
            "Não permitia afetar a disponibilidade das cargas de trabalho.",
            "Não garantia a presença de dados residuais: a exposição dependia de quais blocos liberados o alocador reatribuía, o que torna a extração oportunista e não direcionada.",
          ],
        },
        {
          type: "p",
          text: "Mesmo com essas limitações, os fragmentos expostos podiam conter metadados de sistema de arquivos, informações de aplicação e conteúdo sensível de banco de dados. É essa possibilidade, e não a certeza de acesso, que justifica tratar o caso como incidente de severidade alta.",
        },
      ],
    },
    {
      heading: "Linha do tempo",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["Data (UTC)", "Evento"],
            rows: [
              [
                "4 de setembro, 15h26",
                "Oren Yomtov, da Accomplish, relata a falha pelo programa de bug bounty no HackerOne.",
              ],
              [
                "4 de setembro, 18h45",
                "Cloudflare abre o incidente de segurança e confirma a configuração de produção que causava a falha.",
              ],
              [
                "4 de setembro, 21h27",
                "Merge da correção no runtime e do teste de reutilização de blocos.",
              ],
              [
                "4 de setembro, 22h03",
                "Merge das mudanças para pools novos e para pools ativos.",
              ],
              ["4 de setembro, 23h15", "Início da distribuição das mudanças."],
              [
                "7 de setembro, 06h13",
                "Conclusão da distribuição das mudanças e início da limpeza dos dados dos pools antigos.",
              ],
              [
                "14 de setembro, 10h50",
                "Pesquisadores confirmam que a prova de conceito deixou de funcionar.",
              ],
              [
                "14 de setembro, 12h52",
                "Cloudflare concede a recompensa ao pesquisador.",
              ],
              [
                "19 de setembro, 15h03",
                "Conclusão da limpeza de todos os snapshots em cache anteriores à correção.",
              ],
              [
                "24 de setembro, 15h00",
                "Publicação da análise técnica no blog da Cloudflare.",
              ],
            ],
          },
        },
      ],
    },
    {
      heading: "A correção aplicada pela Cloudflare",
      blocks: [
        {
          type: "p",
          text: "A primeira medida foi remover o `skip_block_zeroing` da configuração dos pools `dm-thin` em toda a frota, restaurando o comportamento padrão de **zerar os blocos recém-alocados** antes de expô-los a um contêiner. Isso interrompeu a técnica relatada, em que uma escrita pequena disparava a alocação e uma leitura maior recuperava os dados residuais do restante do bloco. Os pesquisadores confirmaram de forma independente que a prova de conceito deixou de funcionar depois da mudança.",
        },
        {
          type: "p",
          text: "Zerar as novas alocações, porém, **não saneia blocos já mapeados** em dispositivos finos existentes. Esses mapeamentos permaneciam nos discos de contêineres em execução e no cache de snapshots preparados de cada host para as camadas de imagens OCI. Um contêiner novo podia herdar mapeamentos de uma camada em cache sem alocar aqueles blocos novamente, o que mantinha bytes residuais legíveis em regiões não usadas, inclusive no espaço livre do ext4.",
        },
        {
          type: "p",
          text: "Por isso a remediação foi além da opção de configuração:",
        },
        {
          type: "list",
          items: [
            "Aposentadoria de todos os discos de contêiner em execução.",
            "Remoção dos snapshots de imagem em cache criados antes da correção.",
            "Drenagem dos hosts em horários de menor uso.",
            "Reinício das máquinas virtuais de cada host.",
            "Limpeza do cache de imagens de cada host, para que discos e camadas fossem recriados com alocações zeradas.",
          ],
        },
        {
          type: "p",
          text: "A limpeza foi concluída em toda a frota de Containers. A remediação **não exige alteração de configuração do lado do cliente**, embora as organizações devam avaliar se os segredos tratados pelas cargas de trabalho afetadas justificam rotação preventiva sob suas próprias políticas de risco.",
        },
      ],
    },
    {
      heading: "Detecção e evidência de exploração",
      blocks: [
        {
          type: "p",
          text: "A prova de conceito produzia uma relação característica entre escritas e leituras: uma escrita de 4 KiB em região não mapeada disparava a alocação de um bloco reutilizado de 64 KiB e as leituras seguintes recuperavam muito mais dados do que o novo contêiner havia sobrescrito.",
        },
        {
          type: "p",
          text: "Com base nessa característica, a Cloudflare desenvolveu **assinaturas de detecção** e as aplicou à telemetria histórica de E/S de disco disponível. A revisão identificou atividade atribuível aos pesquisadores e a engenheiros da Cloudflare em validação autorizada, e **nenhuma atividade adicional** compatível com a técnica relatada.",
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Sinal útil para monitoramento",
            body: "Razão entre escrita pequena e leitura maior no mesmo bloco recém-alocado é um sinal barato de implementar em telemetria de disco de ambientes multi-tenant. O padrão é incomum em operação normal e serve tanto para detecção quanto para validação de hipóteses de reutilização de bloco.",
          },
        },
      ],
    },
    {
      heading: "Ações recomendadas",
      blocks: [
        {
          type: "p",
          text: "A correção é do lado do provedor, mas a avaliação de exposição é do lado do cliente. As ações abaixo seguem as recomendações das fontes consultadas:",
        },
        {
          type: "list",
          items: [
            "Identificar cargas de trabalho que usam Cloudflare Containers ou Cloudflare Sandboxes.",
            "Avaliar se os segredos processados por cargas de trabalho afetadas exigem rotação preventiva.",
            "Revisar dados sensíveis que poderiam ter sido armazenados ou processados nessas cargas de trabalho.",
            "Monitorar atividades anômalas de leitura e gravação em disco nas cargas de trabalho.",
            "Investigar padrões de gravação de 4 KiB seguidos por leituras maiores em blocos recém-alocados.",
            "Revisar logs e telemetria relacionados às cargas de trabalho afetadas.",
            "Confirmar que as correções publicadas pela Cloudflare se aplicam ao ambiente em uso.",
          ],
        },
      ],
    },
    {
      heading: "Quando a avaliação não puder ser concluída de imediato",
      blocks: [
        {
          type: "list",
          items: [
            "Rotacionar segredos e credenciais processados por cargas de trabalho potencialmente afetadas.",
            "Isolar ou restringir cargas de trabalho que manipulam informações sensíveis até a conclusão da avaliação.",
            "Priorizar a rotação dos segredos com maior raio de alcance, como tokens de provedores de nuvem, chaves de API de terceiros e credenciais de banco de dados.",
            "Registrar a decisão e o critério usado, para que a escolha seja auditável depois.",
          ],
        },
      ],
    },
    {
      heading: "O que ainda não sabemos / limites deste artigo",
      blocks: [
        {
          type: "p",
          text: "Este artigo foi elaborado a partir da análise técnica publicada pela Cloudflare em 24 de setembro de 2026, do relatório da Accomplish e da publicação consultada, com verificação em 25 de setembro de 2026. Não há telemetria própria da CyDef sobre este caso, nenhuma exploração observada internamente e nenhuma atribuição de autoria feita aqui.",
        },
        {
          type: "p",
          text: "As fontes consultadas não informam **identificador CVE**, versões ou builds específicos, nem lista de posicionamentos afetados por região. Os números de validação vêm dos próprios pesquisadores e da Cloudflare. Também não há, até a data de verificação, estimativa pública de quantos clientes ou cargas de trabalho tiveram dados residuais expostos, já que a exposição dependia do posicionamento das cargas de trabalho e da reatribuição de blocos pelo alocador. Este texto será atualizado quando houver informação nova verificável.",
        },
      ],
    },
    {
      heading: "Próximos passos",
      blocks: [
        {
          type: "list",
          items: [
            "Inventariar quais times usam Cloudflare Containers ou Sandboxes e onde existem segredos de produção nessas cargas de trabalho.",
            "Definir critério de rotação preventiva de segredos para quando um provedor de nuvem reportar falha de isolamento entre tenants.",
            "Adicionar detecção do padrão de E/S anômalo (escrita pequena seguida de leitura maior em bloco recém-alocado) ao monitoramento de ambientes multi-tenant.",
            "Revisar a dependência de isolamento implícito do provedor nos modelos de ameaça de aplicações multi-tenant.",
            "Acompanhar a análise técnica da Cloudflare para incorporar os aprendizados de arquitetura de armazenamento aos requisitos de fornecedor.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "Cloudflare: How Cloudflare addressed a cross-tenant data exposure vulnerability in Containers",
      url: "https://blog.cloudflare.com/containers-cross-tenant-vulnerability/",
    },
    {
      label:
        "Cyber Security News: Cloudflare Containers Vulnerability Could Leak Data Between Customer Workloads",
      url: "https://cybersecuritynews.com/cloudflare-containers-vulnerability/",
    },
    {
      label: "Accomplish: Escaping the Cloudflare Sandbox",
      url: "https://accomplish.ai/blog/escaping-the-cloudflare-sandbox/",
    },
  ],
  changelog: [
    "2026-09-25: primeira versão, baseada na análise técnica da Cloudflare, no relatório da Accomplish e na publicação consultada.",
  ],
};
