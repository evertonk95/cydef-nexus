import { useState } from "react";
import { Link, useParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Clock, Layers, Play, PlayCircle } from "lucide-react";
import { useCurso } from "@/lib/consultas";
import { NIVEL } from "@/lib/cursos";
import { aulaParaContinuar, caminhoAula, rotuloModulo } from "@/lib/aula";
import { duracao, percentual } from "@/lib/formato";
import { Cartao } from "@/components/ui/Cartao";
import { Barra } from "@/components/ui/Barra";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { cn } from "@/lib/cn";
import { FalhaCarregamento, NaoEncontrado } from "./Estados";

export default function Curso() {
  const { slug = "" } = useParams();
  const curso = useCurso(slug);
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  if (curso.isError) return <FalhaCarregamento tentar={() => void curso.refetch()} />;
  if (curso.isSuccess && !curso.data) return <NaoEncontrado />;
  const c = curso.data;
  if (!c) {
    return (
      <div aria-busy="true" aria-label="Carregando o curso" className="flex flex-col gap-5">
        <Esqueleto className="h-10 w-2/3" />
        <Esqueleto className="h-5 w-1/2" />
        <Esqueleto className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  const aulas = c.modulos.flatMap((m) => m.aulas);
  const feitas = aulas.filter((a) => a.concluida).length;
  const total = aulas.reduce((s, a) => s + a.duracao_seg, 0);
  const seguir = aulaParaContinuar(c);
  const primeiroAberto = c.modulos.find((m) => m.aulas.some((a) => !a.concluida))?.id ?? c.modulos[0]?.id;
  const estaAberto = (id: string) => abertos[id] ?? id === primeiroAberto;

  return (
    <>
      <nav aria-label="Você está em" className="mb-5 flex items-center gap-2.5 text-sm text-muted">
        <Link to="/cursos" className="hover:text-ink">Meus cursos</Link>
        <span aria-hidden="true" className="text-[#4a4a50]">/</span>
        <span aria-current="page" className="text-ink">{c.titulo}</span>
      </nav>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <header className="mb-6">
            <p className="rotulo-mono m-0 mb-2">
              {NIVEL[c.nivel]} · {c.gratuito ? "Gratuito" : "Curso pago"}
            </p>
            <h1 className="m-0 mb-3 font-display text-[clamp(28px,3vw,40px)] font-bold tracking-tight">{c.titulo}</h1>
            <p className="m-0 max-w-[72ch] leading-relaxed text-[#d6d6d6]">{c.descricao}</p>
          </header>
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {c.modulos.map((m) => {
              const aberto = estaAberto(m.id);
              const ok = m.aulas.filter((a) => a.concluida).length;
              return (
                <li key={m.id} className="overflow-hidden rounded-xl border border-line bg-[rgba(9,9,10,0.7)]">
                  <h2 className="m-0">
                    <button
                      type="button"
                      aria-expanded={aberto}
                      onClick={() => setAbertos((s) => ({ ...s, [m.id]: !aberto }))}
                      className={cn("flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] font-semibold transition-colors duration-150", aberto && "bg-orange/6 text-orange-hi")}
                    >
                      <ChevronDown className={cn("size-4 flex-none text-muted transition-transform duration-200", aberto && "rotate-180 text-orange")} aria-hidden="true" />
                      {rotuloModulo(m.ordem, m.titulo)}
                      <span className={cn("ml-auto font-mono text-[12.5px]", ok === m.aulas.length && m.aulas.length > 0 ? "text-ok" : "text-muted")}>
                        {ok}/{m.aulas.length}
                      </span>
                    </button>
                  </h2>
                  <AnimatePresence initial={false}>
                    {aberto && (
                      <motion.ul
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } }}
                        exit={{ opacity: 0, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } }}
                        className="m-0 list-none p-0"
                      >
                        {m.aulas.map((a) => (
                          <li key={a.id} className="border-t border-[#1a1a1d]">
                            <Link to={caminhoAula(c.slug, a.numero)} className="flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 hover:bg-white/[0.03]">
                            <span className={cn("grid size-[22px] flex-none place-items-center rounded-full border-[1.5px]", a.concluida ? "border-ok bg-ok text-[#052e13]" : "border-line-hi")}>
                              {a.concluida && <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />}
                            </span>
                            <span className="w-6 font-mono text-[12.5px] text-dim">{String(a.numero).padStart(2, "0")}</span>
                            <span className="flex-1">
                              {a.titulo}
                              <span className="sr-only">{a.concluida ? ", concluída" : ""}</span>
                            </span>
                            <span className="font-mono text-xs whitespace-nowrap text-dim">{duracao(a.duracao_seg)}</span>
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <Cartao interativo={false}>
            <div className="mb-4 flex items-center gap-3.5">
              <span className="grid size-11 place-items-center rounded-xl border border-orange/25 bg-orange/10 text-orange">
                <Layers className="size-[22px]" aria-hidden="true" />
              </span>
              <div>
                <p className="m-0 font-display text-lg font-semibold">Seu progresso</p>
                <p className="m-0 font-mono text-[12.5px] text-muted">
                  {feitas} de {aulas.length} aulas · {percentual(feitas, aulas.length)}%
                </p>
              </div>
            </div>
            <Barra valor={percentual(feitas, aulas.length)} rotulo={`Progresso em ${c.titulo}`} />
            {c.matriculado && seguir && (
              <Link
                to={caminhoAula(c.slug, seguir.numero)}
                className="group/cta relative mt-5 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-[linear-gradient(180deg,var(--color-orange-hi),var(--color-orange)_55%,#ea580c)] p-3.5 text-base font-bold text-orange-ink transition-transform duration-200 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play className="size-[18px] fill-current" aria-hidden="true" />
                {feitas === 0 ? "Começar o curso" : feitas === aulas.length ? "Rever o curso" : "Continuar o curso"}
              </Link>
            )}
            <ul className="m-0 mt-5 flex list-none flex-col gap-2.5 p-0 text-sm text-muted">
              <li className="flex items-center gap-2.5"><Clock className="size-4 text-orange" aria-hidden="true" /> {duracao(total)} de vídeo</li>
              <li className="flex items-center gap-2.5"><PlayCircle className="size-4 text-orange" aria-hidden="true" /> {aulas.length} aulas em {c.modulos.length} módulos</li>
            </ul>
          </Cartao>
        </aside>
      </div>
    </>
  );
}
