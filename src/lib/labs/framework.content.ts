import type { Lang } from "@/i18n";

/**
 * CyDef SIEM Health and Maturity Assessment Framework — conteúdo da página
 * (módulo PESADO, lazy: só carregado na rota /labs/siem-health-maturity-framework).
 * PT-first (Fase 4–5, 04/09/2026): conteúdo nasce em PT; EN/ES na Fase 10.
 *
 * Fonte: whitepaper técnico versionado no repo público
 * evertonk95/cydef-siem-health-maturity-framework (docs/whitepaper.md),
 * derivado de assessments reais anonimizados. Nada aqui é inventado.
 */
export interface FrameworkPhase {
  n: string;
  title: string;
  desc: string;
}

export interface FrameworkContent {
  langs: Lang[];
  badge: string;
  /** Badge de estado (catálogo Labs: "Público"). */
  stateBadge: string;
  h1: string;
  sub: string;
  lead: string;
  ideaTitle: string;
  ideaBody: string;
  whatTitle: string;
  whatBody: string;
  phasesTitle: string;
  phasesLead: string;
  phases: FrameworkPhase[];
  implTitle: string;
  implBody: string;
  implCurrentTitle: string;
  implCurrentBody: string;
  implPlannedTitle: string;
  implPlannedBody: string;
  resourcesTitle: string;
  resourcesBody: string;
  resources: { label: string; desc: string; href: string; external?: boolean }[];
  notTitle: string;
  notBody: string;
  updated: string;
}

export const frameworkContent: FrameworkContent = {
  langs: ["pt"],
  badge: "CyDef Labs",
  stateBadge: "Público",
  h1: "CyDef SIEM Health and Maturity Assessment Framework",
  sub: "Avaliar, estabilizar e amadurecer um SIEM que já está em produção",
  lead: "Um framework prático para quem entra no ambiente depois que o carro já está andando: medir o caminho do evento entre a fonte e o analista, provar drops e lacunas de cobertura e evoluir o SIEM sem transformar produção em laboratório.",
  ideaTitle: "Ideia central",
  ideaBody: "Um SIEM pode estar verde no dashboard, com serviços ativos e agentes conectados, e ainda assim perder eventos, concentrar carga em um único nó, indexar ruído demais, operar com inventário obsoleto e oferecer menos cobertura de detecção do que parece. O assessment serve para provar o que acontece entre a fonte e o analista, antes de começar a mexer.",
  whatTitle: "O que é",
  whatBody: "Um framework de avaliação em fases para SIEMs que já estão em produção. Cada fase tem objetivo, perguntas, evidências, comandos, critérios de decisão e entregáveis. O resultado não é uma coleção de prints: é um AS IS técnico, uma análise de gaps, uma visão de maturidade, um desenho TO BE e um roadmap que permite evoluir sem transformar a produção em laboratório.",
  phasesTitle: "As 14 fases",
  phasesLead: "A sequência começa pela infraestrutura, atravessa o pipeline de dados, chega à qualidade de detecção e termina em governança e evolução contínua.",
  phases: [
    { n: "0", title: "Preparação, escopo e evidência", desc: "Define o que o assessment precisa responder, a janela de observação e o que não coletar (segredos nunca entram)." },
    { n: "1", title: "Inventário técnico e arquitetura real", desc: "O AS IS provado: papel de cada nó, versões, capacidade, relógios, manutenção pendente e interfaces." },
    { n: "2", title: "Cluster de Managers e carga", desc: "Sincronização e distribuição avaliadas separadamente: cluster não significa carga distribuída." },
    { n: "3", title: "Ingestão, filas e drops", desc: "remoted e analysisd com contadores, breakdown por categoria e o caso especial de Syslog." },
    { n: "4", title: "Agents, client_buffer e lifecycle", desc: "Grupos, antiflooding (regras 202–205), episódios de saturação e higiene do inventário." },
    { n: "5", title: "Cobertura de fontes e telemetria", desc: "Matriz de Log Source Coverage: não basta estar integrado, o dado precisa ter valor e dono." },
    { n: "6", title: "Transporte, Indexer e Dashboard", desc: "Filebeat, saúde do Indexer, heap/swap e a pergunta real de quorum e HA." },
    { n: "7", title: "Controles funcionais do Wazuh", desc: "Cada módulo classificado como inexistente, default, customizado, validado ou monitorado." },
    { n: "8", title: "Rules, decoders e detecção", desc: "Inventário de regras, catálogo de casos de uso e a pergunta: o que este SIEM foi desenhado para detectar?" },
    { n: "9", title: "Qualidade de alertas e operação do SOC", desc: "Volume, repetição, falsos positivos, playbooks, MTTA/MTTR e contexto do alerta." },
    { n: "10", title: "Segurança do próprio SIEM", desc: "O SIEM é ativo crítico: hardening, segredos, RBAC e listeners estritamente necessários." },
    { n: "11", title: "Backup, DR e resiliência", desc: "RTO e RPO definidos, restauração testada e comportamento dos agentes durante indisponibilidade." },
    { n: "12", title: "Capacity planning e self monitoring", desc: "O SIEM precisa monitorar o SIEM: drops, buffers, cluster, disco e certificados." },
    { n: "13", title: "Evidência em maturidade e ação", desc: "Gap register, priorização P0–P3, score de maturidade 0–4 e roadmap por ondas." },
  ],
  implTitle: "Implementações",
  implBody: "O framework é multi-plataforma. A implementação Wazuh é a primeira e está publicada; as demais entram quando existirem de verdade, sem data prometida.",
  implCurrentTitle: "Wazuh (implementação nº 1)",
  implCurrentBody: "Guia completo de assessment e maturidade para ambientes Wazuh em produção, com comandos, tabelas, estudo de caso anonimizado, playbook de coleta rápida e checklist final.",
  implPlannedTitle: "Futuras",
  implPlannedBody: "Sentinel, Splunk, Elastic, QRadar e Google SecOps estão no desenho do framework. Serão publicadas quando o conteúdo existir.",
  resourcesTitle: "Onde está o conteúdo",
  resourcesBody: "O framework é aberto: o whitepaper técnico é versionado no repositório público, e o artigo de leitura está no blog.",
  resources: [
    { label: "Whitepaper técnico (PT)", desc: "Documento completo, anonimizado, em markdown no repositório.", href: "https://github.com/evertonk95/cydef-siem-health-maturity-framework/blob/main/docs/whitepaper.md", external: true },
    { label: "Repositório GitHub", desc: "Código, checklists e referência do framework. Licença Apache-2.0.", href: "https://github.com/evertonk95/cydef-siem-health-maturity-framework", external: true },
    { label: "Leia o artigo no blog", desc: "Wazuh em Movimento: a versão editorial do framework.", href: "/blog/wazuh-em-movimento" },
  ],
  notTitle: "O que ele não é",
  notBody: "Não é um serviço que a CyDef vende hoje, não é uma ferramenta SaaS e não promete datas para outras plataformas. É uma metodologia aberta, publicada com repositório, licença e documentação.",
  updated: "Status atualizado: setembro de 2026",
};

/** Conteúdo do artefato por idioma (PT-first; outras línguas retornam undefined → 404). */
export const getFrameworkContent = (lang: Lang): FrameworkContent | undefined =>
  frameworkContent.langs.includes(lang) ? frameworkContent : undefined;
