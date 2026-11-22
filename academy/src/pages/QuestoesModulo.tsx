import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CircleCheck, Download, ListChecks, Lock, RotateCcw } from "lucide-react";
import { useCurso, useSituacao } from "@/lib/consultas";
import { usePortal } from "@/lib/portal";
import {
  acertosMinimos,
  buscarQuestoesModulo,
  caminhoAvaliacao,
  caminhoQuestoes,
  ErroAvaliacao,
  moduloPendente,
  responderModulo,
  type Respostas,
  type ResultadoModulo,
} from "@/lib/avaliacao";
import { caminhoAula, rotuloModulo, rotuloModuloCurto } from "@/lib/aula";
import { Questao } from "@/components/avaliacao/Questao";
import { Trilha } from "@/components/avaliacao/Trilha";
import { BarraEnvio } from "@/components/avaliacao/BarraEnvio";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { Esqueleto } from "@/components/ui/Esqueleto";
import { cn } from "@/lib/cn";
import { materiaisPendentes } from "@/lib/materiais";
import { useBaixarMaterial, useMateriaisCurso } from "@/lib/useMateriais";
import { FalhaCarregamento, NaoEncontrado } from "./Estados";

const link =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-semibold transition-[transform,background-color,border-color] duration-200 ease-[var(--ease-out-soft)] hover:-translate-y-0.5";

const MENSAGEM_ENVIO: Partial<Record<ErroAvaliacao["codigo"], string>> = {
  muitas_tentativas: "Foram muitas tentativas em pouco tempo. Espere alguns minutos e tente de novo.",
  modulo_bloqueado: "Este módulo ainda está bloqueado.",
  material_pendente: "Baixe o material complementar do módulo para liberar as questões.",
};

