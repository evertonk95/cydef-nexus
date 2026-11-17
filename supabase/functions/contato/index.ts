/**
 * POST /contato — Contato comercial do site CyDef (formulário + bot de triagem).
 *
 * Edge Function (Deno/Supabase). Contrato:
 *   request:  { nome, cargo, empresa, email, mensagem, aceito, triagem,
 *               honeypot, tempo_ms, turnstile_token, request_id }
 *   response: 202 { status:"recebido" }       (também honeypot/bot rápido/duplicado: resposta idêntica)
 *             400 { erro:"payload_invalido" | "email_nao_aceito" | "links_demais" }
 *             403 { erro:"origem_nao_permitida" | "verificacao_falhou" }
 *             405 · 413 · 415
 *             429 { erro:"muitas_tentativas" }
 *             503 { erro:"servico_indisponivel" | "capacidade" }   (fail closed)
 *
 * Camadas, na ordem em que barram:
 *   1. CORS + Origin allowlist (preflight e POST)
 *   2. Content-Type, Content-Length e corpo máximo antes do parse
 *   3. honeypot e tempo mínimo de preenchimento (descarte silencioso)
 *   4. Cloudflare Turnstile verificado no servidor (hostname + action)
 *   5. validação estrita dos campos e da triagem (listas fechadas)
 *   6. rate limit por IP, por e-mail, disjuntor global e dedupe (RPC no banco)
 *   7. e-mail interno com conteúdo escapado e links neutralizados
 * Sem reflexão de entrada nas respostas; logs sem nome, e-mail ou mensagem.
 */

import {
  validarContato,
  validarRequestIdContato,
  tempoPreenchimentoValido,
  LIMITES_CONTATO,
  type ContatoValidado,
} from "../../../src/lib/contato/validate.ts";
import { calcularPrioridade, type Prioridade } from "../../../src/lib/contato/triagem.ts";
import {
  montarEmailInterno,
  resendTransportInterno,
  type EmailInterno,
} from "../../../src/lib/contato/email.ts";
import { turnstileVerificador, type TurnstileVerificador } from "../../../src/lib/contato/turnstile.ts";
import { hmacHex } from "../../../src/lib/contato/hash.ts";
import { honeypotPreenchido } from "../../../src/lib/academy/validate.ts";
import { getEnv, json, ipDoRequest, novoRequestId } from "../_shared/edge.ts";

export type RegistroStatus = "accepted" | "accepted_duplicate" | "retry" | "rate_limited" | "capacidade";

export interface ContatoStorage {
  registrar(args: {
    requestId: string;
    ipHash: string;
    emailHash: string;
    conteudoHash: string;
    motivo: string;
    prioridade: Prioridade;
  }): Promise<{ ok: true; status: RegistroStatus } | { ok: false; razao: string }>;
  marcar(args: { requestId: string; status: "enviado" | "falha_envio" }): Promise<void>;
}

export interface ContatoEmail {
  enviar(mail: EmailInterno): Promise<{ enviado: boolean }>;
}

export interface ContatoDeps {
  storage: ContatoStorage;
  email: ContatoEmail;
  turnstile: TurnstileVerificador;
  /** Origens permitidas (ex.: https://www.cydef.com.br). */
  origens: readonly string[];
  /** Pepper dos HMACs. Ausente = fail closed. */
  pepper: string | undefined;
  /** Destinatário interno (time de especialistas). */
  destino: string | undefined;
  emailHabilitado: boolean;
  agora?: () => Date;
  log?: (evento: Record<string, unknown>) => void;
  novoRequestId?: () => string;
}

const RESPOSTA_OK = { status: "recebido" } as const;

