import { Check, X } from "lucide-react";
import type { CorrecaoPergunta, PerguntaAluno } from "@/lib/missoes";
import { cn } from "@/lib/cn";

/**
 * Pergunta da investigação: radio para resposta única, checkbox para "marque
 * todas". Com `correcao`, mostra o que foi escolhido, o certo e a explicação.
 */
export function Pergunta({
  pergunta,
  indice,
  escolhidas,
  escolher,
  correcao,
}: {
  pergunta: Pick<PerguntaAluno, "id" | "enunciado" | "alternativas"> & { dica?: string; multipla?: boolean };
  indice: number;
  escolhidas: number[];
  escolher?: (j: number) => void;
  correcao?: CorrecaoPergunta;
}) {
  const multipla = pergunta.multipla ?? (correcao ? correcao.corretas.length > 1 : false);
  const revisao = Boolean(correcao);
  return (
    <fieldset
      className={cn(
        "m-0 min-w-0 rounded-2xl border bg-panel p-5",
        !correcao ? "border-line" : correcao.acertou ? "border-ok/35" : "border-bad/35",
      )}
    >
      <legend className="sr-only">Pergunta {indice}</legend>
      <div className="mb-3 flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-6 flex-none place-items-center rounded-md border text-[12.5px]",
            escolhidas.length > 0 && !revisao ? "border-orange text-ink" : "border-line-hi text-muted",
          )}
        >
          {indice}
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[16px] leading-snug font-semibold">{pergunta.enunciado}</p>
          {pergunta.dica && <p className="m-0 mt-1 text-[13.5px] text-muted">{pergunta.dica}</p>}
        </div>
        {correcao && (
          <span
            className={cn(
              "inline-flex flex-none items-center gap-1 rounded-full px-2.5 py-1 text-[13px]",
              correcao.acertou ? "bg-ok/12 text-ok" : "bg-bad/12 text-bad",
            )}
          >
            {correcao.acertou ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : <X className="size-3.5" strokeWidth={3} aria-hidden="true" />}
            {correcao.acertou ? "Acertou" : "Errou"}
          </span>
        )}
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0 pl-9">
        {pergunta.alternativas.map((a, j) => {
          const marcada = escolhidas.includes(j);
          const certa = correcao?.corretas.includes(j) ?? false;
          const errada = revisao && marcada && !certa;
          const faltou = revisao && certa && !marcada;
          return (
            <li key={j}>
              <label
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3.5 py-2.5 text-[15px] leading-relaxed transition-colors duration-150",
                  revisao ? "cursor-default" : "cursor-pointer hover:border-muted",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange",
                  revisao && certa && marcada
                    ? "border-ok/50 bg-ok/[0.07]"
                    : faltou
                      ? "border-dashed border-ok/50"
                      : errada
                        ? "border-bad/50 bg-bad/[0.07]"
                        : marcada
                          ? "border-orange"
                          : "border-line",
                )}
              >
                <input
                  type={multipla ? "checkbox" : "radio"}
                  name={`p-${pergunta.id}`}
                  checked={marcada}
                  disabled={revisao}
                  onChange={() => escolher?.(j)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid size-5 flex-none place-items-center border-[1.5px]",
                    multipla ? "rounded-[5px]" : "rounded-full",
                    revisao && certa ? "border-ok bg-ok text-[#052e13]" : errada ? "border-bad bg-bad text-[#2b0505]" : marcada ? "border-orange bg-orange text-orange-ink" : "border-line-hi",
                  )}
                >
                  {(marcada || (revisao && certa)) && (errada ? <X className="size-3" strokeWidth={3.5} /> : <Check className="size-3" strokeWidth={3.5} />)}
                </span>
                <span className="min-w-0 flex-1 text-[#e4e4e4]">
                  {a}
                  {revisao && certa && <span className="sr-only">{marcada ? " (sua resposta, certa)" : " (resposta certa que faltou)"}</span>}
                  {errada && <span className="sr-only"> (sua resposta, errada)</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {correcao && (
        <p className="m-0 mt-4 ml-9 rounded-xl border border-line bg-panel-2 px-4 py-3 text-[14.5px] leading-relaxed text-[#d6d6d6]">
          <span className="font-semibold text-ink">Por quê: </span>
          {correcao.explicacao}
        </p>
      )}
    </fieldset>
  );
}
