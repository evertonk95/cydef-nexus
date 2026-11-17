import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const SIMBOLOS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*<>/";

/**
 * Texto que se "decodifica" ao aparecer, como saída de terminal. O texto real
 * fica acessível o tempo todo para leitores de tela.
 */
export function TextoDecodificado({ texto, atraso = 0 }: { texto: string; atraso?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduzir = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduzir) return;
    let raf = 0;
    const inicio = performance.now() + atraso;
    const dur = Math.min(1200, 26 * texto.length);
    const sorteio = () => SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)] ?? "#";
    const passo = (agora: number) => {
      if (agora < inicio) {
        el.textContent = texto.replace(/\S/g, sorteio);
        raf = requestAnimationFrame(passo);
        return;
      }
      const k = Math.min(1, (agora - inicio) / dur);
      const corte = Math.floor(texto.length * k);
      let saida = "";
      for (let i = 0; i < texto.length; i += 1) {
        const ch = texto[i] ?? "";
        saida += i < corte || ch === " " ? ch : sorteio();
      }
      el.textContent = saida;
      if (k < 1) raf = requestAnimationFrame(passo);
      else el.textContent = texto;
    };
    raf = requestAnimationFrame(passo);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = texto;
    };
  }, [texto, atraso, reduzir]);
  return (
    <>
      <span className="sr-only">{texto}</span>
      <span ref={ref} aria-hidden="true">
        {texto}
      </span>
    </>
  );
}
