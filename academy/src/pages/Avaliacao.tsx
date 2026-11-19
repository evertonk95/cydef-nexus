import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Award, Check, CircleCheck, ClipboardCheck, Hourglass, ListChecks, Lock } from "lucide-react";
import { useCurso, useSituacao } from "@/lib/consultas";
import { usePortal } from "@/lib/portal";
import {
  caminhoCertificado,
  caminhoQuestoes,
  enviarFinal,
  ErroAvaliacao,
  iniciarFinal,
  moduloPendente,
  quandoLibera,
  type ProvaFinal,
  type Respostas,
  type ResultadoFinal,
  type Situacao,
} from "@/lib/avaliacao";
import { aulaParaContinuar, caminhoAula, rotuloModuloCurto } from "@/lib/aula";
import type { CursoDetalhe } from "@/lib/cursos";
import { Questao } from "@/components/avaliacao/Questao";
import { Trilha } from "@/components/avaliacao/Trilha";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { cn } from "@/lib/cn";
import { FalhaCarregamento, NaoEncontrado } from "./Estados";
import { BarraEnvio } from "@/components/avaliacao/BarraEnvio";

const link =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-semibold transition-[transform,background-color,border-color] duration-200 ease-[var(--ease-out-soft)] hover:-translate-y-0.5";

/** Respostas da prova em andamento ficam no navegador: fechar a aba não perde nada. */
const chaveRascunho = (prova: string) => `cydef-academy:prova:${prova}`;

function lerRascunho(prova: string): Respostas {
  try {
    const v = JSON.parse(window.localStorage.getItem(chaveRascunho(prova)) ?? "{}") as unknown;
    if (typeof v !== "object" || v === null || Array.isArray(v)) return {};
    return Object.fromEntries(Object.entries(v).filter(([, x]) => typeof x === "string")) as Respostas;
  } catch {
    return {};
  }
}

function gravarRascunho(prova: string, r: Respostas) {
  try {
    window.localStorage.setItem(chaveRascunho(prova), JSON.stringify(r));
  } catch {
    /* navegador sem armazenamento: segue só na memória */
  }
}

function apagarRascunho(prova: string) {
  try {
    window.localStorage.removeItem(chaveRascunho(prova));
  } catch {
    /* idem */
  }
}

