import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

// Config de testes da CyDef Academy (S-02..S-06).
// Ambiente jsdom para testes de componente; Edge Functions (supabase/functions)
// são testadas como handlers com dependências injetadas (sem runtime Deno).
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "supabase/functions/**/*.test.{ts,tsx}"],
    css: false,
    globals: false,
    // Teto por teste. A suíte roda em paralelo e os testes de formulário
    // (userEvent) e de axe passam dos 5 s padrão no PC de desenvolvimento:
    // em 16/11/2026 o axe derrubou 13 testes em cascata em accessibility.test.tsx
    // e o TriagemBot derrubou 3 por timeout. Com teto maior a máquina lenta
    // deixa de reprovar; violação real continua reprovando.
    testTimeout: 20_000,
  },
});
