import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Building2, Check, X } from "lucide-react";
import { usePortal } from "@/lib/portal";
import { urlAviso } from "@/lib/privacidade";
import { chamar, useAcao } from "@/lib/instrutor";
import { dia, useMinhasEmpresas, type ConviteRecebido, type MinhasEmpresas } from "@/lib/empresas";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { ErroFormulario } from "@/components/instrutor/Campos";
import { FalhaCarregamento } from "./Estados";

/**
 * Convites de empresa (fase 17). Antes de aceitar, a pessoa lê exatamente o
 * que a gestão da empresa vai acompanhar. O aceite fica registrado com a
 * versão do Aviso de Privacidade vigente.
 */
export default function Convites() {
  const minhas = useMinhasEmpresas();
  if (minhas.isError) return <FalhaCarregamento tentar={() => void minhas.refetch()} />;
  if (!minhas.data)
    return (
      <div aria-busy="true" aria-label="Carregando convites" className="flex flex-col gap-4">
        <Esqueleto className="h-9 w-64" />
        <Esqueleto className="h-64 w-full max-w-3xl" />
      </div>
    );
  const { convites } = minhas.data;

  return (
    <>
      <h1 className="m-0 mb-2 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Convites de empresa</h1>
      <p className="m-0 mb-10 max-w-2xl leading-relaxed text-muted">
        Uma empresa liberou a Academy para você. Leia o que muda antes de responder.
      </p>
      {convites.length === 0 ? (
        <div className="painel-card max-w-3xl p-6">
          <p className="m-0 text-muted">Nenhum convite pendente.</p>
          <p className="m-0 mt-3">
            <Link to="/" className="font-medium text-orange-hi underline-offset-4 hover:underline">
              Voltar ao painel
            </Link>
          </p>
        </div>
      ) : (
        <div className="flex max-w-3xl flex-col gap-8">
          {convites.map((c) => (
            <CartaoConvite key={c.id} c={c} />
          ))}
        </div>
      )}
    </>
  );
}

function CartaoConvite({ c }: { c: ConviteRecebido }) {
  const { config } = usePortal();
  const aviso = useAvisos();
  const navegar = useNavigate();
  const [recusar, setRecusar] = useState(false);
  const aceitar = useAcao(
    (sb, id: string) => chamar<MinhasEmpresas>(sb, "academy_aceitar_convite", { p_membro: id }),
    (r) => {
      aviso({ titulo: `Convite da ${c.empresa} aceito`, tipo: "ok" });
      const e = r.empresas.find((x) => x.membro === c.id);
      navegar(c.gestor && e ? `/empresa/${e.id}` : "/cursos");
    },
  );
  const recusa = useAcao(
    (sb, id: string) => chamar<MinhasEmpresas>(sb, "academy_recusar_convite", { p_membro: id }),
    () => aviso({ titulo: "Convite recusado", tipo: "ok" }),
  );
  const titulo = `h-convite-${c.id}`;

  return (
    <section aria-labelledby={titulo} className="painel-card p-6 sm:p-8">
      <div className="mb-5 flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line-hi bg-bg">
          <Building2 className="size-5 text-orange-hi" aria-hidden="true" />
        </span>
        <div>
          <h2 id={titulo} className="m-0 font-display text-xl font-semibold">
            {c.empresa}
          </h2>
          <p className="m-0 mt-1 text-sm text-muted">
            Libera {c.alvo.toLowerCase() === "plataforma toda" ? "todos os cursos pagos da Academy" : c.alvo} até {dia(c.fim)}
            {c.gestor && ". Você vai cuidar da gestão da equipe"}.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="m-0 mb-2 text-sm font-semibold">A gestão da {c.empresa} vai ver</h3>
          <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted">
            <li>seu nome e seu e-mail;</li>
            <li>as aulas que você concluiu em cada curso do contrato;</li>
            <li>se você passou na avaliação final de cada curso;</li>
            <li>os certificados emitidos;</li>
            <li>a data do seu último acesso.</li>
          </ul>
        </div>
        <div>
          <h3 className="m-0 mb-2 text-sm font-semibold">E não vai ver</h3>
          <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted">
            <li>suas notas e respostas;</li>
            <li>cursos que não fazem parte do contrato, como os gratuitos;</li>
            <li>nada depois que você sair da empresa ou o contrato terminar.</li>
          </ul>
        </div>
      </div>

      <p className="m-0 mt-6 text-sm leading-relaxed text-muted">
        Você pode sair da empresa quando quiser, em Minha conta. Sua conta, o progresso e os certificados continuam seus. Detalhes no{" "}
        <a href={urlAviso(config.siteUrl)} target="_blank" rel="noopener" className="font-medium text-ink underline underline-offset-4">
          Aviso de Privacidade
        </a>
        , item 2.6.
      </p>

      <ErroFormulario erro={aceitar.error ?? recusa.error} />
      <div className="mt-6 flex flex-wrap gap-3">
        {recusar ? (
          <>
            <Botao variante="contorno" className="h-11 px-5" onClick={() => recusa.mutate(c.id)} disabled={recusa.isPending}>
              <X className="size-4" aria-hidden="true" /> Confirmar recusa
            </Botao>
            <Botao variante="contorno" className="h-11 px-5" onClick={() => setRecusar(false)}>
              Voltar
            </Botao>
          </>
        ) : (
          <>
            <Botao className="h-11 px-5" onClick={() => aceitar.mutate(c.id)} disabled={aceitar.isPending}>
              <Check className="size-4" aria-hidden="true" /> {aceitar.isPending ? "Aceitando…" : "Aceitar convite"}
            </Botao>
            <Botao variante="contorno" className="h-11 px-5" onClick={() => setRecusar(true)}>
              Recusar
            </Botao>
          </>
        )}
      </div>
    </section>
  );
}
