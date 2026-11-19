import { mapaDeEstudo, sequenciaAtual } from "@/lib/painel";
import { cn } from "@/lib/cn";

export function CartaoSequencia({ dias, hoje }: { dias: string[]; hoje: string }) {
  const seq = sequenciaAtual(dias, hoje);
  const mapa = mapaDeEstudo(dias, hoje);
  const total = dias.length;
  const diasTexto = `${total} ${total === 1 ? "dia" : "dias"} com estudo`;
  return (
    <section aria-labelledby="h-sequencia" className="flex flex-col gap-4 rounded-2xl border border-line p-7">
      <div>
        <h2 id="h-sequencia" className="m-0 font-display text-2xl leading-tight font-semibold">
          {seq === 0 ? "Comece hoje" : seq === 1 ? "1 dia seguido" : `${seq} dias seguidos`}
        </h2>
        <p className="m-0 mt-1 text-sm text-muted">{diasTexto} nas últimas 12 semanas</p>
      </div>
      <div
        role="img"
        aria-label={`Mapa de estudo das últimas 12 semanas: ${diasTexto}.`}
        className="grid grid-flow-col grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[repeat(7,auto)] gap-1"
      >
        {mapa.flatMap((coluna) =>
          coluna.map((cel) => (
            <span
              key={cel.dia}
              className={cn("aspect-square rounded-[3px]", cel.futuro ? "bg-transparent" : cel.estudou ? "bg-[#e7e5e4]" : "bg-[#1f1f1f]")}
            />
          )),
        )}
      </div>
    </section>
  );
}
