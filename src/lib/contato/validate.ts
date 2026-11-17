/**
 * Validação do formulário de contato comercial.
 *
 * Módulo puro compartilhado: a Edge Function `contato` é a autoridade; o SPA
 * usa os mesmos limites só para UX. Regras desenhadas contra abuso típico de
 * formulário público: flood, spam com links, injeção de cabeçalho, HTML/script
 * refletido no e-mail interno, caracteres invisíveis ou de inversão de texto
 * (spoofing visual) e e-mail descartável.
 */

import { validarEmail, normalizarEmail } from "../academy/validate.ts";
import { validarTriagem, type Triagem } from "./triagem.ts";

export const LIMITES_CONTATO = {
  nomeMin: 2,
  nomeMax: 80,
  cargoMin: 2,
  cargoMax: 80,
  empresaMin: 2,
  empresaMax: 100,
  emailMax: 254,
  mensagemMin: 20,
  mensagemMax: 2000,
  /** Links aceitos na mensagem (acima disso é tratado como spam). */
  linksMax: 2,
  /** Corpo máximo do POST (proteção, não UX). */
  corpoMaxBytes: 8192,
  turnstileMax: 2048,
  /** Tempo mínimo de preenchimento (ms). Abaixo disso, descarte silencioso. */
  tempoMinimoMs: 4000,
  /** Tempo máximo (ms) antes de exigir recarregar a página (token velho). */
  tempoMaximoMs: 2 * 60 * 60 * 1000,
} as const;

/** Controles C0/C1 (exceto \n e \t), zero-width e overrides bidi (Trojan Source). */
// eslint-disable-next-line no-control-regex -- a regra existe justamente para detectar caracteres de controle
const INVISIVEIS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/u;
const QUEBRAS = /[\r\n\u2028\u2029]/u;
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>"']+/giu;
const TAG_HTML = /<\s*\/?\s*[a-z!][^>]*>/iu;

/** Nome de pessoa: letras (qualquer idioma), espaço, apóstrofo, ponto, hífen. */
const NOME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
/** Cargo e empresa: letras, números e pontuação comercial comum. */
const ORG_RE = /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} .,'&()/+-]*$/u;

/** Provedores de e-mail descartável mais usados em abuso (lista curta e mantida aqui). */
export const DOMINIOS_DESCARTAVEIS: ReadonlySet<string> = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "sharklasers.com",
  "10minutemail.com",
  "10minutemail.net",
  "temp-mail.org",
  "tempmail.com",
  "tempmail.dev",
  "tempmailo.com",
  "yopmail.com",
  "yopmail.fr",
  "getnada.com",
  "trashmail.com",
  "dispostable.com",
  "maildrop.cc",
  "mintemail.com",
  "throwawaymail.com",
  "fakeinbox.com",
  "emailondeck.com",
  "moakt.com",
  "mohmal.com",
  "tmail.ws",
  "mail.tm",
  "burnermail.io",
]);

/** Webmails pessoais: aceitos, mas sinalizados para o time (não é e-mail corporativo). */
export const DOMINIOS_PESSOAIS: ReadonlySet<string> = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.com.br",
  "outlook.com",
  "outlook.com.br",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.com.br",
  "icloud.com",
  "me.com",
  "aol.com",
  "uol.com.br",
  "bol.com.br",
  "terra.com.br",
  "ig.com.br",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "zoho.com",
]);

export interface ContatoValidado {
  nome: string;
  cargo: string;
  empresa: string;
  email: string;
  mensagem: string;
  triagem: Triagem;
  emailPessoal: boolean;
}

export type ContatoRejeicao =
  | "invalid_payload"
  | "sem_consentimento"
  | "email_descartavel"
  | "spam_links";

export type ValidacaoContato =
  | { ok: true; data: ContatoValidado }
  | { ok: false; razao: ContatoRejeicao };

/** NFKC (desfaz homoglifos de compatibilidade) + trim + espaços colapsados. */
export function normalizarLinha(s: string): string {
  return s.normalize("NFKC").replace(/[ \t]+/g, " ").trim();
}

/** NFKC + CRLF → LF + no máximo 2 linhas em branco seguidas. */
export function normalizarMensagem(s: string): string {
  return s
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2028\u2029]/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function contemInvisiveis(s: string): boolean {
  return INVISIVEIS.test(s);
}

