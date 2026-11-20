/**
 * POST /functions/v1/academy-empresa - envia os e-mails dos convites de uma
 * empresa (fase 17).
 *
 * Quem chama é o portal, com a sessão da gestora ou do admin, logo depois de
 * convidar ou de pedir o reenvio. Corpo: { empresa_id }.
 *
 * Camadas (fail closed):
 *   1. Origem permitida (CORS) e JWT de sessão (verificado também pelo
 *      gateway do Supabase).
 *   2. JSON de até 1 KB com um uuid.
 *   3. O banco confere a permissão com o token de quem chamou: só a gestora
 *      ativa da empresa ou o admin lê os convites pendentes.
 *   4. Cada convite enviado com sucesso é marcado; o que falhar fica pendente
 *      para um reenvio. Com o e-mail desligado, nada é marcado e a pessoa
 *      ainda encontra o convite ao entrar no portal.
 *
 * Logs: evento, quantidades e request_id. Nunca e-mail, nome ou token.
 */

import { corsHeaders, getEnv, json, novoRequestId } from "../_shared/edge.ts";
import { carteiroResend, type CarteiroAcademy } from "../_shared/academy-email.ts";
import { montarConvite } from "./email.ts";

export const LIMITES_EMPRESA = { corpoMaxBytes: 1024 } as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const JWT = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const ERROS_PERMISSAO = ["sem_permissao", "contrato_encerrado", "empresa_inexistente", "nao_autenticado"];

export interface ConvitesPendentes {
  empresa: string;
  alvo: string;
  fim: string;
  quem_convida: string;
  convites: { id: string; email: string; gestor: boolean }[];
}

export interface BancoEmpresa {
  pendentes(jwt: string, empresaId: string): Promise<ConvitesPendentes>;
  marcar(jwt: string, empresaId: string, ids: string[]): Promise<number>;
}

export class ErroBanco extends Error {
  constructor(public codigo: string, public status: number) {
    super(codigo);
  }
}

export interface EmpresaDeps {
  banco: BancoEmpresa;
  origens: string[];
  carteiro?: CarteiroAcademy;
  academyUrl: string;
  log?: (evento: Record<string, unknown>) => void;
  novoRequestId?: () => string;
}

export function createEmpresaHandler(deps: EmpresaDeps) {
  const log = deps.log ?? (() => {});
  return async (req: Request): Promise<Response> => {
    const requestId = (deps.novoRequestId ?? novoRequestId)();
    const origem = req.headers.get("origin") ?? "";
    const origemOk = deps.origens.includes(origem);
    const h = origemOk ? corsHeaders(origem) : { Vary: "Origin" };

    if (req.method === "OPTIONS") {
      return origemOk ? new Response(null, { status: 204, headers: h }) : json({ erro: "origem_nao_permitida" }, 403, h);
    }
    if (!origemOk) {
      log({ event: "empresa_origem_bloqueada", request_id: requestId });
      return json({ erro: "origem_nao_permitida" }, 403, h);
    }
    if (req.method !== "POST") {
      return json({ erro: "metodo_nao_permitido" }, 405, { ...h, Allow: "POST, OPTIONS" });
    }
    const auth = req.headers.get("authorization") ?? "";
    const jwt = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    if (!JWT.test(jwt)) {
      return json({ erro: "nao_autenticado" }, 401, h);
    }
    const tamanho = Number(req.headers.get("content-length") ?? "0");
    if (tamanho > LIMITES_EMPRESA.corpoMaxBytes) {
      return json({ erro: "payload_grande" }, 413, h);
    }
    let empresaId: string;
    try {
      const texto = await req.text();
      if (texto.length > LIMITES_EMPRESA.corpoMaxBytes) return json({ erro: "payload_grande" }, 413, h);
      const corpo = JSON.parse(texto) as { empresa_id?: unknown };
      empresaId = typeof corpo.empresa_id === "string" ? corpo.empresa_id : "";
    } catch {
      empresaId = "";
    }
    if (!UUID.test(empresaId)) {
      return json({ erro: "payload_invalido" }, 400, h);
    }

    let p: ConvitesPendentes;
    try {
      p = await deps.banco.pendentes(jwt, empresaId);
    } catch (err) {
      const codigo = err instanceof ErroBanco ? err.codigo : "desconhecido";
      if (ERROS_PERMISSAO.includes(codigo)) {
        log({ event: "empresa_sem_permissao", request_id: requestId, razao: codigo });
        return json({ erro: codigo }, codigo === "nao_autenticado" ? 401 : 403, h);
      }
      log({ event: "empresa_banco_falhou", request_id: requestId, razao: codigo.slice(0, 60) });
      return json({ erro: "servico_indisponivel" }, 503, h);
    }

    if (!deps.carteiro) {
      log({ event: "empresa_email_desligado", request_id: requestId, pendentes: p.convites.length });
      return json({ enviados: 0, falhas: 0, pendentes: p.convites.length, email: "desligado" }, 200, h);
    }

    const enviados: string[] = [];
    for (const c of p.convites) {
      const mail = montarConvite({
        to: c.email, empresa: p.empresa, alvo: p.alvo, fim: p.fim, quemConvida: p.quem_convida,
        gestor: c.gestor, academyUrl: deps.academyUrl,
      });
      const ok = await deps.carteiro.enviar(mail).catch(() => false);
      if (ok) enviados.push(c.id);
    }
    if (enviados.length > 0) {
      try {
        await deps.banco.marcar(jwt, empresaId, enviados);
      } catch (err) {
        log({ event: "empresa_marcar_falhou", request_id: requestId, razao: err instanceof Error ? err.message.slice(0, 60) : "desconhecido" });
      }
    }
    const falhas = p.convites.length - enviados.length;
    log({ event: "empresa_convites_enviados", request_id: requestId, enviados: enviados.length, falhas });
    return json({ enviados: enviados.length, falhas, pendentes: falhas, email: "ligado" }, 200, h);
  };
}

