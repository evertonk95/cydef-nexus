import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { usePortal } from "@/lib/portal";
import { registrarAcessoDaSessao } from "@/lib/sessao-acesso";
import { Topo } from "./Topo";
import { PaletaComandos } from "./PaletaComandos";

/** Moldura das páginas logadas: barra superior e busca com Ctrl+K. */
export function Moldura() {
  const [busca, setBusca] = useState(false);
  const { sb, sessao } = usePortal();
  const qc = useQueryClient();
  const userId = sessao?.user.id;
  useEffect(() => {
    if (!userId) return;
    void registrarAcessoDaSessao(sb, userId).then((novo) => {
      if (novo) void qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "painel" || q.queryKey[0] === "curso" });
    });
  }, [sb, userId, qc]);
  const fechar = useCallback(() => setBusca(false), []);
  useEffect(() => {
    const atalho = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setBusca((b) => !b);
      }
    };
    document.addEventListener("keydown", atalho);
    return () => document.removeEventListener("keydown", atalho);
  }, []);
  return (
    <>
      <div>
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-orange focus:px-4 focus:py-2 focus:text-orange-ink">
          Pular para o conteúdo
        </a>
        <Topo abrirBusca={() => setBusca(true)} />
        <main id="conteudo" className="mx-auto max-w-[1200px] px-5 pt-10 pb-24 sm:px-8">
          <Outlet />
        </main>
      </div>
      <PaletaComandos aberta={busca} fechar={fechar} />
    </>
  );
}
