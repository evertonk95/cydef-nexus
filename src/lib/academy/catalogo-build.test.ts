// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { buscarCatalogo, metaCatalogo, validarCatalogo, versaoCatalogo } from "../../../scripts/lib/catalogo-academy.mjs";

/**
 * Fase 14: o build lê o catálogo do banco. Estes testes cobrem a leitura, a
 * validação (catálogo torto não vira página) e a versão que a verificação de
 * hora em hora compara com a publicada.
 */
const snapshot = JSON.parse(readFileSync(join(process.cwd(), "src/lib/academy/catalogo-snapshot.json"), "utf8"));
const meta = JSON.parse(readFileSync(join(process.cwd(), "src/lib/academy/catalogo-meta.json"), "utf8"));

const copia = () => structuredClone(snapshot);

describe("catálogo do build", () => {
  it("a cópia do repositório é válida e a meta sai dela", () => {
    expect(() => validarCatalogo(snapshot)).not.toThrow();
    expect(meta).toEqual(metaCatalogo(snapshot));
  });

  it("recusa checkout fora da Hotmart, preço ausente e trilha citando curso inexistente", () => {
    const a = copia();
    Object.assign(a.cursos[0], { situacao: "a_venda", checkout_url: "https://evil.com/x", preco_centavos: 49700 });
    expect(() => validarCatalogo(a)).toThrow(/checkout/);
    const b = copia();
    Object.assign(b.cursos[0], { situacao: "a_venda", checkout_url: "https://pay.hotmart.com/A1234567B", preco_centavos: null });
    expect(() => validarCatalogo(b)).toThrow(/preço/);
    const c = copia();
    c.trilhas[0].cursos.push("nao-existe");
    expect(() => validarCatalogo(c)).toThrow(/fora do catálogo/);
    const d = copia();
    d.cursos.push({ ...d.cursos[0] });
    expect(() => validarCatalogo(d)).toThrow(/repetido/);
  });

  it("a versão muda com qualquer mudança do catálogo e é estável para o mesmo conteúdo", () => {
    const v = versaoCatalogo(snapshot);
    expect(v).toMatch(/^[0-9a-f]{64}$/);
    expect(versaoCatalogo(JSON.parse(JSON.stringify(snapshot)))).toBe(v);
    const outro = copia();
    outro.cursos[0].titulo += " ";
    expect(versaoCatalogo(outro)).not.toBe(v);
  });

  it("lê a função pública com a chave anon, sem sessão", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(snapshot), { status: 200 }));
    const c = await buscarCatalogo({ url: "https://proj.supabase.co/", chave: "anon-key", fetchImpl });
    expect(c.cursos).toHaveLength(snapshot.cursos.length);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://proj.supabase.co/rest/v1/rpc/academy_catalogo_publico");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ apikey: "anon-key", Authorization: "Bearer anon-key" });
  });

  it("falha alto quando o banco não responde ou responde torto", async () => {
    await expect(buscarCatalogo({ url: "https://x.supabase.co", chave: "k", fetchImpl: async () => new Response("", { status: 500 }) })).rejects.toThrow(
      /HTTP 500/,
    );
    await expect(
      buscarCatalogo({ url: "https://x.supabase.co", chave: "k", fetchImpl: async () => new Response(JSON.stringify({ cursos: [] }), { status: 200 }) }),
    ).rejects.toThrow(/inválido/);
    await expect(buscarCatalogo({ url: "", chave: "" })).rejects.toThrow(/obrigatórias/);
  });
});

describe("ordem do deploy", () => {
  it("marca a função ausente (404) para o build seguir com a cópia antes do db push", async () => {
    const erro = await buscarCatalogo({ url: "https://x.supabase.co", chave: "k", fetchImpl: async () => new Response("{}", { status: 404 }) }).catch(
      (e: Error & { funcaoAusente?: boolean }) => e,
    );
    expect((erro as Error & { funcaoAusente?: boolean }).funcaoAusente).toBe(true);
    const outro = await buscarCatalogo({ url: "https://x.supabase.co", chave: "k", fetchImpl: async () => new Response("", { status: 503 }) }).catch(
      (e: Error & { funcaoAusente?: boolean }) => e,
    );
    expect((outro as Error & { funcaoAusente?: boolean }).funcaoAusente).toBe(false);
  });
});
