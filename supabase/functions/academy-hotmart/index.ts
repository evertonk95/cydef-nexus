/**
 * POST /functions/v1/academy-hotmart - aviso de compra da Hotmart (webhook 2.0.0).
 *
 * Quem chama é a Hotmart, não um navegador: sem CORS e sem sessão. A função é
 * publicada com --no-verify-jwt e se protege assim (fail closed):
 *   1. Só POST com JSON de até 64 KB.
 *   2. Header X-HOTMART-HOTTOK igual ao token da conta (HOTMART_HOTTOK),
 *      comparado em tempo constante. Sem token configurado: 503.
 *   3. Campos obrigatórios e formatos conferidos antes de ir ao banco.
 *   4. O banco (academy_hotmart_processar, só service_role) grava cada aviso
 *      uma vez, libera ou retira o acesso e devolve o que mudou.
 *   5. Com o Resend ligado, a CyDef avisa a pessoa: acesso liberado ou
 *      encerrado. Falha no e-mail não desfaz o acesso nem pede reenvio.
 *
 * Respostas: 200 para tudo que foi gravado (inclusive repetido, ignorado ou
 * de produto que não é da Academy), para a Hotmart não reenviar. 500 quando
 * o banco falha, para ela tentar de novo.
 *
 * Logs: evento, resultado e request_id. Nunca e-mail, nome, token ou corpo.
 */

import { getEnv, json, novoRequestId } from "../_shared/edge.ts";
import { montarAcessoEncerrado, montarAcessoLiberado, type EmailAvisoAcesso } from "./email.ts";

export const LIMITES_HOTMART = { corpoMaxBytes: 64 * 1024, tokenMin: 16 } as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TRANSACAO = /^[A-Za-z0-9_-]{4,64}$/;
const EVENTO = /^[A-Z_]{3,60}$/;

export interface AvisoNormalizado {
  evento_id: string;
  evento: string;
  transacao: string;
  produto_id: number;
  email: string;
  nome: string;
  situacao: string;
  ocorrido_em: string;
}

export interface ResultadoBanco {
  duplicado: boolean;
  resultado: "liberado" | "encerrado" | "ignorado" | "produto_desconhecido" | "ja_encerrado";
  email?: string;
  nome?: string;
  produto?: string;
  conta_existe?: boolean;
}

export interface BancoHotmart {
  processar(aviso: AvisoNormalizado): Promise<ResultadoBanco>;
}

export interface CarteiroHotmart {
  enviar(mail: EmailAvisoAcesso): Promise<boolean>;
}

export interface HotmartDeps {
  banco: BancoHotmart;
  hottok: string | undefined;
  carteiro?: CarteiroHotmart;
  academyUrl: string;
  log?: (evento: Record<string, unknown>) => void;
  novoRequestId?: () => string;
}

/** Comparação em tempo constante (não vaza o tamanho do prefixo certo). */
export function iguais(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let dif = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) dif |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return dif === 0;
}

const texto = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

/** Tira do corpo da Hotmart só o que a Academy usa. Null se faltar algo. */
export function normalizar(corpo: unknown): AvisoNormalizado | null {
  if (typeof corpo !== "object" || corpo === null || Array.isArray(corpo)) return null;
  const c = corpo as Record<string, unknown>;
  const data = (c.data ?? {}) as Record<string, Record<string, unknown> | undefined>;
  const evento = texto(c.event).toUpperCase();
  const eventoId = texto(c.id);
  const transacao = texto(data.purchase?.transaction);
  const produto = Number(texto(data.product?.id));
  const email = texto(data.buyer?.email).trim().toLowerCase();
  if (!EVENTO.test(evento) || eventoId.length < 4 || eventoId.length > 100) return null;
  if (!TRANSACAO.test(transacao) || !Number.isSafeInteger(produto) || produto < 1 || produto > 999_999_999_999) return null;
  if (!email || email.length > 254 || !EMAIL.test(email) || /[\r\n]/.test(email)) return null;
  const ocorrido = texto(data.purchase?.approved_date) || texto(c.creation_date);
  return {
    evento_id: eventoId,
    evento,
    transacao,
    produto_id: produto,
    email,
    nome: texto(data.buyer?.name).replace(/[\r\n\u2028\u2029<>]/g, "").trim().slice(0, 80),
    situacao: texto(data.purchase?.status).toUpperCase().slice(0, 40),
    ocorrido_em: /^\d{10,13}$/.test(ocorrido) ? ocorrido : "",
  };
}

