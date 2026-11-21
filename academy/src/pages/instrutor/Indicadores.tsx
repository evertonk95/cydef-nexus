import { RefreshCw } from "lucide-react";
import { useEu } from "@/lib/instrutor";
import { PERFIS_DECLARADOS, pct, useIndicadores, type Indicadores } from "@/lib/admin";
import { AREAS, EXPERIENCIAS } from "@/lib/perfil";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { FalhaCarregamento, NaoEncontrado } from "../Estados";

/** Indicadores da Academy (fase 20). Só admin. */
export default function IndicadoresAdm() {
  const eu = useEu();
  if (eu.papel !== "admin") return <NaoEncontrado />;
  return <Conteudo />;
}

const HORA = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
const DIA = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
const n = (v: number) => v.toLocaleString("pt-BR");

function Conteudo() {
  const ind = useIndicadores();
  if (ind.isError) return <FalhaCarregamento tentar={() => void ind.refetch()} />;
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <h1 className="m-0 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Indicadores</h1>
        <Botao variante="contorno" className="ml-auto h-10 px-3 text-sm" onClick={() => void ind.refetch()} disabled={ind.isFetching}>
          <RefreshCw className={ind.isFetching ? "size-4 animate-spin motion-reduce:animate-none" : "size-4"} aria-hidden="true" /> Atualizar
        </Botao>
      </div>
      <p className="m-0 mb-8 max-w-2xl text-muted">
        Quem chega pela pré-inscrição, quem entra no portal e quem conclui.{" "}
        {ind.data && <span className="text-dim">Números de {HORA.format(new Date(ind.data.gerado_em))}.</span>}
      </p>
      {!ind.data ? (
        <div aria-busy="true" aria-label="Carregando os indicadores" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Esqueleto key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <Painel d={ind.data} />
      )}
    </>
  );
}

function Numero({ rotulo, valor, detalhe }: { rotulo: string; valor: number; detalhe: string }) {
  return (
    <div className="painel-card flex flex-col gap-1 p-5">
      <p className="m-0 text-sm text-muted">{rotulo}</p>
      <p className="m-0 font-display text-[32px] leading-none font-semibold tabular-nums">{n(valor)}</p>
      <p className="m-0 mt-1 text-[13px] text-dim">{detalhe}</p>
    </div>
  );
}

