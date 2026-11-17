import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router";
import { BookOpen, ChevronDown, LayoutGrid, LogOut, Search, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { usePortal } from "@/lib/portal";
import { usePainel } from "@/lib/consultas";
import { iniciais } from "@/lib/formato";
import { cn } from "@/lib/cn";
import { urlAviso } from "@/lib/privacidade";

const links = [
  { para: "/", rotulo: "Meu painel", icone: LayoutGrid, fim: true },
  { para: "/cursos", rotulo: "Meus cursos", icone: BookOpen, fim: false },
];

export function Topo({ abrirBusca }: { abrirBusca: () => void }) {
  const { sair, sessao, config } = usePortal();
  const painel = usePainel();
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
    <header className="sticky top-0 z-30 border-b border-line bg-[rgba(5,5,5,0.72)] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1380px] items-center gap-4 px-4 py-3 sm:gap-7 sm:px-6">
        <Logo />
        <nav aria-label="Principal" className="hidden flex-1 gap-1 md:flex">
          {links.map(({ para, rotulo, icone: Icone, fim }) => (
            <NavLink
              key={para}
              to={para}
              end={fim}
              className={({ isActive }) =>
                cn(
                  "relative flex items-center gap-2 whitespace-nowrap rounded-[10px] px-3 py-2.5 text-[14.5px] font-medium transition-colors duration-150",
                  isActive
                    ? "text-orange after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded after:bg-orange after:shadow-[0_0_12px_1px_rgba(249,115,22,0.8)]"
                    : "text-muted hover:bg-white/5 hover:text-ink",
                )
              }
            >
              <Icone className="size-[17px]" aria-hidden="true" />
              {rotulo}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={abrirBusca}
          aria-haspopup="dialog"
          className="ml-auto flex items-center gap-2.5 rounded-xl border border-line bg-[rgba(20,20,22,0.7)] px-3 py-2.5 text-sm text-dim transition-[border-color,box-shadow] duration-200 hover:border-line-hi hover:shadow-[0_0_0_4px_rgba(249,115,22,0.06)] md:ml-0 lg:min-w-[280px]"
        >
          <Search className="size-4" aria-hidden="true" />
          <span className="hidden flex-1 text-left lg:inline">Buscar cursos e aulas</span>
          <span className="sr-only lg:hidden">Buscar</span>
          <kbd className="hidden rounded-md border border-line-hi bg-[#0b0b0c] px-1.5 py-0.5 font-mono text-[11px] text-muted lg:inline">Ctrl K</kbd>
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
            <span className="grid size-10 place-items-center rounded-full border border-orange/45 bg-[linear-gradient(145deg,#3b1a06,#1a0c03)] text-sm font-bold text-orange-hi">
              {iniciais(nome)}
            </span>
            <ChevronDown className={cn("size-4 text-muted transition-transform duration-200", menu && "rotate-180")} aria-hidden="true" />
          </button>
          {menu && (
            <div role="menu" className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-line-hi bg-[rgba(14,14,16,0.98)] p-1.5 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.9)]">
              <p className="m-0 truncate px-3 pt-2 pb-1 text-sm font-semibold">{painel.data?.nome ?? "Aluno"}</p>
              <p className="m-0 truncate px-3 pb-2 font-mono text-xs text-dim">{sessao?.user.email}</p>
              <div className="my-1 h-px bg-line" />
              <NavLink role="menuitem" to="/cursos" onClick={() => setMenu(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-white/5 md:hidden">
                <BookOpen className="size-4" aria-hidden="true" /> Meus cursos
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
