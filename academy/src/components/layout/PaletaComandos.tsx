import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useQueries } from "@tanstack/react-query";
import { BookOpen, Layers, LayoutGrid, LogOut, PlayCircle, Search } from "lucide-react";
import { usePainel } from "@/lib/consultas";
import { usePortal } from "@/lib/portal";
import { buscarCurso, type CursoDetalhe } from "@/lib/cursos";
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

/** Fora do componente para manter a mesma referência entre renderizações. */
function soCursos(r: { data?: CursoDetalhe | null }[]): CursoDetalhe[] {
  return r.map((q) => q.data).filter((c): c is CursoDetalhe => Boolean(c));
}

export function PaletaComandos({ aberta, fechar }: { aberta: boolean; fechar: () => void }) {
  return <AnimatePresence>{aberta && <Conteudo key="paleta" fechar={fechar} />}</AnimatePresence>;
}

function Conteudo({ fechar }: { fechar: () => void }) {
  const navegar = useNavigate();
  const { sb, sessao, sair } = usePortal();
  const painel = usePainel();
  // Módulos e aulas entram na busca. Mesma chave de useCurso, então reaproveita
  // o cache de quem já abriu o curso.
  const detalhes = useQueries({
    queries: (painel.data?.cursos ?? []).map((c) => ({
      queryKey: ["curso", c.slug, sessao?.user.id],
      queryFn: () => buscarCurso(sb, c.slug, sessao!.user.id),
      enabled: Boolean(sessao),
    })),
    combine: soCursos,
  });
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
            className="w-[min(640px,100%)] overflow-hidden rounded-2xl border border-line-hi bg-[rgba(14,14,16,0.97)] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(249,115,22,0.15),0_0_60px_-20px_rgba(249,115,22,0.4)]"
          >
            <label className="flex items-center gap-3 border-b border-line px-[18px] py-4">
              <Search className="size-[18px] text-orange" aria-hidden="true" />
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
              <kbd className="rounded-md border border-line-hi bg-[#0b0b0c] px-1.5 py-0.5 font-mono text-[11px] text-muted">Esc</kbd>
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
                    {cab && <p className="rotulo-mono m-0 px-2.5 pt-2.5 pb-1.5 !text-dim">{it.grupo}</p>}
                    <div
                      id={`${listaId}-${it.id}`}
                      role="option"
                      aria-selected={i === sel}
                      onMouseEnter={() => setSel(i)}
                      onClick={it.acao}
                      className={`flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-[15px] ${i === sel ? "bg-orange/12 text-orange-hi" : "text-ink"}`}
                    >
                      <Icone className="size-4 flex-none" aria-hidden="true" />
                      <span className="truncate">{it.titulo}</span>
                      {it.detalhe && <span className="ml-auto truncate font-mono text-[11.5px] text-dim">{it.detalhe}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
  );
}
