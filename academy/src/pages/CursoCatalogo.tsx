import { Link, useParams } from "react-router";
import { ChevronLeft } from "lucide-react";
import { usePainel } from "@/lib/consultas";
import { usePortal } from "@/lib/portal";
import { NIVEL, type CursoDetalhe } from "@/lib/cursos";
import { duracao, contagem } from "@/lib/formato";
import { cargaHoraria, useCatalogo, type CursoCatalogo as Curso } from "@/lib/vitrine";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { SobreCurso } from "@/components/curso/SobreCurso";
import { FalhaCarregamento, NaoEncontrado } from "./Estados";
import { AcaoCurso, Preco } from "./Catalogo";

/** O curso no catálogo do portal: sobre, ementa, quem ensina e a compra. */
export default function CursoCatalogo() {
  const { slug = "" } = useParams();
  const catalogo = useCatalogo();
  const painel = usePainel();
  const { sessao } = usePortal();
  if (catalogo.isError) return <FalhaCarregamento tentar={() => void catalogo.refetch()} />;
  if (!catalogo.data)
    return (
      <div aria-busy="true" aria-label="Carregando o curso" className="flex flex-col gap-4">
        <Esqueleto className="h-9 w-80 max-w-full" />
        <Esqueleto className="h-40 w-full" />
      </div>
    );
  const curso = catalogo.data.cursos.find((c) => c.slug === slug);
  if (!curso) return <NaoEncontrado />;
  const meu = (painel.data?.cursos ?? []).some((c) => c.slug === slug);
  const horas = cargaHoraria(curso.carga_horaria_h);

  return (
    <>
      <Link to="/catalogo" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronLeft className="size-4" aria-hidden="true" /> Catálogo
      </Link>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <p className="m-0 mb-3 text-[13px] font-medium text-muted">
            {[NIVEL[curso.nivel], horas, curso.modulos.length > 0 ? contagem(curso.modulos.length, "módulo", "módulos") : null]
              .filter(Boolean)
              .join(", ")}
          </p>
          <h1 className="m-0 mb-4 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">{curso.titulo}</h1>
          <p className="m-0 max-w-2xl text-lg leading-relaxed text-[#d4d4d4]">{curso.descricao}</p>

          <SobreCurso curso={comoDetalhe(curso)} />
          <Ementa curso={curso} />
        </div>

        <aside aria-label="Matrícula" className="painel-card flex h-fit flex-col gap-4 p-6 lg:sticky lg:top-24">
          {meu ? (
            <p className="m-0 text-[15px] font-medium text-ok">Você já tem este curso.</p>
          ) : (
            <Preco curso={curso} grande />
          )}
          <AcaoCurso curso={curso} meu={meu} detalhe />
          {!meu && curso.situacao === "a_venda" && sessao?.user.email && (
            <p className="m-0 text-[13px] leading-snug text-muted">
              A Hotmart abre com o e-mail <span className="text-ink">{sessao.user.email}</span>. Compre com ele para o curso aparecer na sua conta.
            </p>
          )}
        </aside>
      </div>
    </>
  );
}

function Ementa({ curso }: { curso: Curso }) {
  if (curso.modulos.length === 0) return null;
  return (
    <section aria-labelledby="h-ementa" className="mt-10">
      <h2 id="h-ementa" className="m-0 mb-4 font-display text-xl font-semibold">
        Ementa
      </h2>
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {curso.modulos.map((m) => (
          <li key={m.ordem} className="rounded-xl border border-line px-5 py-4">
            <h3 className="m-0 font-display text-[17px] font-semibold">
              Módulo {m.ordem}: {m.titulo}
            </h3>
            {m.resumo && <p className="m-0 mt-1.5 text-sm leading-relaxed text-muted">{m.resumo}</p>}
            {m.aulas.length > 0 && (
              <ol className="m-0 mt-3 flex list-none flex-col gap-1.5 p-0">
                {m.aulas.map((a, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[#d4d4d4]">
                    <span className="flex-1">{a.titulo}</span>
                    <span className="text-dim">{duracao(a.duracao_seg)}</span>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** O bloco "Sobre o curso" do portal lê o formato do curso do aluno. */
function comoDetalhe(c: Curso): CursoDetalhe {
  return {
    slug: c.slug,
    titulo: c.titulo,
    descricao: c.descricao,
    nivel: c.nivel,
    gratuito: false,
    ordem: 0,
    matriculado: false,
    objetivos: c.objetivos,
    publico: c.publico,
    pre_requisitos: c.pre_requisitos,
    instrutores: c.instrutores.map((i, n) => ({ ...i, id: `${c.slug}-${n}` })),
    modulos: [],
  };
}
