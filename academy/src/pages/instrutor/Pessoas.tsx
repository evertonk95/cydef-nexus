import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, Search } from "lucide-react";
import { useEu } from "@/lib/instrutor";
import { POR_PAGINA, PERFIS_DECLARADOS, usePessoas, type FiltroPessoas, type PessoaLista } from "@/lib/admin";
import { dataCurta } from "@/lib/formato";
import { cn } from "@/lib/cn";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { FalhaCarregamento, NaoEncontrado } from "../Estados";

/** Pessoas (fase 20): todo mundo que se cadastrou, com busca. Só admin. */
export default function PessoasAdm() {
  const eu = useEu();
  if (eu.papel !== "admin") return <NaoEncontrado />;
  return <Conteudo />;
}

const FILTROS: { valor: FiltroPessoas; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todas" },
  { valor: "contas", rotulo: "Com conta" },
  { valor: "sem_conta", rotulo: "Só pré-inscrição" },
  { valor: "equipe", rotulo: "Equipe" },
];

function Conteudo() {
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroPessoas>("todos");
  const [pagina, setPagina] = useState(0);
  // Espera a pessoa parar de digitar antes de buscar.
  useEffect(() => {
    const t = setTimeout(() => {
      setBusca(texto.trim());
      setPagina(0);
    }, 300);
    return () => clearTimeout(t);
  }, [texto]);
  const lista = usePessoas(busca, filtro, pagina);
  if (lista.isError) return <FalhaCarregamento tentar={() => void lista.refetch()} />;
  const total = lista.data?.total ?? 0;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <>
      <h1 className="m-0 mb-3 font-display text-[clamp(28px,3vw,40px)] leading-tight font-semibold tracking-tight">Pessoas</h1>
      <p className="m-0 mb-8 max-w-2xl text-muted">
        Todo mundo que se cadastrou: quem já tem conta no portal e quem só fez a pré-inscrição. Abra uma conta para ver o perfil, os cursos e mudar o papel.
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label className="relative min-w-0 flex-1 basis-72">
          <span className="sr-only">Buscar por nome ou e-mail</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-dim" aria-hidden="true" />
          <input
            type="search"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={120}
            placeholder="Buscar por nome ou e-mail"
            className="h-11 w-full rounded-[10px] border border-line-hi bg-bg pr-3.5 pl-10 text-[15px] text-ink placeholder:text-dim hover:border-muted focus:border-orange-hi focus:outline-none"
          />
        </label>
        <div role="group" aria-label="Mostrar" className="flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              type="button"
              aria-pressed={filtro === f.valor}
              onClick={() => {
                setFiltro(f.valor);
                setPagina(0);
              }}
              className={cn(
                "h-9 rounded-full border px-3.5 text-sm transition-colors duration-150",
                filtro === f.valor ? "border-ink bg-ink text-bg" : "border-line-hi text-muted hover:border-muted hover:text-ink",
              )}
            >
              {f.rotulo}
            </button>
          ))}
        </div>
      </div>

      <p className="m-0 mb-3 text-sm text-muted" aria-live="polite">
        {lista.data ? `${total.toLocaleString("pt-BR")} ${total === 1 ? "pessoa" : "pessoas"}${busca ? ` para "${busca}"` : ""}` : "Carregando…"}
      </p>

      {!lista.data ? (
        <div aria-busy="true" aria-label="Carregando as pessoas" className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Esqueleto key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : lista.data.itens.length === 0 ? (
        <p className="painel-card m-0 p-6 text-muted">Ninguém encontrado. Confira a busca ou mude o filtro.</p>
      ) : (
        <ul className={cn("m-0 list-none p-0", lista.isFetching && "opacity-70")}>
          {lista.data.itens.map((p) => (
            <Linha key={p.user_id ?? p.lead_id ?? p.email} p={p} />
          ))}
        </ul>
      )}

      {paginas > 1 && (
        <nav aria-label="Páginas" className="mt-6 flex items-center gap-4">
          <Botao variante="contorno" className="h-9 px-3 text-sm" disabled={pagina === 0} onClick={() => setPagina((v) => v - 1)}>
            Anterior
          </Botao>
          <span className="text-sm text-muted">
            Página {pagina + 1} de {paginas}
          </span>
          <Botao variante="contorno" className="h-9 px-3 text-sm" disabled={pagina + 1 >= paginas} onClick={() => setPagina((v) => v + 1)}>
            Próxima
          </Botao>
        </nav>
      )}
    </>
  );
}

function Papel({ p }: { p: PessoaLista }) {
  const texto = p.tipo === "pre_inscricao" ? "Pré-inscrição" : p.papel === "admin" ? "Admin" : p.papel === "instrutor" ? "Instrutor" : "Aluno";
  return (
    <span className={cn("rounded-full border px-2.5 py-0.5 text-[12px] whitespace-nowrap", p.papel ? "border-ink text-ink" : "border-line-hi text-muted")}>{texto}</span>
  );
}

function Linha({ p }: { p: PessoaLista }) {
  const corpo = (
    <>
      <div className="min-w-0 flex-1 basis-64">
        <p className="m-0 flex items-center gap-2 font-medium">
          <span className="truncate">{p.nome}</span>
          <Papel p={p} />
        </p>
        <p className="m-0 truncate text-[13px] text-muted">{p.email}</p>
      </div>
      <dl className="m-0 grid min-w-0 flex-[2] basis-80 grid-cols-3 gap-x-6 text-[13px]">
        <div>
          <dt className="text-dim">Cadastro</dt>
          <dd className="m-0 text-ink">{dataCurta(p.cadastro_em)}</dd>
        </div>
        <div>
          <dt className="text-dim">{p.tipo === "conta" ? "Último acesso" : "Perfil"}</dt>
          <dd className="m-0 text-ink">
            {p.tipo === "conta" ? (p.ultimo_acesso_em ? dataCurta(p.ultimo_acesso_em) : "Nunca entrou") : (PERFIS_DECLARADOS[p.perfil_declarado ?? ""] ?? "Não informado")}
          </dd>
        </div>
        <div>
          <dt className="text-dim">{p.tipo === "conta" ? "Cursos e certificados" : "Situação"}</dt>
          <dd className="m-0 text-ink">{p.tipo === "conta" ? `${p.cursos} ${p.cursos === 1 ? "curso" : "cursos"}, ${p.certificados} ${p.certificados === 1 ? "certificado" : "certificados"}` : "Ainda não entrou no portal"}</dd>
        </div>
      </dl>
    </>
  );
  // Mesma grade nas duas formas de linha: o conteúdo e uma coluna fixa para a seta,
  // assim as colunas ficam alinhadas e a seta não quebra linha no celular.
  const conteudo = <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2">{corpo}</div>;
  const grade = "grid grid-cols-[minmax(0,1fr)_1rem] items-center gap-x-4 px-2 py-4";
  return (
    <li className="border-b border-line last:border-b-0">
      {p.tipo === "conta" && p.user_id ? (
        <Link
          to={`/instrutor/pessoas/${p.user_id}`}
          className={`${grade} rounded-lg transition-colors duration-150 hover:bg-white/[0.03]`}
        >
          {conteudo}
          <ChevronRight className="size-4 text-dim" aria-hidden="true" />
        </Link>
      ) : (
        <div className={grade}>{conteudo}</div>
      )}
    </li>
  );
}
