import type { SupabaseClient } from "@supabase/supabase-js";
import { chamar, ErroPainel } from "./instrutor";

/**
 * Material complementar (banco na 0019).
 *
 * O navegador é a primeira camada: confere o tipo pelo conteúdo (não só pela
 * extensão), o tamanho e macro em arquivo do Office, e calcula o SHA-256.
 * O banco e o bucket repetem as regras de tipo e tamanho, e o arquivo só
 * chega ao aluno depois da aprovação de uma segunda pessoa.
 */

export const BUCKET = "academy-materiais";

export type Extensao = "pdf" | "docx" | "xlsx" | "xls" | "pptx" | "csv" | "md" | "txt" | "zip";

const MB = 1024 * 1024;

export const TIPOS: Record<Extensao, { mime: string; rotulo: string; limite: number }> = {
  pdf: { mime: "application/pdf", rotulo: "PDF", limite: 25 * MB },
  docx: { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", rotulo: "Word", limite: 25 * MB },
  xlsx: { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", rotulo: "Excel", limite: 25 * MB },
  xls: { mime: "application/vnd.ms-excel", rotulo: "Excel 97-2003", limite: 25 * MB },
  pptx: { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", rotulo: "PowerPoint", limite: 25 * MB },
  csv: { mime: "text/csv", rotulo: "CSV", limite: 25 * MB },
  md: { mime: "text/markdown", rotulo: "Markdown", limite: 25 * MB },
  txt: { mime: "text/plain", rotulo: "Texto", limite: 25 * MB },
  zip: { mime: "application/zip", rotulo: "ZIP", limite: 50 * MB },
};

export const ACEITOS = Object.keys(TIPOS)
  .map((e) => `.${e}`)
  .join(",");

export type StatusMaterial = "enviando" | "pendente" | "aprovado" | "recusado" | "arquivado";

export interface MaterialAdm {
  id: string;
  curso_slug: string;
  curso_titulo: string;
  modulo_id: string | null;
  modulo_titulo: string | null;
  modulo_ordem: number | null;
  titulo: string;
  descricao: string;
  nome_arquivo: string;
  extensao: Extensao;
  tamanho: number;
  sha256: string;
  caminho: string;
  status: StatusMaterial;
  enviado_em: string;
  enviado_por_nome: string | null;
  enviado_por_mim: boolean;
  revisado_em: string | null;
  revisado_por_nome: string | null;
  motivo_recusa: string | null;
}

export interface MaterialAluno {
  id: string;
  modulo_id: string | null;
  titulo: string;
  descricao: string;
  nome_arquivo: string;
  extensao: Extensao;
  tamanho: number;
  sha256: string;
  caminho: string;
}

export function extensaoDe(nome: string): Extensao | null {
  const m = /\.([A-Za-z0-9]+)$/.exec(nome.trim());
  const e = m?.[1]?.toLowerCase();
  return e && e in TIPOS ? (e as Extensao) : null;
}

/** "2,4 MB", "820 KB". */
export function tamanhoLegivel(bytes: number): string {
  if (bytes >= MB) return `${(bytes / MB).toFixed(1).replace(".", ",")} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const comeca = (b: Uint8Array, assinatura: number[]) => assinatura.every((v, i) => b[i] === v);
const ZIP = [0x50, 0x4b, 0x03, 0x04];
const OLE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d];

async function bytesDe(f: Blob): Promise<Uint8Array> {
  return new Uint8Array(await f.arrayBuffer());
}

/**
 * Confere o arquivo antes do envio. Devolve a extensão e o MIME canônico, ou
 * lança ErroPainel com o motivo.
 */
export async function conferirArquivo(arquivo: File): Promise<{ ext: Extensao; mime: string; bytes: Uint8Array }> {
  const ext = extensaoDe(arquivo.name);
  if (!ext) throw new ErroPainel("tipo_nao_permitido");
  if (arquivo.size === 0) throw new ErroPainel("arquivo_vazio");
  if (arquivo.size > TIPOS[ext].limite) throw new ErroPainel("arquivo_grande");
  const b = await bytesDe(arquivo);

  if (ext === "pdf" && !comeca(b, PDF)) throw new ErroPainel("conteudo_divergente");
  if (ext === "xls" && !comeca(b, OLE)) throw new ErroPainel("conteudo_divergente");
  if ((ext === "docx" || ext === "xlsx" || ext === "pptx" || ext === "zip") && !comeca(b, ZIP)) throw new ErroPainel("conteudo_divergente");
  // Office com macro (docm/xlsm/pptm renomeado) traz vbaProject.bin.
  if ((ext === "docx" || ext === "xlsx" || ext === "pptx") && listarZip(b).some((e) => /vbaproject\.bin$/i.test(e.nome))) {
    throw new ErroPainel("macro");
  }
  if (ext === "csv" || ext === "md" || ext === "txt") {
    if (b.includes(0)) throw new ErroPainel("texto_invalido");
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(b);
    } catch {
      throw new ErroPainel("texto_invalido");
    }
  }
  return { ext, mime: TIPOS[ext].mime, bytes: b };
}

export async function sha256(bytes: Uint8Array | ArrayBuffer): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(d))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

/** Extensões que o aprovador precisa olhar com atenção dentro de um ZIP. */
const ARRISCADAS = /\.(exe|dll|scr|msi|msp|com|bat|cmd|ps1|psm1|vbs|vbe|js|jse|wsf|wsh|hta|lnk|jar|apk|sh|elf|so|dylib|app|iso|img|docm|xlsm|pptm|reg|pif|cpl)$/i;

export interface EntradaZip {
  nome: string;
  tamanho: number;
  arriscada: boolean;
}

/**
 * Índice de um ZIP (diretório central), sem descompactar nada. Serve para o
 * aprovador ver o que vem dentro e para achar macro em arquivo do Office.
 */
export function listarZip(b: Uint8Array): EntradaZip[] {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let fim = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65_557); i--) {
    if (v.getUint32(i, true) === 0x06054b50) {
      fim = i;
      break;
    }
  }
  if (fim < 0) return [];
  const total = v.getUint16(fim + 10, true);
  let p = v.getUint32(fim + 16, true);
  const saida: EntradaZip[] = [];
  const dec = new TextDecoder();
  for (let k = 0; k < total && p + 46 <= b.length; k++) {
    if (v.getUint32(p, true) !== 0x02014b50) break;
    const tamanho = v.getUint32(p + 24, true);
    const n = v.getUint16(p + 28, true);
    const extra = v.getUint16(p + 30, true);
    const coment = v.getUint16(p + 32, true);
    const nome = dec.decode(b.subarray(p + 46, p + 46 + n));
    if (!nome.endsWith("/")) saida.push({ nome, tamanho, arriscada: ARRISCADAS.test(nome) });
    p += 46 + n + extra + coment;
  }
  return saida;
}

export const ehZip = (ext: Extensao) => ext === "zip" || ext === "docx" || ext === "xlsx" || ext === "pptx";

// Envio ----------------------------------------------------------------------------

export interface DadosMaterial {
  titulo: string;
  descricao: string;
  modulo_id: string | null;
}

export type EtapaEnvio = "conferindo" | "enviando" | "confirmando";

/** Confere, registra, grava no Storage e põe em quarentena. */
export async function enviarMaterial(
  sb: SupabaseClient,
  curso: string,
  arquivo: File,
  dados: DadosMaterial,
  etapa: (e: EtapaEnvio) => void = () => undefined,
): Promise<MaterialAdm> {
  etapa("conferindo");
  const { mime, bytes } = await conferirArquivo(arquivo);
  const hash = await sha256(bytes);
  const reg = await chamar<{ id: string; caminho: string; mime: string }>(sb, "academy_adm_registrar_material", {
    p_curso: curso,
    p_dados: { ...dados, nome_arquivo: arquivo.name, mime, tamanho: arquivo.size, sha256: hash },
  });
  etapa("enviando");
  const { error } = await sb.storage.from(BUCKET).upload(reg.caminho, arquivo, { contentType: reg.mime, upsert: false, cacheControl: "0" });
  if (error) throw new ErroPainel("falha_envio");
  etapa("confirmando");
  return chamar<MaterialAdm>(sb, "academy_adm_confirmar_envio", { p_id: reg.id });
}

/** Baixa para revisão e confere o SHA-256 com o que foi registrado no envio. */
export async function baixarParaRevisar(sb: SupabaseClient, m: Pick<MaterialAdm, "caminho" | "sha256" | "extensao">) {
  const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(m.caminho, 60);
  if (error || !data) throw new ErroPainel("falha_download");
  const resp = await fetch(data.signedUrl);
  if (!resp.ok) throw new ErroPainel("falha_download");
  const blob = await resp.blob();
  const bytes = await bytesDe(blob);
  const hash = await sha256(bytes);
  return { blob, hash, confere: hash === m.sha256, entradas: ehZip(m.extensao) ? listarZip(bytes) : [] };
}

/** Link de download para o aluno: assinado, de 60 segundos, como anexo. */
export async function linkDownload(sb: SupabaseClient, m: Pick<MaterialAluno, "caminho" | "nome_arquivo">): Promise<string> {
  const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(m.caminho, 60, { download: m.nome_arquivo });
  if (error || !data) throw new ErroPainel("falha_download");
  return data.signedUrl;
}

/** Remove o objeto do Storage (descartado, recusado ou fora do ar). */
export async function apagarArquivo(sb: SupabaseClient, caminho: string) {
  await sb.storage.from(BUCKET).remove([caminho]);
}

export function linkVirusTotal(hash: string): string {
  return `https://www.virustotal.com/gui/file/${hash}`;
}
