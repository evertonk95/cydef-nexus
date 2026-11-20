import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import { usePortal } from "@/lib/portal";
import { chamar, useAcao, useCursosAdm, useEu } from "@/lib/instrutor";
import { useTrilhasAdm } from "@/lib/vitrine";
import {
  EMAIL,
  SITUACAO_EMPRESA,
  TIPO_EMPRESA,
  dia,
  enviarConvites,
  useEmpresasAdm,
  type Empresa,
  type EscopoEmpresa,
  type TipoEmpresa,
} from "@/lib/empresas";
import { cn } from "@/lib/cn";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { Campo, ErroFormulario, Selecao } from "@/components/instrutor/Campos";
import { FalhaCarregamento, NaoEncontrado } from "../Estados";

/**
 * Empresas (só admin, fase 17). Contrato negociado com a CyDef, sem preço
 * público e sem Hotmart: aqui ficam a empresa, o que ela libera, as datas, as
 * vagas e a primeira pessoa da gestão. O resto a gestora faz no portal.
 */
export default function EmpresasInstrutor() {
  const eu = useEu();
  const lista = useEmpresasAdm();
  const [editando, setEditando] = useState<Empresa | "nova" | null>(null);
  if (eu.papel !== "admin") return <NaoEncontrado />;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <h1 className="m-0 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Empresas</h1>
        {editando === null && (
          <Botao className="ml-auto h-10 px-4" onClick={() => setEditando("nova")}>
            <Plus className="size-4" aria-hidden="true" /> Cadastrar empresa
          </Botao>
        )}
      </div>
      <p className="m-0 mb-10 max-w-2xl text-muted">
        Consultoria com acesso à Academy ou plano para times. O contrato e a cobrança ficam fora daqui; a Academy só libera o acesso entre as datas
        e no número de vagas combinados.
      </p>
      {editando !== null && (
        <FormEmpresa key={editando === "nova" ? "nova" : editando.id} empresa={editando === "nova" ? null : editando} fechar={() => setEditando(null)} />
      )}
      {lista.isError ? (
        <FalhaCarregamento tentar={() => void lista.refetch()} />
      ) : !lista.data ? (
        <div aria-busy="true" aria-label="Carregando as empresas" className="flex flex-col gap-2">
          {[0, 1].map((i) => (
            <Esqueleto key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : lista.data.length === 0 ? (
        <p className="m-0 text-muted">Nenhuma empresa cadastrada ainda.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {lista.data.map((e) => (
            <LinhaEmpresa key={e.id} e={e} editar={() => setEditando(e)} />
          ))}
        </ul>
      )}
    </>
  );
}

const COR: Record<Empresa["situacao"], string> = { futura: "text-muted", vigente: "text-ok", vencida: "text-dim", encerrada: "text-dim" };

function LinhaEmpresa({ e, editar }: { e: Empresa; editar: () => void }) {
  const aviso = useAvisos();
  const [encerrar, setEncerrar] = useState(false);
  const [motivo, setMotivo] = useState("");
  const fim = useAcao(
    (sb, m: string) => chamar<Empresa>(sb, "academy_adm_encerrar_empresa", { p_id: e.id, p_motivo: m }),
    () => {
      aviso({ titulo: "Contrato encerrado", texto: "O acesso da equipe foi retirado e os convites pendentes, cancelados.", tipo: "ok" });
      setEncerrar(false);
    },
  );
  const aberta = e.situacao === "vigente" || e.situacao === "futura";
  const enviar = (ev: FormEvent) => {
    ev.preventDefault();
    fim.mutate(motivo);
  };

  return (
    <li aria-label={e.nome} className="border-b border-line py-4 last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="min-w-0 flex-1 basis-64">
          <p className="m-0 truncate font-medium">{e.nome}</p>
          <p className="m-0 truncate text-[13px] text-muted">
            {TIPO_EMPRESA[e.tipo]}, {e.alvo.toLowerCase()}
          </p>
        </div>
        <div className="min-w-0 basis-56 text-[13px] text-muted">
          <p className="m-0">
            {dia(e.inicio)} a {dia(e.fim)}
          </p>
          <p className="m-0">
            {e.usadas} de {e.vagas} vagas, {e.ativos} {e.ativos === 1 ? "pessoa" : "pessoas"}
          </p>
        </div>
        <p className={cn("m-0 w-28 text-[13px] font-medium", COR[e.situacao])}>{SITUACAO_EMPRESA[e.situacao]}</p>
        {aberta && !encerrar && (
          <div className="flex flex-wrap gap-2">
            <Link to={`/empresa/${e.id}`} className="inline-flex h-9 items-center rounded-[10px] border border-line-hi px-3 text-sm font-semibold hover:border-muted">
              Abrir painel
            </Link>
            <Botao variante="contorno" className="h-9 px-3 text-sm" onClick={editar}>
              Editar
            </Botao>
            <Botao variante="contorno" className="h-9 px-3 text-sm" onClick={() => (setEncerrar(true), setMotivo(""))}>
              Encerrar
            </Botao>
          </div>
        )}
      </div>
      {e.gestoras.length > 0 && aberta && <p className="m-0 mt-1 text-[13px] text-dim">Gestão: {e.gestoras.join(", ")}</p>}
      {e.motivo && <p className="m-0 mt-1 text-[13px] text-dim">Motivo do encerramento: {e.motivo}</p>}
      {encerrar && (
        <form onSubmit={enviar} className="mt-3 flex max-w-2xl flex-col gap-3 rounded-[10px] border border-line p-4">
          <Campo
            rotulo="Motivo do encerramento"
            ajuda="Retira o acesso de toda a equipe agora. Para o contrato terminar na data combinada, não precisa encerrar."
            value={motivo}
            onChange={(ev) => setMotivo(ev.target.value)}
            required
            autoFocus
            limite={200}
          />
          <ErroFormulario erro={fim.error} />
          <div className="flex gap-3">
            <Botao type="submit" className="h-10 px-4" disabled={fim.isPending}>
              Encerrar contrato
            </Botao>
            <Botao variante="contorno" className="h-10 px-4" onClick={() => setEncerrar(false)}>
              Cancelar
            </Botao>
          </div>
        </form>
      )}
    </li>
  );
}

const hojeIso = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const umAno = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  d.setDate(d.getDate() - 1);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

function FormEmpresa({ empresa, fechar }: { empresa: Empresa | null; fechar: () => void }) {
  const { sb } = usePortal();
  const aviso = useAvisos();
  const cursos = useCursosAdm();
  const trilhas = useTrilhasAdm();
  const [f, setF] = useState({
    nome: empresa?.nome ?? "",
    tipo: empresa?.tipo ?? ("consultoria" as TipoEmpresa),
    escopo: empresa?.escopo ?? ("plataforma" as EscopoEmpresa),
    curso: empresa?.curso ?? "",
    trilha: empresa?.trilha ?? "",
    inicio: empresa?.inicio ?? hojeIso(),
    fim: empresa?.fim ?? umAno(),
    vagas: String(empresa?.vagas ?? 10),
    observacao: empresa?.observacao ?? "",
    gestor: "",
  });
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const salvar = useAcao(
    (s, dados: Record<string, unknown>) => chamar<Empresa>(s, "academy_adm_salvar_empresa", { p_dados: dados }),
    async (r) => {
      if (!empresa) {
        const envio = await enviarConvites(sb, r.id);
        aviso(
          envio && envio.enviados > 0
            ? { titulo: "Empresa cadastrada", texto: `Convite enviado para ${f.gestor.trim().toLowerCase()}.`, tipo: "ok" }
            : { titulo: "Empresa cadastrada", texto: "O e-mail do convite não saiu agora. Reenvie pelo painel da empresa.", tipo: "ok" },
        );
      } else {
        aviso({ titulo: "Contrato atualizado", texto: "O acesso da equipe já segue as novas condições.", tipo: "ok" });
      }
      fechar();
    },
  );
  const pagos = (cursos.data ?? []).filter((c) => !c.gratuito);
  const enviar = (ev: FormEvent) => {
    ev.preventDefault();
    setErroLocal(null);
    if (!empresa && !EMAIL.test(f.gestor.trim())) return setErroLocal("Confira o e-mail de quem vai cuidar da gestão.");
    if (f.fim < f.inicio) return setErroLocal("O fim do contrato não pode ser antes do início.");
    salvar.mutate({
      ...(empresa ? { id: empresa.id } : { gestor_email: f.gestor.trim() }),
      nome: f.nome,
      tipo: f.tipo,
      escopo: f.escopo,
      curso: f.escopo === "curso" ? f.curso : null,
      trilha: f.escopo === "trilha" ? f.trilha : null,
      inicio: f.inicio,
      fim: f.fim,
      vagas: Number(f.vagas),
      observacao: f.observacao,
    });
  };

  return (
    <form
      onSubmit={enviar}
      aria-label={empresa ? `Editar ${empresa.nome}` : "Cadastrar empresa"}
      className="mb-8 flex max-w-2xl flex-col gap-5 rounded-2xl border border-line bg-panel p-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo rotulo="Empresa" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} required limite={120} />
        <Selecao rotulo="Tipo" value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value as TipoEmpresa })}>
          <option value="consultoria">Consultoria com acesso à Academy</option>
          <option value="plano">Plano para times</option>
        </Selecao>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Selecao rotulo="O contrato libera" value={f.escopo} onChange={(e) => setF({ ...f, escopo: e.target.value as EscopoEmpresa })}>
          <option value="plataforma">A plataforma toda</option>
          <option value="trilha">Uma trilha</option>
          <option value="curso">Um curso</option>
        </Selecao>
        {f.escopo === "curso" && (
          <Selecao rotulo="Curso" value={f.curso} onChange={(e) => setF({ ...f, curso: e.target.value })} required>
            <option value="">Escolha</option>
            {pagos.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.titulo}
              </option>
            ))}
          </Selecao>
        )}
        {f.escopo === "trilha" && (
          <Selecao rotulo="Trilha" value={f.trilha} onChange={(e) => setF({ ...f, trilha: e.target.value })} required>
            <option value="">Escolha</option>
            {(trilhas.data ?? []).map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.titulo}
              </option>
            ))}
          </Selecao>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Campo rotulo="Início" type="date" value={f.inicio} onChange={(e) => setF({ ...f, inicio: e.target.value })} required />
        <Campo rotulo="Último dia de acesso" type="date" value={f.fim} onChange={(e) => setF({ ...f, fim: e.target.value })} required />
        <Campo rotulo="Vagas" type="number" min={1} max={5000} value={f.vagas} onChange={(e) => setF({ ...f, vagas: e.target.value })} required />
      </div>
      {!empresa && (
        <Campo
          rotulo="E-mail de quem vai cuidar da gestão"
          ajuda="Recebe o convite, ocupa uma vaga e, depois de aceitar, convida o resto da equipe."
          type="email"
          value={f.gestor}
          onChange={(e) => setF({ ...f, gestor: e.target.value })}
          required
        />
      )}
      <Campo
        rotulo="Observação interna (opcional)"
        ajuda="Só a CyDef vê. Por exemplo, o número do contrato."
        value={f.observacao}
        onChange={(e) => setF({ ...f, observacao: e.target.value })}
        limite={300}
      />
      {f.escopo === "trilha" && (
        <p className="m-0 -mt-2 text-[13px] text-muted">A trilha vale com os cursos que ela tem ao salvar. Se a trilha ganhar um curso, salve o contrato de novo para incluir.</p>
      )}
      <ErroFormulario erro={erroLocal ? new Error(erroLocal) : salvar.error} />
      <div className="flex gap-3">
        <Botao type="submit" className="h-11 px-5" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando…" : empresa ? "Salvar contrato" : "Cadastrar e convidar"}
        </Botao>
        <Botao variante="contorno" className="h-11 px-5" onClick={fechar}>
          Cancelar
        </Botao>
      </div>
    </form>
  );
}
