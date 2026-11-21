import { useCallback } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, CircleCheck, ClipboardCheck, ListChecks, Lock } from "lucide-react";
import { useCurso, useSituacao } from "@/lib/consultas";
import { caminhoAvaliacao, caminhoQuestoes, moduloPendente, mostraConclusao } from "@/lib/avaliacao";
import { usePortal } from "@/lib/portal";
import { caminhoAula, localizarAula, numeroAula, proximoModuloEmProducao, registrarProgresso, resumoDoCurso, rotuloModulo, rotuloModuloCurto } from "@/lib/aula";
import type { CursoDetalhe } from "@/lib/cursos";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Barra } from "@/components/ui/Barra";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { Player } from "@/components/aula/Player";
import { ListaAulas } from "@/components/aula/ListaAulas";
import { FalhaCarregamento, NaoEncontrado } from "./Estados";

const botaoNav =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border border-line-hi px-4 text-[15px] font-semibold text-ink transition-colors duration-150 hover:border-muted";

export default function Aula() {
  const { slug = "", numero = "" } = useParams();
  const n = Number(numero);
  const { sb, sessao } = usePortal();
  const qc = useQueryClient();
  const reduzir = useReducedMotion();
  const avisar = useAvisos();
  const curso = useCurso(slug);
  // Complementar: se falhar, a sala de aula segue como antes.
  const situacao = useSituacao(slug, Boolean(curso.data?.matriculado));
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
      <section aria-label="Curso fora da sua conta" className="painel-card mx-auto max-w-xl p-8 text-center">
        <h1 className="m-0 mb-2 font-display text-2xl font-semibold">Este curso ainda não está na sua conta</h1>
        <p className="m-0 mb-6 text-muted">Os cursos gratuitos entram na sua conta automaticamente quando você acessa o portal.</p>
        <Link to="/cursos" className={botaoNav}>
          Ver meus cursos
        </Link>
      </section>
    );
  }

  const { aula, modulo, anterior, proxima, indice, total } = pos;
  const resumo = resumoDoCurso(c);
  const marcando = progresso.isPending && progresso.variables?.concluida === true;

  // Questões do módulo no caminho: a próxima aula de outro módulo só abre depois delas.
  const sit = situacao.data;
  const msAtual = sit?.modulos.find((m) => m.id === modulo.id);
  const bloqueada = msAtual ? !msAtual.liberado : false;
  const pendente = sit ? moduloPendente(sit) : null;
  const proximaEmOutroModulo = proxima ? !modulo.aulas.some((a) => a.id === proxima.id) : false;
  const questoesAntes = msAtual && msAtual.tem_questoes && !msAtual.aprovado && !bloqueada && (!proxima || proximaEmOutroModulo) ? msAtual : null;
  const fimDoCurso = !proxima && !questoesAntes && mostraConclusao(sit);
  const emBreve = proxima || questoesAntes || fimDoCurso ? null : proximoModuloEmProducao(c, modulo.id);

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
      <nav aria-label="Você está em" className="mb-6 flex flex-wrap items-center gap-2.5 text-sm text-muted">
        <Link to="/cursos" className="hover:text-ink">Meus cursos</Link>
        <span aria-hidden="true" className="text-[#4a4a4a]">/</span>
        <Link to={`/cursos/${c.slug}`} className="hover:text-ink">{c.titulo}</Link>
        <span aria-hidden="true" className="text-[#4a4a4a]">/</span>
        <span aria-current="page" className="text-ink">Aula {numeroAula(indice)}</span>
      </nav>

      <div className="flex flex-wrap items-start gap-8">
        <div className="min-w-0 flex-[999_1_560px]">
          <motion.div
            key={aula.id}
            initial={reduzir ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex flex-col gap-7"
          >
            <Player key={aula.id} aula={aula} salvar={salvar} />

            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <header className="flex min-w-0 flex-col gap-2.5">
                <p className="m-0 text-sm text-muted">
                  {rotuloModuloCurto(modulo.ordem, modulo.titulo)}, aula {indice} de {total}
                </p>
                <h1 className="m-0 font-display text-[clamp(28px,2.8vw,38px)] leading-tight font-semibold tracking-tight">{aula.titulo}</h1>
              </header>
              {(anterior || proxima || questoesAntes || fimDoCurso) && (
                <div className="flex flex-none gap-2.5">
                  {anterior && (
                    <Link to={caminhoAula(c.slug, anterior.numero)} className={botaoNav}>
                      <ArrowLeft className="size-4" aria-hidden="true" /> Aula anterior
                    </Link>
                  )}
                  {questoesAntes ? (
                    <Link to={caminhoQuestoes(c.slug, questoesAntes.ordem)} className={botaoNav}>
                      <ListChecks className="size-4" aria-hidden="true" /> Questões do módulo
                    </Link>
                  ) : proxima ? (
                    <Link to={caminhoAula(c.slug, proxima.numero)} className={botaoNav}>
                      Próxima aula <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  ) : fimDoCurso ? (
                    <Link to={caminhoAvaliacao(c.slug)} className={botaoNav}>
                      <ClipboardCheck className="size-4" aria-hidden="true" /> Avaliação final
                    </Link>
                  ) : null}
                </div>
              )}
            </div>

            <div aria-live="polite">
              {bloqueada ? (
                <Link to={pendente ? caminhoQuestoes(c.slug, pendente.ordem) : `/cursos/${c.slug}`} className={botaoNav}>
                  <Lock className="size-4" aria-hidden="true" />
                  {pendente ? `Ir para as questões do ${rotuloModuloCurto(pendente.ordem, pendente.titulo)}` : "Voltar ao curso"}
                </Link>
              ) : aula.concluida ? (
                <p className="m-0 inline-flex items-center gap-2 text-[15px] font-medium text-ok">
                  <CircleCheck className="size-[18px]" aria-hidden="true" /> Aula concluída
                </p>
              ) : (
                <Botao variante="fantasma" onClick={concluir} disabled={marcando} className="h-11 px-4 text-[15px]">
                  <Check className="size-[18px]" aria-hidden="true" /> {marcando ? "Marcando..." : "Marcar como concluída"}
                </Botao>
              )}
            </div>

            {emBreve && (
              <p className="m-0 rounded-[10px] border border-line px-[18px] py-4 text-[15px] text-[#d4d4d4]">
                A próxima aula sai no {rotuloModulo(emBreve.ordem, emBreve.titulo)}. Ela aparece no seu painel assim que for publicada.
              </p>
            )}

            {aula.resumo && (
              <section aria-labelledby="h-sobre" className="max-w-[68ch] border-t border-line pt-7">
                <h2 id="h-sobre" className="m-0 mb-2.5 font-display text-xl font-semibold">Sobre a aula</h2>
                <p className="m-0 leading-relaxed text-[#d4d4d4]">{aula.resumo}</p>
              </section>
            )}
          </motion.div>
        </div>

        <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-4 lg:sticky lg:top-24" aria-label="Seu caminho no curso">
          <div className="flex flex-col gap-3 pt-1 pb-2">
            <h2 className="m-0 font-display text-xl font-semibold">{c.titulo}</h2>
            <p className="m-0 text-sm text-muted">{resumo.texto}</p>
            {resumo.emProducao === 0 && resumo.total > 0 && (
              <Barra valor={resumo.percentual} rotulo={`Progresso em ${c.titulo}`} cor={resumo.feitas === resumo.total ? "verde" : "laranja"} />
            )}
          </div>
          <ListaAulas curso={c} atual={aula.id} moduloAtual={modulo.id} situacao={sit} />
          {proxima && !questoesAntes && (
            <Link
              to={caminhoAula(c.slug, proxima.numero)}
              className="flex items-center gap-3 rounded-[14px] border border-line px-4 py-3.5 text-sm transition-colors duration-150 hover:border-line-hi"
            >
              <span className="min-w-0 flex-1">
                <span className="font-semibold">Próxima aula:</span> {proxima.titulo}
              </span>
              <ArrowRight className="size-4 flex-none text-muted" aria-hidden="true" />
            </Link>
          )}
          <p className="sr-only">
            Aula {indice} de {total} {modulo.ordem === 0 ? "da" : "do"} {rotuloModulo(modulo.ordem, modulo.titulo)}.
          </p>
        </aside>
      </div>
    </>
  );
}
