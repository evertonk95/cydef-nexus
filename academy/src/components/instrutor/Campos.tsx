import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, VideoOff } from "lucide-react";
import { cn } from "@/lib/cn";

/** Campos do painel do instrutor: rótulo visível, ajuda e contador quando há limite. */

const caixa =
  "w-full rounded-[10px] border border-line-hi bg-bg px-3.5 py-2.5 text-[15px] text-ink placeholder:text-dim transition-colors duration-150 hover:border-muted focus:border-orange-hi focus:outline-none disabled:opacity-60";

function Moldura({ id, rotulo, ajuda, contagem, children }: { id: string; rotulo: string; ajuda?: ReactNode; contagem?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {rotulo}
        </label>
        {contagem && <span className="ml-auto text-xs text-dim">{contagem}</span>}
      </div>
      {children}
      {ajuda && (
        <p id={`${id}-ajuda`} className="m-0 text-[13px] leading-snug text-muted">
          {ajuda}
        </p>
      )}
    </div>
  );
}

export function Campo({ rotulo, ajuda, limite, className, ...resto }: InputHTMLAttributes<HTMLInputElement> & { rotulo: string; ajuda?: ReactNode; limite?: number }) {
  const id = useId();
  const tamanho = typeof resto.value === "string" ? resto.value.length : 0;
  return (
    <Moldura id={id} rotulo={rotulo} ajuda={ajuda} contagem={limite ? `${tamanho}/${limite}` : undefined}>
      <input id={id} maxLength={limite} aria-describedby={ajuda ? `${id}-ajuda` : undefined} className={cn(caixa, "h-11", className)} {...resto} />
    </Moldura>
  );
}

export function AreaTexto({ rotulo, ajuda, limite, className, ...resto }: TextareaHTMLAttributes<HTMLTextAreaElement> & { rotulo: string; ajuda?: ReactNode; limite?: number }) {
  const id = useId();
  const tamanho = typeof resto.value === "string" ? resto.value.length : 0;
  return (
    <Moldura id={id} rotulo={rotulo} ajuda={ajuda} contagem={limite ? `${tamanho}/${limite}` : undefined}>
      <textarea id={id} maxLength={limite} aria-describedby={ajuda ? `${id}-ajuda` : undefined} className={cn(caixa, "min-h-28 resize-y leading-relaxed", className)} {...resto} />
    </Moldura>
  );
}

export function Selecao({ rotulo, ajuda, className, children, ...resto }: SelectHTMLAttributes<HTMLSelectElement> & { rotulo: string; ajuda?: ReactNode }) {
  const id = useId();
  return (
    <Moldura id={id} rotulo={rotulo} ajuda={ajuda}>
      <select id={id} aria-describedby={ajuda ? `${id}-ajuda` : undefined} className={cn(caixa, "h-11", className)} {...resto}>
        {children}
      </select>
    </Moldura>
  );
}

export function Marcador({ rotulo, ajuda, className, ...resto }: InputHTMLAttributes<HTMLInputElement> & { rotulo: string; ajuda?: ReactNode }) {
  const id = useId();
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input id={id} type="checkbox" aria-describedby={ajuda ? `${id}-ajuda` : undefined} className="mt-0.5 size-[18px] shrink-0 accent-ink" {...resto} />
      <div>
        <label htmlFor={id} className="text-[15px] font-medium text-ink">
          {rotulo}
        </label>
        {ajuda && (
          <p id={`${id}-ajuda`} className="m-0 mt-0.5 text-[13px] leading-snug text-muted">
            {ajuda}
          </p>
        )}
      </div>
    </div>
  );
}

/** Erro do formulário, anunciado para leitor de tela. */
export function ErroFormulario({ erro }: { erro?: Error | null }) {
  if (!erro) return null;
  return (
    <p role="alert" className="m-0 flex items-start gap-2 rounded-[10px] border border-bad/40 bg-bad/10 px-3.5 py-2.5 text-sm text-ink">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-bad" aria-hidden="true" />
      {erro.message}
    </p>
  );
}

/** Situação de uma aula ou questão como o aluno vê. */
export function Situacao({ estado }: { estado: "publicada" | "publicado" | "rascunho" | "sem_video" }) {
  if (estado === "publicada" || estado === "publicado")
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ok">
        <CheckCircle2 className="size-3.5" aria-hidden="true" />
        {estado === "publicada" ? "Publicada" : "Publicado"}
      </span>
    );
  if (estado === "sem_video")
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-warn">
        <VideoOff className="size-3.5" aria-hidden="true" />
        Sem vídeo
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted">
      <CircleDashed className="size-3.5" aria-hidden="true" />
      Rascunho
    </span>
  );
}
