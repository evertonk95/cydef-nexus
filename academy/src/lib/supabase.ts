import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Config } from "./config";

/**
 * Cliente do Supabase do portal. O link de acesso é gerado no servidor
 * (função academy-acesso), então o retorno chega no formato implícito
 * (tokens no fragmento #, que não vai para o servidor nem para o Referer).
 * O cliente lê o fragmento, cria a sessão e limpa a barra de endereço.
 */
export function criarSupabase(config: Config): SupabaseClient {
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      flowType: "implicit",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "cydef-academy-sessao",
    },
    global: { headers: { "x-client-info": "cydef-academy-portal" } },
  });
}
