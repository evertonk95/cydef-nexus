import { NavLink, Outlet, useLocation } from "react-router";
import { useEquipe } from "@/lib/instrutor";
import { cn } from "@/lib/cn";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { FalhaCarregamento, NaoEncontrado } from "../Estados";

/**
 * Área do instrutor. Para quem não é da equipe a rota não existe (404), sem
 * dizer que há um painel ali. A permissão de verdade fica no banco.
 */
export default function AreaInstrutor() {
  const eu = useEquipe();
  const { pathname } = useLocation();
  if (eu.isError) return <FalhaCarregamento tentar={() => void eu.refetch()} />;
  if (eu.isPending)
    return (
      <div aria-busy="true" aria-label="Carregando o painel do instrutor" className="flex flex-col gap-4">
        <Esqueleto className="h-9 w-64" />
        <Esqueleto className="h-5 w-96 max-w-full" />
      </div>
    );
  if (!eu.data) return <NaoEncontrado />;

  const abas = [
    { para: "/instrutor", rotulo: "Cursos", fim: false, admin: false },
    { para: "/instrutor/aprovacoes", rotulo: "Aprovações", fim: true, admin: false, aprovador: true },
    { para: "/instrutor/trilhas", rotulo: "Trilhas", fim: true, admin: true },
    { para: "/instrutor/vendas", rotulo: "Vendas", fim: true, admin: true },
    { para: "/instrutor/boletim", rotulo: "Boletim do SOC", fim: true, admin: true },
    { para: "/instrutor/equipe", rotulo: "Equipe", fim: true, admin: true },
    { para: "/instrutor/perfil", rotulo: "Meu perfil", fim: true, admin: false },
  ].filter((a) => (!a.admin || eu.data!.papel === "admin") && (!("aprovador" in a) || eu.data!.aprova_materiais));

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end gap-x-8 gap-y-3 border-b border-line">
        <p className="m-0 pb-3 text-sm text-muted">
          Painel do instrutor{eu.data.papel === "admin" ? ", acesso de admin" : ""}
        </p>
        <nav aria-label="Painel do instrutor" className="flex gap-6">
          {abas.map((a) => (
            <NavLink
              key={a.para}
              to={a.para}
              end={a.fim}
              className={({ isActive }) => {
                // "Cursos" fica ativo em /instrutor e em /instrutor/cursos/*.
                const ativo = a.para === "/instrutor" ? isActive && !/\/instrutor\/(trilhas|vendas|boletim|equipe|perfil|aprovacoes)/.test(pathname) : isActive;
                return cn(
                  "-mb-px border-b-2 pb-3 text-[15px] font-medium transition-colors duration-150",
                  ativo ? "border-orange text-ink" : "border-transparent text-muted hover:text-ink",
                );
              }}
            >
              {a.rotulo}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet context={eu.data} />
    </>
  );
}
