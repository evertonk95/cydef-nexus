import { Link } from "react-router";
import { caminhoAula, numeroAula } from "@/lib/aula";
import { contagem } from "@/lib/formato";
import { cn } from "@/lib/cn";
import type { CursoDetalhe } from "@/lib/cursos";
import { Esqueleto } from "@/components/ui/Esqueleto";

type Estado = "concluida" | "atual" | "disponivel";

const BLOCO = "flex min-h-16 flex-col gap-1 rounded-md px-2.5 py-2 text-[13px] leading-snug";

const ESTILO: Record<Estado, string> = {
  concluida: "border border-[#2e7d4f] bg-[#12301f] text-[#e7f7ec]",
  atual: "border-2 border-orange bg-[#1a0f06] text-ink",
  disponivel: "border border-line-hi bg-panel text-[#e5e5e5] transition-colors duration-150 hover:border-muted",
};

const NUMERO: Record<Estado, string> = {
  concluida: "text-[#86efac]",
  atual: "text-orange-hi",
  disponivel: "text-muted",
};

const NOME: Record<Estado, string> = {
  concluida: "concluída",
  atual: "você está aqui",
  disponivel: "disponível",
};

function resumo(curso: CursoDetalhe): string {
  const aulas = curso.modulos.flatMap((m) => m.aulas);
  if (aulas.length === 0) return "em produção";
  const feitas = aulas.filter((a) => a.concluida).length;
  return `${feitas} de ${contagem(aulas.length, "aula publicada concluída", "aulas publicadas concluídas")}`;
}

/**
 * Matriz da formação, inspirada na matriz do MITRE ATT&CK: cada coluna é um
 * módulo e cada bloco é uma aula. Módulo ainda sem aula publicada aparece
 * tracejado, sem inventar quantas aulas ele vai ter.
 */
export function MatrizFormacao({
  titulo,
  cursos,
  carregando,
  atual,
}: {
  titulo: string;
  cursos: CursoDetalhe[];
  carregando: boolean;
  atual: { curso_slug: string; aula_numero: number } | null;
}) {
  const ordenados = [...cursos].sort((a, b) => a.ordem - b.ordem);
  return (
    <section aria-labelledby="h-matriz" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[60ch]">
          <h2 id="h-matriz" className="m-0 font-display text-[28px] leading-tight font-semibold tracking-tight">
            {titulo}
          </h2>
          <p className="m-0 mt-1.5 text-muted">Cada coluna é um módulo e cada bloco é uma aula. Abra qualquer aula disponível.</p>
        </div>
        <ul aria-label="Legenda" className="m-0 flex list-none flex-wrap gap-4 p-0 text-[13px] text-muted">
          <li className="flex items-center gap-2"><span className="size-3.5 rounded-[3px] border border-[#2e7d4f] bg-[#12301f]" />Concluída</li>
          <li className="flex items-center gap-2"><span className="size-3.5 rounded-[3px] border-2 border-orange bg-[#1a0f06]" />Você está aqui</li>
          <li className="flex items-center gap-2"><span className="size-3.5 rounded-[3px] border border-line-hi bg-panel" />Disponível</li>
          <li className="flex items-center gap-2"><span className="size-3.5 rounded-[3px] border border-dashed border-[#4a4a4a]" />A publicar</li>
        </ul>
      </div>

      {carregando && ordenados.length === 0 ? (
        <div aria-busy="true" aria-label="Carregando a formação" className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex w-[164px] flex-col gap-1.5">
              <Esqueleto className="h-10 w-full" />
              <Esqueleto className="h-16 w-full rounded-md" />
              <Esqueleto className="h-16 w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex w-max gap-8">
            {ordenados.map((curso, i) => (
              <div key={curso.slug} className={cn("flex flex-col gap-3.5", i > 0 && "border-l border-line pl-8")}>
                <div className="flex items-baseline gap-2.5">
                  <h3 className="m-0 font-display text-[17px] font-semibold">
                    <Link to={`/cursos/${curso.slug}`} className="hover:underline hover:underline-offset-4">{curso.titulo}</Link>
                  </h3>
                  <span className="text-[13px] text-muted">{resumo(curso)}</span>
                </div>
                <ol className="m-0 flex list-none items-start gap-2 p-0">
                  {curso.modulos.map((m) => (
                    <li key={m.id} className="flex w-[164px] flex-col gap-1.5">
                      <p className="m-0 mb-1 flex h-[52px] items-end border-b border-line pb-2 text-[13px] leading-snug font-semibold text-[#d4d4d4]"><span className="line-clamp-2">{m.titulo}</span></p>
                      {m.aulas.length === 0 ? (
                        <span className={cn(BLOCO, "justify-center border border-dashed border-[#4a4a4a] text-dim")}>A publicar</span>
                      ) : (
                        m.aulas.map((a, i) => {
                          const estado: Estado =
                            atual && atual.curso_slug === curso.slug && atual.aula_numero === a.numero ? "atual" : a.concluida ? "concluida" : "disponivel";
                          const numero = numeroAula(i + 1);
                          return (
                            <Link
                              key={a.id}
                              to={caminhoAula(curso.slug, a.numero)}
                              aria-label={`Aula ${numero}: ${a.titulo}, ${NOME[estado]}`}
                              aria-current={estado === "atual" ? "step" : undefined}
                              className={cn(BLOCO, ESTILO[estado])}
                            >
                              <span className={cn("text-[11px]", NUMERO[estado])}>{numero}</span>
                              <span>{a.titulo}</span>
                              {estado === "atual" && <span className="text-[11px] font-semibold text-orange-hi">Você está aqui</span>}
                            </Link>
                          );
                        })
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
