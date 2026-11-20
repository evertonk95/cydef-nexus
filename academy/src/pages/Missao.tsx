import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Award, Lock, RotateCcw, Search, Send, Timer } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePortal } from "@/lib/portal";
import { chamar, ErroPainel } from "@/lib/instrutor";
import {
  apagarRascunho,
  cronometro,
  gravarRascunho,
  lerRascunho,
  motivoBloqueio,
  respondidas,
  useMissao,
  type Missao as TMissao,
  type Respostas,
  type Tentativa,
} from "@/lib/missoes";
import { cn } from "@/lib/cn";
import { Botao } from "@/components/ui/Botao";
import { Barra } from "@/components/ui/Barra";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { ErroFormulario } from "@/components/instrutor/Campos";
import { CabecalhoMissao } from "@/components/missao/Cabecalho";
import { Evidencias } from "@/components/missao/Evidencias";
import { Pergunta } from "@/components/missao/Pergunta";
import { FalhaCarregamento, NaoEncontrado } from "./Estados";

/**
 * Missão de SOC (fase 15). Quatro estados: bloqueada, pronta para começar,
 * investigação em andamento (o tempo corre no servidor) e resultado.
 */
export default function Missao() {
  const { slug = "" } = useParams();
  const missao = useMissao(slug);
  if (missao.isError) {
    if (missao.error instanceof ErroPainel && missao.error.codigo === "missao_inexistente") return <NaoEncontrado />;
    return <FalhaCarregamento tentar={() => void missao.refetch()} />;
  }
  if (!missao.data)
    return (
      <div aria-busy="true" aria-label="Carregando a missão" className="flex flex-col gap-6">
        <Esqueleto className="h-40 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Esqueleto className="h-96 w-full rounded-2xl" />
          <Esqueleto className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  const m = missao.data;
  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Caminho" className="text-sm text-muted">
        <Link to="/missoes" className="hover:text-ink">
          Missões
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink" aria-current="page">
          {m.codigo}
        </span>
      </nav>
      {m.situacao !== "liberada" ? <Bloqueada m={m} /> : m.aberta ? <Investigacao key={m.aberta.iniciada_em} m={m} inicio={m.aberta.iniciada_em} /> : m.ultima ? <Resultado m={m} t={m.ultima} /> : <Pronta m={m} />}
    </div>
  );
}

function useIniciar(slug: string) {
  const { sb } = usePortal();
  const qc = useQueryClient();
  const [erro, setErro] = useState<Error | null>(null);
  const [iniciando, setIniciando] = useState(false);
  const iniciar = async () => {
    setErro(null);
    setIniciando(true);
    try {
      await chamar(sb, "academy_iniciar_missao", { p_slug: slug });
      await qc.invalidateQueries({ queryKey: ["missao", slug] });
    } catch (e) {
      setErro(e as Error);
    } finally {
      setIniciando(false);
    }
  };
  return { iniciar, erro, iniciando };
}

function Bloqueada({ m }: { m: TMissao }) {
  const pct = m.aulas_total > 0 ? (m.aulas_concluidas / m.aulas_total) * 100 : 0;
  return (
    <>
      <CabecalhoMissao severidade={m.severidade} codigo={m.codigo} mitre={m.mitre} titulo={m.titulo} briefing={m.briefing} />
      <section aria-labelledby="h-bloqueada" className="painel-card flex max-w-2xl flex-col gap-4 p-6">
        <h2 id="h-bloqueada" className="m-0 flex items-center gap-2.5 font-display text-xl font-semibold">
          <Lock className="size-5 text-muted" aria-hidden="true" /> Missão ainda bloqueada
        </h2>
        <p className="m-0 text-muted">{motivoBloqueio(m)}</p>
        {m.situacao === "aulas_pendentes" && <Barra valor={pct} rotulo={`Aulas concluídas de ${m.curso_titulo}`} />}
        <p className="m-0">
          <Link to={`/cursos/${m.curso}`} className="font-medium text-orange-hi underline-offset-4 hover:underline">
            Ir para o curso
          </Link>
        </p>
      </section>
    </>
  );
}