function cors(origem: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origem,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

export function createContatoHandler(deps: ContatoDeps) {
  const log = deps.log ?? (() => undefined);
  const rid = deps.novoRequestId ?? novoRequestId;
  const agora = deps.agora ?? (() => new Date());

  return async (req: Request): Promise<Response> => {
    const evento = rid();
    const origem = req.headers.get("origin") ?? "";
    const origemOk = deps.origens.includes(origem);
    const h = origemOk ? cors(origem) : { Vary: "Origin" };

    if (req.method === "OPTIONS") {
      return origemOk ? new Response(null, { status: 204, headers: h }) : json({ erro: "origem_nao_permitida" }, 403, h);
    }
    if (req.method !== "POST") return json({ erro: "metodo_nao_permitido" }, 405, h);
    if (!origemOk) {
      log({ event: "contato_origem_bloqueada", evento });
      return json({ erro: "origem_nao_permitida" }, 403, h);
    }

    // Fail closed: sem pepper, sem destino ou envio desligado, nada é processado.
    if (!deps.pepper || deps.pepper.length < 32 || !deps.destino || !deps.emailHabilitado) {
      log({ event: "contato_config_incompleta", evento });
      return json({ erro: "servico_indisponivel" }, 503, h);
    }

    const ct = (req.headers.get("content-type") ?? "").toLowerCase();
    if (!ct.startsWith("application/json")) return json({ erro: "content_type_invalido" }, 415, h);

    const declarado = Number(req.headers.get("content-length") ?? "0");
    if (declarado > LIMITES_CONTATO.corpoMaxBytes) return json({ erro: "corpo_muito_grande" }, 413, h);
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > LIMITES_CONTATO.corpoMaxBytes) {
      return json({ erro: "corpo_muito_grande" }, 413, h);
    }

    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("x");
      body = parsed as Record<string, unknown>;
    } catch {
      return json({ erro: "payload_invalido" }, 400, h);
    }

    // Camada 3: armadilhas para robôs simples. Resposta idêntica ao sucesso.
    if (honeypotPreenchido(body.honeypot)) {
      log({ event: "contato_honeypot", evento });
      return json(RESPOSTA_OK, 202, h);
    }
    if (!tempoPreenchimentoValido(body.tempo_ms)) {
      log({ event: "contato_tempo_suspeito", evento });
      return json(RESPOSTA_OK, 202, h);
    }
    if (!validarRequestIdContato(body.request_id)) return json({ erro: "payload_invalido" }, 400, h);
    const requestId = body.request_id;

    // Camada 4: Turnstile no servidor.
    const ip = ipDoRequest(req);
    const token = typeof body.turnstile_token === "string" ? body.turnstile_token : "";
    const humano = await deps.turnstile.verificar({ token, ip, idempotencyKey: requestId });
    if (!humano.ok) {
      log({ event: "contato_turnstile_reprovado", evento, razao: humano.razao });
      return json({ erro: "verificacao_falhou" }, 403, h);
    }

    // Camada 5: validação estrita.
    const v = validarContato(body);
    if (v.ok === false) {
      log({ event: "contato_rejeitado", evento, razao: v.razao });
      const erro =
        v.razao === "email_descartavel" ? "email_nao_aceito" : v.razao === "spam_links" ? "links_demais" : "payload_invalido";
      return json({ erro }, 400, h);
    }
    const contato: ContatoValidado = v.data;
    const prioridade = calcularPrioridade(contato.triagem);

    // Camada 6: rate limit, disjuntor e dedupe no banco (só hashes).
    const [ipHash, emailHash, conteudoHash] = await Promise.all([
      hmacHex(deps.pepper, `ip:${ip}`),
      hmacHex(deps.pepper, `email:${contato.email}`),
      hmacHex(deps.pepper, `conteudo:${contato.email}\n${contato.mensagem.toLowerCase()}`),
    ]);
    const reg = await deps.storage.registrar({
      requestId,
      ipHash,
      emailHash,
      conteudoHash,
      motivo: contato.triagem.motivo,
      prioridade,
    });
    if (reg.ok === false) {
      log({ event: "contato_erro_storage", evento, razao: reg.razao });
      return json({ erro: "servico_indisponivel" }, 503, h);
    }
    if (reg.status === "rate_limited") {
      log({ event: "contato_rate_limited", evento });
      return json({ erro: "muitas_tentativas" }, 429, h);
    }
    if (reg.status === "capacidade") {
      log({ event: "contato_disjuntor_global", evento });
      return json({ erro: "capacidade" }, 503, h);
    }
    if (reg.status === "accepted_duplicate") {
      log({ event: "contato_duplicado", evento });
      return json(RESPOSTA_OK, 202, h);
    }

    // Camada 7: e-mail interno.
    const mail = montarEmailInterno({
      to: deps.destino,
      contato,
      prioridade,
      requestId,
      recebidoEm: agora().toISOString(),
    });
    const envio = await deps.email.enviar(mail);
    await deps.storage.marcar({ requestId, status: envio.enviado ? "enviado" : "falha_envio" });
    if (!envio.enviado) {
      log({ event: "contato_email_falha", evento, prioridade });
      return json({ erro: "servico_indisponivel" }, 503, h);
    }

    log({ event: "contato_aceito", evento, prioridade, motivo: contato.triagem.motivo });
    return json(RESPOSTA_OK, 202, h);
  };
}

