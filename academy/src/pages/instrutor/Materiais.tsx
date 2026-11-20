import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2, CircleDashed, FileText, ShieldAlert, Upload, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { chamar, useAcao, useMateriaisAdm, type CursoAdm, ErroPainel } from "@/lib/instrutor";
import { ACEITOS, apagarArquivo, enviarMaterial, tamanhoLegivel, TIPOS, type EtapaEnvio, type MaterialAdm } from "@/lib/materiais";
import { rotuloModulo } from "@/lib/aula";
import { usePortal } from "@/lib/portal";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { AreaTexto, Campo, ErroFormulario, Selecao } from "@/components/instrutor/Campos";
import { FalhaCarregamento } from "../Estados";

const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

/** Aba Materiais: envio com quarentena e lista com a situação de cada arquivo. */
export function AbaMateriais({ curso }: { curso: CursoAdm }) {
  const lista = useMateriaisAdm(curso.slug);
  if (lista.isError) return <FalhaCarregamento tentar={() => void lista.refetch()} />;
  const visiveis = (lista.data ?? []).filter((m) => m.status !== "arquivado");

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <p className="m-0 flex items-start gap-3 rounded-[10px] border border-line-hi bg-panel px-4 py-3 text-sm leading-relaxed text-muted">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden="true" />
        Todo arquivo enviado fica em quarentena até outra pessoa da equipe conferir e aprovar. Só depois disso ele aparece para o aluno. Quem envia não aprova o
        próprio arquivo.
      </p>
      <Envio curso={curso} />
      {!lista.data ? (
        <div aria-busy="true" aria-label="Carregando os materiais" className="flex flex-col gap-3">
          <Esqueleto className="h-20 w-full" />
          <Esqueleto className="h-20 w-full" />
        </div>
      ) : visiveis.length === 0 ? (
        <p className="m-0 text-muted">Nenhum material neste curso ainda.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {visiveis.map((m) => (
            <Item key={m.id} m={m} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function SituacaoMaterial({ status }: { status: MaterialAdm["status"] }) {
  if (status === "aprovado")
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ok">
        <CheckCircle2 className="size-3.5" aria-hidden="true" /> Aprovado
      </span>
    );
  if (status === "recusado")
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-bad">
        <XCircle className="size-3.5" aria-hidden="true" /> Recusado
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-warn">
      <CircleDashed className="size-3.5" aria-hidden="true" /> Aguardando aprovação
    </span>
  );
}

function Item({ m }: { m: MaterialAdm }) {
  const { sb } = usePortal();
  const aviso = useAvisos();
  const [confirmar, setConfirmar] = useState(false);
  const arquivar = useAcao(
    async (cliente, id: string) => {
      const r = await chamar<MaterialAdm>(cliente, "academy_adm_arquivar_material", { p_id: id });
      await apagarArquivo(sb, m.caminho);
      return r;
    },
    () => aviso({ tipo: "ok", titulo: m.status === "aprovado" ? "Material tirado do ar" : "Material descartado" }),
  );

  return (
    <li className="painel-card flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
        <FileText className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden="true" />
        <div className="min-w-0 flex-1 basis-60">
          <p className="m-0 font-medium">{m.titulo}</p>
          <p className="m-0 text-[13px] text-muted">
            {m.nome_arquivo}, {tamanhoLegivel(m.tamanho)}
            {m.modulo_titulo !== null && m.modulo_ordem !== null ? `, ${rotuloModulo(m.modulo_ordem, m.modulo_titulo)}` : ", curso todo"}
          </p>
          <p className="m-0 text-[13px] text-dim">
            Enviado por {m.enviado_por_mim ? "você" : m.enviado_por_nome} em {data.format(new Date(m.enviado_em))}
            {m.revisado_por_nome && m.revisado_em ? `. Revisado por ${m.revisado_por_nome} em ${data.format(new Date(m.revisado_em))}` : ""}
          </p>
        </div>
        <SituacaoMaterial status={m.status} />
      </div>
      {m.status === "recusado" && m.motivo_recusa && (
        <p className="m-0 rounded-lg border border-bad/30 bg-bad/5 px-3 py-2 text-sm text-ink">Motivo: {m.motivo_recusa}</p>
      )}
      <ErroFormulario erro={arquivar.error} />
      <div className="flex flex-wrap items-center gap-3">
        {confirmar ? (
          <>
            <span className="text-sm text-muted">{m.status === "aprovado" ? "Tirar do ar para os alunos?" : "Descartar este arquivo?"}</span>
            <button
              type="button"
              onClick={() => arquivar.mutate(m.id)}
              disabled={arquivar.isPending}
              className="h-9 rounded-lg border border-bad/50 px-3 text-sm font-medium text-bad hover:bg-bad/10"
            >
              {m.status === "aprovado" ? "Tirar do ar" : "Descartar"}
            </button>
            <button type="button" onClick={() => setConfirmar(false)} className="h-9 rounded-lg px-3 text-sm text-muted hover:text-ink">
              Manter
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirmar(true)} className="h-9 rounded-lg px-2 text-sm font-medium text-muted hover:text-bad">
            {m.status === "aprovado" ? "Tirar do ar" : "Descartar"}
          </button>
        )}
      </div>
    </li>
  );
}

const ROTULO_ETAPA: Record<EtapaEnvio, string> = {
  conferindo: "Conferindo o arquivo…",
  enviando: "Enviando…",
  confirmando: "Colocando em quarentena…",
};

function Envio({ curso }: { curso: CursoAdm }) {
  const { sb } = usePortal();
  const qc = useQueryClient();
  const aviso = useAvisos();
  const entrada = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [modulo, setModulo] = useState("");
  const [etapa, setEtapa] = useState<EtapaEnvio | null>(null);
  const [erro, setErro] = useState<Error | null>(null);

  const escolher = (f: File | null) => {
    setErro(null);
    setArquivo(f);
    if (f && !titulo) setTitulo(f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 140));
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!arquivo) return setErro(new ErroPainel("arquivo_vazio"));
    setErro(null);
    try {
      await enviarMaterial(sb, curso.slug, arquivo, { titulo, descricao, modulo_id: modulo || null }, setEtapa);
      aviso({ tipo: "ok", titulo: "Arquivo em quarentena", texto: "Ele aparece para os alunos depois que outra pessoa aprovar." });
      setArquivo(null);
      setTitulo("");
      setDescricao("");
      if (entrada.current) entrada.current.value = "";
      void qc.invalidateQueries({ queryKey: ["adm"] });
    } catch (x) {
      setErro(x instanceof Error ? x : new ErroPainel("falha_envio"));
    } finally {
      setEtapa(null);
    }
  };

  return (
    <form onSubmit={(e) => void enviar(e)} aria-labelledby="h-enviar" className="painel-card flex flex-col gap-5 p-6">
      <h2 id="h-enviar" className="m-0 font-display text-lg font-semibold">
        Enviar material
      </h2>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="arquivo-material" className="text-sm font-medium">
          Arquivo
        </label>
        <input
          id="arquivo-material"
          ref={entrada}
          type="file"
          accept={ACEITOS}
          onChange={(e) => escolher(e.target.files?.[0] ?? null)}
          aria-describedby="arquivo-ajuda"
          className="text-sm text-muted file:mr-4 file:h-10 file:cursor-pointer file:rounded-[10px] file:border file:border-line-hi file:bg-transparent file:px-4 file:font-semibold file:text-ink hover:file:border-muted"
        />
        <p id="arquivo-ajuda" className="m-0 text-[13px] text-muted">
          {Object.values(TIPOS)
            .map((t) => t.rotulo)
            .filter((r, i, a) => a.indexOf(r) === i)
            .join(", ")}
          . Até 25 MB por documento e 50 MB por ZIP. Office com macro não é aceito.
        </p>
        {arquivo && <p className="m-0 text-sm text-ink">{`${arquivo.name}, ${tamanhoLegivel(arquivo.size)}`}</p>}
      </div>
      <Campo rotulo="Título para o aluno" value={titulo} onChange={(e) => setTitulo(e.target.value)} limite={140} required minLength={2} />
      <Selecao rotulo="Onde aparece" value={modulo} onChange={(e) => setModulo(e.target.value)}>
        <option value="">Curso todo</option>
        {curso.modulos.map((m) => (
          <option key={m.id} value={m.id}>
            {rotuloModulo(m.ordem, m.titulo)}
          </option>
        ))}
      </Selecao>
      <AreaTexto rotulo="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} limite={400} className="min-h-20" />
      <ErroFormulario erro={erro} />
      <div className="flex items-center gap-3">
        <Botao type="submit" className="h-11 px-5" disabled={etapa !== null || !arquivo}>
          <Upload className="size-4" aria-hidden="true" /> {etapa ? ROTULO_ETAPA[etapa] : "Enviar para aprovação"}
        </Botao>
      </div>
    </form>
  );
}
