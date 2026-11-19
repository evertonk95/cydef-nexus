import { Check, X } from "lucide-react";
import type { CorrecaoQuestao, Questao as TQuestao } from "@/lib/avaliacao";
import { cn } from "@/lib/cn";

const LETRAS = "ABCDEFGH";

/**
 * Uma questão de múltipla escolha: `fieldset` com `radio` de verdade, então
 * teclado (setas, Tab) e leitor de tela funcionam sem nada extra. Com
 * `correcao`, vira a tela de revisão: marca a escolhida, a certa e a explicação.
 */
export function Questao({
  questao,
  indice,
  total,
  escolhida,
  escolher,
  correcao,
  desabilitada = false,
}: {
  questao: TQuestao;
  indice: number;
  total: number;
  escolhida?: string;
  escolher?: (alternativa: string) => void;
  correcao?: CorrecaoQuestao;
  desabilitada?: boolean;
}) {
  const nome = `q-${questao.id}`;
  const revisao = Boolean(correcao);
  return (
    <fieldset
      className={cn(
        "m-0 min-w-0 rounded-2xl border bg-[rgba(9,9,10,0.7)] p-5 sm:p-6",
        !correcao ? "border-line" : correcao.correta ? "border-ok/35" : "border-bad/35",
      )}
    >
      <legend className="sr-only">
        Questão {indice} de {total}
      </legend>
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex-none font-mono text-[12.5px] text-orange" aria-hidden="true">
          {String(indice).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
        <p className="m-0 text-[16px] leading-relaxed font-semibold text-ink">{questao.enunciado}</p>
        {correcao && (
          <span
            className={cn(
              "ml-auto inline-flex flex-none items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11.5px] tracking-wide uppercase",
              correcao.correta ? "bg-ok/12 text-ok" : "bg-bad/12 text-bad",
            )}
          >
            {correcao.correta ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : <X className="size-3.5" strokeWidth={3} aria-hidden="true" />}
            {correcao.correta ? "Acertou" : "Errou"}
          </span>
        )}
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {questao.alternativas.map((a, i) => {
          const marcada = (correcao?.escolhida ?? escolhida) === a.id;
          const certa = correcao?.alternativa_correta === a.id;
          const errada = revisao && marcada && !certa;
          return (
            <li key={a.id}>
              <label
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3.5 py-3 text-[15px] leading-relaxed transition-colors duration-150",
                  revisao || desabilitada ? "cursor-default" : "cursor-pointer hover:border-orange/50 hover:bg-orange/[0.04]",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange",
                  certa
                    ? "border-ok/50 bg-ok/[0.07]"
                    : errada
                      ? "border-bad/50 bg-bad/[0.07]"
                      : marcada
                        ? "border-orange bg-orange/[0.08]"
                        : "border-line",
                )}
              >
                <input
                  type="radio"
                  name={nome}
                  value={a.id}
                  checked={marcada}
                  disabled={revisao || desabilitada}
                  onChange={() => escolher?.(a.id)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-6 flex-none place-items-center rounded-full border-[1.5px] font-mono text-[11.5px]",
                    certa ? "border-ok bg-ok text-[#052e13]" : errada ? "border-bad bg-bad text-[#2b0505]" : marcada ? "border-orange bg-orange text-orange-ink" : "border-line-hi text-muted",
                  )}
                >
                  {certa ? <Check className="size-3.5" strokeWidth={3} /> : errada ? <X className="size-3.5" strokeWidth={3} /> : LETRAS[i]}
                </span>
                <span className="min-w-0 flex-1 text-[#e4e4e4]">
                  {a.texto}
                  {revisao && certa && <span className="sr-only"> (resposta certa)</span>}
                  {revisao && errada && <span className="sr-only"> (sua resposta, errada)</span>}
                  {revisao && marcada && certa && <span className="sr-only"> (sua resposta)</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {correcao?.explicacao && (
        <p className="m-0 mt-4 rounded-xl border border-line bg-panel-2 px-4 py-3 text-[14.5px] leading-relaxed text-[#d6d6d6]">
          <span className="font-semibold text-ink">Por quê: </span>
          {correcao.explicacao}
        </p>
      )}
    </fieldset>
  );
}
