import type { BlogPost } from "./posts";

/**
 * NoisyTCP: condição de corrida no TCP do Linux permite panic do kernel por
 * pacotes remotos (CVE-2026-99288, PT). Conteúdo elaborado a partir do aviso
 * do pesquisador Hyunwoo Kim (@v4bel) no GitHub e no oss-security, e da
 * publicação do Cyber Security News, verificados em 16 de novembro de 2026.
 * Capa: public/assets/blog/noisytcp-linux-kernel-tcp-dos-thumb.webp
 */
export const noisytcpLinuxPost: BlogPost = {
  slug: "noisytcp-linux-kernel-tcp-dos-cve-2026-99288",
  title:
    "NoisyTCP: falha de 11 anos no TCP do Linux permite derrubar servidores remotamente sem autenticação",
  category: "Inteligência de Ameaças",
  excerpt:
    "Após o fim do embargo, foi divulgada a CVE-2026-99288 (NoisyTCP), uma condição de corrida no código TCP do kernel Linux que pode ser acionada remotamente e sem autenticação para causar panic do kernel. A falha existe desde 2015 e afeta quase todas as distribuições Linux.",
  date: "16 de Novembro, 2026",
  dateISO: "2026-11-16",
  readTime: "8 min",
  image: "/assets/blog/noisytcp-linux-kernel-tcp-dos-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "Linux",
    "Kernel",
    "TCP",
    "NoisyTCP",
    "CVE-2026-99288",
    "Condição de corrida",
    "Negação de serviço",
    "Inteligência de Ameaças",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "Em 15 de novembro de 2026, após o fim do período de embargo, foi divulgado o alerta sobre a **CVE-2026-99288**, batizada de **NoisyTCP**. É uma condição de corrida no código TCP do kernel Linux que pode ser acionada remotamente e sem autenticação, causando panic do kernel e negação de serviço.",
        },
        {
          type: "p",
          text: "A causa é uma corrida entre contextos de recebimento de pacotes: uma busca obsoleta (stale lookup) encontra um request socket já existente, enquanto outro contexto libera esse registro e reutiliza a mesma memória para uma nova requisição de SYN cookie com a mesma tupla. O primeiro contexto passa nas verificações, mas o novo objeto não tem listener associado, e o kernel tenta ler um listener nulo e entra em panic.",
        },
        {
          type: "p",
          text: "A falha foi introduzida no commit 079096f103fa em 3 de outubro de 2015 e corrigida no commit 4e2b3ef19e0e em 3 de novembro de 2026. Isso significa que quase todas as distribuições Linux carregaram a falha por cerca de 11 anos.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Avaliação CyDef",
            body: "O que torna o NoisyTCP relevante é o pré-requisito mínimo: o servidor só precisa chamar listen() e receber pacotes do atacante. Nada de configuração rara, regra de firewall ou socket especial. Servidores Nginx, Apache e SSH em configuração padrão entram no alvo. E há um agravante operacional: em um serviço executado em contêiner, o panic derruba o host inteiro, não só a aplicação. O alvo natural são servidores Linux expostos à internet, e a resposta correta é atualizar o kernel e reiniciar.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipe CyDef. Aviso de Hyunwoo Kim (@v4bel) no GitHub e no oss-security, e publicação do Cyber Security News verificados em 16 de novembro de 2026.",
        },
      ],
    },
    {
      heading: "Resumo executivo",
      blocks: [
        {
          type: "p",
          text: "O que se sabe até 16 de novembro de 2026, com base no aviso do pesquisador e na publicação analisada:",
        },
        {
          type: "list",
          items: [
            "**CVE:** CVE-2026-99288 (NoisyTCP), no código TCP do kernel Linux.",
            "**Tipo:** condição de corrida entre contextos de recebimento de pacotes.",
            "**Resultado:** panic do kernel e negação de serviço remota, sem autenticação.",
            "**Introdução:** commit 079096f103fa (3 de outubro de 2015).",
            "**Correção:** commit 4e2b3ef19e0e (3 de novembro de 2026).",
            "**Pré-requisito:** servidor com duas ou mais filas de recebimento, ou com RPS habilitado.",
            "**Não é RCE:** a publicação não apresenta a falha como execução remota de código.",
            "**Alvo:** servidores Linux com listeners TCP acessíveis, como Nginx, Apache, SSH e proxy.",
          ],
        },
      ],
    },
    {
      heading: "Produtos e ambientes afetados",
      blocks: [
        {
          type: "p",
          text: "O problema afeta o kernel Linux em si, então o alcance é definido pelo ambiente, e não por um produto de aplicação específico.",
        },
        {
          type: "list",
          items: [
            "**Kernel Linux:** versões que incluem o commit 079096f103fa (2015-2026), até a correção 4e2b3ef19e0e.",
            "**Servidores** com duas ou mais filas de recebimento de pacotes, ou com RPS habilitado.",
            "**Listeners TCP** acessíveis por pacotes do atacante: Nginx, Apache, SSH e proxy em configuração padrão.",
          ],
        },
        {
          type: "p",
          text: "A condição de corrida é mais fácil de acionar em ambientes virtualizados. Nos testes do pesquisador, em máquinas virtuais QEMU/KVM o gatilho levou de 5 segundos a 2 minutos, enquanto em um servidor bare-metal silencioso com 8 filas de recebimento levou cerca de 14 horas, mesmo com uma prova de conceito ajustada para o ambiente.",
        },
      ],
    },
    {
      heading: "Como o ataque funciona",
      blocks: [
        {
          type: "p",
          text: "O atacante envia fragmentos IPv4 e pacotes TCP normais que caem em CPUs diferentes, explorando a diferença de hash de recebimento. Isso cria a condição de corrida em que duas partes do kernel tocam a mesma memória no mesmo instante.",
        },
        {
          type: "list",
          items: [
            "**Caminho 1 (request_sock reuse ABA race):** a busca obsoleta adquire refcount no novo objeto e passa na rechecagem de tupla, mas o novo request socket não tem listener; o caminho de recebimento desreferencia um listener nulo e causa panic. Resultado: negação de serviço remota.",
            "**Caminho 2 (full child socket ABA race):** pode causar use-after-free remoto, mas exige múltiplas corridas encadeadas em sequência e é muito mais difícil de acionar.",
          ],
        },
        {
          type: "p",
          text: "O pesquisador informa que, até o momento, só construiu um exploit limitado e específico para servidores virtuais, e que continua pesquisando um exploit de uso geral. A negação de serviço remota, porém, é alcançável sem grande dificuldade.",
        },
      ],
    },
    {
      heading: "Impacto potencial",
      blocks: [
        {
          type: "list",
          items: [
            "**Panic do kernel** e negação de serviço remota, sem autenticação.",
            "**Indisponibilidade do host inteiro**, inclusive quando o serviço afetado está em contêiner.",
            "**Possível use-after-free remoto** no segundo caminho de acionamento, de difícil exploração.",
            "**Alcance amplo:** quase todas as distribuições Linux, por cerca de 11 anos.",
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
            "**Instalar** kernels atualizados com a correção 4e2b3ef19e0e, a partir dos fornecedores das distribuições.",
            "**Reiniciar** os sistemas após a atualização do kernel.",
            "**Priorizar** servidores públicos que executam listeners TCP.",
            "**Inventariar** contêineres e namespaces de rede separados que usam kernels afetados.",
            "**Monitorar** servidores em busca de reinicializações sem explicação.",
            "**Testar** as atualizações de kernel antes da implantação em produção.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Quando a atualização não puder ser aplicada de imediato",
            body: "Duas mitigações temporárias: desabilitar SYN cookies com `sudo sysctl -w net.ipv4.tcp_syncookies=0` (por namespace de rede, o que reduz a proteção contra SYN floods), ou reduzir as filas de recebimento da interface de entrada para uma única fila e desabilitar RPS e RFS. Ambas bloqueiam a corrida, mas têm custo próprio e devem ser revertidas após o patch.",
          },
        },
      ],
    },
    {
      heading: "O que ainda não sabemos / limites deste artigo",
      blocks: [
        {
          type: "p",
          text: "Este artigo foi elaborado a partir do aviso do pesquisador Hyunwoo Kim (@v4bel) no GitHub e no oss-security, e da publicação do Cyber Security News, com verificação em 16 de novembro de 2026. Não há telemetria própria da CyDef sobre esta vulnerabilidade e nenhuma exploração observada internamente.",
        },
        {
          type: "p",
          text: "A falha não é apresentada como execução remota de código, e o pesquisador informa que ainda não há exploit de uso geral. O caminho de use-after-free remoto é descrito como difícil de acionar. A janela de corrida é estreita, e em servidores bare-metal silenciosos o gatilho pode levar muitas horas. Este texto será atualizado quando houver informação nova verificável.",
        },
      ],
    },
    {
      heading: "Próximos passos",
      blocks: [
        {
          type: "list",
          items: [
            "Verificar as versões de kernel dos servidores Linux do ambiente.",
            "Aplicar os kernels corrigidos dos fornecedores das distribuições e reiniciar.",
            "Priorizar servidores públicos com listeners TCP.",
            "Inventariar contêineres e namespaces de rede separados.",
            "Monitorar reinicializações sem explicação enquanto a atualização não estiver completa.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "GitHub: V4bel/NoisyTCP — Linux Kernel TCP Pre-auth Remote Corruption (CVE-2026-99288)",
      url: "https://github.com/V4bel/NoisyTCP",
    },
    {
      label:
        "oss-security: NoisyTCP — Linux Kernel TCP Pre-auth Remote Corruption (CVE-2026-99288)",
      url: "https://www.openwall.com/lists/oss-security/2026/11/15/2",
    },
    {
      label:
        "Cyber Security News: NoisyTCP — 11-Year-Old Linux Kernel Flaw Lets Unauthenticated Attackers Crash Servers Remotely",
      url: "https://cybersecuritynews.com/noisytcp-linux-kernel-vulnerability/",
    },
  ],
  changelog: [
    "2026-11-16: primeira versão, baseada no aviso de Hyunwoo Kim (@v4bel) e na publicação do Cyber Security News, verificados nesta data.",
  ],
};
