import { useCallback, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Building2 } from "lucide-react";
import { useMinhasEmpresas } from "@/lib/empresas";
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
          <AvisoConvite />
          <Outlet />
        </main>
      </div>
      <PaletaComandos aberta={busca} fechar={fechar} />
    </>
  );
}

/** Convite de empresa pendente: chama para a página de convites, fora dela. */
function AvisoConvite() {
  const minhas = useMinhasEmpresas();
  const { pathname } = useLocation();
  const convites = minhas.data?.convites ?? [];
  if (convites.length === 0 || pathname === "/convites") return null;
  const texto =
    convites.length === 1 ? `A ${convites[0]!.empresa} convidou você para a Academy.` : `Você tem ${convites.length} convites de empresas para a Academy.`;
  return (
    <div role="status" className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-orange/40 bg-orange/10 px-5 py-4">
      <Building2 className="size-5 shrink-0 text-orange-hi" aria-hidden="true" />
      <p className="m-0 flex-1 text-[15px]">{texto}</p>
      <Link to="/convites" className="font-semibold text-orange-hi underline-offset-4 hover:underline">
        Ver convite
      </Link>
    </div>
  );
}
