import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Layers, LayoutGrid, LibraryBig, LogOut, PlayCircle, Search } from "lucide-react";
import { useCursosDetalhados, usePainel } from "@/lib/consultas";
import { usePortal } from "@/lib/portal";
import { caminhoAula, numeroAula, rotuloModulo } from "@/lib/aula";
import { fracao, normalizar } from "@/lib/formato";

interface Item {
  id: string;
  grupo: string;
  titulo: string;
  detalhe?: string;
  icone: typeof Search;
  acao: () => void;
  /** Só aparece quando há texto na busca. */
  soBusca?: boolean;
}

export function PaletaComandos({ aberta, fechar }: { aberta: boolean; fechar: () => void }) {
  return <AnimatePresence>{aberta && <Conteudo key="paleta" fechar={fechar} />}</AnimatePresence>;
}

function Conteudo({ fechar }: { fechar: () => void }) {
  const navegar = useNavigate();
  const { sair } = usePortal();
  const painel = usePainel();
  const detalhes = useCursosDetalhados((painel.data?.cursos ?? []).map((c) => c.slug)).cursos;
  const [busca, setBusca] = useState("");
  const [sel, setSel] = useState(0);
  const listaId = useId();

  const itens = useMemo<Item[]>(() => {
    const ir = (para: string) => () => {
      fechar();
      navegar(para);
    };
    const l: Item[] = [];
    const c = painel.data?.continuar;
    if (c) {
      l.push({ id: "continuar", grupo: "Continuar", titulo: `Aula ${String(c.aula_numero).padStart(2, "0")}: ${c.aula_titulo}`, detalhe: c.curso_titulo, icone: PlayCircle, acao: ir(`/cursos/${c.curso_slug}/aulas/${c.aula_numero}`) });
    }
    for (const curso of painel.data?.cursos ?? []) {
      l.push({ id: `curso-${curso.slug}`, grupo: "Cursos", titulo: curso.titulo, detalhe: fracao(curso.concluidas, curso.total, "aula", "aulas"), icone: BookOpen, acao: ir(`/cursos/${curso.slug}`) });
    }
    for (const curso of detalhes) {
      for (const m of curso.modulos) {
        l.push({ id: `modulo-${m.id}`, grupo: "Módulos", titulo: rotuloModulo(m.ordem, m.titulo), detalhe: curso.titulo, icone: Layers, acao: ir(`/cursos/${curso.slug}`), soBusca: true });
      }
    }
    for (const curso of detalhes) {
      for (const a of curso.modulos.flatMap((m) => m.aulas)) {
        l.push({ id: `aula-${a.id}`, grupo: "Aulas", titulo: `Aula ${numeroAula(a.numero)}: ${a.titulo}`, detalhe: curso.titulo, icone: PlayCircle, acao: ir(caminhoAula(curso.slug, a.numero)), soBusca: true });
      }
    }
    l.push({ id: "painel", grupo: "Páginas", titulo: "Meu painel", icone: LayoutGrid, acao: ir("/") });
    l.push({ id: "cursos", grupo: "Páginas", titulo: "Meus cursos", icone: BookOpen, acao: ir("/cursos") });
    l.push({ id: "catalogo", grupo: "Páginas", titulo: "Catálogo de cursos", icone: LibraryBig, acao: ir("/catalogo") });
    l.push({ id: "sair", grupo: "Conta", titulo: "Sair", icone: LogOut, acao: () => { fechar(); void sair(); } });
    return l;
  }, [painel.data, detalhes, navegar, fechar, sair]);

  const filtrados = useMemo(() => {
    const q = normalizar(busca.trim());
    // Sem texto, a lista fica curta: módulos e aulas só aparecem quando buscados.
    if (!q) return itens.filter((i) => !i.soBusca);
    return itens.filter((i) => normalizar(`${i.titulo} ${i.detalhe ?? ""}`).includes(q));
  }, [itens, busca]);

  const teclado = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); fechar(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(filtrados.length - 1, s + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); filtrados[sel]?.acao(); }
  };

  let grupo = "";
  return (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.16 } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) fechar(); }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Buscar na Academy"
            onKeyDown={teclado}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } }}
            className="w-[min(640px,100%)] overflow-hidden rounded-2xl border border-line-hi bg-panel"
          >
            <label className="flex items-center gap-3 border-b border-line px-[18px] py-4">
              <Search className="size-[18px] text-muted" aria-hidden="true" />
              <input
                autoFocus
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setSel(0); }}
                placeholder="Buscar cursos, aulas e páginas"
                aria-label="Buscar"
                aria-controls={listaId}
                aria-activedescendant={filtrados[sel] ? `${listaId}-${filtrados[sel]!.id}` : undefined}
                className="flex-1 border-0 bg-transparent text-base font-medium text-ink outline-none placeholder:text-dim"
              />
              <kbd className="rounded-md border border-line-hi px-1.5 py-px text-xs text-muted">Esc</kbd>
            </label>
            <ul id={listaId} role="listbox" aria-label="Resultados" className="m-0 max-h-[340px] list-none overflow-auto p-2">
              {filtrados.length === 0 && (
                <li className="p-6 text-center text-muted">
                  Nada encontrado para "{busca.trim()}". Tente o nome de um curso, módulo ou aula.
                </li>
              )}
              {filtrados.map((it, i) => {
                const cab = it.grupo !== grupo;
                grupo = it.grupo;
                const Icone = it.icone;
                return (
                  <li key={it.id} role="presentation">
                    {cab && <p className="rotulo m-0 px-2.5 pt-3 pb-1.5 font-medium">{it.grupo}</p>}
                    <div
                      id={`${listaId}-${it.id}`}
                      role="option"
                      aria-selected={i === sel}
                      onMouseEnter={() => setSel(i)}
                      onClick={it.acao}
                      className={`flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-[15px] ${i === sel ? "bg-white/[0.07] text-ink" : "text-ink"}`}
                    >
                      <Icone className="size-4 flex-none" aria-hidden="true" />
                      <span className="truncate">{it.titulo}</span>
                      {it.detalhe && <span className="ml-auto truncate text-[13px] text-muted">{it.detalhe}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
  );
}
