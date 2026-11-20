import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { chamar, useAcao, type CursoAdm } from "@/lib/instrutor";
import {
  PENDENCIAS,
  SITE_CURSO,
  SITUACOES,
  checkoutValido,
  diasDesde,
  escreverPreco,
  formatarPreco,
  lerPreco,
  useVitrineAdm,
  type SituacaoVitrine,
  type VitrineAdm,
} from "@/lib/vitrine";
import { dataCurta } from "@/lib/formato";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { Campo, ErroFormulario, Marcador } from "@/components/instrutor/Campos";
import { FalhaCarregamento } from "../Estados";

/** Depois disso o painel pede para conferir o preço na Hotmart de novo. */
const DIAS_CONFERENCIA = 30;

/**
 * Aba "Vitrine" (só admin): onde o curso aparece, as trilhas, o link de
 * checkout e o preço exibido. Quem cobra é a Hotmart; aqui fica só o que o
 * site e o portal mostram.
 */
export function AbaVitrine({ curso }: { curso: CursoAdm }) {
  const vitrine = useVitrineAdm(curso.slug);
  if (vitrine.isError) return <FalhaCarregamento tentar={() => void vitrine.refetch()} />;
  if (!vitrine.data)
    return (
      <div aria-busy="true" aria-label="Carregando a vitrine" className="flex max-w-3xl flex-col gap-4">
        <Esqueleto className="h-24 w-full" />
        <Esqueleto className="h-40 w-full" />
      </div>
    );
  return <FormVitrine key={vitrine.data.atualizado_em ?? "nova"} curso={curso} v={vitrine.data} />;
}

