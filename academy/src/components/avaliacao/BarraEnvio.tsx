import { Send } from "lucide-react";
import { Botao } from "@/components/ui/Botao";

/** Barra fixa no rodapé: quantas faltam e o botão de enviar. */
export function BarraEnvio({
  respondidas,
  total,
  pronto,
  enviando,
  erro,
  rotulo,
  tipo = "submit",
  onClick,
}: {
  respondidas: number;
  total: number;
  pronto: boolean;
  enviando: boolean;
  erro: string | null;
  rotulo: string;
  tipo?: "submit" | "button";
  onClick?: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-1 mt-6 border-t border-line bg-bg px-1 py-4">
      <div className="flex flex-wrap items-center gap-4">
        <p className="m-0 text-[13px] text-muted" aria-live="polite">
          {total > 0 ? `${respondidas} de ${total} respondidas` : ""}
        </p>
        <Botao type={tipo} onClick={onClick} disabled={!pronto || enviando} className="ml-auto px-5 py-3 text-[15px]">
          <Send className="size-4" aria-hidden="true" /> {enviando ? "Enviando..." : rotulo}
        </Botao>
      </div>
      {erro !== null && (
        <p role="alert" className="m-0 mt-3 text-[14px] text-warn">
          {erro || "Não deu para enviar. Confira a conexão e tente de novo; suas respostas continuam marcadas."}
        </p>
      )}
    </div>
  );
}
