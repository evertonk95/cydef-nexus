/**
 * POST /functions/v1/academy-acesso - pedido do link de acesso ao portal da
 * CyDef Academy (academy.cydef.com.br).
 *
 * Corpo: { email, turnstile_token, request_id }
 *
 * Camadas, em ordem (fail closed em todas):
 *   1. Origem permitida (CORS) e configuração completa.
 *   2. JSON com até 2 KB e e-mail válido.
 *   3. Cloudflare Turnstile verificado no servidor (hostname + action).
 *   4. Limite de tentativas por IP e por e-mail (chaves com HMAC, nunca em claro).
 *   5. Elegibilidade no banco: aluno existente, pré-inscrição ativa com
 *      consentimento, acesso pago ativo no e-mail (compra na Hotmart, 0021)
 *      ou convite de empresa (0024). Quem não é elegível recebe a MESMA resposta 202, no mesmo
 *      tempo mínimo, para não revelar quem é aluno.
 *   6. Cria o usuário de login (se faltar), o registro de aluno e envia o
 *      link de uso único. Com o Resend ligado, o e-mail sai com o modelo da
 *      CyDef; sem ele, o Supabase envia com o modelo configurado no painel.
 *
 * O endereço de retorno do link é fixo no servidor (ACADEMY_URL): o cliente
 * não escolhe para onde o link leva.
 *
 * Logs: só evento, request_id e motivo. Nunca e-mail, IP, token ou link.
 */

import { getEnv, json, ipDoRequest, novoRequestId } from "../_shared/edge.ts";
import { verificadorTurnstile, type Verificador } from "./turnstile.ts";
import {
  carteiroResend,
  chaveLimiteEmail,
  entregarLink,
  hmac,
  LIMITE_POR_EMAIL,
  REMETENTE_PADRAO,
  servidorSupabase,
  VALIDADE_LINK_MIN,
  type Carteiro,
  type Servidor,
} from "../_shared/academy-link.ts";

export {
  carteiroResend,
  hmac,
  linkDoPortal,
  servidorSupabase,
  type Carteiro,
  type Elegibilidade,
  type Servidor,
} from "../_shared/academy-link.ts";