function Pronta({ m }: { m: TMissao }) {
  const { iniciar, erro, iniciando } = useIniciar(m.slug);
  return (
    <>
      <CabecalhoMissao severidade={m.severidade} codigo={m.codigo} mitre={m.mitre} titulo={m.titulo} briefing={m.briefing} />
      <section aria-labelledby="h-pronta" className="painel-card flex max-w-3xl flex-col gap-4 p-6 sm:p-8">
        <h2 id="h-pronta" className="m-0 font-display text-xl font-semibold">
          Antes de começar
        </h2>
        <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 leading-relaxed text-muted">
          <li>Você vai examinar {m.evidencias.length === 1 ? "uma evidência" : `${m.evidencias.length} evidências`} e responder {m.perguntas.length} perguntas.</li>
          <li>Fixe as linhas que provam o caso: elas vão junto com a investigação.</li>
          <li>O tempo começa a contar quando você inicia. Não há limite, mas ele aparece no resultado.</li>
          <li>Com 80% de acerto a missão conta como concluída{m.selo ? ` e você ganha o selo ${m.selo}` : ""}. Dá para refazer.</li>
        </ul>
        <ErroFormulario erro={erro} />
        <div>
          <Botao className="h-12 px-6" onClick={() => void iniciar()} disabled={iniciando}>
            <Search className="size-4" aria-hidden="true" /> {iniciando ? "Abrindo…" : "Iniciar investigação"}
          </Botao>
        </div>
      </section>
    </>
  );
}

function useRelogio(inicio: string, parado: boolean) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    if (parado) return;
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [parado]);
  return Math.max(0, (agora - new Date(inicio).getTime()) / 1000);
}

