import type { BlogPost } from "./posts";

/**
 * Fortinet: falhas críticas no FortiManager e FortiAnalyzer permitem execução
 * de código sem autenticação (novembro de 2026, PT). Conteúdo elaborado a partir
 * dos avisos do FortiGuard Labs (FG-IR-26-219, FG-IR-26-275, FG-IR-26-276 e
 * FG-IR-26-274) e da publicação do Cyber Security News, verificados em
 * 11 de novembro de 2026. Capa:
 * public/assets/blog/fortinet-fortimanager-fortianalyzer-rce-thumb.webp
 */
export const fortinetRcePost: BlogPost = {
  slug: "fortinet-fortimanager-fortianalyzer-rce-cve-2026-126170",
  title:
    "Fortinet corrige falhas críticas no FortiManager e FortiAnalyzer com execução de código sem autenticação",
  category: "Inteligência de Ameaças",
  excerpt:
    "A Fortinet divulgou em 10 de novembro de 2026 falhas críticas em FortiManager, FortiAnalyzer e produtos relacionados, incluindo a CVE-2026-126170 (CVSS 9,8), que permite execução de código ou comandos sem autenticação quando a API JSON está habilitada.",
  date: "11 de Novembro, 2026",
  dateISO: "2026-11-11",
  readTime: "9 min",
  image: "/assets/blog/fortinet-fortimanager-fortianalyzer-rce-thumb.webp",
  author: "Equipe CyDef",
  tags: [
    "Fortinet",
    "FortiManager",
    "FortiAnalyzer",
    "CVE-2026-126170",
    "Execução remota de código",
    "Injeção de JSON",
    "Injeção SQL",
    "SSRF",
    "Inteligência de Ameaças",
  ],
  toc: true,
  sections: [
    {
      blocks: [
        {
          type: "p",
          text: "A Fortinet divulgou em 10 de novembro de 2026 um conjunto de falhas críticas em produtos de gerenciamento e análise de segurança, com destaque para o **FortiManager** e o **FortiAnalyzer**. A mais grave, **CVE-2026-126170**, recebeu pontuação base **CVSS 9,8** e permite que um atacante não autenticado execute código ou comandos por meio da API JSON-RPC, quando a API JSON está habilitada.",
        },
        {
          type: "p",
          text: "O lote não se resume a uma falha: ele combina quatro vulnerabilidades críticas com causas distintas, injeção de JSON na API JSON-RPC, falha de autorização no serviço FGFM, injeção de SQL e falsificação de solicitação pelo servidor (SSRF) no serviço OFTP. Cada uma tem vetor e pré-requisitos próprios, o que faz a exposição depender de quais funcionalidades e portas estão habilitadas em cada ambiente.",
        },
        {
          type: "p",
          text: "Um ponto central para a avaliação de risco: a API JSON da CVE-2026-126170 vem **desabilitada por padrão**. O risco real se concentra em ambientes que a habilitaram para automação. Já as falhas de FGFM e OFTP expõem os serviços de comunicação dos próprios dispositivos, que não são protegidos pelas restrições de login do painel.",
        },
        {
          type: "callout",
          callout: {
            kind: "ponto",
            title: "Avaliação CyDef",
            body: "O que torna este lote relevante é o alvo: FortiManager e FortiAnalyzer são o centro de gerenciamento de muitos ambientes Fortinet. Comprometer o gerenciador costuma abrir caminho para os dispositivos que ele administra. A resposta correta combina duas camadas: atualizar para as versões corrigidas e, onde a atualização ainda não cabe, desativar a API JSON e restringir o acesso de rede às portas FGFM (TCP 541) e OFTP (TCP 514), que não são protegidas pela restrição de login da interface web.",
          },
        },
        {
          type: "note",
          text: "Autor: Equipe CyDef. Avisos do FortiGuard Labs (FG-IR-26-219, FG-IR-26-275, FG-IR-26-276, FG-IR-26-274) e publicação do Cyber Security News verificados em 11 de novembro de 2026.",
        },
      ],
    },
    {
      heading: "Resumo executivo",
      blocks: [
        {
          type: "p",
          text: "O que se sabe até 11 de novembro de 2026, com base nos avisos do FortiGuard Labs e na publicação analisada:",
        },
        {
          type: "list",
          items: [
            "**Divulgação:** 10 de novembro de 2026, com atualizações liberadas antes da publicação dos avisos detalhados.",
            "**Falha mais grave:** CVE-2026-126170, injeção de JSON na API JSON-RPC, CVSS 9,8 (FG-IR-26-219).",
            "**Outras falhas críticas:** CVE-2026-126261 (autorização no FGFM, CVSS 9,0), CVE-2026-126262 (injeção SQL via OFTP, CVSS 9,3) e CVE-2026-126260 (SSRF via OFTP, CVSS 9,0).",
            "**Vetores:** API JSON-RPC, serviço FGFM e protocolo OFTP.",
            "**Pré-requisito da mais grave:** API JSON habilitada (desabilitada por padrão).",
            "**Exploração conhecida:** a Fortinet marcou a CVE-2026-126261 como não explorada na data de publicação.",
            "**Alvo:** nenhum tipo específico de organização identificado como principal alvo.",
          ],
        },
      ],
    },
    {
      heading: "As quatro falhas críticas",
      blocks: [
        {
          type: "table",
          table: {
            headers: ["CVE", "CVSS", "Tipo", "Produtos / serviço"],
            rows: [
              ["CVE-2026-126170", "9,8", "Injeção de JSON (CWE-116)", "FortiManager, FortiAnalyzer e variantes, API JSON-RPC (FG-IR-26-219)"],
              ["CVE-2026-126262", "9,3", "Injeção SQL (CWE-89)", "FortiAnalyzer e FortiManager com recursos de FortiAnalyzer, via OFTP (FG-IR-26-276)"],
              ["CVE-2026-126261", "9,0", "Falha de autorização", "FortiManager, serviço FGFM (FG-IR-26-275)"],
              ["CVE-2026-126260", "9,0", "SSRF (CWE-918)", "FortiAnalyzer e FortiManager com recursos de FortiAnalyzer, via OFTP (FG-IR-26-274)"],
            ],
          },
        },
        {
          type: "p",
          text: "As duas falhas de OFTP, CVE-2026-126262 e CVE-2026-126260, não devem ser confundidas. A primeira é injeção de SQL com potencial de execução de código; a segunda é falsificação de solicitação pelo servidor, um vetor diferente. A CVE-2026-126261 ocorre antes da verificação da senha de registro, o que coloca o próprio serviço FGFM na trajetória do ataque.",
        },
      ],
    },
    {
      heading: "CVE-2026-126170: injeção de JSON na API JSON-RPC",
      blocks: [
        {
          type: "p",
          text: "A falha mais grave está na API JSON-RPC usada pelo FortiManager e pelo FortiAnalyzer. Quando a API JSON está habilitada, uma solicitação HTTP especialmente criada pode permitir que um atacante não autenticado execute código ou comandos. O aviso classifica a causa como codificação ou escape inadequado de saída (CWE-116).",
        },
        {
          type: "list",
          title: "Produtos afetados pela CVE-2026-126170",
          items: [
            "**FortiManager 8.0:** 8.0.0 a 8.0.2 · **FortiManager 7.6:** 7.6.0 a 7.6.7.",
            "**FortiAnalyzer 8.0:** 8.0.0 a 8.0.2 · **FortiAnalyzer 7.6:** 7.6.0 a 7.6.7.",
            "**FortiManager Cloud 8.0:** 8.0.1 a 8.0.2 · **FortiManager Cloud 7.6:** 7.6.0 a 7.6.7.",
            "**FortiAnalyzer Cloud 8.0:** 8.0.1 a 8.0.2 · **FortiAnalyzer Cloud 7.6:** 7.6.0 a 7.6.7.",
            "**FortiAnalyzer-BigData 7.6:** 7.6.0 a 7.6.2.",
            "**FortiSASE-Sovereign:** várias versões, com correção dependente do release.",
          ],
        },
        {
          type: "p",
          text: "As ramificações 7.4 e 7.2 do FortiManager e do FortiAnalyzer não são afetadas por esta CVE específica. Isso não dispensa a verificação das outras falhas do lote, que têm tabelas próprias de versões.",
        },
      ],
    },
    {
      heading: "Versões corrigidas por falha",
      blocks: [
        {
          type: "p",
          text: "As correções variam por falha e por ramo do software. A tabela abaixo resume as versões de correção indicadas nos avisos.",
        },
        {
          type: "table",
          table: {
            headers: ["Produto", "CVE-2026-126170", "CVE-2026-126261", "CVE-2026-126262 / CVE-2026-126260"],
            rows: [
              ["FortiManager 8.0", "8.0.3 (futura)", "8.0.1", "8.0.1 (SQLi) / 8.0.1 (SSRF)"],
              ["FortiManager 7.6", "7.6.8", "7.6.8", "7.6.8"],
              ["FortiManager 7.4", "não afetado", "7.4.6", "7.4.12"],
              ["FortiManager 7.2", "não afetado", "7.2.9", "7.2.13 (SQLi) / não afetado (SSRF)"],
              ["FortiAnalyzer 8.0", "8.0.3 (futura)", "não afetado", "8.0.2 (SQLi) / 8.0.1 (SSRF)"],
              ["FortiAnalyzer 7.6", "7.6.8", "não afetado", "7.6.8"],
              ["FortiAnalyzer 7.4", "não afetado", "não afetado", "7.4.12"],
              ["FortiAnalyzer 7.2", "não afetado", "não afetado", "7.2.13 (SQLi) / não afetado (SSRF)"],
            ],
          },
        },
        {
          type: "p",
          text: "Um ponto de atenção no ramo 8.0: para a CVE-2026-126170, a versão 8.0.3 foi listada como futura no aviso, o que significa que ainda não estava disponível na data de publicação. Nesse caso, o caminho imediato é a mitigação, desativar a API JSON, até que a versão 8.0.3 seja liberada.",
        },
      ],
    },
    {
      heading: "Por que as portas FGFM e OFTP importam",
      blocks: [
        {
          type: "p",
          text: "As falhas de FGFM e OFTP expõem serviços que ficam fora da proteção do login do painel. O FGFM usa a porta TCP 541 e é o serviço pelo qual os dispositivos se registram e se comunicam com o FortiManager. O OFTP usa a porta TCP 514 e trata da transferência de logs.",
        },
        {
          type: "p",
          text: "Restringir o login administrativo pela interface web não protege essas portas. Um atacante que alcance a porta FGFM pode enviar pacotes criados para explorar a CVE-2026-126261 antes mesmo da verificação da senha de registro. Da mesma forma, quem alcança a porta OFTP pode explorar as falhas de injeção SQL e de SSRF. É por isso que a contenção de rede entra na resposta com o mesmo peso da atualização.",
        },
      ],
    },
    {
      heading: "Recomendações de mitigação",
      blocks: [
        {
          type: "list",
          items: [
            "**Inventariar** os produtos Fortinet do ambiente, com versão, ramo e funcionalidades habilitadas.",
            "**Aplicar** a versão corrigida correspondente a cada produto e falha, conforme a tabela de versões.",
            "**Desativar** a API JSON quando não for necessária, configurando rpc-permit como none nos perfis de administrador.",
            "**Restringir** o acesso de rede às portas FGFM (TCP 541) e OFTP (TCP 514), permitindo apenas as conexões necessárias.",
            "**Fazer backup** das configurações dos dispositivos antes de aplicar as atualizações.",
            "**Monitorar** alterações não autorizadas nos dispositivos gerenciados e nos próprios gerenciadores.",
            "**Revisar** os avisos oficiais da Fortinet para confirmar a correção aplicável a cada falha.",
          ],
        },
        {
          type: "callout",
          callout: {
            kind: "regra",
            title: "Atualização ou contenção de rede",
            body: "Quando a atualização não puder ser aplicada de imediato, a mitigação é desativar a API JSON nos perfis de administrador (set rpc-permit none) e restringir o acesso de rede aos serviços vulneráveis, permitindo apenas as conexões necessárias.",
          },
        },
      ],
    },
    {
      heading: "O que ainda não sabemos / limites deste artigo",
      blocks: [
        {
          type: "p",
          text: "Este artigo foi elaborado a partir dos avisos do FortiGuard Labs e da publicação do Cyber Security News, com verificação em 11 de novembro de 2026. Não há telemetria própria da CyDef sobre estas vulnerabilidades e nenhuma exploração observada internamente.",
        },
        {
          type: "p",
          text: "A Fortinet marcou a CVE-2026-126261 como não explorada na data de publicação, e não identificou um tipo específico de organização como principal alvo. O lote de novembro também inclui falhas de roteamento e de controle de acesso no FortiOS que este artigo não detalha, por serem de outra classe. Este texto será atualizado quando houver informação nova verificável.",
        },
      ],
    },
    {
      heading: "Próximos passos",
      blocks: [
        {
          type: "list",
          items: [
            "Levantar os produtos Fortinet do ambiente, priorizando FortiManager, FortiAnalyzer e suas variantes em nuvem.",
            "Verificar se a API JSON está habilitada e desativá-la onde não for necessária.",
            "Planejar a aplicação das versões corrigidas, com atenção ao ramo 8.0, em que a 8.0.3 ainda estava listada como futura.",
            "Restringir o acesso de rede às portas FGFM e OFTP enquanto as atualizações não estiverem aplicadas.",
          ],
        },
      ],
    },
  ],
  sources: [
    {
      label:
        "FortiGuard Labs: JSON Injection in JRPC API (FG-IR-26-219, CVE-2026-126170)",
      url: "https://fortiguard.fortinet.com/psirt/FG-IR-26-219",
    },
    {
      label:
        "FortiGuard Labs: Improper authorization in FortiManager FGFM (FG-IR-26-275, CVE-2026-126261)",
      url: "https://fortiguard.fortinet.com/psirt/FG-IR-26-275",
    },
    {
      label:
        "FortiGuard Labs: SQL injection via OFTP (FG-IR-26-276, CVE-2026-126262)",
      url: "https://fortiguard.fortinet.com/psirt/FG-IR-26-276",
    },
    {
      label:
        "FortiGuard Labs: SSRF via OFTP (FG-IR-26-274, CVE-2026-126260)",
      url: "https://fortiguard.fortinet.com/psirt/FG-IR-26-274",
    },
    {
      label:
        "Cyber Security News: Critical Fortinet Flaws Expose FortiManager and FortiAnalyzer to Remote Code Execution Without Login",
      url: "https://cybersecuritynews.com/critical-fortinet-flaws-patched/",
    },
  ],
  changelog: [
    "2026-11-11: primeira versão, baseada nos avisos do FortiGuard Labs e na publicação do Cyber Security News, verificados nesta data.",
  ],
};
