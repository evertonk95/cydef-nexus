import { useOutletContext } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { usePortal } from "./portal";

/**
 * Painel do instrutor (banco na 0015).
 *
 * Quem pode o quê é decidido nas funções `academy_adm_*`: o portal só esconde
 * o que a pessoa não pode usar. Toda escrita passa pelo servidor, que confere
 * o papel, valida os campos e grava na auditoria.
 */

export type Papel = "admin" | "instrutor";

export interface Eu {
  papel: Papel;
  cursos: string[];
  /** 0019: admin ou instrutor marcado como aprovador de material. */
  aprova_materiais?: boolean;
}

export type Nivel = "iniciante" | "intermediario" | "avancado";

export interface CursoResumoAdm {
  slug: string;
  titulo: string;
  nivel: Nivel;
  gratuito: boolean;
  publicado: boolean;
  ordem: number;
  modulos: number;
  aulas: number;
  aulas_publicadas: number;
  aulas_sem_video: number;
  questoes: number;
  questoes_publicadas: number;
}

export interface AulaAdm {
  id: string;
  modulo_id: string;
  ordem: number;
  numero: number;
  titulo: string;
  resumo: string;
  duracao_seg: number;
  video_provedor: "youtube" | "bunny" | null;
  video_ref: string | null;
  publicado: boolean;
  atualizado_em: string;
  alunos_com_progresso: number;
}

export interface ModuloAdm {
  id: string;
  ordem: number;
  titulo: string;
  /** Ementa do módulo (0016). */
  resumo?: string;
  questoes: number;
  questoes_publicadas: number;
  aulas: AulaAdm[];
}

export interface Requisitos {
  exige_todas_aulas: boolean;
  exige_modulos: boolean;
  nota_minima_modulo: number;
  questoes_modulo: number;
  nota_minima_final: number;
  questoes_final: number;
  espera_final_horas: number;
  tentativas_final_max: number | null;
  carga_horaria_h: number | null;
  certificado_ativo: boolean;
  /** 0017. Vazio: automático (gratuito usa claro, pago usa tecnico). */
  modelo_certificado?: "claro" | "tecnico" | null;
}

export interface CursoAdm {
  slug: string;
  titulo: string;
  descricao: string;
  nivel: Nivel;
  gratuito: boolean;
  publicado: boolean;
  ordem: number;
  eh_admin: boolean;
  requisitos: Requisitos | null;
  /** Sobre o curso (0016). */
  objetivos?: string[];
  publico?: string;
  pre_requisitos?: string;
  instrutores?: VinculoInstrutor[];
  questoes_final: number;
  questoes_final_publicadas: number;
  modulos: ModuloAdm[];
}

export interface PerfilInstrutor {
  id: string | null;
  nome: string;
  cargo: string;
  bio: string;
  linkedin: string | null;
  site: string | null;
  /** Tem conta na equipe (edita o próprio perfil). Falso: convidado. */
  da_equipe: boolean;
  eu: boolean;
}

export type PapelNoCurso = "instrutor" | "convidado";

export interface VinculoInstrutor {
  papel: PapelNoCurso;
  ordem: number;
  instrutor: PerfilInstrutor & { id: string };
}

export interface InstrutoresDoCurso {
  do_curso: VinculoInstrutor[];
  disponiveis: (PerfilInstrutor & { id: string })[];
}

export interface AlternativaAdm {
  ordem: number;
  texto: string;
  correta: boolean;
}

export interface QuestaoAdm {
  id: string;
  modulo_id: string | null;
  enunciado: string;
  explicacao: string;
  publicado: boolean;
  atualizado_em: string;
  em_uso: boolean;
  alternativas: AlternativaAdm[];
}

export type TipoAviso = "atualizacao" | "ameaca" | "missao" | "aula";

export interface AvisoAdm {
  id: string;
  tipo: TipoAviso;
  titulo: string;
  link: string | null;
  publicado: boolean;
  publicado_em: string;
}

export interface MembroEquipe {
  aprova_materiais?: boolean;
  user_id: string;
  email: string;
  nome: string | null;
  papel: Papel;
  eu: boolean;
  cursos: string[];
}

