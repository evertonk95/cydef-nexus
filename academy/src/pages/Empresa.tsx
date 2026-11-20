import { useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Link, Navigate, useParams } from "react-router";
import { ChevronDown, Download, MailPlus } from "lucide-react";
import { usePortal } from "@/lib/portal";
import { chamar, ErroPainel, semAcesso, useAcao } from "@/lib/instrutor";
import {
  EMAIL,
  csvProgresso,
  dia,
  enviarConvites,
  lerEmails,
  prazoContrato,
  useEmpresaPainel,
  useMinhasEmpresas,
  type MembroEmpresa,
  type PainelEmpresa,
} from "@/lib/empresas";
import { baixarArquivo } from "@/lib/conta";
import { dataCurta } from "@/lib/formato";
import { cn } from "@/lib/cn";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { ErroFormulario, Marcador } from "@/components/instrutor/Campos";
import { FalhaCarregamento, NaoEncontrado } from "./Estados";

/** /empresa: leva direto à empresa quando a pessoa cuida de uma só. */
export function MinhasEmpresasGestao() {
  const minhas = useMinhasEmpresas();
  if (!minhas.data) return <Esqueleto className="h-24 w-full max-w-3xl" />;
  const gestao = minhas.data.empresas.filter((e) => e.gestor);
  if (gestao.length === 0) return <NaoEncontrado />;
  if (gestao.length === 1) return <Navigate to={`/empresa/${gestao[0]!.id}`} replace />;
  return (
    <>
      <h1 className="m-0 mb-8 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Minhas empresas</h1>
      <ul className="m-0 flex max-w-3xl list-none flex-col gap-3 p-0">
        {gestao.map((e) => (
          <li key={e.id}>
            <Link to={`/empresa/${e.id}`} className="painel-card flex items-center justify-between gap-4 p-5 hover:border-line-hi">
              <span className="font-medium">{e.empresa}</span>
              <span className="text-sm text-muted">até {dia(e.fim)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Painel da gestora (fase 17): vagas, convites e o progresso de cada pessoa
 * nos cursos do contrato. Sem notas: o banco não devolve.
 */
export default function Empresa() {
  const { id = "" } = useParams();
  const painel = useEmpresaPainel(id);
  if (painel.isError) {
    if (semAcesso(painel.error) || (painel.error instanceof ErroPainel && painel.error.codigo === "empresa_inexistente")) return <NaoEncontrado />;
    if (painel.error instanceof ErroPainel && painel.error.codigo === "contrato_encerrado")
      return (
        <div className="painel-card max-w-2xl p-6">
          <h1 className="m-0 mb-2 font-display text-2xl font-semibold">Contrato encerrado</h1>
          <p className="m-0 text-muted">O contrato dessa empresa com a CyDef Academy terminou. Para renovar, escreva para contato@cydef.com.br.</p>
        </div>
      );
    return <FalhaCarregamento tentar={() => void painel.refetch()} />;
  }
  if (!painel.data)
    return (
      <div aria-busy="true" aria-label="Carregando a empresa" className="flex flex-col gap-4">
        <Esqueleto className="h-9 w-72" />
        <Esqueleto className="h-24 w-full" />
        <Esqueleto className="h-64 w-full" />
      </div>
    );
  return <PainelGestao p={painel.data} />;
}

function PainelGestao({ p }: { p: PainelEmpresa }) {
  const e = p.empresa;
  const livres = Math.max(e.vagas - e.usadas, 0);
  const ativos = p.membros.filter((m) => m.situacao === "ativo");
  const convites = p.membros.filter((m) => m.situacao === "convidado");

  return (
    <>
      <h1 className="m-0 mb-2 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">{e.nome}</h1>
      <p className="m-0 mb-8 max-w-2xl leading-relaxed text-muted">
        {e.alvo === "Plataforma toda" ? "Todos os cursos pagos da Academy" : e.alvo}, de {dia(e.inicio)} a {dia(e.fim)}.{" "}
        {e.situacao === "futura" ? "O acesso da equipe começa no primeiro dia do contrato." : `${prazoContrato(e.fim)}.`}
      </p>

      <dl className="mb-10 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
        {[
          ["Vagas", String(e.vagas)],
          ["Pessoas", String(e.ativos)],
          ["Convites pendentes", String(e.convites)],
          ["Vagas livres", String(livres)],
        ].map(([rotulo, valor]) => (
          <div key={rotulo} className="bg-panel px-5 py-4">
            <dt className="text-[13px] text-muted">{rotulo}</dt>
            <dd className="m-0 mt-1 font-display text-2xl font-semibold tabular-nums">{valor}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-12">
        <Convidar empresaId={e.id} livres={livres} />
        <section aria-labelledby="h-equipe">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <h2 id="h-equipe" className="m-0 font-display text-xl font-semibold">
              Equipe
            </h2>
            {ativos.length > 0 && (
              <Botao
                variante="contorno"
                className="ml-auto h-10 px-4"
                onClick={() => baixarArquivo(csvProgresso(p), `progresso-${e.nome.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`, "text/csv;charset=utf-8")}
              >
                <Download className="size-4" aria-hidden="true" /> Baixar planilha
              </Botao>
            )}
          </div>
          {ativos.length === 0 ? (
            <p className="m-0 text-muted">Ninguém aceitou o convite ainda.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {ativos.map((m) => (
                <LinhaMembro key={m.id} m={m} />
              ))}
            </ul>
          )}
        </section>
        {convites.length > 0 && (
          <section aria-labelledby="h-convites">
            <h2 id="h-convites" className="m-0 mb-4 font-display text-xl font-semibold">
              Convites pendentes
            </h2>
            <ul className="m-0 flex list-none flex-col p-0">
              {convites.map((m) => (
                <LinhaConvite key={m.id} m={m} empresaId={e.id} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

function Convidar({ empresaId, livres }: { empresaId: string; livres: number }) {
  const { sb } = usePortal();
  const aviso = useAvisos();
  const [texto, setTexto] = useState("");
  const [gestor, setGestor] = useState(false);
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const convidar = useAcao(
    (s, emails: string[]) => chamar<{ convidados: number; ja_na_empresa: string[] }>(s, "academy_empresa_convidar", { p_empresa: empresaId, p_emails: emails, p_gestor: gestor }),
    async (r) => {
      setTexto("");
      setGestor(false);
      const envio = r.convidados > 0 ? await enviarConvites(sb, empresaId) : null;
      const ja = r.ja_na_empresa.length > 0 ? ` ${r.ja_na_empresa.length} já estava na empresa.` : "";
      if (r.convidados === 0) aviso({ titulo: "Nenhum convite novo", texto: ja.trim() || undefined, tipo: "ok" });
      else if (envio && envio.email === "ligado" && envio.falhas === 0)
        aviso({ titulo: r.convidados === 1 ? "Convite enviado" : `${r.convidados} convites enviados`, texto: ja.trim() || undefined, tipo: "ok" });
      else
        aviso({
          titulo: r.convidados === 1 ? "Convite registrado" : `${r.convidados} convites registrados`,
          texto: "O e-mail não saiu agora. A pessoa encontra o convite ao entrar na Academy com o e-mail convidado, ou você pode reenviar.",
          tipo: "ok",
        });
    },
  );
  const enviar = (ev: FormEvent) => {
    ev.preventDefault();
    setErroLocal(null);
    const emails = lerEmails(texto);
    const ruins = emails.filter((x) => !EMAIL.test(x));
    if (emails.length === 0) return setErroLocal("Escreva pelo menos um e-mail.");
    if (ruins.length > 0) return setErroLocal(`Confira: ${ruins.slice(0, 3).join(", ")}${ruins.length > 3 ? "…" : ""}`);
    if (emails.length > 50) return setErroLocal("Convide até 50 pessoas por vez.");
    convidar.mutate(emails);
  };

  return (
    <section aria-labelledby="h-convidar" className="max-w-3xl">
      <h2 id="h-convidar" className="m-0 mb-2 font-display text-xl font-semibold">
        Convidar pessoas
      </h2>
      <p className="m-0 mb-4 text-sm text-muted">
        Cole os e-mails da equipe, um por linha ou separados por vírgula. Cada convite ocupa uma vaga até ser recusado ou cancelado.
      </p>
      <form onSubmit={enviar} aria-label="Convidar pessoas" className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-5">
        <label htmlFor="emails-convite" className="text-sm font-medium">
          E-mails
        </label>
        <textarea
          id="emails-convite"
          value={texto}
          onChange={(ev) => setTexto(ev.target.value)}
          rows={4}
          spellCheck={false}
          placeholder={"ana@empresa.com.br\nbruno@empresa.com.br"}
          aria-describedby="vagas-livres"
          className="rounded-[10px] border border-line-hi bg-bg px-3.5 py-3 text-[15px] text-ink placeholder:text-dim focus:border-orange-hi focus:outline-none"
        />
        <p id="vagas-livres" className="m-0 -mt-2 text-[13px] text-muted">
          {livres === 1 ? "1 vaga livre." : `${livres} vagas livres.`}
        </p>
        <Marcador rotulo="Convidar para a gestão" ajuda="Quem entra na gestão também convida pessoas e vê o progresso da equipe." checked={gestor} onChange={(ev) => setGestor(ev.target.checked)} />
        <ErroFormulario erro={erroLocal ? new Error(erroLocal) : convidar.error} />
        <div>
          <Botao type="submit" className="h-11 px-5" disabled={convidar.isPending || livres === 0}>
            <MailPlus className="size-4" aria-hidden="true" /> {convidar.isPending ? "Convidando…" : "Enviar convites"}
          </Botao>
        </div>
      </form>
    </section>
  );
}

function resumo(m: MembroEmpresa): string {
  const certificados = m.cursos.filter((c) => c.certificado_em).length;
  if (m.cursos.length === 0) return "Ainda não começou";
  const partes = [m.cursos.length === 1 ? "1 curso iniciado" : `${m.cursos.length} cursos iniciados`];
  if (certificados > 0) partes.push(certificados === 1 ? "1 certificado" : `${certificados} certificados`);
  return partes.join(", ");
}

function LinhaMembro({ m }: { m: MembroEmpresa }) {
  const aviso = useAvisos();
  const [aberto, setAberto] = useState(false);
  const [remover, setRemover] = useState(false);
  const definir = useAcao(
    (sb, valor: boolean) => chamar(sb, "academy_empresa_definir_gestor", { p_membro: m.id, p_gestor: valor }),
    (_r, valor) => aviso({ titulo: valor ? "Agora na gestão" : "Fora da gestão", tipo: "ok" }),
  );
  const tirar = useAcao(
    (sb: SupabaseClient) => chamar(sb, "academy_empresa_remover", { p_membro: m.id }),
    () => aviso({ titulo: "Pessoa removida", texto: "O acesso pelos cursos do contrato foi encerrado.", tipo: "ok" }),
  );
  const nome = m.nome ?? m.email;
  const detalhes = `detalhes-${m.id}`;

  return (
    <li aria-label={nome} className="border-b border-line py-3.5 last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="min-w-0 flex-1 basis-64">
          <p className="m-0 truncate font-medium">
            {nome}
            {m.gestor && <span className="ml-2 rounded-md border border-line-hi px-1.5 py-px text-xs font-normal text-muted">Gestão</span>}
          </p>
          <p className="m-0 truncate text-[13px] text-muted">{m.nome ? m.email : `Entrou em ${dataCurta(m.aceito_em ?? m.convidado_em)}`}</p>
        </div>
        <div className="min-w-0 basis-56 text-[13px] text-muted">
          <p className="m-0">{resumo(m)}</p>
          <p className="m-0">{m.ultimo_acesso ? `Último acesso em ${dataCurta(m.ultimo_acesso)}` : "Sem acesso registrado"}</p>
        </div>
        <button
          type="button"
          aria-expanded={aberto}
          aria-controls={detalhes}
          onClick={() => setAberto((a) => !a)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted hover:text-ink"
        >
          Progresso <ChevronDown className={cn("size-4 transition-transform", aberto && "rotate-180")} aria-hidden="true" />
        </button>
      </div>
      {aberto && (
        <div id={detalhes} className="mt-3 rounded-[10px] border border-line p-4">
          {m.cursos.length === 0 ? (
            <p className="m-0 text-sm text-muted">Nenhuma aula concluída nos cursos do contrato.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Progresso de {nome}</caption>
              <thead>
                <tr className="text-left text-[13px] text-muted">
                  <th scope="col" className="pb-2 font-medium">Curso</th>
                  <th scope="col" className="pb-2 font-medium">Aulas</th>
                  <th scope="col" className="pb-2 font-medium">Avaliação final</th>
                  <th scope="col" className="pb-2 font-medium">Certificado</th>
                </tr>
              </thead>
              <tbody>
                {m.cursos.map((c) => (
                  <tr key={c.slug} className="border-t border-line">
                    <th scope="row" className="py-2 pr-3 text-left font-normal">{c.titulo}</th>
                    <td className="py-2 pr-3 tabular-nums">
                      {c.concluidas} de {c.total}
                    </td>
                    <td className="py-2 pr-3">{c.aprovado ? "Aprovado" : "Ainda não"}</td>
                    <td className="py-2">{c.certificado_em ? dataCurta(c.certificado_em) : "Ainda não"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Botao variante="contorno" className="h-9 px-3 text-sm" onClick={() => definir.mutate(!m.gestor)} disabled={definir.isPending}>
              {m.gestor ? "Tirar da gestão" : "Colocar na gestão"}
            </Botao>
            {remover ? (
              <>
                <Botao variante="contorno" className="h-9 px-3 text-sm" onClick={() => tirar.mutate(null)} disabled={tirar.isPending}>
                  Confirmar remoção
                </Botao>
                <Botao variante="contorno" className="h-9 px-3 text-sm" onClick={() => setRemover(false)}>
                  Cancelar
                </Botao>
              </>
            ) : (
              <Botao variante="contorno" className="h-9 px-3 text-sm" onClick={() => setRemover(true)}>
                Remover da empresa
              </Botao>
            )}
          </div>
          {remover && <p className="m-0 mt-2 text-[13px] text-muted">A pessoa perde o acesso aos cursos do contrato e libera a vaga. A conta e os certificados continuam com ela.</p>}
          <ErroFormulario erro={definir.error ?? tirar.error} />
        </div>
      )}
    </li>
  );
}

function LinhaConvite({ m, empresaId }: { m: MembroEmpresa; empresaId: string }) {
  const { sb } = usePortal();
  const aviso = useAvisos();
  const reenviar = useAcao(
    (s: SupabaseClient) => chamar(s, "academy_empresa_reenviar_convite", { p_membro: m.id }),
    async () => {
      const envio = await enviarConvites(sb, empresaId);
      aviso(
        envio && envio.enviados > 0
          ? { titulo: "Convite reenviado", tipo: "ok" }
          : { titulo: "Convite pronto para reenvio", texto: "O e-mail não saiu agora. Tente de novo em alguns minutos.", tipo: "ok" },
      );
    },
  );
  const cancelar = useAcao(
    (s: SupabaseClient) => chamar(s, "academy_empresa_cancelar_convite", { p_membro: m.id }),
    () => aviso({ titulo: "Convite cancelado", tipo: "ok" }),
  );

  return (
    <li aria-label={m.email} className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line py-3 last:border-b-0">
      <div className="min-w-0 flex-1 basis-64">
        <p className="m-0 truncate font-medium">
          {m.email}
          {m.gestor && <span className="ml-2 rounded-md border border-line-hi px-1.5 py-px text-xs font-normal text-muted">Gestão</span>}
        </p>
        <p className="m-0 text-[13px] text-muted">
          {m.convite_enviado_em ? `E-mail enviado em ${dataCurta(m.convite_enviado_em)}` : "E-mail ainda não enviado"}
        </p>
      </div>
      <div className="flex gap-2">
        <Botao variante="contorno" className="h-9 px-3 text-sm" onClick={() => reenviar.mutate(null)} disabled={reenviar.isPending}>
          Reenviar
        </Botao>
        <Botao variante="contorno" className="h-9 px-3 text-sm" onClick={() => cancelar.mutate(null)} disabled={cancelar.isPending}>
          Cancelar convite
        </Botao>
      </div>
      <div className="basis-full">
        <ErroFormulario erro={reenviar.error ?? cancelar.error} />
      </div>
    </li>
  );
}
