import { useState, type FormEvent } from "react";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { chamar, TIPOS_AVISO, useAcao, useBoletimAdm, useEu, type AvisoAdm, type TipoAviso } from "@/lib/instrutor";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { Campo, ErroFormulario, Marcador, Selecao, Situacao } from "@/components/instrutor/Campos";
import { FalhaCarregamento, NaoEncontrado } from "../Estados";

const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export default function BoletimInstrutor() {
  const eu = useEu();
  if (eu.papel !== "admin") return <NaoEncontrado />;
  return <Conteudo />;
}

function Conteudo() {
  const boletim = useBoletimAdm();
  const [editando, setEditando] = useState<AvisoAdm | "novo" | null>(null);
  if (boletim.isError) return <FalhaCarregamento tentar={() => void boletim.refetch()} />;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <h1 className="m-0 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Boletim do SOC</h1>
        {editando === null && (
          <Botao className="ml-auto h-11 px-4" onClick={() => setEditando("novo")}>
            <Plus className="size-4" aria-hidden="true" /> Novo aviso
          </Botao>
        )}
      </div>
      <p className="m-0 mb-8 max-w-2xl text-muted">Avisos publicados aparecem no painel de todos os alunos, do mais recente para o mais antigo.</p>

      {editando !== null && <FormAviso key={editando === "novo" ? "novo" : editando.id} aviso={editando === "novo" ? null : editando} fechar={() => setEditando(null)} />}

      {!boletim.data ? (
        <div aria-busy="true" aria-label="Carregando o boletim" className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Esqueleto key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : boletim.data.length === 0 ? (
        <p className="m-0 text-muted">Nenhum aviso ainda.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {boletim.data.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-line py-4 last:border-b-0">
              <span className="w-28 text-[13px] text-dim">{data.format(new Date(a.publicado_em))}</span>
              <span className="w-24 text-[13px] text-muted">{TIPOS_AVISO.find((t) => t.valor === a.tipo)?.rotulo}</span>
              <span className="min-w-0 flex-1 basis-64 font-medium">
                {a.titulo}
                {a.link && (
                  <a href={a.link} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex align-middle text-muted hover:text-ink">
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">Abrir link do aviso (nova aba)</span>
                  </a>
                )}
              </span>
              <span className="w-28">
                <Situacao estado={a.publicado ? "publicado" : "rascunho"} />
              </span>
              <button
                type="button"
                onClick={() => setEditando(a)}
                aria-label={`Editar aviso ${a.titulo}`}
                className="grid size-9 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-ink"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FormAviso({ aviso, fechar }: { aviso: AvisoAdm | null; fechar: () => void }) {
  const avisar = useAvisos();
  const [tipo, setTipo] = useState<TipoAviso>(aviso?.tipo ?? "atualizacao");
  const [titulo, setTitulo] = useState(aviso?.titulo ?? "");
  const [link, setLink] = useState(aviso?.link ?? "");
  const [publicado, setPublicado] = useState(aviso?.publicado ?? true);
  const salvar = useAcao(
    (sb, dados: Record<string, unknown>) => chamar<AvisoAdm[]>(sb, "academy_adm_salvar_boletim", { p_id: aviso?.id ?? null, p_dados: dados }),
    () => {
      avisar({ titulo: aviso ? "Aviso salvo" : "Aviso criado", tipo: "ok" });
      fechar();
    },
  );
  const excluir = useAcao(
    (sb, id: string) => chamar<AvisoAdm[]>(sb, "academy_adm_excluir_boletim", { p_id: id }),
    () => {
      avisar({ titulo: "Aviso excluído", tipo: "ok" });
      fechar();
    },
  );
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    salvar.mutate({ tipo, titulo, link, publicado });
  };

  return (
    <form onSubmit={enviar} aria-labelledby="form-aviso" className="painel-card mb-8 flex max-w-3xl flex-col gap-5 p-6">
      <h2 id="form-aviso" className="m-0 font-display text-xl font-semibold">
        {aviso ? "Editar aviso" : "Novo aviso"}
      </h2>
      <Selecao rotulo="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoAviso)}>
        {TIPOS_AVISO.map((t) => (
          <option key={t.valor} value={t.valor}>
            {t.rotulo}
          </option>
        ))}
      </Selecao>
      <Campo rotulo="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} limite={140} required minLength={4} autoFocus />
      <Campo rotulo="Link" type="url" placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} limite={300} ajuda="Opcional. Abre em nova aba para o aluno." />
      <Marcador rotulo="Publicado" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} />
      <ErroFormulario erro={salvar.error ?? excluir.error} />
      <div className="flex flex-wrap gap-3">
        <Botao type="submit" className="h-11 px-5" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando…" : aviso ? "Salvar aviso" : "Criar aviso"}
        </Botao>
        <Botao variante="contorno" className="h-11 px-5" onClick={fechar}>
          Cancelar
        </Botao>
        {aviso && (
          <button type="button" onClick={() => excluir.mutate(aviso.id)} disabled={excluir.isPending} className="ml-auto h-11 rounded-[10px] px-4 font-medium text-muted hover:text-bad">
            Excluir aviso
          </button>
        )}
      </div>
    </form>
  );
}
