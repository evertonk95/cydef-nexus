import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Questões por módulo, avaliação final e certificado (banco na 0013).
 *
 * O portal só mostra o que o banco devolve: a correção, a nota e a
 * elegibilidade são decididas nas funções `academy_*`. Aqui só se confere o
 * formato da resposta, para um dado inesperado virar erro e não tela quebrada.
 */

export type CodigoErroAvaliacao =
  | "sem_matricula"
  | "curso_indisponivel"
  | "modulo_bloqueado"
  | "sem_questoes"
  | "muitas_tentativas"
  | "prova_indisponivel"
  | "prova_ja_enviada"
  | "nao_elegivel"
  | "nome_invalido"
  | "requisitos_pendentes"
  | "sem_banco"
  | "sem_tentativas"
  | "aguarde"
  | "aprovado"
  | "falha";

const CODIGOS: CodigoErroAvaliacao[] = [
  "sem_matricula",
  "curso_indisponivel",
  "modulo_bloqueado",
  "sem_questoes",
  "muitas_tentativas",
  "prova_indisponivel",
  "prova_ja_enviada",
  "nao_elegivel",
  "nome_invalido",
  "requisitos_pendentes",
  "sem_banco",
  "sem_tentativas",
  "aguarde",
  "aprovado",
];

export class ErroAvaliacao extends Error {
  constructor(public readonly codigo: CodigoErroAvaliacao) {
    super(codigo);
  }
}

function codigoDe(mensagem?: string): CodigoErroAvaliacao {
  return CODIGOS.find((c) => mensagem?.includes(c)) ?? "falha";
}

export type SituacaoFinal = "aprovado" | "sem_requisitos" | "requisitos_pendentes" | "sem_banco" | "sem_tentativas" | "aguarde" | "disponivel";

export interface ModuloSituacao {
  id: string;
  ordem: number;
  titulo: string;
  tem_questoes: boolean;
  aprovado: boolean;
  liberado: boolean;
}

export interface Situacao {
  requisitos: {
    exige_todas_aulas: boolean;
    exige_modulos: boolean;
    nota_minima_modulo: number;
    nota_minima_final: number;
    questoes_final: number;
    espera_final_horas: number;
    tentativas_final_max: number | null;
    carga_horaria_h: number | null;
  };
  aulas: { total: number; concluidas: number };
  modulos: ModuloSituacao[];
  final: {
    situacao: SituacaoFinal;
    prova_aberta: string | null;
    tentativas: number;
    melhor_nota: number | null;
    proxima_em: string | null;
  };
  certificado: {
    elegivel: boolean;
    codigo: string | null;
    nome: string | null;
    concluido_em: string | null;
  };
}

export interface Alternativa {
  id: string;
  texto: string;
}

export interface Questao {
  id: string;
  enunciado: string;
  alternativas: Alternativa[];
}

export interface QuestoesModulo {
  modulo_id: string;
  nota_minima: number;
  aprovado: boolean;
  questoes: Questao[];
}

export interface CorrecaoQuestao {
  questao: string;
  escolhida: string;
  correta: boolean;
  alternativa_correta: string;
  explicacao: string | null;
}

export interface ResultadoModulo {
  acertos: number;
  total: number;
  nota: number;
  nota_minima: number;
  aprovado: boolean;
  correcao: CorrecaoQuestao[];
}

export interface ProvaFinal {
  prova_id: string;
  iniciada_em: string;
  questoes: Questao[];
}

export interface ResultadoFinal {
  acertos: number;
  total: number;
  nota: number;
  nota_minima: number;
  aprovado: boolean;
  proxima_em: string | null;
}

export interface Certificado {
  codigo: string;
  nome: string;
  curso_titulo: string;
  carga_horaria_h: number;
  concluido_em: string;
}

/** Respostas no formato que as funções de correção esperam. */
export type Respostas = Record<string, string>;

const UUID = /^[0-9a-f-]{36}$/i;
const CODIGO_CERT = /^CYD-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/;
const SITUACOES: SituacaoFinal[] = ["aprovado", "sem_requisitos", "requisitos_pendentes", "sem_banco", "sem_tentativas", "aguarde", "disponivel"];

const ehObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const ehNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const ehTexto = (v: unknown): v is string => typeof v === "string";

function falha(): never {
  throw new ErroAvaliacao("falha");
}

