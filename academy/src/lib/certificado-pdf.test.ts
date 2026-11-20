// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";
import { cargaPorExtenso, gerarCertificadoPdf, nomeArquivo, urlValidacao, type DadosCertificado, type Recursos } from "./certificado-pdf";

const pasta = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../assets/certificado");
const ler = (f: string) => {
  const b = readFileSync(path.join(pasta, f));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
};
const recursos: Recursos = {
  interRegular: ler("Inter_400Regular.ttf"),
  interSemi: ler("Inter_600SemiBold.ttf"),
  groteskBold: ler("SpaceGrotesk_700Bold.ttf"),
  groteskSemi: ler("SpaceGrotesk_600SemiBold.ttf"),
  mono: ler("JetBrainsMono_400Regular.ttf"),
  icone: ler("cydef-icon.png"),
};

const base: DadosCertificado = {
  codigo: "CYD-7F3A-29C1-B84E-0D56",
  nome: "Mariana Albuquerque dos Santos",
  curso_titulo: "Cybersecurity Fundamentals",
  carga_horaria_h: 6,
  concluido_em: "2026-11-18",
  modelo: "claro",
  conteudo: ["Princípios de segurança", "Redes e protocolos essenciais", "Criptografia aplicada", "Ameaças e vulnerabilidades", "Boas práticas"],
};

async function gerar(d: DadosCertificado, arquivo?: string) {
  const bytes = await gerarCertificadoPdf(d, recursos, "https://academy.cydef.com.br");
  // AMOSTRAS=/pasta npx vitest run ... grava os PDFs para conferência visual.
  if (process.env.AMOSTRAS && arquivo) writeFileSync(path.join(process.env.AMOSTRAS, arquivo), bytes);
  return bytes;
}

describe("certificado em PDF", () => {
  it("modelo Clássico claro: uma página A4 deitada, com metadados", async () => {
    const bytes = await gerar(base, "claro.pdf");
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
    const { width, height } = doc.getPage(0).getSize();
    expect(Math.round(width)).toBe(842);
    expect(Math.round(height)).toBe(595);
    expect(doc.getTitle()).toBe("Certificado CYD-7F3A-29C1-B84E-0D56: Cybersecurity Fundamentals");
    expect(doc.getAuthor()).toBe("CyDef Academy");
    // Fontes embutidas: o arquivo fica abaixo de 600 KB.
    expect(bytes.byteLength).toBeLessThan(600_000);
  });

  it("modelo Técnico, com módulos e nome longo em duas linhas", async () => {
    const d = { ...base, modelo: "tecnico" as const, nome: "Maria Eduarda Albuquerque Figueiredo dos Santos Pereira", curso_titulo: "SOC Analyst: Formação Completa", carga_horaria_h: 80 };
    const doc = await PDFDocument.load(await gerar(d, "tecnico.pdf"));
    expect(doc.getPageCount()).toBe(1);
  });

  it("curso sem módulos listados e nome curto também geram", async () => {
    await gerar({ ...base, modelo: "tecnico", nome: "Li", conteudo: [], carga_horaria_h: 7.5 }, "tecnico-vazio.pdf");
    await gerar({ ...base, nome: "Ana", carga_horaria_h: 1 }, "claro-curto.pdf");
  });

  it("textos de apoio", () => {
    expect(cargaPorExtenso(6)).toBe("6 horas");
    expect(cargaPorExtenso(1)).toBe("1 hora");
    expect(cargaPorExtenso(7.5)).toBe("7,5 horas");
    expect(urlValidacao("https://academy.cydef.com.br/", "CYD-1")).toBe("https://academy.cydef.com.br/certificado/CYD-1");
    expect(nomeArquivo({ curso_titulo: "SOC Analyst: Formação Completa", codigo: "CYD-1" })).toBe("certificado-soc-analyst-formacao-completa-CYD-1.pdf");
  });
});
