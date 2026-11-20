// Catálogo da CyDef Academy (fase 14): leitura, validação e versão.
//
// Fonte única: a função pública `academy_catalogo_publico` do Supabase (0020).
// O build do site lê dela (scripts/gen-catalogo-academy.mjs) e grava a cópia
// em src/lib/academy/. A verificação de hora em hora
// (.github/workflows/catalogo-academy.yml) lê de novo, compara a versão com a
// que está publicada em /catalogo-academy.json e só então pede um deploy.
//
// A versão é o SHA-256 do JSON compacto do catálogo, na ordem em que o banco
// devolve as chaves. Build e verificação passam pelo mesmo `versaoCatalogo`,
// então qualquer mudança de curso, preço, ementa ou trilha muda a versão.
import { createHash } from "node:crypto";

/** Chave pública (anon) por design: o catálogo é público e a função só devolve
 *  colunas de vitrine. É a mesma chave do deploy do site. */
export async function buscarCatalogo({ url, chave, fetchImpl = fetch, tempoMs = 20000 }) {
  if (!url || !chave) throw new Error("catalogo: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias");
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), tempoMs);
  try {
    const r = await fetchImpl(`${url.replace(/\/$/, "")}/rest/v1/rpc/academy_catalogo_publico`, {
      method: "POST",
      headers: { apikey: chave, Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
      body: "{}",
      signal: ctl.signal,
    });
    if (!r.ok) {
      const e = new Error(`catalogo: HTTP ${r.status}`);
      // 404: a função ainda não existe no banco (migração 0020 não aplicada).
      e.funcaoAusente = r.status === 404;
      throw e;
    }
    const dados = await r.json();
    validarCatalogo(dados);
    return dados;
  } finally {
    clearTimeout(timer);
  }
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CHECKOUT = /^https:\/\/(pay|checkout)\.hotmart\.com\/[A-Za-z0-9]{4,40}(\?[A-Za-z0-9=&._-]{1,200})?$/;

/** Confere o formato antes de publicar: um catálogo torto não vira página. */
export function validarCatalogo(c) {
  const falha = (m) => {
    throw new Error(`catalogo inválido: ${m}`);
  };
  if (!c || !Array.isArray(c.trilhas) || !Array.isArray(c.cursos)) falha("faltam trilhas ou cursos");
  const slugs = new Set();
  for (const k of c.cursos) {
    if (typeof k.slug !== "string" || !SLUG.test(k.slug)) falha(`slug ${k.slug}`);
    if (slugs.has(k.slug)) falha(`slug repetido ${k.slug}`);
    slugs.add(k.slug);
    if (typeof k.titulo !== "string" || !k.titulo.trim()) falha(`título de ${k.slug}`);
    if (!["em_breve", "a_venda"].includes(k.situacao)) falha(`situação de ${k.slug}`);
    if (!["iniciante", "intermediario", "avancado"].includes(k.nivel)) falha(`nível de ${k.slug}`);
    if (k.situacao === "a_venda") {
      if (typeof k.checkout_url !== "string" || !CHECKOUT.test(k.checkout_url)) falha(`checkout de ${k.slug}`);
      if (!Number.isInteger(k.preco_centavos) || k.preco_centavos < 100) falha(`preço de ${k.slug}`);
    } else if (k.checkout_url != null) falha(`checkout em curso em breve: ${k.slug}`);
    if (!Array.isArray(k.modulos) || !Array.isArray(k.instrutores) || !Array.isArray(k.trilhas)) falha(`listas de ${k.slug}`);
  }
  for (const t of c.trilhas) {
    if (typeof t.slug !== "string" || !SLUG.test(t.slug)) falha(`trilha ${t.slug}`);
    for (const s of t.cursos ?? []) if (!slugs.has(s)) falha(`trilha ${t.slug} cita curso fora do catálogo: ${s}`);
  }
  return c;
}

export function versaoCatalogo(c) {
  return createHash("sha256").update(JSON.stringify(c)).digest("hex");
}

/** O que a página inicial, o og e o sitemap precisam: leve, entra no chunk inicial. */
export function metaCatalogo(c) {
  return c.cursos.map((k) => ({
    slug: k.slug,
    titulo: k.titulo,
    descricao: k.descricao,
    nivel: k.nivel,
    situacao: k.situacao,
    carga_horaria_h: k.carga_horaria_h,
  }));
}
