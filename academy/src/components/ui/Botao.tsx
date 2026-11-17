import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variante = "primario" | "contorno" | "fantasma";

const base =
  "relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl font-semibold transition-[transform,background-color,border-color,box-shadow] duration-200 ease-[var(--ease-out-soft)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none";

const variantes: Record<Variante, string> = {
  primario:
    "bg-[linear-gradient(180deg,var(--color-orange-hi),var(--color-orange)_55%,#ea580c)] text-orange-ink shadow-[0_10px_30px_-10px_rgba(249,115,22,0.85),inset_0_1px_0_rgba(255,255,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] enabled:hover:[&>.reflexo]:animate-[reflexo_900ms_var(--ease-out-soft)]",
  contorno:
    "border-[1.5px] border-orange bg-orange/5 text-orange-hi hover:bg-orange/15 hover:shadow-[0_0_24px_-4px_rgba(249,115,22,0.6)]",
  fantasma: "border border-line-hi bg-transparent text-ink hover:border-orange hover:bg-orange/5",
};

export interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  respirando?: boolean;
}

export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(function Botao(
  { variante = "primario", respirando = false, className, children, type = "button", ...resto },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(base, variantes[variante], respirando && "animate-[respirar_3.2s_ease-in-out_infinite]", className)}
      {...resto}
    >
      {variante === "primario" && (
        <span
          aria-hidden="true"
          className="reflexo pointer-events-none absolute inset-y-0 left-0 w-2/5 -translate-x-[120%] bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.55),transparent)]"
        />
      )}
      {children}
    </button>
  );
});