function lerQuestoes(v: unknown): Questao[] {
  if (!Array.isArray(v)) falha();
  return v.map((q) => {
    if (!ehObj(q) || !ehTexto(q.id) || !ehTexto(q.enunciado) || !Array.isArray(q.alternativas) || q.alternativas.length < 2) falha();
    return {
      id: q.id,
      enunciado: q.enunciado,
      alternativas: q.alternativas.map((a) => {
        if (!ehObj(a) || !ehTexto(a.id) || !ehTexto(a.texto)) falha();
        return { id: a.id, texto: a.texto };
      }),
    };
  });
}

async function chamar(sb: SupabaseClient, nome: string, args: Record<string, unknown>): Promise<unknown> {
  const { data, error } = await sb.rpc(nome, args);
  if (error) throw new ErroAvaliacao(codigoDe(error.message));
  return data;
}

export async function buscarSituacao(sb: SupabaseClient, curso: string): Promise<Situacao> {
  const d = await chamar(sb, "academy_situacao_curso", { p_curso: curso });
  if (!ehObj(d) || !ehObj(d.requisitos) || !ehObj(d.aulas) || !Array.isArray(d.modulos) || !ehObj(d.final) || !ehObj(d.certificado)) falha();
  const r = d.requisitos;
  const f = d.final;
  const c = d.certificado;
  if (!SITUACOES.includes(f.situacao as SituacaoFinal)) falha();
  return {
    requisitos: {
      exige_todas_aulas: Boolean(r.exige_todas_aulas),
      exige_modulos: Boolean(r.exige_modulos),
      nota_minima_modulo: ehNum(r.nota_minima_modulo) ? r.nota_minima_modulo : 70,
      nota_minima_final: ehNum(r.nota_minima_final) ? r.nota_minima_final : 80,
      questoes_final: ehNum(r.questoes_final) ? r.questoes_final : 20,
      espera_final_horas: ehNum(r.espera_final_horas) ? r.espera_final_horas : 24,
      tentativas_final_max: ehNum(r.tentativas_final_max) ? r.tentativas_final_max : null,
      carga_horaria_h: ehNum(r.carga_horaria_h) ? r.carga_horaria_h : null,
    },
    aulas: { total: ehNum(d.aulas.total) ? d.aulas.total : 0, concluidas: ehNum(d.aulas.concluidas) ? d.aulas.concluidas : 0 },
    modulos: d.modulos.map((m) => {
      if (!ehObj(m) || !ehTexto(m.id) || !ehNum(m.ordem) || !ehTexto(m.titulo)) falha();
      return {
        id: m.id,
        ordem: m.ordem,
        titulo: m.titulo,
        tem_questoes: Boolean(m.tem_questoes),
        aprovado: Boolean(m.aprovado),
        liberado: Boolean(m.liberado),
      };
    }),
    final: {
      situacao: f.situacao as SituacaoFinal,
      prova_aberta: ehTexto(f.prova_aberta) ? f.prova_aberta : null,
      tentativas: ehNum(f.tentativas) ? f.tentativas : 0,
      melhor_nota: ehNum(f.melhor_nota) ? f.melhor_nota : null,
      proxima_em: ehTexto(f.proxima_em) ? f.proxima_em : null,
    },
    certificado: {
      elegivel: Boolean(c.elegivel),
      codigo: ehTexto(c.codigo) ? c.codigo : null,
      nome: ehTexto(c.nome) ? c.nome : null,
      concluido_em: ehTexto(c.concluido_em) ? c.concluido_em : null,
    },
  };
}

export async function buscarQuestoesModulo(sb: SupabaseClient, moduloId: string): Promise<QuestoesModulo> {
  const d = await chamar(sb, "academy_questoes_modulo", { p_modulo_id: moduloId });
  if (!ehObj(d) || !ehNum(d.nota_minima)) falha();
  return { modulo_id: moduloId, nota_minima: d.nota_minima, aprovado: Boolean(d.aprovado), questoes: lerQuestoes(d.questoes) };
}

/** Na ordem em que as questões apareceram para o aluno. */
function paraEnvio(ordem: Questao[], respostas: Respostas) {
  return ordem.map((q) => {
    const alternativa = respostas[q.id];
    if (!alternativa || !UUID.test(q.id) || !UUID.test(alternativa)) throw new ErroAvaliacao("falha");
    return { questao: q.id, alternativa };
  });
}

