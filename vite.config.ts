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
  // Dominio custom (www.cydef.com.br) serve na raiz — assets sem prefixo
  base: mode === "development" ? "/" : "/",
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
  },
  // F-04 (Low, perf): REVERTIDO para chunking padrao do Vite — o chunking manual
  // quebrou o runtime do React em producao (instancias duplicadas de react/react-dom
  // e ciclo de chunks vendor <-> react-vendor -> tela preta). O aviso de >500 kB e
  // cosmetico para um prototipo; lazy-loading por rota fica registrado para o MVP.
  build: {},
}));
