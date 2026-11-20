import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { usePortal } from "@/lib/portal";
import { chamar, useAcao, type CursoAdm } from "@/lib/instrutor";
import { SEVERIDADE, type Severidade, type TipoEvidencia } from "@/lib/missoes";
import {
  AJUDA_TEXTO,
  TIPOS_EVIDENCIA,
  conferir,
  evidenciaVazia,
  paraBanco,
  paraForm,
  perguntaVazia,
  type EvidenciaForm,
  type MissaoAdm,
  type MissaoForm,
  type MissoesAdm,
  type PerguntaForm,
} from "@/lib/missoes-editor";
import { cn } from "@/lib/cn";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { AreaTexto, Campo, ErroFormulario, Marcador, Selecao } from "@/components/instrutor/Campos";
import { Etiquetas } from "@/components/missao/Cabecalho";
import { FalhaCarregamento } from "../Estados";

function useMissoesAdm(curso: string) {
  const { sb } = usePortal();
  return useQuery({ queryKey: ["adm", "missoes", curso], queryFn: () => chamar<MissoesAdm>(sb, "academy_adm_missoes", { p_curso: curso }) });
}

/**
 * Aba "Missões" do curso (fase 15): casos práticos com evidências e
 * investigação. O aluno só vê a missão publicada, e o gabarito só depois de
 * enviar a investigação.
 */
