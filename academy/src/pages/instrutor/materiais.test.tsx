import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cursoDetalheTeste, renderizar, sbFalso } from "@/test/utilidades";
import { violacoesGraves } from "@/test/axe";
import { ProvedorAvisos } from "@/components/ui/Avisos";
import { conferirArquivo, listarZip, sha256, type MaterialAdm } from "@/lib/materiais";
import type { CursoAdm } from "@/lib/instrutor";
import Curso from "../Curso";
import AreaInstrutor from "./Area";
import CursoInstrutor from "./Curso";
import AprovacoesInstrutor from "./Aprovacoes";

const SLUG = "fundamentos-para-soc";

/** ZIP mínimo (sem compressão) com os nomes pedidos, para os testes. */
function zip(nomes: string[]): Uint8Array {
  const enc = new TextEncoder();
  const partes: number[] = [];
  const central: number[] = [];
  const u16 = (a: number[], v: number) => a.push(v & 255, (v >> 8) & 255);
  const u32 = (a: number[], v: number) => a.push(v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255);
  for (const n of nomes) {
    const nb = [...enc.encode(n)];
    const off = partes.length;
    u32(partes, 0x04034b50);
    for (let i = 0; i < 11; i++) u16(partes, 0);
    u16(partes, nb.length);
    u16(partes, 0);
    partes.push(...nb);
    u32(central, 0x02014b50);
    for (let i = 0; i < 12; i++) u16(central, 0);
    u16(central, nb.length);
    u16(central, 0);
    u16(central, 0);
    u16(central, 0);
    u16(central, 0);
    u32(central, 0);
    u32(central, off);
    central.push(...nb);
  }
  const fim: number[] = [];
  u32(fim, 0x06054b50);
  u16(fim, 0);
  u16(fim, 0);
  u16(fim, nomes.length);
  u16(fim, nomes.length);
  u32(fim, central.length);
  u32(fim, partes.length);
  u16(fim, 0);
  return new Uint8Array([...partes, ...central, ...fim]);
}

const arquivo = (conteudo: BlobPart, nome: string) => new File([conteudo], nome);
const PDF = new TextEncoder().encode("%PDF-1.7\nconteudo de teste\n%%EOF");

async function codigoErro(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    return (e as { codigo?: string }).codigo;
  }
  return null;
}

