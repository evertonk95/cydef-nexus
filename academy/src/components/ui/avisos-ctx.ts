import { createContext, useContext } from "react";

export interface Aviso {
  id: number;
  titulo: string;
  texto?: string;
  tipo: "ok" | "info";
}

export const CtxAvisos = createContext<(a: Omit<Aviso, "id">) => void>(() => undefined);

export function useAvisos() {
  return useContext(CtxAvisos);
}
