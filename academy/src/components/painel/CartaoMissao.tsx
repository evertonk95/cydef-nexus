import { Link } from "react-router";
import { Lock, Search } from "lucide-react";
import { motivoBloqueio, type MissaoResumo } from "@/lib/missoes";
import { Etiquetas } from "@/components/missao/Cabecalho";

/** Próxima missão do aluno: liberada e ainda não concluída, ou a próxima a liberar. */
export function CartaoMissao({ missao: m }: { missao: MissaoResumo }) {
  const liberada = m.situacao === "liberada";
  return (
    <section aria-labelledby="h-missao" className="painel-card flex flex-col gap-3 p-7">
      <p className="m-0 text-sm text-muted">Próxima missão</p>
      <Etiquetas severidade={m.severidade} codigo={m.codigo} />
      <h2 id="h-missao" className="m-0 font-display text-[24px] leading-tight font-semibold tracking-tight">
        {m.titulo}
      </h2>
      <p className="m-0 line-clamp-3 max-w-[70ch] leading-relaxed text-muted">{m.briefing}</p>
      {liberada ? (
        <div className="mt-1">
          <Link
            to={`/missoes/${m.slug}`}
            className="inline-flex h-11 items-center gap-2.5 rounded-[10px] border border-line-hi px-5 font-semibold text-ink transition-colors duration-150 hover:border-muted"
          >
            <Search className="size-4" aria-hidden="true" /> Iniciar investigação
          </Link>
        </div>
      ) : (
        <p className="m-0 mt-1 flex items-center gap-2 text-sm text-muted">
          <Lock className="size-4 flex-none" aria-hidden="true" /> {motivoBloqueio(m)}
        </p>
      )}
    </section>
  );
}
