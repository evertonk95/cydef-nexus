import { usePainel, useBoletim, useCursosDetalhados } from "@/lib/consultas";
import { primeiroNome, saudacao } from "@/lib/formato";
import type { Painel as DadosPainel } from "@/lib/painel";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { CartaoContinuar } from "@/components/painel/CartaoContinuar";
import { CartaoBoletim } from "@/components/painel/CartaoBoletim";
import { CartaoCompetencias } from "@/components/painel/CartaoCompetencias";
import { CartaoSequencia } from "@/components/painel/CartaoSequencia";
import { MatrizFormacao } from "@/components/painel/MatrizFormacao";
import { SemCadastro, FalhaCarregamento } from "./Estados";

/** Onde o aluno está, em uma frase. Sem aula em andamento, nenhuma frase. */
function ondeEsta(p: DadosPainel): string | null {
  const c = p.continuar;
  if (!c) return null;
  const lugar = c.modulo_ordem === 0 ? `na ${c.modulo_titulo}` : `no Módulo ${c.modulo_ordem}`;
  return `Você está ${lugar} de ${c.curso_titulo}.`;
}

export default function Painel() {
  const painel = usePainel();
  const boletim = useBoletim();
  const p = painel.data;
  const detalhes = useCursosDetalhados((p?.cursos ?? []).map((c) => c.slug));

  if (painel.isError) return <FalhaCarregamento tentar={() => void painel.refetch()} />;
  if (painel.isSuccess && p === null) return <SemCadastro />;

  // Boletim e Competências só entram quando têm o que mostrar. Para a grade não
  // pular quando o boletim chega, o painel espera as duas consultas.
  const pronto = p && !boletim.isPending ? p : null;
  const comBoletim = boletim.isError || (boletim.data?.length ?? 0) > 0;
  const comCompetencias = (p?.competencias.length ?? 0) > 0;
  const frase = p ? ondeEsta(p) : null;
  // A matriz some se nenhum curso trouxe módulos (por exemplo, falha ao carregar).
  const comMatriz = (p?.cursos.length ?? 0) > 0 && (detalhes.carregando || detalhes.cursos.length > 0);

  return (
    <div className="flex flex-col gap-14">
      <section aria-labelledby="h-ola" className="flex flex-col gap-1.5">
        <h1 id="h-ola" className="m-0 font-display text-[clamp(30px,3.4vw,40px)] leading-tight font-semibold tracking-tight">
          {p ? `${saudacao(new Date().getHours())}, ${primeiroNome(p.nome)}.` : "Carregando seu painel"}
        </h1>
        {frase && <p className="m-0 text-muted">{frase}</p>}
      </section>

      {!pronto ? (
        <div aria-busy="true" aria-label="Carregando o painel" className="flex flex-wrap gap-6">
          <div className="painel-card flex min-w-0 flex-[999_1_560px] flex-col gap-5 p-8">
            <Esqueleto className="h-4 w-1/2" />
            <Esqueleto className="h-9 w-3/4" />
            <Esqueleto className="h-1 w-2/3" />
            <Esqueleto className="h-12 w-44 rounded-[10px]" />
          </div>
          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4 rounded-2xl border border-line p-7">
            <Esqueleto className="h-7 w-40" />
            <Esqueleto className="h-24 w-full" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-start gap-6">
            <div className="min-w-0 flex-[999_1_560px]">
              <CartaoContinuar painel={pronto} />
            </div>
            <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
              <CartaoSequencia dias={pronto.dias_estudo} hoje={pronto.hoje} />
              {comCompetencias && <CartaoCompetencias competencias={pronto.competencias} />}
              {comBoletim && <CartaoBoletim itens={boletim.data ?? []} erro={boletim.isError} />}
            </div>
          </div>
          {comMatriz && (
            <MatrizFormacao
              titulo={pronto.formacoes[0]?.titulo ?? "Seus cursos"}
              cursos={detalhes.cursos}
              carregando={detalhes.carregando}
              atual={pronto.continuar ? { curso_slug: pronto.continuar.curso_slug, aula_numero: pronto.continuar.aula_numero } : null}
            />
          )}
        </>
      )}
    </div>
  );
}
