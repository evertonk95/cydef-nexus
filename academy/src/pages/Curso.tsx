import { useState } from "react";
import { Link, useParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Clock, Lock, Play, PlayCircle } from "lucide-react";
import { useCurso, useSituacao } from "@/lib/consultas";
import { moduloPendente } from "@/lib/avaliacao";
import { AvisoBloqueio, CartaoConclusao, LinhaQuestoes } from "@/components/avaliacao/Marcos";
import { NIVEL } from "@/lib/cursos";
import { aulaParaContinuar, caminhoAula, numeroAula, resumoDoCurso, rotuloModulo } from "@/lib/aula";
import { contagem, duracao } from "@/lib/formato";
import { Barra } from "@/components/ui/Barra";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { cn } from "@/lib/cn";
import { SobreCurso } from "@/components/curso/SobreCurso";
import { MaterialComplementar } from "@/components/curso/MaterialComplementar";
import { FalhaCarregamento, NaoEncontrado } from "./Estados";

export default function Curso() {
  const { slug = "" } = useParams();
  const curso = useCurso(slug);
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  // Complementar: se falhar, a página do curso segue como antes.
  const situacao = useSituacao(slug, Boolean(curso.data?.matriculado));
  const sit = situacao.data;

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
  const resumo = resumoDoCurso(c);
  const total = aulas.reduce((s, a) => s + a.duracao_seg, 0);
  const seguir = aulaParaContinuar(c);
  const primeiroAberto = c.modulos.find((m) => m.aulas.some((a) => !a.concluida))?.id ?? c.modulos.find((m) => m.aulas.length > 0)?.id;
  const estaAberto = (id: string) => abertos[id] ?? id === primeiroAberto;
  const pendente = sit ? moduloPendente(sit) : null;

  return (
    <>
      <nav aria-label="Você está em" className="mb-6 flex items-center gap-2.5 text-sm text-muted">
        <Link to="/cursos" className="hover:text-ink">Meus cursos</Link>
        <span aria-hidden="true" className="text-[#4a4a4a]">/</span>
        <span aria-current="page" className="text-ink">{c.titulo}</span>
      </nav>
      <div className="flex flex-wrap items-start gap-8">
        <div className="min-w-0 flex-[999_1_560px]">
          <header className="mb-7">
            <p className="rotulo m-0 mb-2">
              {NIVEL[c.nivel]}, {c.gratuito ? "gratuito" : "pago"}
            </p>
            <h1 className="m-0 mb-3 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">{c.titulo}</h1>
            <p className="m-0 max-w-[68ch] leading-relaxed text-[#d4d4d4]">{c.descricao}</p>
          </header>
          <ol className="m-0 list-none overflow-hidden rounded-[14px] border border-line p-0">
            {c.modulos.map((m, i) => {
              const borda = i > 0 && "border-t border-line";
              if (m.aulas.length === 0) {
                return (
                  <li key={m.id} className={cn("px-4 py-3.5", borda)}>
                    <div className="flex items-center gap-3 text-[15px] font-medium">
                      <h2 className="m-0 flex-1 text-[15px] font-medium text-muted">{rotuloModulo(m.ordem, m.titulo)}</h2>
                      <span className="text-[13px] whitespace-nowrap text-dim">Em breve</span>
                    </div>
                    {m.resumo && <p className="m-0 mt-1.5 max-w-[68ch] text-sm leading-relaxed text-dim">{m.resumo}</p>}
                  </li>
                );
              }
              const aberto = estaAberto(m.id);
              const ok = m.aulas.filter((a) => a.concluida).length;
              const completo = ok === m.aulas.length;
              const ms = sit?.modulos.find((x) => x.id === m.id);
              const bloqueado = ms ? !ms.liberado : false;
              return (
                <li key={m.id} className={cn(borda)}>
                  <h2 className="m-0">
                    <button
                      type="button"
                      aria-expanded={aberto}
                      onClick={() => setAbertos((s) => ({ ...s, [m.id]: !aberto }))}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] font-semibold hover:bg-white/[0.02]"
                    >
                      <ChevronDown className={cn("size-4 flex-none text-muted transition-transform duration-200", aberto && "rotate-180")} aria-hidden="true" />
                      <span className="flex-1">
                        {rotuloModulo(m.ordem, m.titulo)}
                        {bloqueado && <span className="sr-only">, bloqueado</span>}
                      </span>
                      {bloqueado && <Lock className="size-3.5 flex-none text-dim" aria-hidden="true" />}
                      <span className={cn("text-[13px] font-medium", completo ? "text-ok" : "text-muted")}>
                        {ok} de {m.aulas.length}
                      </span>
                    </button>
                  </h2>
                  <AnimatePresence initial={false}>
                    {aberto && (
                      <motion.ul
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } }}
                        exit={{ opacity: 0, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } }}
                        className="m-0 list-none p-0 pb-2"
                      >
                        {m.resumo && <li className="mx-2 px-3 pb-2 text-sm leading-relaxed text-muted">{m.resumo}</li>}
                        {bloqueado && <AvisoBloqueio pendente={pendente} />}
                        {m.aulas.map((a, i) => (
                          <li key={a.id}>
                            <Link to={caminhoAula(c.slug, a.numero)} className="mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-white/[0.04]">
                              <span className={cn("grid size-[20px] flex-none place-items-center rounded-full border-[1.5px]", a.concluida ? "border-ok text-ok" : "border-line-hi")}>
                                {a.concluida && <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />}
                              </span>
                              <span className="w-6 text-[13px] text-dim">{numeroAula(i + 1)}</span>
                              <span className="flex-1">
                                {a.titulo}
                                <span className="sr-only">{a.concluida ? ", concluída" : ""}</span>
                              </span>
                              <span className="text-[13px] whitespace-nowrap text-muted">{duracao(a.duracao_seg)}</span>
                            </Link>
                          </li>
                        ))}
                        {ms && <LinhaQuestoes slug={c.slug} modulo={ms} />}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>
          <MaterialComplementar curso={c} />
          <SobreCurso curso={c} />
        </div>
        <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-4 lg:sticky lg:top-24">
          <section aria-labelledby="h-progresso" className="painel-card flex flex-col gap-4 p-6">
            <div>
              <h2 id="h-progresso" className="m-0 font-display text-lg font-semibold">Seu progresso</h2>
              <p className="m-0 mt-1 text-sm text-muted">{resumo.texto}</p>
            </div>
            {resumo.emProducao === 0 && resumo.total > 0 && (
              <Barra valor={resumo.percentual} rotulo={`Progresso em ${c.titulo}`} cor={resumo.feitas === resumo.total ? "verde" : "laranja"} />
            )}
            {c.matriculado && seguir && (
              <Link
                to={caminhoAula(c.slug, seguir.numero)}
                className="flex h-12 w-full items-center justify-center gap-2.5 rounded-[10px] bg-orange font-semibold text-orange-ink transition-colors duration-150 hover:bg-orange-hi"
              >
                <Play className="size-4 fill-current" aria-hidden="true" />
                {resumo.feitas === 0 ? "Começar o curso" : resumo.feitas === resumo.total ? "Rever o curso" : "Continuar o curso"}
              </Link>
            )}
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm text-muted">
              <li className="flex items-center gap-2.5"><Clock className="size-4" aria-hidden="true" /> {duracao(total)} de vídeo</li>
              <li className="flex items-center gap-2.5"><PlayCircle className="size-4" aria-hidden="true" /> {contagem(aulas.length, "aula", "aulas")} em {contagem(c.modulos.length, "módulo", "módulos")}</li>
            </ul>
          </section>
          {sit && <CartaoConclusao slug={c.slug} s={sit} />}
        </aside>
      </div>
    </>
  );
}
