import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { ChevronLeft, Plus, X } from "lucide-react";
import { chamar, semAcesso, useAcao, useCursoAdm, useQuestoesAdm, type CursoAdm, type QuestaoAdm } from "@/lib/instrutor";
import { rotuloModulo } from "@/lib/aula";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { AreaTexto, ErroFormulario, Marcador, Selecao, Situacao } from "@/components/instrutor/Campos";
import { cn } from "@/lib/cn";
import { FalhaCarregamento, NaoEncontrado } from "../Estados";
import { filtrosQuestoes } from "./filtros-questoes";

const LETRAS = "ABCDEFGH";

export default function QuestaoInstrutor() {
  const { slug = "", id = "" } = useParams();
  const [busca] = useSearchParams();
  const curso = useCursoAdm(slug);
  const questoes = useQuestoesAdm(slug);
  const erro = curso.error ?? questoes.error;

  if (erro) {
    if (semAcesso(erro)) return <NaoEncontrado />;
    return <FalhaCarregamento tentar={() => void (curso.refetch(), questoes.refetch())} />;
  }
  const nova = id === "nova";
  const questao = nova || !questoes.data ? null : questoes.data.find((q) => q.id === id);
  if (!curso.data || !questoes.data || (!nova && !questao && questoes.isFetching))
    return (
      <div aria-busy="true" aria-label="Carregando a questão" className="flex max-w-3xl flex-col gap-5">
        <Esqueleto className="h-9 w-72" />
        <Esqueleto className="h-28 w-full" />
        <Esqueleto className="h-40 w-full" />
      </div>
    );
  if (!nova && !questao) return <NaoEncontrado />;

  const pedido = busca.get("modulo");
  const moduloInicial = questao ? (questao.modulo_id ?? "final") : pedido && (pedido === "final" || curso.data.modulos.some((m) => m.id === pedido)) ? pedido : "final";
  return <Formulario key={id} curso={curso.data} questao={questao ?? null} moduloInicial={moduloInicial} />;
}

interface Alt {
  chave: number;
  texto: string;
}

