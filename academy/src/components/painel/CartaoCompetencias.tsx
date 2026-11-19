import { Barra } from "@/components/ui/Barra";
import type { Competencia } from "@/lib/painel";

/** Só entra no painel quando o aluno já tem pontos em alguma competência. */
export function CartaoCompetencias({ competencias }: { competencias: Competencia[] }) {
  return (
    <section aria-labelledby="h-competencias" className="flex flex-col gap-4 rounded-2xl border border-line p-7">
      <h2 id="h-competencias" className="m-0 font-display text-xl font-semibold">Suas competências</h2>
      <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
        {competencias.map((c) => (
          <li key={c.slug} className="flex flex-col gap-1.5 text-[14.5px]">
            <span className="flex justify-between gap-3">
              <span>{c.titulo}</span>
              <span className="text-muted">{c.percentual}%</span>
            </span>
            <Barra valor={c.percentual} rotulo={`Competência ${c.titulo}`} />
          </li>
        ))}
      </ul>
    </section>
  );
}