export function createHotmartHandler(deps: HotmartDeps) {
  const log = deps.log ?? (() => undefined);
  const rid = deps.novoRequestId ?? novoRequestId;

  return async (req: Request): Promise<Response> => {
    const requestId = rid();
    if (req.method !== "POST") return json({ erro: "metodo_nao_permitido" }, 405);
    if (!deps.hottok || deps.hottok.length < LIMITES_HOTMART.tokenMin) {
      log({ event: "hotmart_config_incompleta", request_id: requestId });
      return json({ erro: "servico_indisponivel" }, 503);
    }
    if (!iguais(req.headers.get("x-hotmart-hottok") ?? "", deps.hottok)) {
      log({ event: "hotmart_token_invalido", request_id: requestId });
      return json({ erro: "nao_autorizado" }, 401);
    }
    const ct = (req.headers.get("content-type") ?? "").toLowerCase();
    if (!ct.startsWith("application/json")) return json({ erro: "content_type_invalido" }, 415);
    if (Number(req.headers.get("content-length") ?? "0") > LIMITES_HOTMART.corpoMaxBytes) return json({ erro: "corpo_muito_grande" }, 413);
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > LIMITES_HOTMART.corpoMaxBytes) return json({ erro: "corpo_muito_grande" }, 413);

    let aviso: AvisoNormalizado | null;
    try {
      aviso = normalizar(JSON.parse(raw));
    } catch {
      aviso = null;
    }
    if (!aviso) {
      log({ event: "hotmart_payload_invalido", request_id: requestId });
      return json({ erro: "payload_invalido" }, 400);
    }

    let r: ResultadoBanco;
    try {
      r = await deps.banco.processar(aviso);
    } catch (err) {
      log({ event: "hotmart_banco_falhou", request_id: requestId, evento: aviso.evento, razao: err instanceof Error ? err.message.slice(0, 60) : "desconhecido" });
      return json({ erro: "servico_indisponivel" }, 500);
    }
    log({ event: "hotmart_processado", request_id: requestId, evento: aviso.evento, resultado: r.resultado, duplicado: r.duplicado });

    if (!r.duplicado && deps.carteiro && r.email && (r.resultado === "liberado" || r.resultado === "encerrado")) {
      const produto = r.produto ?? "seu curso";
      const mail =
        r.resultado === "liberado"
          ? montarAcessoLiberado({ to: r.email, nome: r.nome ?? "", produto, academyUrl: deps.academyUrl })
          : montarAcessoEncerrado({ to: r.email, nome: r.nome ?? "", produto });
      const ok = await deps.carteiro.enviar(mail).catch(() => false);
      log({ event: ok ? "hotmart_email_enviado" : "hotmart_email_falhou", request_id: requestId, tipo: r.resultado });
    }
    return json({ status: "ok", resultado: r.resultado }, 200);
  };
}

// ---------------------------------------------------------------------------
// Ligação com o Supabase e o Resend em produção
// ---------------------------------------------------------------------------

export function bancoSupabase(url: string, serviceKey: string, fetchImpl: typeof fetch = fetch): BancoHotmart {
  return {
    async processar(aviso) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      try {
        const res = await fetchImpl(`${url}/rest/v1/rpc/academy_hotmart_processar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" },
          body: JSON.stringify({ p_evento: aviso }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`rpc_hotmart_${res.status}`);
        return (await res.json()) as ResultadoBanco;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

export function carteiroResend(apiKey: string, from: string, fetchImpl: typeof fetch = fetch): CarteiroHotmart {
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

export default async function handler(req: Request): Promise<Response> {
  const apiKey = getEnv("RESEND_API_KEY") ?? "";
  const emailLigado = getEnv("ACADEMY_EMAIL_ENABLED") === "true" && apiKey.length > 0;
  return createHotmartHandler({
    banco: bancoSupabase(getEnv("SUPABASE_URL") ?? "", getEnv("SUPABASE_SERVICE_ROLE_KEY") ?? ""),
    hottok: getEnv("HOTMART_HOTTOK"),
    carteiro: emailLigado ? carteiroResend(apiKey, getEnv("ACADEMY_EMAIL_FROM") ?? "CyDef Academy <academy@mail.cydef.com.br>") : undefined,
    academyUrl: getEnv("ACADEMY_URL") ?? "https://academy.cydef.com.br",
    log: (e) => console.log(JSON.stringify(e)),
  })(req);
}

if (typeof Deno !== "undefined") {
  Deno.serve(handler);
}
