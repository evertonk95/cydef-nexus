import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { CheckCircle2, ChevronLeft, ExternalLink } from "lucide-react";
import { chamar, semAcesso, ErroPainel, estadoAula, escreverDuracao, extrairYoutube, lerDuracao, useAcao, useCursoAdm, type AulaAdm, type CursoAdm } from "@/lib/instrutor";
import { rotuloModulo, numeroAula } from "@/lib/aula";
import { contagem } from "@/lib/formato";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { AreaTexto, Campo, ErroFormulario, Marcador, Selecao, Situacao } from "@/components/instrutor/Campos";
import { FalhaCarregamento, NaoEncontrado } from "../Estados";

export default function AulaInstrutor() {
  const { slug = "", id = "" } = useParams();
  const [busca] = useSearchParams();
  const curso = useCursoAdm(slug);

  if (curso.isError) {
    if (semAcesso(curso.error)) return <NaoEncontrado />;
    return <FalhaCarregamento tentar={() => void curso.refetch()} />;
  }
  if (curso.isSuccess && !curso.data) return <NaoEncontrado />;
  const nova = id === "nova";
  const aula = nova || !curso.data ? null : curso.data.modulos.flatMap((m) => m.aulas).find((a) => a.id === id);
  // Logo depois de criar, a lista ainda pode ser a de antes: espera recarregar.
  if (!curso.data || (!nova && !aula && curso.isFetching))
    return (
      <div aria-busy="true" aria-label="Carregando a aula" className="flex max-w-3xl flex-col gap-5">
        <Esqueleto className="h-9 w-72" />
        <Esqueleto className="h-11 w-full" />
        <Esqueleto className="h-28 w-full" />
      </div>
    );

  if (!nova && !aula) return <NaoEncontrado />;
  if (curso.data.modulos.length === 0)
    return (
      <section className="painel-card max-w-2xl p-7">
        <h1 className="m-0 mb-2 font-display text-xl font-semibold">Crie um módulo primeiro</h1>
        <p className="m-0 mb-5 text-muted">Toda aula fica dentro de um módulo.</p>
        <Link to={`/instrutor/cursos/${slug}`} className="font-semibold text-orange-hi hover:underline">
          Voltar para a estrutura do curso
        </Link>
      </section>
    );
  const moduloInicial = aula?.modulo_id ?? busca.get("modulo") ?? curso.data.modulos.find((m) => m.ordem > 0)?.id ?? curso.data.modulos[0]?.id ?? "";

  // key: ao trocar de aula, o formulário começa do zero.
  return <Formulario key={id} curso={curso.data} aula={aula ?? null} moduloInicial={moduloInicial} />;
}

