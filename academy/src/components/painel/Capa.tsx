import { Play } from "lucide-react";

/**
 * Capa ilustrativa da aula enquanto não há miniatura própria do vídeo:
 * grade de central de operações, sinal correndo e o nome do curso.
 */
export function Capa({ curso, rotuloTempo }: { curso: string; rotuloTempo?: string }) {
  return (
    <div className="relative aspect-[16/8.4] overflow-hidden rounded-xl border border-line bg-[#09090a]">
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(500px_220px_at_80%_-10%,rgba(249,115,22,0.22),transparent_60%)]" />
      <svg aria-hidden="true" viewBox="0 0 300 100" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-1/2 w-full">
        <defs>
          <linearGradient id="capa-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f97316" stopOpacity=".32" />
            <stop offset="1" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 80 L30 70 L60 74 L90 52 L120 62 L150 36 L180 50 L210 30 L240 44 L270 22 L300 32 L300 100 L0 100Z" fill="url(#capa-area)" />
        <path d="M0 80 L30 70 L60 74 L90 52 L120 62 L150 36 L180 50 L210 30 L240 44 L270 22 L300 32" fill="none" stroke="#f97316" strokeWidth="2" className="[stroke-dasharray:600] [stroke-dashoffset:600] animate-[desenhar_2.2s_0.3s_var(--ease-out-soft)_forwards] motion-reduce:[stroke-dashoffset:0]" />
      </svg>
      <p className="absolute top-3 left-4 m-0 font-mono text-[11px] tracking-[0.14em] text-muted uppercase">{curso}</p>
      <span aria-hidden="true" className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white/90 bg-black/55 backdrop-blur-sm transition-[transform,background-color,border-color] duration-200 group-hover:scale-105 group-hover:border-orange group-hover:bg-orange before:absolute before:-inset-0.5 before:rounded-full before:border-2 before:border-orange/70 before:animate-[pulso-anel_2.6s_var(--ease-out-soft)_infinite] motion-reduce:before:hidden">
        <Play className="ml-1 size-5 fill-white text-white" />
      </span>
      {rotuloTempo && (
        <span className="absolute right-2.5 bottom-2.5 rounded-md border border-[#2a2a2e] bg-black/75 px-2 py-0.5 font-mono text-xs">{rotuloTempo}</span>
      )}
    </div>
  );
}
