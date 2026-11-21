import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { usePortal } from "@/lib/portal";
import { chamar, useAcao, useCursosAdm, useEu, type ErroPainel } from "@/lib/instrutor";
import { PERFIS_DECLARADOS, pct, salvarPerfilAdm, useDono, usePessoa, type FichaPessoa } from "@/lib/admin";
import { AREAS, EXPERIENCIAS, type ErroPerfil, type Perfil, type PerfilForm } from "@/lib/perfil";
import { dataCurta } from "@/lib/formato";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { ErroFormulario, Marcador } from "@/components/instrutor/Campos";
import { FormularioPerfil } from "@/components/perfil/FormularioPerfil";
import { FalhaCarregamento, NaoEncontrado } from "../Estados";

/** Ficha de uma pessoa com conta (fase 20). Só admin; o e-mail não muda. */
export default function PessoaAdm() {
  const eu = useEu();
  if (eu.papel !== "admin") return <NaoEncontrado />;
  return <Conteudo />;
}

function Conteudo() {
  const { id } = useParams();
  const ficha = usePessoa(id);
  const dono = useDono();
  if (ficha.isError) {
    return (ficha.error as ErroPainel).codigo === "pessoa_inexistente" ? <NaoEncontrado /> : <FalhaCarregamento tentar={() => void ficha.refetch()} />;
  }
  return (
    <>
      <Link to="/instrutor/pessoas" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden="true" /> Pessoas
      </Link>
      {!ficha.data || dono.isPending ? (
        <div aria-busy="true" aria-label="Carregando a ficha" className="flex flex-col gap-4">
          <Esqueleto className="h-10 w-72" />
          <Esqueleto className="h-96 w-full" />
        </div>
      ) : (
        <Ficha f={ficha.data} dono={ficha.data.user_id === dono.data?.user_id} euSouDono={Boolean(dono.data?.eu)} />
      )}
    </>
  );
}

const rotuloPapel = (p: FichaPessoa["papel"]) => (p === "admin" ? "Admin" : p === "instrutor" ? "Instrutor" : "Aluno");

