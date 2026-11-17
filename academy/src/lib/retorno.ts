/**
 * Lê o fragmento (#) com que o link de acesso volta, ANTES de o cliente do
 * Supabase limpá-lo, para saber se o link chegou expirado ou já usado.
 */
export type RetornoLink = { tipo: "sessao" } | { tipo: "erro"; codigo: string } | { tipo: "nenhum" };

export function lerRetorno(hash: string): RetornoLink {
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!h) return { tipo: "nenhum" };
  const p = new URLSearchParams(h);
  const erro = p.get("error_code") ?? p.get("error");
  if (erro) return { tipo: "erro", codigo: erro.slice(0, 40).replace(/[^a-z_]/gi, "") };
  if (p.get("access_token")) return { tipo: "sessao" };
  return { tipo: "nenhum" };
}

let inicial: RetornoLink = { tipo: "nenhum" };

export function guardarRetornoInicial(hash: string) {
  inicial = lerRetorno(hash);
}

export function retornoInicial(): RetornoLink {
  return inicial;
}
