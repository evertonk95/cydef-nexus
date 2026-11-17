import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router";
import { FundoParticulas } from "@/components/fx/FundoParticulas";
import { Topo } from "./Topo";
import { PaletaComandos } from "./PaletaComandos";

/** Moldura das páginas logadas: fundo, barra superior, busca com Ctrl+K. */
export function Moldura() {
  const [busca, setBusca] = useState(false);
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
      <FundoParticulas />
      <div className="relative z-10">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-orange focus:px-4 focus:py-2 focus:text-orange-ink">
          Pular para o conteúdo
        </a>
        <Topo abrirBusca={() => setBusca(true)} />
        <main id="conteudo" className="mx-auto max-w-[1380px] px-4 pt-7 pb-24 sm:px-6">
          <Outlet />
        </main>
      </div>
      <PaletaComandos aberta={busca} fechar={fechar} />
    </>
  );
}
