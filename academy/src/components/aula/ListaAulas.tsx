import { useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Lock } from "lucide-react";
import { caminhoAula, numeroAula, rotuloModulo } from "@/lib/aula";
import { duracao } from "@/lib/formato";
import { cn } from "@/lib/cn";
import type { CursoDetalhe } from "@/lib/cursos";
import { moduloPendente, type Situacao } from "@/lib/avaliacao";
import { AvisoBloqueio, LinhaQuestoes } from "@/components/avaliacao/Marcos";

/** Módulos e aulas do curso, com a aula atual destacada. */
export function ListaAulas({
  curso,
  atual,
  moduloAtual,
  situacao,
}: {
  curso: CursoDetalhe;
  atual: string;
  moduloAtual: string;
  situacao?: Situacao;
}) {
  const pendente = situacao ? moduloPendente(situacao) : null;
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const aberto = (id: string) => abertos[id] ?? id === moduloAtual;

  return (
    <nav aria-label={`Aulas de ${curso.titulo}`}>
      <ol className="m-0 list-none overflow-hidden rounded-[14px] border border-line p-0">
        {curso.modulos.map((m, i) => {
          const borda = i > 0 && "border-t border-line";
          if (m.aulas.length === 0) {
            return (
              <li key={m.id} className={cn("flex items-center justify-between gap-3 px-4 py-3.5 text-[15px] font-medium", borda)}>
                <h3 className="m-0 text-[15px] font-medium text-muted">{rotuloModulo(m.ordem, m.titulo)}</h3>
                <span className="text-[13px] whitespace-nowrap text-dim">Em breve</span>
              </li>
            );
          }
          const estaAberto = aberto(m.id);
          const feitas = m.aulas.filter((a) => a.concluida).length;
          const completo = feitas === m.aulas.length;
          const ms = situacao?.modulos.find((x) => x.id === m.id);
          const bloqueado = ms ? !ms.liberado : false;
          return (
            <li key={m.id} className={cn(borda)}>
              <h3 className="m-0">
                <button
                  type="button"
                  aria-expanded={estaAberto}
                  onClick={() => setAbertos((s) => ({ ...s, [m.id]: !estaAberto }))}
                  className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left text-[15px] font-semibold hover:bg-white/[0.02]"
                >
                  <ChevronDown className={cn("size-4 flex-none text-muted transition-transform duration-200", estaAberto && "rotate-180")} aria-hidden="true" />
                  <span className="flex-1">
                    {rotuloModulo(m.ordem, m.titulo)}
                    {bloqueado && <span className="sr-only">, bloqueado</span>}
                  </span>
                  {bloqueado && <Lock className="size-3.5 flex-none text-dim" aria-hidden="true" />}
                  <span className={cn("text-[13px] font-medium", completo ? "text-ok" : "text-muted")}>
                    {feitas} de {m.aulas.length}
                  </span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {estaAberto && (
                  <motion.ul
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } }}
                    exit={{ opacity: 0, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } }}
                    className="m-0 list-none p-0 pb-2"
                  >
                    {bloqueado && <AvisoBloqueio pendente={pendente} />}
                    {m.aulas.map((a) => {
                      const eAtual = a.id === atual;
                      return (
                        <li key={a.id}>
                          <Link
                            to={caminhoAula(curso.slug, a.numero)}
                            aria-current={eAtual ? "page" : undefined}
                            className={cn(
                              "mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150",
                              eAtual ? "bg-[#1a0f06] shadow-[inset_2px_0_0_var(--color-orange)]" : "hover:bg-white/[0.04]",
                            )}
                          >
                            <span className={cn("grid size-[20px] flex-none place-items-center rounded-full border-[1.5px]", a.concluida ? "border-ok text-ok" : "border-line-hi")}>
                              {a.concluida && <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />}
                            </span>
                            <span className="w-6 text-[13px] text-dim">{numeroAula(a.numero)}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block">{a.titulo}</span>
                              {eAtual && <span className="block text-xs text-orange-hi">Você está aqui</span>}
                              <span className="sr-only">{a.concluida ? ", concluída" : ""}</span>
                            </span>
                            <span className="text-[13px] whitespace-nowrap text-muted">{duracao(a.duracao_seg)}</span>
                          </Link>
                        </li>
                      );
                    })}
                    {ms && <LinhaQuestoes slug={curso.slug} modulo={ms} compacta />}
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