export async function responderModulo(sb: SupabaseClient, moduloId: string, questoes: Questao[], respostas: Respostas): Promise<ResultadoModulo> {
  const d = await chamar(sb, "academy_responder_modulo", { p_modulo_id: moduloId, p_respostas: paraEnvio(questoes, respostas) });
  if (!ehObj(d) || !ehNum(d.acertos) || !ehNum(d.total) || !ehNum(d.nota) || !ehNum(d.nota_minima) || !Array.isArray(d.correcao)) falha();
  return {
    acertos: d.acertos,
    total: d.total,
    nota: d.nota,
    nota_minima: d.nota_minima,
    aprovado: Boolean(d.aprovado),
    correcao: d.correcao.map((c) => {
      if (!ehObj(c) || !ehTexto(c.questao) || !ehTexto(c.escolhida) || !ehTexto(c.alternativa_correta)) falha();
      return {
        questao: c.questao,
        escolhida: c.escolhida,
        correta: Boolean(c.correta),
        alternativa_correta: c.alternativa_correta,
        explicacao: ehTexto(c.explicacao) && c.explicacao.trim() ? c.explicacao : null,
      };
    }),
  };
}

export async function iniciarFinal(sb: SupabaseClient, curso: string): Promise<ProvaFinal> {
  const d = await chamar(sb, "academy_iniciar_final", { p_curso: curso });
  if (!ehObj(d) || !ehTexto(d.prova_id) || !UUID.test(d.prova_id)) falha();
  return { prova_id: d.prova_id, iniciada_em: ehTexto(d.iniciada_em) ? d.iniciada_em : "", questoes: lerQuestoes(d.questoes) };
}

export async function enviarFinal(sb: SupabaseClient, prova: ProvaFinal, respostas: Respostas): Promise<ResultadoFinal> {
  const d = await chamar(sb, "academy_enviar_final", { p_prova_id: prova.prova_id, p_respostas: paraEnvio(prova.questoes, respostas) });
  if (!ehObj(d) || !ehNum(d.acertos) || !ehNum(d.total) || !ehNum(d.nota) || !ehNum(d.nota_minima)) falha();
  return {
    acertos: d.acertos,
    total: d.total,
    nota: d.nota,
    nota_minima: d.nota_minima,
    aprovado: Boolean(d.aprovado),
    proxima_em: ehTexto(d.proxima_em) ? d.proxima_em : null,
  };
}

export async function emitirCertificado(sb: SupabaseClient, curso: string, nome: string): Promise<Certificado> {
  const d = await chamar(sb, "academy_emitir_certificado", { p_curso: curso, p_nome: nome });
  if (!ehObj(d) || !ehTexto(d.codigo) || !CODIGO_CERT.test(d.codigo) || !ehTexto(d.nome) || !ehTexto(d.curso_titulo) || !ehNum(d.carga_horaria_h) || !ehTexto(d.concluido_em)) {
    falha();
  }
  return { codigo: d.codigo, nome: d.nome, curso_titulo: d.curso_titulo, carga_horaria_h: d.carga_horaria_h, concluido_em: d.concluido_em };
}

export interface CertificadoCompleto extends Certificado {
  modelo: "claro" | "tecnico" | "noturno";
  conteudo: string[];
}

/** Dados do próprio certificado para gerar o PDF (0017). Null se ainda não emitido. */
export async function buscarMeuCertificado(sb: SupabaseClient, curso: string): Promise<CertificadoCompleto | null> {
  const d = await chamar(sb, "academy_meu_certificado", { p_curso: curso });
  if (d === null) return null;
  if (
    !ehObj(d) ||
    !ehTexto(d.codigo) ||
    !CODIGO_CERT.test(d.codigo) ||
    !ehTexto(d.nome) ||
    !ehTexto(d.curso_titulo) ||
    !ehNum(d.carga_horaria_h) ||
    !ehTexto(d.concluido_em) ||
    (d.modelo !== "claro" && d.modelo !== "tecnico" && d.modelo !== "noturno") ||
    !Array.isArray(d.conteudo)
  ) {
    falha();
  }
  return {
    codigo: d.codigo,
    nome: d.nome,
    curso_titulo: d.curso_titulo,
    carga_horaria_h: d.carga_horaria_h,
    concluido_em: d.concluido_em,
    modelo: d.modelo,
    conteudo: d.conteudo.filter(ehTexto),
  };
}

