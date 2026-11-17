/**
 * Configuração pública do portal (valores que vão para o navegador).
 * Nenhum segredo aqui: a anon key do Supabase é pública por desenho e os dados
 * ficam protegidos por RLS. Falta de variável derruba o portal com mensagem
 * clara em vez de rodar pela metade.
 */
export interface Config {
  supabaseUrl: string;
  supabaseAnonKey: string;
  acessoApiUrl: string;
  turnstileSiteKey: string;
  siteUrl: string;
}

export function lerConfig(env: Record<string, string | undefined> = import.meta.env): Config {
  const faltando: string[] = [];
  const pegar = (nome: string): string => {
    const v = env[nome]?.trim() ?? "";
    if (!v) faltando.push(nome);
    return v;
  };
  const config: Config = {
    supabaseUrl: pegar("VITE_SUPABASE_URL"),
    supabaseAnonKey: pegar("VITE_SUPABASE_ANON_KEY"),
    acessoApiUrl: pegar("VITE_ACESSO_API_URL"),
    turnstileSiteKey: pegar("VITE_TURNSTILE_SITE_KEY"),
    siteUrl: env.VITE_SITE_URL?.trim() || "https://www.cydef.com.br",
  };
  for (const url of [config.supabaseUrl, config.acessoApiUrl]) {
    if (url && !/^https:\/\//.test(url) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url)) {
      faltando.push(`URL insegura: ${url}`);
    }
  }
  if (faltando.length > 0) {
    throw new Error(`Configuração do portal incompleta: ${faltando.join(", ")}`);
  }
  return config;
}
