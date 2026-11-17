import { createContext, useContext } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { Config } from "./config";

export interface Contexto {
  config: Config;
  sb: SupabaseClient;
  sessao: Session | null;
  carregando: boolean;
  sair: () => Promise<void>;
}

export const CtxPortal = createContext<Contexto | null>(null);

export function usePortal(): Contexto {
  const v = useContext(CtxPortal);
  if (!v) throw new Error("usePortal fora do ProvedorPortal");
  return v;
}
