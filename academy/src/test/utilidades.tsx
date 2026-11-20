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

/** Curso detalhado de teste: módulo 2 com a aula em andamento e módulo 3 ainda sem aula. */
export const cursoDetalheTeste = {
  slug: "fundamentos-para-soc",
  titulo: "Fundamentos para SOC",
  descricao: "Como funciona um SOC.",
  nivel: "iniciante",
  gratuito: true,
  ordem: 2,
  modulos: [
    { id: "m1", ordem: 1, titulo: "O SOC por dentro", aulas: [{ id: "a4", ordem: 1, numero: 4, titulo: "Papéis no SOC", resumo: "", duracao_seg: 900 }] },
    { id: "m2", ordem: 2, titulo: "Sinais e dados", aulas: [{ id: "a5", ordem: 1, numero: 5, titulo: "O que é um SIEM na prática", resumo: "", duracao_seg: 1080 }] },
    { id: "m3", ordem: 3, titulo: "Triagem de alertas", aulas: [] },
  ],
};

/** Cliente do Supabase falso: rpc e from respondem com o que o teste definir. */
export function sbFalso(
  opts: {
    painel?: Painel | null;
    boletim?: unknown[];
    rpcErro?: string;
    cursos?: Record<string, unknown>;
    progresso?: unknown[];
    /** Respostas por nome de função; uma função recebe os argumentos da chamada. */
    rpcs?: Record<
      string,
      ((args: Record<string, unknown>) => { data?: unknown; error?: { message: string } }) | object | string | number | boolean | null
    >;
    /** Edge Functions chamadas com functions.invoke; recebem o corpo. */
    funcoes?: Record<string, (corpo: unknown) => { data?: unknown; error?: { message: string } }>;
  } = {},
): SupabaseClient {
  const cadeia = (tabela: string) => {
    let slug = "";
    const c: Record<string, unknown> = {};
    for (const m of ["select", "order", "in"]) c[m] = () => c;
    c.eq = (coluna: string, valor: string) => {
      if (coluna === "slug" || coluna === "curso_slug") slug = valor;
      return c;
    };
    c.limit = () => Promise.resolve({ data: opts.boletim ?? [], error: null });
    c.maybeSingle = () => {
      if (tabela === "cursos") return Promise.resolve({ data: opts.cursos?.[slug] ?? null, error: null });
      if (tabela === "matriculas") return Promise.resolve({ data: { curso_slug: slug }, error: null });
      return Promise.resolve({ data: null, error: null });
    };
    c.then = (ok: (v: unknown) => unknown) => Promise.resolve({ data: tabela === "progresso_aulas" ? (opts.progresso ?? []) : [], error: null }).then(ok);
    return c;
  };
  return {
    rpc: (nome: string, args: Record<string, unknown> = {}) => {
      if (opts.rpcs && nome in opts.rpcs) {
        const r = opts.rpcs[nome];
        if (typeof r === "function") {
          const { data = null, error = null } = r(args);
          return Promise.resolve({ data, error });
        }
        return Promise.resolve({ data: r, error: null });
      }
      if (opts.rpcErro) return Promise.resolve({ data: null, error: { message: opts.rpcErro } });
      if (nome === "academy_adm_eu") return Promise.resolve({ data: null, error: null });
      if (nome === "academy_meu_painel") return Promise.resolve({ data: opts.painel ?? null, error: null });
      return Promise.resolve({ data: { nome: "Ana" }, error: null });
    },
    from: (tabela: string) => cadeia(tabela),
    auth: { signOut: () => Promise.resolve({ error: null }) },
    functions: {
      invoke: (nome: string, o: { body?: unknown } = {}) => {
        const f = opts.funcoes?.[nome];
        if (!f) return Promise.resolve({ data: null, error: { message: "função ausente" } });
        const { data = null, error = null } = f(o.body);
        return Promise.resolve({ data, error });
      },
    },
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
