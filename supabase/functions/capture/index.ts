/**
 * POST /api/capture â€” Capture API da CyDef Academy (S-03..S-05).
 *
 * Edge Function (Deno/Supabase). Contrato (arquitetura v5 corrigida HEL-M01):
 *   request:  { nome, email, perfil, aceito, declaracao_idade, honeypot,
 *               request_id, action?: "capture"|"resend" }
 *             (SEM `consentimento.versao_aviso` â€” servidor carimba a vigente â€” M01)
 *   response: 202 { status:"pending_confirmation", mensagem }  (também p/ duplicado â€” M05)
 *             400 { erro:"payload_invalido" }  (genérico, sem reflexão de entrada)
 *             413 corpo > 4KB (HEL-L04) · 415 Content-Type inválido (HEL-L04)
 *             429 rate limit (HEL-M05) · 503 fail closed (storage/email indisponível)
 *
 * Segurança: validação server-side; honeypot; rate limit; dedupe silencioso;
 * token 256 bits (hash SHA-256 persistido); e-mail com nome sanitizado (L01);
 * logs SEM nome/e-mail/token/URL (M02).
 *
 * Dependências injetáveis (testes): storage (RPCs), email, hashIp, agora, log.
 */

import {
  validarCaptura,
  validarRequestId,
  honeypotPreenchido,
  LIMITES,
} from "../../../src/lib/academy/validate.ts";
import { gerarToken, hashToken, TOKEN_TTL_MS } from "../../../src/lib/academy/token.ts";
import {
  sanitizarNome,
  montarEmailConfirmacao,
  resendTransport,
  devTransport,
  type EmailTransport,
} from "../../../src/lib/academy/email.ts";
import {
  getEnv,
  json,
  hashIp,
  ipDoRequest,
  novoRequestId,
} from "../_shared/edge.ts";

const MSG_GENERICA = "Pré-inscrição recebida. Confirme seu e-mail.";

export type RpcResultado =
  | { ok: true; status: "accepted" | "accepted_duplicate"; leadId?: string; email?: string; nome?: string }
  | { ok: false; razao: string };

export interface CaptureStorage {
  captureLead(args: {
    nome: string;
    email: string;
    perfil: string;
    ipHash: string;
    requestId: string;
    aceito: boolean;
    declaracaoIdade: boolean;
    tokenHash: string;
    tokenExpiraEm: string;
  }): Promise<RpcResultado>;
  reenviarToken(args: {
    requestId: string;
    ipHash: string;
    tokenHash: string;
    tokenExpiraEm: string;
  }): Promise<RpcResultado>;
}

export interface EmailServico {
  enviarConfirmacao(input: { to: string; nome: string; link: string }): Promise<{ enviado: boolean }>;
}

export interface CaptureDeps {
  storage: CaptureStorage;
  email: EmailServico;
  hashIp?: (ip: string) => Promise<string>;
  agora?: () => number;
  log?: (evento: Record<string, unknown>) => void;
  novoRequestId?: () => string;
  apiBaseUrl?: () => string;
  emailHabilitado?: () => boolean;
}

