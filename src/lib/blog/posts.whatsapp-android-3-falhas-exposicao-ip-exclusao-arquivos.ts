import type { BlogPost } from "./posts";

/**
 * WhatsApp corrige três falhas no Android: exclusão de arquivos, exposição de IP e Private Processing (PT).
 * Base: aviso de segurança do WhatsApp de novembro de 2026 e reportagem do Cyber Security News.
 * Capa: public/assets/blog/whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos-capa.webp
 */
export const whatsappAndroid3FalhasPost: BlogPost = {
  slug: "whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos",
  title:
    "WhatsApp corrige três falhas no Android, incluindo exposição de IP e exclusão de arquivos locais",
  category: "Inteligência de Ameaças",
  excerpt:
    "O aviso de segurança de novembro de 2026 do WhatsApp descreve três falhas: uma injeção SQL no Android que pode apagar arquivos armazenados pelo aplicativo depois que o destinatário toca em uma mensagem de detalhes de pedido, uma falha que expõe o endereço IP ao exibir mensagens com link de mídia externo em respostas de anúncios Click to WhatsApp e uma validação incompleta dos servidores do Private Processing da Meta AI.",
  date: "23 de Novembro, 2026",
  dateISO: "2026-11-23",
  readTime: "7 min",
  image: "/assets/blog/whatsapp-android-3-falhas-exposicao-ip-exclusao-arquivos-capa.webp",
  author: "Equipe CyDef",
  tags: [
    "WhatsApp",
    "Vulnerabilidades",
    "Injeção SQL",
    "Exposição de Informações",
    "Atualização de Segurança",
    "Inteligência de Ameaças",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "O aviso de segurança de novembro de 2026 do WhatsApp descreve três falhas corrigidas no aplicativo. Uma permite a exclusão de arquivos armazenados localmente pelo WhatsApp no Android depois que o destinatário toca em uma mensagem de detalhes de pedido. Outra expõe o endereço IP do usuário quando o aplicativo exibe uma mensagem com link de mídia externo ligada a respostas de anúncios Click to WhatsApp. A terceira permite que alguém posicionado dentro da infraestrutura da Meta contorne uma verificação de segurança do Private Processing, o serviço de processamento privado da Meta AI.",
        },
        {
          type: "p",
          text: "As falhas são identificadas como CVE-2026-102769, CVE-2026-23871 e CVE-2026-44908. O WhatsApp informou não ter evidências de exploração da falha de exclusão de arquivos. A exposição de IP aparece no aviso como possivelmente abusada em conjunto com mensagens de spam, sem número de usuários afetados divulgado.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Avaliação CyDef",
            body: "Duas das três falhas vivem no aplicativo que a maioria das organizações trata como ferramenta de comunicação informal, fora do inventário de sistemas críticos. A correção chega pela loja de aplicativos, não pelo sistema operacional, e depende de o usuário atualizar. O WhatsApp Business é um aplicativo separado, com versões próprias, e costuma ficar para trás em celulares corporativos justamente por ser instalado uma vez e esquecido.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipe CyDef. Aviso de segurança do WhatsApp e reportagem do Cyber Security News consultados em 23 de Novembro de 2026.",
        },
      ],
    },
    {
      heading: "Resumo executivo",
      blocks: [
        {
          type: "p",
          text: "O que se sabe sobre as três falhas, com base nas fontes consultadas:",
        },
        {
          type: "list",
          items: [
            "**Exclusão de arquivos (CVE-2026-102769):** injeção SQL no WhatsApp para Android anterior à versão 2.26.35.74. Exige que o destinatário toque em uma mensagem de detalhes de pedido e alcança apenas arquivos armazenados localmente pelo aplicativo, não arquivos de todo o dispositivo.",
            "**Exposição de IP (CVE-2026-23871):** afeta WhatsApp e WhatsApp Business para Android anteriores à versão 2.26.17.4. O aplicativo não verificava completamente links de mídia externa em respostas ligadas a anúncios Click to WhatsApp, e um dispositivo podia revelar o próprio endereço IP ao exibir a mensagem no chat.",
            "**Bypass no Private Processing (CVE-2026-44908):** falha na validação da identidade dos servidores usados pelo Private Processing da Meta AI. Exigiria alguém posicionado dentro da infraestrutura da Meta.",
            "**Exploração ativa:** o WhatsApp afirma não ter evidências de exploração da falha de exclusão de arquivos. A exposição de IP foi apontada como possivelmente abusada junto com mensagens de spam.",
            "**Correção disponível:** versões 2.26.35.74 e 2.26.17.4 no Android, 2.26.24.72 no iOS e 2.26.23.72 no Mac, com versões próprias para o WhatsApp Business.",
          ],
        },
        {
          type: "table",
          table: {
            headers: ["Item", "Situação"],
            rows: [
              ["Total de falhas no aviso", "3"],
              ["Falhas no WhatsApp para Android", "2 (exclusão de arquivos e exposição de IP)"],
              ["Falha de validação de servidor", "1 (Private Processing da Meta AI)"],
              ["Ação do usuário exigida", "Nenhuma para a falha de IP; toque para a de arquivos"],
              ["Exploração ativa confirmada", "Não informada"],
              ["Possível abuso", "Exposição de IP junto com mensagens de spam"],
            ],
          },
        },
      ],
    },
    {
      heading: "As três falhas em detalhe",
      blocks: [
        {
          type: "p",
          text: "O aviso não publica o caminho técnico completo de cada correção. O quadro abaixo reúne o que as fontes afirmam sobre requisitos de exploração e alcance:",
        },
        {
          type: "table",
          table: {
            headers: ["CVE", "Componente", "Requisito para explorar", "Impacto descrito", "Versão corrigida"],
            rows: [
              [
                "CVE-2026-102769",
                "WhatsApp para Android",
                "Destinatário tocar em mensagem de detalhes de pedido",
                "Exclusão de arquivos armazenados localmente pelo WhatsApp",
                "2.26.35.74",
              ],
              [
                "CVE-2026-23871",
                "WhatsApp e WhatsApp Business para Android",
                "Mensagem com link de mídia externa exibida no chat",
                "Exposição do endereço IP do dispositivo",
                "2.26.17.4",
              ],
              [
                "CVE-2026-44908",
                "Private Processing da Meta AI",
                "Acesso à infraestrutura da Meta e certificado em registro de terceiros",
                "Bypass da verificação de hardware confiável",
                "Versões específicas por plataforma",
              ],
            ],
          },
        },
        {
          type: "p",
          text: "Na falha de exclusão de arquivos, o aviso limita o dano a arquivos armazenados localmente pelo WhatsApp, e não a arquivos de todo o dispositivo. A mesma falha poderia revelar um bit de informação sobre o banco de dados de conversas do destinatário, caso ele estivesse online quando a mensagem chegasse. É um vazamento limitado, não evidência de que um atacante poderia ler conversas inteiras.",
        },
        {
          type: "p",
          text: "A falha de exposição de IP tem um requisito diferente: o aviso não descreve toque necessário, apenas a exibição da mensagem no chat. Um endereço IP é informação de rede, não o conteúdo de uma conversa. Ainda assim, ele permite localizar a origem da conexão e combinar com outras informações de campanha.",
        },
        {
          type: "p",
          text: "A terceira falha é a mais restrita em alcance. O problema estava na verificação da identidade dos servidores usados pelo Private Processing, que confirma se o servidor roda em hardware confiável. Para explorar, seria preciso que o certificado aparecesse primeiro em um registro de terceiros. Segundo o WhatsApp, todos os certificados publicados correspondiam a hardware confiável, o que sustenta a conclusão de que a falha não foi explorada.",
        },
      ],
    },
    {
      heading: "Exposição de IP e spam: o vetor mais próximo do uso real",
      blocks: [
        {
          type: "p",
          text: "Das três, a falha de IP é a única que o aviso associa a possível abuso. O cenário descrito envolve mensagens de spam que usam respostas ligadas a anúncios Click to WhatsApp para carregar links de mídia externa. O aplicativo não verificava esses links por completo e, ao exibir a mensagem, podia revelar o endereço IP do dispositivo.",
        },
        {
          type: "p",
          text: "Para quem opera canais de atendimento, isso importa por um motivo específico: anúncios Click to WhatsApp são um caminho legítimo e incentivado de contato com clientes. A falha não estava no anúncio, e sim na validação do link de mídia dentro da conversa. Um invasor que controla o conteúdo exibido consegue coletar o IP de quem apenas abriu o chat, sem que a vítima clique em nada.",
        },
        {
          type: "callout",
          callout: {
            kind: "aviso",
            title: "O que o endereço IP permite e o que não permite",
            body: "A exposição de IP não revela o conteúdo das conversas nem dá acesso à conta. Ela entrega informação de rede que pode ser usada para geolocalização aproximada, correlação com outros eventos e preparação de ataques direcionados. O valor ofensivo está na combinação, não no dado isolado.",
          },
        },
        {
          type: "p",
          text: "O aviso não informa quantos usuários podem ter sido afetados nem detalha as campanhas de spam observadas. Também não há confirmação de que o abuso tenha atingido organizações específicas.",
        },
      ],
    },
    {
      heading: "A falha no Private Processing da Meta AI",
      blocks: [
        {
          type: "p",
          text: "O Private Processing é o serviço que processa solicitações da Meta AI preservando o conteúdo das mensagens. Parte da garantia depende de provar que o servidor que executa o processamento roda em hardware confiável, com atestação por certificado.",
        },
        {
          type: "p",
          text: "A falha estava nessa verificação de identidade dos servidores. Alguém posicionado dentro da infraestrutura da Meta poderia contornar a checagem e se passar por um servidor legítimo. O requisito de posição privilegiada reduz bastante o universo de atacantes: não é uma falha que um usuário explora pelo aplicativo.",
        },
        {
          type: "p",
          text: "Ainda assim, o caso é relevante como sinal. Serviços de processamento com garantia de privacidade dependem de cadeia de confiança de hardware e de registro de certificados. Quando um elo dessa cadeia aceita um certificado sem a verificação completa, a promessa de privacidade passa a depender da integridade de terceiros. O WhatsApp afirma que todos os certificados publicados correspondiam a hardware confiável, o que fecha o caso sem evidência de exploração.",
        },
      ],
    },
    {
      heading: "Produtos e versões corrigidas",
      blocks: [
        {
          type: "p",
          text: "As correções chegaram em versões específicas por plataforma. Quem usa mais de um aplicativo precisa conferir cada um separadamente:",
        },
        {
          type: "table",
          table: {
            headers: ["Produto", "Plataforma", "Versão corrigida"],
            rows: [
              ["WhatsApp", "Android", "2.26.35.74 (CVE-2026-102769) e 2.26.17.4 (CVE-2026-23871)"],
              ["WhatsApp", "iOS", "2.26.24.72"],
              ["WhatsApp", "Android (Private Processing)", "2.26.23.74"],
              ["WhatsApp", "Mac", "2.26.23.72"],
              ["WhatsApp Business", "iOS", "2.26.23.72"],
              ["WhatsApp Business", "Android", "2.26.23.70"],
            ],
          },
        },
        {
          type: "p",
          text: "A recomendação oficial é instalar a versão mais recente disponível na loja oficial do dispositivo e verificar o WhatsApp Business separadamente quando os dois aplicativos estão instalados. O aviso do WhatsApp também lembra que as notas de versão publicadas nas lojas podem não listar todas as correções de segurança, o que significa que a ausência de menção a uma CVE não indica que o aplicativo está desatualizado em segurança.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Por que a versão da loja não basta como evidência",
            body: "Atualização automática em segundo plano pode falhar por espaço, bateria ou política do aparelho, e o aplicativo continua na versão anterior sem aviso claro. Em inventário corporativo, o dado que vale é a versão reportada pelo dispositivo, não a versão disponível na loja.",
          },
        },
      ],
    },
    {
      heading: "Recomendações de mitigação",
      blocks: [
        {
          type: "p",
          text: "A correção é oficial e a atualização é simples. O trabalho real está em provar que ela chegou em todos os aparelhos, inclusive nos que ninguém audita:",
        },
        {
          type: "list",
          items: [
            "**Atualizar o WhatsApp pela loja oficial** do dispositivo, conferindo depois a versão instalada nas configurações do aplicativo.",
            "**Verificar o WhatsApp Business separadamente**, porque é um aplicativo distinto, com ciclo e versão próprios.",
            "**Priorizar dispositivos Android** com versões anteriores a 2.26.35.74 e a 2.26.17.4, que concentram as duas falhas de maior exposição.",
            "**Incluir o aplicativo de mensagens no inventário** de software e nas rotinas de atualização, em vez de tratá-lo como ferramenta pessoal.",
            "**Confirmar a versão em aparelhos gerenciados por MDM** quando a política de atualização depende do usuário, já que a loja pode aplicar a atualização sem registro central.",
            "**Orientar usuários a evitar tocar em mensagens suspeitas de detalhes de pedido** enquanto a atualização não estiver confirmada.",
            "**Ter cautela com mensagens que contenham links de mídia externa** associados a anúncios Click to WhatsApp, especialmente em contas usadas para atendimento.",
            "**Acompanhar os avisos de segurança oficiais do WhatsApp**, porque as notas das lojas de aplicativos não listam todas as correções.",
          ],
        },
        {
          type: "p",
          text: "Para quem usa WhatsApp como canal de atendimento, vale separar dois problemas que costumam ser tratados como um só: a atualização do aplicativo e a política de exposição do número corporativo. A primeira é operacional e se resolve com inventário e verificação. A segunda é de arquitetura, e passa por decidir o que o canal pode receber sem virar superfície de coleta de dados de rede.",
        },
      ],
    },
    {
      heading: "O que ainda não se sabe e limites do artigo",
      blocks: [
        {
          type: "p",
          text: "O aviso não publica o detalhamento técnico das três correções, não informa o número de usuários potencialmente afetados pela exposição de IP e não identifica organizações ou setores como alvos. Também não há informação sobre o volume de mensagens usadas nas campanhas de spam citadas.",
        },
        {
          type: "p",
          text: "Este artigo se limita ao que o aviso de segurança do WhatsApp e a reportagem do Cyber Security News afirmam. Não cobre versões futuras do aplicativo, nem substitui a leitura do aviso oficial por quem precisa avaliar exposição específica. A CyDef atualizará a análise caso o WhatsApp ou pesquisadores publiquem novos dados sobre exploração.",
        },
      ],
    },
  ],
  sources: [
    {
      label: "WhatsApp: Security Advisories",
      url: "https://www.whatsapp.com/security/advisories",
    },
    {
      label:
        "Cyber Security News: WhatsApp Android Flaws Could Let Hackers Delete Users' Files and Expose IP Addresses",
      url: "https://cybersecuritynews.com/whatsapp-android-flaws/",
    },
  ],
  changelog: [
    "2026-11-23: primeira versão publicada, baseada no aviso de segurança do WhatsApp e na reportagem do Cyber Security News.",
  ],
};
