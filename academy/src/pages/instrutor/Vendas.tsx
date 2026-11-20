import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Plus, Search } from "lucide-react";
import { chamar, useAcao, useCursosAdm, useEu } from "@/lib/instrutor";
import { checkoutValido, escreverPreco, formatarPreco, lerPreco, useTrilhasAdm } from "@/lib/vitrine";
import { ORIGEM, RESULTADO_EVENTO, useConcessoes, useProdutos, validade, type Concessao, type Escopo, type ProdutoHotmart } from "@/lib/vendas";
import { dataCurta } from "@/lib/formato";
import { cn } from "@/lib/cn";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { Campo, ErroFormulario, Marcador, Selecao } from "@/components/instrutor/Campos";
import { FalhaCarregamento, NaoEncontrado } from "../Estados";

/**
 * Vendas e acessos (só admin, fase 16). A Hotmart vende e cobra; aqui fica o
 * que ela liberou ou encerrou, as liberações manuais, a transferência de uma
 * compra feita com outro e-mail e os produtos de trilha e de plataforma.
 */
export default function VendasInstrutor() {
  const eu = useEu();
  if (eu.papel !== "admin") return <NaoEncontrado />;
  return (
    <>
      <h1 className="m-0 mb-3 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Vendas e acessos</h1>
      <p className="m-0 mb-10 max-w-2xl text-muted">
        A Hotmart vende, cobra e reembolsa. A Academy libera e encerra o acesso conforme os avisos dela. Recibo, nota e devolução de dinheiro são
        sempre pela Hotmart.
      </p>
      <div className="flex flex-col gap-14">
        <Acessos />
        <ProdutosHotmart />
      </div>
    </>
  );
}

// Acessos ------------------------------------------------------------------------

const SITUACAO_COR: Record<Concessao["situacao"], string> = { ativa: "text-ok", vencida: "text-muted", encerrada: "text-dim" };
const SITUACAO_ROTULO: Record<Concessao["situacao"], string> = { ativa: "Ativo", vencida: "Vencido", encerrada: "Encerrado" };

function Acessos() {
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(false);
  const lista = useConcessoes(busca);

  return (
    <section aria-labelledby="h-acessos">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <h2 id="h-acessos" className="m-0 font-display text-xl font-semibold">
          Acessos pagos
        </h2>
        {!novo && (
          <Botao className="ml-auto h-10 px-4" onClick={() => setNovo(true)}>
            <Plus className="size-4" aria-hidden="true" /> Liberar acesso
          </Botao>
        )}
      </div>
      {novo && <FormLiberar fechar={() => setNovo(false)} />}
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setBusca(texto.trim());
        }}
        className="mb-4 flex max-w-xl gap-2"
      >
        <label htmlFor="busca-acessos" className="sr-only">
          Buscar por e-mail ou transação
        </label>
        <input
          id="busca-acessos"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="E-mail ou transação da Hotmart"
          className="h-10 flex-1 rounded-[10px] border border-line-hi bg-bg px-3.5 text-[15px] text-ink placeholder:text-dim focus:border-orange-hi focus:outline-none"
        />
        <Botao type="submit" variante="contorno" className="h-10 px-4">
          <Search className="size-4" aria-hidden="true" /> Buscar
        </Botao>
      </form>
      {lista.isError ? (
        <FalhaCarregamento tentar={() => void lista.refetch()} />
      ) : !lista.data ? (
        <div aria-busy="true" aria-label="Carregando os acessos" className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Esqueleto key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : lista.data.length === 0 ? (
        <p className="m-0 text-muted">{busca ? "Nenhum acesso com esse e-mail ou transação." : "Nenhuma venda ou liberação ainda."}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {lista.data.map((c) => (
            <LinhaAcesso key={c.id} c={c} />
          ))}
        </ul>
      )}
    </section>
  );
}