function Bloco({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="painel-card flex flex-col gap-4 p-5">
      <h2 id={id} className="m-0 font-display text-lg font-semibold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Ficha({ f, dono, euSouDono }: { f: FichaPessoa; dono: boolean; euSouDono: boolean }) {
  // A conta do dono só muda pelas mãos dele (0033). Os outros admins veem, mas não editam.
  const bloqueada = dono && !euSouDono;
  const { sb } = usePortal();
  const qc = useQueryClient();
  const aviso = useAvisos();
  const salvar = useMutation<FichaPessoa, ErroPerfil, PerfilForm>({
    mutationFn: (dados) => salvarPerfilAdm(sb, f.user_id, dados),
    onSuccess: (nova) => {
      qc.setQueryData(["adm-pessoa", f.user_id], nova);
      void qc.invalidateQueries({ queryKey: ["adm-pessoas"] });
      aviso({ tipo: "ok", titulo: "Perfil salvo" });
    },
  });

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h1 className="m-0 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight break-words">
            {f.perfil.nome}
            {f.eu && <span className="ml-3 align-middle text-base font-normal text-dim">(você)</span>}
          </h1>
          <p className="m-0 mt-1 break-all text-muted">{f.perfil.email}</p>
        </div>
        <p className="m-0 text-sm text-muted sm:ml-auto">
          {dono ? "Dono da plataforma" : rotuloPapel(f.papel)}, na Academy desde {dataCurta(f.criado_em)}
          {f.ultimo_acesso_em ? `, último acesso em ${dataCurta(f.ultimo_acesso_em)}` : ", ainda não entrou"}
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="h-perfil" className="flex min-w-0 flex-col gap-4">
          <h2 id="h-perfil" className="m-0 font-display text-xl font-semibold">
            Perfil
          </h2>
          {bloqueada ? (
            <PerfilLeitura perfil={f.perfil} />
          ) : (
            <FormularioPerfil key={f.perfil.atualizado_em ?? "novo"} perfil={f.perfil} salvar={salvar} visao="admin" />
          )}
        </section>

        <div className="flex min-w-0 flex-col gap-6">
          {dono ? (
            <Bloco id="h-papel-pessoa" titulo="Papel">
              <p className="m-0 flex gap-3 text-sm text-muted">
                <ShieldCheck className="mt-0.5 size-[18px] shrink-0 text-ink" aria-hidden="true" />
                <span>
                  Admin, sempre. {euSouDono ? "Você é o dono da plataforma" : "Esta é a conta do dono da plataforma"} e o papel dela não muda pelo
                  painel.
                </span>
              </p>
            </Bloco>
          ) : (
            <PapelPessoa f={f} />
          )}

          <Bloco id="h-cursos-pessoa" titulo="Cursos">
            {f.cursos.length === 0 ? (
              <p className="m-0 text-sm text-muted">Sem matrícula.</p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-4 p-0">
                {f.cursos.map((c) => {
                  const p = pct(c.progresso.concluidas, c.progresso.aulas);
                  return (
                    <li key={c.slug} className="text-sm">
                      <p className="m-0 font-medium">{c.titulo}</p>
                      <p className="m-0 text-[13px] text-dim">
                        {c.origem === "gratuito" ? "Gratuito" : c.origem === "compra" ? "Compra" : "Cortesia"}, desde {dataCurta(c.matriculado_em)}
                        {c.progresso.ultima_atividade ? `, estudou em ${dataCurta(c.progresso.ultima_atividade)}` : ""}
                      </p>
                      <span className="mt-2 flex items-center gap-3">
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
                          <span className="block h-full rounded-full bg-ink" style={{ width: `${p}%` }} />
                        </span>
                        <span className="text-[13px] tabular-nums text-muted">
                          {c.progresso.concluidas} de {c.progresso.aulas} aulas
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Bloco>

          <Bloco id="h-cert-pessoa" titulo="Certificados e missões">
            {f.certificados.length === 0 ? (
              <p className="m-0 text-sm text-muted">Nenhum certificado.</p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm">
                {f.certificados.map((c) => (
                  <li key={c.codigo}>
                    {c.curso_titulo}
                    <span className="block text-[13px] text-dim">
                      {c.codigo}, emitido em {dataCurta(c.emitido_em)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="m-0 border-t border-line pt-3 text-sm text-muted">
              Missões: {f.missoes.tentativas} {f.missoes.tentativas === 1 ? "tentativa enviada" : "tentativas enviadas"}, {f.missoes.aprovadas}{" "}
              {f.missoes.aprovadas === 1 ? "aprovada" : "aprovadas"}.
            </p>
          </Bloco>

          {f.pre_inscricao && (
            <Bloco id="h-pre-pessoa" titulo="Pré-inscrição">
              <p className="m-0 text-sm text-muted">
                Feita em {dataCurta(f.pre_inscricao.criado_em)}, perfil declarado: {PERFIS_DECLARADOS[f.pre_inscricao.perfil] ?? f.pre_inscricao.perfil}.
              </p>
            </Bloco>
          )}
        </div>
      </div>
    </>
  );
}

/** Perfil do dono, visto por outro admin: só leitura. */
function PerfilLeitura({ perfil }: { perfil: Perfil }) {
  const rotulo = (lista: { valor: string; rotulo: string }[], v: string | null) => lista.find((o) => o.valor === v)?.rotulo ?? v;
  const nascimento = perfil.data_nascimento?.split("-").reverse().join("/") ?? null;
  const campos: [string, string | null][] = [
    ["Nome completo", perfil.nome],
    ["E-mail", perfil.email],
    ["Data de nascimento", nascimento],
    ["Telefone", perfil.telefone],
    ["Cidade", perfil.cidade],
    ["País", perfil.pais],
    ["Empresa onde trabalha", perfil.empresa],
    ["Cargo", perfil.cargo],
    ["Área de atuação", rotulo(AREAS, perfil.area)],
    ["Tempo de experiência na área", rotulo(EXPERIENCIAS, perfil.experiencia)],
    ["Bio", perfil.bio],
    ["LinkedIn", perfil.linkedin],
  ];
  return (
    <div className="painel-card flex flex-col gap-5 p-6">
      <p className="m-0 flex gap-3 text-sm text-muted">
        <ShieldCheck className="mt-0.5 size-[18px] shrink-0 text-ink" aria-hidden="true" />
        <span>Esta é a conta do dono da plataforma. Só ele altera esses dados, pela página Meu perfil.</span>
      </p>
      <dl className="m-0 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {campos
          .filter(([, v]) => v)
          .map(([r, v]) => (
            <div key={r} className={r === "Bio" ? "sm:col-span-2" : undefined}>
              <dt className="text-[13px] text-dim">{r}</dt>
              <dd className="m-0 break-words whitespace-pre-line">{v}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
}

type PapelEscolha = "aluno" | "instrutor" | "admin";

function PapelPessoa({ f }: { f: FichaPessoa }) {
  const aviso = useAvisos();
  const cursos = useCursosAdm();
  const [papel, setPapel] = useState<PapelEscolha>(f.papel ?? "aluno");
  const [marcados, setMarcados] = useState<string[]>(f.cursos_equipe);
  const definir = useAcao(
    (sb, a: { papel: "admin" | "instrutor"; cursos: string[] }) =>
      chamar(sb, "academy_adm_definir_equipe", { p_email: f.perfil.email, p_papel: a.papel, p_cursos: a.cursos }),
    () => aviso({ tipo: "ok", titulo: "Papel salvo" }),
  );
  const remover = useAcao(
    (sb, id: string) => chamar(sb, "academy_adm_remover_equipe", { p_user_id: id }),
    () => aviso({ tipo: "ok", titulo: "Papel salvo", texto: "Agora é só aluno." }),
  );
  const ocupado = definir.isPending || remover.isPending;
  const mudou =
    papel !== (f.papel ?? "aluno") ||
    (papel === "instrutor" && [...marcados].sort().join() !== [...f.cursos_equipe].sort().join());
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (papel === "aluno") remover.mutate(f.user_id);
    else definir.mutate({ papel, cursos: papel === "admin" ? [] : marcados });
  };

  const opcoes: { valor: PapelEscolha; titulo: string; texto: string }[] = [
    { valor: "aluno", titulo: "Aluno", texto: "Estuda na Academy, sem acesso ao painel do instrutor." },
    { valor: "instrutor", titulo: "Instrutor", texto: "Edita só os cursos marcados." },
    { valor: "admin", titulo: "Admin", texto: "Tudo: cursos, vendas, empresas, pessoas e indicadores." },
  ];

  return (
    <form onSubmit={enviar} aria-labelledby="h-papel-pessoa" className="painel-card flex flex-col gap-4 p-5">
      <h2 id="h-papel-pessoa" className="m-0 font-display text-lg font-semibold">
        Papel
      </h2>
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="sr-only">Papel na Academy</legend>
        {opcoes.map((o) => (
          <label key={o.valor} className="flex items-start gap-3">
            <input type="radio" name="papel" value={o.valor} checked={papel === o.valor} onChange={() => setPapel(o.valor)} className="mt-1 size-[18px] shrink-0 accent-ink" />
            <span>
              <span className="block text-[15px] font-medium">{o.titulo}</span>
              <span className="block text-[13px] text-muted">{o.texto}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {papel === "instrutor" && (
        <fieldset className="m-0 flex flex-col gap-3 border-0 border-t border-line p-0 pt-4">
          <legend className="mb-2 p-0 pt-4 text-sm font-medium">Cursos do instrutor</legend>
          {!cursos.data ? (
            <Esqueleto className="h-6 w-56" />
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
      <ErroFormulario erro={definir.error ?? remover.error} />
      <div>
        <Botao type="submit" className="h-10 px-4" disabled={!mudou || ocupado}>
          {ocupado ? "Salvando…" : "Salvar papel"}
        </Botao>
      </div>
    </form>
  );
}