// Erros ----------------------------------------------------------------------

/** Mensagem de cada código que o banco devolve, na voz do painel. */
const MENSAGENS: Record<string, string> = {
  sem_permissao: "Seu acesso não permite essa alteração.",
  nao_autenticado: "Sua sessão expirou. Entre de novo.",
  curso_inexistente: "Curso não encontrado.",
  modulo_inexistente: "Módulo não encontrado neste curso.",
  aula_inexistente: "Aula não encontrada.",
  questao_inexistente: "Questão não encontrada.",
  aviso_inexistente: "Aviso não encontrado.",
  slug_invalido: "O endereço do curso aceita só letras minúsculas, números e hífen.",
  slug_em_uso: "Já existe um curso com esse endereço.",
  titulo_invalido: "Confira o tamanho do título.",
  descricao_invalida: "A descrição passa de 600 caracteres.",
  nivel_invalido: "Escolha um nível válido.",
  resumo_invalido: "O resumo passa de 1.200 caracteres.",
  duracao_invalida: "A duração precisa ficar entre 0:30 e 4:00:00.",
  video_invalido: "Não reconheci o vídeo. Cole o link do YouTube ou o código do vídeo.",
  aula_sem_video: "Para publicar a aula, informe o vídeo.",
  aula_em_uso: "Aula publicada ou já assistida por aluno não pode ser excluída. Despublique se precisar tirar do ar.",
  modulo_nao_vazio: "Só dá para excluir módulo sem aulas e sem questões.",
  limite: "Já está na ponta.",
  enunciado_invalido: "O enunciado precisa ter entre 10 e 2.000 caracteres.",
  explicacao_invalida: "A explicação passa de 2.000 caracteres.",
  alternativas_invalidas: "Use de 2 a 8 alternativas, todas preenchidas.",
  correta_invalida: "Marque exatamente uma alternativa correta.",
  questao_em_uso: "Questão já respondida por aluno não pode ser excluída. Despublique para tirar das próximas provas.",
  requisitos_invalidos: "Algum valor está fora da faixa permitida.",
  tipo_invalido: "Escolha o tipo do aviso.",
  link_invalido: "O link precisa começar com https://.",
  usuario_inexistente: "Não há conta no portal com esse e-mail. A pessoa precisa entrar na Academy uma vez antes.",
  papel_invalido: "Escolha o papel.",
  cursos_invalidos: "Escolha ao menos um curso para o instrutor.",
  ultimo_admin: "A Academy precisa de pelo menos um admin.",
  invalid_payload: "Algum campo veio em formato inválido.",
  objetivos_invalidos: "Use até 10 objetivos, com até 200 caracteres cada.",
  publico_invalido: "O texto de público passa de 600 caracteres.",
  pre_requisitos_invalidos: "Os pré-requisitos passam de 600 caracteres.",
  nome_invalido: "O nome precisa ter entre 2 e 80 caracteres.",
  cargo_invalido: "O cargo passa de 120 caracteres.",
  bio_invalida: "A bio passa de 1.200 caracteres.",
  linkedin_invalido: "O LinkedIn precisa ser um link https://www.linkedin.com/…",
  instrutor_inexistente: "Instrutor não encontrado.",
  tipo_nao_permitido: "Tipo de arquivo não aceito. Use PDF, Word, Excel, PowerPoint, CSV, Markdown, texto ou ZIP.",
  arquivo_grande: "Arquivo grande demais: até 25 MB para documentos e 50 MB para ZIP.",
  arquivo_vazio: "O arquivo está vazio.",
  conteudo_divergente: "O conteúdo do arquivo não corresponde à extensão. Confira se o arquivo não foi renomeado.",
  macro: "Arquivo do Office com macro não é aceito. Salve sem macro (.docx, .xlsx ou .pptx) e envie de novo.",
  texto_invalido: "Arquivo de texto precisa estar em UTF-8, sem conteúdo binário.",
  nome_arquivo_invalido: "O nome do arquivo precisa ter entre 3 e 160 caracteres.",
  arquivo_ausente: "O arquivo não chegou ao armazenamento. Envie de novo.",
  arquivo_divergente: "O arquivo gravado não bate com o enviado. Envie de novo.",
  falha_envio: "Não foi possível enviar o arquivo. Confira a conexão e tente de novo.",
  falha_download: "Não foi possível baixar o arquivo agora.",
  material_inexistente: "Material não encontrado ou já revisado.",
  mesma_pessoa: "Quem enviou o arquivo não pode aprovar. Outra pessoa precisa revisar.",
  motivo_obrigatorio: "Escreva o motivo da recusa (pelo menos 5 caracteres).",
  situacao_invalida: "Escolha onde o curso aparece.",
  checkout_invalido: "Cole o link de checkout da Hotmart, que começa com https://pay.hotmart.com/.",
  produto_invalido: "O código do produto na Hotmart tem só números.",
  produto_em_uso: "Esse produto da Hotmart já está ligado a outro curso.",
  preco_invalido: "Informe o preço em reais, entre R$ 1,00 e R$ 100.000,00.",
  observacao_invalida: "A observação do preço passa de 80 caracteres.",
  curso_gratuito: "Curso gratuito não entra na vitrine paga. Ele aparece na seção de cursos gratuitos do site.",
  curso_nao_publicado: "Publique o curso antes de colocar à venda.",
  venda_incompleta: "Para colocar à venda, informe o link de checkout e o preço.",
  trilha_inexistente: "Trilha não encontrada.",
  curso_fora_da_trilha: "Esse curso não está nessa trilha.",
};

