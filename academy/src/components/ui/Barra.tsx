import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * Barra de progresso animada por transform (scaleX), nunca por largura.
 */
export function Barra({
  valor,
  rotulo,
  cor = "laranja",
  className,
  atraso = 0.2,
}: {
  valor: number;
  rotulo: string;
  cor?: "laranja" | "verde";
  className?: string;
  atraso?: number;
}) {
  const reduzir = useReducedMotion();
  const v = Math.max(0, Math.min(100, Math.round(valor)));
  return (
    <div
      role="progressbar"
      aria-label={rotulo}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      className={cn("relative h-2 overflow-hidden rounded-full bg-line", className)}
    >
      <motion.span
        className={cn(
          "absolute inset-0 origin-left rounded-full",
          cor === "laranja"
            ? "bg-[linear-gradient(90deg,#c2410c,var(--color-orange),var(--color-orange-hi))] shadow-[0_0_14px_rgba(249,115,22,0.6)]"
            : "bg-[linear-gradient(90deg,#15803d,var(--color-ok))]",
        )}
        initial={reduzir ? false : { scaleX: 0 }}
        animate={{ scaleX: v / 100 }}
        transition={{ duration: reduzir ? 0 : 0.9, ease: [0.2, 0.8, 0.2, 1], delay: reduzir ? 0 : atraso }}
      />
    </div>
  );
}