function Investigacao({ m, inicio }: { m: TMissao; inicio: string }) {
  const { sb } = usePortal();
  const qc = useQueryClient();
  const inicial = useMemo(() => lerRascunho(m.slug, inicio), [m.slug, inicio]);
  const [respostas, setRespostas] = useState<Respostas>(inicial.respostas);
  const [fixadas, setFixadas] = useState<string[]>(inicial.fixadas);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<Error | null>(null);
  const segundos = useRelogio(inicio, enviando);
  const feitas = respondidas(m.perguntas, respostas);
  const total = m.perguntas.length;

  useEffect(() => gravarRascunho(m.slug, inicio, { respostas, fixadas }), [m.slug, inicio, respostas, fixadas]);

  const alternarFixada = (chave: string) => setFixadas((f) => (f.includes(chave) ? f.filter((x) => x !== chave) : [...f, chave].slice(0, 30)));
  const escolher = (id: string, multipla: boolean, j: number) =>
    setRespostas((r) => {
      const atual = r[id] ?? [];
      const nova = multipla ? (atual.includes(j) ? atual.filter((x) => x !== j) : [...atual, j].sort((a, b) => a - b)) : [j];
      const copia = { ...r, [id]: nova };
      if (nova.length === 0) delete copia[id];
      return copia;
    });
  const enviar = async () => {
    setErro(null);
    setEnviando(true);
    try {
      await chamar<Tentativa>(sb, "academy_enviar_missao", { p_slug: m.slug, p_respostas: respostas, p_evidencias: fixadas });
      apagarRascunho(m.slug, inicio);
      await qc.invalidateQueries({ queryKey: ["missao", m.slug] });
      void qc.invalidateQueries({ queryKey: ["missoes"] });
      void qc.invalidateQueries({ queryKey: ["painel"] });
      window.scrollTo({ top: 0 });
    } catch (e) {
      setErro(e as Error);
      setEnviando(false);
    }
  };

  return (
    <>
      <CabecalhoMissao
        severidade={m.severidade}
        codigo={m.codigo}
        mitre={m.mitre}
        titulo={m.titulo}
        briefing={m.briefing}
        lado={
          <dl className="m-0 flex gap-8">
            <div>
              <dt className="flex items-center gap-1.5 text-[13px] text-muted">
                <Timer className="size-3.5" aria-hidden="true" /> Tempo na missão
              </dt>
              <dd className="m-0 mt-1 font-mono text-2xl" aria-live="off">
                {cronometro(segundos)}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-muted">Respondidas</dt>
              <dd className="m-0 mt-1 font-mono text-2xl">
                {feitas}/{total}
              </dd>
            </div>
          </dl>
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-24">
          <Evidencias evidencias={m.evidencias} fixadas={fixadas} alternar={alternarFixada} />
        </div>
        <section aria-labelledby="h-investigacao" className="flex min-w-0 flex-col gap-4">
          <h2 id="h-investigacao" className="m-0 font-display text-xl font-semibold">
            Investigação
          </h2>
          {m.perguntas.map((p, i) => (
            <Pergunta key={p.id} pergunta={p} indice={i + 1} escolhidas={respostas[p.id] ?? []} escolher={(j) => escolher(p.id, p.multipla, j)} />
          ))}
          <div className="painel-card flex flex-wrap items-center gap-4 p-5">
            <p className="m-0 min-w-0 flex-1 text-sm text-muted" aria-live="polite">
              {feitas < total
                ? `Responda as ${total} perguntas para enviar. Faltam ${total - feitas}.`
                : fixadas.length > 0
                  ? `Tudo pronto. ${fixadas.length === 1 ? "A evidência fixada vai" : `As ${fixadas.length} evidências fixadas vão`} junto com a investigação.`
                  : "Tudo pronto. Você pode fixar evidências antes de enviar."}
            </p>
            <Botao className="h-12 px-6" onClick={() => void enviar()} disabled={feitas < total || enviando}>
              <Send className="size-4" aria-hidden="true" /> {enviando ? "Corrigindo…" : "Enviar investigação"}
            </Botao>
            <div className="basis-full">
              <ErroFormulario erro={erro} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function Anel({ nota, aprovado }: { nota: number; aprovado: boolean }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-32 flex-none">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-line)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={aprovado ? "var(--color-ok)" : "var(--color-orange)"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - nota / 100)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-3xl font-semibold">{nota}%</span>
    </div>
  );
}

function Resultado({ m, t }: { m: TMissao; t: Tentativa }) {
  const { iniciar, erro, iniciando } = useIniciar(m.slug);
  return (
    <>
      <CabecalhoMissao severidade={m.severidade} codigo={m.codigo} mitre={m.mitre} titulo={m.titulo} briefing={m.briefing} />
      <section aria-labelledby="h-resultado" className="painel-card flex flex-col gap-8 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-8">
          <Anel nota={t.nota} aprovado={t.aprovado} />
          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-2">
            <h2 id="h-resultado" className="m-0 font-display text-2xl font-semibold">
              {t.aprovado ? "Missão concluída" : "Missão registrada, vale revisar"}
            </h2>
            <p className="m-0 leading-relaxed text-muted">
              Você acertou {t.acertos} de {t.total} perguntas em {cronometro(t.duracao_seg)} e fixou{" "}
              {t.evidencias.length === 1 ? "1 evidência" : `${t.evidencias.length} evidências`}.
              {t.aprovado ? "" : " Com 80% a missão conta como concluída."}
              {m.melhor_nota != null && m.melhor_nota > t.nota ? ` Sua melhor nota nesta missão é ${m.melhor_nota}%.` : ""}
            </p>
            {m.aprovada && m.selo && (
              <p className="m-0 mt-1 inline-flex items-center gap-2 self-start rounded-full border border-ok/40 px-3 py-1 text-sm text-ok">
                <Award className="size-4" aria-hidden="true" /> Selo conquistado: {m.selo}
              </p>
            )}
          </div>
          <Botao variante="contorno" className="h-11 px-5" onClick={() => void iniciar()} disabled={iniciando}>
            <RotateCcw className="size-4" aria-hidden="true" /> Refazer missão
          </Botao>
        </div>
        <ErroFormulario erro={erro} />

        {t.competencias.length > 0 && (
          <div>
            <h3 className="m-0 mb-3 text-sm font-semibold">Suas competências</h3>
            <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-3">
              {t.competencias.map((c) => (
                <li key={c.slug} className="flex flex-col gap-1.5 text-[14.5px]">
                  <span className="flex justify-between gap-3">
                    <span>{c.titulo}</span>
                    <span className={cn("tabular-nums", c.depois > c.antes ? "text-ok" : "text-muted")}>
                      {c.antes}% <span aria-hidden="true">→</span>
                      <span className="sr-only"> para </span> {c.depois}%
                    </span>
                  </span>
                  <Barra valor={c.depois} rotulo={`Competência ${c.titulo}`} cor={c.depois > c.antes ? "verde" : "laranja"} />
                </li>
              ))}
            </ul>
          </div>
        )}
        {t.encerramento && <p className="m-0 max-w-[75ch] border-l-2 border-line-hi pl-4 leading-relaxed text-[#d6d6d6]">{t.encerramento}</p>}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Evidencias evidencias={m.evidencias} fixadas={t.evidencias} alternar={() => undefined} somenteLeitura />
        <section aria-labelledby="h-correcao" className="flex min-w-0 flex-col gap-4">
          <h2 id="h-correcao" className="m-0 font-display text-xl font-semibold">
            Correção
          </h2>
          {t.correcao.map((c, i) => (
            <Pergunta key={c.id} pergunta={c} indice={i + 1} escolhidas={c.escolhidas} correcao={c} />
          ))}
        </section>
      </div>
    </>
  );
}
