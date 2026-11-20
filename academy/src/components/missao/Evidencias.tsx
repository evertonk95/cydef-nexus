import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Info, Pin, X } from "lucide-react";
import { chaveLinha, type Evidencia } from "@/lib/missoes";
import { cn } from "@/lib/cn";

/**
 * Evidências da missão em abas (padrão WAI-ARIA: setas trocam de aba). Cada
 * linha pode ser fixada como prova; as fixadas vão junto com a investigação.
 */
export function Evidencias({
  evidencias,
  fixadas,
  alternar,
  somenteLeitura = false,
}: {
  evidencias: Evidencia[];
  fixadas: string[];
  alternar: (chave: string) => void;
  somenteLeitura?: boolean;
}) {
  const base = useId();
  const [ativa, setAtiva] = useState(0);
  const abas = useRef<(HTMLButtonElement | null)[]>([]);
  const teclas = (e: KeyboardEvent, i: number) => {
    const passo = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!passo) return;
    e.preventDefault();
    const n = (i + passo + evidencias.length) % evidencias.length;
    setAtiva(n);
    abas.current[n]?.focus();
  };
  const ev = evidencias[ativa];
  const pino = (aba: string, partes: string[]) => {
    const chave = chaveLinha(aba, partes);
    return { chave, fixada: fixadas.includes(chave), alternar: () => alternar(chave), somenteLeitura };
  };

  return (
    <section aria-labelledby={`${base}-h`} className="painel-card min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-4 sm:px-6">
        <h2 id={`${base}-h`} className="m-0 font-display text-xl font-semibold">
          Evidências
        </h2>
        {!somenteLeitura && <p className="m-0 text-[13px] text-muted">Toque numa linha para fixá-la como prova.</p>}
      </div>
      <div role="tablist" aria-label="Evidências" className="flex gap-1 overflow-x-auto border-b border-line px-3 sm:px-4">
        {evidencias.map((e, i) => (
          <button
            key={e.id}
            ref={(el) => {
              abas.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-t-${e.id}`}
            aria-selected={i === ativa}
            aria-controls={`${base}-p-${e.id}`}
            tabIndex={i === ativa ? 0 : -1}
            onClick={() => setAtiva(i)}
            onKeyDown={(k) => teclas(k, i)}
            className={cn(
              "-mb-px shrink-0 whitespace-nowrap border-b-2 px-2.5 py-3 text-[15px] font-medium transition-colors duration-150",
              i === ativa ? "border-orange text-ink" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {e.titulo}
          </button>
        ))}
      </div>
      {ev && (
        <div role="tabpanel" id={`${base}-p-${ev.id}`} aria-labelledby={`${base}-t-${ev.id}`} tabIndex={0} className="p-4 sm:p-5">
          <ConteudoEvidencia ev={ev} pino={pino} />
          {ev.dica && (
            <p className="m-0 mt-4 flex items-start gap-2.5 rounded-xl border border-dashed border-line-hi px-3.5 py-3 text-[14px] leading-relaxed text-muted">
              <Info className="mt-0.5 size-4 flex-none text-warn" aria-hidden="true" />
              {ev.dica}
            </p>
          )}
        </div>
      )}
      <BandejaFixadas fixadas={fixadas} alternar={alternar} somenteLeitura={somenteLeitura} />
    </section>
  );
}

type Pino = (aba: string, partes: string[]) => { chave: string; fixada: boolean; alternar: () => void; somenteLeitura: boolean };

/** Linha fixável: um botão com aria-pressed, para teclado e leitor de tela. */
function Fixavel({ p, className, children }: { p: ReturnType<Pino>; className?: string; children: ReactNode }) {
  if (p.somenteLeitura) return <div className={cn("px-3 py-1.5", p.fixada && "bg-orange/10", className)}>{children}</div>;
  return (
    <button
      type="button"
      aria-pressed={p.fixada}
      onClick={p.alternar}
      className={cn(
        "group flex w-full items-start gap-2 px-3 py-1.5 text-left transition-colors duration-150 hover:bg-white/[0.04]",
        p.fixada && "bg-orange/10 hover:bg-orange/15",
        className,
      )}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <Pin
        className={cn("mt-1 size-3.5 flex-none", p.fixada ? "text-orange-hi" : "text-transparent group-hover:text-dim group-focus-visible:text-dim")}
        aria-hidden="true"
      />
      <span className="sr-only">{p.fixada ? ", fixada como prova" : ", fixar como prova"}</span>
    </button>
  );
}

function ConteudoEvidencia({ ev, pino }: { ev: Evidencia; pino: Pino }) {
  const mono = "font-mono text-[13px] leading-relaxed";
  switch (ev.tipo) {
    case "email": {
      const c = ev.conteudo;
      return (
        <div className="overflow-hidden rounded-xl border border-line">
          <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-0 border-b border-line py-2 text-[14px]">
            {(
              [
                ["De", c.de],
                ["Para", c.para],
                ["Assunto", c.assunto],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="py-1 pl-3 text-muted">{k}</dt>
                <dd className="m-0 min-w-0">
                  <Fixavel p={pino(ev.titulo, [`${k}:`, v])} className="pl-0">
                    <span className="break-words">{v}</span>
                  </Fixavel>
                </dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-3 px-4 py-4 text-[15px] leading-relaxed text-[#e4e4e4]">
            {c.corpo.split(/\n{2,}/).map((par, i) => (
              <p key={i} className="m-0 whitespace-pre-line">
                {par}
              </p>
            ))}
            {c.link_texto && (
              <p className="m-0">
                <span
                  title={c.link_destino}
                  className="inline-flex rounded-lg bg-[#2563eb] px-4 py-2.5 text-[15px] font-semibold text-white"
                  aria-label={c.link_destino ? `Botão do e-mail "${c.link_texto}", aponta para ${c.link_destino}` : undefined}
                >
                  {c.link_texto}
                </span>
                {c.link_destino && <span className="mt-1.5 block font-mono text-[12.5px] text-dim">Destino do botão: {c.link_destino}</span>}
              </p>
            )}
            {c.assinatura && <p className="m-0 text-[13.5px] text-dim">{c.assinatura}</p>}
          </div>
        </div>
      );
    }
    case "cabecalhos":
      return (
        <div className={cn("overflow-x-auto rounded-xl border border-line bg-[#08080a] py-2", mono)}>
          {ev.conteudo.linhas.map((l, i) => (
            <Fixavel key={i} p={pino(ev.titulo, [l.campo, l.valor])}>
              <span className="whitespace-pre-wrap break-all">
                <span className="text-muted">{l.campo || " ".repeat(10)}</span> <span className={l.destaque ? "text-bad" : "text-ink"}>{l.valor}</span>
              </span>
            </Fixavel>
          ))}
        </div>
      );
    case "tabela": {
      const { colunas, linhas } = ev.conteudo;
      return (
        <div className="overflow-x-auto rounded-xl border border-line bg-[#08080a]">
          <table className={cn("w-full border-collapse", mono)}>
            <caption className="sr-only">{ev.titulo}</caption>
            <thead>
              <tr className="border-b border-line text-left text-muted">
                {colunas.map((c) => (
                  <th key={c} scope="col" className="whitespace-nowrap px-3 py-2 font-medium">
                    {c}
                  </th>
                ))}
                <th scope="col" className="sr-only">
                  Fixar
                </th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l, i) => {
                const p = pino(ev.titulo, l);
                return (
                  <tr key={i} className={cn("border-b border-line/60 last:border-b-0", p.fixada && "bg-orange/10")}>
                    {l.map((v, j) => (
                      <td key={j} className="whitespace-nowrap px-3 py-1.5 text-ink">
                        {v}
                      </td>
                    ))}
                    <td className="px-2 py-1 text-right">
                      {!p.somenteLeitura && (
                        <button
                          type="button"
                          aria-pressed={p.fixada}
                          onClick={p.alternar}
                          aria-label={`Fixar a linha ${l.join(" ")}`}
                          className={cn("rounded-md p-1.5 hover:bg-white/5", p.fixada ? "text-orange-hi" : "text-dim hover:text-ink")}
                        >
                          <Pin className="size-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    case "alerta":
      return (
        <div className="overflow-hidden rounded-xl border border-bad/35">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-bad/25 bg-bad/[0.06] px-4 py-3">
            <span className="font-mono text-[13px] font-semibold text-bad">{ev.conteudo.titulo}</span>
            {ev.conteudo.subtitulo && <span className="font-mono text-[12.5px] text-muted">{ev.conteudo.subtitulo}</span>}
          </div>
          <div className={cn("bg-[#08080a] py-2", mono)}>
            {ev.conteudo.linhas.map((l, i) => (
              <Fixavel key={i} p={pino(ev.titulo, [`${l.campo}:`, l.valor])}>
                <span className="grid grid-cols-[minmax(7rem,auto)_minmax(0,1fr)] gap-x-3">
                  <span className="text-muted">{l.campo}</span>
                  <span className={cn("break-words", l.destaque ? "text-bad" : "text-ink")}>{l.valor}</span>
                </span>
              </Fixavel>
            ))}
          </div>
        </div>
      );
    case "texto":
      return (
        <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-[#e4e4e4]">
          {ev.conteudo.texto.split(/\n{2,}/).map((par, i) => (
            <p key={i} className="m-0 whitespace-pre-line">
              {par}
            </p>
          ))}
        </div>
      );
  }
}

function BandejaFixadas({ fixadas, alternar, somenteLeitura }: { fixadas: string[]; alternar: (c: string) => void; somenteLeitura: boolean }) {
  return (
    <div className="border-t border-line px-5 py-4 sm:px-6">
      <h3 className="m-0 mb-2 text-sm font-semibold">Evidências fixadas</h3>
      {fixadas.length === 0 ? (
        <p className="m-0 text-sm text-muted">{somenteLeitura ? "Nenhuma evidência fixada nesta tentativa." : "Nenhuma ainda."}</p>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {fixadas.map((f) => (
            <li key={f} className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-line-hi bg-panel-2 py-1 pr-1 pl-2.5 text-[13px]">
              <span className="min-w-0 truncate">{f}</span>
              {!somenteLeitura && (
                <button type="button" onClick={() => alternar(f)} aria-label={`Tirar ${f} das evidências fixadas`} className="rounded-md p-1 text-dim hover:bg-white/5 hover:text-ink">
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
