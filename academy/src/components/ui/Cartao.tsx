import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Card do portal: superfície neutra, sem efeito. Só onde existe uma ação ou um bloco de dado. */
export function Cartao({
  children,
  className,
  rotulo,
  as = "section",
}: {
  children: ReactNode;
  className?: string;
  rotulo?: string;
  as?: "section" | "article" | "div";
}) {
  const Comp = as;
  return (
    <Comp aria-label={rotulo} className={cn("painel-card p-6", className)}>
      {children}
    </Comp>
  );
}

export function CabecalhoCartao({ titulo, id, extra }: { titulo: string; id: string; extra?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h2 id={id} className="m-0 font-display text-xl font-semibold tracking-tight">
        {titulo}
      </h2>
      {extra && <div className="ml-auto">{extra}</div>}
    </div>
  );
}
