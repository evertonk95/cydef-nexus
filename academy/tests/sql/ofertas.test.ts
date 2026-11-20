// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { como, criarAluno, novoBanco } from "./banco";

const CHECKOUT = "https://pay.hotmart.com/T1234567X";

let db: PGlite;
let admin: string;

async function erroDe(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    return (e as Error).message;
  }
  return "";
}
async function rpc<T>(uid: string, sql: string, params: unknown[] = []): Promise<T> {
  const [r] = await como<{ r: T }>(db, "authenticated", `select ${sql} r`, params, uid);
  return r!.r;
}
const salvar = (d: Record<string, unknown>) => rpc(admin, `public.academy_adm_salvar_produto($1::jsonb)`, [JSON.stringify(d)]);
async function ofertas() {
  const [r] = await como<{ r: { ofertas: Record<string, unknown>[] } }>(db, "anon", `select public.academy_catalogo_publico() r`);
  return r!.r.ofertas;
}

beforeEach(async () => {
  db = await novoBanco();
  admin = (await criarAluno(db, "admin@exemplo.com")).userId;
  await db.query(`insert into public.academy_equipe (user_id, papel) values ($1, 'admin')`, [admin]);
}, 60_000);

describe("Aviso de Privacidade v2026.4 (0022) e v2026.5 (0025)", () => {
  it("só a última versão fica vigente e as anteriores ficam como histórico", async () => {
    const r = await db.query<{ versao: string; vigente: boolean }>(`select versao, vigente from public.aviso_privacidade order by versao`);
    expect(r.rows).toEqual([
      { versao: "v2026.1", vigente: false },
      { versao: "v2026.2", vigente: false },
      { versao: "v2026.3", vigente: false },
      { versao: "v2026.4", vigente: false },
      { versao: "v2026.5", vigente: true },
    ]);
  });
});

describe("ofertas de trilha e de plataforma (0023)", () => {
  it("à venda exige produto ativo, checkout da Hotmart e preço", async () => {
    expect(await erroDe(salvar({ hotmart_produto_id: "3003", nome: "Academy por 12 meses", escopo: "plataforma", situacao: "a_venda" }))).toMatch(/venda_incompleta/);
    expect(await erroDe(salvar({ hotmart_produto_id: "3003", nome: "Academy", escopo: "plataforma", checkout_url: "https://go.hotmart.com/T1234567X" }))).toMatch(
      /checkout_invalido/,
    );
    expect(
      await erroDe(salvar({ hotmart_produto_id: "3003", nome: "Academy", escopo: "plataforma", situacao: "a_venda", checkout_url: CHECKOUT, preco_centavos: 99700, ativo: false })),
    ).toMatch(/venda_incompleta/);
    expect(await ofertas()).toEqual([]);
  });

  it("o catálogo público mostra a plataforma e as trilhas à venda, com o número de cursos", async () => {
    await salvar({ hotmart_produto_id: "3003", nome: "Academy completa por 12 meses", escopo: "plataforma", situacao: "a_venda", checkout_url: CHECKOUT, preco_centavos: 99700, preco_observacao: "ou 12x" });
    await salvar({ hotmart_produto_id: "4004", nome: "Trilha SOC completa", escopo: "trilha", trilha: "soc", situacao: "a_venda", checkout_url: "https://pay.hotmart.com/S7654321Z", preco_centavos: 69700 });
    await salvar({ hotmart_produto_id: "5005", nome: "Trilha Blue Team", escopo: "trilha", trilha: "blue-team" });
    const o = await ofertas();
    expect(o).toEqual([
      { tipo: "plataforma", nome: "Academy completa por 12 meses", trilha: null, duracao_dias: 365, cursos: 6, preco_centavos: 99700, preco_observacao: "ou 12x", checkout_url: CHECKOUT },
      { tipo: "trilha", nome: "Trilha SOC completa", trilha: "soc", duracao_dias: null, cursos: 3, preco_centavos: 69700, preco_observacao: "", checkout_url: "https://pay.hotmart.com/S7654321Z" },
    ]);
    // Trilha despublicada some da vitrine; o código do produto nunca aparece.
    await db.query(`update public.trilhas set publicado = false where slug = 'soc'`);
    expect((await ofertas()).map((x) => x.tipo)).toEqual(["plataforma"]);
    expect(JSON.stringify(await ofertas())).not.toContain("3003");
  });

  it("o painel devolve a vitrine do produto e a data da conferência do preço", async () => {
    const r = await salvar({ hotmart_produto_id: "3003", nome: "Academy", escopo: "plataforma", situacao: "a_venda", checkout_url: CHECKOUT, preco_centavos: 99700 });
    expect((r as { produtos: Record<string, unknown>[] }).produtos[0]).toMatchObject({ situacao: "a_venda", checkout_url: CHECKOUT, preco_centavos: 99700 });
    expect((r as { produtos: { preco_conferido_em: string | null }[] }).produtos[0]!.preco_conferido_em).not.toBeNull();
  });
});

describe("acessos do próprio aluno", () => {
  it("o aluno vê os próprios acessos pagos, inclusive os ligados só pelo e-mail", async () => {
    const { userId } = await criarAluno(db, "bia@exemplo.com");
    await rpc(admin, `public.academy_adm_conceder($1::jsonb)`, [JSON.stringify({ email: "bia@exemplo.com", escopo: "curso", curso: "soc-analyst", dias: 30 })]);
    await rpc(admin, `public.academy_adm_conceder($1::jsonb)`, [JSON.stringify({ email: "outra@exemplo.com", escopo: "plataforma" })]);
    const meus = await rpc<Record<string, unknown>[]>(userId, `public.academy_meus_acessos()`);
    expect(meus).toEqual([expect.objectContaining({ acesso: "SOC Analyst: Formação Completa", origem: "Liberado pela CyDef", situacao: "ativa" })]);
    expect(await erroDe(como(db, "anon", `select public.academy_meus_acessos()`))).toMatch(/permission denied/);
  });
});
