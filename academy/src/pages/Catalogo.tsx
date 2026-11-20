import { useState } from "react";
import { Link } from "react-router";
import { ExternalLink } from "lucide-react";
import { usePainel } from "@/lib/consultas";
import { usePortal } from "@/lib/portal";
import { NIVEL } from "@/lib/cursos";
import { cargaHoraria, formatarPreco, linkCompra, useCatalogo, type CursoCatalogo, type OfertaCatalogo } from "@/lib/vitrine";
import { cn } from "@/lib/cn";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { FalhaCarregamento } from "./Estados";

/**
 * Catálogo do portal (fase 14): os mesmos cursos do site, lidos da mesma
 * função pública. Aqui o portal sabe quem é a pessoa: curso que ela já tem
 * vira "Continuar", e o Comprar abre a Hotmart com o e-mail da conta.
 */
export default function Catalogo() {
  const catalogo = useCatalogo();
  const painel = usePainel();
  const [trilha, setTrilha] = useState<string | null>(null);
  if (catalogo.isError) return <FalhaCarregamento tentar={() => void catalogo.refetch()} />;

  const meus = new Set((painel.data?.cursos ?? []).map((c) => c.slug));
  const dados = catalogo.data;
  const selecionada = dados?.trilhas.find((t) => t.slug === trilha);
  const cursos = dados
    ? selecionada
      ? selecionada.cursos.flatMap((s) => dados.cursos.filter((c) => c.slug === s))
      : dados.cursos
    : [];

  return (
    <>
      <h1 className="m-0 mb-2 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Catálogo</h1>
      <p className="m-0 mb-8 max-w-2xl leading-relaxed text-muted">
        Todos os cursos da Academy. A compra é feita na Hotmart, com o e-mail da sua conta, e o curso aparece em Meus cursos assim que o pagamento
        for aprovado.
      </p>

      {dados?.ofertas?.filter((o) => o.tipo === "plataforma").map((o) => (
        <Oferta key="plataforma" oferta={o} titulo="Acesso a toda a Academy" />
      ))}

      {dados && dados.trilhas.length > 0 && (
        <div role="group" aria-label="Filtrar por trilha" className="mb-8 flex flex-wrap gap-2">
          {[{ slug: null, titulo: "Todas" }, ...dados.trilhas].map((t) => (
            <button
              key={t.slug ?? "todas"}
              type="button"
              aria-pressed={trilha === t.slug}
              onClick={() => setTrilha(t.slug)}
              className={cn(
                "h-9 rounded-full border px-4 text-sm font-medium transition-colors duration-150",
                trilha === t.slug ? "border-ink bg-ink text-bg" : "border-line-hi text-muted hover:border-muted hover:text-ink",
              )}
            >
              {t.titulo}
            </button>
          ))}
        </div>
      )}

      {selecionada?.descricao && <p className="m-0 -mt-3 mb-6 max-w-2xl text-sm text-muted">{selecionada.descricao}</p>}
      {selecionada &&
        dados?.ofertas
          ?.filter((o) => o.tipo === "trilha" && o.trilha === selecionada.slug)
          .map((o) => <Oferta key={o.nome} oferta={o} titulo={`Trilha ${selecionada.titulo} completa`} />)}

      {!dados ? (
        <div aria-busy="true" aria-label="Carregando o catálogo" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="painel-card flex flex-col gap-4 p-6">
              <Esqueleto className="h-6 w-2/3" />
              <Esqueleto className="h-4 w-full" />
              <Esqueleto className="h-10 w-28" />
            </div>
          ))}
        </div>
      ) : cursos.length === 0 ? (
        <section className="painel-card max-w-2xl p-7">
          <h2 className="m-0 mb-2 font-display text-xl font-semibold">Nenhum curso no catálogo ainda</h2>
          <p className="m-0 leading-relaxed text-muted">Os cursos aparecem aqui quando entram em pré-venda ou abrem matrícula.</p>
        </section>
      ) : (
        <ul className="m-0 grid list-none gap-5 p-0 md:grid-cols-2 xl:grid-cols-3">
          {cursos.map((c) => (
            <li key={c.slug}>
              <CartaoCurso curso={c} meu={meus.has(c.slug)} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function CartaoCurso({ curso, meu }: { curso: CursoCatalogo; meu: boolean }) {
  const horas = cargaHoraria(curso.carga_horaria_h);
  return (
    <article className="painel-card flex h-full flex-col p-6">
      <p className="m-0 mb-3 text-[13px] font-medium text-muted">
        {[NIVEL[curso.nivel], horas].filter(Boolean).join(", ")}
      </p>
      <h2 className="m-0 mb-2 font-display text-xl font-semibold">
        <Link to={`/catalogo/${curso.slug}`} className="hover:underline">
          {curso.titulo}
        </Link>
      </h2>
      <p className="m-0 mb-5 line-clamp-3 text-sm leading-relaxed text-muted">{curso.descricao}</p>
      <div className="mt-auto flex flex-col gap-4">
        {!meu && <Preco curso={curso} />}
        <AcaoCurso curso={curso} meu={meu} />
      </div>
    </article>
  );
}

export function Preco({ curso, grande }: { curso: CursoCatalogo; grande?: boolean }) {
  if (curso.situacao !== "a_venda" || curso.preco_centavos == null)
    return <p className={cn("m-0 font-medium text-muted", grande ? "text-lg" : "text-sm")}>Em breve. As matrículas ainda não abriram.</p>;
  return (
    <p className="m-0">
      <span className={cn("block font-display font-semibold text-ink", grande ? "text-3xl" : "text-xl")}>{formatarPreco(curso.preco_centavos)}</span>
      {curso.preco_observacao && <span className="block text-[13px] text-muted">{curso.preco_observacao}</span>}
    </p>
  );
}

/** Continuar, Comprar ou Ver ementa, conforme a pessoa e o curso. */
export function AcaoCurso({ curso, meu, detalhe }: { curso: CursoCatalogo; meu: boolean; detalhe?: boolean }) {
  const { sessao } = usePortal();
  const botao = "inline-flex h-11 items-center gap-2 self-start rounded-[10px] px-4 font-semibold transition-colors duration-150";
  if (meu)
    return (
      <Link to={`/cursos/${curso.slug}`} className={cn(botao, "border border-line-hi hover:border-muted")}>
        Continuar
      </Link>
    );
  const compra = curso.situacao === "a_venda" && curso.checkout_url ? linkCompra(curso.checkout_url, "portal", sessao?.user.email) : null;
  if (compra)
    return (
      <a href={compra} target="_blank" rel="noopener" className={cn(botao, "bg-orange text-orange-ink hover:bg-orange-hi")}>
        Comprar <ExternalLink className="size-4" aria-hidden="true" />
        <span className="sr-only">(abre em nova aba)</span>
      </a>
    );
  if (detalhe) return null;
  return (
    <Link to={`/catalogo/${curso.slug}`} className={cn(botao, "border border-line-hi hover:border-muted")}>
      Ver ementa
    </Link>
  );
}

/** Plataforma toda ou trilha completa à venda: Comprar com o e-mail da conta. */
function Oferta({ oferta, titulo }: { oferta: OfertaCatalogo; titulo: string }) {
  const { sessao } = usePortal();
  const link = linkCompra(oferta.checkout_url, "portal", sessao?.user.email);
  if (!link) return null;
  const periodo = oferta.duracao_dias === 365 ? "por 12 meses" : oferta.duracao_dias ? `por ${oferta.duracao_dias} dias` : "sem prazo para acabar";
  const corpo =
    oferta.tipo === "plataforma"
      ? `${oferta.cursos === 1 ? "O curso pago de hoje" : `Todos os ${oferta.cursos} cursos pagos`}, e os que forem lançados no período, ${periodo}.`
      : `${oferta.cursos === 1 ? "O curso da trilha" : `Os ${oferta.cursos} cursos da trilha`}, ${periodo}.`;
  return (
    <section aria-label={titulo} className="painel-card mb-8 flex flex-col gap-4 p-6 md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <h2 className="m-0 mb-1 font-display text-xl font-semibold">{titulo}</h2>
        <p className="m-0 text-sm leading-relaxed text-muted">{corpo}</p>
      </div>
      <div className="flex flex-col items-start gap-3 md:items-end">
        <p className="m-0 md:text-right">
          <span className="block font-display text-2xl font-semibold text-ink">{formatarPreco(oferta.preco_centavos)}</span>
          {oferta.preco_observacao && <span className="block text-[13px] text-muted">{oferta.preco_observacao}</span>}
        </p>
        <a
          href={link}
          target="_blank"
          rel="noopener"
          className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-orange px-4 font-semibold text-orange-ink transition-colors duration-150 hover:bg-orange-hi"
        >
          Comprar <ExternalLink className="size-4" aria-hidden="true" />
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      </div>
    </section>
  );
}