function LinhaAcesso({ c }: { c: Concessao }) {
  const aviso = useAvisos();
  const [acao, setAcao] = useState<"transferir" | "encerrar" | null>(null);
  const [valor, setValor] = useState("");
  const transferir = useAcao(
    (sb, email: string) => chamar<Concessao>(sb, "academy_adm_transferir_concessao", { p_id: c.id, p_email: email }),
    () => {
      aviso({ titulo: "Acesso transferido", tipo: "ok" });
      setAcao(null);
    },
  );
  const encerrar = useAcao(
    (sb, motivo: string) => chamar<Concessao>(sb, "academy_adm_revogar_concessao", { p_id: c.id, p_motivo: motivo }),
    () => {
      aviso({ titulo: "Acesso encerrado", tipo: "ok" });
      setAcao(null);
    },
  );
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (acao === "transferir") transferir.mutate(valor);
    else encerrar.mutate(valor);
  };

  return (
    <li aria-label={`${c.alvo}, ${c.email}`} className="border-b border-line py-3.5 last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
        <div className="min-w-0 flex-1 basis-64">
          <p className="m-0 truncate font-medium">{c.alvo}</p>
          <p className="m-0 truncate text-[13px] text-muted">
            {c.email}
            {c.nome && ` (${c.nome})`}
            {!c.conta && ", ainda sem conta no portal"}
          </p>
        </div>
        <div className="min-w-0 basis-56 text-[13px] text-muted">
          <p className="m-0">
            {ORIGEM[c.origem]}
            {c.transacao && `, ${c.transacao}`}
          </p>
          <p className="m-0">
            Desde {dataCurta(c.inicio)}, {validade(c.fim, dataCurta).toLowerCase()}
          </p>
        </div>
        <p className={cn("m-0 w-24 text-[13px] font-medium", SITUACAO_COR[c.situacao])}>{SITUACAO_ROTULO[c.situacao]}</p>
        {c.situacao === "ativa" && acao === null && (
          <div className="flex gap-2">
            <Botao variante="contorno" className="h-9 px-3 text-sm" onClick={() => (setAcao("transferir"), setValor(""))}>
              Transferir
            </Botao>
            <Botao variante="contorno" className="h-9 px-3 text-sm" onClick={() => (setAcao("encerrar"), setValor(""))}>
              Encerrar
            </Botao>
          </div>
        )}
      </div>
      {c.motivo && <p className="m-0 mt-1 text-[13px] text-dim">Motivo do encerramento: {c.motivo}</p>}
      {acao && (
        <form onSubmit={enviar} className="mt-3 flex max-w-2xl flex-col gap-3 rounded-[10px] border border-line p-4">
          <Campo
            rotulo={acao === "transferir" ? "Novo e-mail" : "Motivo do encerramento"}
            ajuda={
              acao === "transferir"
                ? "Use quando a compra foi feita com um e-mail diferente do da conta no portal."
                : "Para reembolso, use a Hotmart: o aviso dela encerra o acesso sozinho."
            }
            type={acao === "transferir" ? "email" : "text"}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            required
            autoFocus
          />
          <ErroFormulario erro={transferir.error ?? encerrar.error} />
          <div className="flex gap-3">
            <Botao type="submit" className="h-10 px-4" disabled={transferir.isPending || encerrar.isPending}>
              {acao === "transferir" ? "Transferir acesso" : "Encerrar acesso"}
            </Botao>
            <Botao variante="contorno" className="h-10 px-4" onClick={() => setAcao(null)}>
              Cancelar
            </Botao>
          </div>
        </form>
      )}
    </li>
  );
}

const VALIDADES = [
  { valor: "", rotulo: "Vitalício" },
  { valor: "30", rotulo: "30 dias" },
  { valor: "90", rotulo: "90 dias" },
  { valor: "365", rotulo: "12 meses" },
];

