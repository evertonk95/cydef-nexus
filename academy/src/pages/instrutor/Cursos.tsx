import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { chamar, NIVEIS, sugerirSlug, useAcao, useCursosAdm, useEu, type CursoAdm, type Nivel } from "@/lib/instrutor";
import { contagem } from "@/lib/formato";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { AreaTexto, Campo, ErroFormulario, Selecao, Situacao } from "@/components/instrutor/Campos";
import { FalhaCarregamento } from "../Estados";

export default function CursosInstrutor() {
  const eu = useEu();
  const cursos = useCursosAdm();
  const [novo, setNovo] = useState(false);

  if (cursos.isError) return <FalhaCarregamento tentar={() => void cursos.refetch()} />;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="m-0 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Cursos</h1>
        {eu.papel === "admin" && !novo && (
          <Botao className="ml-auto h-11 px-4" onClick={() => setNovo(true)}>
            <Plus className="size-4" aria-hidden="true" /> Novo curso
          </Botao>
        )}
      </div>

      {novo && <NovoCurso fechar={() => setNovo(false)} />}

      {!cursos.data ? (
        <div aria-busy="true" aria-label="Carregando os cursos" className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Esqueleto key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : cursos.data.length === 0 ? (
        <section className="painel-card max-w-2xl p-7">
          <h2 className="m-0 mb-2 font-display text-xl font-semibold">Nenhum curso ainda</h2>
          <p className="m-0 leading-relaxed text-muted">
            {eu.papel === "admin" ? "Crie o primeiro curso para começar a montar módulos e aulas." : "Peça ao admin para atribuir um curso a você."}
          </p>
        </section>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {cursos.data.map((c) => (
            <li key={c.slug}>
              <Link
                to={`/instrutor/cursos/${c.slug}`}
                className="painel-card group flex flex-wrap items-center gap-x-8 gap-y-3 p-5 transition-colors duration-150 hover:border-line-hi sm:p-6"
              >
                <div className="min-w-0 flex-1 basis-72">
                  <div className="mb-1 flex items-center gap-3">
                    <h2 className="m-0 truncate font-display text-xl font-semibold group-hover:text-orange-hi">{c.titulo}</h2>
                  </div>
                  <p className="m-0 text-sm text-muted">
                    {NIVEIS.find((n) => n.valor === c.nivel)?.rotulo}, {c.gratuito ? "gratuito" : "pago"}
                  </p>
                </div>
                <dl className="m-0 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <Numero rotulo="Aulas publicadas" valor={`${c.aulas_publicadas} de ${c.aulas}`} />
                  <Numero rotulo="Questões publicadas" valor={`${c.questoes_publicadas} de ${c.questoes}`} />
                  {c.aulas_sem_video > 0 && <Numero rotulo="Sem vídeo" valor={contagem(c.aulas_sem_video, "aula", "aulas")} alerta />}
                </dl>
                <div className="w-28 text-right">
                  <Situacao estado={c.publicado ? "publicado" : "rascunho"} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Numero({ rotulo, valor, alerta }: { rotulo: string; valor: string; alerta?: boolean }) {
  return (
    <div>
      <dt className="text-[13px] text-dim">{rotulo}</dt>
      <dd className={alerta ? "m-0 font-medium text-warn" : "m-0 font-medium text-ink"}>{valor}</dd>
    </div>
  );
}

function NovoCurso({ fechar }: { fechar: () => void }) {
  const navegar = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTocado, setSlugTocado] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [nivel, setNivel] = useState<Nivel>("iniciante");
  const criar = useAcao(
    (sb, dados: Record<string, unknown>) => chamar<CursoAdm>(sb, "academy_adm_salvar_curso", { p_slug: null, p_dados: dados }),
    (c) => navegar(`/instrutor/cursos/${c.slug}`),
  );
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    criar.mutate({ slug: slugTocado ? slug : sugerirSlug(titulo), titulo, descricao, nivel, gratuito: true });
  };

  return (
    <form onSubmit={enviar} aria-labelledby="novo-curso" className="painel-card mb-8 flex max-w-3xl flex-col gap-5 p-6">
      <h2 id="novo-curso" className="m-0 font-display text-xl font-semibold">
        Novo curso
      </h2>
      <Campo rotulo="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} limite={80} required minLength={2} autoFocus />
      <Campo
        rotulo="Endereço"
        value={slugTocado ? slug : sugerirSlug(titulo)}
        onChange={(e) => {
          setSlugTocado(true);
          setSlug(e.target.value);
        }}
        limite={60}
        required
        ajuda={`O curso fica em academy.cydef.com.br/cursos/${(slugTocado ? slug : sugerirSlug(titulo)) || "endereco"}. Não muda depois de criado.`}
      />
      <AreaTexto rotulo="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} limite={600} />
      <Selecao rotulo="Nível" value={nivel} onChange={(e) => setNivel(e.target.value as Nivel)}>
        {NIVEIS.map((n) => (
          <option key={n.valor} value={n.valor}>
            {n.rotulo}
          </option>
        ))}
      </Selecao>
      <p className="m-0 text-[13px] text-muted">O curso nasce como rascunho e gratuito. Publique quando as primeiras aulas estiverem prontas.</p>
      <ErroFormulario erro={criar.error} />
      <div className="flex gap-3">
        <Botao type="submit" className="h-11 px-5" disabled={criar.isPending}>
          {criar.isPending ? "Criando…" : "Criar curso"}
        </Botao>
        <Botao variante="contorno" className="h-11 px-5" onClick={fechar}>
          Cancelar
        </Botao>
      </div>
    </form>
  );
}