function Painel({ d }: { d: Indicadores }) {
  const etapas = [
    { rotulo: "Fizeram a pré-inscrição", valor: d.funil.pre_inscritos },
    { rotulo: "Entraram no portal", valor: d.funil.entraram },
    { rotulo: "Começaram uma aula", valor: d.funil.comecaram },
    { rotulo: "Concluíram um curso", valor: d.funil.concluiram_curso },
    { rotulo: "Tiraram certificado", valor: d.funil.certificados },
  ];
  const topo = Math.max(1, ...etapas.map((e) => e.valor));
  return (
    <div className="flex flex-col gap-12">
      <section aria-label="Números gerais" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Numero rotulo="Pré-inscrições" valor={d.pre_inscricoes.total} detalhe={`${n(d.pre_inscricoes.ult_7)} nos últimos 7 dias`} />
        <Numero rotulo="Contas no portal" valor={d.contas.total} detalhe={`${n(d.contas.ult_7)} nos últimos 7 dias`} />
        <Numero rotulo="Estudaram nos últimos 7 dias" valor={d.ativos.ult_7} detalhe={`${n(d.ativos.ult_30)} nos últimos 30 dias`} />
        <Numero rotulo="Certificados emitidos" valor={d.certificados.total} detalhe={`${n(d.certificados.ult_30)} nos últimos 30 dias`} />
      </section>

      <section aria-labelledby="h-funil">
        <h2 id="h-funil" className="m-0 mb-1 font-display text-xl font-semibold">Da pré-inscrição ao certificado</h2>
        <p className="m-0 mb-5 text-sm text-muted">Cada etapa mostra quantas pessoas chegaram até ali e quanto isso representa das pré-inscrições.</p>
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {etapas.map((e) => (
            <li key={e.rotulo} className="grid grid-cols-[minmax(0,14rem)_1fr_auto] items-center gap-4 text-sm">
              <span className="text-ink">{e.rotulo}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
                <span className="block h-full rounded-full bg-ink" style={{ width: `${pct(e.valor, topo)}%` }} />
              </span>
              <span className="w-28 text-right tabular-nums">
                {n(e.valor)} <span className="text-dim">({pct(e.valor, d.funil.pre_inscritos)}%)</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <PorDia d={d} />

      <section aria-labelledby="h-cursos">
        <h2 id="h-cursos" className="m-0 mb-1 font-display text-xl font-semibold">Por curso</h2>
        <p className="m-0 mb-5 text-sm text-muted">Só cursos publicados. "Concluíram" conta quem viu todas as aulas publicadas.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[13px] text-muted">
                <th scope="col" className="py-2 pr-4 font-medium">Curso</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Matriculados</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Começaram</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Concluíram</th>
                <th scope="col" className="px-3 py-2 font-medium">Média de conclusão</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Aprovados na final</th>
                <th scope="col" className="py-2 pl-3 text-right font-medium">Certificados</th>
              </tr>
            </thead>
            <tbody>
              {d.cursos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-muted">Nenhum curso publicado ainda.</td>
                </tr>
              ) : (
                d.cursos.map((c) => (
                  <tr key={c.slug} className="border-b border-line last:border-b-0">
                    <th scope="row" className="py-3 pr-4 text-left font-medium">
                      {c.titulo}
                      <span className="block text-[13px] font-normal text-dim">
                        {c.gratuito ? "Gratuito" : "Pago"}, {c.aulas} {c.aulas === 1 ? "aula publicada" : "aulas publicadas"}
                      </span>
                    </th>
                    <td className="px-3 py-3 text-right tabular-nums">{n(c.matriculados)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{n(c.comecaram)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{n(c.concluiram)}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-3">
                        <span className="h-2 w-24 overflow-hidden rounded-full bg-line" aria-hidden="true">
                          <span className="block h-full rounded-full bg-ink" style={{ width: `${c.media_conclusao}%` }} />
                        </span>
                        <span className="tabular-nums">{c.media_conclusao}%</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{n(c.aprovados_final)}</td>
                    <td className="py-3 pl-3 text-right tabular-nums">{n(c.certificados)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="h-quem" className="grid gap-10 lg:grid-cols-3">
        <h2 id="h-quem" className="sr-only">Quem está estudando</h2>
        <Distribuicao titulo="Perfil na pré-inscrição" dados={d.perfil_declarado} rotulos={PERFIS_DECLARADOS} vazio="Nenhuma pré-inscrição ainda." />
        <Distribuicao titulo="Área de atuação" dados={d.areas} rotulos={Object.fromEntries(AREAS.map((a) => [a.valor, a.rotulo]))} vazio="Ninguém preencheu ainda em Meu perfil." />
        <Distribuicao titulo="Tempo de experiência" dados={d.experiencia} rotulos={Object.fromEntries(EXPERIENCIAS.map((a) => [a.valor, a.rotulo]))} vazio="Ninguém preencheu ainda em Meu perfil." />
      </section>
    </div>
  );
}

function PorDia({ d }: { d: Indicadores }) {
  const topo = Math.max(1, ...d.por_dia.map((x) => Math.max(x.pre_inscricoes, x.contas)));
  const soma = d.por_dia.reduce((a, x) => a + x.pre_inscricoes, 0);
  const somaContas = d.por_dia.reduce((a, x) => a + x.contas, 0);
  return (
    <section aria-labelledby="h-dia">
      <h2 id="h-dia" className="m-0 mb-1 font-display text-xl font-semibold">Últimos 30 dias</h2>
      <p className="m-0 mb-5 text-sm text-muted">
        {n(soma)} {soma === 1 ? "pré-inscrição" : "pré-inscrições"} e {n(somaContas)} {somaContas === 1 ? "conta nova" : "contas novas"}. A barra mostra as pré-inscrições do dia; o traço
        cinza, as contas criadas.
      </p>
      <div className="painel-card p-5">
        <div className="flex h-36 items-end gap-[3px]" aria-hidden="true">
          {d.por_dia.map((x) => (
            <div key={x.dia} className="relative flex h-full flex-1 items-end" title={`${DIA.format(new Date(x.dia))}: ${x.pre_inscricoes} pré-inscrições, ${x.contas} contas`}>
              <div className="w-full rounded-t-[3px] bg-ink/70" style={{ height: `${pct(x.pre_inscricoes, topo)}%`, minHeight: x.pre_inscricoes > 0 ? 3 : 0 }} />
              {x.contas > 0 && <div className="absolute inset-x-0 h-[3px] rounded-full bg-muted" style={{ bottom: `calc(${pct(x.contas, topo)}% - 1.5px)` }} />}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[12px] text-dim" aria-hidden="true">
          <span>{DIA.format(new Date(d.por_dia[0]?.dia ?? d.gerado_em))}</span>
          <span>hoje</span>
        </div>
        <table className="sr-only">
          <caption>Pré-inscrições e contas novas por dia, últimos 30 dias</caption>
          <thead>
            <tr>
              <th scope="col">Dia</th>
              <th scope="col">Pré-inscrições</th>
              <th scope="col">Contas novas</th>
            </tr>
          </thead>
          <tbody>
            {d.por_dia.map((x) => (
              <tr key={x.dia}>
                <th scope="row">{DIA.format(new Date(x.dia))}</th>
                <td>{x.pre_inscricoes}</td>
                <td>{x.contas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Distribuicao({ titulo, dados, rotulos, vazio }: { titulo: string; dados: Record<string, number>; rotulos: Record<string, string>; vazio: string }) {
  const itens = Object.entries(dados).sort((a, b) => b[1] - a[1]);
  const total = itens.reduce((a, [, v]) => a + v, 0);
  return (
    <div>
      <h3 className="m-0 mb-4 text-[15px] font-semibold">{titulo}</h3>
      {itens.length === 0 ? (
        <p className="m-0 text-sm text-muted">{vazio}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {itens.map(([k, v]) => (
            <li key={k} className="text-sm">
              <span className="flex justify-between gap-3">
                <span>{rotulos[k] ?? k}</span>
                <span className="tabular-nums text-muted">
                  {n(v)} ({pct(v, total)}%)
                </span>
              </span>
              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
                <span className="block h-full rounded-full bg-ink" style={{ width: `${pct(v, total)}%` }} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
