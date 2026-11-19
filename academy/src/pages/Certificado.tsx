import { useEffect, useId, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Award, BadgeCheck, Copy, Lock } from "lucide-react";
import { useCurso, usePainel, useSituacao } from "@/lib/consultas";
import { usePortal } from "@/lib/portal";
import {
  caminhoAvaliacao,
  dataPorExtenso,
  emitirCertificado,
  ErroAvaliacao,
  nomeValido,
  normalizarNome,
  type Certificado as TCertificado,
} from "@/lib/avaliacao";
import { Trilha } from "@/components/avaliacao/Trilha";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { useAvisos } from "@/components/ui/avisos-ctx";
import { cn } from "@/lib/cn";
import { FalhaCarregamento, NaoEncontrado } from "./Estados";

const link =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-semibold transition-[transform,background-color,border-color] duration-200 ease-[var(--ease-out-soft)] hover:-translate-y-0.5";

export default function Certificado() {
  const { slug = "" } = useParams();
  const { sb } = usePortal();
  const qc = useQueryClient();
  const reduzir = useReducedMotion();
  const curso = useCurso(slug);
  const situacao = useSituacao(slug);
  const painel = usePainel();
  const [emitido, setEmitido] = useState<TCertificado | null>(null);

  const emissao = useMutation({
    mutationFn: (nome: string) => emitirCertificado(sb, slug, nome),
    onSuccess: (cert) => {
      setEmitido(cert);
      void qc.invalidateQueries({ queryKey: ["situacao", slug] });
    },
    onError: (e) => {
      if (e instanceof ErroAvaliacao && e.codigo === "nao_elegivel") void qc.invalidateQueries({ queryKey: ["situacao", slug] });
    },
  });

  if (curso.isError) return <FalhaCarregamento tentar={() => void curso.refetch()} />;
  if (curso.isSuccess && !curso.data) return <NaoEncontrado />;
  if (situacao.isError) {
    const codigo = situacao.error instanceof ErroAvaliacao ? situacao.error.codigo : "falha";
    if (codigo === "sem_matricula" || codigo === "curso_indisponivel") return <NaoEncontrado />;
    return <FalhaCarregamento tentar={() => void situacao.refetch()} />;
  }
  const c = curso.data;
  const s = situacao.data;
  if (!c || !s) return <Carregando />;

  const cert: TCertificado | null =
    emitido ??
    (s.certificado.codigo && s.certificado.nome && s.certificado.concluido_em
      ? {
          codigo: s.certificado.codigo,
          nome: s.certificado.nome,
          curso_titulo: c.titulo,
          carga_horaria_h: s.requisitos.carga_horaria_h ?? 0,
          concluido_em: s.certificado.concluido_em,
        }
      : null);

  return (
    <>
      <Trilha
        itens={[
          { rotulo: "Meus cursos", para: "/cursos" },
          { rotulo: c.titulo, para: `/cursos/${c.slug}` },
          { rotulo: "Certificado" },
        ]}
      />
      <motion.div
        key={cert ? "emitido" : s.certificado.elegivel ? "emitir" : "bloqueado"}
        initial={reduzir ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] } }}
        className="mx-auto max-w-3xl"
      >
        {cert ? (
          <Emitido cert={cert} novo={Boolean(emitido)} />
        ) : s.certificado.elegivel ? (
          <Emitir
            curso={c.titulo}
            nomeSugerido={painel.data?.nome ?? ""}
            emitir={(nome) => emissao.mutate(nome)}
            emitindo={emissao.isPending}
            erro={emissao.error instanceof ErroAvaliacao ? emissao.error.codigo : emissao.error ? "falha" : null}
          />
        ) : (
          <Cartao interativo={false} className="text-center">
            <Lock className="mx-auto mb-4 size-9 text-orange" aria-hidden="true" />
            <h1 className="m-0 mb-2 font-display text-2xl font-semibold">O certificado ainda não está liberado</h1>
            <p className="m-0 mb-6 text-muted">Ele é liberado quando você completa todos os requisitos do curso: as aulas, as questões dos módulos e a avaliação final.</p>
            <Link to={caminhoAvaliacao(c.slug)} className={cn(link, "border border-line-hi hover:border-orange")}>
              Ver o que falta <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Cartao>
        )}
      </motion.div>
    </>
  );
}

