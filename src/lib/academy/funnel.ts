/**
 * Funil de pré-inscrição (REQ-004, SEC-008) — métricas sem PII.
 * Fonte primária: lead store (caminho substituto ao analytics — ADRV-07).
 * `expostos` vem dos eventos de analytics (payload sem PII); as demais
 * etapas são contadas por status na base de leads.
 */

export interface LeadLinha {
  status: string;
  perfil?: string;
}

export interface ResultadoFunil {
  expostos: number;
  preinscritos: number;
  confirmados: number;
  taxaPreinscricao: number | null; // preinscritos/expostos (null se expostos = 0)
  taxaConfirmacao: number | null; // confirmados/preinscritos (null se 0)
  porPerfil: Record<string, { preinscritos: number; confirmados: number }>;
}

export function computarFunil(leads: LeadLinha[], expostos: number): ResultadoFunil {
  const preinscritos = leads.length;
  const confirmados = leads.filter((l) => l.status === "confirmed").length;

  const porPerfil: ResultadoFunil["porPerfil"] = {};
  for (const lead of leads) {
    const perfil = lead.perfil ?? "indefinido";
    porPerfil[perfil] ??= { preinscritos: 0, confirmados: 0 };
    porPerfil[perfil].preinscritos += 1;
    if (lead.status === "confirmed") {
      porPerfil[perfil].confirmados += 1;
    }
  }

  return {
    expostos,
    preinscritos,
    confirmados,
    taxaPreinscricao: expostos > 0 ? preinscritos / expostos : null,
    taxaConfirmacao: preinscritos > 0 ? confirmados / preinscritos : null,
    porPerfil,
  };
}
