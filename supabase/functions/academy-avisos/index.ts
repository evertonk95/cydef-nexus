/**
 * POST /functions/v1/academy-avisos - rotina diária da Academy (fase 17).
 *
 * Quem chama é o agendamento do GitHub (.github/workflows/academy-avisos.yml),
 * sem sessão. A função é publicada com --no-verify-jwt e se protege assim
 * (fail closed):
 *   1. Só POST.
 *   2. Header X-ACADEMY-CRON igual a ACADEMY_CRON_TOKEN (32+ caracteres),
 *      comparado em tempo constante. Sem token configurado: 503.
 *   3. Com service_role, recalcula os acessos que começaram ou venceram
 *      (academy_expirar_concessoes) e busca os avisos de vencimento do dia.
 *   4. Cada e-mail enviado é registrado; o que falhar sai no dia seguinte.
 *      Com o e-mail desligado, nada é registrado.
 *
 * Logs: evento, quantidades e request_id. Nunca e-mail, nome ou token.
 */

import { getEnv, json, novoRequestId } from "../_shared/edge.ts";
import { carteiroResend, iguais, type CarteiroAcademy } from "../_shared/academy-email.ts";
import { montarAviso, type AvisoVencimento } from "./email.ts";

export const LIMITES_AVISOS = { tokenMin: 32 } as const;

export interface BancoAvisos {
  expirar(): Promise<number>;
  pendentes(): Promise<AvisoVencimento[]>;
  registrar(itens: { chave: string; email: string }[]): Promise<number>;
}

export interface AvisosDeps {
  banco: BancoAvisos;
  token: string | undefined;
  carteiro?: CarteiroAcademy;
  log?: (evento: Record<string, unknown>) => void;
  novoRequestId?: () => string;
}

export function createAvisosHandler(deps: AvisosDeps) {
  const log = deps.log ?? (() => {});
  return async (req: Request): Promise<Response> => {
    const requestId = (deps.novoRequestId ?? novoRequestId)();
    if (req.method !== "POST") {
      return json({ erro: "metodo_nao_permitido" }, 405, { Allow: "POST" });
    }
    const token = deps.token ?? "";
    if (token.length < LIMITES_AVISOS.tokenMin) {
      log({ event: "avisos_sem_token", request_id: requestId });
      return json({ erro: "servico_indisponivel" }, 503);
    }
    if (!iguais(req.headers.get("x-academy-cron") ?? "", token)) {
      log({ event: "avisos_token_invalido", request_id: requestId });
      return json({ erro: "nao_autorizado" }, 401);
    }

    let recalculados: number;
    let avisos: AvisoVencimento[];
    try {
      recalculados = await deps.banco.expirar();
      avisos = await deps.banco.pendentes();
    } catch (err) {
      log({ event: "avisos_banco_falhou", request_id: requestId, razao: err instanceof Error ? err.message.slice(0, 60) : "desconhecido" });
      return json({ erro: "servico_indisponivel" }, 500);
    }

    if (!deps.carteiro) {
      log({ event: "avisos_email_desligado", request_id: requestId, recalculados, pendentes: avisos.length });
      return json({ recalculados, enviados: 0, falhas: 0, pendentes: avisos.length, email: "desligado" }, 200);
    }

    const enviados: { chave: string; email: string }[] = [];
    for (const a of avisos) {
      const ok = await deps.carteiro.enviar(montarAviso(a)).catch(() => false);
      if (ok) enviados.push({ chave: a.chave, email: a.email });
    }
    if (enviados.length > 0) {
      try {
        await deps.banco.registrar(enviados);
      } catch (err) {
        log({ event: "avisos_registro_falhou", request_id: requestId, razao: err instanceof Error ? err.message.slice(0, 60) : "desconhecido" });
        return json({ erro: "registro_falhou", enviados: enviados.length }, 500);
      }
    }
    const falhas = avisos.length - enviados.length;
    log({ event: "avisos_enviados", request_id: requestId, recalculados, enviados: enviados.length, falhas });
    return json({ recalculados, enviados: enviados.length, falhas, email: "ligado" }, 200);
  };
}

// ---------------------------------------------------------------------------
// Ligação com o Supabase e o Resend em produção
// ---------------------------------------------------------------------------

export function bancoSupabase(url: string, serviceKey: string, fetchImpl: typeof fetch = fetch): BancoAvisos {
  async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    try {
      const res = await fetchImpl(`${url}/rest/v1/rpc/${fn}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey, "Content-Type": "application/json" },
        body: JSON.stringify(args),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`rpc_${fn}_${res.status}`);
      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }
  return {
    expirar: () => rpc<number>("academy_expirar_concessoes", {}),
    pendentes: () => rpc<AvisoVencimento[]>("academy_avisos_vencimento", {}),
    registrar: (itens) => rpc<number>("academy_avisos_registrar", { p_itens: itens }),
  };
}

export default async function handler(req: Request): Promise<Response> {
  const apiKey = getEnv("RESEND_API_KEY") ?? "";
  const emailLigado = getEnv("ACADEMY_EMAIL_ENABLED") === "true" && apiKey.length > 0;
  return createAvisosHandler({
    banco: bancoSupabase(getEnv("SUPABASE_URL") ?? "", getEnv("SUPABASE_SERVICE_ROLE_KEY") ?? ""),
    token: getEnv("ACADEMY_CRON_TOKEN"),
    carteiro: emailLigado ? carteiroResend(apiKey, getEnv("ACADEMY_EMAIL_FROM") ?? "CyDef Academy <academy@mail.cydef.com.br>") : undefined,
    log: (e) => console.log(JSON.stringify(e)),
  })(req);
}

if (typeof Deno !== "undefined") {
  Deno.serve(handler);
}
