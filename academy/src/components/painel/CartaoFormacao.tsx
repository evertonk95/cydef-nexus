import { Check, Layers } from "lucide-react";
import { Cartao, CabecalhoCartao } from "@/components/ui/Cartao";
import { percentual } from "@/lib/formato";
import { cn } from "@/lib/cn";
import type { FormacaoResumo } from "@/lib/painel";

export function CartaoFormacao({ formacao, indice }: { formacao: FormacaoResumo; indice: number }) {
  const trilhas = formacao.trilhas;
  const atual = trilhas.findIndex((t) => t.total === 0 || t.concluidas < t.total);
  const feitas = atual === -1 ? trilhas.length : atual;
  const largura = trilhas.length > 1 ? (feitas / (trilhas.length - 1)) * 100 : 0;
  return (
    <Cartao indice={indice} rotulo={formacao.titulo}>
      <CabecalhoCartao id={`h-${formacao.slug}`} titulo={formacao.titulo} icone={<Layers />} />
      <ol className="relative m-0 mt-2 mb-[18px] grid list-none p-0" style={{ gridTemplateColumns: `repeat(${Math.max(1, trilhas.length)}, minmax(0, 1fr))` }}>
        {trilhas.length > 1 && (
          <li aria-hidden="true" className="absolute top-[21px] h-0.5 bg-[#2a2a2e]" style={{ left: `${50 / trilhas.length}%`, right: `${50 / trilhas.length}%` }}>
            <span className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,var(--color-ok),var(--color-orange))]" style={{ width: `${Math.min(100, largura)}%` }}>
              <span className="absolute -inset-y-[3px] inset-x-0 bg-[radial-gradient(20px_4px_at_50%_50%,#fff,rgba(251,146,60,0.6),transparent)] animate-[correr_2.4s_linear_infinite] motion-reduce:hidden" />
            </span>
          </li>
        )}
        {trilhas.map((t, i) => {
          const pct = percentual(t.concluidas, t.total);
          const ok = t.total > 0 && t.concluidas >= t.total;
          const agora = i === atual;
          return (
            <li key={t.slug} className="relative flex flex-col items-center gap-2.5 text-center text-sm">
              <span
                className={cn(
                  "z-[1] grid size-11 place-items-center rounded-full border-2 bg-[#0c0c0e]",
                  ok && "border-ok bg-ok text-[#052e13] shadow-[0_0_18px_rgba(74,222,128,0.45)]",
                  agora && "border-orange text-orange shadow-[0_0_0_6px_rgba(249,115,22,0.1),0_0_22px_rgba(249,115,22,0.5)]",
                  !ok && !agora && "border-line-hi text-dim",
                )}
              >
                {ok ? <Check className="size-[18px]" strokeWidth={3} aria-hidden="true" /> : <span className={cn("size-3 rounded-full", agora ? "bg-orange" : "bg-line-hi")} />}
              </span>
              <span>{t.titulo}</span>
              <span className={cn("rounded-full border px-2 py-px font-mono text-[11.5px]", ok ? "border-ok/45 bg-ok/8 text-ok" : "border-orange/50 bg-orange/8 text-orange-hi")}>
                {pct}%
              </span>
            </li>
          );
        })}
      </ol>
      <div className="flex items-center gap-3 rounded-[10px] border border-line bg-[#09090a] px-3.5 py-3 font-mono text-sm text-muted">
        <span aria-hidden="true">&gt;_</span>
        <span>
          <b className="font-medium text-orange-hi">{formacao.aulas_concluidas}</b> de {formacao.aulas_total} aulas concluídas
        </span>
        <span aria-hidden="true" className="h-4 w-2 bg-orange animate-[piscar_1s_steps(1)_infinite]" />
      </div>
    </Cartao>
  );
}
