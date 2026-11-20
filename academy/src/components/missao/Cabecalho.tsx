import type { ReactNode } from "react";
import { SEVERIDADE, type Severidade } from "@/lib/missoes";
import { cn } from "@/lib/cn";

const COR: Record<Severidade, string> = {
  critica: "border-bad bg-bad/15 text-bad",
  alta: "border-bad/60 text-bad",
  media: "border-warn/60 text-warn",
  baixa: "border-line-hi text-muted",
};

/** Etiquetas de um chamado de SOC: severidade, código e técnica do MITRE. */
export function Etiquetas({ severidade, codigo, mitre }: { severidade: Severidade; codigo: string; mitre?: string }) {
  return (
    <p className="m-0 flex flex-wrap items-center gap-2 font-mono text-[12.5px]">
      <span className={cn("rounded-md border px-2 py-0.5 font-semibold", COR[severidade])}>
        <span className="sr-only">Severidade </span>
        {SEVERIDADE[severidade]}
      </span>
      <span className="rounded-md border border-line-hi px-2 py-0.5 text-ink">{codigo}</span>
      {mitre && <span className="rounded-md border border-line-hi px-2 py-0.5 text-muted">{mitre}</span>}
    </p>
  );
}

/** Topo da missão: etiquetas, título, briefing e o que vier à direita (tempo, progresso). */
export function CabecalhoMissao({
  severidade,
  codigo,
  mitre,
  titulo,
  briefing,
  lado,
}: {
  severidade: Severidade;
  codigo: string;
  mitre: string;
  titulo: string;
  briefing: string;
  lado?: ReactNode;
}) {
  return (
    <header className="painel-card flex flex-wrap items-center gap-x-10 gap-y-6 p-6 sm:p-8">
      <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-3">
        <Etiquetas severidade={severidade} codigo={codigo} mitre={mitre} />
        <h1 className="m-0 font-display text-[clamp(28px,3.2vw,40px)] leading-tight font-semibold tracking-tight">{titulo}</h1>
        <p className="m-0 max-w-[75ch] text-[16px] leading-relaxed text-[#d6d6d6]">{briefing}</p>
      </div>
      {lado && <div className="flex-none">{lado}</div>}
    </header>
  );
}
