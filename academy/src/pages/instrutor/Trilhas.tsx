import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";
import { chamar, sugerirSlug, useAcao, useEu } from "@/lib/instrutor";
import { useTrilhasAdm, type SituacaoVitrine, type TrilhaAdm } from "@/lib/vitrine";
import { cn } from "@/lib/cn";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { AreaTexto, Campo, ErroFormulario, Marcador } from "@/components/instrutor/Campos";
import { FalhaCarregamento, NaoEncontrado } from "../Estados";

const ROTULO_SITUACAO: Record<SituacaoVitrine, string> = {
  oculto: "Fora das vitrines",
  em_breve: "Em breve",
  a_venda: "À venda",
};

/**
 * Trilhas da vitrine (só admin). No site, cada trilha publicada vira um bloco
 * com os cursos dela; trilha sem curso na vitrine não aparece.
 */
export default function TrilhasInstrutor() {
  const eu = useEu();
  if (eu.papel !== "admin") return <NaoEncontrado />;
  return <Conteudo />;
}

function Conteudo() {
  const trilhas = useTrilhasAdm();
  const [editando, setEditando] = useState<string | "nova" | null>(null);
  const mover = useAcao((sb, a: { slug: string; direcao: number }) => chamar<TrilhaAdm[]>(sb, "academy_adm_mover_trilha", { p_slug: a.slug, p_direcao: a.direcao }));
  const moverCurso = useAcao((sb, a: { trilha: string; curso: string; direcao: number }) =>
    chamar<TrilhaAdm[]>(sb, "academy_adm_mover_na_trilha", { p_trilha: a.trilha, p_curso: a.curso, p_direcao: a.direcao }),
  );
  if (trilhas.isError) return <FalhaCarregamento tentar={() => void trilhas.refetch()} />;
  const lista = trilhas.data ?? [];
  const ocupado = mover.isPending || moverCurso.isPending;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <h1 className="m-0 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Trilhas</h1>
        {editando === null && (
          <Botao className="ml-auto h-11 px-4" onClick={() => setEditando("nova")}>
            <Plus className="size-4" aria-hidden="true" /> Nova trilha
          </Botao>
        )}
      </div>
      <p className="m-0 mb-8 max-w-2xl text-muted">
        No site, cada trilha publicada vira um bloco com os cursos dela, nesta ordem. Trilha sem curso na vitrine não aparece. Para colocar um curso
        numa trilha, use a aba Vitrine do curso.
      </p>

      {editando === "nova" && <FormTrilha trilha={null} fechar={() => setEditando(null)} />}
      <ErroFormulario erro={mover.error ?? moverCurso.error} />

      {!trilhas.data ? (
        <div aria-busy="true" aria-label="Carregando as trilhas" className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Esqueleto key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <ol className="m-0 flex list-none flex-col gap-4 p-0">
          {lista.map((t, i) => (
            <li key={t.slug} className="rounded-2xl border border-line bg-panel p-5">
              {editando === t.slug ? (
                <FormTrilha trilha={t} fechar={() => setEditando(null)} />
              ) : (
                <>
                  <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                    <div className="min-w-0 flex-1 basis-72">
                      <h2 className="m-0 font-display text-lg font-semibold">
                        {t.titulo}
                        {!t.publicado && <span className="ml-3 text-[13px] font-normal text-dim">Não publicada</span>}
                        {t.formacao && <span className="ml-3 text-[13px] font-normal text-dim">Parte de uma formação</span>}
                      </h2>
                      {t.descricao && <p className="m-0 mt-1 text-sm text-muted">{t.descricao}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Icone rotulo={`Subir a trilha ${t.titulo}`} disabled={ocupado || i === 0} onClick={() => mover.mutate({ slug: t.slug, direcao: -1 })}>
                        <ArrowUp className="size-4" aria-hidden="true" />
                      </Icone>
                      <Icone
                        rotulo={`Descer a trilha ${t.titulo}`}
                        disabled={ocupado || i === lista.length - 1}
                        onClick={() => mover.mutate({ slug: t.slug, direcao: 1 })}
                      >
                        <ArrowDown className="size-4" aria-hidden="true" />
                      </Icone>
                      <Icone rotulo={`Editar a trilha ${t.titulo}`} onClick={() => setEditando(t.slug)}>
                        <Pencil className="size-4" aria-hidden="true" />
                      </Icone>
                    </div>
                  </div>
                  {t.cursos.length === 0 ? (
                    <p className="m-0 mt-4 text-sm text-dim">Nenhum curso nesta trilha ainda.</p>
                  ) : (
                    <ol className="m-0 mt-4 flex list-none flex-col p-0">
                      {t.cursos.map((c, j) => (
                        <li key={c.slug} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line py-2.5">
                          <Link to={`/instrutor/cursos/${c.slug}?aba=vitrine`} className="min-w-0 flex-1 truncate text-[15px] text-ink hover:underline">
                            {c.titulo}
                          </Link>
                          <span className={cn("text-[13px]", c.situacao === "oculto" ? "text-dim" : "text-muted")}>{ROTULO_SITUACAO[c.situacao]}</span>
                          <div className="flex items-center gap-1">
                            <Icone
                              rotulo={`Subir ${c.titulo} na trilha ${t.titulo}`}
                              disabled={ocupado || j === 0}
                              onClick={() => moverCurso.mutate({ trilha: t.slug, curso: c.slug, direcao: -1 })}
                            >
                              <ArrowUp className="size-4" aria-hidden="true" />
                            </Icone>
                            <Icone
                              rotulo={`Descer ${c.titulo} na trilha ${t.titulo}`}
                              disabled={ocupado || j === t.cursos.length - 1}
                              onClick={() => moverCurso.mutate({ trilha: t.slug, curso: c.slug, direcao: 1 })}
                            >
                              <ArrowDown className="size-4" aria-hidden="true" />
                            </Icone>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </>
              )}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

function Icone({ rotulo, children, onClick, disabled }: { rotulo: string; children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      onClick={onClick}
      disabled={disabled}
      className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-white/5 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function FormTrilha({ trilha, fechar }: { trilha: TrilhaAdm | null; fechar: () => void }) {
  const aviso = useAvisos();
  const [titulo, setTitulo] = useState(trilha?.titulo ?? "");
  const [slug, setSlug] = useState(trilha?.slug ?? "");
  const [slugTocado, setSlugTocado] = useState(false);
  const [descricao, setDescricao] = useState(trilha?.descricao ?? "");
  const [publicado, setPublicado] = useState(trilha?.publicado ?? true);
  const salvar = useAcao(
    (sb, dados: Record<string, unknown>) => chamar<TrilhaAdm[]>(sb, "academy_adm_salvar_trilha", { p_slug: trilha?.slug ?? "", p_dados: dados }),
    () => {
      aviso({ titulo: trilha ? "Trilha salva" : "Trilha criada", tipo: "ok" });
      fechar();
    },
  );
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    salvar.mutate(trilha ? { titulo, descricao, publicado } : { slug, titulo, descricao, publicado });
  };

  return (
    <form onSubmit={enviar} aria-label={trilha ? `Editar a trilha ${trilha.titulo}` : "Nova trilha"} className="mb-6 flex max-w-2xl flex-col gap-5">
      <Campo
        rotulo="Nome da trilha"
        value={titulo}
        onChange={(e) => {
          setTitulo(e.target.value);
          if (!trilha && !slugTocado) setSlug(sugerirSlug(e.target.value));
        }}
        limite={80}
        required
        minLength={2}
      />
      {!trilha && (
        <Campo
          rotulo="Endereço"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTocado(true);
          }}
          ajuda="Só letras minúsculas, números e hífen. Não muda depois de criado."
          required
        />
      )}
      <AreaTexto rotulo="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} limite={400} ajuda="Uma ou duas frases sobre para quem é a trilha." />
      <Marcador rotulo="Trilha publicada" ajuda="Publicada, a trilha aparece no site assim que tiver um curso na vitrine." checked={publicado} onChange={(e) => setPublicado(e.target.checked)} />
      <ErroFormulario erro={salvar.error} />
      <div className="flex gap-3">
        <Botao type="submit" className="h-11 px-5" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando…" : trilha ? "Salvar trilha" : "Criar trilha"}
        </Botao>
        <Botao variante="contorno" className="h-11 px-5" onClick={fechar}>
          Cancelar
        </Botao>
      </div>
    </form>
  );
}