function Formulario({ curso, questao, moduloInicial }: { curso: CursoAdm; questao: QuestaoAdm | null; moduloInicial: string }) {
  const navegar = useNavigate();
  const aviso = useAvisos();
  const [busca] = useSearchParams();
  const filtros = filtrosQuestoes(busca);
  const voltar = `/instrutor/cursos/${curso.slug}?aba=questoes${filtros ? `&${filtros}` : ""}`;
  const [modulo, setModulo] = useState(moduloInicial);
  const [enunciado, setEnunciado] = useState(questao?.enunciado ?? "");
  const [explicacao, setExplicacao] = useState(questao?.explicacao ?? "");
  const [publicado, setPublicado] = useState(questao?.publicado ?? false);
  const [alts, setAlts] = useState<Alt[]>(() =>
    questao ? questao.alternativas.map((a, i) => ({ chave: i, texto: a.texto })) : [0, 1, 2, 3].map((i) => ({ chave: i, texto: "" })),
  );
  const [correta, setCorreta] = useState(() => {
    const i = questao?.alternativas.findIndex((a) => a.correta) ?? -1;
    return i >= 0 ? i : 0;
  });
  const [prox, setProx] = useState(alts.length);

  const salvar = useAcao(
    (sb, dados: Record<string, unknown>) => chamar<QuestaoAdm[]>(sb, "academy_adm_salvar_questao", { p_id: questao?.id ?? null, p_dados: dados }),
    (lista) => {
      aviso({ titulo: questao ? "Questão salva" : "Questão criada", tipo: "ok" });
      if (!questao) {
        const criada = lista.reduce<QuestaoAdm | undefined>((u, q) => (!u || q.atualizado_em > u.atualizado_em ? q : u), undefined);
        navegar(criada ? `/instrutor/cursos/${curso.slug}/questoes/${criada.id}${filtros ? `?${filtros}` : ""}` : voltar, { replace: true });
      }
    },
  );
  const excluir = useAcao(
    (sb, idQ: string) => chamar<QuestaoAdm[]>(sb, "academy_adm_excluir_questao", { p_id: idQ }),
    () => {
      aviso({ titulo: "Questão excluída", tipo: "ok" });
      navegar(voltar);
    },
  );

  const remover = (i: number) => {
    setAlts((a) => a.filter((_, j) => j !== i));
    setCorreta((c) => (c === i ? 0 : c > i ? c - 1 : c));
  };
  const adicionar = () => {
    setAlts((a) => [...a, { chave: prox, texto: "" }]);
    setProx((p) => p + 1);
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    salvar.mutate({
      curso_slug: curso.slug,
      modulo_id: modulo === "final" ? null : modulo,
      enunciado,
      explicacao,
      publicado,
      alternativas: alts.map((a, i) => ({ texto: a.texto, correta: i === correta })),
    });
  };

  return (
    <>
      <Link to={voltar} className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronLeft className="size-4" aria-hidden="true" /> Questões de {curso.titulo}
      </Link>
      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2">
        <h1 className="m-0 font-display text-[clamp(26px,2.6vw,34px)] leading-tight font-semibold tracking-tight">{questao ? "Editar questão" : "Nova questão"}</h1>
        {questao && <Situacao estado={questao.publicado ? "publicada" : "rascunho"} />}
      </div>

      {questao?.em_uso && (
        <p className="m-0 mb-6 max-w-3xl rounded-[10px] border border-line-hi bg-panel px-4 py-3 text-sm text-muted">
          Alunos já responderam esta questão. Corrigir texto é seguro; trocar a alternativa correta não muda notas já dadas.
        </p>
      )}

      <form onSubmit={enviar} className="flex max-w-3xl flex-col gap-6">
        <Selecao rotulo="Onde entra" value={modulo} onChange={(e) => setModulo(e.target.value)}>
          <option value="final">Avaliação final</option>
          {curso.modulos.map((m) => (
            <option key={m.id} value={m.id}>
              Questões do {rotuloModulo(m.ordem, m.titulo)}
            </option>
          ))}
        </Selecao>
        <AreaTexto rotulo="Enunciado" value={enunciado} onChange={(e) => setEnunciado(e.target.value)} limite={2000} required minLength={10} autoFocus={!questao} />

        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="mb-1 p-0 text-sm font-medium text-ink">Alternativas</legend>
          <p className="m-0 mb-1 text-[13px] text-muted">Marque a correta. O portal embaralha a ordem para cada aluno.</p>
          {alts.map((a, i) => (
            <div
              key={a.chave}
              className={cn(
                "flex items-start gap-3 rounded-xl border bg-bg p-3 transition-colors duration-150",
                i === correta ? "border-ok/50" : "border-line-hi",
              )}
            >
              <input
                type="radio"
                name="correta"
                checked={i === correta}
                onChange={() => setCorreta(i)}
                aria-label={`Alternativa ${LETRAS[i]} é a correta`}
                className="mt-2.5 size-[18px] shrink-0 accent-[var(--color-ok)]"
              />
              <span className="mt-2 w-4 shrink-0 font-display text-sm font-semibold text-dim" aria-hidden="true">
                {LETRAS[i]}
              </span>
              <textarea
                value={a.texto}
                onChange={(e) => setAlts((x) => x.map((y, j) => (j === i ? { ...y, texto: e.target.value } : y)))}
                aria-label={`Texto da alternativa ${LETRAS[i]}`}
                maxLength={600}
                required
                rows={1}
                className="min-h-10 flex-1 resize-y rounded-lg border border-transparent bg-transparent px-2 py-2 text-[15px] leading-snug text-ink hover:border-line focus:border-orange-hi focus:outline-none"
              />
              {i === correta && <span className="mt-2 shrink-0 text-[13px] font-medium text-ok">Correta</span>}
              <button
                type="button"
                onClick={() => remover(i)}
                disabled={alts.length <= 2}
                aria-label={`Remover alternativa ${LETRAS[i]}`}
                className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-ink disabled:opacity-30"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))}
          {alts.length < 8 && (
            <button type="button" onClick={adicionar} className="inline-flex h-9 items-center gap-1.5 self-start rounded-lg px-2 text-sm font-medium text-muted hover:bg-white/5 hover:text-ink">
              <Plus className="size-4" aria-hidden="true" /> Adicionar alternativa
            </button>
          )}
        </fieldset>

        <AreaTexto
          rotulo="Explicação"
          value={explicacao}
          onChange={(e) => setExplicacao(e.target.value)}
          limite={2000}
          ajuda="O aluno vê depois de responder, junto com a correção."
        />
        <Marcador rotulo="Questão publicada" ajuda="Só questões publicadas entram nas provas." checked={publicado} onChange={(e) => setPublicado(e.target.checked)} />
        <ErroFormulario erro={salvar.error ?? excluir.error} />
        <div className="flex flex-wrap gap-3">
          <Botao type="submit" className="h-11 px-5" disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando…" : questao ? "Salvar questão" : "Criar questão"}
          </Botao>
          <Link to={voltar} className="inline-flex h-11 items-center rounded-[10px] border border-line-hi px-5 font-semibold transition-colors duration-150 hover:border-muted">
            Voltar
          </Link>
          {questao && !questao.em_uso && (
            <button
              type="button"
              onClick={() => excluir.mutate(questao.id)}
              disabled={excluir.isPending}
              className="ml-auto h-11 rounded-[10px] px-4 font-medium text-muted hover:text-bad"
            >
              Excluir questão
            </button>
          )}
        </div>
      </form>
    </>
  );
}