export default function QuestoesModulo() {
  const { slug = "", ordem = "" } = useParams();
  const n = Number(ordem);
  const { sb, sessao } = usePortal();
  const qc = useQueryClient();
  const reduzir = useReducedMotion();
  const curso = useCurso(slug);
  const situacao = useSituacao(slug);
  const materiais = useMateriaisCurso(curso.data);
  const baixa = useBaixarMaterial(slug);
  const [rodada, setRodada] = useState(0);
  const [respostas, setRespostas] = useState<Respostas>({});
  const [resultado, setResultado] = useState<ResultadoModulo | null>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  const modulo = situacao.data?.modulos.find((m) => m.ordem === n);
  const podeResponder = Boolean(modulo && modulo.tem_questoes && modulo.liberado);

  // Sem recarregar ao voltar para a aba: cada carga é um sorteio novo.
  const questoes = useQuery({
    queryKey: ["questoes-modulo", modulo?.id, rodada, sessao?.user.id],
    queryFn: () => buscarQuestoesModulo(sb, modulo!.id),
    enabled: podeResponder,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const envio = useMutation({
    mutationFn: () => responderModulo(sb, modulo!.id, questoes.data!.questoes, respostas),
    onSuccess: (r) => {
      setResultado(r);
      void qc.invalidateQueries({ queryKey: ["situacao", slug] });
      void qc.invalidateQueries({ queryKey: ["painel"] });
    },
  });

  useEffect(() => {
    if (!resultado) return;
    window.scrollTo({ top: 0, behavior: reduzir ? "auto" : "smooth" });
    tituloRef.current?.focus();
  }, [resultado, reduzir]);

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
  if (!Number.isInteger(n) || !modulo) return <NaoEncontrado />;

  const trilha = (
    <Trilha
      itens={[
        { rotulo: "Meus cursos", para: "/cursos" },
        { rotulo: c.titulo, para: `/cursos/${c.slug}` },
        { rotulo: `Questões do ${rotuloModuloCurto(modulo.ordem, modulo.titulo)}` },
      ]}
    />
  );
  const doCurso = c.modulos.find((m) => m.id === modulo.id);
  const primeiraAula = doCurso?.aulas[0];

  if (!modulo.tem_questoes || !modulo.liberado) {
    const pendente = moduloPendente(s);
    return (
      <>
        {trilha}
        <Cartao className="mx-auto max-w-xl text-center">
          {modulo.tem_questoes ? (
            <Lock className="mx-auto mb-4 size-9 text-muted" aria-hidden="true" />
          ) : (
            <ListChecks className="mx-auto mb-4 size-9 text-muted" aria-hidden="true" />
          )}
          <h1 className="m-0 mb-2 font-display text-2xl font-semibold">
            {modulo.tem_questoes ? "Este módulo ainda está bloqueado" : "Este módulo não tem questões"}
          </h1>
          <p className="m-0 mb-6 text-muted">
            {modulo.tem_questoes && pendente
              ? `Ele abre depois que você passar nas questões do ${rotuloModuloCurto(pendente.ordem, pendente.titulo)}.`
              : modulo.tem_questoes
                ? "Ele abre depois que você passar nas questões do módulo anterior."
                : "Pode seguir direto para as aulas."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {modulo.tem_questoes && pendente ? (
              <Link to={caminhoQuestoes(c.slug, pendente.ordem)} className={cn(link, "bg-orange text-orange-ink hover:bg-orange-hi")}>
                Ir para as questões do {rotuloModuloCurto(pendente.ordem, pendente.titulo)}
              </Link>
            ) : null}
            <Link to={`/cursos/${c.slug}`} className={cn(link, "border border-line-hi hover:border-muted")}>
              Voltar ao curso
            </Link>
          </div>
        </Cartao>
      </>
    );
  }

  if (questoes.isError) {
    const codigo = questoes.error instanceof ErroAvaliacao ? questoes.error.codigo : "falha";
    if (codigo === "material_pendente") {
      // Fase 22: o material complementar do módulo vem antes das questões.
      const pendentes = materiaisPendentes(Array.isArray(materiais.data) ? materiais.data : [], modulo.id);
      return (
        <>
          {trilha}
          <Cartao className="mx-auto max-w-xl">
            <h1 className="m-0 mb-2 font-display text-2xl font-semibold">Antes das questões, baixe o material</h1>
            <p className="m-0 mb-5 text-muted">
              As questões do {rotuloModuloCurto(modulo.ordem, modulo.titulo)} abrem assim que você baixar o material complementar do módulo. Depois de baixar, elas aparecem aqui.
            </p>
            {pendentes.length > 0 ? (
              <ul className="m-0 mb-5 flex list-none flex-col gap-2.5 p-0">
                {pendentes.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line px-4 py-3">
                    <span className="min-w-0 flex-1 basis-48 font-medium">{m.titulo}</span>
                    <Botao onClick={() => void baixa.baixar(m)} disabled={baixa.baixando === m.id} className="h-10 px-4 text-sm">
                      <Download className="size-4" aria-hidden="true" /> {baixa.baixando === m.id ? "Preparando…" : "Baixar"}
                      <span className="sr-only">{m.titulo}</span>
                    </Botao>
                  </li>
                ))}
              </ul>
            ) : (
              <Botao variante="contorno" onClick={() => void questoes.refetch()} className="mb-5">
                Já baixei, atualizar
              </Botao>
            )}
            {baixa.erro && (
              <p role="alert" className="m-0 mb-4 text-sm">
                Não foi possível baixar agora. Tente de novo em instantes.
              </p>
            )}
            <Link to={`/cursos/${c.slug}`} className={cn(link, "border border-line-hi hover:border-muted")}>
              Voltar ao curso
            </Link>
          </Cartao>
        </>
      );
    }
    if (codigo === "modulo_bloqueado" || codigo === "sem_questoes") {
      // A situação mudou entre as duas consultas (questão despublicada, por exemplo).
      return (
        <>
          {trilha}
          <Cartao className="mx-auto max-w-xl text-center">
            <h1 className="m-0 mb-2 font-display text-2xl font-semibold">As questões deste módulo mudaram</h1>
            <p className="m-0 mb-6 text-muted">Volte ao curso para ver a situação atualizada.</p>
            <Link to={`/cursos/${c.slug}`} className={cn(link, "border border-line-hi hover:border-muted")}>
              Voltar ao curso
            </Link>
          </Cartao>
        </>
      );
    }
    return <FalhaCarregamento tentar={() => void questoes.refetch()} />;
  }

  const q = questoes.data;
  const total = q?.questoes.length ?? 0;
  const notaMinima = q?.nota_minima ?? s.requisitos.nota_minima_modulo;
  const respondidas = q ? q.questoes.filter((x) => respostas[x.id]).length : 0;
  const completo = total > 0 && respondidas === total;
  const proximoModulo = c.modulos.find((m) => m.ordem > modulo.ordem && m.aulas.length > 0);
  const erroEnvio = envio.error instanceof ErroAvaliacao ? (MENSAGEM_ENVIO[envio.error.codigo] ?? null) : envio.error ? "" : null;

  const novaRodada = () => {
    setResultado(null);
    setRespostas({});
    envio.reset();
    setRodada((r) => r + 1);
    window.scrollTo({ top: 0, behavior: reduzir ? "auto" : "smooth" });
  };

  return (
    <>
      {trilha}
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="m-0 mb-2 text-sm text-muted">Questões do módulo</p>
          <h1 ref={tituloRef} tabIndex={-1} className="m-0 mb-3 font-display text-[clamp(26px,2.8vw,36px)] leading-tight font-semibold tracking-tight outline-none">
            {rotuloModulo(modulo.ordem, modulo.titulo)}
          </h1>
          {!resultado && total > 0 && (
            <ul aria-label="Como funciona" className="m-0 flex max-w-[68ch] list-disc flex-col gap-1.5 pl-5 leading-relaxed text-[#d6d6d6] marker:text-dim">
              <li>{total} questões de múltipla escolha, sorteadas a cada tentativa</li>
              <li>
                Para passar: acertar {acertosMinimos(total, notaMinima)} de {total} ({notaMinima}%)
              </li>
              <li>
                {proximoModulo ? `Passou: o ${rotuloModuloCurto(proximoModulo.ordem, proximoModulo.titulo)} é liberado` : "Passou: o módulo fica concluído"}
              </li>
              <li>Não passou: leia a explicação de cada questão e responda novamente</li>
            </ul>
          )}
          {!resultado && modulo.aprovado && (
            <p className="m-0 mt-4 inline-flex items-center gap-2 rounded-xl border border-ok/30 bg-ok/10 px-4 py-2.5 text-[14.5px] font-semibold text-ok">
              <CircleCheck className="size-[18px]" aria-hidden="true" /> Você já passou neste módulo. Pode responder novamente para revisar.
            </p>
          )}
        </header>

        <AnimatePresence mode="wait" initial={false}>
          {resultado ? (
            <motion.div
              key="resultado"
              initial={reduzir ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] } }}
              exit={{ opacity: 0, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } }}
            >
              <section
                aria-labelledby="h-resultado"
                className={cn("mb-6 rounded-2xl border p-6", resultado.aprovado ? "border-ok/40" : "border-line-hi")}
              >
                <p className="m-0 mb-1 text-sm text-muted">Seu resultado</p>
                <h2 id="h-resultado" className="m-0 mb-2 font-display text-2xl font-semibold">
                  {resultado.aprovado ? "Módulo concluído" : "Ainda não foi desta vez"}
                </h2>
                <p className="m-0 mb-5 text-[15.5px] text-[#e4e4e4]">
                  <span className={cn("text-3xl font-semibold", resultado.aprovado ? "text-ok" : "text-ink")}>{resultado.nota}%</span>{" "}
                  <span className="text-muted">
                    de acerto: {resultado.acertos} de {resultado.total} certas, mínimo de {resultado.nota_minima}%
                  </span>
                </p>
                <p className="m-0 mb-5 text-muted">
                  {resultado.aprovado
                    ? proximoModulo
                      ? `O ${rotuloModuloCurto(proximoModulo.ordem, proximoModulo.titulo)} está liberado.`
                      : "Você passou nas questões do último módulo."
                    : "Leia a explicação das questões que você errou e responda novamente. As questões e a ordem das alternativas mudam a cada tentativa."}
                </p>
                <div className="flex flex-wrap gap-3">
                  {resultado.aprovado ? (
                    proximoModulo?.aulas[0] ? (
                      <Link to={caminhoAula(c.slug, proximoModulo.aulas[0].numero)} className={cn(link, "bg-orange text-orange-ink hover:bg-orange-hi")}>
                        Começar o {rotuloModuloCurto(proximoModulo.ordem, proximoModulo.titulo)}
                      </Link>
                    ) : (
                      <Link to={caminhoAvaliacao(c.slug)} className={cn(link, "bg-orange text-orange-ink hover:bg-orange-hi")}>
                        Ver a avaliação final
                      </Link>
                    )
                  ) : (
                    <Botao onClick={novaRodada} className="px-4 py-2.5 text-[15px]">
                      <RotateCcw className="size-4" aria-hidden="true" /> Responder novamente
                    </Botao>
                  )}
                  {!resultado.aprovado && primeiraAula && (
                    <Link to={caminhoAula(c.slug, primeiraAula.numero)} className={cn(link, "border border-line-hi hover:border-muted")}>
                      Rever as aulas do módulo
                    </Link>
                  )}
                  {resultado.aprovado && (
                    <Link to={`/cursos/${c.slug}`} className={cn(link, "border border-line-hi hover:border-muted")}>
                      Voltar ao curso
                    </Link>
                  )}
                </div>
              </section>
              <h2 className="m-0 mb-3 font-display text-lg font-semibold">Correção</h2>
              <ol className="m-0 flex list-none flex-col gap-4 p-0">
                {resultado.correcao.map((corr, i) => {
                  const questao = q?.questoes.find((x) => x.id === corr.questao);
                  return questao ? (
                    <li key={corr.questao}>
                      <Questao questao={questao} indice={i + 1} total={resultado.correcao.length} correcao={corr} />
                    </li>
                  ) : null;
                })}
              </ol>
            </motion.div>
          ) : (
            <motion.form
              key={`rodada-${rodada}`}
              initial={reduzir ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.2, 0.8, 0.2, 1] } }}
              exit={{ opacity: 0, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } }}
              onSubmit={(e) => {
                e.preventDefault();
                if (completo && !envio.isPending) envio.mutate();
              }}
              aria-busy={!q}
            >
              {!q ? (
                <div className="flex flex-col gap-4" aria-label="Carregando as questões">
                  {[0, 1, 2].map((i) => (
                    <Esqueleto key={i} className="h-60 w-full rounded-2xl" />
                  ))}
                </div>
              ) : (
                <ol className="m-0 flex list-none flex-col gap-4 p-0">
                  {q.questoes.map((questao, i) => (
                    <li key={questao.id}>
                      <Questao
                        questao={questao}
                        indice={i + 1}
                        total={total}
                        escolhida={respostas[questao.id]}
                        escolher={(alt) => setRespostas((r) => ({ ...r, [questao.id]: alt }))}
                        desabilitada={envio.isPending}
                      />
                    </li>
                  ))}
                </ol>
              )}
              <BarraEnvio
                respondidas={respondidas}
                total={total}
                pronto={completo}
                enviando={envio.isPending}
                erro={erroEnvio}
                rotulo="Enviar respostas"
              />
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function Carregando() {
  return (
    <div aria-busy="true" aria-label="Carregando as questões" className="mx-auto flex max-w-3xl flex-col gap-5">
      <Esqueleto className="h-5 w-1/2" />
      <Esqueleto className="h-10 w-2/3" />
      <Esqueleto className="h-60 w-full rounded-2xl" />
      <Esqueleto className="h-60 w-full rounded-2xl" />
    </div>
  );
}
