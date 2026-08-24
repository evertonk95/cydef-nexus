/**
 * GET /api/confirmacao?token=â€¦ â€” verificaÃ§Ã£o do token de confirmaÃ§Ã£o (S-05).
 *
 * HEL-M02/M05:
 * - TTL 48h (fixado); token de uso Ãºnico (hash SHA-256 armazenado);
 * - TODOS os desfechos (vÃ¡lido/invÃ¡lido/expirado/reutilizado) â†’ MESMO 302 para
 *   a pÃ¡gina neutra `/academy/status-confirmacao` SEM query string;
 * - header `Referrer-Policy: no-referrer` + `Cache-Control: no-store` no 302;
 * - token FORA de logs (nunca loga req.url/query; loga evento + resultado);
 * - rate limit: 5/h por token e 10/15min por IP (429 â€” sem informaÃ§Ã£o de estado);
 * - 20 falhas no mesmo token â†’ token invalidado (RPC, HEL-M05).
 *
 * DependÃªncias injetÃ¡veis (testes): storage (RPC confirmar_token).
 */

import { hashToken } from "../../../src/lib/academy/token.ts";
import { getEnv, json, hashIp, ipDoRequest, novoRequestId } from "../_shared/edge.ts";

const STATUS_CONFIRMATION_PATH = "/academy/status-confirmacao";

export interface ConfirmacaoStorage {
  confirmarToken(args: { tokenHash: string; ipHash: string }): Promise<
    | { ok: true; resultado: "ok" | "invalido" }
    | { ok: false; razao: "rate_limited" | string }
  >;
}

export interface ConfirmacaoDeps {
  storage: ConfirmacaoStorage;
  hashIp?: (ip: string) => Promise<string>;
  agora?: () => number;
  log?: (evento: Record<string, unknown>) => void;
  novoRequestId?: () => string;
  /** Path da pÃ¡gina neutra (configurÃ¡vel p/ teste). */
  statusPath?: string;
  /** Base da URL final (usado apenas para montar Location em testes; em produÃ§Ã£o vem do SPA). */
  appBaseUrl?: () => string;
}

const LIMITES = { tokenMax: 256 } as const;

export function createConfirmacaoHandler(deps: ConfirmacaoDeps) {
  const log = deps.log ?? (() => undefined);
  const rid = deps.novoRequestId ?? novoRequestId;
  const statusPath = deps.statusPath ?? STATUS_CONFIRMATION_PATH;

  return async (req: Request): Promise<Response> => {
    const requestId = rid();

    if (req.method !== "GET") {
      return json({ erro: "metodo_nao_permitido" }, 405);
    }

    const url = new URL(req.url);
    const token = url.searchParams.get("token") ?? "";

    // Token ausente/malformado â†’ mesmo 302 (sem oracle).
    if (token.length === 0 || token.length > LIMITES.tokenMax) {
      log({ event: "confirmacao_checada", request_id: requestId, resultado: "invalido" });
      return redirecionar(statusPath);
    }

    const ipHash = deps.hashIp
      ? await deps.hashIp(ipDoRequest(req))
      : await hashIp(ipDoRequest(req));

    let tokenHash: string;
    try {
      tokenHash = await hashToken(token);
    } catch {
      log({ event: "confirmacao_checada", request_id: requestId, resultado: "invalido" });
      return redirecionar(statusPath);
    }

    const res = await deps.storage.confirmarToken({ tokenHash, ipHash });
    if (res.ok === false) {
      if (res.razao === "rate_limited") {
        // Rate limit nÃ£o revela estado do token (M05): 429 genÃ©rico.
        log({ event: "confirmacao_rate_limited", request_id: requestId });
        return json({ erro: "muitas_tentativas" }, 429);
      }
      log({ event: "confirmacao_erro_storage", request_id: requestId, razao: res.razao });
      // Fail closed: qualquer erro de storage â†’ desfecho neutro (mesmo 302).
      return redirecionar(statusPath);
    }

    log({
      event: "confirmacao_checada",
      request_id: requestId,
      resultado: res.resultado, // "ok" | "invalido" â€” sem token, sem e-mail
    });

    // TODOS os desfechos â†’ mesmo 302 para pÃ¡gina neutra (sem query string).
    return redirecionar(statusPath);
  };
}

function redirecionar(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      // HEL-M02: impede vazamento do token via Referer no salto.
      "Referrer-Policy": "no-referrer",
      // Token pode estar na URL de origem â€” evita cache por proxies.
      "Cache-Control": "no-store",
    },
  });
}

// ---------------------------------------------------------------------------
// Wiring de produÃ§Ã£o (Supabase Edge Runtime)
// ---------------------------------------------------------------------------

export function criarStorageSupabase(): ConfirmacaoStorage {
  const supabaseUrl = getEnv("SUPABASE_URL") ?? "";
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return {
    async confirmarToken(args) {
      if (!supabaseUrl || !serviceKey) {
        return { ok: false, razao: "env_incompleto" };
      }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/rpc/confirmar_token`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
            apikey: serviceKey,
          },
          body: JSON.stringify({
            p_token_hash: args.tokenHash,
            p_ip_hash: args.ipHash,
          }),
        });
        if (res.status === 429) {
          return { ok: false, razao: "rate_limited" };
        }
        if (res.status === 400) {
          const text = await res.text();
          if (text.includes("rate_limited")) {
            return { ok: false, razao: "rate_limited" };
          }
          return { ok: false, razao: "invalid_payload" };
        }
        if (res.ok === false) {
          return { ok: false, razao: `http_${res.status}` };
        }
        const data = (await res.json()) as { resultado?: string };
        return { ok: true, resultado: data.resultado === "ok" ? "ok" : "invalido" };
      } catch (err) {
        return { ok: false, razao: err instanceof Error ? err.name : "unknown" };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

export default async function handler(req: Request): Promise<Response> {
  return createConfirmacaoHandler({ storage: criarStorageSupabase() })(req);
}

// Supabase Edge Runtime (Deno): vincula o servidor HTTP.
// Guard `typeof Deno` mantém os testes em Node/vitest funcionando.
if (typeof Deno !== "undefined") {
  Deno.serve(handler);
}
