import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/** Número que sobe contando até o valor (o texto final já existe para leitores de tela). */
export function Contador({ valor, sufixo = "", duracao = 0.9 }: { valor: number; sufixo?: string; duracao?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduzir = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduzir) {
      el.textContent = `${valor}${sufixo}`;
      return;
    }
    const controle = animate(0, valor, {
      duration: duracao,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => {
        el.textContent = `${Math.round(v)}${sufixo}`;
      },
    });
    return () => controle.stop();
  }, [valor, sufixo, duracao, reduzir]);
  return (
    <span>
      <span className="sr-only">{`${valor}${sufixo}`}</span>
      <span ref={ref} aria-hidden="true">
        {`${valor}${sufixo}`}
      </span>
    </span>
  );
}