// ---------------------------------------------------------------------------
// Ligação com o Supabase em produção (anon key + token de quem chamou)
// ---------------------------------------------------------------------------

export function bancoSupabase(url: string, anonKey: string, fetchImpl: typeof fetch = fetch): BancoEmpresa {
  async function rpc<T>(jwt: string, fn: string, args: Record<string, unknown>): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetchImpl(`${url}/rest/v1/rpc/${fn}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}`, apikey: anonKey, "Content-Type": "application/json" },
        body: JSON.stringify(args),
        signal: controller.signal,
      });
      if (!res.ok) {
        let codigo = `rpc_${res.status}`;
        try {
          const corpo = (await res.json()) as { message?: string };
          if (typeof corpo.message === "string" && /^[a-z_]{3,40}$/.test(corpo.message)) codigo = corpo.message;
        } catch {
          // corpo sem JSON: fica o status
        }
        throw new ErroBanco(codigo, res.status);
      }
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
  return {
    pendentes: (jwt, empresaId) => rpc<ConvitesPendentes>(jwt, "academy_empresa_convites_pendentes", { p_empresa: empresaId }),
    marcar: (jwt, empresaId, ids) => rpc<number>(jwt, "academy_empresa_convites_enviados", { p_empresa: empresaId, p_ids: ids }),
  };
}

function lista(v: string | undefined): string[] {
  return (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

export default async function handler(req: Request): Promise<Response> {
  const apiKey = getEnv("RESEND_API_KEY") ?? "";
  const emailLigado = getEnv("ACADEMY_EMAIL_ENABLED") === "true" && apiKey.length > 0;
  return createEmpresaHandler({
    banco: bancoSupabase(getEnv("SUPABASE_URL") ?? "", getEnv("SUPABASE_ANON_KEY") ?? ""),
    origens: lista(getEnv("ACADEMY_ALLOWED_ORIGINS") ?? "https://academy.cydef.com.br"),
    carteiro: emailLigado ? carteiroResend(apiKey, getEnv("ACADEMY_EMAIL_FROM") ?? "CyDef Academy <academy@mail.cydef.com.br>") : undefined,
    academyUrl: getEnv("ACADEMY_URL") ?? "https://academy.cydef.com.br",
    log: (e) => console.log(JSON.stringify(e)),
  })(req);
}

if (typeof Deno !== "undefined") {
  Deno.serve(handler);
}
