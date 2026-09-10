import type { Lang } from "@/i18n";

/**
 * CyDef SIEM Health and Maturity Assessment Framework — conteúdo da página
 * (módulo PESADO, lazy: só carregado na rota /labs/siem-health-maturity-framework).
 * Fase 10 (05/09/2026): conteúdo localizado EN/PT/ES (PT era a única língua
 * desde a Fase 4–5).
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
  badge: string;
  /** Badge de estado (catálogo Labs: "Público"/"Public"). */
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

const resources = [
  {
    label: "Whitepaper técnico (PT)",
    desc: "Documento completo, anonimizado, em markdown no repositório.",
    href: "https://github.com/evertonk95/cydef-siem-health-maturity-framework/blob/main/docs/whitepaper.md",
    external: true,
  },
  {
    label: "Repositório GitHub",
    desc: "Código, checklists e referência do framework. Licença Apache-2.0.",
    href: "https://github.com/evertonk95/cydef-siem-health-maturity-framework",
    external: true,
  },
  {
    label: "Leia o artigo no blog",
    desc: "Wazuh em Movimento: a versão editorial do framework.",
    href: "/blog/wazuh-em-movimento",
  },
];

const phasesPt: FrameworkPhase[] = [
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
];

const phasesEn: FrameworkPhase[] = [
  { n: "0", title: "Preparation, scope and evidence", desc: "Defines what the assessment must answer, the observation window and what not to collect (secrets never go in)." },
  { n: "1", title: "Technical inventory and real architecture", desc: "The proven AS IS: each node's role, versions, capacity, clocks, pending maintenance and interfaces." },
  { n: "2", title: "Manager cluster and load", desc: "Synchronization and distribution assessed separately: a cluster does not mean distributed load." },
  { n: "3", title: "Ingestion, queues and drops", desc: "remoted and analysisd with counters, per-category breakdown and the special Syslog case." },
  { n: "4", title: "Agents, client_buffer and lifecycle", desc: "Groups, antiflooding (rules 202–205), saturation episodes and inventory hygiene." },
  { n: "5", title: "Log source coverage and telemetry", desc: "Log Source Coverage matrix: being integrated is not enough, the data needs value and an owner." },
  { n: "6", title: "Transport, Indexer and Dashboard", desc: "Filebeat, Indexer health, heap/swap and the real question of quorum and HA." },
  { n: "7", title: "Wazuh functional controls", desc: "Each module classified as nonexistent, default, customized, validated or monitored." },
  { n: "8", title: "Rules, decoders and detection", desc: "Rules inventory, use-case catalog and the question: what was this SIEM designed to detect?" },
  { n: "9", title: "Alert quality and SOC operation", desc: "Volume, repetition, false positives, playbooks, MTTA/MTTR and alert context." },
  { n: "10", title: "Security of the SIEM itself", desc: "The SIEM is a critical asset: hardening, secrets, RBAC and strictly necessary listeners." },
  { n: "11", title: "Backup, DR and resilience", desc: "RTO and RPO defined, tested restore and agent behavior during unavailability." },
  { n: "12", title: "Capacity planning and self monitoring", desc: "The SIEM must monitor the SIEM: drops, buffers, cluster, disk and certificates." },
  { n: "13", title: "Evidence into maturity and action", desc: "Gap register, P0–P3 prioritization, 0–4 maturity score and wave-based roadmap." },
];

