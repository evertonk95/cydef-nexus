import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ArrowDown, ArrowUp, ChevronLeft, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import {
  chamar,
  semAcesso,
  estadoAula,
  escreverDuracao,
  NIVEIS,
  useAcao,
  useCursoAdm,
  useQuestoesAdm, useProvaFinalAdm, type ProvaFinalAdm,
  type CursoAdm,
  type ModuloAdm,
  type Nivel,
  type QuestaoAdm,
  type Requisitos,
} from "@/lib/instrutor";
import { rotuloModulo, numeroAula } from "@/lib/aula";
import { contagem } from "@/lib/formato";
import { cn } from "@/lib/cn";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { AreaTexto, Campo, ErroFormulario, Marcador, Selecao, Situacao } from "@/components/instrutor/Campos";
import { FalhaCarregamento, NaoEncontrado } from "../Estados";
import { AbaSobre } from "./Sobre";
import { AbaMateriais } from "./Materiais";
import { AbaVitrine } from "./Vitrine";
import { AbaMissoes } from "./Missoes";
import { filtrosQuestoes } from "./filtros-questoes";

type Aba = "estrutura" | "sobre" | "questoes" | "missoes" | "materiais" | "requisitos" | "vitrine" | "dados";
const ABAS: { id: Aba; rotulo: string; admin?: boolean }[] = [
  { id: "estrutura", rotulo: "Estrutura" },
  { id: "sobre", rotulo: "Sobre o curso" },
  { id: "questoes", rotulo: "Questões" },
  { id: "missoes", rotulo: "Missões" },
  { id: "materiais", rotulo: "Materiais" },
  { id: "requisitos", rotulo: "Certificado" },
  // Vitrine e venda (0020): decisão do admin.
  { id: "vitrine", rotulo: "Vitrine", admin: true },
  { id: "dados", rotulo: "Dados do curso" },
];

