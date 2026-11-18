import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { AlertTriangle, Check, Clock, Loader2, Play, RotateCcw } from "lucide-react";
import { usePortal } from "@/lib/portal";
import { buscarVideo, ErroAula, numeroAula } from "@/lib/aula";
import { ESTADO, ouvirPlayer, urlEmbed, type LeituraPlayer } from "@/lib/youtube";
import { duracao, relogio } from "@/lib/formato";
import { cn } from "@/lib/cn";
import type { AulaLista } from "@/lib/cursos";

/** Intervalo mínimo entre gravações de posição enquanto o vídeo toca. */
const INTERVALO_MS = 15_000;
/** A partir daqui a aula conta como assistida. */
const FRACAO_CONCLUSAO = 0.92;

const MENSAGEM: Record<string, string> = {
  sem_matricula: "Este curso ainda não está na sua conta. Volte para Meus cursos e tente de novo.",
  aula_indisponivel: "Esta aula não está disponível agora.",
  sem_video: "O vídeo desta aula está indisponível no momento.",
  falha: "Não conseguimos carregar o vídeo. Verifique a conexão e tente de novo.",
};

export function Player({
  aula,
  rotulo,
  salvar,
}: {
  aula: AulaLista;
  rotulo: string;
  salvar: (posicao: number, concluida: boolean) => void;
}) {
  const { sb, sessao } = usePortal();
  const reduzir = useReducedMotion();
  const [tocando, setTocando] = useState(false);
  const iframe = useRef<HTMLIFrameElement>(null);
  const video = useQuery({
    queryKey: ["video", aula.id, sessao?.user.id],
    queryFn: () => buscarVideo(sb, aula.id),
    enabled: Boolean(sessao),
    staleTime: 10 * 60_000,
    retry: (n, e) => !(e instanceof ErroAula && e.codigo !== "falha") && n < 2,
  });

  // Rastreamento: grava a posição a cada 15 s tocando, ao pausar, ao sair da
  // aba e ao terminar. A conclusão vale a partir de 92% ou no fim do vídeo.
  // O componente monta de novo a cada aula (key = id da aula na página).
  const leitura = useRef({ tempo: aula.posicao_seg, duracao: 0, ultimaGravacao: 0, concluiu: aula.concluida });
  const salvarRef = useRef(salvar);
  useEffect(() => {
    salvarRef.current = salvar;
  }, [salvar]);
  useEffect(() => {
    if (aula.concluida) leitura.current.concluiu = true;
  }, [aula.concluida]);

  useEffect(() => {
    if (!tocando || !iframe.current) return;
    const limite = aula.duracao_seg + 60;
    const estado = leitura.current;
    const gravar = (concluida: boolean) => {
      const l = estado;
      const posicao = Math.min(Math.floor(l.tempo), limite);
      l.ultimaGravacao = Date.now();
      if (concluida) l.concluiu = true;
      salvarRef.current(posicao, concluida || l.concluiu);
    };
    const aoLer = (x: LeituraPlayer) => {
      const l = estado;
      if (x.tempo !== undefined) l.tempo = x.tempo;
      if (x.duracao !== undefined && x.duracao > 0) l.duracao = x.duracao;
      if (x.estado === ESTADO.terminou) {
        l.tempo = l.duracao || l.tempo;
        gravar(true);
        return;
      }
      if (!l.concluiu && l.duracao > 0 && l.tempo / l.duracao >= FRACAO_CONCLUSAO) {
        gravar(true);
        return;
      }
      if (x.estado === ESTADO.pausado) {
        gravar(false);
        return;
      }
      if (Date.now() - l.ultimaGravacao >= INTERVALO_MS && l.tempo > 0) gravar(false);
    };
    const desligar = ouvirPlayer(iframe.current, aoLer);
    const aoOcultar = () => {
      if (document.visibilityState === "hidden" && estado.tempo > 0) gravar(false);
    };
    document.addEventListener("visibilitychange", aoOcultar);
    return () => {
      desligar();
      document.removeEventListener("visibilitychange", aoOcultar);
      if (estado.tempo > 0) gravar(false);
    };
  }, [tocando, aula.id, aula.duracao_seg]);

  const inicio = aula.concluida || aula.posicao_seg >= aula.duracao_seg - 10 ? 0 : aula.posicao_seg;
  const erro = video.error instanceof ErroAula ? video.error.codigo : video.isError ? "falha" : null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-[#09090a] shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
      {tocando && video.data?.provedor === "youtube" ? (
        <iframe
          ref={iframe}
          src={urlEmbed(video.data.ref, { inicio, origem: window.location.origin })}
          title={`Vídeo da aula ${numeroAula(aula.numero)}: ${aula.titulo}`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <div className="absolute inset-0">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_10%,rgba(249,115,22,0.16),transparent_55%),radial-gradient(80%_70%_at_0%_100%,rgba(249,115,22,0.07),transparent_60%)]" />
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]" />
          <svg aria-hidden="true" viewBox="0 0 800 450" preserveAspectRatio="none" className="absolute inset-0 size-full">
            <motion.path
              d="M 300 470 C 420 260, 560 120, 820 70"
              fill="none"
              stroke="rgba(249,115,22,0.55)"
              strokeWidth="1.5"
              initial={reduzir ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
            />
          </svg>
          <div className="relative flex h-full flex-col p-5 sm:p-8 lg:p-11">
            <p className="m-0 flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-muted uppercase sm:text-xs">
              <span aria-hidden="true" className="h-px w-7 bg-orange" />
              Aula {numeroAula(aula.numero)} · {rotulo}
            </p>
            <p className="mt-3 mb-0 hidden max-w-[22ch] font-display sm:block text-[clamp(22px,3.2vw,40px)] leading-[1.08] font-bold tracking-tight text-balance">
              {aula.titulo}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-black/40 px-2.5 py-1 font-mono text-xs text-muted">
                <Clock className="size-3.5" aria-hidden="true" /> {duracao(aula.duracao_seg)}
              </span>
              {aula.concluida ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-ok/30 bg-ok/10 px-2.5 py-1 font-mono text-xs text-ok">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> Concluída
                </span>
              ) : inicio > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-orange/30 bg-orange/10 px-2.5 py-1 font-mono text-xs text-orange-hi">
                  Continuar de {relogio(inicio)}
                </span>
              ) : null}
            </div>
          </div>
          <div className="absolute inset-0 grid place-items-center">
            {erro ? (
              <div role="alert" className="mx-6 flex max-w-md items-start gap-3 rounded-xl border border-bad/30 bg-[#140707]/90 p-4 text-sm leading-relaxed">
                <AlertTriangle className="mt-0.5 size-5 flex-none text-bad" aria-hidden="true" />
                <div>
                  <p className="m-0">{MENSAGEM[erro]}</p>
                  {erro === "falha" && (
                    <button type="button" onClick={() => void video.refetch()} className="mt-2 inline-flex items-center gap-1.5 font-semibold text-orange-hi hover:text-orange">
                      <RotateCcw className="size-3.5" aria-hidden="true" /> Tentar de novo
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setTocando(true)}
                disabled={!video.data}
                aria-label={video.data ? `Assistir à aula ${numeroAula(aula.numero)}: ${aula.titulo}` : "Preparando o vídeo"}
                className="group/play relative grid size-[60px] place-items-center sm:size-[76px] rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-orange-hi),var(--color-orange)_60%,#ea580c)] text-orange-ink shadow-[0_0_0_10px_rgba(249,115,22,0.12),0_18px_50px_-10px_rgba(249,115,22,0.8)] transition-transform duration-200 ease-[var(--ease-out-soft)] hover:scale-105 active:scale-95 disabled:cursor-wait sm:size-[92px]"
              >
                <span aria-hidden="true" className={cn("absolute inset-0 rounded-full border-2 border-orange/60", !reduzir && video.data && "animate-[pulso-anel_1.8s_ease-out_infinite]")} />
                {video.data ? (
                  <Play className="ml-1 size-6 fill-current sm:size-9" aria-hidden="true" />
                ) : (
                  <Loader2 className="size-7 animate-[girar_900ms_linear_infinite]" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
