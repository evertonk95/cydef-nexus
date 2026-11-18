/**
 * Lê como o link de acesso chegou, ANTES de o cliente do Supabase mexer na URL.
 *
 * Formato atual: o e-mail aponta para o próprio portal,
 * `/entrar/retorno?token_hash=...&type=email`. O token só é trocado por sessão
 * quando o aluno clica em "Entrar" na página de retorno, para que verificadores
 * automáticos de e-mail (que abrem links para inspecionar) não gastem o link
 * de uso único antes da pessoa.
 *
 * Formato antigo (links já enviados): o link passava pelo Supabase e voltava
 * com os tokens no fragmento (#access_token=... ou #error_code=...).
 */
export type TipoOtp = "email" | "magiclink";

export type RetornoLink =
  | { tipo: "token"; tokenHash: string; tipoOtp: TipoOtp }
  | { tipo: "sessao" }
  | { tipo: "erro"; codigo: string }
  | { tipo: "nenhum" };

const TOKEN_HASH = /^[A-Za-z0-9_-]{16,256}$/;
const TIPOS: readonly TipoOtp[] = ["email", "magiclink"];

export function lerRetorno(hash: string, busca = ""): RetornoLink {
  const q = new URLSearchParams(busca.startsWith("?") ? busca.slice(1) : busca);
  const tokenHash = q.get("token_hash");
  if (tokenHash !== null) {
    const tipo = (q.get("type") ?? "email") as TipoOtp;
    if (!TOKEN_HASH.test(tokenHash) || !TIPOS.includes(tipo)) return { tipo: "erro", codigo: "link_malformado" };
    return { tipo: "token", tokenHash, tipoOtp: tipo };
  }
  const h = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!h) return { tipo: "nenhum" };
  const p = new URLSearchParams(h);
  const erro = p.get("error_code") ?? p.get("error");
  if (erro) return { tipo: "erro", codigo: erro.slice(0, 40).replace(/[^a-z_]/gi, "") };
  if (p.get("access_token")) return { tipo: "sessao" };
  return { tipo: "nenhum" };
}

let inicial: RetornoLink = { tipo: "nenhum" };

/**
 * Guarda o retorno e, quando o link traz o token na query, tira o token da
 * barra de endereço e do histórico. Ele fica só na memória até o clique; se a
 * página for recarregada antes, o mesmo link do e-mail continua valendo.
 */
export function guardarRetornoInicial(local: Pick<Location, "hash" | "search" | "pathname">, historico?: Pick<History, "replaceState">) {
  inicial = lerRetorno(local.hash, local.search);
  if (inicial.tipo === "token" || new URLSearchParams(local.search).has("token_hash")) {
    historico?.replaceState(null, "", local.pathname);
  }
}

export function retornoInicial(): RetornoLink {
  return inicial;
}
