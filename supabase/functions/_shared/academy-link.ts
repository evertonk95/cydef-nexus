/**
 * Entrega do link de acesso ao portal da CyDef Academy, usada pelos dois
 * caminhos que levam o aluno para dentro:
 *   - academy-acesso: "Entrar" em academy.cydef.com.br/entrar;
 *   - capture: pré-inscrição gratuita em www.cydef.com.br/academy/gratuito.
 *
 * Os dois criam o usuário de login quando falta, provisionam o aluno e enviam
 * o mesmo link de uso único (60 minutos). Com o Resend ligado
 * (ACADEMY_EMAIL_ENABLED), o e-mail sai com o modelo da CyDef; sem ele, o
 * Supabase envia com o modelo do painel.
 *
 * Nada aqui loga e-mail, IP, token ou link.
 */
import { montarEmailAcesso, type EmailAcesso, type MotivoAcesso } from "../academy-acesso/email.ts";

export const VALIDADE_LINK_MIN = 60;

/** Limite por e-mail, compartilhado pelos dois caminhos (mesma chave). */
export const LIMITE_POR_EMAIL = { limite: 3, janelaSeg: 900 } as const;

export interface Elegibilidade {
  elegivel: boolean;
  user_id?: string | null;
  aluno?: boolean;
  lead_id?: string | null;
  /** 0021: comprou pela Hotmart (ou recebeu acesso) sem pré-inscrição. */
  comprador?: boolean;
  /** 0024: convidado por uma empresa, ainda sem pré-inscrição. */
  convidado?: boolean;
  nome?: string;
}

/** Operações do servidor de login (Supabase com service_role). */
export interface Servidor {
  limite(chave: string, limite: number, janelaSeg: number): Promise<boolean>;
  elegibilidade(email: string): Promise<Elegibilidade>;
  criarUsuario(email: string, nome: string): Promise<{ ok: true; userId: string } | { ok: false; jaExiste: boolean }>;
  provisionarAluno(userId: string, leadId: string | null, nome: string): Promise<void>;
  gerarLink(email: string, redirect: string): Promise<string>;
  enviarPeloSupabase(email: string, redirect: string): Promise<void>;
}

export interface Carteiro {
  enviar(mail: EmailAcesso): Promise<boolean>;
}

export interface EntregaDeps {
  servidor: Servidor;
  /** Envio pelo Resend; ausente = o Supabase envia o link. */
  carteiro?: Carteiro;
  /** Endereço do portal (destino fixo do link). */
  academyUrl: string;
  log?: (evento: Record<string, unknown>) => void;
}

export async function hmac(pepper: string, valor: string): Promise<string> {
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(pepper), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const assinatura = await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(valor));
  return Array.from(new Uint8Array(assinatura)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Chave do limite por e-mail (a mesma nos dois caminhos). */
export async function chaveLimiteEmail(pepper: string, email: string): Promise<string> {
  return `em:${await hmac(pepper, `email:${email}`)}`;
}

/**
 * Link do e-mail: aponta para o próprio portal (mesmo domínio do remetente), e
 * o portal troca o token por sessão só quando o aluno clica em "Entrar".
 */
export function linkDoPortal(retorno: string, tokenHash: string): string {
  return `${retorno}?token_hash=${encodeURIComponent(tokenHash)}&type=email`;
}

/**
 * Cria o usuário (se faltar), provisiona o aluno e envia o link. Lança erro
 * em qualquer falha; quem chama decide como responder sem revelar o motivo.
 */
export async function entregarLink(
  deps: EntregaDeps,
  email: string,
  inicial: Elegibilidade,
  evento: string,
  motivo: MotivoAcesso = "acesso",
): Promise<void> {
  const log = deps.log ?? (() => undefined);
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
    // Sem pré-inscrição, só quem tem acesso pago ativo (0021) ou convite (0024) vira aluno.
    if (!el.lead_id && !el.comprador && !el.convidado) throw new Error("sem_lead");
    await deps.servidor.provisionarAluno(userId, el.lead_id ?? null, el.nome ?? "");
  }
  const retorno = `${deps.academyUrl.replace(/\/+$/, "")}/entrar/retorno`;
  if (deps.carteiro) {
    const link = await deps.servidor.gerarLink(email, retorno);
    const enviado = await deps.carteiro.enviar(
      montarEmailAcesso({ to: email, nome: el.nome ?? "", link, validadeMin: VALIDADE_LINK_MIN, motivo }),
    );
    if (!enviado) throw new Error("resend_falhou");
    log({ event: "acesso_link_enviado", evento, via: "resend", motivo });
  } else {
    await deps.servidor.enviarPeloSupabase(email, retorno);
    log({ event: "acesso_link_enviado", evento, via: "supabase", motivo });
  }
}

// ---------------------------------------------------------------------------
// Ligação com o Supabase e o Resend em produção
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

/** Remetente padrão: domínio verificado no Resend (mail.cydef.com.br). */
export const REMETENTE_PADRAO = "CyDef Academy <academy@mail.cydef.com.br>";
