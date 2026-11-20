import type { Evidencia, LinhaCampo, Severidade, TipoEvidencia } from "./missoes";

/**
 * Editor de missões (painel do instrutor): a missão vira campos de texto
 * simples e volta para o formato do banco ao salvar. Nada de JSON à mão.
 */

export interface PerguntaAdm {
  id: string;
  enunciado: string;
  dica: string;
  alternativas: string[];
  corretas: number[];
  explicacao: string;
}

export interface MissaoAdm {
  id: string;
  curso: string;
  codigo: string;
  slug: string;
  titulo: string;
  severidade: Severidade;
  mitre: string;
  briefing: string;
  requisito: "aulas" | "matricula";
  selo: string;
  encerramento: string;
  evidencias: Evidencia[];
  perguntas: PerguntaAdm[];
  competencias: { slug: string; peso: number }[];
  ordem: number;
  publicado: boolean;
  atualizado_em: string;
  tentativas: number;
  aprovados: number;
}

export interface MissoesAdm {
  missoes: MissaoAdm[];
  competencias: { slug: string; titulo: string }[];
}

export interface EvidenciaForm {
  id: string;
  tipo: TipoEvidencia;
  titulo: string;
  dica: string;
  // e-mail
  de: string;
  para: string;
  assunto: string;
  corpo: string;
  link_texto: string;
  link_destino: string;
  assinatura: string;
  // alerta
  alerta_titulo: string;
  alerta_subtitulo: string;
  /** Cabeçalhos, tabela, linhas do alerta ou texto livre, conforme o tipo. */
  texto: string;
}

export interface PerguntaForm {
  id: string;
  enunciado: string;
  dica: string;
  /** Uma alternativa por linha; as certas começam com *. */
  alternativas: string;
  explicacao: string;
}

export interface MissaoForm {
  id: string | null;
  codigo: string;
  titulo: string;
  severidade: Severidade;
  mitre: string;
  briefing: string;
  requisito: "aulas" | "matricula";
  selo: string;
  encerramento: string;
  publicado: boolean;
  competencias: Record<string, number>;
  evidencias: EvidenciaForm[];
  perguntas: PerguntaForm[];
}

export const TIPOS_EVIDENCIA: Record<TipoEvidencia, string> = {
  email: "E-mail",
  cabecalhos: "Cabeçalhos",
  tabela: "Tabela de logs",
  alerta: "Alerta do SIEM",
  texto: "Texto",
};

export const AJUDA_TEXTO: Partial<Record<TipoEvidencia, string>> = {
  cabecalhos: "Um cabeçalho por linha, como \"Reply-To: pagamentos@exemplo\". Linha sem nome de campo continua a anterior. Comece com ! para destacar em vermelho.",
  tabela: "Primeira linha: as colunas, separadas por |. Depois, uma linha de log por linha, com os valores na mesma ordem.",
  alerta: "Um campo por linha, como \"usuário: m.souza\". Comece com ! para destacar em vermelho.",
  texto: "Parágrafos separados por uma linha em branco.",
};

export const novoId = (prefixo: string) => `${prefixo}-${Math.random().toString(36).slice(2, 8)}`;

export function evidenciaVazia(tipo: TipoEvidencia = "email"): EvidenciaForm {
  return {
    id: novoId("e"), tipo, titulo: "", dica: "", de: "", para: "", assunto: "", corpo: "", link_texto: "", link_destino: "",
    assinatura: "", alerta_titulo: "", alerta_subtitulo: "", texto: "",
  };
}

export const perguntaVazia = (): PerguntaForm => ({ id: novoId("p"), enunciado: "", dica: "", alternativas: "", explicacao: "" });

function linhasCampo(linhas: LinhaCampo[], separador: string): string {
  return linhas.map((l) => `${l.destaque ? "!" : ""}${l.campo ? `${l.campo}${separador}${l.valor}` : `  ${l.valor}`}`).join("\n");
}

