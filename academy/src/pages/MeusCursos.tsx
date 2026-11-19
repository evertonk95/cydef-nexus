import { Link } from "react-router";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { usePainel } from "@/lib/consultas";
import { fracao, percentual } from "@/lib/formato";
import { Cartao } from "@/components/ui/Cartao";
import { Barra } from "@/components/ui/Barra";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { FalhaCarregamento, SemCadastro } from "./Estados";

export default function MeusCursos() {
  const painel = usePainel();
  if (painel.isError) return <FalhaCarregamento tentar={() => void painel.refetch()} />;
  if (painel.isSuccess && painel.data === null) return <SemCadastro />;
  const cursos = painel.data?.cursos;

  return (
    <>
      <header className="mb-7">
        <p className="rotulo-mono m-0 mb-2">Sua biblioteca</p>
        <h1 className="m-0 font-display text-[clamp(28px,3vw,40px)] font-bold tracking-tight">Meus cursos</h1>
      </header>
      {!cursos ? (
        <div aria-busy="true" aria-label="Carregando os cursos" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="painel-card flex flex-col gap-4 p-6">
              <Esqueleto className="h-6 w-2/3" />
              <Esqueleto className="h-4 w-full" />
              <Esqueleto className="h-2 w-full" />
            </div>
          ))}
        </div>
      ) : cursos.length === 0 ? (
        <Cartao interativo={false} className="max-w-2xl">
          <BookOpen className="mb-3 size-8 text-orange" aria-hidden="true" />
          <h2 className="m-0 mb-2 font-display text-xl font-semibold">Nenhum curso publicado ainda</h2>
          <p className="m-0 leading-relaxed text-muted">
            Sua inscrição já está garantida. Os cursos aparecem aqui assim que as primeiras aulas forem publicadas, e avisamos por e-mail.
          </p>
        </Cartao>
      ) : (
        <ul className="m-0 grid list-none gap-5 p-0 md:grid-cols-2 xl:grid-cols-3">
          {cursos.map((c, i) => {
            const pct = percentual(c.concluidas, c.total);
            const completo = c.total > 0 && c.concluidas >= c.total;
            return (
              <li key={c.slug}>
                <Cartao indice={i} as="article" className="flex h-full flex-col">
                  <div className="mb-3 flex items-center gap-2">
                    {completo ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-ok/45 bg-ok/8 px-2.5 py-0.5 font-mono text-[11.5px] text-ok">
                        <CheckCircle2 className="size-3.5" aria-hidden="true" /> CONCLUÍDO
                      </span>
                    ) : (
                      <span className="rounded-full border border-orange/45 bg-orange/8 px-2.5 py-0.5 font-mono text-[11.5px] text-orange-hi">
                        {c.concluidas > 0 ? "EM ANDAMENTO" : "NÃO INICIADO"}
                      </span>
                    )}
                  </div>
                  <h2 className="m-0 mb-2 font-display text-xl font-semibold">{c.titulo}</h2>
                  <p className="m-0 mb-5 font-mono text-sm text-muted">
                    {fracao(c.concluidas, c.total, "aula", "aulas")}
                  </p>
                  <Barra valor={pct} rotulo={`Progresso em ${c.titulo}`} cor={completo ? "verde" : "laranja"} className="mt-auto mb-5" atraso={0.15 + i * 0.06} />
                  <Link
                    to={`/cursos/${c.slug}`}
                    className="inline-flex items-center gap-2 self-start rounded-xl border-[1.5px] border-orange bg-orange/5 px-4 py-2.5 font-semibold text-orange-hi transition-[gap,background-color] duration-200 hover:gap-3.5 hover:bg-orange/15"
                  >
                    {c.concluidas > 0 ? "Continuar" : "Começar"} <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Cartao>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
