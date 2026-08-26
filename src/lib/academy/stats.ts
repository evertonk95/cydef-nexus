/**
 * Stats públicos da CyDef Academy (home do portal) — contagem agregada, sem PII.
 *
 * Fonte: RPC `contagem_alunos()` no Supabase (migration 0005), que retorna
 * apenas contagens — nenhuma linha individual, nenhum dado pessoal (SEC-008).
 * A leitura usa a chave anon (pública por design); a RPC é `security definer`
 * e as tabelas seguem RLS deny-by-default (HEL-M03).
 */

import {
  isAcademyStatsEnabled,
  supabaseAnonKey,
  supabaseUrl,
} from "@/lib/config";

export interface AcademyStats {
  /** Leads com status `confirmed` (confirmação de e-mail) — "alunos matriculados". */
  matriculados: number;
  /** Todos os cadastros recebidos (inclui pendentes/invalidados). */
  preinscritos: number;
}

/** Intervalo de atualização automática do número na home (ms). */
export const STATS_POLL_INTERVAL_MS = 60_000;

/** Stats configurados e disponíveis no build atual. */
export function isAcademyStatsAvailable(): boolean {
  return isAcademyStatsEnabled() && Boolean(supabaseUrl()) && Boolean(supabaseAnonKey());
}

/** Busca a contagem real de alunos na RPC pública do Supabase. */
export async function fetchAcademyStats(): Promise<AcademyStats> {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) {
    throw new Error("stats: Supabase não configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)");
  }

  const res = await fetch(`${url}/rest/v1/rpc/contagem_alunos`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  if (!res.ok) {
    throw new Error(`stats: HTTP ${res.status} ao consultar contagem_alunos`);
  }

  const data = (await res.json()) as Partial<AcademyStats>;
  return {
    matriculados: Number(data.matriculados ?? 0),
    preinscritos: Number(data.preinscritos ?? 0),
  };
}
