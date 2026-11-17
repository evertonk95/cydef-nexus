import { AlertTriangle, ArrowRight, Crosshair, ExternalLink, PlayCircle, Radio, RefreshCw } from "lucide-react";
import { Cartao, CabecalhoCartao } from "@/components/ui/Cartao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { TextoDecodificado } from "@/components/fx/TextoDecodificado";
import { cn } from "@/lib/cn";
import type { ItemBoletim } from "@/lib/painel";

const TIPOS = {
  atualizacao: { rotulo: "Atualização", icone: RefreshCw, classe: "" },
  ameaca: { rotulo: "Ameaça da semana", icone: AlertTriangle, classe: "ameaca" },
  missao: { rotulo: "Nova missão", icone: Crosshair, classe: "missao" },
  aula: { rotulo: "Aula nova", icone: PlayCircle, classe: "" },
} as const;

export function CartaoBoletim({ itens, carregando, erro }: { itens: ItemBoletim[]; carregando: boolean; erro: boolean }) {
  return (
    <Cartao indice={1} rotulo="Boletim do SOC">
      <CabecalhoCartao
        id="h-boletim"
        titulo="Boletim do SOC"
        icone={<Radio />}
        extra={
          itens.length > 0 ? (
            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-bad">
              <span aria-hidden="true" className="size-[7px] rounded-full bg-bad animate-[ping-laranja_1.8s_infinite]" />
              AO VIVO
            </span>
          ) : undefined
        }
      />
      {carregando && (
        <div className="flex flex-col gap-3.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-[44px_1fr] gap-3.5 rounded-xl border border-line p-4">
              <Esqueleto className="size-11 rounded-[11px]" />
              <div className="flex flex-col gap-2">
                <Esqueleto className="h-5 w-28" />
                <Esqueleto className="h-4 w-full" />
                <Esqueleto className="h-4 w-3/5" />
              </div>
            </div>
          ))}
        </div>
      )}
      {!carregando && erro && <p className="m-0 text-muted">Não foi possível carregar o boletim agora. Tente de novo em instantes.</p>}
      {!carregando && !erro && itens.length === 0 && (
        <p className="m-0 leading-relaxed text-muted">
          Avisos da Academy, aulas atualizadas e a ameaça da semana aparecem aqui conforme forem publicados.
        </p>
      )}
      {!carregando && !erro && itens.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          {itens.map((it, i) => {
            const tipo = TIPOS[it.tipo];
            const Icone = tipo.icone;
            return (
              <li
                key={it.id}
                className={cn(
                  "grid grid-cols-[44px_1fr] gap-3.5 rounded-xl border border-line bg-[rgba(9,9,10,0.8)] p-4 transition-colors duration-200 hover:border-[#34343a]",
                  tipo.classe === "ameaca" && "border-bad/30 bg-[linear-gradient(180deg,rgba(248,113,113,0.07),rgba(9,9,10,0.8))]",
                  tipo.classe === "missao" && "border-orange/30 bg-[linear-gradient(180deg,rgba(249,115,22,0.07),rgba(9,9,10,0.8))]",
                )}
              >
                <span
                  className={cn(
                    "grid size-11 place-items-center rounded-[11px] border border-line bg-panel-2 text-muted",
                    tipo.classe === "ameaca" && "border-bad/35 bg-bad/8 text-bad",
                    tipo.classe === "missao" && "border-orange/35 bg-orange/8 text-orange",
                  )}
                >
                  <Icone className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <span
                    className={cn(
                      "mb-2 inline-block rounded-md border border-line-hi bg-[#161618] px-2 py-0.5 font-mono text-[11px] tracking-[0.1em] text-muted uppercase",
                      tipo.classe === "ameaca" && "border-bad/40 bg-bad/10 text-[#fca5a5]",
                      tipo.classe === "missao" && "border-orange/40 bg-orange/10 text-orange-hi",
                    )}
                  >
                    {tipo.rotulo}
                  </span>
                  <p className="m-0 text-[15.5px] leading-snug font-medium">
                    <TextoDecodificado texto={it.titulo} atraso={250 + i * 220} />
                  </p>
                  {it.link && (
                    <a href={it.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm text-orange-hi underline underline-offset-[3px]">
                      Ler mais <ExternalLink className="size-3.5" aria-hidden="true" />
                      <span className="sr-only">(abre em nova aba)</span>
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {itens.length > 3 && (
        <p className="mt-4 mb-0 flex justify-center text-sm text-muted">
          <ArrowRight className="mr-2 size-4" aria-hidden="true" />
          Mostrando os avisos mais recentes
        </p>
      )}
    </Cartao>
  );
}
