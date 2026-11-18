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
 *   5. Elegibilidade no banco: aluno existente ou pré-inscrição ativa com
 *      consentimento. Quem não é elegível recebe a MESMA resposta 202, no mesmo
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
import { montarEmailAcesso, type EmailAcesso } from "./email.ts";

export const LIMITES_ACESSO = {
  corpoMaxBytes: 2048,
  emailMax: 254,
  porIp: { limite: 10, janelaSeg: 900 },
  porEmail: { limite: 3, janelaSeg: 900 },
  respostaMinimaMs: 900,
  validadeLinkMin: 60,
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REQUEST_ID = /^[A-Za-z0-9-]{8,64}$/;

export interface Elegibilidade {
  elegivel: boolean;
  user_id?: string | null;
  aluno?: boolean;
  lead_id?: string | null;
  nome?: string;
}

/** Operações do servidor de login (Supabase com service_role). */
export interface Servidor {
  limite(chave: string, limite: number, janelaSeg: number): Promise<boolean>;
  elegibilidade(email: string): Promise<Elegibilidade>;
  criarUsuario(email: string, nome: string): Promise<{ ok: true; userId: string } | { ok: false; jaExiste: boolean }>;
  provisionarAluno(userId: string, leadId: string, nome: string): Promise<void>;
  gerarLink(email: string, redirect: string): Promise<string>;
  enviarPeloSupabase(email: string, redirect: string): Promise<void>;
}

export interface Carteiro {
  enviar(mail: EmailAcesso): Promise<boolean>;
}

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

export async function hmac(pepper: string, valor: string): Promise<string> {
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(pepper), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const assinatura = await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(valor));
  return Array.from(new Uint8Array(assinatura)).map((b) => b.toString(16).padStart(2, "0")).join("");
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


    async function entregarLink(email: string, inicial: Elegibilidade, evento: string) {
      let el = inicial;
      let userId = el.user_id ?? null;
      if (!userId) {
        const criado = await deps.servidor.criarUsuario(email, el.nome ?? "");
        if ("userId" in criado) {
          userId = criado.userId;
        } else if ("jaExiste" in criado && criado.jaExiste) {
          el = await deps.servidor.elegibilidade(email);
          userId = el.user_id ?? null;
        }
        if (!userId) throw new Error("usuario_nao_criado");
      }
      if (!el.aluno) {
        if (!el.lead_id) throw new Error("sem_lead");
        await deps.servidor.provisionarAluno(userId, el.lead_id, el.nome ?? "");
      }
      const retorno = `${deps.academyUrl.replace(/\/+$/, "")}/entrar/retorno`;
      if (deps.carteiro) {
        const link = await deps.servidor.gerarLink(email, retorno);
        const enviado = await deps.carteiro.enviar(
          montarEmailAcesso({ to: email, nome: el.nome ?? "", link, validadeMin: LIMITES_ACESSO.validadeLinkMin }),
        );
        if (!enviado) throw new Error("resend_falhou");
        log({ event: "acesso_link_enviado", evento, via: "resend" });
      } else {
        await deps.servidor.enviarPeloSupabase(email, retorno);
        log({ event: "acesso_link_enviado", evento, via: "supabase" });
      }
    }

    const ip = ipDoRequest(req);
    const humano = await deps.turnstile.verificar({ token, ip, idempotencyKey: requestId });
    if (!humano.ok) {
      log({ event: "acesso_turnstile_reprovado", evento, razao: humano.razao });
      return json({ erro: "verificacao_falhou" }, 403, h);
    }

    try {
      const [chaveIp, chaveEmail] = await Promise.all([
        hmac(deps.pepper, `ip:${ip}`),
        hmac(deps.pepper, `email:${email}`),
      ]);
      const [ipOk, emailOk] = await Promise.all([
        deps.servidor.limite(`ip:${chaveIp}`, LIMITES_ACESSO.porIp.limite, LIMITES_ACESSO.porIp.janelaSeg),
        deps.servidor.limite(`em:${chaveEmail}`, LIMITES_ACESSO.porEmail.limite, LIMITES_ACESSO.porEmail.janelaSeg),
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
        await entregarLink(email, el, evento);
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

/**
 * Link do e-mail: aponta para o próprio portal (mesmo domínio do remetente), e
 * o portal troca o token por sessão só quando o aluno clica em "Entrar".
 */
export function linkDoPortal(retorno: string, tokenHash: string): string {
  return `${retorno}?token_hash=${encodeURIComponent(tokenHash)}&type=email`;
}

// ---------------------------------------------------------------------------
// Ligação com o Supabase em produção
// ---------------------------------------------------------------------------

export function servidorSupabase(url: string, serviceKey: string, fetchImpl: typeof fetch = fetch): Servidor {
  const cabecalhos = { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" };
  const chamar = async (caminho: string, corpo: unknown, metodo = "POST"): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      return await fetchImpl(`${url}${caminho}`, { method: metodo, headers: cabecalhos, body: JSON.stringify(corpo), signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };
  const rpc = async <T>(nome: string, args: Record<string, unknown>): Promise<T> => {
    const res = await chamar(`/rest/v1/rpc/${nome}`, args);
    if (!res.ok) throw new Error(`rpc_${nome}_${res.status}`);
    return (await res.json()) as T;
  };
  return {
    limite: (chave, limite, janelaSeg) => rpc<boolean>("academy_rate_limit", { p_chave: chave, p_limite: limite, p_janela_seg: janelaSeg }),
    elegibilidade: (email) => rpc<Elegibilidade>("academy_elegibilidade", { p_email: email }),
    async provisionarAluno(userId, leadId, nome) {
      await rpc("academy_provisionar_aluno", { p_user_id: userId, p_lead_id: leadId, p_nome: nome });
    },
    async criarUsuario(email, nome) {
      const res = await chamar("/auth/v1/admin/users", { email, email_confirm: true, user_metadata: { nome: nome.slice(0, 80) } });
      if (res.ok) {
        const d = (await res.json()) as { id?: string };
        return d.id ? { ok: true, userId: d.id } : { ok: false, jaExiste: false };
      }
      return { ok: false, jaExiste: res.status === 422 || res.status === 409 };
    },
    async gerarLink(email, redirect) {
      const res = await chamar("/auth/v1/admin/generate_link", { type: "magiclink", email, redirect_to: redirect });
      if (!res.ok) throw new Error(`gerar_link_${res.status}`);
      const d = (await res.json()) as { hashed_token?: string; properties?: { hashed_token?: string } };
      const hash = d.properties?.hashed_token ?? d.hashed_token;
      if (!hash || !/^[A-Za-z0-9_-]{16,256}$/.test(hash)) throw new Error("gerar_link_resposta");
      return linkDoPortal(redirect, hash);
    },
    async enviarPeloSupabase(email, redirect) {
      const res = await chamar(`/auth/v1/otp?redirect_to=${encodeURIComponent(redirect)}`, { email, create_user: false });
      if (!res.ok) throw new Error(`otp_${res.status}`);
    },
  };
}

export function carteiroResend(apiKey: string, from: string, fetchImpl: typeof fetch = fetch): Carteiro {
  return {
    async enviar(mail) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      try {
        const res = await fetchImpl("https://api.resend.com/emails", {
          method: "POST",
          signal: controller.signal,
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, html: mail.html, text: mail.text }),
        });
        return res.ok;
      } catch {
        return false;
      } finally {
        clearTimeout(timer);
      }
    },
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
    carteiro: emailLigado ? carteiroResend(apiKey, getEnv("ACADEMY_EMAIL_FROM") ?? "CyDef Academy <academy@mail.cydef.com.br>") : undefined,
    origens,
    academyUrl: getEnv("ACADEMY_URL") ?? "https://academy.cydef.com.br",
    pepper: getEnv("ACADEMY_HASH_PEPPER"),
    log: (e) => console.log(JSON.stringify(e)),
  })(req);
}

if (typeof Deno !== "undefined") {
  Deno.serve(handler);
}