function Formulario({ curso, aula, moduloInicial }: { curso: CursoAdm; aula: AulaAdm | null; moduloInicial: string }) {
  const navegar = useNavigate();
  const aviso = useAvisos();
  const voltar = `/instrutor/cursos/${curso.slug}`;
  const [f, setF] = useState({
    titulo: aula?.titulo ?? "",
    modulo_id: moduloInicial,
    resumo: aula?.resumo ?? "",
    duracao: aula ? escreverDuracao(aula.duracao_seg) : "",
    video: aula?.video_ref ?? "",
    publicado: aula?.publicado ?? false,
  });
  const [erroLocal, setErroLocal] = useState<Error | null>(null);
  const ref = f.video.trim() ? extrairYoutube(f.video) : null;
  const videoRuim = Boolean(f.video.trim()) && !ref;

  const salvar = useAcao(
    (sb, dados: Record<string, unknown>) => chamar<AulaAdm>(sb, "academy_adm_salvar_aula", { p_id: aula?.id ?? null, p_dados: dados }),
    (salva) => {
      aviso({ titulo: aula ? "Aula salva" : "Aula criada", texto: salva.publicado ? "Já aparece para os alunos." : undefined, tipo: "ok" });
      if (!aula) navegar(`${voltar}/aulas/${salva.id}`, { replace: true });
    },
  );
  const excluir = useAcao(
    (sb, idAula: string) => chamar<CursoAdm>(sb, "academy_adm_excluir_aula", { p_id: idAula }),
    () => {
      aviso({ titulo: "Aula excluída", tipo: "ok" });
      navegar(voltar);
    },
  );

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const seg = lerDuracao(f.duracao);
    if (seg === null) return setErroLocal(new ErroPainel("duracao_invalida"));
    if (videoRuim) return setErroLocal(new ErroPainel("video_invalido"));
    setErroLocal(null);
    salvar.mutate({
      titulo: f.titulo,
      modulo_id: f.modulo_id,
      resumo: f.resumo,
      duracao_seg: seg,
      video_provedor: ref ? "youtube" : null,
      video_ref: ref,
      publicado: f.publicado,
    });
  };

  const podeExcluir = aula && !aula.publicado && aula.alunos_com_progresso === 0;

  return (
    <>
      <Link to={voltar} className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronLeft className="size-4" aria-hidden="true" /> {curso.titulo}
      </Link>
      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2">
        <h1 className="m-0 font-display text-[clamp(26px,2.6vw,34px)] leading-tight font-semibold tracking-tight">
          {aula ? `Aula ${numeroAula(aula.numero)}` : "Nova aula"}
        </h1>
        {aula && <Situacao estado={estadoAula(aula)} />}
        {aula && aula.alunos_com_progresso > 0 && (
          <span className="text-sm text-muted">{contagem(aula.alunos_com_progresso, "aluno já assistiu", "alunos já assistiram")}</span>
        )}
        {aula?.publicado && (
          <a href={`/cursos/${curso.slug}/aulas/${aula.numero}`} target="_blank" rel="noopener" className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            Ver como aluno <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="sr-only">(abre em nova aba)</span>
          </a>
        )}
      </div>

      <form onSubmit={enviar} className="flex max-w-3xl flex-col gap-5">
        <Campo rotulo="Título" value={f.titulo} onChange={(e) => setF((x) => ({ ...x, titulo: e.target.value }))} limite={140} required minLength={2} autoFocus={!aula} />
        <Selecao
          rotulo="Módulo"
          value={f.modulo_id}
          onChange={(e) => setF((x) => ({ ...x, modulo_id: e.target.value }))}
          ajuda={aula && f.modulo_id !== aula.modulo_id ? "A aula vai para o fim do módulo escolhido. O progresso dos alunos continua valendo." : undefined}
        >
          {curso.modulos.map((m) => (
            <option key={m.id} value={m.id}>
              {rotuloModulo(m.ordem, m.titulo)}
            </option>
          ))}
        </Selecao>
        <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
          <div className="flex flex-col gap-2">
            <Campo
              rotulo="Vídeo do YouTube"
              placeholder="https://youtu.be/…"
              value={f.video}
              onChange={(e) => setF((x) => ({ ...x, video: e.target.value }))}
              ajuda="Cole o link do vídeo (pode ser não listado) ou só o código dele."
              aria-invalid={videoRuim || undefined}
            />
            {ref && (
              <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                <span className="inline-flex items-center gap-1.5 text-ok">
                  <CheckCircle2 className="size-3.5" aria-hidden="true" /> Vídeo {ref}
                </span>
                <a href={`https://www.youtube.com/watch?v=${ref}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-ink">
                  Conferir no YouTube <ExternalLink className="size-3" aria-hidden="true" />
                  <span className="sr-only">(abre em nova aba)</span>
                </a>
              </p>
            )}
            {videoRuim && <p className="m-0 text-[13px] text-warn">Não reconheci esse link como vídeo do YouTube.</p>}
          </div>
          <Campo
            rotulo="Duração"
            placeholder="12:30"
            value={f.duracao}
            onChange={(e) => setF((x) => ({ ...x, duracao: e.target.value }))}
            required
            inputMode="numeric"
            ajuda="Minutos:segundos"
          />
        </div>
        <AreaTexto
          rotulo="Resumo"
          value={f.resumo}
          onChange={(e) => setF((x) => ({ ...x, resumo: e.target.value }))}
          limite={1200}
          ajuda="Aparece embaixo do vídeo e entra na busca do portal."
        />
        <Marcador
          rotulo="Aula publicada"
          ajuda={ref ? "Publicada, a aula aparece para os alunos do curso." : "Para publicar, informe o vídeo."}
          checked={f.publicado}
          disabled={!ref && !f.publicado}
          onChange={(e) => setF((x) => ({ ...x, publicado: e.target.checked }))}
        />
        <ErroFormulario erro={erroLocal ?? salvar.error ?? excluir.error} />
        <div className="flex flex-wrap gap-3">
          <Botao type="submit" className="h-11 px-5" disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando…" : aula ? "Salvar aula" : "Criar aula"}
          </Botao>
          <Link to={voltar} className="inline-flex h-11 items-center rounded-[10px] border border-line-hi px-5 font-semibold transition-colors duration-150 hover:border-muted">
            Voltar
          </Link>
          {podeExcluir && <ExcluirAula aoConfirmar={() => excluir.mutate(aula.id)} ocupado={excluir.isPending} />}
        </div>
        {aula && !podeExcluir && (
          <p className="m-0 text-[13px] text-dim">Aula publicada ou já assistida não pode ser excluída. Para tirar do ar, desmarque "Aula publicada".</p>
        )}
      </form>
    </>
  );
}

function ExcluirAula({ aoConfirmar, ocupado }: { aoConfirmar: () => void; ocupado: boolean }) {
  const [confirmar, setConfirmar] = useState(false);
  return confirmar ? (
    <span className="ml-auto flex items-center gap-2">
      <span className="text-sm text-muted">Excluir de vez?</span>
      <button type="button" onClick={aoConfirmar} disabled={ocupado} className="h-11 rounded-[10px] border border-bad/50 px-4 font-semibold text-bad hover:bg-bad/10">
        Excluir aula
      </button>
      <button type="button" onClick={() => setConfirmar(false)} className="h-11 rounded-[10px] px-3 text-muted hover:text-ink">
        Manter
      </button>
    </span>
  ) : (
    <button type="button" onClick={() => setConfirmar(true)} className="ml-auto h-11 rounded-[10px] px-4 font-medium text-muted hover:text-bad">
      Excluir rascunho
    </button>
  );
}
