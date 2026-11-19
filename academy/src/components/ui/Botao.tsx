import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variante = "primario" | "contorno" | "fantasma";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-[10px] font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

/** O laranja é só do botão primário: a ação principal da tela. */
const variantes: Record<Variante, string> = {
  primario: "bg-orange text-orange-ink hover:bg-orange-hi",
  contorno: "border border-line-hi bg-transparent text-ink hover:border-muted",
  fantasma: "border border-line-hi bg-transparent text-ink hover:border-muted",
};

export interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(function Botao(
  { variante = "primario", className, children, type = "button", ...resto },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cn(base, variantes[variante], className)} {...resto}>
      {children}
    </button>
  );
});