describe("conferência do arquivo antes do envio", () => {
  it("aceita PDF de verdade e devolve o MIME canônico", async () => {
    const r = await conferirArquivo(arquivo(PDF, "slides.pdf"));
    expect(r).toMatchObject({ ext: "pdf", mime: "application/pdf" });
  });

  it("recusa extensão fora da lista, PDF falso, texto binário e Office com macro", async () => {
    expect(await codigoErro(conferirArquivo(arquivo("MZ", "lab.exe")))).toBe("tipo_nao_permitido");
    expect(await codigoErro(conferirArquivo(arquivo("MZ\u0090\u0000", "slides.pdf")))).toBe("conteudo_divergente");
    expect(await codigoErro(conferirArquivo(arquivo(new Uint8Array([0x41, 0, 0x42]), "notas.md")))).toBe("texto_invalido");
    expect(await codigoErro(conferirArquivo(arquivo(zip(["word/document.xml", "word/vbaProject.bin"]) as BlobPart, "relatorio.docx")))).toBe("macro");
    expect(await codigoErro(conferirArquivo(arquivo(PDF, "planilha.xlsx")))).toBe("conteudo_divergente");
  });

  it("aceita ZIP de laboratório e lista o conteúdo, marcando o que é arriscado", async () => {
    const z = zip(["lab/README.md", "lab/coleta.ps1", "lab/dados/eventos.json", "lab/"]);
    await conferirArquivo(arquivo(z as BlobPart, "lab.zip"));
    expect(listarZip(z)).toEqual([
      { nome: "lab/README.md", tamanho: 0, arriscada: false },
      { nome: "lab/coleta.ps1", tamanho: 0, arriscada: true },
      { nome: "lab/dados/eventos.json", tamanho: 0, arriscada: false },
    ]);
  });

  it("SHA-256 confere com o valor conhecido", async () => {
    expect(await sha256(new TextEncoder().encode("abc"))).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

// Painel ------------------------------------------------------------------------

type Rpcs = NonNullable<NonNullable<Parameters<typeof sbFalso>[0]>["rpcs"]>;

function comStorage(sb: SupabaseClient, storage: Record<string, unknown>) {
  (sb as unknown as { storage: unknown }).storage = { from: () => storage };
  return sb;
}

function painel(rota: string, rpcs: Rpcs, storage: Record<string, unknown> = {}) {
  return renderizar(
    <ProvedorAvisos>
      <Routes>
        <Route element={<AreaInstrutor />}>
          <Route path="cursos/:slug" element={<CursoInstrutor />} />
          <Route path="aprovacoes" element={<AprovacoesInstrutor />} />
        </Route>
      </Routes>
    </ProvedorAvisos>,
    { rota, caminho: "/instrutor/*", sb: comStorage(sbFalso({ rpcs }), storage) },
  );
}

const cursoAdm: CursoAdm = {
  slug: SLUG,
  titulo: "Fundamentos para SOC",
  descricao: "",
  nivel: "iniciante",
  gratuito: true,
  publicado: true,
  ordem: 1,
  eh_admin: false,
  requisitos: null,
  questoes_final: 0,
  questoes_final_publicadas: 0,
  modulos: [{ id: "m1", ordem: 1, titulo: "O SOC por dentro", questoes: 0, questoes_publicadas: 0, aulas: [] }],
};

function material(over: Partial<MaterialAdm> = {}): MaterialAdm {
  return {
    id: "mat1",
    curso_slug: SLUG,
    curso_titulo: "Fundamentos para SOC",
    modulo_id: "m1",
    modulo_titulo: "O SOC por dentro",
    modulo_ordem: 1,
    titulo: "Slides do módulo 1",
    descricao: "",
    nome_arquivo: "slides.pdf",
    extensao: "pdf",
    tamanho: PDF.byteLength,
    sha256: "",
    caminho: `${SLUG}/mat1/slides.pdf`,
    status: "pendente",
    enviado_em: "2026-11-19T12:00:00Z",
    enviado_por_nome: "Matheus",
    enviado_por_mim: false,
    revisado_em: null,
    revisado_por_nome: null,
    motivo_recusa: null,
    ...over,
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("aba Materiais", () => {
  it("envia: registra com hash e MIME, grava no caminho devolvido e confirma", async () => {
    const chamadas: [string, unknown][] = [];
    const upload = vi.fn(async (caminho: string, _f: File, op: unknown) => {
      chamadas.push(["upload", { caminho, op }]);
      return { data: { path: caminho }, error: null };
    });
    painel(
      `/instrutor/cursos/${SLUG}?aba=materiais`,
      {
        academy_adm_eu: { papel: "instrutor", cursos: [SLUG], aprova_materiais: false },
        academy_adm_curso: cursoAdm,
        academy_adm_materiais: [material({ status: "recusado", motivo_recusa: "Arquivo errado." })],
        academy_adm_registrar_material: (a) => {
          chamadas.push(["registrar", a]);
          return { data: { id: "mat2", caminho: `${SLUG}/mat2/slides.pdf`, mime: "application/pdf" } };
        },
        academy_adm_confirmar_envio: (a) => {
          chamadas.push(["confirmar", a]);
          return { data: material({ id: "mat2" }) };
        },
      },
      { upload },
    );
    expect(await screen.findByText(/fica em quarentena até outra pessoa da equipe conferir e aprovar/)).toBeInTheDocument();
    expect(await screen.findByText("Motivo: Arquivo errado.")).toBeInTheDocument();

    await userEvent.upload(screen.getByLabelText("Arquivo"), arquivo(PDF, "slides-modulo-1.pdf"));
    expect(screen.getByLabelText("Título para o aluno")).toHaveValue("slides modulo 1");
    await userEvent.selectOptions(screen.getByLabelText("Onde aparece"), "m1");
    await userEvent.click(screen.getByRole("button", { name: /Enviar para aprovação/ }));
    await waitFor(() => expect(chamadas.map((c) => c[0])).toEqual(["registrar", "upload", "confirmar"]));
    const reg = chamadas[0]![1] as { p_curso: string; p_dados: Record<string, unknown> };
    expect(reg.p_curso).toBe(SLUG);
    expect(reg.p_dados).toMatchObject({ nome_arquivo: "slides-modulo-1.pdf", mime: "application/pdf", tamanho: PDF.byteLength, modulo_id: "m1" });
    expect(reg.p_dados.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(chamadas[1]![1]).toEqual({ caminho: `${SLUG}/mat2/slides.pdf`, op: { contentType: "application/pdf", upsert: false, cacheControl: "0" } });
    expect(chamadas[2]![1]).toEqual({ p_id: "mat2" });
  });

  it("material que entrou por carga direta no banco mostra \"Carga direta\" no lugar de quem enviou (fase 25)", async () => {
    painel(`/instrutor/cursos/${SLUG}?aba=materiais`, {
      academy_adm_eu: { papel: "instrutor", cursos: [SLUG], aprova_materiais: false },
      academy_adm_curso: cursoAdm,
      academy_adm_materiais: [
        material({ status: "aprovado", enviado_por_nome: null }),
        material({ id: "mat2", titulo: "Planilha do módulo", status: "aprovado", enviado_por_nome: "Matheus" }),
      ],
    });
    expect(await screen.findByText(/^Carga direta em /)).toBeInTheDocument();
    expect(screen.getByText(/^Enviado por Matheus em /)).toBeInTheDocument();
    expect(screen.queryByText(/Enviado por {2}em/)).not.toBeInTheDocument();
  });

  it("arquivo recusado no navegador nem chega ao banco", async () => {
    const registrar = vi.fn(() => ({ data: null }));
    painel(`/instrutor/cursos/${SLUG}?aba=materiais`, {
      academy_adm_eu: { papel: "instrutor", cursos: [SLUG] },
      academy_adm_curso: cursoAdm,
      academy_adm_materiais: [],
      academy_adm_registrar_material: registrar,
    });
    await userEvent.upload(await screen.findByLabelText("Arquivo"), arquivo("MZ\u0090", "falso.pdf"));
    await userEvent.click(screen.getByRole("button", { name: /Enviar para aprovação/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("O conteúdo do arquivo não corresponde à extensão");
    expect(registrar).not.toHaveBeenCalled();
  });
});

describe("Aprovações", () => {
  it("quem não aprova não vê a página", async () => {
    painel("/instrutor/aprovacoes", { academy_adm_eu: { papel: "instrutor", cursos: [SLUG], aprova_materiais: false } });
    expect(await screen.findByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument();
  });

  it("baixa, confere o SHA-256 e só então libera o Aprovar", async () => {
    const hash = await sha256(PDF);
    let revisao: Record<string, unknown> | undefined;
    vi.stubGlobal("fetch", vi.fn(async () => new Response(PDF, { status: 200, headers: { "Content-Type": "application/pdf" } })));
    painel(
      "/instrutor/aprovacoes",
      {
        academy_adm_eu: { papel: "admin", cursos: [SLUG], aprova_materiais: true },
        academy_adm_aprovacoes: [material({ sha256: hash })],
        academy_adm_revisar_material: (a) => {
          revisao = a;
          return { data: [] };
        },
      },
      { createSignedUrl: async () => ({ data: { signedUrl: "https://proj.supabase.co/storage/v1/object/sign/x" }, error: null }) },
    );
    const item = await screen.findByRole("listitem", { name: "Slides do módulo 1" });
    const aprovar = within(item).getByRole("button", { name: "Aprovar e publicar" });
    expect(aprovar).toBeDisabled();
    expect(within(item).getByRole("link", { name: /Consultar o hash no VirusTotal/ })).toHaveAttribute("href", `https://www.virustotal.com/gui/file/${hash}`);
    await userEvent.click(within(item).getByRole("button", { name: /Baixar e conferir/ }));
    expect(await within(item).findByText(/SHA-256 confere/)).toBeInTheDocument();
    expect(aprovar).toBeEnabled();
    await userEvent.click(aprovar);
    await waitFor(() => expect(revisao).toEqual({ p_id: "mat1", p_aprovar: true, p_motivo: null }));
  });

  it("hash diferente bloqueia a aprovação e orienta a recusar", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(new TextEncoder().encode("%PDF-outro"), { status: 200 })));
    painel(
      "/instrutor/aprovacoes",
      { academy_adm_eu: { papel: "admin", cursos: [SLUG], aprova_materiais: true }, academy_adm_aprovacoes: [material({ sha256: "f".repeat(64) })] },
      { createSignedUrl: async () => ({ data: { signedUrl: "https://x" }, error: null }) },
    );
    const item = await screen.findByRole("listitem", { name: "Slides do módulo 1" });
    await userEvent.click(within(item).getByRole("button", { name: /Baixar e conferir/ }));
    expect(await within(item).findByText(/é diferente do registrado no envio/)).toBeInTheDocument();
    expect(within(item).getByRole("button", { name: "Aprovar e publicar" })).toBeDisabled();
  });

  it("ZIP mostra o conteúdo e destaca script; recusa vai com motivo", async () => {
    const z = zip(["lab/README.md", "lab/coleta.ps1"]);
    const hash = await sha256(z);
    let revisao: Record<string, unknown> | undefined;
    vi.stubGlobal("fetch", vi.fn(async () => new Response(z as BodyInit, { status: 200 })));
    painel(
      "/instrutor/aprovacoes",
      {
        academy_adm_eu: { papel: "admin", cursos: [SLUG], aprova_materiais: true },
        academy_adm_aprovacoes: [material({ sha256: hash, extensao: "zip", nome_arquivo: "lab.zip", titulo: "Laboratório" })],
        academy_adm_revisar_material: (a) => {
          revisao = a;
          return { data: [] };
        },
      },
      { createSignedUrl: async () => ({ data: { signedUrl: "https://x" }, error: null }) },
    );
    const item = await screen.findByRole("listitem", { name: "Laboratório" });
    await userEvent.click(within(item).getByRole("button", { name: /Baixar e conferir/ }));
    expect(await within(item).findByText(/1 para olhar com atenção/)).toBeInTheDocument();
    expect(within(item).getByText(/lab\/coleta\.ps1/)).toHaveClass("text-warn");
    await userEvent.click(within(item).getByRole("button", { name: "Recusar" }));
    await userEvent.type(within(item).getByLabelText("Motivo da recusa"), "Script sem documentação.");
    await userEvent.click(within(item).getByRole("button", { name: "Recusar arquivo" }));
    await waitFor(() => expect(revisao).toEqual({ p_id: "mat1", p_aprovar: false, p_motivo: "Script sem documentação." }));
  });

  it("quem enviou não tem como aprovar", async () => {
    painel("/instrutor/aprovacoes", {
      academy_adm_eu: { papel: "admin", cursos: [SLUG], aprova_materiais: true },
      academy_adm_aprovacoes: [material({ enviado_por_mim: true })],
    });
    const item = await screen.findByRole("listitem", { name: "Slides do módulo 1" });
    expect(within(item).getByText(/Você enviou este arquivo. Outra pessoa precisa revisar e aprovar./)).toBeInTheDocument();
    expect(within(item).queryByRole("button", { name: "Aprovar e publicar" })).not.toBeInTheDocument();
  });

  it("não tem violação grave de acessibilidade", async () => {
    const { container } = painel("/instrutor/aprovacoes", {
      academy_adm_eu: { papel: "admin", cursos: [SLUG], aprova_materiais: true },
      academy_adm_aprovacoes: [material({ sha256: "a".repeat(64) })],
    });
    await screen.findByRole("listitem", { name: "Slides do módulo 1" });
    expect(await violacoesGraves(container)).toEqual([]);
  });
});

describe("material para o aluno", () => {
  it("mostra só o que o banco devolve e baixa por link assinado como anexo", async () => {
    const assinar = vi.fn(async () => ({ data: { signedUrl: "https://proj.supabase.co/storage/v1/object/sign/a?token=t" }, error: null }));
    const ir = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign: ir });
    const sb = comStorage(
      sbFalso({
        cursos: { [SLUG]: cursoDetalheTeste },
        rpcs: {
          academy_materiais_curso: [
            { id: "mat1", modulo_id: "m1", titulo: "Slides do módulo 1", descricao: "", nome_arquivo: "slides.pdf", extensao: "pdf", tamanho: 2_400_000, sha256: "a", caminho: `${SLUG}/mat1/slides.pdf` },
          ],
        },
      }),
      { createSignedUrl: assinar },
    );
    renderizar(<Curso />, { rota: `/cursos/${SLUG}`, caminho: "/cursos/:slug", sb });
    const bloco = await screen.findByRole("region", { name: "Material complementar" });
    expect(within(bloco).getByText("Módulo 1: O SOC por dentro, PDF, 2,3 MB")).toBeInTheDocument();
    fireEvent.click(within(bloco).getByRole("button", { name: /Baixar/ }));
    await waitFor(() => expect(assinar).toHaveBeenCalledWith(`${SLUG}/mat1/slides.pdf`, 60, { download: "slides.pdf" }));
    await waitFor(() => expect(ir).toHaveBeenCalledWith("https://proj.supabase.co/storage/v1/object/sign/a?token=t"));
  });
});
