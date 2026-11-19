import { cn } from "@/lib/cn";

/** Barra de progresso fina e estática. Laranja para o que está em curso, verde para concluído. */
export function Barra({
  valor,
  rotulo,
  cor = "laranja",
  className,
}: {
  valor: number;
  rotulo: string;
  cor?: "laranja" | "verde";
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(valor)));
  return (
    <div
      role="progressbar"
      aria-label={rotulo}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
      className={cn("relative h-1 overflow-hidden rounded-full bg-line", className)}
    >
      <span
        className={cn("absolute inset-0 origin-left rounded-full", cor === "laranja" ? "bg-orange" : "bg-ok")}
        style={{ transform: `scaleX(${v / 100})` }}
      />
    </div>
  );
}