function Emitir({
  curso,
  nomeSugerido,
  emitir,
  emitindo,
  erro,
}: {
  curso: string;
  nomeSugerido: string;
  emitir: (nome: string) => void;
  emitindo: boolean;
  erro: string | null;
}) {
  const id = useId();
  const [nome, setNome] = useState(nomeSugerido);
  const [tocado, setTocado] = useState(false);
  const [conferi, setConferi] = useState(false);
  const sugeridoAplicado = useRef(Boolean(nomeSugerido));

  // O nome do painel pode chegar depois da primeira pintura.
  useEffect(() => {
    if (!sugeridoAplicado.current && nomeSugerido) {
      sugeridoAplicado.current = true;
      setNome(nomeSugerido);
    }
  }, [nomeSugerido]);

  const limpo = normalizarNome(nome);
  const valido = nomeValido(nome);
  const mostrarErro = tocado && !valido;

  return (
    <>
      <header className="mb-6">
        <p className="m-0 mb-2 font-mono text-[12px] tracking-[0.14em] text-orange uppercase">Certificado liberado</p>
        <h1 className="m-0 mb-3 font-display text-[clamp(26px,2.8vw,36px)] leading-tight font-bold tracking-tight">Parabéns, você concluiu o curso</h1>
        <p className="m-0 max-w-[68ch] leading-relaxed text-[#d6d6d6]">
          Confira como seu nome vai aparecer no certificado. Depois de emitido, o nome não muda: escreva completo, com acentos.
        </p>
      </header>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTocado(true);
          if (valido && conferi && !emitindo) emitir(limpo);
        }}
        className="flex flex-col gap-6"
        noValidate
      >
        <div>
          <label htmlFor={`${id}-nome`} className="mb-2 block text-[14.5px] font-semibold">
            Nome no certificado
          </label>
          <input
            id={`${id}-nome`}
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setConferi(false);
            }}
            onBlur={() => setTocado(true)}
            autoComplete="name"
            maxLength={120}
            aria-invalid={mostrarErro}
            aria-describedby={`${id}-ajuda`}
            className={cn(
              "w-full rounded-xl border bg-panel px-4 py-3 text-[16px] text-ink outline-none transition-colors duration-150 focus-visible:border-orange focus-visible:ring-2 focus-visible:ring-orange/30",
              mostrarErro ? "border-bad" : "border-line-hi",
            )}
          />
          <p id={`${id}-ajuda`} className={cn("m-0 mt-2 text-[13.5px]", mostrarErro ? "text-bad" : "text-muted")}>
            {mostrarErro ? "Use só letras, espaços, ponto, hífen ou apóstrofo, com 2 a 120 caracteres." : "Como em um documento oficial."}
          </p>
        </div>

        <figure className="m-0 rounded-2xl border border-orange/30 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(249,115,22,0.10),transparent_60%),var(--color-panel)] px-6 py-8 text-center">
          <figcaption className="mb-3 font-mono text-[11.5px] tracking-[0.14em] text-muted uppercase">Prévia do nome</figcaption>
          <p className="m-0 font-display text-[clamp(24px,3.4vw,36px)] leading-tight font-semibold break-words text-ink" aria-live="polite">
            {limpo || "Seu nome"}
          </p>
          <p className="m-0 mt-3 text-[14px] text-muted">concluiu o curso {curso}</p>
        </figure>

        <label className="flex cursor-pointer items-start gap-3 text-[15px]">
          <input
            type="checkbox"
            checked={conferi}
            onChange={(e) => setConferi(e.target.checked)}
            disabled={!valido}
            className="mt-1 size-[18px] flex-none accent-[var(--color-orange)]"
          />
          <span className={valido ? "text-ink" : "text-dim"}>Conferi meu nome e ele está certo.</span>
        </label>

        <div>
          <Botao type="submit" disabled={!valido || !conferi || emitindo} className="px-5 py-3 text-[15px]">
            <Award className="size-4" aria-hidden="true" /> {emitindo ? "Emitindo..." : "Emitir certificado"}
          </Botao>
          {erro && (
            <p role="alert" className="m-0 mt-3 text-[14px] text-warn">
              {erro === "nome_invalido"
                ? "O nome não foi aceito. Use só letras, espaços, ponto, hífen ou apóstrofo."
                : erro === "nao_elegivel"
                  ? "O certificado deixou de estar liberado. Recarregue a página para ver o que falta."
                  : "Não deu para emitir agora. Confira a conexão e tente de novo."}
            </p>
          )}
        </div>
      </form>
    </>
  );
}

function Emitido({ cert, novo }: { cert: TCertificado; novo: boolean }) {
  const avisar = useAvisos();
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(cert.codigo);
      avisar({ tipo: "ok", titulo: "Código copiado" });
    } catch {
      avisar({ tipo: "info", titulo: "Não deu para copiar", texto: "Selecione o código e copie manualmente." });
    }
  };
  return (
    <>
      <header className="mb-6">
        <p className="m-0 mb-2 font-mono text-[12px] tracking-[0.14em] text-ok uppercase">{novo ? "Certificado emitido agora" : "Certificado emitido"}</p>
        <h1 className="m-0 font-display text-[clamp(26px,2.8vw,36px)] leading-tight font-bold tracking-tight">Seu certificado</h1>
      </header>
      <section aria-label="Dados do certificado" className="rounded-2xl border border-ok/30 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(74,222,128,0.08),transparent_60%),var(--color-panel)] p-6 sm:p-8">
        <BadgeCheck className="mb-4 size-10 text-ok" aria-hidden="true" />
        <p className="m-0 font-display text-[clamp(24px,3.4vw,34px)] leading-tight font-semibold break-words">{cert.nome}</p>
        <p className="m-0 mt-2 text-[15.5px] text-[#d6d6d6]">
          concluiu o curso <strong className="text-ink">{cert.curso_titulo}</strong>
          {cert.carga_horaria_h > 0 ? `, com carga horária de ${cert.carga_horaria_h} horas,` : ""} em {dataPorExtenso(cert.concluido_em)}.
        </p>
        <dl className="m-0 mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-5">
          <dt className="font-mono text-[11.5px] tracking-[0.14em] text-muted uppercase">Código de validação</dt>
          <dd className="m-0 font-mono text-[15px] tracking-wider text-ink select-all">{cert.codigo}</dd>
          <dd className="m-0">
            <Botao variante="fantasma" onClick={() => void copiar()} className="px-3 py-1.5 text-[13.5px]">
              <Copy className="size-3.5" aria-hidden="true" /> Copiar
            </Botao>
          </dd>
        </dl>
      </section>
    </>
  );
}

function Carregando() {
  return (
    <div aria-busy="true" aria-label="Carregando o certificado" className="mx-auto flex max-w-3xl flex-col gap-5">
      <Esqueleto className="h-5 w-1/2" />
      <Esqueleto className="h-10 w-2/3" />
      <Esqueleto className="h-64 w-full rounded-2xl" />
    </div>
  );
}
