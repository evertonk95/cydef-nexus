import { Link } from "react-router";
import { CheckCircle2 } from "lucide-react";
import { useCursosDetalhados, usePainel } from "@/lib/consultas";
import { resumoDoCurso } from "@/lib/aula";
import { fracao, percentual } from "@/lib/formato";
import { Barra } from "@/components/ui/Barra";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { FalhaCarregamento, SemCadastro } from "./Estados";

export default function MeusCursos() {
  const painel = usePainel();
  const cursos = painel.data?.cursos;
  const detalhes = useCursosDetalhados((cursos ?? []).map((c) => c.slug)).cursos;
  // Curso com módulo ainda sem aula não é "Concluído": é "Em dia".
  const emProducao = new Map(detalhes.map((d) => [d.slug, resumoDoCurso(d).emProducao]));
  if (painel.isError) return <FalhaCarregamento tentar={() => void painel.refetch()} />;
  if (painel.isSuccess && painel.data === null) return <SemCadastro />;

  return (
    <>
      <h1 className="m-0 mb-8 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Meus cursos</h1>
      {!cursos ? (
        <div aria-busy="true" aria-label="Carregando os cursos" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="painel-card flex flex-col gap-4 p-6">
              <Esqueleto className="h-6 w-2/3" />
              <Esqueleto className="h-4 w-full" />
              <Esqueleto className="h-1 w-full" />
            </div>
          ))}
        </div>
      ) : cursos.length === 0 ? (
        <section className="painel-card max-w-2xl p-7">
          <h2 className="m-0 mb-2 font-display text-xl font-semibold">Nenhum curso publicado ainda</h2>
          <p className="m-0 leading-relaxed text-muted">
            Sua inscrição já está garantida. Os cursos aparecem aqui assim que as primeiras aulas forem publicadas, e avisamos por e-mail.
          </p>
        </section>
      ) : (
        <ul className="m-0 grid list-none gap-5 p-0 md:grid-cols-2 xl:grid-cols-3">
          {cursos.map((c) => {
            const pct = percentual(c.concluidas, c.total);
            const emDia = c.total > 0 && c.concluidas >= c.total;
            const completo = emDia && !emProducao.get(c.slug);
            return (
              <li key={c.slug}>
                <article className="painel-card flex h-full flex-col p-6">
                  <p className={completo ? "m-0 mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-ok" : "m-0 mb-3 text-[13px] font-medium text-muted"}>
                    {completo && <CheckCircle2 className="size-3.5" aria-hidden="true" />}
                    {completo ? "Concluído" : emDia ? "Em dia, novas aulas em produção" : c.concluidas > 0 ? "Em andamento" : "Não iniciado"}
                  </p>
                  <h2 className="m-0 mb-1.5 font-display text-xl font-semibold">{c.titulo}</h2>
                  <p className="m-0 mb-5 text-sm text-muted">{fracao(c.concluidas, c.total, "aula", "aulas")}</p>
                  <Barra valor={pct} rotulo={`Progresso em ${c.titulo}`} cor={completo ? "verde" : "laranja"} className="mt-auto mb-5" />
                  <Link
                    to={`/cursos/${c.slug}`}
                    className="inline-flex h-11 items-center self-start rounded-[10px] border border-line-hi px-4 font-semibold transition-colors duration-150 hover:border-muted"
                  >
                    {c.concluidas > 0 ? "Continuar" : "Começar"}
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