export const LIMITES_ACESSO = {
  corpoMaxBytes: 2048,
  emailMax: 254,
  porIp: { limite: 10, janelaSeg: 900 },
  porEmail: LIMITE_POR_EMAIL,
  respostaMinimaMs: 900,
  validadeLinkMin: VALIDADE_LINK_MIN,
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REQUEST_ID = /^[A-Za-z0-9-]{8,64}$/;

export interface AcessoDeps {
  servidor: Servidor;
  turnstile: Verificador;
  /** Envio pelo Resend; ausente = o Supabase envia o link. */
  carteiro?: Carteiro;
  origens: readonly string[];
  /** Endereço do portal (destino fixo do link). */
  academyUrl: string;
  /** Segredo dos HMACs das chaves de limite (32+ caracteres). */
  pepper: string | undefined;
  log?: (evento: Record<string, unknown>) => void;
  novoRequestId?: () => string;
  esperar?: (ms: number) => Promise<void>;
  agora?: () => number;
}

function cors(origem: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origem,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

export function createAcessoHandler(deps: AcessoDeps) {
  const log = deps.log ?? (() => undefined);
  const rid = deps.novoRequestId ?? novoRequestId;
  const esperar = deps.esperar ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const agora = deps.agora ?? (() => Date.now());

  return async (req: Request): Promise<Response> => {
    const inicio = agora();
    const evento = rid();
    const origem = req.headers.get("origin") ?? "";
    const origemOk = deps.origens.includes(origem);
    const h = origemOk ? cors(origem) : { Vary: "Origin" };

    // Resposta neutra: mesmo status, mesmo corpo e tempo mínimo para todos os desfechos
    // que dependem de quem é o dono do e-mail.
    const neutra = async () => {
      const resta = LIMITES_ACESSO.respostaMinimaMs - (agora() - inicio);
      if (resta > 0) await esperar(resta);
      return json({ status: "enviado_se_inscrito" }, 202, h);
    };

    if (req.method === "OPTIONS") {
      return origemOk ? new Response(null, { status: 204, headers: h }) : json({ erro: "origem_nao_permitida" }, 403, h);
    }
    if (req.method !== "POST") return json({ erro: "metodo_nao_permitido" }, 405, h);
    if (!origemOk) {
      log({ event: "acesso_origem_bloqueada", evento });
      return json({ erro: "origem_nao_permitida" }, 403, h);
    }
    if (!deps.pepper || deps.pepper.length < 32 || !/^https:\/\//.test(deps.academyUrl)) {
      log({ event: "acesso_config_incompleta", evento });
      return json({ erro: "servico_indisponivel" }, 503, h);
    }

    const ct = (req.headers.get("content-type") ?? "").toLowerCase();
    if (!ct.startsWith("application/json")) return json({ erro: "content_type_invalido" }, 415, h);
    if (Number(req.headers.get("content-length") ?? "0") > LIMITES_ACESSO.corpoMaxBytes) {
      return json({ erro: "corpo_muito_grande" }, 413, h);
    }
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > LIMITES_ACESSO.corpoMaxBytes) {
      return json({ erro: "corpo_muito_grande" }, 413, h);
    }
    let body: Record<string, unknown>;
    try {
      const p: unknown = JSON.parse(raw);
      if (typeof p !== "object" || p === null || Array.isArray(p)) throw new Error("x");
      body = p as Record<string, unknown>;
    } catch {
      return json({ erro: "payload_invalido" }, 400, h);
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const token = typeof body.turnstile_token === "string" ? body.turnstile_token : "";
    const requestId = typeof body.request_id === "string" ? body.request_id : "";
    if (!email || email.length > LIMITES_ACESSO.emailMax || !EMAIL.test(email) || /[\r\n]/.test(email)) {
      return json({ erro: "email_invalido" }, 400, h);
    }
    if (!REQUEST_ID.test(requestId)) return json({ erro: "payload_invalido" }, 400, h);


    const ip = ipDoRequest(req);
    const humano = await deps.turnstile.verificar({ token, ip, idempotencyKey: requestId });
    if (!humano.ok) {
      log({ event: "acesso_turnstile_reprovado", evento, razao: humano.razao });
      return json({ erro: "verificacao_falhou" }, 403, h);
    }

    try {
      const [chaveIp, chaveEmail] = await Promise.all([
        hmac(deps.pepper, `ip:${ip}`),
        chaveLimiteEmail(deps.pepper, email),
      ]);
      const [ipOk, emailOk] = await Promise.all([
        deps.servidor.limite(`ip:${chaveIp}`, LIMITES_ACESSO.porIp.limite, LIMITES_ACESSO.porIp.janelaSeg),
        deps.servidor.limite(chaveEmail, LIMITES_ACESSO.porEmail.limite, LIMITES_ACESSO.porEmail.janelaSeg),
      ]);
      if (!ipOk || !emailOk) {
        log({ event: "acesso_limite", evento, por: !ipOk ? "ip" : "email" });
        return json({ erro: "muitas_tentativas" }, 429, h);
      }

      const el = await deps.servidor.elegibilidade(email);
      if (!el.elegivel) {
        log({ event: "acesso_nao_elegivel", evento });
        return await neutra();
      }
      // Daqui em diante o e-mail é elegível: qualquer falha também responde
      // de forma neutra, para o resultado não revelar quem é aluno.
      try {
        await entregarLink({ servidor: deps.servidor, carteiro: deps.carteiro, academyUrl: deps.academyUrl, log }, email, el, evento);
      } catch (err) {
        log({ event: "acesso_entrega_falhou", evento, razao: err instanceof Error ? err.message.slice(0, 60) : "desconhecido" });
      }
      return await neutra();
    } catch (err) {
      log({ event: "acesso_erro", evento, razao: err instanceof Error ? err.message.slice(0, 60) : "desconhecido" });
      return json({ erro: "servico_indisponivel" }, 503, h);
    }
  };
}

function lista(v: string | undefined): string[] {
  return (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

export default async function handler(req: Request): Promise<Response> {
  const origens = lista(getEnv("ACADEMY_ALLOWED_ORIGINS") ?? "https://academy.cydef.com.br");
  const hostnames = origens.map((o) => {
    try {
      return new URL(o).hostname;
    } catch {
      return "";
    }
  }).filter(Boolean);
  const apiKey = getEnv("RESEND_API_KEY") ?? "";
  const emailLigado = getEnv("ACADEMY_EMAIL_ENABLED") === "true" && apiKey.length > 0;
  return createAcessoHandler({
    servidor: servidorSupabase(getEnv("SUPABASE_URL") ?? "", getEnv("SUPABASE_SERVICE_ROLE_KEY") ?? ""),
    turnstile: verificadorTurnstile({ secret: getEnv("TURNSTILE_SECRET_KEY") ?? "", hostnamesPermitidos: hostnames }),
    carteiro: emailLigado ? carteiroResend(apiKey, getEnv("ACADEMY_EMAIL_FROM") ?? REMETENTE_PADRAO) : undefined,
    origens,
    academyUrl: getEnv("ACADEMY_URL") ?? "https://academy.cydef.com.br",
    pepper: getEnv("ACADEMY_HASH_PEPPER"),
    log: (e) => console.log(JSON.stringify(e)),
  })(req);
}

if (typeof Deno !== "undefined") {
  Deno.serve(handler);
}
