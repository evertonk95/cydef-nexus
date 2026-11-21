import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, Loader2, Play, RotateCcw } from "lucide-react";
import { usePortal } from "@/lib/portal";
import { buscarVideo, ErroAula } from "@/lib/aula";
import { ESTADO, ouvirPlayer, urlEmbed, type LeituraPlayer } from "@/lib/youtube";
import { duracao, relogio } from "@/lib/formato";
import type { AulaLista } from "@/lib/cursos";

/** Intervalo mínimo entre gravações de posição enquanto o vídeo toca. */
const INTERVALO_MS = 15_000;
/** A partir daqui a aula conta como assistida. */
const FRACAO_CONCLUSAO = 0.92;

const MENSAGEM: Record<string, string> = {
  sem_matricula: "Este curso ainda não está na sua conta. Volte para Meus cursos e tente de novo.",
  aula_indisponivel: "Esta aula não está disponível agora.",
  sem_video: "O vídeo desta aula está indisponível no momento.",
  modulo_bloqueado: "Esta aula abre depois que você passar nas questões do módulo anterior.",
  falha: "Não conseguimos carregar o vídeo. Verifique a conexão e tente de novo.",
};

export function Player({
  aula,
  salvar,
}: {
  aula: AulaLista;
  salvar: (posicao: number, concluida: boolean) => void;
}) {
  const { sb, sessao } = usePortal();
  // O endereço do player é fixado no clique em "Assistir". Ele não pode
  // depender da posição salva: cada gravação de progresso atualiza a aula na
  // página, e um src novo faria o navegador recarregar o vídeo a cada 15 s.
  const [src, setSrc] = useState<string | null>(null);
  const tocando = src !== null;
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
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-panel">
      {src && video.data?.provedor === "youtube" ? (
        <iframe
          ref={iframe}
          src={src}
          title={`Vídeo da aula: ${aula.titulo}`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2 sm:bottom-5 sm:left-5">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-bg px-2.5 py-1 text-[13px] text-[#d4d4d4]">
              <Clock className="size-3.5" aria-hidden="true" /> {duracao(aula.duracao_seg)}
            </span>
            {inicio > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-bg px-2.5 py-1 text-[13px] text-[#d4d4d4]">
                Continuar de {relogio(inicio)}
              </span>
            ) : null}
          </div>
          {erro ? (
            <div role="alert" className="mx-6 flex max-w-md items-start gap-3 rounded-xl border border-bad/30 bg-bg p-4 text-sm leading-relaxed">
              <AlertTriangle className="mt-0.5 size-5 flex-none text-bad" aria-hidden="true" />
              <div>
                <p className="m-0">{MENSAGEM[erro]}</p>
                {erro === "falha" && (
                  <button type="button" onClick={() => void video.refetch()} className="mt-2 inline-flex items-center gap-1.5 font-semibold text-ink underline underline-offset-4">
                    <RotateCcw className="size-3.5" aria-hidden="true" /> Tentar de novo
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => video.data && setSrc(urlEmbed(video.data.ref, { inicio, origem: window.location.origin }))}
              disabled={!video.data}
              aria-label={video.data ? `Assistir à aula: ${aula.titulo}` : "Preparando o vídeo"}
              className="grid size-16 place-items-center rounded-full bg-orange text-orange-ink transition-colors duration-150 hover:bg-orange-hi disabled:cursor-wait sm:size-20"
            >
              {video.data ? (
                <Play className="ml-1 size-6 fill-current sm:size-7" aria-hidden="true" />
              ) : (
                <Loader2 className="size-7 animate-[girar_900ms_linear_infinite]" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