export function lerCabecalhos(texto: string): LinhaCampo[] {
  return texto
    .split("\n")
    .filter((l) => l.trim())
    .map((bruta) => {
      const destaque = bruta.trimStart().startsWith("!");
      const l = destaque ? bruta.trimStart().slice(1) : bruta;
      const m = /^([A-Za-z][A-Za-z0-9-]{0,78}:)\s*(.*)$/.exec(l.trim());
      if (m && !/^\s/.test(l)) return { campo: m[1]!, valor: m[2]!.trim(), destaque };
      return { campo: "", valor: l.trim(), destaque };
    });
}

export function lerCampos(texto: string): LinhaCampo[] {
  return texto
    .split("\n")
    .filter((l) => l.trim())
    .map((bruta) => {
      let l = bruta.trim();
      const destaque = l.startsWith("!");
      if (destaque) l = l.slice(1).trim();
      const i = l.indexOf(":");
      const extra = destaque ? { destaque: true } : {};
      return i > 0 ? { campo: l.slice(0, i).trim(), valor: l.slice(i + 1).trim(), ...extra } : { campo: l, valor: "", ...extra };
    });
}

export function lerTabela(texto: string): { colunas: string[]; linhas: string[][] } {
  const [cab = "", ...resto] = texto.split("\n").filter((l) => l.trim());
  const partir = (l: string) => l.split("|").map((c) => c.trim());
  return { colunas: partir(cab).filter(Boolean), linhas: resto.map(partir) };
}

export function paraForm(m: MissaoAdm | null): MissaoForm {
  if (!m)
    return {
      id: null, codigo: "", titulo: "", severidade: "media", mitre: "", briefing: "", requisito: "aulas", selo: "", encerramento: "",
      publicado: false, competencias: {}, evidencias: [evidenciaVazia()], perguntas: [perguntaVazia()],
    };
  return {
    id: m.id, codigo: m.codigo, titulo: m.titulo, severidade: m.severidade, mitre: m.mitre, briefing: m.briefing, requisito: m.requisito,
    selo: m.selo, encerramento: m.encerramento, publicado: m.publicado,
    competencias: Object.fromEntries(m.competencias.map((c) => [c.slug, c.peso])),
    evidencias: m.evidencias.map((e) => {
      const f = { ...evidenciaVazia(e.tipo), id: e.id, titulo: e.titulo, dica: e.dica ?? "" };
      switch (e.tipo) {
        case "email":
          return { ...f, ...e.conteudo, link_texto: e.conteudo.link_texto ?? "", link_destino: e.conteudo.link_destino ?? "", assinatura: e.conteudo.assinatura ?? "" };
        case "cabecalhos":
          return { ...f, texto: linhasCampo(e.conteudo.linhas, " ") };
        case "tabela":
          return { ...f, texto: [e.conteudo.colunas.join(" | "), ...e.conteudo.linhas.map((l) => l.join(" | "))].join("\n") };
        case "alerta":
          return { ...f, alerta_titulo: e.conteudo.titulo, alerta_subtitulo: e.conteudo.subtitulo ?? "", texto: linhasCampo(e.conteudo.linhas, ": ") };
        case "texto":
          return { ...f, texto: e.conteudo.texto };
      }
    }),
    perguntas: m.perguntas.map((p) => ({
      id: p.id,
      enunciado: p.enunciado,
      dica: p.dica ?? "",
      alternativas: p.alternativas.map((a, i) => `${p.corretas.includes(i) ? "* " : ""}${a}`).join("\n"),
      explicacao: p.explicacao,
    })),
  };
}

export function evidenciaParaBanco(f: EvidenciaForm): Evidencia {
  const base = { id: f.id, titulo: f.titulo.trim(), dica: f.dica.trim() };
  switch (f.tipo) {
    case "email":
      return {
        ...base, tipo: "email",
        conteudo: { de: f.de.trim(), para: f.para.trim(), assunto: f.assunto.trim(), corpo: f.corpo.trim(), link_texto: f.link_texto.trim(), link_destino: f.link_destino.trim(), assinatura: f.assinatura.trim() },
      };
    case "cabecalhos":
      return { ...base, tipo: "cabecalhos", conteudo: { linhas: lerCabecalhos(f.texto) } };
    case "tabela":
      return { ...base, tipo: "tabela", conteudo: lerTabela(f.texto) };
    case "alerta":
      return { ...base, tipo: "alerta", conteudo: { titulo: f.alerta_titulo.trim(), subtitulo: f.alerta_subtitulo.trim(), linhas: lerCampos(f.texto) } };
    case "texto":
      return { ...base, tipo: "texto", conteudo: { texto: f.texto.trim() } };
  }
}

