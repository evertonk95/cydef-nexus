import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { CtxPortal, type Contexto } from "./portal";
import type { Config } from "./config";

export function ProvedorPortal({ config, sb, children }: { config: Config; sb: SupabaseClient; children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    sb.auth.getSession().then(({ data }) => {
      if (!vivo) return;
      setSessao(data.session);
      setCarregando(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_evento, nova) => {
      setSessao(nova);
      setCarregando(false);
    });
    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, [sb]);

  const valor = useMemo<Contexto>(
    () => ({
      config,
      sb,
      sessao,
      carregando,
      sair: async () => {
        await sb.auth.signOut({ scope: "local" });
      },
    }),
    [config, sb, sessao, carregando],
  );

  return <CtxPortal.Provider value={valor}>{children}</CtxPortal.Provider>;
}

