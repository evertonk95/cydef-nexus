import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { CtxPortal, type Contexto } from "@/lib/portal";
import type { Config } from "@/lib/config";
import type { Painel } from "@/lib/painel";

export const configTeste: Config = {
  supabaseUrl: "https://proj.supabase.co",
  supabaseAnonKey: "anon",
  acessoApiUrl: "https://proj.supabase.co/functions/v1/academy-acesso",
  turnstileSiteKey: "site-key",
  siteUrl: "https://www.cydef.com.br",
};

export const sessaoTeste = { user: { id: "user-1", email: "ana@empresa.com.br" } } as unknown as Session;

export function painelTeste(over: Partial<Painel> = {}): Painel {
  return {
    nome: "Ana Souza",
    continuar: {
      curso_slug: "fundamentos-para-soc",
      curso_titulo: "Fundamentos para SOC",
      modulo_ordem: 2,
      modulo_titulo: "Sinais e dados",
      aula_id: "a5",
      aula_numero: 5,
      aula_titulo: "O que é um SIEM na prática",
      duracao_seg: 1080,
      posicao_seg: 412,
      progresso_curso: 33,
    },
    cursos: [
      { slug: "fundamentos-para-soc", titulo: "Fundamentos para SOC", total: 12, concluidas: 4, ultimo_acesso: "2026-11-16T10:00:00Z" },
      { slug: "cybersecurity-fundamentals", titulo: "Cybersecurity Fundamentals", total: 16, concluidas: 16, ultimo_acesso: "2026-11-01T10:00:00Z" },
    ],
    formacoes: [
      {
        slug: "analista-soc",
        titulo: "Formação Analista SOC",
        aulas_total: 28,
        aulas_concluidas: 20,
        trilhas: [{ slug: "fundamentos", titulo: "Fundamentos", total: 28, concluidas: 20 }],
      },
    ],
    competencias: [
      { slug: "triagem-alertas", titulo: "Triagem de alertas", percentual: 60 },
      { slug: "analise-logs", titulo: "Análise de logs", percentual: 35 },
    ],
    dias_estudo: ["2026-11-15", "2026-11-16", "2026-11-17"],
    hoje: "2026-11-17",
    ...over,
  };
}

/** Cliente do Supabase falso: rpc e from respondem com o que o teste definir. */
export function sbFalso(opts: { painel?: Painel | null; boletim?: unknown[]; rpcErro?: string } = {}): SupabaseClient {
  const consulta = {
    select: () => consulta,
    order: () => consulta,
    limit: () => Promise.resolve({ data: opts.boletim ?? [], error: null }),
  };
  return {
    rpc: (nome: string) => {
      if (opts.rpcErro) return Promise.resolve({ data: null, error: { message: opts.rpcErro } });
      if (nome === "academy_meu_painel") return Promise.resolve({ data: opts.painel ?? null, error: null });
      return Promise.resolve({ data: { nome: "Ana" }, error: null });
    },
    from: () => consulta,
    auth: { signOut: () => Promise.resolve({ error: null }) },
  } as unknown as SupabaseClient;
}

export function renderizar(
  ui: ReactNode,
  { rota = "/", caminho = "/", sb = sbFalso(), sessao = sessaoTeste }: { rota?: string; caminho?: string; sb?: SupabaseClient; sessao?: Session | null } = {},
) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const ctx: Contexto = { config: configTeste, sb, sessao, carregando: false, sair: async () => undefined };
  return render(
    <QueryClientProvider client={qc}>
      <CtxPortal.Provider value={ctx}>
        <MemoryRouter initialEntries={[rota]}>
          <Routes>
            <Route path={caminho} element={ui} />
            <Route path="*" element={<p>outra rota</p>} />
          </Routes>
        </MemoryRouter>
      </CtxPortal.Provider>
    </QueryClientProvider>,
  );
}
