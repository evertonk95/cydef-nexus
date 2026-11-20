import { useQuery } from "@tanstack/react-query";
import { usePortal } from "./portal";
import { chamar } from "./instrutor";

/**
 * Missões de SOC (banco na 0026). Caso prático no fim de um curso: evidências,
 * investigação e correção com explicação. O gabarito só chega depois do envio.
 */

export type Severidade = "baixa" | "media" | "alta" | "critica";
export type SituacaoMissao = "liberada" | "aulas_pendentes" | "sem_matricula";

export const SEVERIDADE: Record<Severidade, string> = { baixa: "Baixa", media: "Média", alta: "Alta", critica: "Crítica" };

export interface MissaoResumo {
  id: string;
  codigo: string;
  slug: string;
  titulo: string;
  severidade: Severidade;
  mitre: string;
  briefing: string;
  selo: string;
  requisito: "aulas" | "matricula";
  curso: string;
  curso_titulo: string;
  perguntas_total: number;
  competencias: { slug: string; titulo: string }[];
  situacao: SituacaoMissao;
  aulas_total: number;
  aulas_concluidas: number;
  melhor_nota?: number | null;
  aprovada: boolean;
  tentativas?: number;
}

export interface LinhaCampo {
  campo: string;
  valor: string;
  destaque?: boolean;
}

export type Evidencia =
  | { id: string; tipo: "email"; titulo: string; dica: string; conteudo: { de: string; para: string; assunto: string; corpo: string; link_texto?: string; link_destino?: string; assinatura?: string } }
  | { id: string; tipo: "cabecalhos"; titulo: string; dica: string; conteudo: { linhas: LinhaCampo[] } }
  | { id: string; tipo: "tabela"; titulo: string; dica: string; conteudo: { colunas: string[]; linhas: string[][] } }
  | { id: string; tipo: "alerta"; titulo: string; dica: string; conteudo: { titulo: string; subtitulo?: string; linhas: LinhaCampo[] } }
  | { id: string; tipo: "texto"; titulo: string; dica: string; conteudo: { texto: string } };

export type TipoEvidencia = Evidencia["tipo"];

export interface PerguntaAluno {
  id: string;
  enunciado: string;
  dica: string;
  alternativas: string[];
  multipla: boolean;
}

export interface CorrecaoPergunta {
  id: string;
  enunciado: string;
  alternativas: string[];
  escolhidas: number[];
  corretas: number[];
  explicacao: string;
  acertou: boolean;
}

export interface Tentativa {
  id: string;
  enviada_em: string;
  acertos: number;
  total: number;
  nota: number;
  aprovado: boolean;
  duracao_seg: number;
  evidencias: string[];
  correcao: CorrecaoPergunta[];
  encerramento: string;
  competencias: { slug: string; titulo: string; antes: number; depois: number }[];
}

export interface Missao extends MissaoResumo {
  evidencias: Evidencia[];
  perguntas: PerguntaAluno[];
  aberta: { iniciada_em: string } | null;
  ultima: Tentativa | null;
  encerramento: string;
}

export type Respostas = Record<string, number[]>;

/** Missões publicadas dos cursos do aluno. Banco antes da 0026: nenhuma. */
export function useMissoes() {
  const { sb, sessao } = usePortal();
  return useQuery({
    queryKey: ["missoes", sessao?.user.id],
    enabled: !!sessao,
    queryFn: async () => {
      try {
        const r = await chamar<MissaoResumo[]>(sb, "academy_minhas_missoes");
        return Array.isArray(r) ? r : [];
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });
}

export function useMissao(slug: string) {
  const { sb } = usePortal();
  return useQuery({ queryKey: ["missao", slug], queryFn: () => chamar<Missao>(sb, "academy_missao", { p_slug: slug }) });
}

/** "07:05" ou "1:02:03". */
export function cronometro(seg: number): string {
  const s = Math.max(0, Math.floor(seg));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${String(m).padStart(2, "0")}:${r}`;
}

/** Texto curto que identifica uma evidência fixada (vai junto com a investigação). */
export function chaveLinha(aba: string, partes: string[]): string {
  return `${aba} · ${partes.map((p) => p.trim()).filter(Boolean).join(" ")}`.slice(0, 160);
}

/** Respostas completas: toda pergunta com pelo menos uma alternativa. */
export function respondidas(perguntas: PerguntaAluno[], r: Respostas): number {
  return perguntas.filter((p) => (r[p.id]?.length ?? 0) > 0).length;
}

export function motivoBloqueio(m: Pick<MissaoResumo, "situacao" | "curso_titulo" | "aulas_total" | "aulas_concluidas">): string {
  if (m.situacao === "sem_matricula") return `Disponível para quem está no curso ${m.curso_titulo}.`;
  return `Conclua as aulas de ${m.curso_titulo} para liberar: ${m.aulas_concluidas} de ${m.aulas_total}.`;
}

// Rascunho da investigação no navegador (sobrevive a recarregar a página).
// O armazenamento pode falhar (modo privado, cota): sem ele, segue sem rascunho.

interface Rascunho {
  respostas: Respostas;
  fixadas: string[];
}

const chaveRascunho = (slug: string, inicio: string) => `academy:missao:${slug}:${inicio}`;

export function lerRascunho(slug: string, inicio: string): Rascunho {
  try {
    const v = sessionStorage.getItem(chaveRascunho(slug, inicio));
    if (!v) return { respostas: {}, fixadas: [] };
    const r = JSON.parse(v) as Rascunho;
    return { respostas: r.respostas ?? {}, fixadas: Array.isArray(r.fixadas) ? r.fixadas : [] };
  } catch {
    return { respostas: {}, fixadas: [] };
  }
}

export function gravarRascunho(slug: string, inicio: string, r: Rascunho) {
  try {
    sessionStorage.setItem(chaveRascunho(slug, inicio), JSON.stringify(r));
  } catch {
    // sem rascunho
  }
}

export function apagarRascunho(slug: string, inicio: string) {
  try {
    sessionStorage.removeItem(chaveRascunho(slug, inicio));
  } catch {
    // nada a apagar
  }
}