// ---------------------------------------------------------------------------
// Wiring de produção (Supabase Edge Runtime)
// ---------------------------------------------------------------------------

async function chamarRpc(fn: string, params: Record<string, unknown>): Promise<{ ok: true; data: unknown } | { ok: false; razao: string }> {
  const url = getEnv("SUPABASE_URL") ?? "";
  const key = getEnv("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) return { ok: false, razao: "env_incompleto" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) return { ok: false, razao: `http_${res.status}` };
    return { ok: true, data: await res.json() };
  } catch (err) {
    return { ok: false, razao: err instanceof Error ? err.name : "unknown" };
  } finally {
    clearTimeout(timer);
  }
}

const STATUS_VALIDOS: readonly RegistroStatus[] = ["accepted", "accepted_duplicate", "retry", "rate_limited", "capacidade"];

function storageSupabase(): ContatoStorage {
  return {
    async registrar(a) {
      const r = await chamarRpc("registrar_contato", {
        p_request_id: a.requestId,
        p_ip_hash: a.ipHash,
        p_email_hash: a.emailHash,
        p_conteudo_hash: a.conteudoHash,
        p_motivo: a.motivo,
        p_prioridade: a.prioridade,
      });
      if (r.ok === false) return r;
      const status = (r.data as { status?: string } | null)?.status as RegistroStatus | undefined;
      return status && STATUS_VALIDOS.includes(status) ? { ok: true, status } : { ok: false, razao: "resposta_inesperada" };
    },
    async marcar(a) {
      await chamarRpc("marcar_contato", { p_request_id: a.requestId, p_status: a.status });
    },
  };
}

function lista(v: string | undefined): string[] {
  return (v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function handler(req: Request): Promise<Response> {
  const origens = lista(getEnv("CONTACT_ALLOWED_ORIGINS") ?? "https://www.cydef.com.br,https://cydef.com.br");
  const hostnames = origens.map((o) => {
    try {
      return new URL(o).hostname;
    } catch {
      return "";
    }
  }).filter(Boolean);
  const apiKey = getEnv("RESEND_API_KEY") ?? "";
  const from = getEnv("CONTACT_FROM") ?? "Site CyDef <site@cydef.com.br>";
  const transport = resendTransportInterno(apiKey, from);
  return createContatoHandler({
    storage: storageSupabase(),
    email: {
      async enviar(mail) {
        if (!apiKey) return { enviado: false };
        const r = await transport.send(mail);
        return { enviado: r.ok };
      },
    },
    turnstile: turnstileVerificador({ secret: getEnv("TURNSTILE_SECRET_KEY") ?? "", hostnamesPermitidos: hostnames }),
    origens,
    pepper: getEnv("CONTACT_HASH_PEPPER"),
    destino: getEnv("CONTACT_TO"),
    emailHabilitado: getEnv("CONTACT_EMAIL_ENABLED") === "true",
    log: (e) => console.log(JSON.stringify(e)),
  })(req);
}

if (typeof Deno !== "undefined") {
  Deno.serve(handler);
}