function FormVitrine({ curso, v }: { curso: CursoAdm; v: VitrineAdm }) {
  const aviso = useAvisos();
  const [situacao, setSituacao] = useState<SituacaoVitrine>(v.situacao);
  const [trilhas, setTrilhas] = useState(() => new Set(v.trilhas.filter((t) => t.no_curso).map((t) => t.slug)));
  const [checkout, setCheckout] = useState(v.checkout_url ?? "");
  const [produto, setProduto] = useState(v.hotmart_produto_id ? String(v.hotmart_produto_id) : "");
  const [preco, setPreco] = useState(escreverPreco(v.preco_centavos));
  const [obs, setObs] = useState(v.preco_observacao);
  const [conferi, setConferi] = useState(false);
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  const salvar = useAcao(
    (sb, dados: Record<string, unknown>) => chamar<VitrineAdm>(sb, "academy_adm_salvar_vitrine", { p_curso: curso.slug, p_dados: dados }),
    () => aviso({ titulo: "Vitrine salva", tipo: "ok" }),
  );

  const dias = diasDesde(v.preco_conferido_em);
  const conferenciaVencida = v.preco_centavos != null && dias != null && dias > DIAS_CONFERENCIA;

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    setErroLocal(null);
    const centavos = preco.trim() ? lerPreco(preco) : null;
    if (preco.trim() && centavos == null) return setErroLocal("Escreva o preço como 497,00.");
    if (checkout.trim() && !checkoutValido(checkout)) return setErroLocal("Cole o link de checkout da Hotmart, que começa com https://pay.hotmart.com/.");
    if (produto.trim() && !/^\d{1,12}$/.test(produto.trim())) return setErroLocal("O código do produto na Hotmart tem só números.");
    salvar.mutate({
      situacao,
      trilhas: [...trilhas],
      checkout_url: checkout.trim(),
      hotmart_produto_id: produto.trim(),
      preco_centavos: centavos,
      preco_observacao: obs.trim(),
      conferir_preco: conferi,
    });
  };

  const erro = erroLocal ? new Error(erroLocal) : salvar.error;

  return (
    <form onSubmit={enviar} aria-labelledby="h-vitrine" className="flex max-w-3xl flex-col gap-10">
      <div>
        <h2 id="h-vitrine" className="m-0 font-display text-lg font-semibold">
          Onde o curso aparece
        </h2>
        <p className="m-0 mt-1 text-sm text-muted">
          A mesma informação vai para o site, para o catálogo do portal e para quem compra pela Hotmart. O portal mostra na hora; o site
          atualiza em até uma hora.
        </p>
      </div>

      <Pendencias v={v} />

      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="mb-1 p-0 text-sm font-medium text-ink">Situação</legend>
        {SITUACOES.map((s) => (
          <label key={s.valor} className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-line px-4 py-3 has-[:checked]:border-line-hi has-[:checked]:bg-white/[0.04]">
            <input
              type="radio"
              name="situacao"
              value={s.valor}
              checked={situacao === s.valor}
              onChange={() => setSituacao(s.valor)}
              className="mt-1 size-4 shrink-0 accent-ink"
            />
            <span>
              <span className="block text-[15px] font-medium text-ink">{s.rotulo}</span>
              <span className="block text-[13px] text-muted">{s.ajuda}</span>
            </span>
          </label>
        ))}
        {v.situacao === "a_venda" && v.situacao_efetiva !== "a_venda" && (
          <p className="m-0 flex items-start gap-2 text-sm text-warn">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />O curso está despublicado, então a vitrine mostra "em breve" até
            ele voltar.
          </p>
        )}
        {v.situacao_efetiva !== "oculto" && (
          <a href={SITE_CURSO(curso.slug)} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 self-start text-sm text-muted hover:text-ink">
            Ver a página no site <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="sr-only">(abre em nova aba)</span>
          </a>
        )}
      </fieldset>

      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="mb-1 p-0 text-sm font-medium text-ink">Trilhas</legend>
        <p className="m-0 text-[13px] text-muted">
          No site, os cursos aparecem em blocos por trilha. Um curso pode estar em mais de uma.{" "}
          <Link to="/instrutor/trilhas" className="text-ink underline underline-offset-2">
            Criar ou ordenar trilhas
          </Link>
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {v.trilhas.map((t) => (
            <Marcador
              key={t.slug}
              rotulo={t.titulo}
              ajuda={t.publicado ? undefined : "Trilha não publicada"}
              checked={trilhas.has(t.slug)}
              onChange={(e) =>
                setTrilhas((x) => {
                  const n = new Set(x);
                  if (e.target.checked) n.add(t.slug);
                  else n.delete(t.slug);
                  return n;
                })
              }
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="m-0 flex flex-col gap-5 border-0 p-0">
        <legend className="mb-1 p-0 text-sm font-medium text-ink">Hotmart</legend>
        <Campo
          rotulo="Link de checkout"
          value={checkout}
          onChange={(e) => setCheckout(e.target.value)}
          placeholder="https://pay.hotmart.com/…"
          inputMode="url"
          spellCheck={false}
          ajuda="Na Hotmart, em Produtos, abra o produto e copie o link da página de pagamento. O botão Comprar acrescenta a origem da venda."
        />
        <Campo
          rotulo="Código do produto"
          value={produto}
          onChange={(e) => setProduto(e.target.value)}
          inputMode="numeric"
          ajuda="O número do produto na Hotmart. É por ele que a compra libera o acesso a este curso."
          className="max-w-60"
        />
      </fieldset>

      <fieldset className="m-0 flex flex-col gap-5 border-0 p-0">
        <legend className="mb-1 p-0 text-sm font-medium text-ink">Preço exibido</legend>
        <div className="grid gap-5 sm:grid-cols-[minmax(0,14rem)_1fr]">
          <Campo rotulo="Preço (R$)" value={preco} onChange={(e) => setPreco(e.target.value)} inputMode="decimal" placeholder="497,00" />
          <Campo rotulo="Observação" value={obs} onChange={(e) => setObs(e.target.value)} limite={80} placeholder="ou em até 12x no cartão" />
        </div>
        <p className={conferenciaVencida ? "m-0 flex items-start gap-2 text-sm text-warn" : "m-0 text-sm text-muted"}>
          {conferenciaVencida && <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
          {v.preco_centavos == null
            ? "Quem cobra é a Hotmart. Este valor só aparece no site e no portal: quando mudar o preço lá, mude aqui também."
            : `${formatarPreco(v.preco_centavos)} conferido na Hotmart em ${dataCurta(v.preco_conferido_em!)}${
                conferenciaVencida ? `, há ${dias} dias. Confira se o preço lá continua o mesmo.` : "."
              }`}
        </p>
        {v.preco_centavos != null && (
          <Marcador rotulo="Conferi agora que o preço na Hotmart é este" checked={conferi} onChange={(e) => setConferi(e.target.checked)} />
        )}
      </fieldset>

      <ErroFormulario erro={erro} />
      <div>
        <Botao type="submit" className="h-11 px-5" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando…" : "Salvar vitrine"}
        </Botao>
      </div>
    </form>
  );
}

function Pendencias({ v }: { v: VitrineAdm }) {
  if (v.pendencias.length === 0)
    return (
      <p className="m-0 flex items-center gap-2 text-sm text-ok">
        <CheckCircle2 className="size-4" aria-hidden="true" /> A página do curso tem tudo: sobre, ementa, quem ensina e carga horária.
      </p>
    );
  return (
    <div className="rounded-[10px] border border-line px-4 py-3">
      <p className="m-0 mb-2 text-sm font-medium text-ink">Para a página do curso ficar completa</p>
      <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-sm text-muted">
        {v.pendencias.map((p) => (
          <li key={p}>
            {PENDENCIAS[p].texto}{" "}
            {PENDENCIAS[p].aba && (
              <Link to={`?aba=${PENDENCIAS[p].aba}`} replace className="text-ink underline underline-offset-2">
                Abrir
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