export class ErroPainel extends Error {
  constructor(public readonly codigo: string) {
    super(MENSAGENS[codigo] ?? "Não foi possível salvar. Tente de novo.");
  }
}

/** Curso que não existe ou que a pessoa não pode editar: a tela trata como 404. */
export function semAcesso(e: unknown): boolean {
  return e instanceof ErroPainel && (e.codigo === "sem_permissao" || e.codigo === "curso_inexistente");
}

function codigoDe(mensagem?: string): string {
  return Object.keys(MENSAGENS).find((c) => mensagem?.includes(c)) ?? "falha";
}

export async function chamar<T>(sb: SupabaseClient, fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await sb.rpc(fn, args);
  if (error) throw new ErroPainel(codigoDe(error.message));
  return data as T;
}

// Vídeo e duração -----------------------------------------------------------

const ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;

/**
 * Código do vídeo a partir do que o instrutor colar: link do YouTube (watch,
 * youtu.be, embed, shorts, live, nocookie) ou o código puro de 11 caracteres.
 */
export function extrairYoutube(texto: string): string | null {
  const t = texto.trim();
  if (ID_YOUTUBE.test(t)) return t;
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www|m|music)\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = u.pathname.split("/")[1] ?? null;
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else {
      const [, tipo, ref] = u.pathname.split("/");
      if (tipo && ["embed", "shorts", "live", "v"].includes(tipo)) id = ref ?? null;
    }
  }
  return id && ID_YOUTUBE.test(id) ? id : null;
}

/** "12:30", "1:02:03" ou "750" (segundos) em segundos. Null se não entender. */
export function lerDuracao(texto: string): number | null {
  const t = texto.trim();
  if (/^\d+$/.test(t)) return Number(t);
  const m = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return null;
  const [, h, min, s] = m;
  if (Number(s) > 59 || (h !== undefined && Number(min) > 59)) return null;
  return Number(h ?? 0) * 3600 + Number(min) * 60 + Number(s);
}

