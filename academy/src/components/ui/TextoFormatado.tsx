import { Fragment } from "react";
import { cn } from "@/lib/cn";
import { blocosDoTexto } from "@/lib/texto";

export function TextoFormatado({ texto, className }: { texto: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 leading-relaxed text-[#d4d4d4]", className)}>
      {blocosDoTexto(texto).map((b, i) =>
        b.tipo === "lista" ? (
          <ul key={i} className="m-0 flex list-disc flex-col gap-1.5 pl-5 marker:text-dim">
            {b.itens.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="m-0">
            {b.linhas.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {l}
              </Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  );
}
