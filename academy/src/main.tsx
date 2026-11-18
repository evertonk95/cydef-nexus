import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import "./styles.css";
import { lerConfig } from "@/lib/config";
import { criarSupabase } from "@/lib/supabase";
import { guardarRetornoInicial } from "@/lib/retorno";
import { App } from "./App";

// O link de acesso precisa ser lido antes de o Supabase mexer na URL.
guardarRetornoInicial(window.location, window.history);

const raiz = createRoot(document.getElementById("root")!);

try {
  const config = lerConfig();
  const sb = criarSupabase(config);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
  });
  raiz.render(
    <StrictMode>
      <App config={config} sb={sb} queryClient={queryClient} />
    </StrictMode>,
  );
} catch {
  raiz.render(
    <main style={{ fontFamily: "system-ui", color: "#f5f5f4", padding: 32 }}>
      <h1>Portal indisponível</h1>
      <p>A configuração do portal está incompleta. Avise a equipe da CyDef.</p>
    </main>,
  );
}
