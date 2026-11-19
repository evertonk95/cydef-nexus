import { Fragment } from "react";
import { Link } from "react-router";

/** "Meus cursos / Curso / Página atual", o mesmo desenho das outras telas. */
export function Trilha({ itens }: { itens: { rotulo: string; para?: string }[] }) {
  return (
    <nav aria-label="Você está em" className="mb-5 flex flex-wrap items-center gap-2.5 text-sm text-muted">
      {itens.map((it, i) => (
        <Fragment key={it.rotulo}>
          {i > 0 && (
            <span aria-hidden="true" className="text-[#4a4a50]">
              /
            </span>
          )}
          {it.para ? (
            <Link to={it.para} className="hover:text-ink">
              {it.rotulo}
            </Link>
          ) : (
            <span aria-current="page" className="text-ink">
              {it.rotulo}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
