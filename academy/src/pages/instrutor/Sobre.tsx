import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import {
  chamar,
  useAcao,
  useInstrutoresAdm,
  type CursoAdm,
  type InstrutoresDoCurso,
  type PapelNoCurso,
  type VinculoInstrutor,
} from "@/lib/instrutor";
import { iniciais } from "@/lib/formato";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { AreaTexto, ErroFormulario, Marcador, Selecao } from "@/components/instrutor/Campos";
import { FormPerfil, type DadosPerfil } from "@/components/instrutor/FormPerfil";
import { FalhaCarregamento } from "../Estados";

const MAX_OBJETIVOS = 10;

/** Aba "Sobre o curso": o que o aluno lê antes de começar e quem ensina. */
export function AbaSobre({ curso }: { curso: CursoAdm }) {
  return (
    <div className="flex max-w-3xl flex-col gap-12">
      <FormSobre curso={curso} />
      <Instrutores slug={curso.slug} />
    </div>
  );
}

function FormSobre({ curso }: { curso: CursoAdm }) {
  const aviso = useAvisos();
  const [objetivos, setObjetivos] = useState<{ chave: number; texto: string }[]>(() =>
    (curso.objetivos?.length ? curso.objetivos : [""]).map((texto, chave) => ({ chave, texto })),
  );
  const [prox, setProx] = useState(objetivos.length);
  const [publico, setPublico] = useState(curso.publico ?? "");
  const [pre, setPre] = useState(curso.pre_requisitos ?? "");
  const salvar = useAcao(
    (sb, dados: Record<string, unknown>) => chamar<CursoAdm>(sb, "academy_adm_salvar_sobre", { p_curso: curso.slug, p_dados: dados }),
    () => aviso({ titulo: "Sobre o curso salvo", tipo: "ok" }),
  );
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    salvar.mutate({ objetivos: objetivos.map((o) => o.texto.trim()).filter(Boolean), publico, pre_requisitos: pre });
  };

  return (
    <form onSubmit={enviar} aria-labelledby="h-sobre" className="flex flex-col gap-6">
      <div>
        <h2 id="h-sobre" className="m-0 font-display text-lg font-semibold">
          O que o aluno lê antes de começar
        </h2>
        <p className="m-0 mt-1 text-sm text-muted">Aparece na página do curso, embaixo dos módulos. Bloco vazio não aparece.</p>
      </div>

      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-1 p-0 text-sm font-medium text-ink">O que você vai aprender</legend>
        <p className="m-0 mb-1 text-[13px] text-muted">Um objetivo por linha, começando pelo verbo: "Triar alertas no SIEM".</p>
        {objetivos.map((o, i) => (
          <div key={o.chave} className="flex items-center gap-2">
            <input
              value={o.texto}
              onChange={(e) => setObjetivos((x) => x.map((y, j) => (j === i ? { ...y, texto: e.target.value } : y)))}
              aria-label={`Objetivo ${i + 1}`}
              maxLength={200}
              className="h-11 flex-1 rounded-[10px] border border-line-hi bg-bg px-3.5 text-[15px] text-ink transition-colors duration-150 hover:border-muted focus:border-orange-hi focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setObjetivos((x) => (x.length > 1 ? x.filter((_, j) => j !== i) : [{ chave: prox, texto: "" }]))}
              aria-label={`Remover objetivo ${i + 1}`}
              className="grid size-9 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        {objetivos.length < MAX_OBJETIVOS && (
          <button
            type="button"
            onClick={() => {
              setObjetivos((x) => [...x, { chave: prox, texto: "" }]);
              setProx((p) => p + 1);
            }}
            className="inline-flex h-9 items-center gap-1.5 self-start rounded-lg px-2 text-sm font-medium text-muted hover:bg-white/5 hover:text-ink"
          >
            <Plus className="size-4" aria-hidden="true" /> Adicionar objetivo
          </button>
        )}
      </fieldset>

      <AreaTexto rotulo="Para quem é" value={publico} onChange={(e) => setPublico(e.target.value)} limite={600} />
      <AreaTexto rotulo="Pré-requisitos" value={pre} onChange={(e) => setPre(e.target.value)} limite={600} ajuda='Se não houver, escreva "Nenhum".' />
      <ErroFormulario erro={salvar.error} />
      <div>
        <Botao type="submit" className="h-11 px-5" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando…" : "Salvar sobre o curso"}
        </Botao>
      </div>
    </form>
  );
}

const PAPEIS: { valor: PapelNoCurso; rotulo: string }[] = [
  { valor: "instrutor", rotulo: "Instrutor" },
  { valor: "convidado", rotulo: "Convidado" },
];