export interface CertificadoPublico {
  codigo: string;
  nome: string;
  curso: string;
  carga_horaria_h: number;
  concluido_em: string;
}

/**
 * Aceita o código como o recrutador digitar: minúsculas, espaços, sem hífen.
 * Devolve null quando não dá para ser um código.
 */
export function normalizarCodigo(texto: string): string | null {
  const limpo = texto.toUpperCase().replace(/[^0-9A-Z]/g, "");
  const hex = limpo.startsWith("CYD") ? limpo.slice(3) : limpo;
  if (!/^[0-9A-F]{16}$/.test(hex)) return null;
  return `CYD-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;
}

/** Validação pública (0013): só código, nome, curso, carga horária e data. Null se não existir. */
export async function validarCertificado(sb: SupabaseClient, codigo: string): Promise<CertificadoPublico | null> {
  const d = await chamar(sb, "academy_validar_certificado", { p_codigo: codigo });
  if (d === null) return null;
  if (!ehObj(d) || !ehTexto(d.codigo) || !ehTexto(d.nome) || !ehTexto(d.curso) || !ehNum(d.carga_horaria_h) || !ehTexto(d.concluido_em)) falha();
  return { codigo: d.codigo, nome: d.nome, curso: d.curso, carga_horaria_h: d.carga_horaria_h, concluido_em: d.concluido_em };
}

/** Link "Adicionar ao perfil" do LinkedIn, já preenchido com o certificado. */
export function linkLinkedin(c: Pick<Certificado, "codigo" | "curso_titulo" | "concluido_em">, origem: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(c.concluido_em);
  const p = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: c.curso_titulo,
    organizationName: "CyDef Academy",
    certUrl: `${origem.replace(/\/$/, "")}/certificado/${c.codigo}`,
    certId: c.codigo,
  });
  if (m) {
    p.set("issueYear", m[1]!);
    p.set("issueMonth", String(Number(m[2])));
  }
  return `https://www.linkedin.com/profile/add?${p.toString()}`;
}

/** Mesmas regras do banco (academy_emitir_certificado): letras, espaço, ponto, hífen e apóstrofo. */
export function normalizarNome(nome: string): string {
  return nome.trim().replace(/\s+/g, " ");
}

export function nomeValido(nome: string): boolean {
  const n = normalizarNome(nome);
  return n.length >= 2 && n.length <= 120 && /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' .-]*[A-Za-zÀ-ÖØ-öø-ÿ.]$/.test(n);
}

/** Caminhos das telas novas. O módulo vai pela ordem, que é estável e legível. */
export const caminhoQuestoes = (slug: string, ordem: number) => `/cursos/${slug}/modulos/${ordem}/questoes`;
export const caminhoAvaliacao = (slug: string) => `/cursos/${slug}/avaliacao`;
export const caminhoCertificado = (slug: string) => `/cursos/${slug}/certificado`;

/** Primeiro módulo com questões ainda não aprovadas e liberado: é ele que segura o aluno. */
export function moduloPendente(s: Situacao): ModuloSituacao | null {
  return s.modulos.find((m) => m.tem_questoes && !m.aprovado && m.liberado) ?? null;
}

/** Mostra a avaliação final só quando ela existe para o aluno; o certificado só quando está liberado. */
export function mostraConclusao(s: Situacao | undefined): boolean {
  if (!s) return false;
  const f = s.final;
  return (
    Boolean(f.prova_aberta) ||
    ["disponivel", "aguarde", "aprovado", "sem_tentativas"].includes(f.situacao) ||
    s.certificado.elegivel ||
    Boolean(s.certificado.codigo)
  );
}

/** "18 de novembro de 2026", sem depender do fuso de quem lê (a data vem pronta do banco). */
export function dataPorExtenso(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${Number(m[3])} de ${meses[Number(m[2]) - 1] ?? ""} de ${m[1]}`;
}

/** "amanhã às 14:05" ou "20/11 às 09:30", no fuso de quem lê. */
export function quandoLibera(iso: string, agora = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const dia = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((dia(d) - dia(agora)) / 86_400_000);
  if (diff <= 0) return `hoje às ${hora}`;
  if (diff === 1) return `amanhã às ${hora}`;
  return `${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} às ${hora}`;
}
