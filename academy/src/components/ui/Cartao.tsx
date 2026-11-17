import { motion, useReducedMotion } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Card do portal: entra em cascata (240 ms, ease-out) e, quando interativo,
 * mostra um holofote laranja que acompanha o cursor.
 */
export function Cartao({
  children,
  className,
  indice = 0,
  interativo = true,
  rotulo,
  as = "section",
}: {
  children: ReactNode;
  className?: string;
  indice?: number;
  interativo?: boolean;
  rotulo?: string;
  as?: "section" | "article" | "div";
}) {
  const reduzir = useReducedMotion();
  const Comp = motion[as];
  const mover = (e: PointerEvent<HTMLElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - b.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - b.top}px`);
  };
  return (
    <Comp
      aria-label={rotulo}
      data-interativo={interativo}
      onPointerMove={interativo ? mover : undefined}
      initial={reduzir ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1], delay: reduzir ? 0 : indice * 0.06 }}
      className={cn("painel-card p-[22px]", className)}
    >
      {children}
    </Comp>
  );
}

export function CabecalhoCartao({
  icone,
  titulo,
  id,
  extra,
}: {
  icone: ReactNode;
  titulo: string;
  id: string;
  extra?: ReactNode;
}) {
  return (
    <div className="mb-[18px] flex items-center gap-3">
      <span className="grid size-[38px] flex-none place-items-center rounded-[10px] border border-orange/25 bg-orange/10 text-orange [&>svg]:size-[19px]">
        {icone}
      </span>
      <h2 id={id} className="m-0 font-display text-xl font-semibold tracking-tight">
        {titulo}
      </h2>
      {extra && <div className="ml-auto">{extra}</div>}
    </div>
  );
}