export function createCaptureHandler(deps: CaptureDeps) {
  const agora = deps.agora ?? (() => Date.now());
  const log = deps.log ?? (() => undefined);
  const rid = deps.novoRequestId ?? novoRequestId;

  const emailHabilitado = deps.emailHabilitado
    ? deps.emailHabilitado()
    : getEnv("EMAIL_ENABLED") === "true";

  return async (req: Request): Promise<Response> => {
    const requestId = rid();
    if (req.method !== "POST") {
      return json({ erro: "metodo_nao_permitido" }, 405);
    }

    // HEL-L04: Content-Type obrigatório application/json.
    const ct = (req.headers.get("content-type") ?? "").toLowerCase();
    if (!ct.startsWith("application/json")) {
      return json({ erro: "content_type_invalido" }, 415);
    }

    // HEL-L04: corpo â‰¤ 4 KB (fail closed em excesso).
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > LIMITES.corpoMaxBytes) {
      log({ event: "capture_corpo_grande", request_id: requestId });
      return json({ erro: "corpo_muito_grande" }, 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      log({ event: "capture_payload_invalido", request_id: requestId });
      return json({ erro: "payload_invalido" }, 400);
    }
    const r = (body ?? {}) as Record<string, unknown>;

    // Honeypot preenchido â†’ rejeição silenciosa com resposta genérica (SEC-006).
    if (honeypotPreenchido(r.honeypot)) {
      log({ event: "capture_honeypot", request_id: requestId });
      return json({ status: "pending_confirmation", mensagem: MSG_GENERICA }, 202);
    }

    const ipHash = deps.hashIp
      ? await deps.hashIp(ipDoRequest(req))
      : await hashIp(ipDoRequest(req));

    // Ação reenvio (UX "Reenviar e-mail" â€” estado email-failure).
    if (r.action === "resend") {
      if (!validarRequestId(r.request_id)) {
        return json({ erro: "payload_invalido" }, 400);
      }
      const token = await gerarToken();
      const tokenHash = await hashToken(token);
      const expira = new Date(agora() + TOKEN_TTL_MS).toISOString();
      const res = await deps.storage.reenviarToken({
        requestId: r.request_id as string,
        ipHash,
        tokenHash,
        tokenExpiraEm: expira,
      });
      if (res.ok === false) {
        if (res.razao === "rate_limited") {
          return json({ erro: "muitas_tentativas" }, 429);
        }
        log({ event: "reenvio_erro_storage", request_id: requestId, razao: res.razao });
        return json({ erro: "servico_indisponivel" }, 503);
      }
      if (res.status === "accepted" && res.email && res.nome) {
        await enviarConfirmacao(deps, {
          to: res.email,
          nome: res.nome,
          token,
          requestId,
          log,
          emailHabilitado,
        });
      }
      log({ event: "reenvio_aceito", request_id: requestId, status: res.status });
      return json({ status: "pending_confirmation", mensagem: MSG_GENERICA }, 202);
    }

    // Captura: validação server-side (SEC-002/SEC-006).
    const v = validarCaptura(body);
    if (v.ok === false) {
      log({ event: "capture_rejeitada", request_id: requestId, razao: v.razao });
      return json({ erro: "payload_invalido" }, 400);
    }
    if (!validarRequestId(r.request_id)) {
      log({ event: "capture_rejeitada", request_id: requestId, razao: "invalid_payload" });
      return json({ erro: "payload_invalido" }, 400);
    }

    // Token de confirmação: gerado aqui (256 bits), persistido como hash (M02/M05).
    const token = await gerarToken();
    const tokenHash = await hashToken(token);
    const expira = new Date(agora() + TOKEN_TTL_MS).toISOString();

    const res = await deps.storage.captureLead({
      nome: v.data.nome,
      email: v.data.email,
      perfil: v.data.perfil,
      ipHash,
      requestId: r.request_id as string,
      aceito: true,
      declaracaoIdade: true,
      tokenHash,
      tokenExpiraEm: expira,
    });

    if (res.ok === false) {
      if (res.razao === "rate_limited") {
        return json({ erro: "muitas_tentativas" }, 429);
      }
      if (
        res.razao === "sem_consentimento" ||
        res.razao === "sem_declaracao_idade" ||
        res.razao === "invalid_payload"
      ) {
        return json({ erro: "payload_invalido" }, 400);
      }
      log({ event: "capture_erro_storage", request_id: requestId, razao: res.razao });
      return json({ erro: "servico_indisponivel" }, 503); // fail closed (L04)
    }

    await enviarConfirmacao(deps, {
      to: v.data.email,
      nome: v.data.nome,
      token,
      requestId,
      log,
      emailHabilitado,
    });

    log({ event: "capture_aceita", request_id: requestId, status: res.status });
    // Duplicado (M05) â†’ mesma resposta 202 genérica (dedupe silencioso).
    return json({ status: "pending_confirmation", mensagem: MSG_GENERICA }, 202);
  };
}