const phasesEs: FrameworkPhase[] = [
  { n: "0", title: "Preparación, alcance y evidencia", desc: "Define qué debe responder la evaluación, la ventana de observación y qué no recolectar (los secretos nunca entran)." },
  { n: "1", title: "Inventario técnico y arquitectura real", desc: "El AS IS probado: función de cada nodo, versiones, capacidad, relojes, mantenimiento pendiente e interfaces." },
  { n: "2", title: "Cluster de Managers y carga", desc: "Sincronización y distribución evaluadas por separado: cluster no significa carga distribuida." },
  { n: "3", title: "Ingesta, colas y drops", desc: "remoted y analysisd con contadores, desglose por categoría y el caso especial de Syslog." },
  { n: "4", title: "Agents, client_buffer y lifecycle", desc: "Grupos, antiflooding (reglas 202–205), episodios de saturación e higiene del inventario." },
  { n: "5", title: "Cobertura de fuentes y telemetría", desc: "Matriz de Log Source Coverage: no basta estar integrado, el dato necesita valor y dueño." },
  { n: "6", title: "Transporte, Indexer y Dashboard", desc: "Filebeat, salud del Indexer, heap/swap y la pregunta real de quorum y HA." },
  { n: "7", title: "Controles funcionales de Wazuh", desc: "Cada módulo clasificado como inexistente, default, personalizado, validado o monitoreado." },
  { n: "8", title: "Rules, decoders y detección", desc: "Inventario de reglas, catálogo de casos de uso y la pregunta: ¿para qué fue diseñado este SIEM?" },
  { n: "9", title: "Calidad de alertas y operación del SOC", desc: "Volumen, repetición, falsos positivos, playbooks, MTTA/MTTR y contexto de la alerta." },
  { n: "10", title: "Seguridad del propio SIEM", desc: "El SIEM es un activo crítico: hardening, secretos, RBAC y listeners estrictamente necesarios." },
  { n: "11", title: "Backup, DR y resiliencia", desc: "RTO y RPO definidos, restauración probada y comportamiento de los agentes durante la indisponibilidad." },
  { n: "12", title: "Capacity planning y self monitoring", desc: "El SIEM debe monitorear al SIEM: drops, buffers, cluster, disco y certificados." },
  { n: "13", title: "Evidencia en madurez y acción", desc: "Gap register, priorización P0–P3, score de madurez 0–4 y roadmap por oleadas." },
];

