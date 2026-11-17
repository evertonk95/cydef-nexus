import { BarChart3 } from "lucide-react";
import { Cartao, CabecalhoCartao } from "@/components/ui/Cartao";
import { Barra } from "@/components/ui/Barra";
import { Contador } from "@/components/ui/Contador";
import type { Competencia } from "@/lib/painel";

export function CartaoCompetencias({ competencias }: { competencias: Competencia[] }) {
  return (
    <Cartao indice={2} rotulo="Suas competências">
      <CabecalhoCartao id="h-competencias" titulo="Suas competências" icone={<BarChart3 />} />
      {competencias.length === 0 ? (
        <p className="m-0 leading-relaxed text-muted">Cada aula concluída soma pontos nas competências que ela trabalha.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          {competencias.map((c, i) => (
            <li key={c.slug} className="grid grid-cols-[minmax(120px,172px)_1fr_46px] items-center gap-3.5 text-[14.5px]">
              <span>{c.titulo}</span>
              <Barra valor={c.percentual} rotulo={`Competência ${c.titulo}`} className="h-1.5" atraso={0.25 + i * 0.08} />
              <span className="text-right font-mono text-[13.5px] text-muted">
                <Contador valor={c.percentual} sufixo="%" />
              </span>
            </li>
          ))}
        </ul>
      )}
    </Cartao>
  );
}