export default function Avaliacao() {
  const { slug = "" } = useParams();
  const { sb } = usePortal();
  const qc = useQueryClient();
  const reduzir = useReducedMotion();
  const curso = useCurso(slug);
  const situacao = useSituacao(slug);
  const [prova, setProva] = useState<ProvaFinal | null>(null);
  const [respostas, setRespostas] = useState<Respostas>({});
  const [confirmar, setConfirmar] = useState(false);
  const [resultado, setResultado] = useState<ResultadoFinal | null>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  const atualizar = () => qc.invalidateQueries({ queryKey: ["situacao", slug] });

  const inicio = useMutation({
    mutationFn: () => iniciarFinal(sb, slug),
    onSuccess: (p) => {
      setProva(p);
      setRespostas(lerRascunho(p.prova_id));
      setConfirmar(false);
      window.scrollTo({ top: 0, behavior: reduzir ? "auto" : "smooth" });
    },
    onError: () => void atualizar(),
  });

  const envio = useMutation({
    mutationFn: () => enviarFinal(sb, prova!, respostas),
    onSuccess: (r) => {
      apagarRascunho(prova!.prova_id);
      setResultado(r);
      setProva(null);
      void atualizar();
    },
    onError: (e) => {
      if (e instanceof ErroAvaliacao && (e.codigo === "prova_ja_enviada" || e.codigo === "prova_indisponivel")) {
        setProva(null);
        void atualizar();
      }
    },
  });

  useEffect(() => {
    if (resultado) tituloRef.current?.focus();
  }, [resultado]);

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

  const trilha = (
    <Trilha
      itens={[
        { rotulo: "Meus cursos", para: "/cursos" },
        { rotulo: c.titulo, para: `/cursos/${c.slug}` },
        { rotulo: "Avaliação final" },
      ]}
    />
  );

  // Prova em andamento.
  if (prova) {
    const total = prova.questoes.length;
    const respondidas = prova.questoes.filter((x) => respostas[x.id]).length;
    // "" = mensagem padrão da barra de envio.
    const erro = envio.error ? "" : null;
    return (
      <>
        {trilha}
        <div className="mx-auto max-w-3xl">
          <header className="mb-6">
            <p className="m-0 mb-2 font-mono text-[12px] tracking-[0.14em] text-orange uppercase">Avaliação final · em andamento</p>
            <h1 className="m-0 mb-3 font-display text-[clamp(26px,2.8vw,36px)] leading-tight font-bold tracking-tight">{c.titulo}</h1>
            <p className="m-0 max-w-[68ch] leading-relaxed text-[#d6d6d6]">
              {total} questões, sem cronômetro. Suas respostas ficam guardadas neste navegador até você enviar. Para passar: {s.requisitos.nota_minima_final}%.
            </p>
          </header>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (respondidas === total) setConfirmar(true);
            }}
          >
            <ol className="m-0 flex list-none flex-col gap-4 p-0">
              {prova.questoes.map((questao, i) => (
                <li key={questao.id}>
                  <Questao
                    questao={questao}
                    indice={i + 1}
                    total={total}
                    escolhida={respostas[questao.id]}
                    escolher={(alt) =>
                      setRespostas((r) => {
                        const nova = { ...r, [questao.id]: alt };
                        gravarRascunho(prova.prova_id, nova);
                        return nova;
                      })
                    }
                    desabilitada={envio.isPending}
                  />
                </li>
              ))}
            </ol>
            <AnimatePresence initial={false}>
              {confirmar && respondidas === total && (
                <motion.section
                  role="alertdialog"
                  aria-labelledby="h-confirmar"
                  aria-describedby="d-confirmar"
                  initial={reduzir ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] } }}
                  exit={{ opacity: 0, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } }}
                  className="mt-6 rounded-2xl border border-orange/45 bg-orange/[0.07] p-5"
                >
                  <h2 id="h-confirmar" className="m-0 mb-1 font-display text-lg font-semibold">
                    Enviar a avaliação?
                  </h2>
                  <p id="d-confirmar" className="m-0 mb-4 text-[14.5px] text-muted">
                    Depois de enviar não dá para mudar as respostas. Você recebe a nota na hora.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Botao autoFocus onClick={() => envio.mutate()} disabled={envio.isPending} className="px-5 py-2.5 text-[15px]">
                      <Check className="size-4" aria-hidden="true" /> {envio.isPending ? "Enviando..." : "Enviar agora"}
                    </Botao>
                    <Botao variante="fantasma" onClick={() => setConfirmar(false)} disabled={envio.isPending} className="px-5 py-2.5 text-[15px]">
                      Revisar as respostas
                    </Botao>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
            {!confirmar && (
              <BarraEnvio respondidas={respondidas} total={total} pronto={respondidas === total} enviando={envio.isPending} erro={erro} rotulo="Enviar avaliação" />
            )}
            {confirmar && erro !== null && (
              <p role="alert" className="m-0 mt-3 text-[14px] text-warn">
                {erro || "Não deu para enviar. Confira a conexão e tente de novo; suas respostas continuam marcadas."}
              </p>
            )}
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      {trilha}
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="m-0 mb-2 font-mono text-[12px] tracking-[0.14em] text-orange uppercase">Avaliação final</p>
          <h1 ref={tituloRef} tabIndex={-1} className="m-0 font-display text-[clamp(26px,2.8vw,36px)] leading-tight font-bold tracking-tight outline-none">
            {c.titulo}
          </h1>
        </header>
        <motion.div
          key={resultado ? "resultado" : s.final.situacao}
          initial={reduzir ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] } }}
        >
          {resultado ? (
            <Resultado r={resultado} s={s} slug={c.slug} />
          ) : (
            <Estado s={s} c={c} comecar={() => inicio.mutate()} comecando={inicio.isPending} falhou={inicio.isError} />
          )}
        </motion.div>
      </div>
    </>
  );
}

