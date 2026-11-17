import { CalendarDays, Flame } from "lucide-react";
import { Cartao, CabecalhoCartao } from "@/components/ui/Cartao";
import { mapaDeEstudo, sequenciaAtual } from "@/lib/painel";
import { cn } from "@/lib/cn";

export function CartaoSequencia({ dias, hoje }: { dias: string[]; hoje: string }) {
  const seq = sequenciaAtual(dias, hoje);
  const mapa = mapaDeEstudo(dias, hoje);
  const total = dias.length;
  return (
    <Cartao indice={3} rotulo="Sequência de estudo">
      <CabecalhoCartao id="h-sequencia" titulo="Sequência de estudo" icone={<CalendarDays />} />
      <p className="-mt-1 mb-4 flex items-center gap-3 font-display text-2xl font-bold text-orange-hi">
        <Flame className="size-[30px] text-orange animate-[chama_1.8s_ease-in-out_infinite] [transform-origin:50%_90%]" aria-hidden="true" />
        {seq === 0 ? "Comece hoje" : seq === 1 ? "1 dia seguido" : `${seq} dias seguidos`}
      </p>
      <div
        role="img"
        aria-label={`Mapa de estudo das últimas 12 semanas: ${total} ${total === 1 ? "dia" : "dias"} com estudo.`}
        className="grid grid-flow-col grid-cols-[repeat(12,minmax(0,18px))] grid-rows-[repeat(7,auto)] justify-between gap-1.5"
      >
        {mapa.flatMap((coluna, c) =>
          coluna.map((cel, r) => (
            <span
              key={cel.dia}
              className={cn(
                "aspect-square rounded-[3px] animate-[acender_600ms_var(--ease-out-soft)_both]",
                cel.futuro ? "bg-transparent" : cel.estudou ? "bg-orange-hi shadow-[0_0_10px_rgba(249,115,22,0.45)]" : "bg-[#1b1b1e]",
              )}
              style={{ animationDelay: `${400 + c * 55 + r * 18}ms` }}
            />
          )),
        )}
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-xs text-dim">
        <span>Últimas 12 semanas</span>
        <span>{total} {total === 1 ? "dia" : "dias"} com estudo</span>
      </div>
    </Cartao>
  );
}
