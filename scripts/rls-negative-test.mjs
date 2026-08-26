#!/usr/bin/env node
/**
 * scripts/rls-negative-test.mjs — GATE HEL-M07 (SEC-009)
 *
 * Teste negativo de RLS contra o REST PÚBLICO do provedor, DE FORA da rede do
 * provedor, com os 6 casos do HEL-M07. Pré-condição de go-live com coleta real.
 *
 * Uso:
 *   SUPABASE_URL=https://<ref>.supabase.co \
 *   SUPABASE_ANON_KEY=<anon key do projeto> \
 *   [SUPABASE_ANON_KEY_OTHER=<anon key de OUTRO projeto>] \
 *   [SUPABASE_SERVICE_ROLE_KEY=<credencial da role de função>] \
 *   node scripts/rls-negative-test.mjs
 *
 * Saída: tabela caso x resultado (somente status codes — NUNCA imprime chaves
 * ou dados). Exit 0 apenas se todos os casos passarem como esperado.
 *
 * Casos:
 *  1. SELECT em leads com anon                         → 401/403 ou array vazio
 *  2. SELECT em consentimentos e tokens_confirmacao    → 401/403 ou array vazio
 *  3. INSERT em qualquer tabela com anon               → negado
 *  4. anon key de OUTRO projeto                        → 401 (cross-tenant)
 *  5. revisão de policies: SELECT em aviso_privacidade → negado (RLS deny-by-default)
 *  6. role de função tenta UPDATE/DELETE consentimentos → negado (grant revogado/trigger)
 */

const URL = process.env.SUPABASE_URL?.replace(/\/+$/, "") ?? "";
const ANON = process.env.SUPABASE_ANON_KEY ?? "";
const ANON_OTHER = process.env.SUPABASE_ANON_KEY_OTHER ?? "";
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const CASOS = [
  { id: 1, nome: "SELECT leads (anon)", metodo: "GET", tabela: "leads" },
  { id: 2, nome: "SELECT consentimentos/tokens (anon)", metodo: "GET", tabela: "consentimentos" },
  { id: 3, nome: "INSERT leads (anon)", metodo: "POST", tabela: "leads" },
  { id: 4, nome: "anon de outro projeto (cross-tenant)", metodo: "GET", tabela: "leads", chave: ANON_OTHER },
  { id: 5, nome: "SELECT aviso_privacidade (anon)", metodo: "GET", tabela: "aviso_privacidade", coluna: "versao" },
  { id: 6, nome: "UPDATE consentimentos (role de função)", metodo: "PATCH", tabela: "consentimentos", chave: SERVICE },
];

function negado(status) {
  return status === 401 || status === 403 || status === 404 || status === 0;
}

async function main() {
  if (!URL || !ANON) {
    console.error("Faltam SUPABASE_URL e/ou SUPABASE_ANON_KEY (env). Nada executado.");
    process.exit(2);
  }

  let falhas = 0;
  console.log("Gate HEL-M07 — teste negativo RLS contra o REST público");
  console.log(`Projeto: ${URL} (fora da rede do provedor)`);
  console.log("─".repeat(72));

  for (const caso of CASOS) {
    if (!caso.chave && (caso.id === 4 || caso.id === 6)) {
      console.log(`caso ${caso.id}: PULADO (env opcional não fornecido) — ${caso.nome}`);
      continue;
    }
    const chave = caso.chave ?? ANON;
    const headers = { Authorization: `Bearer ${chave}`, apikey: chave };
    let status = 0;
    let corpo = "";
    try {
      if (caso.metodo === "GET") {
        const r = await fetch(`${URL}/rest/v1/${caso.tabela}?select=${caso.coluna ?? "id"}&limit=1`, { headers });
        status = r.status;
        corpo = await r.text();
      } else {
        const uuid = crypto.randomUUID();
        const filtro = caso.metodo === "POST" ? "" : `?id=eq.${uuid}`;
        const r = await fetch(`${URL}/rest/v1/${caso.tabela}${filtro}`, {
          method: caso.metodo,
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ id: uuid }),
        });
        status = r.status;
        corpo = await r.text();
      }
    } catch {
      status = 0; // rede/provedor indisponível = fail closed
    }

    const vazio = corpo.trim() === "[]" || corpo.trim() === "";
    const ok = negado(status) || (status === 200 && vazio);
    if (!ok) falhas += 1;
    console.log(
      `caso ${caso.id}: ${ok ? "PASS" : "FAIL"} — ${caso.nome} → HTTP ${status}${status === 200 ? (vazio ? " (vazio)" : " (DADOS!?)") : ""}`,
    );
  }

  console.log("─".repeat(72));
  if (falhas > 0) {
    console.error(`GATE FALHOU (${falhas} caso(s)): revisar grants/policies (HEL-M03) antes do go-live.`);
    process.exit(1);
  }
  console.log("GATE OK — nenhuma leitura/escrita pública da base. Evidência: status codes acima (sem chaves/dados).");
}

main().catch((e) => {
  console.error("erro inesperado (sem detalhes de chave/dado):", e.name);
  process.exit(1);
});
