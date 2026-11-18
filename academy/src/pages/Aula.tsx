import { useCallback } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CircleCheck, Layers } from "lucide-react";
import { useCurso } from "@/lib/consultas";
import { usePortal } from "@/lib/portal";
import { caminhoAula, localizarAula, numeroAula, registrarProgresso, rotuloModulo, rotuloModuloCurto } from "@/lib/aula";
import { percentual } from "@/lib/formato";
import type { CursoDetalhe } from "@/lib/cursos";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Cartao } from "@/components/ui/Cartao";
import { Barra } from "@/components/ui/Barra";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { Player } from "@/components/aula/Player";
import { ListaAulas } from "@/components/aula/ListaAulas";
import { cn } from "@/lib/cn";
import { FalhaCarregamento, NaoEncontrado } from "./Estados";

const botaoNav =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-semibold transition-[transform,background-color,border-color,box-shadow] duration-200 ease-[var(--ease-out-soft)] hover:-translate-y-0.5";

export default function Aula() {
  const { slug = "", numero = "" } = useParams();
  const n = Number(numero);
  const { sb, sessao } = usePortal();
  const qc = useQueryClient();
  const reduzir = useReducedMotion();
  const avisar = useAvisos();
  const curso = useCurso(slug);
  const chave = ["curso", slug, sessao?.user.id];

  const progresso = useMutation({
    mutationFn: (v: { aulaId: string; posicao: number; concluida: boolean }) => registrarProgresso(sb, v.aulaId, v.posicao, v.concluida),
    onSuccess: (r, v) => {
      qc.setQueryData<CursoDetalhe | null>(chave, (c) =>
        c
          ? {
              ...c,
              modulos: c.modulos.map((m) => ({
                ...m,
                aulas: m.aulas.map((a) => (a.id === v.aulaId ? { ...a, posicao_seg: v.posicao, concluida: a.concluida || r.concluida } : a)),
              })),
            }
          : c,
      );
      void qc.invalidateQueries({ queryKey: ["painel"] });
    },
  });

  const { mutate } = progresso;
  const aulaId = curso.data ? localizarAula(curso.data, n)?.aula.id : undefined;
  const salvar = useCallback(
    (posicao: number, concluida: boolean) => {
      if (aulaId) mutate({ aulaId, posicao, concluida });
    },
    [aulaId, mutate],
  );

  if (curso.isError) return <FalhaCarregamento tentar={() => void curso.refetch()} />;
  if (curso.isSuccess && !curso.data) return <NaoEncontrado />;
  const c = curso.data;
  if (!c) {
    return (
      <div aria-busy="true" aria-label="Carregando a aula" className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-5">
          <Esqueleto className="h-5 w-1/2" />
          <Esqueleto className="aspect-video w-full rounded-2xl" />
          <Esqueleto className="h-9 w-2/3" />
        </div>
        <Esqueleto className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  const pos = Number.isInteger(n) && n > 0 ? localizarAula(c, n) : null;
  if (!pos) return <NaoEncontrado />;

  if (!c.matriculado) {
    return (
      <Cartao interativo={false} rotulo="Curso fora da sua conta" className="mx-auto max-w-xl text-center">
        <h1 className="m-0 mb-2 font-display text-2xl font-semibold">Este curso ainda não está na sua conta</h1>
        <p className="m-0 mb-6 text-muted">Os cursos gratuitos entram na sua conta automaticamente quando você acessa o portal.</p>
        <Link to="/cursos" className={cn(botaoNav, "border border-line-hi hover:border-orange")}>
          Ver meus cursos
        </Link>
      </Cartao>
    );
  }

  const { aula, modulo, anterior, proxima, indice, total } = pos;
  const aulas = c.modulos.flatMap((m) => m.aulas);
  const feitas = aulas.filter((a) => a.concluida).length;
  const pct = percentual(feitas, aulas.length);
  const marcando = progresso.isPending && progresso.variables?.concluida === true;

  const concluir = () => {
    mutate(
      { aulaId: aula.id, posicao: aula.duracao_seg, concluida: true },
      {
        onSuccess: () => avisar({ tipo: "ok", titulo: "Aula concluída", texto: "Seu progresso foi salvo." }),
        onError: () => avisar({ tipo: "info", titulo: "Não deu para marcar a aula", texto: "Verifique a conexão e tente de novo." }),
      },
    );
  };

  return (
    <>
      <nav aria-label="Você está em" className="mb-5 flex flex-wrap items-center gap-2.5 text-sm text-muted">
        <Link to="/cursos" className="hover:text-ink">Meus cursos</Link>
        <span aria-hidden="true" className="text-[#4a4a50]">/</span>
        <Link to={`/cursos/${c.slug}`} className="hover:text-ink">{c.titulo}</Link>
        <span aria-hidden="true" className="text-[#4a4a50]">/</span>
        <span aria-current="page" className="text-ink">Aula {numeroAula(aula.numero)}</span>
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <motion.div
            key={aula.id}
            initial={reduzir ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Player key={aula.id} aula={aula} rotulo={rotuloModuloCurto(modulo.ordem, modulo.titulo)} salvar={salvar} />

            <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <header className="min-w-0">
                <p className="m-0 mb-2 font-mono text-[12px] tracking-[0.14em] text-orange uppercase">
                  {rotuloModuloCurto(modulo.ordem, modulo.titulo)} · Aula {numeroAula(aula.numero)} de {numeroAula(total)}
                </p>
                <h1 className="m-0 font-display text-[clamp(26px,2.8vw,38px)] leading-tight font-bold tracking-tight text-balance">{aula.titulo}</h1>
              </header>
              <div className="flex flex-none gap-2.5">
                {anterior ? (
                  <Link to={caminhoAula(c.slug, anterior.numero)} className={cn(botaoNav, "border border-line-hi bg-transparent hover:border-orange hover:bg-orange/5")}>
                    <ArrowLeft className="size-4" aria-hidden="true" /> Aula anterior
                  </Link>
                ) : null}
                {proxima ? (
                  <Link to={caminhoAula(c.slug, proxima.numero)} className={cn(botaoNav, "border-[1.5px] border-orange bg-orange/5 text-orange-hi hover:bg-orange/15 hover:shadow-[0_0_24px_-4px_rgba(249,115,22,0.6)]")}>
                    Próxima aula <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="mt-5" aria-live="polite">
              {aula.concluida ? (
                <p className="m-0 inline-flex items-center gap-2 rounded-xl border border-ok/30 bg-ok/10 px-4 py-2.5 text-[15px] font-semibold text-ok">
                  <CircleCheck className="size-[18px]" aria-hidden="true" /> Aula concluída
                </p>
              ) : (
                <Botao variante="fantasma" onClick={concluir} disabled={marcando} className="px-4 py-2.5 text-[15px]">
                  <Check className="size-[18px]" aria-hidden="true" /> {marcando ? "Marcando..." : "Marcar como concluída"}
                </Botao>
              )}
            </div>

            {aula.resumo && (
              <section aria-labelledby="h-sobre" className="mt-8 max-w-[75ch] border-t border-line pt-6">
                <h2 id="h-sobre" className="m-0 mb-3 font-display text-lg font-semibold">Sobre a aula</h2>
                <p className="m-0 leading-relaxed text-[#d6d6d6]">{aula.resumo}</p>
              </section>
            )}
          </motion.div>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24" aria-label="Seu caminho no curso">
          <Cartao interativo={false} indice={1}>
            <div className="mb-4 flex items-center gap-3.5">
              <span className="grid size-11 flex-none place-items-center rounded-xl border border-orange/25 bg-orange/10 text-orange">
                <Layers className="size-[22px]" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="m-0 truncate font-display text-lg font-semibold">{c.titulo}</p>
                <p className="m-0 font-mono text-[12.5px] text-muted">
                  {feitas} de {aulas.length} aulas · {pct}%
                </p>
              </div>
            </div>
            <Barra valor={pct} rotulo={`Progresso em ${c.titulo}`} />
          </Cartao>
          <ListaAulas curso={c} atual={aula.id} moduloAtual={modulo.id} />
          {proxima && (
            <Link
              to={caminhoAula(c.slug, proxima.numero)}
              className="group flex items-center gap-3 rounded-2xl border border-line bg-[rgba(9,9,10,0.7)] px-4 py-3.5 text-sm transition-colors duration-150 hover:border-orange/40"
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold text-orange-hi">Próxima aula:</span> {proxima.titulo}
              </span>
              <ArrowRight className="size-4 flex-none text-orange transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          )}
          <p className="sr-only">
            Aula {indice} de {total} do curso, {rotuloModulo(modulo.ordem, modulo.titulo)}.
          </p>
        </aside>
      </div>
    </>
  );
}
