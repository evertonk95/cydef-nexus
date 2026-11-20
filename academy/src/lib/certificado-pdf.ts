/**
 * Certificado em PDF, gerado no navegador (fase 10).
 *
 * Reproduz os modelos aprovados pelo Everton em 18/11/2026 (artefato
 * "Certificado CyDef Academy: propostas"): B, Clássico claro, para curso
 * gratuito, e C, Técnico, para curso pago. As medidas abaixo estão em pixels
 * do desenho original (1123 x 794, A4 deitado a 96 dpi) e são convertidas
 * para pontos do PDF. Texto, linhas e QR code saem em vetor; as fontes vão
 * embutidas só com os caracteres usados.
 *
 * Este módulo é carregado só quando o aluno pede o PDF.
 */
import { PDFDocument, rgb, setCharacterSpacing, type PDFFont, type PDFImage, type PDFPage, type RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import qrcode from "qrcode-generator";
import { dataPorExtenso } from "./avaliacao";

export type ModeloCertificado = "claro" | "tecnico" | "noturno";

export interface DadosCertificado {
  codigo: string;
  nome: string;
  curso_titulo: string;
  carga_horaria_h: number;
  concluido_em: string;
  modelo: ModeloCertificado;
  conteudo: string[];
}

export interface Recursos {
  interRegular: ArrayBuffer;
  interSemi: ArrayBuffer;
  groteskBold: ArrayBuffer;
  groteskSemi: ArrayBuffer;
  mono: ArrayBuffer;
  icone: ArrayBuffer;
}

/** Endereço público de validação do código. */
export function urlValidacao(origem: string, codigo: string): string {
  return `${origem.replace(/\/$/, "")}/certificado/${codigo}`;
}

/** "6 horas", "1 hora", "7,5 horas". */
export function cargaPorExtenso(h: number): string {
  const n = Number.isInteger(h) ? String(h) : String(h).replace(".", ",");
  return `${n} ${h === 1 ? "hora" : "horas"}`;
}

/** Nome do arquivo: certificado-cybersecurity-fundamentals-CYD-XXXX.pdf */
export function nomeArquivo(d: Pick<DadosCertificado, "curso_titulo" | "codigo">): string {
  const curso = d.curso_titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `certificado-${curso}-${d.codigo}.pdf`;
}

// Geometria -------------------------------------------------------------------

const LARGURA = 1123;
const ALTURA = 794;
const PT_W = 841.89;
const PT_H = 595.28;
const S = PT_W / LARGURA;

const cor = (hex: string): RGB => {
  const n = parseInt(hex.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const C = {
  tinta: cor("#141416"),
  texto: cor("#2a2a2e"),
  apoio: cor("#55555b"),
  linha: cor("#e4e4e7"),
  chip: cor("#d4d4d8"),
  laranja: cor("#f97316"),
  laranjaEscuro: cor("#c2410c"),
  laranjaClaro: cor("#fb923c"),
  selo: cor("#fff7ed"),
  noite: cor("#0e0e10"),
  claroNoite: cor("#f5f5f4"),
  apoioNoite: cor("#a8a8ad"),
  branco: rgb(1, 1, 1),
};

interface Fontes {
  regular: PDFFont;
  semi: PDFFont;
  titulo: PDFFont;
  tituloSemi: PDFFont;
  mono: PDFFont;
}

interface Trecho {
  texto: string;
  fonte: PDFFont;
  cor?: RGB;
}

class Tela {
  constructor(
    readonly page: PDFPage,
    readonly f: Fontes,
  ) {}

  largura(texto: string, fonte: PDFFont, tam: number, espaco = 0): number {
    return fonte.widthOfTextAtSize(texto, tam) + espaco * tam * Math.max(0, [...texto].length - 1);
  }

  /**
   * Texto numa linha. `y` é o topo da caixa de linha (como no CSS), `alt` a
   * altura da linha; a linha de base fica centrada nela.
   */
  texto(t: string, o: { x: number; y: number; tam: number; fonte: PDFFont; cor: RGB; espaco?: number; alinhar?: "esq" | "centro" | "dir"; alt?: number }) {
    const espaco = o.espaco ?? 0;
    const w = this.largura(t, o.fonte, o.tam, espaco);
    const x = o.alinhar === "centro" ? o.x - w / 2 : o.alinhar === "dir" ? o.x - w : o.x;
    const alt = o.alt ?? o.tam * 1.2;
    const base = o.y + alt / 2 + o.tam * 0.36;
    if (espaco) this.page.pushOperators(setCharacterSpacing(espaco * o.tam * S));
    this.page.drawText(t, { x: x * S, y: PT_H - base * S, size: o.tam * S, font: o.fonte, color: o.cor });
    if (espaco) this.page.pushOperators(setCharacterSpacing(0));
    return w;
  }

  /** Quebra trechos (com fontes diferentes) em linhas de no máximo `max`. */
  quebrar(trechos: Trecho[], tam: number, max: number): Trecho[][] {
    const palavras: Trecho[] = [];
    for (const tr of trechos) {
      for (const p of tr.texto.split(/(\s+)/)) if (p) palavras.push({ ...tr, texto: p });
    }
    const linhas: Trecho[][] = [];
    let atual: Trecho[] = [];
    let w = 0;
    for (const p of palavras) {
      const branco = /^\s+$/.test(p.texto);
      const pw = this.largura(p.texto, p.fonte, tam);
      if (!branco && w + pw > max && atual.length > 0) {
        while (atual.length && /^\s+$/.test(atual[atual.length - 1]!.texto)) atual.pop();
        linhas.push(atual);
        atual = [];
        w = 0;
      }
      if (branco && atual.length === 0) continue;
      atual.push(p);
      w += pw;
    }
    while (atual.length && /^\s+$/.test(atual[atual.length - 1]!.texto)) atual.pop();
    if (atual.length) linhas.push(atual);
    return linhas;
  }

  /** Parágrafo com trechos. Devolve a altura ocupada. */
  /**
   * Menor largura que mantém o mesmo número de linhas: linhas de tamanho
   * parecido, sem palavra sozinha no fim (o text-wrap: balance do CSS).
   */
  equilibrar(trechos: Trecho[], tam: number, max: number): number {
    const n = this.quebrar(trechos, tam, max).length;
    if (n < 2) return max;
    let lo = max / n;
    let hi = max;
    for (let i = 0; i < 18; i++) {
      const meio = (lo + hi) / 2;
      if (this.quebrar(trechos, tam, meio).length > n) lo = meio;
      else hi = meio;
    }
    return hi + 0.5;
  }

  paragrafo(
    trechos: Trecho[],
    o: { x: number; y: number; tam: number; max: number; alt: number; cor: RGB; alinhar?: "esq" | "centro" | "dir"; equilibrado?: boolean },
  ): number {
    const max = o.equilibrado ? this.equilibrar(trechos, o.tam, o.max) : o.max;
    const linhas = this.quebrar(trechos, o.tam, max);
    linhas.forEach((linha, i) => {
      const total = linha.reduce((s, t) => s + this.largura(t.texto, t.fonte, o.tam), 0);
      let x = o.alinhar === "centro" ? o.x - total / 2 : o.alinhar === "dir" ? o.x - total : o.x;
      for (const t of linha) {
        x += this.texto(t.texto, { x, y: o.y + i * o.alt, tam: o.tam, fonte: t.fonte, cor: t.cor ?? o.cor, alt: o.alt });
      }
    });
    return linhas.length * o.alt;
  }

  medirParagrafo(trechos: Trecho[], tam: number, max: number, alt: number): number {
    return this.quebrar(trechos, tam, max).length * alt;
  }

  retangulo(x: number, y: number, w: number, h: number, o: { fundo?: RGB; borda?: RGB; esp?: number }) {
    this.page.drawRectangle({
      x: x * S,
      y: PT_H - (y + h) * S,
      width: w * S,
      height: h * S,
      color: o.fundo,
      borderColor: o.borda,
      borderWidth: o.borda ? (o.esp ?? 1) * S : undefined,
    });
  }

  /** Retângulo de cantos arredondados (chip e moldura do QR). */
  arredondado(x: number, y: number, w: number, h: number, r: number, o: { fundo?: RGB; borda?: RGB; esp?: number }) {
    const k = r;
    const p = `M ${k} 0 H ${w - k} A ${k} ${k} 0 0 1 ${w} ${k} V ${h - k} A ${k} ${k} 0 0 1 ${w - k} ${h} H ${k} A ${k} ${k} 0 0 1 0 ${h - k} V ${k} A ${k} ${k} 0 0 1 ${k} 0 Z`;
    this.page.drawSvgPath(p, {
      x: x * S,
      y: PT_H - y * S,
      scale: S,
      color: o.fundo,
      borderColor: o.borda,
      borderWidth: o.borda ? (o.esp ?? 1) : undefined,
    });
  }

  circulo(cx: number, cy: number, r: number, o: { fundo?: RGB; borda?: RGB; esp?: number }) {
    this.page.drawCircle({ x: cx * S, y: PT_H - cy * S, size: r * S, color: o.fundo, borderColor: o.borda, borderWidth: o.borda ? (o.esp ?? 1) * S : undefined });
  }

  imagem(img: PDFImage, x: number, y: number, lado: number) {
    this.page.drawImage(img, { x: x * S, y: PT_H - (y + lado) * S, width: lado * S, height: lado * S });
  }

  /** QR code em vetor: um retângulo por trecho escuro de cada linha. */
  qr(url: string, x: number, y: number, lado: number, tinta: RGB) {
    const q = qrcode(0, "M");
    q.addData(url);
    q.make();
    const n = q.getModuleCount();
    const m = lado / n;
    for (let r = 0; r < n; r++) {
      let c = 0;
      while (c < n) {
        if (!q.isDark(r, c)) {
          c++;
          continue;
        }
        let fim = c;
        while (fim < n && q.isDark(r, fim)) fim++;
        // Sobreposição mínima para não aparecer fresta entre módulos.
        this.retangulo(x + c * m, y + r * m, (fim - c) * m + 0.15, m + 0.15, { fundo: tinta });
        c = fim;
      }
    }
  }

  /** Selo da CyDef Academy: círculo com o símbolo e o nome embaixo. Topo em `y`. */
  selo(cx: number, y: number, icone: PDFImage, rotuloCor: RGB) {
    this.circulo(cx, y + 42, 41, { fundo: C.selo, borda: C.laranja, esp: 2 });
    this.imagem(icone, cx - 27, y + 15, 54);
    this.texto("CYDEF ACADEMY", { x: cx, y: y + 92, tam: 11, fonte: this.f.mono, cor: rotuloCor, espaco: 0.18, alinhar: "centro", alt: 14 });
  }

  /** "CyDef Academy" com "Academy" em laranja. */
  marca(x: number, y: number, tam: number, corNome: RGB, corAcademy: RGB, alinhar: "esq" | "centro" = "esq") {
    const a = "CyDef ";
    const b = "Academy";
    const wa = this.largura(a, this.f.titulo, tam);
    const wb = this.largura(b, this.f.titulo, tam);
    const x0 = alinhar === "centro" ? x - (wa + wb) / 2 : x;
    this.texto(a, { x: x0, y, tam, fonte: this.f.titulo, cor: corNome });
    this.texto(b, { x: x0 + wa, y, tam, fonte: this.f.titulo, cor: corAcademy });
    return wa + wb;
  }

  /** Maior tamanho (até `max`) em que o nome cabe em até duas linhas equilibradas. */
  ajustarNome(nome: string, maxTam: number, minTam: number, largura: number) {
    const t0 = [{ texto: nome, fonte: this.f.titulo }];
    let tam = minTam;
    for (let t = maxTam; t >= minTam; t -= 2) {
      if (this.quebrar(t0, t, largura).length <= 2) {
        tam = t;
        break;
      }
    }
    const linhas = this.quebrar(t0, tam, this.equilibrar(t0, tam, largura));
    return { tam, linhas: linhas.map((l) => l.map((x) => x.texto).join("")) };
  }
}

// Modelo B: Clássico claro (curso gratuito) ---------------------------------

function desenharClaro(t: Tela, d: DadosCertificado, icone: PDFImage, url: string) {
  const { f } = t;
  const cx = LARGURA / 2;
  t.retangulo(28, 28, LARGURA - 56, ALTURA - 56, { borda: C.laranja, esp: 2 });
  t.retangulo(36, 36, LARGURA - 72, ALTURA - 72, { borda: C.linha, esp: 1 });

  // Cabeçalho: símbolo + marca, centrados.
  const wMarca = t.largura("CyDef Academy", f.titulo, 22);
  const x0 = cx - (48 + 12 + wMarca) / 2;
  t.imagem(icone, x0, 64, 48);
  t.marca(x0 + 60, 64 + 24 - 13, 22, C.tinta, C.laranjaEscuro);
  t.texto("CERTIFICADO DE CONCLUSÃO", { x: cx, y: 146, tam: 14, fonte: f.mono, cor: C.apoio, espaco: 0.32, alinhar: "centro" });

  // Bloco central, centrado entre o rótulo e o rodapé.
  const nome = t.ajustarNome(d.nome, 56, 36, 880);
  const altNome = nome.tam * 1.08;
  const corpo: Trecho[] = [
    { texto: "concluiu o curso ", fonte: f.regular },
    { texto: d.curso_titulo, fonte: f.semi, cor: C.tinta },
    {
      texto: `, oferecido pela CyDef Academy na modalidade online${d.carga_horaria_h > 0 ? `, com carga horária de ${cargaPorExtenso(d.carga_horaria_h)}` : ""}, em ${dataPorExtenso(d.concluido_em)}.`,
      fonte: f.regular,
    },
  ];
  const altCorpo = t.medirParagrafo(corpo, 19, 720, 19 * 1.6);
  const altura = 22 + 16 + nome.linhas.length * altNome + 24 + 3 + 24 + altCorpo;
  const topoLivre = 146 + 17;
  const fimLivre = 632;
  let y = topoLivre + (fimLivre - topoLivre - altura) / 2;
  t.texto("Certificamos que", { x: cx, y, tam: 18, fonte: f.regular, cor: C.apoio, alinhar: "centro", alt: 22 });
  y += 22 + 16;
  for (const linha of nome.linhas) {
    t.texto(linha, { x: cx, y, tam: nome.tam, fonte: f.titulo, cor: C.tinta, alinhar: "centro", alt: altNome });
    y += altNome;
  }
  y += 24;
  t.retangulo(cx - 48, y, 96, 3, { fundo: C.laranja });
  y += 3 + 24;
  t.paragrafo(corpo, { x: cx, y, tam: 19, max: 720, alt: 19 * 1.6, cor: C.texto, alinhar: "centro", equilibrado: true });

  // Rodapé: código à esquerda, selo ao centro, QR à direita. Base em 738.
  const base = 738;
  t.texto("academy.cydef.com.br/certificado", { x: 88, y: base - 18, tam: 12.5, fonte: f.regular, cor: C.apoio, alt: 18 });
  t.texto(d.codigo, { x: 88, y: base - 18 - 6 - 22, tam: 16, fonte: f.mono, cor: C.tinta, espaco: 0.06, alt: 22 });
  t.texto("CÓDIGO DE VALIDAÇÃO", { x: 88, y: base - 18 - 6 - 22 - 6 - 16, tam: 11.5, fonte: f.mono, cor: C.apoio, espaco: 0.16, alt: 16 });
  t.selo(cx, base - 106, icone, C.apoio);
  const qx = LARGURA - 88 - 92;
  t.qr(url, qx, base - 92, 92, C.tinta);
  t.paragrafo([{ texto: "Aponte a câmera para validar", fonte: f.regular }], { x: qx - 14, y: base - 46 - 18, tam: 12.5, max: 130, alt: 18, cor: C.apoio, alinhar: "dir" });
}

// Modelo C: Técnico (curso pago) ------------------------------------------------

function desenharTecnico(t: Tela, d: DadosCertificado, icone: PDFImage, url: string) {
  const { f } = t;
  // Faixa lateral escura com a borda laranja.
  t.retangulo(0, 0, 326, ALTURA, { fundo: C.noite });
  t.retangulo(326, 0, 4, ALTURA, { fundo: C.laranja });
  t.imagem(icone, 40, 56, 72);
  t.marca(40, 146, 26, C.claroNoite, C.laranjaClaro);
  t.paragrafo([{ texto: "Formação prática em segurança da informação", fonte: f.regular }], { x: 40, y: 185, tam: 13.5, max: 246, alt: 20, cor: C.apoioNoite });

  const caixa = 104;
  const yCaixa = ALTURA - 48 - caixa;
  t.arredondado(40, yCaixa, caixa, caixa, 10, { fundo: C.branco });
  t.qr(url, 49, yCaixa + 9, 86, C.tinta);
  const ajuda = ["Aponte a câmera", "ou acesse", "academy.cydef.com.br", "/certificado"];
  ajuda.forEach((l, i) =>
    t.texto(l, { x: 40 + caixa + 16, y: yCaixa + (caixa - ajuda.length * 18.75) / 2 + i * 18.75, tam: 12, fonte: f.regular, cor: C.apoioNoite, alt: 18.75 }),
  );
  t.texto(d.codigo, { x: 40, y: yCaixa - 22 - 20, tam: 15, fonte: f.mono, cor: C.claroNoite, espaco: 0.06, alt: 20 });
  t.texto("CÓDIGO DE VALIDAÇÃO", { x: 40, y: yCaixa - 22 - 20 - 6 - 16, tam: 11.5, fonte: f.mono, cor: C.apoioNoite, espaco: 0.16, alt: 16 });

  // Área principal.
  const x = 330 + 72;
  const w = LARGURA - 330 - 144;
  t.texto("CERTIFICADO DE CONCLUSÃO", { x, y: 64, tam: 13, fonte: f.mono, cor: C.laranjaEscuro, espaco: 0.24, alt: 18 });

  const nome = t.ajustarNome(d.nome, 50, 34, w);
  const altNome = nome.tam * 1.08;
  const corpo: Trecho[] = [
    { texto: "concluiu o curso ", fonte: f.regular },
    { texto: d.curso_titulo, fonte: f.semi, cor: C.tinta },
    { texto: `, na modalidade online, em ${dataPorExtenso(d.concluido_em)}.`, fonte: f.regular },
  ];
  const altCorpo = t.medirParagrafo(corpo, 18.5, 620, 18.5 * 1.6);
  const colW = (w - 24) / 2;
  const avaliacao: Trecho[] = [{ texto: "Questões por módulo e prova final", fonte: f.tituloSemi }];
  const altAval = t.medirParagrafo(avaliacao, 26, colW, 32);
  const altGrade = 22 + 16 + 6 + Math.max(32, altAval) + 22;
  const conteudo = d.conteudo.filter(Boolean);
  const seloW = 116;
  const chipsW = w - 32 - seloW;
  const chips = posicionarChips(t, conteudo, chipsW);
  const altChips = conteudo.length ? 16 + 10 + chips.altura : 0;
  const altLinhaFinal = Math.max(altChips, 106);
  const altura = 22 + 12 + nome.linhas.length * altNome + 20 + altCorpo + 32 + altGrade + 24 + altLinhaFinal;

  const topoLivre = 64 + 18;
  const fimLivre = ALTURA - 56;
  let y = Math.max(topoLivre + 8, topoLivre + (fimLivre - topoLivre - altura) / 2);
  t.texto("Certificamos que", { x, y, tam: 18, fonte: f.regular, cor: C.apoio, alt: 22 });
  y += 22 + 12;
  for (const linha of nome.linhas) {
    t.texto(linha, { x, y, tam: nome.tam, fonte: f.titulo, cor: C.tinta, alt: altNome });
    y += altNome;
  }
  y += 20;
  t.paragrafo(corpo, { x, y, tam: 18.5, max: 620, alt: 18.5 * 1.6, cor: C.texto });
  y += altCorpo + 32;

  // Grade: carga horária e avaliação, entre duas linhas.
  t.retangulo(x, y, w, 1, { fundo: C.linha });
  const yg = y + 22;
  t.texto("CARGA HORÁRIA", { x, y: yg, tam: 11.5, fonte: f.mono, cor: C.apoio, espaco: 0.16, alt: 16 });
  t.texto(d.carga_horaria_h > 0 ? cargaPorExtenso(d.carga_horaria_h) : "Não informada", { x, y: yg + 22, tam: 26, fonte: f.tituloSemi, cor: C.tinta, alt: 32 });
  t.texto("AVALIAÇÃO", { x: x + colW + 24, y: yg, tam: 11.5, fonte: f.mono, cor: C.apoio, espaco: 0.16, alt: 16 });
  t.paragrafo(avaliacao, { x: x + colW + 24, y: yg + 22, tam: 26, max: colW, alt: 32, cor: C.tinta });
  y += altGrade;
  t.retangulo(x, y, w, 1, { fundo: C.linha });
  y += 24;

  // Conteúdo (módulos) e selo.
  const fimLinha = y + altLinhaFinal;
  if (conteudo.length) {
    const yc = fimLinha - chips.altura - 10 - 16;
    t.texto("CONTEÚDO", { x, y: yc, tam: 11.5, fonte: f.mono, cor: C.apoio, espaco: 0.16, alt: 16 });
    for (const c of chips.itens) {
      t.arredondado(x + c.x, yc + 26 + c.y, c.w, 30, 15, { borda: C.chip, esp: 1 });
      t.texto(c.texto, { x: x + c.x + 12, y: yc + 26 + c.y, tam: 13.5, fonte: f.regular, cor: C.texto, alt: 30 });
    }
  }
  t.selo(x + w - seloW / 2, fimLinha - 106, icone, C.apoio);
}

function posicionarChips(t: Tela, itens: string[], largura: number) {
  const out: { texto: string; x: number; y: number; w: number }[] = [];
  let x = 0;
  let y = 0;
  for (const texto of itens) {
    const w = Math.min(largura, t.largura(texto, t.f.regular, 13.5) + 24);
    if (x > 0 && x + w > largura) {
      x = 0;
      y += 30 + 8;
    }
    out.push({ texto, x, y, w });
    x += w + 8;
  }
  return { itens: out, altura: itens.length ? y + 30 : 0 };
}

// Entrada -------------------------------------------------------------------------

export async function gerarCertificadoPdf(d: DadosCertificado, r: Recursos, origem: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`Certificado ${d.codigo}: ${d.curso_titulo}`);
  pdf.setAuthor("CyDef Academy");
  pdf.setSubject(`Certificado de conclusão de ${d.nome}`);
  pdf.setCreator("academy.cydef.com.br");
  pdf.setProducer("CyDef Academy");
  pdf.setLanguage("pt-BR");

  const [regular, semi, titulo, tituloSemi, mono] = await Promise.all([
    // A Inter perde glifos no subconjunto do fontkit: vai inteira.
    pdf.embedFont(r.interRegular, { subset: false }),
    pdf.embedFont(r.interSemi, { subset: false }),
    pdf.embedFont(r.groteskBold, { subset: true }),
    pdf.embedFont(r.groteskSemi, { subset: true }),
    pdf.embedFont(r.mono, { subset: true }),
  ]);
  const icone = await pdf.embedPng(r.icone);
  const page = pdf.addPage([PT_W, PT_H]);
  const tela = new Tela(page, { regular, semi, titulo, tituloSemi, mono });
  const url = urlValidacao(origem, d.codigo);

  if (d.modelo === "tecnico") desenharTecnico(tela, d, icone, url);
  else desenharClaro(tela, d, icone, url);

  return pdf.save();
}

/** Busca fontes e símbolo (arquivos do próprio portal) e gera o PDF. */
export async function gerarCertificadoNoNavegador(d: DadosCertificado): Promise<Blob> {
  const urls = await import("./certificado-recursos");
  const baixar = async (u: string) => {
    const resp = await fetch(u);
    if (!resp.ok) throw new Error("recurso_indisponivel");
    return resp.arrayBuffer();
  };
  const [interRegular, interSemi, groteskBold, groteskSemi, mono, icone] = await Promise.all(
    [urls.interRegular, urls.interSemi, urls.groteskBold, urls.groteskSemi, urls.mono, urls.icone].map(baixar),
  );
  const bytes = await gerarCertificadoPdf(d, { interRegular, interSemi, groteskBold, groteskSemi, mono, icone } as Recursos, window.location.origin);
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}
