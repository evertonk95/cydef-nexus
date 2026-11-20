import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { chamar, useAcao, useCursosAdm, useEquipeAdm, useEu, type MembroEquipe, type Papel } from "@/lib/instrutor";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { Campo, ErroFormulario, Marcador } from "@/components/instrutor/Campos";
import { FalhaCarregamento, NaoEncontrado } from "../Estados";

export default function EquipeInstrutor() {
  const eu = useEu();
  if (eu.papel !== "admin") return <NaoEncontrado />;
  return <Conteudo />;
}

function Conteudo() {
  const equipe = useEquipeAdm();
  const cursos = useCursosAdm();
  const [editando, setEditando] = useState<MembroEquipe | "novo" | null>(null);
  const titulo = (slug: string) => cursos.data?.find((c) => c.slug === slug)?.titulo ?? slug;
  if (equipe.isError) return <FalhaCarregamento tentar={() => void equipe.refetch()} />;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <h1 className="m-0 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Equipe</h1>
        {editando === null && (
          <Botao className="ml-auto h-11 px-4" onClick={() => setEditando("novo")}>
            <Plus className="size-4" aria-hidden="true" /> Adicionar pessoa
          </Botao>
        )}
      </div>
      <p className="m-0 mb-8 max-w-2xl text-muted">
        Admin cuida de tudo. Instrutor edita só os cursos marcados para ele: estrutura, aulas, vídeos, questões e regras do certificado.
      </p>

      {editando !== null && (
        <FormMembro key={editando === "novo" ? "novo" : editando.user_id} membro={editando === "novo" ? null : editando} fechar={() => setEditando(null)} />
      )}

      {!equipe.data ? (
        <div aria-busy="true" aria-label="Carregando a equipe" className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <Esqueleto key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {equipe.data.map((m) => (
            <li key={m.user_id} className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-line py-4 last:border-b-0">
              <div className="min-w-0 flex-1 basis-64">
                <p className="m-0 truncate font-medium">
                  {m.nome ?? m.email}
                  {m.eu && <span className="ml-2 text-[13px] font-normal text-dim">(você)</span>}
                </p>
                {m.nome && <p className="m-0 truncate text-[13px] text-muted">{m.email}</p>}
              </div>
              <div className="min-w-0 flex-1 basis-56">
                <p className="m-0 text-sm text-muted">{m.papel === "admin" ? "Admin, todos os cursos" : `Instrutor: ${m.cursos.map(titulo).join(", ")}`}</p>
                {m.papel === "admin" ? (
                  <p className="m-0 text-[13px] text-dim">Aprova materiais</p>
                ) : (
                  m.aprova_materiais !== undefined && <Aprovador membro={m} />
                )}
              </div>
              <Botao variante="contorno" className="h-9 px-3 text-sm" onClick={() => setEditando(m)} aria-label={`Editar acesso de ${m.nome ?? m.email}`}>
                Editar
              </Botao>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Aprovador({ membro }: { membro: MembroEquipe }) {
  const marcar = useAcao((sb, aprova: boolean) => chamar<MembroEquipe[]>(sb, "academy_adm_definir_aprovador", { p_user_id: membro.user_id, p_aprova: aprova }));
  return (
    <label className="mt-1 flex items-center gap-2 text-[13px] text-muted">
      <input
        type="checkbox"
        checked={Boolean(membro.aprova_materiais)}
        disabled={marcar.isPending}
        onChange={(e) => marcar.mutate(e.target.checked)}
        className="size-4 accent-ink"
      />
      Aprova materiais de outras pessoas
    </label>
  );
}

function FormMembro({ membro, fechar }: { membro: MembroEquipe | null; fechar: () => void }) {
  const avisar = useAvisos();
  const cursos = useCursosAdm();
  const [email, setEmail] = useState(membro?.email ?? "");
  const [papel, setPapel] = useState<Papel>(membro?.papel ?? "instrutor");
  const [marcados, setMarcados] = useState<string[]>(membro?.cursos ?? []);
  const salvar = useAcao(
    (sb, a: { email: string; papel: Papel; cursos: string[] }) => chamar<MembroEquipe[]>(sb, "academy_adm_definir_equipe", { p_email: a.email, p_papel: a.papel, p_cursos: a.cursos }),
    () => {
      avisar({ titulo: "Acesso salvo", tipo: "ok" });
      fechar();
    },
  );
  const remover = useAcao(
    (sb, id: string) => chamar<MembroEquipe[]>(sb, "academy_adm_remover_equipe", { p_user_id: id }),
    () => {
      avisar({ titulo: "Acesso removido", texto: "A pessoa continua com a conta de aluno.", tipo: "ok" });
      fechar();
    },
  );
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    salvar.mutate({ email, papel, cursos: papel === "admin" ? [] : marcados });
  };

  return (
    <form onSubmit={enviar} aria-labelledby="form-membro" className="painel-card mb-8 flex max-w-3xl flex-col gap-5 p-6">
      <h2 id="form-membro" className="m-0 font-display text-xl font-semibold">
        {membro ? `Acesso de ${membro.nome ?? membro.email}` : "Adicionar pessoa"}
      </h2>
      {!membro && (
        <Campo
          rotulo="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          ajuda="O mesmo e-mail que a pessoa usa para entrar na Academy. Ela precisa ter entrado ao menos uma vez."
        />
      )}
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="mb-2 p-0 text-sm font-medium text-ink">Papel</legend>
        {(["instrutor", "admin"] as const).map((p) => (
          <label key={p} className="flex items-start gap-3">
            <input type="radio" name="papel" value={p} checked={papel === p} onChange={() => setPapel(p)} className="mt-1 size-[18px] accent-ink" />
            <span>
              <span className="block text-[15px] font-medium">{p === "admin" ? "Admin" : "Instrutor"}</span>
              <span className="block text-[13px] text-muted">
                {p === "admin" ? "Todos os cursos, Boletim do SOC e equipe." : "Só os cursos marcados abaixo."}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      {papel === "instrutor" && (
        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="mb-2 p-0 text-sm font-medium text-ink">Cursos</legend>
          {!cursos.data ? (
            <Esqueleto className="h-6 w-60" />
          ) : (
            cursos.data.map((c) => (
              <Marcador
                key={c.slug}
                rotulo={c.titulo}
                checked={marcados.includes(c.slug)}
                onChange={(e) => setMarcados((m) => (e.target.checked ? [...m, c.slug] : m.filter((s) => s !== c.slug)))}
              />
            ))
          )}
        </fieldset>
      )}
      <ErroFormulario erro={salvar.error ?? remover.error} />
      <div className="flex flex-wrap gap-3">
        <Botao type="submit" className="h-11 px-5" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando…" : "Salvar acesso"}
        </Botao>
        <Botao variante="contorno" className="h-11 px-5" onClick={fechar}>
          Cancelar
        </Botao>
        {membro && (
          <button type="button" onClick={() => remover.mutate(membro.user_id)} disabled={remover.isPending} className="ml-auto h-11 rounded-[10px] px-4 font-medium text-muted hover:text-bad">
            Remover da equipe
          </button>
        )}
      </div>
    </form>
  );
}
