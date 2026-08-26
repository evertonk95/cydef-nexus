/**
 * Validação server-side da captura de pré-inscrição (SEC-002/SEC-006).
 * Módulo puro compartilhado: usado pela Edge Function (autoridade) e pelo
 * cliente apenas como conveniência de UX — o servidor é a fronteira de confiança.
 */

export const PERFIS = ["iniciante", "transicao", "profissional", "estudante", "outro"] as const;
export type Perfil = (typeof PERFIS)[number];

export const LIMITES = {
  nomeMin: 2,
  nomeMax: 80,
  emailMax: 254,
  /** HEL-L04: corpo máximo do POST (limite de proteção, não de UX). */
  corpoMaxBytes: 4096,
  requestIdMax: 64,
  tokenMax: 256,
} as const;

export interface CapturaValidada {
  nome: string;
  email: string;
  perfil: Perfil;
}

export type CapturaRejeicao =
  | "invalid_payload"
  | "sem_consentimento"
  | "sem_declaracao_idade";

export type ValidacaoCaptura =
  | { ok: true; data: CapturaValidada }
  | { ok: false; razao: CapturaRejeicao };

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Validação conservadora de formato (a autoridade final é o servidor). */
export function validarEmail(email: string): boolean {
  const e = normalizarEmail(email);
  if (e.length === 0 || e.length > LIMITES.emailMax) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

export function validarNome(nome: string): boolean {
  const n = nome.trim();
  return n.length >= LIMITES.nomeMin && n.length <= LIMITES.nomeMax;
}

export function validarPerfil(perfil: unknown): perfil is Perfil {
  return typeof perfil === "string" && (PERFIS as readonly string[]).includes(perfil);
}

/**
 * Valida o payload do contrato POST /api/capture.
 * HEL-M01: o contrato NÃO aceita versão do aviso — o servidor carimba a vigente.
 * SEC-001/SEC-002: opt-in explícito e declaração de 16+ obrigatórios (server-side).
 */
export function validarCaptura(input: unknown): ValidacaoCaptura {
  if (typeof input !== "object" || input === null) {
    return { ok: false, razao: "invalid_payload" };
  }
  const r = input as Record<string, unknown>;
  if (typeof r.nome !== "string" || !validarNome(r.nome)) {
    return { ok: false, razao: "invalid_payload" };
  }
  if (typeof r.email !== "string" || !validarEmail(r.email)) {
    return { ok: false, razao: "invalid_payload" };
  }
  if (!validarPerfil(r.perfil)) {
    return { ok: false, razao: "invalid_payload" };
  }
  if (r.aceito !== true) {
    return { ok: false, razao: "sem_consentimento" };
  }
  if (r.declaracao_idade !== true) {
    return { ok: false, razao: "sem_declaracao_idade" };
  }
  return {
    ok: true,
    data: {
      nome: r.nome.trim(),
      email: normalizarEmail(r.email),
      perfil: r.perfil,
    },
  };
}

export function validarRequestId(requestId: unknown): boolean {
  return (
    typeof requestId === "string" &&
    requestId.length > 0 &&
    requestId.length <= LIMITES.requestIdMax
  );
}

/** Formato esperado do honeypot (campo oculto que bot preenche; humano deixa vazio). */
export function honeypotPreenchido(honeypot: unknown): boolean {
  return typeof honeypot === "string" && honeypot.length > 0;
}