export function escreverDuracao(seg: number): string {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  const dd = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${dd(m)}:${dd(s)}` : `${m}:${dd(s)}`;
}

export const NIVEIS: { valor: Nivel; rotulo: string }[] = [
  { valor: "iniciante", rotulo: "Iniciante" },
  { valor: "intermediario", rotulo: "Intermediário" },
  { valor: "avancado", rotulo: "Avançado" },
];

export const TIPOS_AVISO: { valor: TipoAviso; rotulo: string }[] = [
  { valor: "atualizacao", rotulo: "Atualização" },
  { valor: "aula", rotulo: "Aula nova" },
  { valor: "ameaca", rotulo: "Ameaça" },
  { valor: "missao", rotulo: "Missão" },
];

/** Situação da aula como o aluno vê. */
export function estadoAula(a: Pick<AulaAdm, "publicado" | "video_ref">): "publicada" | "rascunho" | "sem_video" {
  if (a.publicado) return "publicada";
  return a.video_ref ? "rascunho" : "sem_video";
}

/** Endereço sugerido a partir do título: sem acento, minúsculo, com hífen. */
export function sugerirSlug(titulo: string): string {
  return titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

// Consultas -----------------------------------------------------------------

/** Papel de quem está logado no painel. Null para aluno. */
export function useEquipe() {
  const { sb, sessao } = usePortal();
  return useQuery({
    queryKey: ["adm", "eu", sessao?.user.id],
    queryFn: () => chamar<Eu | null>(sb, "academy_adm_eu"),
    enabled: Boolean(sessao),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

/** Papel de quem está na área do instrutor (vem do layout, já conferido). */
export function useEu(): Eu {
  return useOutletContext<Eu>();
}

export function useCursosAdm() {
  const { sb } = usePortal();
  return useQuery({ queryKey: ["adm", "cursos"], queryFn: () => chamar<CursoResumoAdm[]>(sb, "academy_adm_cursos") });
}

export function useCursoAdm(slug: string) {
  const { sb } = usePortal();
  return useQuery({
    queryKey: ["adm", "curso", slug],
    queryFn: () => chamar<CursoAdm | null>(sb, "academy_adm_curso", { p_slug: slug }),
    enabled: Boolean(slug),
  });
}

export function useQuestoesAdm(slug: string) {
  const { sb } = usePortal();
  return useQuery({
    queryKey: ["adm", "questoes", slug],
    queryFn: () => chamar<QuestaoAdm[]>(sb, "academy_adm_questoes", { p_curso: slug }),
    enabled: Boolean(slug),
  });
}

export function useInstrutoresAdm(slug: string) {
  const { sb } = usePortal();
  return useQuery({
    queryKey: ["adm", "instrutores", slug],
    queryFn: () => chamar<InstrutoresDoCurso>(sb, "academy_adm_instrutores", { p_curso: slug }),
    enabled: Boolean(slug),
  });
}

export function useMeuPerfil() {
  const { sb, sessao } = usePortal();
  return useQuery({
    queryKey: ["adm", "perfil", sessao?.user.id],
    queryFn: () => chamar<PerfilInstrutor>(sb, "academy_adm_meu_perfil"),
    enabled: Boolean(sessao),
  });
}

export function useMateriaisAdm(slug: string) {
  const { sb } = usePortal();
  return useQuery({
    queryKey: ["adm", "materiais", slug],
    queryFn: () => chamar<import("./materiais").MaterialAdm[]>(sb, "academy_adm_materiais", { p_curso: slug }),
    enabled: Boolean(slug),
  });
}

export function useAprovacoes() {
  const { sb } = usePortal();
  return useQuery({ queryKey: ["adm", "aprovacoes"], queryFn: () => chamar<import("./materiais").MaterialAdm[]>(sb, "academy_adm_aprovacoes") });
}

export function useBoletimAdm() {
  const { sb } = usePortal();
  return useQuery({ queryKey: ["adm", "boletim"], queryFn: () => chamar<AvisoAdm[]>(sb, "academy_adm_boletim") });
}

export function useEquipeAdm() {
  const { sb } = usePortal();
  return useQuery({ queryKey: ["adm", "equipe"], queryFn: () => chamar<MembroEquipe[]>(sb, "academy_adm_equipe") });
}

/**
 * Escrita no painel. Depois de salvar, atualiza o que o painel mostra e
 * descarta o cache do lado do aluno (o próprio instrutor também é aluno).
 */
export function useAcao<A, R>(fn: (sb: SupabaseClient, args: A) => Promise<R>, aoSalvar?: (r: R, args: A) => void) {
  const { sb } = usePortal();
  const qc = useQueryClient();
  return useMutation<R, ErroPainel, A>({
    mutationFn: (args) => fn(sb, args),
    onSuccess: (r, args) => {
      aoSalvar?.(r, args);
      void qc.invalidateQueries();
    },
  });
}
