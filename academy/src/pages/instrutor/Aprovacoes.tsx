import { useState } from "react";
import { AlertTriangle, CheckCircle2, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { chamar, useAcao, useAprovacoes, useEu, ErroPainel } from "@/lib/instrutor";
import { baixarParaRevisar, linkVirusTotal, tamanhoLegivel, TIPOS, type EntradaZip, type MaterialAdm } from "@/lib/materiais";
import { rotuloModulo } from "@/lib/aula";
import { baixarArquivo } from "@/lib/conta";
import { usePortal } from "@/lib/portal";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { AreaTexto, ErroFormulario } from "@/components/instrutor/Campos";
import { FalhaCarregamento, NaoEncontrado } from "../Estados";

const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * Segunda pessoa da dupla checagem. O arquivo só chega ao aluno depois que
 * alguém diferente de quem enviou baixa, confere e aprova.
 */
export default function AprovacoesInstrutor() {
  const eu = useEu();
  if (!eu.aprova_materiais) return <NaoEncontrado />;
  return <Conteudo />;
}

function Conteudo() {
  const lista = useAprovacoes();
  if (lista.isError) return <FalhaCarregamento tentar={() => void lista.refetch()} />;
  return (
    <>
      <h1 className="m-0 mb-3 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Aprovações</h1>
      <p className="m-0 mb-8 max-w-2xl leading-relaxed text-muted">
        Arquivos enviados pela equipe que esperam a segunda conferência. Baixe, confira e só então aprove. Abra o arquivo num ambiente isolado se tiver dúvida
        sobre ele.
      </p>
      {!lista.data ? (
        <div aria-busy="true" aria-label="Carregando as aprovações" className="flex flex-col gap-3">
          <Esqueleto className="h-40 w-full" />
        </div>
      ) : lista.data.length === 0 ? (
        <p className="painel-card m-0 max-w-3xl p-6 text-muted">Nada esperando aprovação.</p>
      ) : (
        <ul className="m-0 flex max-w-3xl list-none flex-col gap-4 p-0">
          {lista.data.map((m) => (
            <Revisao key={m.id} m={m} />
          ))}
        </ul>
      )}
    </>
  );
}

interface Conferencia {
  blob: Blob;
  hash: string;
  confere: boolean;
  entradas: EntradaZip[];
}

function Revisao({ m }: { m: MaterialAdm }) {
  const { sb } = usePortal();
  const aviso = useAvisos();
  const [conf, setConf] = useState<Conferencia | null>(null);
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState<Error | null>(null);
  const [recusar, setRecusar] = useState(false);
  const [motivo, setMotivo] = useState("");
  const revisar = useAcao(
    (cliente, a: { aprovar: boolean; motivo: string | null }) =>
      chamar<MaterialAdm[]>(cliente, "academy_adm_revisar_material", { p_id: m.id, p_aprovar: a.aprovar, p_motivo: a.motivo }),
    (_r, a) => aviso({ tipo: "ok", titulo: a.aprovar ? "Material aprovado" : "Material recusado", texto: a.aprovar ? "Já aparece para os alunos do curso." : undefined }),
  );

  const conferir = async () => {
    setBaixando(true);
    setErro(null);
    try {
      setConf(await baixarParaRevisar(sb, m));
    } catch (x) {
      setErro(x instanceof Error ? x : new ErroPainel("falha_download"));
    } finally {
      setBaixando(false);
    }
  };

  const arriscadas = conf?.entradas.filter((e) => e.arriscada) ?? [];
  const id = `rev-${m.id}`;

  return (
    <li aria-labelledby={id} className="painel-card flex flex-col gap-4 p-6">
      <div>
        <p className="m-0 text-[13px] text-dim">
          {m.curso_titulo}
          {m.modulo_titulo !== null && m.modulo_ordem !== null ? `, ${rotuloModulo(m.modulo_ordem, m.modulo_titulo)}` : ", curso todo"}
        </p>
        <h2 id={id} className="m-0 font-display text-lg font-semibold">
          {m.titulo}
        </h2>
        {m.descricao && <p className="m-0 mt-1 text-sm text-muted">{m.descricao}</p>}
      </div>

      <dl className="m-0 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Arquivo</dt>
          <dd className="m-0 break-all">
            {m.nome_arquivo} ({TIPOS[m.extensao].rotulo}, {tamanhoLegivel(m.tamanho)})
          </dd>
        </div>
        <div>
          <dt className="text-muted">Enviado por</dt>
          <dd className="m-0">
            {m.enviado_por_mim ? "Você" : (m.enviado_por_nome ?? "Carga direta")}, {data.format(new Date(m.enviado_em))}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted">SHA-256 registrado no envio</dt>
          <dd className="m-0 font-mono text-[12.5px] break-all text-ink">{m.sha256}</dd>
          <dd className="m-0 mt-1">
            <a href={linkVirusTotal(m.sha256)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
              Consultar o hash no VirusTotal <ExternalLink className="size-3" aria-hidden="true" />
              <span className="sr-only">(abre em nova aba; só o hash é enviado, não o arquivo)</span>
            </a>
          </dd>
        </div>
      </dl>

      {m.enviado_por_mim ? (
        <p className="m-0 rounded-[10px] border border-line-hi px-4 py-3 text-sm text-muted">Você enviou este arquivo. Outra pessoa precisa revisar e aprovar.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Botao variante="contorno" className="h-11 px-5" onClick={() => void conferir()} disabled={baixando}>
              <ShieldCheck className="size-4" aria-hidden="true" /> {baixando ? "Baixando e conferindo…" : conf ? "Conferir de novo" : "Baixar e conferir"}
            </Botao>
            {conf && (
              <Botao variante="contorno" className="h-11 px-5" onClick={() => baixarArquivo(conf.blob, m.nome_arquivo, conf.blob.type || "application/octet-stream")}>
                <Download className="size-4" aria-hidden="true" /> Salvar cópia para abrir
              </Botao>
            )}
          </div>
          <ErroFormulario erro={erro} />

          {conf && (
            <div role="status" className="flex flex-col gap-3">
              {conf.confere ? (
                <p className="m-0 inline-flex items-center gap-2 text-sm font-medium text-ok">
                  <CheckCircle2 className="size-4" aria-hidden="true" /> O arquivo baixado é o mesmo que foi enviado (SHA-256 confere).
                </p>
              ) : (
                <p className="m-0 flex items-start gap-2 rounded-[10px] border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-ink">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-bad" aria-hidden="true" /> O SHA-256 do arquivo baixado é diferente do registrado no envio.
                  Não aprove: recuse e peça um novo envio.
                </p>
              )}
              {conf.entradas.length > 0 && (
                <details className="rounded-[10px] border border-line-hi px-4 py-3" open={arriscadas.length > 0}>
                  <summary className="cursor-pointer text-sm font-medium">
                    Conteúdo do arquivo compactado: {conf.entradas.length} {conf.entradas.length === 1 ? "item" : "itens"}
                    {arriscadas.length > 0 && <span className="text-warn">, {arriscadas.length} para olhar com atenção</span>}
                  </summary>
                  <ul className="m-0 mt-3 flex max-h-64 list-none flex-col gap-1 overflow-auto p-0 font-mono text-[12.5px]">
                    {conf.entradas.map((e) => (
                      <li key={e.nome} className={e.arriscada ? "text-warn" : "text-muted"}>
                        {e.arriscada && <span className="sr-only">Atenção: </span>}
                        {e.nome} ({tamanhoLegivel(e.tamanho)})
                      </li>
                    ))}
                  </ul>
                  {arriscadas.length > 0 && (
                    <p className="m-0 mt-3 text-[13px] text-muted">
                      Executáveis e scripts podem ser legítimos num laboratório, mas só aprove se souber o que cada um faz.
                    </p>
                  )}
                </details>
              )}
            </div>
          )}

          <ErroFormulario erro={revisar.error} />
          {recusar ? (
            <div className="flex flex-col gap-3">
              <AreaTexto rotulo="Motivo da recusa" value={motivo} onChange={(e) => setMotivo(e.target.value)} limite={400} className="min-h-20" ajuda="Quem enviou vê este texto no painel." />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => revisar.mutate({ aprovar: false, motivo })}
                  disabled={revisar.isPending}
                  className="h-11 rounded-[10px] border border-bad/50 px-5 font-semibold text-bad hover:bg-bad/10"
                >
                  Recusar arquivo
                </button>
                <Botao variante="contorno" className="h-11 px-5" onClick={() => setRecusar(false)}>
                  Cancelar
                </Botao>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
              <Botao className="h-11 px-5" disabled={!conf?.confere || revisar.isPending} onClick={() => revisar.mutate({ aprovar: true, motivo: null })}>
                Aprovar e publicar
              </Botao>
              <button type="button" onClick={() => setRecusar(true)} className="h-11 rounded-[10px] px-4 font-medium text-muted hover:text-bad">
                Recusar
              </button>
              {!conf && <span className="text-[13px] text-muted">Baixe e confira antes de aprovar.</span>}
            </div>
          )}
        </>
      )}
    </li>
  );
}
