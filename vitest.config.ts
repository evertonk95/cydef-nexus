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
  },
});
