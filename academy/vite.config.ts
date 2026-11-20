/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.dirname(fileURLToPath(import.meta.url));

// Portal do aluno da CyDef Academy (academy.cydef.com.br), publicado no
// Cloudflare Pages a partir da pasta academy/ do repositório cydef-nexus.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(raiz, "src") } },
  server: { port: 5180 },
  build: {
    target: "es2022",
    sourcemap: false,
    // Fonte nunca vira data: URL. A CSP do portal (public/_headers) libera só
    // font-src 'self', e o subconjunto pequeno da JetBrains Mono embutido no
    // CSS era bloqueado pelo navegador.
    assetsInlineLimit: (arquivo) => (/\.(woff2?|ttf|otf)$/.test(arquivo) ? false : undefined),
    // O único bloco acima de 500 kB é o gerador do certificado em PDF
    // (pdf-lib e fontkit), baixado só quando o aluno clica em "Baixar PDF".
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        manualChunks: {
          supabase: ["@supabase/supabase-js"],
          motion: ["motion"],
          pdf: ["pdf-lib", "@pdf-lib/fontkit", "qrcode-generator"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "tests/**/*.test.ts"],
    css: false,
    testTimeout: 30_000,
  },
});