function FormLiberar({ fechar }: { fechar: () => void }) {
  const aviso = useAvisos();
  const cursos = useCursosAdm();
  const trilhas = useTrilhasAdm();
  const [f, setF] = useState({ email: "", nome: "", escopo: "curso" as Escopo, curso: "", trilha: "", dias: "", motivo: "" });
  const liberar = useAcao(
    (sb, dados: Record<string, unknown>) => chamar<Concessao>(sb, "academy_adm_conceder", { p_dados: dados }),
    () => {
      aviso({ titulo: "Acesso liberado", tipo: "ok" });
      fechar();
    },
  );
  const pagos = (cursos.data ?? []).filter((c) => !c.gratuito);
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    liberar.mutate({
      email: f.email,
      nome: f.nome,
      escopo: f.escopo,
      curso: f.escopo === "curso" ? f.curso : null,
      trilha: f.escopo === "trilha" ? f.trilha : null,
      dias: f.dias ? Number(f.dias) : null,
      motivo: f.motivo,
    });
  };

  return (
    <form onSubmit={enviar} aria-label="Liberar acesso" className="mb-6 flex max-w-2xl flex-col gap-5 rounded-2xl border border-line bg-panel p-5">
      <p className="m-0 text-sm text-muted">
        Para cortesia, parceria ou conferência. Venda normal não passa por aqui: a Hotmart libera sozinha.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo rotulo="E-mail" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
        <Campo rotulo="Nome (opcional)" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} limite={80} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Selecao rotulo="O acesso cobre" value={f.escopo} onChange={(e) => setF({ ...f, escopo: e.target.value as Escopo })}>
          <option value="curso">Um curso</option>
          <option value="trilha">Uma trilha</option>
          <option value="plataforma">A plataforma toda</option>
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
      <div className="grid gap-5 sm:grid-cols-2">
        <Selecao rotulo="Validade" value={f.dias} onChange={(e) => setF({ ...f, dias: e.target.value })}>
          {VALIDADES.map((v) => (
            <option key={v.valor} value={v.valor}>
              {v.rotulo}
            </option>
          ))}
        </Selecao>
        <Campo rotulo="Motivo" value={f.motivo} onChange={(e) => setF({ ...f, motivo: e.target.value })} limite={200} placeholder="Cortesia para parceiro" />
      </div>
      <ErroFormulario erro={liberar.error} />
      <div className="flex gap-3">
        <Botao type="submit" className="h-11 px-5" disabled={liberar.isPending}>
          {liberar.isPending ? "Liberando…" : "Liberar acesso"}
        </Botao>
        <Botao variante="contorno" className="h-11 px-5" onClick={fechar}>
          Cancelar
        </Botao>
      </div>
    </form>
  );
}

// Produtos -----------------------------------------------------------------------