export function perguntaParaBanco(f: PerguntaForm): PerguntaAdm {
  const linhas = f.alternativas.split("\n").map((l) => l.trim()).filter(Boolean);
  return {
    id: f.id,
    enunciado: f.enunciado.trim(),
    dica: f.dica.trim(),
    alternativas: linhas.map((l) => l.replace(/^\*\s*/, "")),
    corretas: linhas.flatMap((l, i) => (l.startsWith("*") ? [i] : [])),
    explicacao: f.explicacao.trim(),
  };
}

export function paraBanco(f: MissaoForm): Record<string, unknown> {
  return {
    ...(f.id ? { id: f.id } : {}),
    codigo: f.codigo.trim().toUpperCase(),
    titulo: f.titulo.trim(),
    severidade: f.severidade,
    mitre: f.mitre.trim(),
    briefing: f.briefing.trim(),
    requisito: f.requisito,
    selo: f.selo.trim(),
    encerramento: f.encerramento.trim(),
    publicado: f.publicado,
    competencias: Object.entries(f.competencias).map(([slug, peso]) => ({ slug, peso })),
    evidencias: f.evidencias.map(evidenciaParaBanco),
    perguntas: f.perguntas.map(perguntaParaBanco),
  };
}

/** Conferência antes de ir ao banco, com mensagem que aponta onde está o problema. */
export function conferir(f: MissaoForm): string | null {
  if (!/^[A-Z]{2,5}-[0-9]{3}$/.test(f.codigo.trim().toUpperCase())) return "Use um código como MSN-002.";
  for (const [i, e] of f.evidencias.entries()) {
    const n = `Evidência ${i + 1}`;
    if (e.titulo.trim().length < 2) return `${n}: dê um título para a aba.`;
    const b = evidenciaParaBanco(e);
    if (b.tipo === "email" && (!b.conteudo.de || !b.conteudo.assunto || !b.conteudo.corpo)) return `${n}: o e-mail precisa de remetente, assunto e corpo.`;
    if ((b.tipo === "cabecalhos" || b.tipo === "alerta") && b.conteudo.linhas.length === 0) return `${n}: escreva pelo menos uma linha.`;
    if (b.tipo === "alerta" && (!b.conteudo.titulo || b.conteudo.linhas.some((l) => !l.campo || !l.valor))) return `${n}: o alerta precisa de título e de linhas no formato "campo: valor".`;
    if (b.tipo === "tabela") {
      if (b.conteudo.colunas.length === 0 || b.conteudo.linhas.length === 0) return `${n}: a tabela precisa das colunas e de pelo menos uma linha.`;
      const ruim = b.conteudo.linhas.findIndex((l) => l.length !== b.conteudo.colunas.length);
      if (ruim >= 0) return `${n}: a linha ${ruim + 2} tem ${b.conteudo.linhas[ruim]!.length} valores, e a tabela tem ${b.conteudo.colunas.length} colunas.`;
    }
    if (b.tipo === "texto" && !b.conteudo.texto) return `${n}: escreva o texto.`;
  }
  for (const [i, p] of f.perguntas.entries()) {
    const n = `Pergunta ${i + 1}`;
    const b = perguntaParaBanco(p);
    if (b.enunciado.length < 5) return `${n}: escreva o enunciado.`;
    if (b.alternativas.length < 2 || b.alternativas.length > 8) return `${n}: use de 2 a 8 alternativas, uma por linha.`;
    if (b.corretas.length === 0) return `${n}: marque a certa começando a linha com *.`;
    if (b.explicacao.length < 5) return `${n}: escreva a explicação que o aluno vê depois de enviar.`;
  }
  return null;
}
