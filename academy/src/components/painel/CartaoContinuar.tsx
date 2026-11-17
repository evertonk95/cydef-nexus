import { Link } from "react-router";
import { BookOpenCheck, Play } from "lucide-react";
import { Cartao, CabecalhoCartao } from "@/components/ui/Cartao";
import { Barra } from "@/components/ui/Barra";
import { Contador } from "@/components/ui/Contador";
import { Capa } from "./Capa";
import { relogio } from "@/lib/formato";
import type { Painel } from "@/lib/painel";

export function CartaoContinuar({ painel }: { painel: Painel }) {
  const c = painel.continuar;
  if (!c) {
    const temCurso = painel.cursos.length > 0;
    return (
      <Cartao indice={0} rotulo="Continue de onde parou">
        <CabecalhoCartao id="h-continuar" titulo={temCurso ? "Tudo em dia" : "Seus cursos"} icone={<BookOpenCheck />} />
        <p className="m-0 leading-relaxed text-muted">
          {temCurso
            ? "Você concluiu todas as aulas publicadas dos seus cursos. Quando uma aula nova sair, ela aparece aqui."
            : "Os cursos da sua inscrição aparecem aqui assim que as primeiras aulas forem publicadas. Avisamos por e-mail."}
        </p>
      </Cartao>
    );
  }
  const numero = String(c.aula_numero).padStart(2, "0");
  return (
    <Cartao indice={0} rotulo="Continue de onde parou">
      <CabecalhoCartao id="h-continuar" titulo="Continue de onde parou" icone={<Play />} />
      <Link to={`/cursos/${c.curso_slug}`} className="group block rounded-xl" aria-label={`Abrir o curso ${c.curso_titulo} na aula ${numero}, ${c.aula_titulo}`}>
        <Capa curso={c.curso_titulo} rotuloTempo={c.posicao_seg > 0 ? relogio(c.posicao_seg) : relogio(c.duracao_seg)} />
      </Link>
      <p className="rotulo-mono mt-4 mb-1">
        {c.curso_titulo} · Módulo {c.modulo_ordem}
      </p>
      <h3 className="m-0 text-xl font-semibold tracking-tight">
        Aula {numero}: {c.aula_titulo}
      </h3>
      <div className="my-4 flex items-center gap-3.5">
        <Barra valor={c.progresso_curso} rotulo={`Progresso no curso ${c.curso_titulo}`} className="flex-1" />
        <span className="min-w-10 text-right font-mono text-sm text-muted">
          <Contador valor={c.progresso_curso} sufixo="%" />
        </span>
      </div>
      <Link
        to={`/cursos/${c.curso_slug}`}
        className="group/cta relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-[linear-gradient(180deg,var(--color-orange-hi),var(--color-orange)_55%,#ea580c)] p-4 text-lg font-bold text-orange-ink transition-transform duration-200 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 active:translate-y-0 animate-[respirar_3.2s_ease-in-out_infinite]"
      >
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-2/5 -translate-x-[120%] bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.55),transparent)] group-hover/cta:animate-[reflexo_900ms_var(--ease-out-soft)]" />
        <Play className="size-5" aria-hidden="true" />
        Continuar
      </Link>
    </Cartao>
  );
}
