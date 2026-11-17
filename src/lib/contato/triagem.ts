/**
 * Triagem do contato comercial (bot guiado + classificação).
 *
 * Módulo puro compartilhado entre o SPA (bot) e a Edge Function `contato`
 * (autoridade). O bot é uma árvore de decisão FECHADA: o visitante só escolhe
 * opções, nunca digita texto livre para o bot. Isso elimina prompt injection,
 * custo de LLM e qualquer resposta inventada. O servidor revalida cada
 * resposta contra estas listas e recalcula a prioridade (o cliente nunca
 * informa prioridade).
 */

export const MOTIVOS = [
  "incidente",
  "consultoria",
  "inora",
  "parceria",
  "academy",
  "pessoal",
  "vaga",
] as const;
export type Motivo = (typeof MOTIVOS)[number];

/** Motivos que encerram no bot (orientação) e NÃO abrem formulário. */
export const MOTIVOS_SEM_FORMULARIO = ["academy", "pessoal", "vaga"] as const satisfies readonly Motivo[];

export const URGENCIAS = ["ativo_agora", "contido", "suspeita"] as const;
export type Urgencia = (typeof URGENCIAS)[number];

export const AREAS = [
  "soc_siem",
  "resposta_incidentes",
  "vulnerabilidades",
  "governanca",
  "treinamento_ia",
  "outra",
] as const;
export type Area = (typeof AREAS)[number];

export const PORTES = ["ate_50", "51_200", "201_1000", "mais_1000"] as const;
export type Porte = (typeof PORTES)[number];

export const PRAZOS = ["imediato", "ate_3_meses", "planejando"] as const;
export type Prazo = (typeof PRAZOS)[number];

export const INTERESSES_INORA = ["demonstracao", "duvida_tecnica"] as const;
export type InteresseInora = (typeof INTERESSES_INORA)[number];

export interface Triagem {
  motivo: Motivo;
  urgencia?: Urgencia;
  area?: Area;
  porte?: Porte;
  prazo?: Prazo;
  interesse?: InteresseInora;
}

export type Prioridade = "P1" | "P2" | "P3";

/** Campos exigidos por motivo (os demais devem vir ausentes). */
const CAMPOS_POR_MOTIVO: Record<Motivo, ReadonlyArray<keyof Omit<Triagem, "motivo">>> = {
  incidente: ["urgencia", "porte"],
  consultoria: ["area", "porte", "prazo"],
  inora: ["interesse", "porte"],
  parceria: [],
  academy: [],
  pessoal: [],
  vaga: [],
};

const LISTAS: Record<keyof Omit<Triagem, "motivo">, readonly string[]> = {
  urgencia: URGENCIAS,
  area: AREAS,
  porte: PORTES,
  prazo: PRAZOS,
  interesse: INTERESSES_INORA,
};

const inclui = (lista: readonly string[], v: unknown): v is string =>
  typeof v === "string" && lista.includes(v);

export function motivoAbreFormulario(motivo: Motivo): boolean {
  return !(MOTIVOS_SEM_FORMULARIO as readonly string[]).includes(motivo);
}

/**
 * Valida a triagem recebida do cliente: motivo conhecido, que abre formulário,
 * com exatamente os campos exigidos e valores dentro das listas fechadas.
 * Campo extra ou fora da lista = payload inválido (sem tolerância).
 */
export function validarTriagem(input: unknown): Triagem | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return null;
  const r = input as Record<string, unknown>;
  if (!inclui(MOTIVOS, r.motivo)) return null;
  const motivo = r.motivo as Motivo;
  if (!motivoAbreFormulario(motivo)) return null;

  const exigidos = CAMPOS_POR_MOTIVO[motivo];
  const chaves = Object.keys(r).filter((k) => k !== "motivo");
  if (chaves.length !== exigidos.length) return null;

  const out: Triagem = { motivo };
  for (const campo of exigidos) {
    const v = r[campo];
    if (!inclui(LISTAS[campo], v)) return null;
    (out as unknown as Record<string, string>)[campo] = v;
  }
  return out;
}

/**
 * Prioridade calculada SOMENTE no servidor a partir da triagem validada.
 * P1: incidente ativo ou contido recentemente. P2: demanda com prazo
 * imediato, organização acima de 200 pessoas ou suspeita de incidente.
 * P3: o restante (planejamento, dúvidas, parcerias).
 */
export function calcularPrioridade(t: Triagem): Prioridade {
  if (t.motivo === "incidente") {
    return t.urgencia === "suspeita" ? "P2" : "P1";
  }
  if (t.prazo === "imediato") return "P2";
  if (t.porte === "201_1000" || t.porte === "mais_1000") return "P2";
  return "P3";
}

/** Rótulos internos (PT) usados no e-mail para o time de especialistas. */
export const ROTULOS_INTERNOS = {
  motivo: {
    incidente: "Incidente de segurança",
    consultoria: "Consultoria",
    inora: "CyDef Inora",
    parceria: "Parceria ou imprensa",
    academy: "CyDef Academy",
    pessoal: "Demanda pessoal",
    vaga: "Vaga ou currículo",
  },
  urgencia: {
    ativo_agora: "Ativo agora",
    contido: "Contido, precisa de apoio",
    suspeita: "Suspeita, sem confirmação",
  },
  area: {
    soc_siem: "SOC e SIEM",
    resposta_incidentes: "Resposta a incidentes e forense",
    vulnerabilidades: "Gestão de vulnerabilidades e pentest",
    governanca: "Governança, auditoria e compliance",
    treinamento_ia: "Treinamento e uso seguro de IA",
    outra: "Outra",
  },
  porte: {
    ate_50: "Até 50 pessoas",
    "51_200": "51 a 200 pessoas",
    "201_1000": "201 a 1.000 pessoas",
    mais_1000: "Mais de 1.000 pessoas",
  },
  prazo: {
    imediato: "Imediato",
    ate_3_meses: "Até 3 meses",
    planejando: "Planejamento",
  },
  interesse: {
    demonstracao: "Demonstração",
    duvida_tecnica: "Dúvida técnica",
  },
} as const;