function Resultado({ r, s, slug }: { r: ResultadoFinal; s: Situacao; slug: string }) {
  return (
    <section
      aria-labelledby="h-resultado"
      className={cn("rounded-2xl border p-6", r.aprovado ? "border-ok/40 bg-ok/[0.06]" : "border-orange/40 bg-orange/[0.06]")}
    >
      <p className="m-0 mb-1 font-mono text-[12px] tracking-[0.14em] text-muted uppercase">Seu resultado</p>
      <h2 id="h-resultado" className="m-0 mb-2 font-display text-2xl font-bold">
        {r.aprovado ? "Você passou na avaliação final" : "Ainda não foi desta vez"}
      </h2>
      <p className="m-0 mb-5 text-[15.5px]">
        <span className={cn("font-mono text-3xl font-semibold", r.aprovado ? "text-ok" : "text-orange-hi")}>{r.nota}%</span>{" "}
        <span className="text-muted">
          · {r.acertos} de {r.total} certas · mínimo {r.nota_minima}%
        </span>
      </p>
      {r.aprovado ? (
        <>
          <p className="m-0 mb-5 text-muted">
            {s.certificado.elegivel || s.certificado.codigo
              ? "Seu certificado está liberado. Confira seu nome e emita."
              : "Assim que os demais requisitos do curso estiverem completos, o certificado é liberado."}
          </p>
          {(s.certificado.elegivel || s.certificado.codigo) && (
            <Link to={caminhoCertificado(slug)} className={cn(link, "bg-orange text-orange-ink hover:bg-orange-hi")}>
              <Award className="size-4" aria-hidden="true" /> Ir para o certificado
            </Link>
          )}
        </>
      ) : (
        <p className="m-0 text-muted">
          {r.proxima_em ? `Você pode tentar de novo ${quandoLibera(r.proxima_em)}. ` : ""}
          As questões da avaliação final não são mostradas depois do envio, para o banco continuar valendo. Revise as aulas e as questões dos módulos enquanto isso.
        </p>
      )}
    </section>
  );
}

