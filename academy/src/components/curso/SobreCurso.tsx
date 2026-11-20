import { Check, ExternalLink } from "lucide-react";
import type { CursoDetalhe } from "@/lib/cursos";
import { iniciais } from "@/lib/formato";

/**
 * O que o aluno precisa saber do curso além das aulas: objetivos, para quem
 * é, pré-requisitos e quem ensina. Cada bloco só aparece com conteúdo.
 */
export function SobreCurso({ curso }: { curso: CursoDetalhe }) {
  const temTexto = curso.objetivos.length > 0 || curso.publico || curso.pre_requisitos;
  if (!temTexto && curso.instrutores.length === 0) return null;

  return (
    <div className="mt-10 flex flex-col gap-10">
      {curso.objetivos.length > 0 && (
        <section aria-labelledby="h-objetivos">
          <h2 id="h-objetivos" className="m-0 mb-4 font-display text-xl font-semibold">
            O que você vai aprender
          </h2>
          <ul className="m-0 grid list-none gap-x-8 gap-y-3 p-0 sm:grid-cols-2">
            {curso.objetivos.map((o) => (
              <li key={o} className="flex items-start gap-3 leading-relaxed text-[#d4d4d4]">
                <Check className="mt-1 size-4 flex-none text-ok" aria-hidden="true" />
                {o}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(curso.publico || curso.pre_requisitos) && (
        <div className="grid gap-8 sm:grid-cols-2">
          {curso.publico && (
            <section aria-labelledby="h-publico">
              <h2 id="h-publico" className="m-0 mb-2 font-display text-lg font-semibold">
                Para quem é
              </h2>
              <p className="m-0 leading-relaxed whitespace-pre-line text-[#d4d4d4]">{curso.publico}</p>
            </section>
          )}
          {curso.pre_requisitos && (
            <section aria-labelledby="h-pre">
              <h2 id="h-pre" className="m-0 mb-2 font-display text-lg font-semibold">
                Pré-requisitos
              </h2>
              <p className="m-0 leading-relaxed whitespace-pre-line text-[#d4d4d4]">{curso.pre_requisitos}</p>
            </section>
          )}
        </div>
      )}

      {curso.instrutores.length > 0 && (
        <section aria-labelledby="h-instrutores">
          <h2 id="h-instrutores" className="m-0 mb-4 font-display text-xl font-semibold">
            {curso.instrutores.length === 1 ? "Quem ensina" : "Quem ensina neste curso"}
          </h2>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {curso.instrutores.map((i) => (
              <li key={i.id} className="painel-card flex items-start gap-4 p-5">
                <span aria-hidden="true" className="grid size-12 flex-none place-items-center rounded-full border border-line-hi bg-bg font-display font-semibold">
                  {iniciais(i.nome)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 font-semibold">
                    {i.nome}
                    {i.papel === "convidado" && <span className="ml-2 text-[13px] font-normal text-muted">Convidado</span>}
                  </p>
                  {i.cargo && <p className="m-0 text-sm text-muted">{i.cargo}</p>}
                  {i.bio && <p className="m-0 mt-2 max-w-[68ch] text-[15px] leading-relaxed whitespace-pre-line text-[#d4d4d4]">{i.bio}</p>}
                  {(i.linkedin || i.site) && (
                    <p className="m-0 mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      {i.linkedin && (
                        <a href={i.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
                          LinkedIn <ExternalLink className="size-3.5" aria-hidden="true" />
                          <span className="sr-only">de {i.nome} (abre em nova aba)</span>
                        </a>
                      )}
                      {i.site && (
                        <a href={i.site} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-muted hover:text-ink">
                          Site <ExternalLink className="size-3.5" aria-hidden="true" />
                          <span className="sr-only">de {i.nome} (abre em nova aba)</span>
                        </a>
                      )}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
