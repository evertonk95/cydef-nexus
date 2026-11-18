import { useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Play } from "lucide-react";
import { caminhoAula, numeroAula, rotuloModulo } from "@/lib/aula";
import { duracao } from "@/lib/formato";
import { cn } from "@/lib/cn";
import type { CursoDetalhe } from "@/lib/cursos";

/** Módulos e aulas do curso, com a aula atual destacada. */
export function ListaAulas({ curso, atual, moduloAtual }: { curso: CursoDetalhe; atual: string; moduloAtual: string }) {
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const aberto = (id: string) => abertos[id] ?? id === moduloAtual;

  return (
    <nav aria-label={`Aulas de ${curso.titulo}`}>
      <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
        {curso.modulos.map((m) => {
          const estaAberto = aberto(m.id);
          const feitas = m.aulas.filter((a) => a.concluida).length;
          const completo = m.aulas.length > 0 && feitas === m.aulas.length;
          return (
            <li key={m.id} className={cn("overflow-hidden rounded-xl border bg-[rgba(9,9,10,0.7)]", m.id === moduloAtual ? "border-orange/30" : "border-line")}>
              <h3 className="m-0">
                <button
                  type="button"
                  aria-expanded={estaAberto}
                  onClick={() => setAbertos((s) => ({ ...s, [m.id]: !estaAberto }))}
                  className={cn("flex w-full items-center gap-2.5 px-3.5 py-3 text-left text-[14.5px] font-semibold transition-colors duration-150", estaAberto && "bg-orange/6 text-orange-hi")}
                >
                  <ChevronDown className={cn("size-4 flex-none text-muted transition-transform duration-200", estaAberto && "rotate-180 text-orange")} aria-hidden="true" />
                  <span className="flex-1">{rotuloModulo(m.ordem, m.titulo)}</span>
                  <span className={cn("inline-flex items-center gap-1 font-mono text-xs", completo ? "text-ok" : "text-muted")}>
                    {feitas}/{m.aulas.length}
                    {completo && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
                  </span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {estaAberto && (
                  <motion.ul
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } }}
                    exit={{ opacity: 0, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } }}
                    className="m-0 list-none p-0"
                  >
                    {m.aulas.map((a) => {
                      const eAtual = a.id === atual;
                      return (
                        <li key={a.id} className="border-t border-[#1a1a1d]">
                          <Link
                            to={caminhoAula(curso.slug, a.numero)}
                            aria-current={eAtual ? "page" : undefined}
                            className={cn(
                              "relative flex items-center gap-3 px-3.5 py-3 text-sm transition-colors duration-150 hover:bg-white/[0.03]",
                              eAtual && "bg-orange/[0.07] before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-orange",
                            )}
                          >
                            <span
                              className={cn(
                                "grid size-[22px] flex-none place-items-center rounded-full border-[1.5px]",
                                a.concluida ? "border-ok bg-ok text-[#052e13]" : eAtual ? "border-orange text-orange" : "border-line-hi",
                              )}
                            >
                              {a.concluida ? (
                                <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />
                              ) : eAtual ? (
                                <Play className="ml-px size-2.5 fill-current" aria-hidden="true" />
                              ) : null}
                            </span>
                            <span className="w-6 font-mono text-[12.5px] text-dim">{numeroAula(a.numero)}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block">{a.titulo}</span>
                              {eAtual && <span className="block text-xs text-orange-hi">Você está aqui</span>}
                              <span className="sr-only">{a.concluida ? ", concluída" : ""}</span>
                            </span>
                            <span className="font-mono text-xs whitespace-nowrap text-dim">{duracao(a.duracao_seg)}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