function Instrutores({ slug }: { slug: string }) {
  const lista = useInstrutoresAdm(slug);
  const aviso = useAvisos();
  const [modo, setModo] = useState<"nenhum" | "convidar" | { editar: VinculoInstrutor }>("nenhum");
  const [marcados, setMarcados] = useState<string[]>([]);
  const [papel, setPapel] = useState<PapelNoCurso>("instrutor");

  // Chave "c:<cartão>" para quem já tem perfil e "p:<conta>" para quem é da Equipe e ainda não tem.
  const vincular = useAcao(
    (sb, a: { chaves: string[]; papel: PapelNoCurso }) =>
      chamar<InstrutoresDoCurso>(sb, "academy_adm_acrescentar_instrutores", {
        p_curso: slug,
        p_instrutores: a.chaves.filter((k) => k.startsWith("c:")).map((k) => k.slice(2)),
        p_pessoas: a.chaves.filter((k) => k.startsWith("p:")).map((k) => k.slice(2)),
        p_papel: a.papel,
      }),
    (_r, a) => {
      setMarcados([]);
      aviso({ titulo: a.chaves.length === 1 ? "Acrescentado ao curso" : `${a.chaves.length} pessoas acrescentadas ao curso`, tipo: "ok" });
    },
  );
  const desvincular = useAcao((sb, id: string) => chamar<InstrutoresDoCurso>(sb, "academy_adm_desvincular_instrutor", { p_curso: slug, p_instrutor: id }));
  const mover = useAcao((sb, a: { id: string; direcao: number }) =>
    chamar<InstrutoresDoCurso>(sb, "academy_adm_mover_instrutor", { p_curso: slug, p_instrutor: a.id, p_direcao: a.direcao }),
  );
  const salvarPerfil = useAcao(
    (sb, a: { id: string | null; dados: DadosPerfil }) => chamar<InstrutoresDoCurso>(sb, "academy_adm_salvar_instrutor", { p_curso: slug, p_id: a.id, p_dados: a.dados }),
    (_r, a) => {
      aviso({ titulo: a.id ? "Perfil salvo" : "Convidado adicionado ao curso", tipo: "ok" });
      setModo("nenhum");
    },
  );

  if (lista.isError) return <FalhaCarregamento tentar={() => void lista.refetch()} />;
  const ocupado = vincular.isPending || desvincular.isPending || mover.isPending;
  const erro = vincular.error ?? desvincular.error ?? mover.error;

  return (
    <section aria-labelledby="h-quem-ensina" className="flex flex-col gap-5">
      <div>
        <h2 id="h-quem-ensina" className="m-0 font-display text-lg font-semibold">
          Quem ensina
        </h2>
        <p className="m-0 mt-1 text-sm text-muted">
          Quem aparece para o aluno, nesta ordem. Convidado aparece no curso sem acesso ao painel. Para editar o curso, a pessoa precisa estar na Equipe.
        </p>
      </div>

      {!lista.data ? (
        <Esqueleto className="h-20 w-full" />
      ) : (
        <>
          {lista.data.do_curso.length === 0 ? (
            <p className="m-0 text-muted">Ninguém aparece neste curso ainda.</p>
          ) : (
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {lista.data.do_curso.map((v, i) => (
                <li key={v.instrutor.id} className="painel-card flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                  <span aria-hidden="true" className="grid size-10 flex-none place-items-center rounded-full border border-line-hi bg-bg text-sm font-semibold">
                    {iniciais(v.instrutor.nome)}
                  </span>
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="m-0 truncate font-medium">{v.instrutor.nome}</p>
                    <p className="m-0 truncate text-[13px] text-muted">
                      {v.papel === "convidado" ? "Convidado" : "Instrutor"}
                      {v.instrutor.cargo ? `, ${v.instrutor.cargo}` : ""}
                      {!v.instrutor.bio && <span className="text-warn">, sem bio</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icone rotulo={`Subir ${v.instrutor.nome}`} onClick={() => mover.mutate({ id: v.instrutor.id, direcao: -1 })} disabled={i === 0 || ocupado}>
                      <ArrowUp className="size-4" aria-hidden="true" />
                    </Icone>
                    <Icone
                      rotulo={`Descer ${v.instrutor.nome}`}
                      onClick={() => mover.mutate({ id: v.instrutor.id, direcao: 1 })}
                      disabled={i === lista.data!.do_curso.length - 1 || ocupado}
                    >
                      <ArrowDown className="size-4" aria-hidden="true" />
                    </Icone>
                    {(!v.instrutor.da_equipe || v.instrutor.eu) && (
                      <Botao variante="contorno" className="h-9 px-3 text-sm" onClick={() => setModo({ editar: v })} aria-label={`Editar perfil de ${v.instrutor.nome}`}>
                        Editar
                      </Botao>
                    )}
                    <Icone rotulo={`Tirar ${v.instrutor.nome} do curso`} onClick={() => desvincular.mutate(v.instrutor.id)} disabled={ocupado}>
                      <X className="size-4" aria-hidden="true" />
                    </Icone>
                  </div>
                </li>
              ))}
            </ol>
          )}
          <ErroFormulario erro={erro} />

          {typeof modo === "object" && (
            <div className="painel-card p-6">
              <h3 className="m-0 mb-4 font-display text-base font-semibold">Perfil de {modo.editar.instrutor.nome}</h3>
              {modo.editar.instrutor.eu && <p className="m-0 mb-4 text-sm text-muted">Este é o seu perfil. Ele também fica em Perfil de instrutor.</p>}
              <FormPerfil
                inicial={modo.editar.instrutor}
                salvar={(d) => salvarPerfil.mutate({ id: modo.editar.instrutor.id, dados: d })}
                salvando={salvarPerfil.isPending}
                erro={salvarPerfil.error}
                rotuloSalvar="Salvar perfil"
                extra={
                  <Botao variante="contorno" className="h-11 px-5" onClick={() => setModo("nenhum")}>
                    Cancelar
                  </Botao>
                }
              />
            </div>
          )}

          {modo === "convidar" ? (
            <div className="painel-card p-6">
              <h3 className="m-0 mb-1 font-display text-base font-semibold">Convidar para o curso</h3>
              <p className="m-0 mb-5 text-sm text-muted">Para collab e participação especial. A pessoa não precisa ter conta na Academy.</p>
              <FormPerfil
                inicial={{ nome: "", cargo: "", bio: "", linkedin: null, site: null }}
                salvar={(d) => salvarPerfil.mutate({ id: null, dados: d })}
                salvando={salvarPerfil.isPending}
                erro={salvarPerfil.error}
                rotuloSalvar="Adicionar convidado"
                extra={
                  <Botao variante="contorno" className="h-11 px-5" onClick={() => setModo("nenhum")}>
                    Cancelar
                  </Botao>
                }
              />
            </div>
          ) : (
            modo === "nenhum" && (
              <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-line-hi p-5">
                <FormAcrescentar
                  opcoes={[
                    ...(lista.data.equipe_sem_perfil ?? []).map((p) => ({
                      chave: `p:${p.id}`,
                      nome: p.eu ? `${p.nome} (você)` : p.nome,
                      ajuda: "Da Equipe, ainda sem perfil de instrutor. O perfil é criado com o nome da conta.",
                    })),
                    ...lista.data.disponiveis.map((p) => ({
                      chave: `c:${p.id}`,
                      nome: p.eu ? `${p.nome} (você)` : p.nome,
                      ajuda: p.da_equipe ? (p.cargo ?? undefined) : `Convidado${p.cargo ? `, ${p.cargo}` : ""}`,
                    })),
                  ].sort((x, y) => x.nome.localeCompare(y.nome, "pt-BR"))}
                  marcados={marcados}
                  setMarcados={setMarcados}
                  papel={papel}
                  setPapel={setPapel}
                  enviar={() => vincular.mutate({ chaves: marcados, papel })}
                  ocupado={ocupado}
                />
                <button
                  type="button"
                  onClick={() => setModo("convidar")}
                  className="inline-flex h-9 items-center gap-1.5 self-start rounded-lg px-2 text-sm font-medium text-muted hover:bg-white/5 hover:text-ink"
                >
                  <Plus className="size-4" aria-hidden="true" /> Convidar alguém de fora da equipe
                </button>
              </div>
            )
          )}
        </>
      )}
    </section>
  );
}

interface OpcaoInstrutor {
  chave: string;
  nome: string;
  ajuda?: string;
}

function FormAcrescentar({
  opcoes,
  marcados,
  setMarcados,
  papel,
  setPapel,
  enviar,
  ocupado,
}: {
  opcoes: OpcaoInstrutor[];
  marcados: string[];
  setMarcados: (m: string[]) => void;
  papel: PapelNoCurso;
  setPapel: (p: PapelNoCurso) => void;
  enviar: () => void;
  ocupado: boolean;
}) {
  if (opcoes.length === 0) {
    return <p className="m-0 text-sm text-muted">Todo mundo da Equipe já está neste curso.</p>;
  }
  const n = marcados.length;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (n > 0) enviar();
      }}
      className="flex flex-col gap-4"
    >
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="mb-3 p-0 text-[15px] font-medium text-ink">Acrescentar ao curso</legend>
        {opcoes.map((o) => (
          <Marcador
            key={o.chave}
            rotulo={o.nome}
            ajuda={o.ajuda}
            checked={marcados.includes(o.chave)}
            onChange={(e) => setMarcados(e.target.checked ? [...marcados, o.chave] : marcados.filter((k) => k !== o.chave))}
          />
        ))}
      </fieldset>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Selecao rotulo="Papel" value={papel} onChange={(e) => setPapel(e.target.value as PapelNoCurso)}>
            {PAPEIS.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.rotulo}
              </option>
            ))}
          </Selecao>
        </div>
        <Botao type="submit" variante="contorno" className="h-11 px-4" disabled={n === 0 || ocupado}>
          {n > 1 ? `Acrescentar ${n} pessoas` : "Acrescentar"}
        </Botao>
      </div>
    </form>
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
      className="grid size-9 place-items-center rounded-lg text-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
