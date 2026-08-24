import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  // Domínio custom (www.cydef.com.br) serve na raiz — assets sem prefixo
  base: mode === "development" ? "/" : "/",
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
  },
  // F-04 (Low, perf): chunk único de 552 kB acima do limite de aviso (500 kB).
  // Divisão de vendor (react/router/ui) — mudança apenas de build/rollup, sem
  // alteração de comportamento em runtime; mantém cache por bloco no GH Pages.
  // NÃO é substituição de lazy-loading por rota (registrado para o MVP).
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react-router")) return "router";
          if (id.includes("recharts") || id.includes("/d3-") || id.includes("/victory-vendor/")) return "charts";
          if (id.includes("/react-dom/") || id.includes("/scheduler/")) return "react-vendor";
          if (id.includes("/@radix-ui/")) return "radix";
          if (id.includes("/cmdk/") || id.includes("/vaul/") || id.includes("/embla-carousel")) return "ui-widgets";
          return "vendor";
        },
      },
    },
  },
}));
