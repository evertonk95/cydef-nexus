import { Link } from "react-router";
import { Award, Lock } from "lucide-react";
import { motivoBloqueio, useMissoes, type MissaoResumo } from "@/lib/missoes";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { Etiquetas } from "@/components/missao/Cabecalho";
import { FalhaCarregamento } from "./Estados";

/** Missões de SOC dos cursos do aluno (fase 15). */
export default function Missoes() {
  const lista = useMissoes();
  return (
    <>
      <h1 className="m-0 mb-2 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Missões de SOC</h1>
      <p className="m-0 mb-10 max-w-2xl leading-relaxed text-muted">
        Casos práticos no fim dos cursos: você examina as evidências, decide o que aconteceu e vê a correção com a explicação.
      </p>
      {lista.isError ? (
        <FalhaCarregamento tentar={() => void lista.refetch()} />
      ) : !lista.data ? (
        <div aria-busy="true" aria-label="Carregando as missões" className="grid gap-5 md:grid-cols-2">
          <Esqueleto className="h-44 w-full rounded-2xl" />
          <Esqueleto className="h-44 w-full rounded-2xl" />
        </div>
      ) : lista.data.length === 0 ? (
        <div className="painel-card max-w-2xl p-6">
          <p className="m-0 text-muted">Seus cursos ainda não têm missão publicada. Quando tiverem, ela aparece aqui e no painel.</p>
        </div>
      ) : (
        <ul className="m-0 grid list-none gap-5 p-0 md:grid-cols-2">
          {lista.data.map((m) => (
            <li key={m.id}>
              <CartaoLista m={m} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function CartaoLista({ m }: { m: MissaoResumo }) {
  const liberada = m.situacao === "liberada";
  return (
    <article aria-labelledby={`m-${m.id}`} className="painel-card relative flex h-full flex-col gap-3 p-6">
      <Etiquetas severidade={m.severidade} codigo={m.codigo} mitre={m.mitre} />
      <h2 id={`m-${m.id}`} className="m-0 font-display text-xl font-semibold">
        <Link to={`/missoes/${m.slug}`} className="after:absolute after:inset-0 hover:text-orange-hi">
          {m.titulo}
        </Link>
      </h2>
      <p className="m-0 text-sm text-muted">{m.curso_titulo}</p>
      <p className="m-0 mt-auto flex items-center gap-2 pt-2 text-sm">
        {m.aprovada ? (
          <span className="inline-flex items-center gap-1.5 text-ok">
            <Award className="size-4" aria-hidden="true" />
            Concluída com {m.melhor_nota}%{m.selo ? `, selo ${m.selo}` : ""}
          </span>
        ) : liberada ? (
          <span className="text-ink">{m.melhor_nota != null ? `Liberada, sua melhor nota é ${m.melhor_nota}%` : "Liberada para começar"}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-muted">
            <Lock className="size-4" aria-hidden="true" />
            {motivoBloqueio(m)}
          </span>
        )}
      </p>
    </article>
  );
}