export function AbaMissoes({ curso }: { curso: CursoAdm }) {
  const lista = useMissoesAdm(curso.slug);
  const [editando, setEditando] = useState<MissaoAdm | "nova" | null>(null);
  if (lista.isError) return <FalhaCarregamento tentar={() => void lista.refetch()} />;
  if (!lista.data)
    return (
      <div aria-busy="true" aria-label="Carregando as missões" className="flex max-w-3xl flex-col gap-3">
        <Esqueleto className="h-20 w-full" />
        <Esqueleto className="h-20 w-full" />
      </div>
    );
  if (editando !== null)
    return (
      <EditorMissao
        key={editando === "nova" ? "nova" : editando.id}
        curso={curso.slug}
        missao={editando === "nova" ? null : editando}
        competencias={lista.data.competencias}
        fechar={() => setEditando(null)}
      />
    );

  return (
    <section aria-labelledby="h-missoes" className="max-w-4xl">
      <div className="mb-2 flex flex-wrap items-center gap-4">
        <h2 id="h-missoes" className="m-0 font-display text-xl font-semibold">
          Missões do curso
        </h2>
        <Botao className="ml-auto h-10 px-4" onClick={() => setEditando("nova")}>
          <Plus className="size-4" aria-hidden="true" /> Nova missão
        </Botao>
      </div>
      <p className="m-0 mb-6 max-w-2xl text-sm text-muted">
        Um caso prático no fim do curso: o aluno examina as evidências, fixa as que provam o caso e responde a investigação. A correção, com a
        explicação de cada pergunta, só aparece depois do envio.
      </p>
      {lista.data.missoes.length === 0 ? (
        <p className="m-0 text-muted">Este curso ainda não tem missão.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {lista.data.missoes.map((m) => (
            <li key={m.id} aria-label={`${m.codigo}, ${m.titulo}`} className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line py-4 last:border-b-0">
              <div className="flex min-w-0 flex-1 basis-72 flex-col gap-1.5">
                <Etiquetas severidade={m.severidade} codigo={m.codigo} />
                <p className="m-0 font-medium">{m.titulo}</p>
              </div>
              <div className="basis-48 text-[13px] text-muted">
                <p className="m-0">
                  {m.evidencias.length} {m.evidencias.length === 1 ? "evidência" : "evidências"}, {m.perguntas.length}{" "}
                  {m.perguntas.length === 1 ? "pergunta" : "perguntas"}
                </p>
                <p className="m-0">
                  {m.tentativas} {m.tentativas === 1 ? "tentativa" : "tentativas"}, {m.aprovados} {m.aprovados === 1 ? "aluno aprovado" : "alunos aprovados"}
                </p>
              </div>
              <p className={cn("m-0 w-24 text-[13px] font-medium", m.publicado ? "text-ok" : "text-dim")}>{m.publicado ? "Publicada" : "Rascunho"}</p>
              <Botao variante="contorno" className="h-9 px-3 text-sm" onClick={() => setEditando(m)}>
                Editar
              </Botao>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function mover<T>(lista: T[], i: number, passo: number): T[] {
  const j = i + passo;
  if (j < 0 || j >= lista.length) return lista;
  const nova = [...lista];
  [nova[i], nova[j]] = [nova[j]!, nova[i]!];
  return nova;
}

function EditorMissao({
  curso,
  missao,
  competencias,
  fechar,
}: {
  curso: string;
  missao: MissaoAdm | null;
  competencias: { slug: string; titulo: string }[];
  fechar: () => void;
}) {
  const aviso = useAvisos();
  const [f, setF] = useState<MissaoForm>(() => paraForm(missao));
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const salvar = useAcao(
    (sb, dados: Record<string, unknown>) => chamar<MissoesAdm>(sb, "academy_adm_salvar_missao", { p_curso: curso, p_dados: dados }),
    () => {
      aviso({ titulo: f.publicado ? "Missão salva e publicada" : "Missão salva como rascunho", tipo: "ok" });
      fechar();
    },
  );
  const excluir = useAcao(
    (sb, id: string) => chamar<MissoesAdm>(sb, "academy_adm_excluir_missao", { p_id: id }),
    () => {
      aviso({ titulo: "Missão excluída", tipo: "ok" });
      fechar();
    },
  );
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    setErroLocal(null);
    const problema = conferir(f);
    if (problema) return setErroLocal(problema);
    salvar.mutate(paraBanco(f));
  };
  const evid = (i: number, mudar: Partial<EvidenciaForm>) => setF({ ...f, evidencias: f.evidencias.map((e, j) => (j === i ? { ...e, ...mudar } : e)) });
  const perg = (i: number, mudar: Partial<PerguntaForm>) => setF({ ...f, perguntas: f.perguntas.map((p, j) => (j === i ? { ...p, ...mudar } : p)) });
  const titulo = missao ? `Editar ${missao.codigo}` : "Nova missão";

  return (
    <form onSubmit={enviar} aria-label={titulo} className="flex max-w-4xl flex-col gap-10">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="m-0 font-display text-2xl font-semibold">{titulo}</h2>
        <Botao variante="contorno" className="ml-auto h-10 px-4" onClick={fechar}>
          Voltar para a lista
        </Botao>
      </div>
      {missao && missao.tentativas > 0 && (
        <p className="m-0 -mt-6 rounded-xl border border-line bg-panel px-4 py-3 text-sm text-muted">
          {missao.tentativas} {missao.tentativas === 1 ? "tentativa já foi feita" : "tentativas já foram feitas"}. Mudanças valem para as próximas; o resultado de quem já fez continua como estava.
        </p>
      )}

      <fieldset className="m-0 flex flex-col gap-5 border-0 p-0">
        <legend className="mb-4 p-0 font-display text-lg font-semibold">O caso</legend>
        <div className="grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)_12rem]">
          <Campo rotulo="Código" value={f.codigo} onChange={(e) => setF({ ...f, codigo: e.target.value.toUpperCase() })} placeholder="MSN-002" required maxLength={9} />
          <Campo rotulo="Título" value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} limite={80} required />
          <Selecao rotulo="Severidade" value={f.severidade} onChange={(e) => setF({ ...f, severidade: e.target.value as Severidade })}>
            {(Object.keys(SEVERIDADE) as Severidade[]).map((s) => (
              <option key={s} value={s}>
                {SEVERIDADE[s]}
              </option>
            ))}
          </Selecao>
        </div>
        <Campo rotulo="Técnica do MITRE ATT&CK (opcional)" value={f.mitre} onChange={(e) => setF({ ...f, mitre: e.target.value })} limite={120} placeholder="MITRE ATT&CK T1566.002 · Phishing com link" />
        <AreaTexto
          rotulo="Briefing"
          ajuda="O que aconteceu e qual é o papel do aluno. Aparece no topo da missão."
          value={f.briefing}
          onChange={(e) => setF({ ...f, briefing: e.target.value })}
          limite={1200}
          required
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Selecao rotulo="Liberada quando" value={f.requisito} onChange={(e) => setF({ ...f, requisito: e.target.value as "aulas" | "matricula" })}>
            <option value="aulas">O aluno concluir as aulas do curso</option>
            <option value="matricula">O aluno se matricular no curso</option>
          </Selecao>
          <Campo rotulo="Selo de quem passa (opcional)" value={f.selo} onChange={(e) => setF({ ...f, selo: e.target.value })} limite={60} placeholder="Caçador de phishing" />
        </div>
        <AreaTexto
          rotulo="Fechamento (opcional)"
          ajuda="Aparece depois do envio: o que o caso real ainda pediria."
          value={f.encerramento}
          onChange={(e) => setF({ ...f, encerramento: e.target.value })}
          limite={800}
          className="min-h-20"
        />
      </fieldset>

      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="mb-1 p-0 font-display text-lg font-semibold">Competências que a missão desenvolve</legend>
        <p className="m-0 text-sm text-muted">Quem passa na missão soma o peso nas competências marcadas, como uma aula concluída.</p>
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {competencias.map((c) => {
            const peso = f.competencias[c.slug];
            return (
              <li key={c.slug} className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-2.5">
                <Marcador
                  rotulo={c.titulo}
                  className="flex-1"
                  checked={peso !== undefined}
                  onChange={(e) => {
                    const nova = { ...f.competencias };
                    if (e.target.checked) nova[c.slug] = 2;
                    else delete nova[c.slug];
                    setF({ ...f, competencias: nova });
                  }}
                />
                {peso !== undefined && (
                  <label className="flex items-center gap-2 text-sm text-muted">
                    Peso
                    <select
                      value={peso}
                      onChange={(e) => setF({ ...f, competencias: { ...f.competencias, [c.slug]: Number(e.target.value) } })}
                      className="h-9 rounded-lg border border-line-hi bg-bg px-2 text-ink"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className="m-0 flex flex-col gap-5 border-0 p-0">
        <legend className="mb-1 p-0 font-display text-lg font-semibold">Evidências</legend>
        <p className="m-0 -mt-3 text-sm text-muted">Cada evidência vira uma aba. O aluno pode fixar qualquer linha como prova.</p>
        {f.evidencias.map((e, i) => (
          <div key={e.id} role="group" aria-label={`Evidência ${i + 1}`} className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-5">
            <div className="flex flex-wrap items-end gap-4">
              <Selecao
                rotulo="Tipo"
                value={e.tipo}
                onChange={(x) => evid(i, { ...evidenciaVazia(x.target.value as TipoEvidencia), id: e.id, titulo: e.titulo, dica: e.dica })}
                className="w-48"
              >
                {(Object.keys(TIPOS_EVIDENCIA) as TipoEvidencia[]).map((t) => (
                  <option key={t} value={t}>
                    {TIPOS_EVIDENCIA[t]}
                  </option>
                ))}
              </Selecao>
              <div className="min-w-48 flex-1">
                <Campo rotulo="Título da aba" value={e.titulo} onChange={(x) => evid(i, { titulo: x.target.value })} limite={40} />
              </div>
              <Ordem
                rotulo={`evidência ${i + 1}`}
                subir={i > 0 ? () => setF({ ...f, evidencias: mover(f.evidencias, i, -1) }) : undefined}
                descer={i < f.evidencias.length - 1 ? () => setF({ ...f, evidencias: mover(f.evidencias, i, 1) }) : undefined}
                remover={() => setF({ ...f, evidencias: f.evidencias.filter((_, j) => j !== i) })}
              />
            </div>
            {e.tipo === "email" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo rotulo="De" value={e.de} onChange={(x) => evid(i, { de: x.target.value })} limite={200} />
                <Campo rotulo="Para" value={e.para} onChange={(x) => evid(i, { para: x.target.value })} limite={200} />
                <div className="sm:col-span-2">
                  <Campo rotulo="Assunto" value={e.assunto} onChange={(x) => evid(i, { assunto: x.target.value })} limite={200} />
                </div>
                <div className="sm:col-span-2">
                  <AreaTexto rotulo="Corpo" value={e.corpo} onChange={(x) => evid(i, { corpo: x.target.value })} limite={4000} />
                </div>
                <Campo rotulo="Texto do botão (opcional)" value={e.link_texto} onChange={(x) => evid(i, { link_texto: x.target.value })} limite={60} />
                <Campo rotulo="Para onde o botão leva" value={e.link_destino} onChange={(x) => evid(i, { link_destino: x.target.value })} limite={300} />
                <Campo rotulo="Assinatura (opcional)" value={e.assinatura} onChange={(x) => evid(i, { assinatura: x.target.value })} limite={120} />
              </div>
            )}
            {e.tipo === "alerta" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo rotulo="Título do alerta" value={e.alerta_titulo} onChange={(x) => evid(i, { alerta_titulo: x.target.value })} limite={60} placeholder="NÍVEL 10" />
                <Campo rotulo="Regra (opcional)" value={e.alerta_subtitulo} onChange={(x) => evid(i, { alerta_subtitulo: x.target.value })} limite={120} placeholder="regra 100210 · personalizada" />
              </div>
            )}
            {e.tipo !== "email" && (
              <AreaTexto
                rotulo={e.tipo === "texto" ? "Texto" : e.tipo === "tabela" ? "Colunas e linhas" : "Linhas"}
                ajuda={AJUDA_TEXTO[e.tipo]}
                value={e.texto}
                onChange={(x) => evid(i, { texto: x.target.value })}
                className="font-mono text-[13.5px]"
                spellCheck={false}
              />
            )}
            <Campo rotulo="Dica abaixo da evidência (opcional)" value={e.dica} onChange={(x) => evid(i, { dica: x.target.value })} limite={300} />
          </div>
        ))}
        <div>
          <Botao variante="contorno" className="h-10 px-4" onClick={() => setF({ ...f, evidencias: [...f.evidencias, evidenciaVazia()] })} disabled={f.evidencias.length >= 8}>
            <Plus className="size-4" aria-hidden="true" /> Adicionar evidência
          </Botao>
        </div>
      </fieldset>

      <fieldset className="m-0 flex flex-col gap-5 border-0 p-0">
        <legend className="mb-1 p-0 font-display text-lg font-semibold">Investigação</legend>
        <p className="m-0 -mt-3 text-sm text-muted">
          Uma alternativa por linha. Comece com * as certas: com mais de uma certa, o aluno marca todas as que se aplicam.
        </p>
        {f.perguntas.map((p, i) => (
          <div key={p.id} role="group" aria-label={`Pergunta ${i + 1}`} className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-5">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-60 flex-1">
                <Campo rotulo={`Pergunta ${i + 1}`} value={p.enunciado} onChange={(x) => perg(i, { enunciado: x.target.value })} limite={300} />
              </div>
              <Ordem
                rotulo={`pergunta ${i + 1}`}
                subir={i > 0 ? () => setF({ ...f, perguntas: mover(f.perguntas, i, -1) }) : undefined}
                descer={i < f.perguntas.length - 1 ? () => setF({ ...f, perguntas: mover(f.perguntas, i, 1) }) : undefined}
                remover={() => setF({ ...f, perguntas: f.perguntas.filter((_, j) => j !== i) })}
              />
            </div>
            <Campo rotulo="Dica (opcional)" value={p.dica} onChange={(x) => perg(i, { dica: x.target.value })} limite={200} />
            <AreaTexto rotulo="Alternativas" value={p.alternativas} onChange={(x) => perg(i, { alternativas: x.target.value })} className="min-h-24" placeholder={"* A certa\nOutra\nMais uma"} />
            <AreaTexto rotulo="Explicação" ajuda="O aluno vê depois de enviar." value={p.explicacao} onChange={(x) => perg(i, { explicacao: x.target.value })} limite={800} className="min-h-20" />
          </div>
        ))}
        <div>
          <Botao variante="contorno" className="h-10 px-4" onClick={() => setF({ ...f, perguntas: [...f.perguntas, perguntaVazia()] })} disabled={f.perguntas.length >= 15}>
            <Plus className="size-4" aria-hidden="true" /> Adicionar pergunta
          </Botao>
        </div>
      </fieldset>

      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-5">
        <Marcador
          rotulo="Publicada"
          ajuda="Os alunos do curso veem a missão. Sem marcar, fica como rascunho."
          checked={f.publicado}
          onChange={(e) => setF({ ...f, publicado: e.target.checked })}
        />
        <ErroFormulario erro={erroLocal ? new Error(erroLocal) : (salvar.error ?? excluir.error)} />
        <div className="flex flex-wrap items-center gap-3">
          <Botao type="submit" className="h-11 px-5" disabled={salvar.isPending}>
            {salvar.isPending ? "Salvando…" : "Salvar missão"}
          </Botao>
          <Botao variante="contorno" className="h-11 px-5" onClick={fechar}>
            Cancelar
          </Botao>
          {missao && missao.tentativas === 0 && (
            <span className="ml-auto flex items-center gap-3">
              {confirmarExclusao ? (
                <>
                  <span className="text-sm text-muted">Excluir de vez?</span>
                  <Botao variante="contorno" className="h-10 px-4" onClick={() => excluir.mutate(missao.id)} disabled={excluir.isPending}>
                    Confirmar exclusão
                  </Botao>
                  <Botao variante="contorno" className="h-10 px-4" onClick={() => setConfirmarExclusao(false)}>
                    Manter
                  </Botao>
                </>
              ) : (
                <Botao variante="contorno" className="h-10 px-4" onClick={() => setConfirmarExclusao(true)}>
                  <Trash2 className="size-4" aria-hidden="true" /> Excluir missão
                </Botao>
              )}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}

function Ordem({ rotulo, subir, descer, remover }: { rotulo: string; subir?: () => void; descer?: () => void; remover: () => void }) {
  const botao = "grid size-11 place-items-center rounded-[10px] border border-line-hi text-muted hover:border-muted hover:text-ink disabled:opacity-40";
  return (
    <div className="flex gap-2">
      <button type="button" className={botao} onClick={subir} disabled={!subir} aria-label={`Subir ${rotulo}`}>
        <ArrowUp className="size-4" aria-hidden="true" />
      </button>
      <button type="button" className={botao} onClick={descer} disabled={!descer} aria-label={`Descer ${rotulo}`}>
        <ArrowDown className="size-4" aria-hidden="true" />
      </button>
      <button type="button" className={botao} onClick={remover} aria-label={`Remover ${rotulo}`}>
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