function Estado({
  s,
  c,
  comecar,
  comecando,
  falhou,
}: {
  s: Situacao;
  c: CursoDetalhe;
  comecar: () => void;
  comecando: boolean;
  falhou: boolean;
}) {
  const r = s.requisitos;
  const f = s.final;

  if (f.situacao === "aprovado") {
    return (
      <Cartao interativo={false}>
        <CircleCheck className="mb-3 size-9 text-ok" aria-hidden="true" />
        <h2 className="m-0 mb-2 font-display text-2xl font-semibold">Você já passou na avaliação final</h2>
        <p className="m-0 mb-5 text-muted">{f.melhor_nota !== null ? `Sua nota: ${f.melhor_nota}%.` : ""}</p>
        {(s.certificado.elegivel || s.certificado.codigo) && (
          <Link to={caminhoCertificado(c.slug)} className={cn(link, "bg-orange text-orange-ink hover:bg-orange-hi")}>
            <Award className="size-4" aria-hidden="true" /> {s.certificado.codigo ? "Ver o certificado" : "Emitir o certificado"}
          </Link>
        )}
      </Cartao>
    );
  }

  if (f.situacao === "sem_banco" || f.situacao === "sem_requisitos") {
    return (
      <Cartao interativo={false}>
        <ClipboardCheck className="mb-3 size-9 text-orange" aria-hidden="true" />
        <h2 className="m-0 mb-2 font-display text-2xl font-semibold">A avaliação final está sendo preparada</h2>
        <p className="m-0 text-muted">Você já cumpriu o que precisa para fazê-la. Assim que as questões estiverem prontas, ela aparece aqui.</p>
      </Cartao>
    );
  }

  if (f.situacao === "requisitos_pendentes") {
    const pendente = moduloPendente(s);
    const aulasOk = !r.exige_todas_aulas || (s.aulas.total > 0 && s.aulas.concluidas === s.aulas.total);
    const comQuestoes = s.modulos.filter((m) => m.tem_questoes);
    const aprovados = comQuestoes.filter((m) => m.aprovado).length;
    const seguir = aulaParaContinuar(c);
    return (
      <Cartao interativo={false}>
        <Lock className="mb-3 size-9 text-orange" aria-hidden="true" />
        <h2 className="m-0 mb-2 font-display text-2xl font-semibold">Falta pouco para liberar a avaliação</h2>
        <p className="m-0 mb-5 text-muted">A avaliação final abre quando você completar:</p>
        <ul className="m-0 mb-6 flex list-none flex-col gap-3 p-0">
          {r.exige_todas_aulas && (
            <ItemRequisito ok={aulasOk} texto={`Todas as aulas (${s.aulas.concluidas} de ${s.aulas.total})`} />
          )}
          {r.exige_modulos && comQuestoes.length > 0 && (
            <ItemRequisito ok={aprovados === comQuestoes.length} texto={`As questões de cada módulo (${aprovados} de ${comQuestoes.length})`} />
          )}
        </ul>
        <div className="flex flex-wrap gap-3">
          {!aulasOk && seguir && (
            <Link to={caminhoAula(c.slug, seguir.numero)} className={cn(link, "border-[1.5px] border-orange bg-orange/5 text-orange-hi hover:bg-orange/15")}>
              Continuar as aulas <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
          {pendente && (
            <Link to={caminhoQuestoes(c.slug, pendente.ordem)} className={cn(link, "border border-line-hi hover:border-orange")}>
              <ListChecks className="size-4" aria-hidden="true" /> Questões do {rotuloModuloCurto(pendente.ordem, pendente.titulo)}
            </Link>
          )}
        </div>
      </Cartao>
    );
  }

  if (f.situacao === "sem_tentativas") {
    return (
      <Cartao interativo={false}>
        <Lock className="mb-3 size-9 text-orange" aria-hidden="true" />
        <h2 className="m-0 mb-2 font-display text-2xl font-semibold">Suas tentativas acabaram</h2>
        <p className="m-0 text-muted">
          Este curso permite {r.tentativas_final_max} tentativas na avaliação final. Para conversar sobre uma nova chance, escreva para academy@cydef.com.br.
        </p>
      </Cartao>
    );
  }

  if (f.situacao === "aguarde") {
    return (
      <Cartao interativo={false}>
        <Hourglass className="mb-3 size-9 text-orange" aria-hidden="true" />
        <h2 className="m-0 mb-2 font-display text-2xl font-semibold">Nova tentativa {f.proxima_em ? quandoLibera(f.proxima_em) : "em breve"}</h2>
        <p className="m-0 text-muted">
          {f.melhor_nota !== null ? `Sua melhor nota até agora: ${f.melhor_nota}%. ` : ""}
          Entre uma tentativa e outra há uma pausa de {r.espera_final_horas} horas. Aproveite para rever as aulas e as questões dos módulos.
        </p>
      </Cartao>
    );
  }

  // disponível (ou com prova aberta)
  return (
    <Cartao interativo={false}>
      <ClipboardCheck className="mb-3 size-9 text-orange" aria-hidden="true" />
      <h2 className="m-0 mb-2 font-display text-2xl font-semibold">{f.prova_aberta ? "Você tem uma avaliação em andamento" : "Sua avaliação final está liberada"}</h2>
      <ul className="m-0 mb-6 flex list-none flex-col gap-2 p-0 text-[15px] text-[#d6d6d6]">
        <li>· {r.questoes_final} questões de múltipla escolha sorteadas de um banco</li>
        <li>· Sem cronômetro: dá para fechar e voltar depois</li>
        <li>· Para passar: {r.nota_minima_final}% de acerto</li>
        <li>
          ·{" "}
          {r.tentativas_final_max
            ? `${r.tentativas_final_max} tentativas no total, com ${r.espera_final_horas} horas entre uma e outra`
            : `Se não passar, nova tentativa depois de ${r.espera_final_horas} horas`}
        </li>
        {f.tentativas > 0 && <li>· Tentativas feitas: {f.tentativas}</li>}
      </ul>
      <Botao onClick={comecar} disabled={comecando} className="px-5 py-3 text-[15px]">
        {comecando ? "Abrindo..." : f.prova_aberta ? "Continuar a avaliação" : "Começar a avaliação"} <ArrowRight className="size-4" aria-hidden="true" />
      </Botao>
      {falhou && (
        <p role="alert" className="m-0 mt-3 text-[14px] text-warn">
          Não deu para abrir a avaliação. Confira a conexão e tente de novo.
        </p>
      )}
    </Cartao>
  );
}

function ItemRequisito({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <li className="flex items-center gap-3 text-[15px]">
      <span className={cn("grid size-[22px] flex-none place-items-center rounded-full border-[1.5px]", ok ? "border-ok bg-ok text-[#052e13]" : "border-line-hi")}>
        {ok && <Check className="size-3" strokeWidth={3.5} aria-hidden="true" />}
      </span>
      <span className={ok ? "text-muted" : "text-ink"}>
        {texto}
        <span className="sr-only">{ok ? ", completo" : ", pendente"}</span>
      </span>
    </li>
  );
}

function Carregando() {
  return (
    <div aria-busy="true" aria-label="Carregando a avaliação" className="mx-auto flex max-w-3xl flex-col gap-5">
      <Esqueleto className="h-5 w-1/2" />
      <Esqueleto className="h-10 w-2/3" />
      <Esqueleto className="h-56 w-full rounded-2xl" />
    </div>
  );
}
