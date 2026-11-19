import { AlertTriangle, Crosshair, ExternalLink, PlayCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ItemBoletim } from "@/lib/painel";

const TIPOS = {
  atualizacao: { rotulo: "Atualização", icone: RefreshCw, cor: "text-muted" },
  ameaca: { rotulo: "Ameaça da semana", icone: AlertTriangle, cor: "text-bad" },
  missao: { rotulo: "Nova missão", icone: Crosshair, cor: "text-muted" },
  aula: { rotulo: "Aula nova", icone: PlayCircle, cor: "text-muted" },
} as const;

/** Só entra no painel quando há aviso publicado, ou para mostrar a falha ao carregar. */
export function CartaoBoletim({ itens, erro }: { itens: ItemBoletim[]; erro: boolean }) {
  return (
    <section aria-labelledby="h-boletim" className="flex flex-col gap-4 rounded-2xl border border-line p-7">
      <h2 id="h-boletim" className="m-0 font-display text-xl font-semibold">Boletim do SOC</h2>
      {erro ? (
        <p className="m-0 text-muted">Não foi possível carregar o boletim agora. Tente de novo em instantes.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {itens.map((it, i) => {
            const tipo = TIPOS[it.tipo];
            const Icone = tipo.icone;
            return (
              <li key={it.id} className={cn("flex flex-col gap-1 py-3.5", i > 0 && "border-t border-line")}>
                <span className={cn("flex items-center gap-2 text-[13px]", tipo.cor)}>
                  <Icone className="size-3.5" aria-hidden="true" />
                  {tipo.rotulo}
                </span>
                <p className="m-0 text-[15px] leading-snug font-medium">{it.titulo}</p>
                {it.link && (
                  <a href={it.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 self-start text-sm text-muted underline underline-offset-4 hover:text-ink">
                    Ler mais <ExternalLink className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">(abre em nova aba)</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
