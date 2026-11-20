// O catálogo da Academy mudou desde o último deploy? (fase 14)
// Uso: node scripts/catalogo-academy-mudou.mjs
// Saída em $GITHUB_OUTPUT: mudou=true|false. Sem segredos: lê a função pública
// do catálogo com a chave anon e a versão publicada em /catalogo-academy.json.
import { appendFileSync } from "node:fs";
import { buscarCatalogo, versaoCatalogo } from "./lib/catalogo-academy.mjs";

const SITE = process.env.SITE_ORIGIN || "https://www.cydef.com.br";

let catalogo;
try {
  catalogo = await buscarCatalogo({ url: process.env.VITE_SUPABASE_URL, chave: process.env.VITE_SUPABASE_ANON_KEY });
} catch (e) {
  if (!e.funcaoAusente) throw e;
  // Migração 0020 ainda não aplicada: nada a publicar por enquanto.
  console.log("catalogo: a função do catálogo ainda não existe no banco, nada a fazer.");
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, "mudou=false\n");
  process.exit(0);
}
const atual = versaoCatalogo(catalogo);

let publicada = null;
try {
  const r = await fetch(`${SITE}/catalogo-academy.json`, { cache: "no-store" });
  if (r.ok) publicada = (await r.json()).versao ?? null;
} catch {
  // site fora do ar ou arquivo ainda inexistente: trata como mudança
}

const mudou = publicada !== atual;
console.log(`catalogo: publicada ${publicada?.slice(0, 12) ?? "nenhuma"}, banco ${atual.slice(0, 12)}: ${mudou ? "mudou" : "igual"}.`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `mudou=${mudou}\n`);
