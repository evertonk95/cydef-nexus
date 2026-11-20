import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import { BookOpen, Building2, ChevronDown, Crosshair, LibraryBig, LogOut, PencilRuler, Search, ShieldCheck, UserRound } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { usePortal } from "@/lib/portal";
import { usePainel } from "@/lib/consultas";
import { iniciais } from "@/lib/formato";
import { cn } from "@/lib/cn";
import { urlAviso } from "@/lib/privacidade";
import { useEquipe } from "@/lib/instrutor";
import { useMinhasEmpresas } from "@/lib/empresas";
import { useMissoes } from "@/lib/missoes";

const links = [
  { para: "/", rotulo: "Painel", fim: true },
  { para: "/cursos", rotulo: "Meus cursos", fim: false },
  { para: "/catalogo", rotulo: "Catálogo", fim: false },
];

export function Topo({ abrirBusca }: { abrirBusca: () => void }) {
  const { sair, sessao, config } = usePortal();
  const painel = usePainel();
  const equipe = useEquipe();
  const minhas = useMinhasEmpresas();
  const gestao = (minhas.data?.empresas ?? []).some((e) => e.gestor);
  const missoes = useMissoes();
  const comMissoes = (missoes.data?.length ?? 0) > 0;
  const itens = [
    ...links,
    ...(comMissoes ? [{ para: "/missoes", rotulo: "Missões", fim: false }] : []),
    ...(gestao ? [{ para: "/empresa", rotulo: "Minha empresa", fim: false }] : []),
    ...(equipe.data ? [{ para: "/instrutor", rotulo: "Instrutor", fim: false }] : []),
  ];
  const nome = painel.data?.nome ?? sessao?.user.email ?? "";
  const [menu, setMenu] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const fora = (e: MouseEvent) => { if (!caixa.current?.contains(e.target as Node)) setMenu(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", fora); document.removeEventListener("keydown", esc); };
  }, [menu]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-5 sm:gap-8 sm:px-8">
        <Logo />
        <nav aria-label="Principal" className="hidden h-full flex-1 gap-6 md:flex">
          {itens.map(({ para, rotulo, fim }) => (
            <NavLink
              key={para}
              to={para}
              end={fim}
              className={({ isActive }) =>
                cn(
                  "-mb-px flex items-center whitespace-nowrap border-b-2 text-[15px] font-medium transition-colors duration-150",
                  isActive ? "border-orange text-ink" : "border-transparent text-muted hover:text-ink",
                )
              }
            >
              {rotulo}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={abrirBusca}
          aria-haspopup="dialog"
          className="ml-auto flex h-10 items-center gap-2.5 rounded-[10px] border border-line bg-panel px-3 text-sm text-muted transition-colors duration-150 hover:border-line-hi hover:text-ink md:ml-0"
        >
          <Search className="size-4" aria-hidden="true" />
          <span className="hidden flex-1 text-left lg:inline">Buscar</span>
          <span className="sr-only lg:hidden">Buscar</span>
          <kbd className="hidden rounded-md border border-line-hi px-1.5 py-px text-xs font-sans text-muted lg:inline">Ctrl K</kbd>
        </button>
        <div ref={caixa} className="relative">
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-haspopup="menu"
            aria-label="Menu da conta"
            className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 hover:bg-white/5"
          >
            <span className="grid size-10 place-items-center rounded-full border border-line-hi bg-panel text-sm font-semibold text-ink">
              {iniciais(nome)}
            </span>
            <ChevronDown className={cn("size-4 text-muted transition-transform duration-200", menu && "rotate-180")} aria-hidden="true" />
          </button>
          {menu && (
            <div role="menu" className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-line-hi bg-panel p-1.5">
              <p className="m-0 truncate px-3 pt-2 pb-1 text-sm font-semibold">{painel.data?.nome ?? "Aluno"}</p>
              <p className="m-0 truncate px-3 pb-2 text-xs text-dim">{sessao?.user.email}</p>
              <div className="my-1 h-px bg-line" />
              <NavLink role="menuitem" to="/cursos" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-white/5 md:hidden">
                <BookOpen className="size-4" aria-hidden="true" /> Meus cursos
              </NavLink>
              <NavLink role="menuitem" to="/catalogo" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-white/5 md:hidden">
                <LibraryBig className="size-4" aria-hidden="true" /> Catálogo
              </NavLink>
              {comMissoes && (
                <NavLink role="menuitem" to="/missoes" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-white/5 md:hidden">
                  <Crosshair className="size-4" aria-hidden="true" /> Missões
                </NavLink>
              )}
              {gestao && (
                <NavLink role="menuitem" to="/empresa" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-white/5 md:hidden">
                  <Building2 className="size-4" aria-hidden="true" /> Minha empresa
                </NavLink>
              )}
              {equipe.data && (
                <NavLink role="menuitem" to="/instrutor" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-white/5 md:hidden">
                  <PencilRuler className="size-4" aria-hidden="true" /> Painel do instrutor
                </NavLink>
              )}
              <NavLink role="menuitem" to="/conta" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-white/5">
                <UserRound className="size-4" aria-hidden="true" /> Minha conta
              </NavLink>
              <a role="menuitem" href={urlAviso(config.siteUrl)} target="_blank" rel="noopener" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-white/5">
                <ShieldCheck className="size-4" aria-hidden="true" /> Privacidade
              </a>
              <button role="menuitem" type="button" onClick={() => { setMenu(false); void sair(); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5">
                <LogOut className="size-4" aria-hidden="true" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
