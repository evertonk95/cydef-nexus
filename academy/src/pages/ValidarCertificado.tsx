import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, SearchX } from "lucide-react";
import { usePortal } from "@/lib/portal";
import { dataPorExtenso, normalizarCodigo, validarCertificado } from "@/lib/avaliacao";
import { Botao } from "@/components/ui/Botao";
import { Esqueleto } from "@/components/ui/Esqueleto";

/**
 * Validação pública do certificado: academy.cydef.com.br/certificado/CODIGO.
 * Sem login. Mostra só o que o Aviso de Privacidade (v2026.3, item 4) prevê:
 * nome, curso, carga horária e data. Código inexistente e validação
 * desativada pelo aluno recebem a mesma resposta.
 */
export default function ValidarCertificado() {
  const { codigo: bruto = "" } = useParams();
  const codigo = bruto ? normalizarCodigo(bruto) : null;

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center px-5 sm:px-8">
          <Marca />
        </div>
      </header>
      <main id="conteudo" className="mx-auto w-full max-w-2xl flex-1 px-5 pt-12 pb-24 sm:px-8">
        <h1 className="m-0 mb-2 font-display text-[clamp(28px,3vw,36px)] leading-tight font-semibold tracking-tight">Validar certificado</h1>
        <p className="m-0 mb-8 leading-relaxed text-muted">Confira se um certificado da CyDef Academy é autêntico pelo código impresso nele.</p>
        {bruto && !codigo ? <NaoEncontrado codigo={bruto} formatoInvalido /> : codigo ? <Resultado codigo={codigo} /> : null}
        <Busca inicial={codigo ?? ""} />
      </main>
    </div>
  );
}

function Marca() {
  const { config } = usePortal();
  return (
    <a href={`${config.siteUrl}/academy`} className="flex items-center gap-2.5 whitespace-nowrap font-display text-lg font-semibold tracking-tight">
      <img src="/cydef-icon.webp" alt="" width={30} height={30} className="size-[30px]" />
      <span>
        CyDef <span className="text-orange">Academy</span>
      </span>
    </a>
  );
}

function Resultado({ codigo }: { codigo: string }) {
  const { sb } = usePortal();
  const r = useQuery({ queryKey: ["validacao", codigo], queryFn: () => validarCertificado(sb, codigo), retry: false, staleTime: 60_000 });

  if (r.isPending)
    return (
      <div aria-busy="true" aria-label="Conferindo o certificado" className="painel-card mb-10 flex flex-col gap-4 p-7">
        <Esqueleto className="h-5 w-40" />
        <Esqueleto className="h-9 w-3/4" />
        <Esqueleto className="h-5 w-full" />
      </div>
    );
  if (r.isError)
    return (
      <p role="alert" className="painel-card m-0 mb-10 p-6 text-ink">
        Não foi possível conferir agora. Confira a conexão e tente de novo.
      </p>
    );
  if (!r.data) return <NaoEncontrado codigo={codigo} />;

  const c = r.data;
  return (
    <section aria-labelledby="h-valido" className="mb-10 rounded-2xl border border-ok/30 bg-panel p-7">
      <p id="h-valido" className="m-0 mb-4 inline-flex items-center gap-2 font-medium text-ok">
        <BadgeCheck className="size-5" aria-hidden="true" /> Certificado válido
      </p>
      <p className="m-0 font-display text-[clamp(24px,3.4vw,32px)] leading-tight font-semibold break-words">{c.nome}</p>
      <p className="m-0 mt-2 text-[15.5px] leading-relaxed text-[#d6d6d6]">
        concluiu o curso <strong className="text-ink">{c.curso}</strong> na CyDef Academy
        {c.carga_horaria_h > 0 ? `, com carga horária de ${String(c.carga_horaria_h).replace(".", ",")} ${c.carga_horaria_h === 1 ? "hora" : "horas"},` : ""} em{" "}
        {dataPorExtenso(c.concluido_em)}.
      </p>
      <dl className="m-0 mt-6 grid gap-x-8 gap-y-3 border-t border-line pt-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Código</dt>
          <dd className="m-0 tracking-wider text-ink">{c.codigo}</dd>
        </div>
        <div>
          <dt className="text-muted">Emitido por</dt>
          <dd className="m-0 text-ink">CyDef Academy</dd>
        </div>
      </dl>
      <p className="m-0 mt-5 text-[13px] leading-relaxed text-muted">
        Este é o registro da CyDef Academy. Confira se o nome e o curso são os mesmos do certificado que você recebeu.
      </p>
    </section>
  );
}

function NaoEncontrado({ codigo, formatoInvalido }: { codigo: string; formatoInvalido?: boolean }) {
  return (
    <section role="status" aria-labelledby="h-nao" className="painel-card mb-10 p-7">
      <SearchX className="mb-3 size-8 text-muted" aria-hidden="true" />
      <h2 id="h-nao" className="m-0 mb-2 font-display text-xl font-semibold">
        Não encontramos este certificado
      </h2>
      <p className="m-0 leading-relaxed text-muted">
        {formatoInvalido ? (
          <>
            "{codigo}" não está no formato dos códigos da CyDef Academy, que é CYD seguido de 16 letras e números, como CYD-7F3A-29C1-B84E-0D56.
          </>
        ) : (
          <>Confira se o código foi digitado igual ao do certificado. Se estiver certo, o certificado não existe ou o titular desativou a validação pública.</>
        )}
      </p>
    </section>
  );
}

function Busca({ inicial }: { inicial: string }) {
  const navegar = useNavigate();
  const [valor, setValor] = useState(inicial);
  const [erro, setErro] = useState(false);
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const c = normalizarCodigo(valor);
    if (!c) return setErro(true);
    setErro(false);
    navegar(`/certificado/${c}`);
  };
  return (
    <form onSubmit={enviar} className="flex flex-col gap-2">
      <label htmlFor="codigo" className="text-sm font-medium">
        {inicial ? "Conferir outro código" : "Código de validação"}
      </label>
      <div className="flex flex-wrap gap-3">
        <input
          id="codigo"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="CYD-0000-0000-0000-0000"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={erro || undefined}
          aria-describedby={erro ? "codigo-erro" : undefined}
          className="h-12 min-w-0 flex-1 basis-64 rounded-[10px] border border-line-hi bg-panel px-4 tracking-wider text-ink uppercase placeholder:text-dim placeholder:normal-case focus:border-orange-hi focus:outline-none"
        />
        <Botao type="submit" className="h-12 px-6">
          Validar
        </Botao>
      </div>
      {erro && (
        <p id="codigo-erro" className="m-0 text-sm text-warn">
          O código tem CYD e mais 16 letras e números, como CYD-7F3A-29C1-B84E-0D56.
        </p>
      )}
    </form>
  );
}