export function contarLinks(s: string): number {
  return (s.match(URL_RE) ?? []).length;
}

export function dominioDoEmail(email: string): string {
  return normalizarEmail(email).split("@")[1] ?? "";
}

export function emailDescartavel(email: string): boolean {
  const d = dominioDoEmail(email);
  if (DOMINIOS_DESCARTAVEIS.has(d)) return true;
  // subdomínios de provedores descartáveis (ex.: x.mailinator.com)
  for (const base of DOMINIOS_DESCARTAVEIS) {
    if (d.endsWith(`.${base}`)) return true;
  }
  return false;
}

export function emailPessoal(email: string): boolean {
  return DOMINIOS_PESSOAIS.has(dominioDoEmail(email));
}

function campoLinha(v: unknown, min: number, max: number, re: RegExp): string | null {
  if (typeof v !== "string") return null;
  if (contemInvisiveis(v) || QUEBRAS.test(v)) return null;
  const n = normalizarLinha(v);
  if (n.length < min || n.length > max) return null;
  if (!re.test(n)) return null;
  if (contarLinks(n) > 0 || /@/.test(n)) return null;
  return n;
}

export const validarNomeContato = (v: unknown) =>
  campoLinha(v, LIMITES_CONTATO.nomeMin, LIMITES_CONTATO.nomeMax, NOME_RE);
export const validarCargo = (v: unknown) =>
  campoLinha(v, LIMITES_CONTATO.cargoMin, LIMITES_CONTATO.cargoMax, ORG_RE);
export const validarEmpresa = (v: unknown) =>
  campoLinha(v, LIMITES_CONTATO.empresaMin, LIMITES_CONTATO.empresaMax, ORG_RE);

/**
 * Valida o payload do contrato POST /contato (campos de negócio).
 * Honeypot, tempo de preenchimento, Turnstile e request_id são verificados
 * pela Edge Function antes desta função.
 */
export function validarContato(input: unknown): ValidacaoContato {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, razao: "invalid_payload" };
  }
  const r = input as Record<string, unknown>;

  const nome = validarNomeContato(r.nome);
  const cargo = validarCargo(r.cargo);
  const empresa = validarEmpresa(r.empresa);
  if (!nome || !cargo || !empresa) return { ok: false, razao: "invalid_payload" };

  if (typeof r.email !== "string" || contemInvisiveis(r.email) || QUEBRAS.test(r.email)) {
    return { ok: false, razao: "invalid_payload" };
  }
  const email = normalizarEmail(r.email.normalize("NFKC"));
  if (!validarEmail(email) || email.length > LIMITES_CONTATO.emailMax) {
    return { ok: false, razao: "invalid_payload" };
  }
  if (emailDescartavel(email)) return { ok: false, razao: "email_descartavel" };

  if (typeof r.mensagem !== "string" || contemInvisiveis(r.mensagem.replace(/[\n\t\r]/g, ""))) {
    return { ok: false, razao: "invalid_payload" };
  }
  const mensagem = normalizarMensagem(r.mensagem);
  if (mensagem.length < LIMITES_CONTATO.mensagemMin || mensagem.length > LIMITES_CONTATO.mensagemMax) {
    return { ok: false, razao: "invalid_payload" };
  }
  if (TAG_HTML.test(mensagem)) return { ok: false, razao: "invalid_payload" };
  if (contarLinks(mensagem) > LIMITES_CONTATO.linksMax) return { ok: false, razao: "spam_links" };

  const triagem = validarTriagem(r.triagem);
  if (!triagem) return { ok: false, razao: "invalid_payload" };

  if (r.aceito !== true) return { ok: false, razao: "sem_consentimento" };

  return {
    ok: true,
    data: { nome, cargo, empresa, email, mensagem, triagem, emailPessoal: emailPessoal(email) },
  };
}

/** request_id: UUID v4 gerado pelo cliente por montagem (idempotência). */
export function validarRequestIdContato(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
  );
}

/** Tempo de preenchimento informado pelo cliente (camada barata; a forte é o Turnstile). */
export function tempoPreenchimentoValido(v: unknown): boolean {
  return (
    typeof v === "number" &&
    Number.isFinite(v) &&
    v >= LIMITES_CONTATO.tempoMinimoMs &&
    v <= LIMITES_CONTATO.tempoMaximoMs
  );
}