async function enviarConfirmacao(
  deps: CaptureDeps,
  input: {
    to: string;
    nome: string;
    token: string;
    requestId: string;
    log: (e: Record<string, unknown>) => void;
    emailHabilitado: boolean;
  },
): Promise<void> {
  if (!input.emailHabilitado) {
    // Flag email.enabled=false (default fail secure): lead permanece
    // pending_confirmation + fallback manual Everton (runbook S-08).
    return;
  }
  const apiBase =
    (deps.apiBaseUrl ? deps.apiBaseUrl() : getEnv("API_PUBLIC_BASE_URL")) ??
    `${getEnv("SUPABASE_URL") ?? ""}/functions/v1`;
  const link = `${apiBase}/confirmacao?token=${encodeURIComponent(input.token)}`;
  const result = await deps.email.enviarConfirmacao({
    to: input.to,
    nome: sanitizarNome(input.nome),
    link,
  });
  if (!result.enviado) {
    // Não quebra o fluxo: lead permanece pending + fallback manual (ADRV-08).
    input.log({ event: "email_falha", request_id: input.requestId });
  }
}

// ---------------------------------------------------------------------------
// Wiring de produção (Supabase Edge Runtime)
// ---------------------------------------------------------------------------

function criarStorageSupabase(): CaptureStorage {
  const supabaseUrl = getEnv("SUPABASE_URL") ?? "";
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return {
    async captureLead(args) {
      return chamarRpc(supabaseUrl, serviceKey, "capture_lead", {
        p_nome: args.nome,
        p_email: args.email,
        p_perfil: args.perfil,
        p_ip_hash: args.ipHash,
        p_request_id: args.requestId,
        p_aceito: args.aceito,
        p_declaracao_idade: args.declaracaoIdade,
        p_token_hash: args.tokenHash,
        p_token_expira_em: args.tokenExpiraEm,
      });
    },
    async reenviarToken(args) {
      return chamarRpc(supabaseUrl, serviceKey, "reenviar_token", {
        p_request_id: args.requestId,
        p_ip_hash: args.ipHash,
        p_token_hash: args.tokenHash,
        p_token_expira_em: args.tokenExpiraEm,
      });
    },
  };
}

async function chamarRpc(
  supabaseUrl: string,
  serviceKey: string,
  fn: string,
  params: Record<string, unknown>,
): Promise<RpcResultado> {
  if (!supabaseUrl || !serviceKey) {
    return { ok: false, razao: "env_incompleto" };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000); // fail closed (L04)
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        apikey: serviceKey,
      },
      body: JSON.stringify(params),
    });
    if (res.status === 429 || res.status === 400) {
      const text = await res.text();
      if (text.includes("rate_limited") || res.status === 429) {
        return { ok: false, razao: "rate_limited" };
      }
      if (text.includes("sem_consentimento")) {
        return { ok: false, razao: "sem_consentimento" };
      }
      if (text.includes("sem_declaracao_idade")) {
        return { ok: false, razao: "sem_declaracao_idade" };
      }
      if (text.includes("no_aviso_vigente")) {
        return { ok: false, razao: "no_aviso_vigente" };
      }
      return { ok: false, razao: "invalid_payload" };
    }
    if (res.ok === false) {
      return { ok: false, razao: `http_${res.status}` };
    }
    const data = (await res.json()) as { status?: string; lead_id?: string; email?: string; nome?: string };
    return {
      ok: true,
      status: data.status === "accepted_duplicate" ? "accepted_duplicate" : "accepted",
      leadId: data.lead_id,
      email: data.email,
      nome: data.nome,
    };
  } catch (err) {
    return { ok: false, razao: err instanceof Error ? err.name : "unknown" };
  } finally {
    clearTimeout(timer);
  }
}

function criarEmailServico(): EmailServico {
  const apiKey = getEnv("RESEND_API_KEY");
  const from = getEnv("RESEND_FROM") ?? "Academy CyDef <academy@cydef.com.br>";
  const transport: EmailTransport = apiKey
    ? resendTransport(apiKey, from)
    : devTransport();
  return {
    async enviarConfirmacao(input) {
      const mail = montarEmailConfirmacao(input);
      const r = await transport.send(mail);
      return { enviado: r.ok };
    },
  };
}

// Handler de produção (Supabase Edge Runtime): injeta deps reais.
export default async function handler(req: Request): Promise<Response> {
  return createCaptureHandler({
    storage: criarStorageSupabase(),
    email: criarEmailServico(),
  })(req);
}

// Supabase Edge Runtime (Deno): vincula o servidor HTTP.
// Guard `typeof Deno` mantém os testes em Node/vitest funcionando.
if (typeof Deno !== "undefined") {
  Deno.serve(handler);
}