const contentByLang: Record<Lang, FrameworkContent> = {
  en: {
    badge: "CyDef Labs",
    stateBadge: "Public",
    h1: "CyDef SIEM Health and Maturity Assessment Framework",
    sub: "Assess, stabilize and mature a SIEM already running in production",
    lead: "A practical framework for those who take over an environment after the car is already moving: measure the event path between source and analyst, prove drops and coverage gaps, and evolve the SIEM without turning production into a lab.",
    ideaTitle: "Core idea",
    ideaBody: "A SIEM can look green on the dashboard, with active services and connected agents, and still drop events, concentrate load on a single node, index mostly noise, run with a stale inventory and deliver less detection coverage than it seems. The assessment exists to prove what happens between the source and the analyst before you start changing things.",
    whatTitle: "What it is",
    whatBody: "A phased assessment framework for SIEMs already in production. Each phase defines objectives, questions, evidence, commands, decision criteria and deliverables. The result is not a collection of screenshots: it is a technical AS IS, a gap analysis, a maturity view, a TO BE design and a roadmap that lets the SIEM evolve without turning production into a lab.",
    phasesTitle: "The 14 phases",
    phasesLead: "The sequence starts at the infrastructure, crosses the data pipeline, reaches detection quality and ends in governance and continuous evolution.",
    phases: phasesEn,
    implTitle: "Implementations",
    implBody: "The framework is multi-platform. The Wazuh implementation is the first and is published; the others go live when they truly exist, with no promised date.",
    implCurrentTitle: "Wazuh (implementation #1)",
    implCurrentBody: "Complete assessment and maturity guide for Wazuh environments in production, with commands, tables, anonymized case study, quick-collection playbook and final checklist.",
    implPlannedTitle: "Planned",
    implPlannedBody: "Sentinel, Splunk, Elastic, QRadar and Google SecOps are part of the framework design. They will be published when the content exists.",
    resourcesTitle: "Where the content lives",
    resourcesBody: "The framework is open: the technical whitepaper is versioned in the public repository, and the reading article is on the blog.",
    resources: [
      {
        label: "Technical whitepaper (PT)",
        desc: "Complete, anonymized document in markdown in the repository.",
        href: "https://github.com/evertonk95/cydef-siem-health-maturity-framework/blob/main/docs/whitepaper.md",
        external: true,
      },
      {
        label: "GitHub repository",
        desc: "Code, checklists and framework reference. Apache-2.0 license.",
        href: "https://github.com/evertonk95/cydef-siem-health-maturity-framework",
        external: true,
      },
      {
        label: "Read the blog article",
        desc: "Wazuh em Movimento: the editorial version of the framework.",
        href: "/blog/wazuh-em-movimento",
      },
    ],
    notTitle: "What it is not",
    notBody: "It is not a service CyDef sells today, it is not a SaaS tool and it promises no dates for other platforms. It is an open methodology, published with repository, license and documentation.",
    updated: "Status updated: September 2026",
  },
  pt: {
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
    phases: phasesPt,
    implTitle: "Implementações",
    implBody: "O framework é multi-plataforma. A implementação Wazuh é a primeira e está publicada; as demais entram quando existirem de verdade, sem data prometida.",
    implCurrentTitle: "Wazuh (implementação nº 1)",
    implCurrentBody: "Guia completo de assessment e maturidade para ambientes Wazuh em produção, com comandos, tabelas, estudo de caso anonimizado, playbook de coleta rápida e checklist final.",
    implPlannedTitle: "Futuras",
    implPlannedBody: "Sentinel, Splunk, Elastic, QRadar e Google SecOps estão no desenho do framework. Serão publicadas quando o conteúdo existir.",
    resourcesTitle: "Onde está o conteúdo",
    resourcesBody: "O framework é aberto: o whitepaper técnico é versionado no repositório público, e o artigo de leitura está no blog.",
    resources,
    notTitle: "O que ele não é",
    notBody: "Não é um serviço que a CyDef vende hoje, não é uma ferramenta SaaS e não promete datas para outras plataformas. É uma metodologia aberta, publicada com repositório, licença e documentação.",
    updated: "Status atualizado: setembro de 2026",
  },
  es: {
    badge: "CyDef Labs",
    stateBadge: "Público",
    h1: "CyDef SIEM Health and Maturity Assessment Framework",
    sub: "Evaluar, estabilizar y madurar un SIEM que ya está en producción",
    lead: "Un framework práctico para quien llega al entorno cuando el auto ya está andando: medir el camino del evento entre la fuente y el analista, probar drops y brechas de cobertura y evolucionar el SIEM sin convertir la producción en laboratorio.",
    ideaTitle: "Idea central",
    ideaBody: "Un SIEM puede verse verde en el dashboard, con servicios activos y agentes conectados, y aun así perder eventos, concentrar la carga en un solo nodo, indexar ruido de más, operar con un inventario obsoleto y ofrecer menos cobertura de detección de lo que parece. La evaluación sirve para probar qué ocurre entre la fuente y el analista, antes de empezar a tocar nada.",
    whatTitle: "Qué es",
    whatBody: "Un framework de evaluación por fases para SIEM que ya están en producción. Cada fase tiene objetivo, preguntas, evidencias, comandos, criterios de decisión y entregables. El resultado no es una colección de capturas: es un AS IS técnico, un análisis de gaps, una visión de madurez, un diseño TO BE y un roadmap que permite evolucionar sin convertir la producción en laboratorio.",
    phasesTitle: "Las 14 fases",
    phasesLead: "La secuencia comienza por la infraestructura, atraviesa el pipeline de datos, llega a la calidad de detección y termina en gobernanza y evolución continua.",
    phases: phasesEs,
    implTitle: "Implementaciones",
    implBody: "El framework es multiplataforma. La implementación Wazuh es la primera y está publicada; las demás entran cuando existan de verdad, sin fecha prometida.",
    implCurrentTitle: "Wazuh (implementación n.º 1)",
    implCurrentBody: "Guía completa de evaluación y madurez para entornos Wazuh en producción, con comandos, tablas, caso de estudio anonimizado, playbook de recolección rápida y checklist final.",
    implPlannedTitle: "Futuras",
    implPlannedBody: "Sentinel, Splunk, Elastic, QRadar y Google SecOps están en el diseño del framework. Se publicarán cuando el contenido exista.",
    resourcesTitle: "Dónde está el contenido",
    resourcesBody: "El framework es abierto: el whitepaper técnico está versionado en el repositorio público, y el artículo de lectura está en el blog.",
    resources: [
      {
        label: "Whitepaper técnico (PT)",
        desc: "Documento completo, anonimizado, en markdown en el repositorio.",
        href: "https://github.com/evertonk95/cydef-siem-health-maturity-framework/blob/main/docs/whitepaper.md",
        external: true,
      },
      {
        label: "Repositorio de GitHub",
        desc: "Código, checklists y referencia del framework. Licencia Apache-2.0.",
        href: "https://github.com/evertonk95/cydef-siem-health-maturity-framework",
        external: true,
      },
      {
        label: "Leer el artículo en el blog",
        desc: "Wazuh em Movimento: la versión editorial del framework.",
        href: "/blog/wazuh-em-movimento",
      },
    ],
    notTitle: "Lo que no es",
    notBody: "No es un servicio que CyDef venda hoy, no es una herramienta SaaS y no promete fechas para otras plataformas. Es una metodología abierta, publicada con repositorio, licencia y documentación.",
    updated: "Estado actualizado: septiembre de 2026",
  },
};

/** Conteúdo do artefato por idioma (Fase 10: EN/PT/ES disponíveis). */
export const getFrameworkContent = (lang: Lang): FrameworkContent | undefined =>
  contentByLang[lang];