export default function CursoInstrutor() {
  const { slug = "" } = useParams();
  const [busca, setBusca] = useSearchParams();
  const curso = useCursoAdm(slug);
  const abas = ABAS.filter((a) => !a.admin || curso.data?.eh_admin);
  const aba = (abas.find((a) => a.id === busca.get("aba"))?.id ?? "estrutura") as Aba;

  if (curso.isError) {
    if (semAcesso(curso.error)) return <NaoEncontrado />;
    return <FalhaCarregamento tentar={() => void curso.refetch()} />;
  }
  if (curso.isSuccess && !curso.data) return <NaoEncontrado />;
  if (!curso.data)
    return (
      <div aria-busy="true" aria-label="Carregando o curso" className="flex flex-col gap-4">
        <Esqueleto className="h-9 w-80 max-w-full" />
        <Esqueleto className="h-40 w-full" />
        <Esqueleto className="h-40 w-full" />
      </div>
    );

  const c = curso.data;
  return (
    <>
      <Link to="/instrutor" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronLeft className="size-4" aria-hidden="true" /> Cursos
      </Link>
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <h1 className="m-0 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">{c.titulo}</h1>
        <Situacao estado={c.publicado ? "publicado" : "rascunho"} />
        <a href={`/cursos/${c.slug}`} target="_blank" rel="noopener" className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          Ver como aluno <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      </div>

      <div role="tablist" aria-label="Seções do curso" className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-line bg-panel p-1">
        {abas.map((a) => (
          <button
            key={a.id}
            role="tab"
            id={`aba-${a.id}`}
            aria-selected={aba === a.id}
            aria-controls={`painel-${a.id}`}
            type="button"
            onClick={() => setBusca(a.id === "estrutura" ? {} : { aba: a.id }, { replace: true })}
            className={cn(
              "h-10 shrink-0 rounded-lg px-4 text-sm font-medium transition-colors duration-150",
              aba === a.id ? "bg-white/[0.07] text-ink" : "text-muted hover:text-ink",
            )}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`painel-${aba}`} aria-labelledby={`aba-${aba}`}>
        {aba === "estrutura" && <Estrutura curso={c} />}
        {aba === "sobre" && <AbaSobre curso={c} />}
        {aba === "questoes" && <Questoes curso={c} />}
        {aba === "missoes" && <AbaMissoes curso={c} />}
        {aba === "materiais" && <AbaMateriais curso={c} />}
        {aba === "requisitos" && <FormRequisitos curso={c} />}
        {aba === "vitrine" && <AbaVitrine curso={c} />}
        {aba === "dados" && <FormDados curso={c} />}
      </div>
    </>
  );
}

// Estrutura -----------------------------------------------------------------

function Estrutura({ curso }: { curso: CursoAdm }) {
  const aviso = useAvisos();
  const mover = useAcao((sb, a: { fn: string; id: string; direcao: number }) => chamar<CursoAdm>(sb, a.fn, { p_id: a.id, p_direcao: a.direcao }));
  const ultimoModulo = curso.modulos.at(-1)?.ordem ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <ErroFormulario erro={mover.error} />
      {curso.modulos.length === 0 && (
        <p className="m-0 text-muted">Este curso ainda não tem módulos. Crie o primeiro abaixo.</p>
      )}
      {curso.modulos.map((m) => (
        <Modulo
          key={m.id}
          curso={curso}
          modulo={m}
          podeSubir={m.ordem > 1}
          podeDescer={m.ordem > 0 && m.ordem < ultimoModulo}
          ocupado={mover.isPending}
          mover={(id, direcao, fn) => mover.mutate({ fn, id, direcao })}
        />
      ))}
      <NovoModulo slug={curso.slug} aoCriar={() => aviso({ titulo: "Módulo criado", tipo: "ok" })} />
    </div>
  );
}

function BotaoIcone({ rotulo, children, ...resto }: { rotulo: string; children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      className="grid size-9 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
      {...resto}
    >
      {children}
    </button>
  );
}

/** Excluir pede um segundo clique, sem diálogo do navegador. */
function BotaoExcluir({ rotulo, aoConfirmar, ocupado }: { rotulo: string; aoConfirmar: () => void; ocupado?: boolean }) {
  const [confirmar, setConfirmar] = useState(false);
  useEffect(() => {
    if (!confirmar) return;
    const t = window.setTimeout(() => setConfirmar(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirmar]);
  return confirmar ? (
    <button
      type="button"
      disabled={ocupado}
      onClick={aoConfirmar}
      className="h-9 rounded-lg border border-bad/50 px-3 text-sm font-medium text-bad transition-colors duration-150 hover:bg-bad/10"
    >
      Confirmar exclusão
    </button>
  ) : (
    <BotaoIcone rotulo={rotulo} onClick={() => setConfirmar(true)}>
      <Trash2 className="size-4" aria-hidden="true" />
    </BotaoIcone>
  );
}

function Modulo({
  curso,
  modulo: m,
  podeSubir,
  podeDescer,
  ocupado,
  mover,
}: {
  curso: CursoAdm;
  modulo: ModuloAdm;
  podeSubir: boolean;
  podeDescer: boolean;
  ocupado: boolean;
  mover: (id: string, direcao: number, fn: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(m.titulo);
  const [resumo, setResumo] = useState(m.resumo ?? "");
  // Com a 0016, título e resumo saem juntos; sem ela, só o título.
  const renomear = useAcao(
    (sb, d: { titulo: string; resumo: string }) =>
      m.resumo === undefined
        ? chamar<CursoAdm>(sb, "academy_adm_salvar_modulo", { p_curso: curso.slug, p_id: m.id, p_titulo: d.titulo })
        : chamar<CursoAdm>(sb, "academy_adm_editar_modulo", { p_id: m.id, p_dados: d }),
    () => setEditando(false),
  );
  const excluir = useAcao((sb, id: string) => chamar<CursoAdm>(sb, "academy_adm_excluir_modulo", { p_id: id }));
  const vazio = m.aulas.length === 0 && m.questoes === 0;
  const idTitulo = `modulo-${m.id}`;

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    renomear.mutate({ titulo, resumo });
  };

  return (
    <section aria-labelledby={idTitulo} className="painel-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
        {editando ? (
          <form onSubmit={enviar} className="flex flex-1 flex-col gap-4">
            <Campo rotulo="Título do módulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} limite={120} required minLength={2} autoFocus />
            {m.resumo !== undefined && (
              <AreaTexto
                rotulo="Ementa do módulo"
                value={resumo}
                onChange={(e) => setResumo(e.target.value)}
                limite={400}
                className="min-h-20"
                ajuda="O que o aluno aprende neste módulo. Aparece na página do curso, mesmo antes das aulas saírem."
              />
            )}
            <ErroFormulario erro={renomear.error} />
            <div className="flex gap-3">
              <Botao type="submit" className="h-11 px-4" disabled={renomear.isPending}>
                Salvar módulo
              </Botao>
              <Botao variante="contorno" className="h-11 px-4" onClick={() => { setEditando(false); setTitulo(m.titulo); setResumo(m.resumo ?? ""); }}>
                Cancelar
              </Botao>
            </div>
          </form>
        ) : (
          <>
            <div className="min-w-0 flex-1">
              <h2 id={idTitulo} className="m-0 font-display text-lg font-semibold">
                {rotuloModulo(m.ordem, m.titulo)}
              </h2>
              <p className="m-0 mt-0.5 text-[13px] text-muted">
                {contagem(m.aulas.length, "aula", "aulas")}, {contagem(m.questoes, "questão", "questões")}
                {m.resumo === "" && <span className="text-warn">, sem ementa</span>}
              </p>
              {m.resumo && <p className="m-0 mt-1.5 max-w-[68ch] text-sm leading-relaxed text-muted">{m.resumo}</p>}
            </div>
            <div className="flex items-center gap-1">
              {m.ordem > 0 && (
                <>
                  <BotaoIcone rotulo={`Subir ${rotuloModulo(m.ordem, m.titulo)}`} onClick={() => mover(m.id, -1, "academy_adm_mover_modulo")} disabled={!podeSubir || ocupado}>
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </BotaoIcone>
                  <BotaoIcone rotulo={`Descer ${rotuloModulo(m.ordem, m.titulo)}`} onClick={() => mover(m.id, 1, "academy_adm_mover_modulo")} disabled={!podeDescer || ocupado}>
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </BotaoIcone>
                </>
              )}
              <BotaoIcone rotulo={`Editar ${rotuloModulo(m.ordem, m.titulo)}`} onClick={() => setEditando(true)}>
                <Pencil className="size-4" aria-hidden="true" />
              </BotaoIcone>
              {vazio && <BotaoExcluir rotulo={`Excluir ${rotuloModulo(m.ordem, m.titulo)}`} aoConfirmar={() => excluir.mutate(m.id)} ocupado={excluir.isPending} />}
            </div>
          </>
        )}
      </div>
      {excluir.error && (
        <div className="px-5 pt-4">
          <ErroFormulario erro={excluir.error} />
        </div>
      )}

      {m.aulas.length > 0 && (
        <ol className="m-0 list-none p-0">
          {m.aulas.map((a, i) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-5 py-3 last:border-b-0">
              <span className="w-8 shrink-0 font-display text-sm text-dim">{numeroAula(i + 1)}</span>
              <Link to={`/instrutor/cursos/${curso.slug}/aulas/${a.id}`} className="min-w-0 flex-1 basis-56 truncate font-medium hover:text-orange-hi">
                {a.titulo}
              </Link>
              <span className="w-16 text-sm text-muted">{escreverDuracao(a.duracao_seg)}</span>
              <span className="w-28">
                <Situacao estado={estadoAula(a)} />
              </span>
              <span className="flex items-center gap-1">
                <BotaoIcone rotulo={`Subir aula ${numeroAula(i + 1)}`} onClick={() => mover(a.id, -1, "academy_adm_mover_aula")} disabled={i === 0 || ocupado}>
                  <ArrowUp className="size-4" aria-hidden="true" />
                </BotaoIcone>
                <BotaoIcone rotulo={`Descer aula ${numeroAula(i + 1)}`} onClick={() => mover(a.id, 1, "academy_adm_mover_aula")} disabled={i === m.aulas.length - 1 || ocupado}>
                  <ArrowDown className="size-4" aria-hidden="true" />
                </BotaoIcone>
              </span>
            </li>
          ))}
        </ol>
      )}
      <div className="px-5 py-3">
        <Link
          to={`/instrutor/cursos/${curso.slug}/aulas/nova?modulo=${m.id}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink"
        >
          <Plus className="size-4" aria-hidden="true" /> Nova aula{m.ordem > 0 ? ` no módulo ${m.ordem}` : ""}
        </Link>
      </div>
    </section>
  );
}

function NovoModulo({ slug, aoCriar }: { slug: string; aoCriar: () => void }) {
  const [titulo, setTitulo] = useState("");
  const criar = useAcao(
    (sb, t: string) => chamar<CursoAdm>(sb, "academy_adm_salvar_modulo", { p_curso: slug, p_id: null, p_titulo: t }),
    () => {
      setTitulo("");
      aoCriar();
    },
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        criar.mutate(titulo);
      }}
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-dashed border-line-hi p-5"
    >
      <div className="min-w-60 flex-1">
        <Campo rotulo="Novo módulo" placeholder="Título do módulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} limite={120} required minLength={2} />
      </div>
      <Botao type="submit" variante="contorno" className="h-11 px-4" disabled={criar.isPending}>
        <Plus className="size-4" aria-hidden="true" /> Adicionar módulo
      </Botao>
      <div className="basis-full empty:hidden">
        <ErroFormulario erro={criar.error} />
      </div>
    </form>
  );
}

// Questões ------------------------------------------------------------------

type FiltroSituacao = "todas" | "rascunho" | "publicadas";

interface ResultadoLote {
  alteradas: number;
  ignoradas: string[];
  questoes: QuestaoAdm[];
}

function Questoes({ curso }: { curso: CursoAdm }) {
  const questoes = useQuestoesAdm(curso.slug);
  const prova = useProvaFinalAdm(curso.slug);
  const aviso = useAvisos();
  const [busca, setBusca] = useSearchParams();
  const pedido = busca.get("mostrar") ?? "todas";
  const filtro = pedido === "final" || curso.modulos.some((m) => m.id === pedido) ? pedido : "todas";
  const situacao: FiltroSituacao = busca.get("situacao") === "rascunho" ? "rascunho" : busca.get("situacao") === "publicadas" ? "publicadas" : "todas";
  const [marcadas, setMarcadas] = useState<string[]>([]);
  const req = curso.requisitos;

  const filtrar = (mudanca: { mostrar?: string; situacao?: FiltroSituacao }) => {
    const n = new URLSearchParams(busca);
    for (const [k, v] of Object.entries(mudanca)) {
      if (v === "todas") n.delete(k);
      else n.set(k, v);
    }
    setBusca(n, { replace: true });
    setMarcadas([]);
  };

  const lote = useAcao(
    (sb, a: { ids: string[]; publicar: boolean }) =>
      chamar<ResultadoLote>(sb, "academy_adm_publicar_questoes", { p_curso: curso.slug, p_questoes: a.ids, p_publicar: a.publicar }),
    (r, a) => {
      setMarcadas([]);
      const feitas = r.alteradas;
      aviso({
        titulo: a.publicar
          ? feitas === 1
            ? "1 questão publicada"
            : `${feitas} questões publicadas`
          : feitas === 1
            ? "1 questão voltou para rascunho"
            : `${feitas} questões voltaram para rascunho`,
        texto:
          r.ignoradas.length > 0
            ? `${contagem(r.ignoradas.length, "questão ficou", "questões ficaram")} em rascunho porque precisa de 2 a 8 alternativas e uma correta. Abra e corrija.`
            : undefined,
        tipo: r.ignoradas.length > 0 ? "info" : "ok",
      });
    },
  );

  // Fase 26: pôr ou tirar questões da avaliação final montada pelo instrutor.
  const definirProva = useAcao(
    (sb, a: { ids: string[]; incluir: boolean }) =>
      chamar<ProvaFinalAdm>(sb, "academy_adm_definir_prova_final", { p_curso: curso.slug, p_questoes: a.ids, p_incluir: a.incluir }),
    (_r, a) => {
      setMarcadas([]);
      aviso({
        titulo: a.incluir
          ? `${contagem(a.ids.length, "questão entrou", "questões entraram")} na prova`
          : `${contagem(a.ids.length, "questão saiu", "questões saíram")} da prova`,
        tipo: "ok",
      });
    },
  );

  if (questoes.isError) return <FalhaCarregamento tentar={() => void questoes.refetch()} />;
  const lista = (questoes.data ?? [])
    .filter((q) => (filtro === "todas" ? true : filtro === "final" ? q.modulo_id === null : q.modulo_id === filtro))
    .filter((q) => (situacao === "todas" ? true : situacao === "publicadas" ? q.publicado : !q.publicado));
  const visiveis = new Set(lista.map((q) => q.id));
  const selecao = marcadas.filter((id) => visiveis.has(id));
  const rascunhos = lista.filter((q) => !q.publicado);
  const selRascunho = lista.filter((q) => selecao.includes(q.id) && !q.publicado).map((q) => q.id);
  const selPublicada = lista.filter((q) => selecao.includes(q.id) && q.publicado).map((q) => q.id);
  const todasMarcadas = lista.length > 0 && selecao.length === lista.length;
  const nomeDe = (q: QuestaoAdm) => {
    if (!q.modulo_id) return "Avaliação final";
    const m = curso.modulos.find((x) => x.id === q.modulo_id);
    return m ? rotuloModulo(m.ordem, m.titulo) : "";
  };
  const fixa = req?.final_modo === "fixa";
  const naProva = new Set(prova.data?.questoes ?? []);
  const faltamFinal = req && !fixa ? Math.max(0, req.questoes_final - curso.questoes_final_publicadas) : 0;
  const selFinal = lista.filter((q) => selecao.includes(q.id) && q.modulo_id === null);
  const selPorNaProva = selFinal.filter((q) => !naProva.has(q.id)).map((q) => q.id);
  const selTirarDaProva = selFinal.filter((q) => naProva.has(q.id)).map((q) => q.id);
  const ate = filtrosQuestoes(busca);
  const sufixo = ate ? `?${ate}` : "";
  const novaQ = new URLSearchParams(ate);
  if (filtro !== "todas") novaQ.set("modulo", filtro);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-full max-w-xs">
          <Selecao rotulo="Mostrar" value={filtro} onChange={(e) => filtrar({ mostrar: e.target.value })}>
            <option value="todas">Todas as questões</option>
            <option value="final">Avaliação final</option>
            {curso.modulos.map((m) => (
              <option key={m.id} value={m.id}>
                {rotuloModulo(m.ordem, m.titulo)}
              </option>
            ))}
          </Selecao>
        </div>
        <div className="w-44">
          <Selecao rotulo="Situação" value={situacao} onChange={(e) => filtrar({ situacao: e.target.value as FiltroSituacao })}>
            <option value="todas">Todas</option>
            <option value="rascunho">Em rascunho</option>
            <option value="publicadas">Publicadas</option>
          </Selecao>
        </div>
        <Link
          to={`/instrutor/cursos/${curso.slug}/questoes/nova${novaQ.toString() ? `?${novaQ.toString()}` : ""}`}
          className="ml-auto inline-flex h-11 items-center gap-2 rounded-[10px] bg-orange px-4 font-semibold text-orange-ink transition-colors duration-150 hover:bg-orange-hi"
        >
          <Plus className="size-4" aria-hidden="true" /> Nova questão
        </Link>
      </div>

      {fixa && (filtro === "todas" || filtro === "final") && prova.data && (
        <p className={`m-0 rounded-[10px] border px-4 py-3 text-sm text-ink ${prova.data.validas === 0 ? "border-warn/30 bg-warn/5" : "border-line"}`}>
          A avaliação final é a prova montada: {contagem(prova.data.questoes.length, "questão escolhida", "questões escolhidas")}
          {prova.data.validas !== prova.data.questoes.length ? `, ${contagem(prova.data.validas, "publicada", "publicadas")}` : ""}. Todo aluno recebe as
          mesmas questões, em ordem diferente.
          {prova.data.validas === 0
            ? " Enquanto nenhuma escolhida estiver publicada, a avaliação final fica indisponível para o aluno."
            : " Para mudar, marque questões da avaliação final e use \"Pôr na prova\" ou \"Tirar da prova\"."}
        </p>
      )}

      {req && faltamFinal > 0 && (filtro === "todas" || filtro === "final") && (
        <p className="m-0 rounded-[10px] border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-ink">
          A avaliação final sorteia {contagem(req.questoes_final, "questão", "questões")} e o banco tem{" "}
          {contagem(curso.questoes_final_publicadas, "publicada", "publicadas")}. Enquanto faltarem {faltamFinal}, a avaliação final fica indisponível para o aluno.
        </p>
      )}

      {!questoes.data ? (
        <div aria-busy="true" aria-label="Carregando as questões" className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Esqueleto key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <p className="m-0 text-muted">{situacao === "rascunho" ? "Nenhuma questão em rascunho aqui." : "Nenhuma questão aqui ainda."}</p>
      ) : (
        <>
          <div role="toolbar" aria-label="Ações nas questões marcadas" className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[10px] border border-line px-4 py-3">
            <label className="inline-flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-[18px] accent-ink"
                checked={todasMarcadas}
                ref={(el) => {
                  if (el) el.indeterminate = selecao.length > 0 && !todasMarcadas;
                }}
                onChange={(e) => setMarcadas(e.target.checked ? lista.map((q) => q.id) : [])}
              />
              {selecao.length > 0 ? `${contagem(selecao.length, "marcada", "marcadas")} de ${lista.length}` : `Marcar as ${lista.length}`}
            </label>
            <div className="ml-auto flex flex-wrap gap-2">
              {selecao.length === 0 ? (
                rascunhos.length > 0 && (
                  <Botao
                    variante="contorno"
                    className="h-10 px-4 text-sm"
                    disabled={lote.isPending}
                    onClick={() => lote.mutate({ ids: rascunhos.map((q) => q.id), publicar: true })}
                  >
                    {rascunhos.length === 1 ? "Publicar a questão em rascunho" : `Publicar as ${rascunhos.length} em rascunho`}
                  </Botao>
                )
              ) : (
                <>
                  <Botao
                    variante="contorno"
                    className="h-10 px-4 text-sm"
                    disabled={lote.isPending || selRascunho.length === 0}
                    onClick={() => lote.mutate({ ids: selRascunho, publicar: true })}
                  >
                    Publicar {selRascunho.length > 0 ? contagem(selRascunho.length, "questão", "questões") : ""}
                  </Botao>
                  <Botao
                    variante="contorno"
                    className="h-10 px-4 text-sm"
                    disabled={lote.isPending || selPublicada.length === 0}
                    onClick={() => lote.mutate({ ids: selPublicada, publicar: false })}
                  >
                    Voltar {selPublicada.length > 0 ? contagem(selPublicada.length, "questão", "questões") : ""} para rascunho
                  </Botao>
                  {fixa && selPorNaProva.length > 0 && (
                    <Botao
                      variante="contorno"
                      className="h-10 px-4 text-sm"
                      disabled={definirProva.isPending}
                      onClick={() => definirProva.mutate({ ids: selPorNaProva, incluir: true })}
                    >
                      Pôr {contagem(selPorNaProva.length, "questão", "questões")} na prova
                    </Botao>
                  )}
                  {fixa && selTirarDaProva.length > 0 && (
                    <Botao
                      variante="contorno"
                      className="h-10 px-4 text-sm"
                      disabled={definirProva.isPending}
                      onClick={() => definirProva.mutate({ ids: selTirarDaProva, incluir: false })}
                    >
                      Tirar {contagem(selTirarDaProva.length, "questão", "questões")} da prova
                    </Botao>
                  )}
                </>
              )}
            </div>
          </div>
          <ErroFormulario erro={lote.error ?? definirProva.error} />
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {lista.map((q, i) => (
              <li key={q.id} className="painel-card group flex items-start gap-4 p-5 hover:border-line-hi">
                <input
                  type="checkbox"
                  aria-label={`Marcar questão ${i + 1}: ${q.enunciado.slice(0, 80)}`}
                  className="mt-1 size-[18px] flex-none accent-ink"
                  checked={selecao.includes(q.id)}
                  onChange={(e) => setMarcadas(e.target.checked ? [...selecao, q.id] : selecao.filter((x) => x !== q.id))}
                />
                <Link to={`/instrutor/cursos/${curso.slug}/questoes/${q.id}${sufixo}`} className="flex min-w-0 flex-1 flex-wrap items-start gap-x-6 gap-y-2">
                  <div className="min-w-0 flex-1 basis-72">
                    <p className="m-0 mb-1 text-[13px] text-dim">{nomeDe(q)}</p>
                    <p className="m-0 line-clamp-2 font-medium group-hover:text-orange-hi">{q.enunciado}</p>
                  </div>
                  <div className="flex flex-col gap-1 sm:w-36 sm:items-end sm:text-right">
                    <Situacao estado={q.publicado ? "publicada" : "rascunho"} />
                    {fixa && naProva.has(q.id) && <span className="text-[13px] font-medium text-ink">Na prova</span>}
                    {q.em_uso && <span className="text-[13px] text-dim">Já respondida</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// Requisitos do certificado -------------------------------------------------

function inteiro(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function FormRequisitos({ curso }: { curso: CursoAdm }) {
  const aviso = useAvisos();
  const r: Requisitos = curso.requisitos ?? {
    exige_todas_aulas: true,
    exige_modulos: true,
    nota_minima_modulo: 70,
    questoes_modulo: 5,
    nota_minima_final: 80,
    questoes_final: 20,
    espera_final_horas: 24,
    tentativas_final_max: null,
    carga_horaria_h: null,
    certificado_ativo: true,
  };
  const [f, setF] = useState(() => ({
    exige_todas_aulas: r.exige_todas_aulas,
    exige_modulos: r.exige_modulos,
    certificado_ativo: r.certificado_ativo,
    nota_minima_modulo: String(r.nota_minima_modulo),
    questoes_modulo: String(r.questoes_modulo),
    nota_minima_final: String(r.nota_minima_final),
    questoes_final: String(r.questoes_final),
    espera_final_horas: String(r.espera_final_horas),
    tentativas_final_max: r.tentativas_final_max === null ? "" : String(r.tentativas_final_max),
    carga_horaria_h: r.carga_horaria_h === null ? "" : String(r.carga_horaria_h).replace(".", ","),
    modelo_certificado: r.modelo_certificado ?? "",
    final_modo: r.final_modo ?? "sorteio",
  }));
  const salvar = useAcao(
    (sb, dados: Record<string, unknown>) => chamar<CursoAdm>(sb, "academy_adm_salvar_requisitos", { p_curso: curso.slug, p_dados: dados }),
    () => aviso({ titulo: "Regras do certificado salvas", tipo: "ok" }),
  );
  const num = (campo: keyof typeof f) => ({
    value: f[campo] as string,
    onChange: (e: { target: { value: string } }) => setF((x) => ({ ...x, [campo]: e.target.value })),
    inputMode: "numeric" as const,
  });

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    salvar.mutate({
      exige_todas_aulas: f.exige_todas_aulas,
      exige_modulos: f.exige_modulos,
      certificado_ativo: f.certificado_ativo,
      nota_minima_modulo: inteiro(f.nota_minima_modulo),
      questoes_modulo: inteiro(f.questoes_modulo),
      nota_minima_final: inteiro(f.nota_minima_final),
      questoes_final: inteiro(f.questoes_final),
      espera_final_horas: inteiro(f.espera_final_horas),
      tentativas_final_max: inteiro(f.tentativas_final_max),
      carga_horaria_h: inteiro(f.carga_horaria_h.replace(",", ".")),
      ...(r.modelo_certificado !== undefined ? { modelo_certificado: f.modelo_certificado } : {}),
      ...(r.final_modo !== undefined ? { final_modo: f.final_modo } : {}),
    });
  };

  return (
    <form onSubmit={enviar} className="flex max-w-3xl flex-col gap-8">
      <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
        <legend className="mb-4 p-0 font-display text-lg font-semibold">O que o aluno precisa para o certificado</legend>
        <Marcador rotulo="Emitir certificado neste curso" checked={f.certificado_ativo} onChange={(e) => setF((x) => ({ ...x, certificado_ativo: e.target.checked }))} />
        <Marcador rotulo="Concluir todas as aulas publicadas" checked={f.exige_todas_aulas} onChange={(e) => setF((x) => ({ ...x, exige_todas_aulas: e.target.checked }))} />
        <Marcador
          rotulo="Passar nas questões de cada módulo"
          ajuda="O módulo seguinte só libera depois da aprovação nas questões do módulo anterior."
          checked={f.exige_modulos}
          onChange={(e) => setF((x) => ({ ...x, exige_modulos: e.target.checked }))}
        />
      </fieldset>

      <fieldset className="m-0 grid gap-5 border-0 p-0 sm:grid-cols-2">
        <legend className="mb-4 p-0 font-display text-lg font-semibold">Questões de módulo</legend>
        <Campo rotulo="Nota mínima (%)" type="number" min={0} max={100} required {...num("nota_minima_modulo")} />
        <Campo rotulo="Questões por tentativa" type="number" min={1} max={50} required ajuda="Se o módulo tiver menos, usa todas." {...num("questoes_modulo")} />
      </fieldset>

      <fieldset className="m-0 grid gap-5 border-0 p-0 sm:grid-cols-2">
        <legend className="mb-4 p-0 font-display text-lg font-semibold">Avaliação final</legend>
        {r.final_modo !== undefined && (
          <div className="sm:col-span-2">
            <Selecao
              rotulo="Como a prova é montada"
              value={f.final_modo}
              onChange={(e) => setF((x) => ({ ...x, final_modo: e.target.value as "sorteio" | "fixa" }))}
              ajuda={
                f.final_modo === "fixa"
                  ? "Todo aluno recebe as questões que você escolher em Questões, Avaliação final, em ordem diferente para cada um."
                  : "Cada aluno recebe questões sorteadas do banco da avaliação final."
              }
            >
              <option value="sorteio">Sorteio do banco de questões</option>
              <option value="fixa">Prova montada pelo instrutor</option>
            </Selecao>
          </div>
        )}
        <Campo rotulo="Nota mínima (%)" type="number" min={0} max={100} required {...num("nota_minima_final")} />
        {f.final_modo !== "fixa" && <Campo rotulo="Questões sorteadas" type="number" min={1} max={100} required {...num("questoes_final")} />}
        <Campo rotulo="Espera entre tentativas (horas)" type="number" min={0} max={720} required {...num("espera_final_horas")} />
        <Campo rotulo="Máximo de tentativas" type="number" min={1} max={50} ajuda="Deixe em branco para não limitar." {...num("tentativas_final_max")} />
      </fieldset>

      <fieldset className="m-0 grid gap-5 border-0 p-0 sm:grid-cols-2">
        <legend className="mb-4 p-0 font-display text-lg font-semibold">No certificado</legend>
        <Campo
          rotulo="Carga horária (horas)"
          inputMode="decimal"
          value={f.carga_horaria_h}
          onChange={(e) => setF((x) => ({ ...x, carga_horaria_h: e.target.value }))}
          ajuda="Entre 0,5 e 999. Em branco, o curso ainda não emite certificado."
        />
        {r.modelo_certificado !== undefined && (
          <Selecao
            rotulo="Modelo do certificado"
            value={f.modelo_certificado}
            onChange={(e) => setF((x) => ({ ...x, modelo_certificado: e.target.value }))}
            ajuda="Vale para os próximos certificados. Os já emitidos ficam como estão."
          >
            <option value="">Automático ({curso.gratuito ? "gratuito: Clássico claro" : "pago: Técnico"})</option>
            <option value="claro">Clássico claro</option>
            <option value="tecnico">Técnico, com os módulos do curso</option>
          </Selecao>
        )}
      </fieldset>

      <ErroFormulario erro={salvar.error} />
      <div>
        <Botao type="submit" className="h-11 px-5" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando…" : "Salvar regras"}
        </Botao>
      </div>
    </form>
  );
}

// Dados do curso ------------------------------------------------------------

function FormDados({ curso }: { curso: CursoAdm }) {
  const aviso = useAvisos();
  const [f, setF] = useState({ titulo: curso.titulo, descricao: curso.descricao, nivel: curso.nivel, gratuito: curso.gratuito, publicado: curso.publicado });
  const salvar = useAcao(
    (sb, dados: Record<string, unknown>) => chamar<CursoAdm>(sb, "academy_adm_salvar_curso", { p_slug: curso.slug, p_dados: dados }),
    () => aviso({ titulo: "Curso salvo", tipo: "ok" }),
  );
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const dados: Record<string, unknown> = { titulo: f.titulo, descricao: f.descricao, nivel: f.nivel };
    if (curso.eh_admin) Object.assign(dados, { gratuito: f.gratuito, publicado: f.publicado });
    salvar.mutate(dados);
  };

  return (
    <form onSubmit={enviar} className="flex max-w-3xl flex-col gap-5">
      <Campo rotulo="Título" value={f.titulo} onChange={(e) => setF((x) => ({ ...x, titulo: e.target.value }))} limite={80} required minLength={2} />
      <Campo rotulo="Endereço" value={curso.slug} disabled ajuda="O endereço não muda depois de criado, para não quebrar links e certificados." />
      <AreaTexto rotulo="Descrição" value={f.descricao} onChange={(e) => setF((x) => ({ ...x, descricao: e.target.value }))} limite={600} />
      <Selecao rotulo="Nível" value={f.nivel} onChange={(e) => setF((x) => ({ ...x, nivel: e.target.value as Nivel }))}>
        {NIVEIS.map((n) => (
          <option key={n.valor} value={n.valor}>
            {n.rotulo}
          </option>
        ))}
      </Selecao>
      {curso.eh_admin ? (
        <div className="flex flex-col gap-4 pt-2">
          <Marcador rotulo="Curso gratuito" checked={f.gratuito} onChange={(e) => setF((x) => ({ ...x, gratuito: e.target.checked }))} />
          <Marcador
            rotulo="Curso publicado"
            ajuda="Publicado, o curso aparece para os alunos matriculados com as aulas publicadas dele."
            checked={f.publicado}
            onChange={(e) => setF((x) => ({ ...x, publicado: e.target.checked }))}
          />
        </div>
      ) : (
        <p className="m-0 text-sm text-muted">Publicar o curso e definir se ele é gratuito fica com o admin da Academy.</p>
      )}
      <ErroFormulario erro={salvar.error} />
      <div>
        <Botao type="submit" className="h-11 px-5" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando…" : "Salvar curso"}
        </Botao>
      </div>
    </form>
  );
}