function ProdutosHotmart() {
  const produtos = useProdutos();
  const [editando, setEditando] = useState<ProdutoHotmart | "novo" | null>(null);
  if (produtos.isError) return <FalhaCarregamento tentar={() => void produtos.refetch()} />;
  const d = produtos.data;

  return (
    <section aria-labelledby="h-produtos">
      <div className="mb-2 flex flex-wrap items-center gap-4">
        <h2 id="h-produtos" className="m-0 font-display text-xl font-semibold">
          Produtos da Hotmart
        </h2>
        {editando === null && (
          <Botao variante="contorno" className="ml-auto h-10 px-4" onClick={() => setEditando("novo")}>
            <Plus className="size-4" aria-hidden="true" /> Cadastrar produto
          </Botao>
        )}
      </div>
      <p className="m-0 mb-5 max-w-2xl text-sm text-muted">
        O código do produto diz à Academy o que liberar quando chega uma venda. Curso individual é cadastrado na aba Vitrine do curso; trilha
        completa e acesso à plataforma toda, aqui.
      </p>
      {editando !== null && (
        <FormProduto key={editando === "novo" ? "novo" : editando.hotmart_produto_id} produto={editando === "novo" ? null : editando} fechar={() => setEditando(null)} />
      )}
      {!d ? (
        <Esqueleto className="h-24 w-full" />
      ) : (
        <>
          {d.produtos.length + d.cursos.length === 0 ? (
            <p className="m-0 text-muted">Nenhum produto cadastrado ainda.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {d.produtos.map((p) => (
                <li key={p.hotmart_produto_id} className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-line py-3 last:border-b-0">
                  <div className="min-w-0 flex-1 basis-64">
                    <p className="m-0 font-medium">
                      {p.nome}
                      {!p.ativo && <span className="ml-2 text-[13px] font-normal text-dim">inativo</span>}
                      <span className={cn("ml-3 text-[13px] font-normal", p.situacao === "a_venda" ? "text-ok" : "text-dim")}>
                        {p.situacao === "a_venda" && p.preco_centavos != null ? `À venda, ${formatarPreco(p.preco_centavos)}` : "Fora das vitrines"}
                      </span>
                    </p>
                    <p className="m-0 text-[13px] text-muted">
                      Produto {p.hotmart_produto_id}, {p.escopo === "trilha" ? `trilha ${p.trilha_titulo ?? p.trilha}` : "plataforma toda"},{" "}
                      {p.duracao_dias ? `${p.duracao_dias} dias` : "vitalício"}
                    </p>
                  </div>
                  <p className="m-0 text-[13px] text-muted">{p.vendas === 1 ? "1 acesso ativo" : `${p.vendas} acessos ativos`}</p>
                  <Botao variante="contorno" className="h-9 px-3 text-sm" onClick={() => setEditando(p)}>
                    Editar
                  </Botao>
                </li>
              ))}
              {d.cursos.map((c) => (
                <li key={c.hotmart_produto_id} className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-line py-3 last:border-b-0">
                  <div className="min-w-0 flex-1 basis-64">
                    <p className="m-0 font-medium">{c.titulo}</p>
                    <p className="m-0 text-[13px] text-muted">Produto {c.hotmart_produto_id}, curso individual, vitalício</p>
                  </div>
                  <p className="m-0 text-[13px] text-muted">{c.vendas === 1 ? "1 acesso ativo" : `${c.vendas} acessos ativos`}</p>
                  <Link to={`/instrutor/cursos/${c.curso}?aba=vitrine`} className="text-sm text-ink underline underline-offset-2">
                    Abrir vitrine
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <h3 className="m-0 mt-10 mb-3 font-display text-lg font-semibold">Últimos avisos da Hotmart</h3>
          {d.eventos.length === 0 ? (
            <p className="m-0 text-sm text-muted">Nenhum aviso recebido ainda.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0 text-sm">
              {d.eventos.map((e, i) => (
                <li key={i} className="flex flex-wrap gap-x-6 border-b border-line py-2 last:border-b-0">
                  <span className="w-28 text-muted">{dataCurta(e.recebido_em)}</span>
                  <span className="w-56">{e.evento}</span>
                  <span className="w-44 text-muted">{RESULTADO_EVENTO[e.resultado] ?? e.resultado}</span>
                  <span className="text-dim">
                    Produto {e.produto}, {e.transacao}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function FormProduto({ produto, fechar }: { produto: ProdutoHotmart | null; fechar: () => void }) {
  const aviso = useAvisos();
  const trilhas = useTrilhasAdm();
  const [f, setF] = useState({
    hotmart_produto_id: produto ? String(produto.hotmart_produto_id) : "",
    nome: produto?.nome ?? "",
    escopo: produto?.escopo ?? ("plataforma" as "trilha" | "plataforma"),
    trilha: produto?.trilha ?? "",
    ativo: produto?.ativo ?? true,
    situacao: produto?.situacao ?? ("oculto" as "oculto" | "a_venda"),
    checkout: produto?.checkout_url ?? "",
    preco: escreverPreco(produto?.preco_centavos ?? null),
    obs: produto?.preco_observacao ?? "",
    conferir: false,
  });
  const [erroLocal, setErroLocal] = useState<string | null>(null);
  const salvar = useAcao(
    (sb, dados: Record<string, unknown>) => chamar(sb, "academy_adm_salvar_produto", { p_dados: dados }),
    () => {
      aviso({ titulo: "Produto salvo", tipo: "ok" });
      fechar();
    },
  );
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    setErroLocal(null);
    const centavos = f.preco.trim() ? lerPreco(f.preco) : null;
    if (f.preco.trim() && centavos == null) return setErroLocal("Escreva o preço como 997,00.");
    if (f.checkout.trim() && !checkoutValido(f.checkout)) return setErroLocal("Cole o link de checkout da Hotmart, que começa com https://pay.hotmart.com/.");
    salvar.mutate({
      situacao: f.situacao,
      checkout_url: f.checkout.trim(),
      preco_centavos: centavos,
      preco_observacao: f.obs.trim(),
      conferir_preco: f.conferir,
      hotmart_produto_id: f.hotmart_produto_id.trim(),
      nome: f.nome,
      escopo: f.escopo,
      trilha: f.escopo === "trilha" ? f.trilha : null,
      // Decisão do Everton: trilha é vitalícia; plataforma vale 12 meses.
      duracao_dias: f.escopo === "plataforma" ? 365 : null,
      ativo: f.ativo,
    });
  };

  return (
    <form onSubmit={enviar} aria-label={produto ? `Editar ${produto.nome}` : "Cadastrar produto"} className="mb-6 flex max-w-2xl flex-col gap-5 rounded-2xl border border-line bg-panel p-5">
      <div className="grid gap-5 sm:grid-cols-[minmax(0,12rem)_1fr]">
        <Campo
          rotulo="Código do produto"
          value={f.hotmart_produto_id}
          onChange={(e) => setF({ ...f, hotmart_produto_id: e.target.value })}
          inputMode="numeric"
          disabled={Boolean(produto)}
          required
        />
        <Campo rotulo="Nome" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} limite={120} required placeholder="Academy completa por 12 meses" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Selecao rotulo="O que libera" value={f.escopo} onChange={(e) => setF({ ...f, escopo: e.target.value as "trilha" | "plataforma" })}>
          <option value="plataforma">A plataforma toda, por 12 meses</option>
          <option value="trilha">Uma trilha completa, vitalício</option>
        </Selecao>
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
      {f.escopo === "trilha" && (
        <p className="m-0 text-[13px] text-muted">Quem compra a trilha leva os cursos que ela tem no dia da compra. Curso que entrar depois não entra.</p>
      )}
      {produto && <Marcador rotulo="Produto ativo" ajuda="Inativo, a venda desse código não libera nada." checked={f.ativo} onChange={(e) => setF({ ...f, ativo: e.target.checked })} />}
      <fieldset className="m-0 flex flex-col gap-5 border-0 p-0">
        <legend className="mb-1 p-0 text-sm font-medium text-ink">Vitrine</legend>
        <Selecao
          rotulo="Onde aparece"
          value={f.situacao}
          onChange={(e) => setF({ ...f, situacao: e.target.value as "oculto" | "a_venda" })}
          ajuda="À venda, aparece no site e no catálogo do portal com o preço e o botão Comprar."
        >
          <option value="oculto">Fora das vitrines</option>
          <option value="a_venda">À venda</option>
        </Selecao>
        <Campo rotulo="Link de checkout" value={f.checkout} onChange={(e) => setF({ ...f, checkout: e.target.value })} placeholder="https://pay.hotmart.com/…" inputMode="url" spellCheck={false} />
        <div className="grid gap-5 sm:grid-cols-[minmax(0,12rem)_1fr]">
          <Campo rotulo="Preço (R$)" value={f.preco} onChange={(e) => setF({ ...f, preco: e.target.value })} inputMode="decimal" placeholder="997,00" />
          <Campo rotulo="Observação" value={f.obs} onChange={(e) => setF({ ...f, obs: e.target.value })} limite={80} placeholder="ou em até 12x no cartão" />
        </div>
        {produto?.preco_centavos != null && (
          <Marcador rotulo="Conferi agora que o preço na Hotmart é este" checked={f.conferir} onChange={(e) => setF({ ...f, conferir: e.target.checked })} />
        )}
      </fieldset>
      <ErroFormulario erro={erroLocal ? new Error(erroLocal) : salvar.error} />
      <div className="flex gap-3">
        <Botao type="submit" className="h-11 px-5" disabled={salvar.isPending}>
          {salvar.isPending ? "Salvando…" : "Salvar produto"}
        </Botao>
        <Botao variante="contorno" className="h-11 px-5" onClick={fechar}>
          Cancelar
        </Botao>
      </div>
    </form>
  );
}
