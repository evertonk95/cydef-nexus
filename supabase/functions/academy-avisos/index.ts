/**
 * POST /functions/v1/academy-avisos - rotina diária da Academy (fases 17 e 18).
 *
 * Quem chama é o agendamento do GitHub (.github/workflows/academy-avisos.yml),
 * sem sessão. A função é publicada com --no-verify-jwt e se protege assim
 * (fail closed):
 *   1. Só POST.
 *   2. Header X-ACADEMY-CRON igual a ACADEMY_CRON_TOKEN (32+ caracteres),
 *      comparado em tempo constante. Sem token configurado: 503.
 *   3. Com service_role, recalcula os acessos que começaram ou venceram
 *      (academy_expirar_concessoes) e busca os avisos de vencimento do dia.
 *   4. Fase 18: e-mails de certificado emitido (sempre) e de aula nova (só
 *      para quem ligou em Minha conta), com teto diário para a aula nova,
 *      para deixar folga no limite do Resend para o link de login. O que
 *      passar do teto sai no dia seguinte. Se o banco ainda não tiver a 0028,
 *      essas duas partes são puladas e o vencimento segue normal.
 *   5. Cada e-mail enviado é registrado; o que falhar sai no dia seguinte.
 *      Com o e-mail desligado, nada é registrado.
 *
 * Logs: evento, quantidades e request_id. Nunca e-mail, nome ou token.
 */

import { getEnv, json, novoRequestId } from "../_shared/edge.ts";
import { carteiroResend, iguais, type CarteiroAcademy } from "../_shared/academy-email.ts";
import {
  montarAulasNovas,
  montarAviso,
  montarCertificado,
  type AvisoAulas,
  type AvisoCertificado,
  type AvisoVencimento,
} from "./email.ts";
import type { EmailAcademy } from "../_shared/academy-email.ts";

export const LIMITES_AVISOS = {
  tokenMin: 32,
  /** Teto diário de e-mails de aula nova (o plano gratuito do Resend tem limite diário). */
  aulaNovaPorDia: 40,
  /** Tamanho máximo de cada registro (academy_avisos_registrar aceita até 300). */
  registroPorVez: 300,
} as const;

type Item = { chave: string; email: string };

export interface BancoAvisos {
  expirar(): Promise<number>;
  pendentes(): Promise<AvisoVencimento[]>;
  /** Fase 18 (0028). */
  certificados(): Promise<AvisoCertificado[]>;
  /** Fase 18 (0028): no máximo `limite` e-mails (um por aluno e curso). */
  aulas(limite: number): Promise<AvisoAulas[]>;
  registrar(itens: Item[]): Promise<number>;
}

export interface AvisosDeps {
  banco: BancoAvisos;
  token: string | undefined;
  carteiro?: CarteiroAcademy;
  /** Endereço do portal, para os links dos e-mails da fase 18. */
  academyUrl?: string;
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
    const carteiro = deps.carteiro;
    const academyUrl = deps.academyUrl ?? "https://academy.cydef.com.br";

    // Fase 18: se a 0028 ainda não estiver no banco, só esta parte é pulada.
    async function fonte<T>(nome: string, buscar: () => Promise<T[]>): Promise<T[]> {
      try {
        return await buscar();
      } catch (err) {
        log({ event: "avisos_fonte_falhou", request_id: requestId, fonte: nome, razao: err instanceof Error ? err.message.slice(0, 60) : "desconhecido" });
        return [];
      }
    }
    const certificados = await fonte("certificados", () => deps.banco.certificados());
    const aulas = await fonte("aulas", () => deps.banco.aulas(LIMITES_AVISOS.aulaNovaPorDia));

    const fila: { tipo: "vencimento" | "certificado" | "aula"; mail: EmailAcademy | null; itens: Item[] }[] = [
      ...avisos.map((a) => ({ tipo: "vencimento" as const, mail: montarAviso(a), itens: [{ chave: a.chave, email: a.email }] })),
      ...certificados.map((c) => ({ tipo: "certificado" as const, mail: montarCertificado(c, academyUrl), itens: [{ chave: c.chave, email: c.email }] })),
      ...aulas
        .slice(0, LIMITES_AVISOS.aulaNovaPorDia)
        .map((g) => ({ tipo: "aula" as const, mail: montarAulasNovas(g, academyUrl), itens: g.aulas.map((x) => ({ chave: x.chave, email: g.email })) })),
    ];

    const enviados: Item[] = [];
    const porTipo = { vencimento: 0, certificado: 0, aula: 0 };
    let falhas = 0;
    for (const f of fila) {
      if (!f.mail) {
        falhas += 1;
        continue;
      }
      const ok = await carteiro.enviar(f.mail).catch(() => false);
      if (ok) {
        enviados.push(...f.itens);
        porTipo[f.tipo] += 1;
      } else {
        falhas += 1;
      }
    }
    if (enviados.length > 0) {
      try {
        for (let i = 0; i < enviados.length; i += LIMITES_AVISOS.registroPorVez) {
          await deps.banco.registrar(enviados.slice(i, i + LIMITES_AVISOS.registroPorVez));
        }
      } catch (err) {
        log({ event: "avisos_registro_falhou", request_id: requestId, razao: err instanceof Error ? err.message.slice(0, 60) : "desconhecido" });
        return json({ erro: "registro_falhou", enviados: porTipo.vencimento + porTipo.certificado + porTipo.aula }, 500);
      }
    }
    const total = porTipo.vencimento + porTipo.certificado + porTipo.aula;
    log({ event: "avisos_enviados", request_id: requestId, recalculados, enviados: total, falhas, por_tipo: porTipo });
    return json({ recalculados, enviados: total, falhas, por_tipo: porTipo, email: "ligado" }, 200);
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
    certificados: () => rpc<AvisoCertificado[]>("academy_avisos_certificados", {}),
    aulas: (limite) => rpc<AvisoAulas[]>("academy_avisos_aulas", { p_limite: limite }),
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
    academyUrl: getEnv("ACADEMY_URL") ?? "https://academy.cydef.com.br",
    log: (e) => console.log(JSON.stringify(e)),
  })(req);
}

if (typeof Deno !== "undefined") {
  Deno.serve(handler);
}
