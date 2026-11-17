import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, Bot, Mail, RotateCcw, Undo2, Ban } from "lucide-react";
import {
  AREAS,
  INTERESSES_INORA,
  MOTIVOS,
  PORTES,
  PRAZOS,
  URGENCIAS,
  motivoAbreFormulario,
  type Motivo,
  type Triagem,
} from "@/lib/contato/triagem";
import { isContactEnabled } from "@/lib/config";
import { L } from "@/lib/lang";
import { focusRing } from "@/components/academy/ctaStyles";
import { ContatoForm } from "./ContatoForm";

/**
 * Bot de triagem guiado (árvore de decisão fechada, sem texto livre e sem IA
 * generativa): filtra o que não é demanda da CyDef antes de chegar ao time e
 * classifica o restante. Com a flag do formulário desligada, termina em um
 * e-mail com a triagem no assunto (nenhum dado sai pela rede).
 */

type Campo = "motivo" | "urgencia" | "area" | "porte" | "prazo" | "interesse";

const OPCOES: Record<Campo, readonly string[]> = {
  motivo: MOTIVOS,
  urgencia: URGENCIAS,
  area: AREAS,
  porte: PORTES,
  prazo: PRAZOS,
  interesse: INTERESSES_INORA,
};

const FLUXO: Record<Motivo, Campo[]> = {
  incidente: ["urgencia", "porte"],
  consultoria: ["area", "porte", "prazo"],
  inora: ["interesse", "porte"],
  parceria: [],
  academy: [],
  pessoal: [],
  vaga: [],
};

type Resposta = { campo: Campo; valor: string };

const bolha = "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-200 motion-safe:ease-out";

export const TriagemBot = () => {
  const { t } = useTranslation();
  const formAtivo = useMemo(() => isContactEnabled(), []);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const perguntaRef = useRef<HTMLDivElement>(null);
  const primeiraRender = useRef(true);

  const motivo = respostas.find((r) => r.campo === "motivo")?.valor as Motivo | undefined;
  const sequencia: Campo[] = motivo ? ["motivo", ...FLUXO[motivo]] : ["motivo"];
  const atual: Campo | null = sequencia[respostas.length] ?? null;
  const concluido = motivo !== undefined && atual === null;

  const triagem: Triagem | null = useMemo(() => {
    if (!concluido || !motivo) return null;
    const out: Record<string, string> = {};
    for (const r of respostas) out[r.campo] = r.valor;
    return out as unknown as Triagem;
  }, [concluido, motivo, respostas]);

  useEffect(() => {
    if (primeiraRender.current) {
      primeiraRender.current = false;
      return;
    }
    perguntaRef.current?.focus({ preventScroll: true });
  }, [respostas.length]);

  const rotulo = (campo: Campo, valor: string) => t(`contactAssist.options.${campo}.${valor}`);
  const responder = (campo: Campo, valor: string) => setRespostas((rs) => [...rs, { campo, valor }]);

  const resumo = respostas.map((r) => rotulo(r.campo, r.valor));
  const mailto = (() => {
    const assunto = `[${resumo[0] ?? ""}] ${resumo.slice(1).join(" · ")}`.trim();
    return `mailto:contato@cydef.com.br?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(t("contactAssist.mailBody"))}`;
  })();

  const botaoAcao = `inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white rounded px-2 py-1 transition-colors duration-150 ${focusRing}`;

  return (
    <section aria-labelledby="assistente-titulo" className="rounded-3xl border border-orange-500/30 bg-neutral-900/95 p-5 sm:p-7 shadow-[0_0_60px_-15px_rgba(249,115,22,0.35)]">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center shrink-0">
            <Bot className="h-5 w-5 text-orange-400" aria-hidden="true" />
          </div>
          <div>
            <h2 id="assistente-titulo" className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {t("contactAssist.title")}
            </h2>
            <p className="text-sm text-neutral-400">{t("contactAssist.subtitle")}</p>
          </div>
        </div>
        {respostas.length > 0 && (
          <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
            <button type="button" onClick={() => setRespostas((rs) => rs.slice(0, -1))} className={botaoAcao}>
              <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
              {t("contactAssist.back")}
            </button>
            <button type="button" onClick={() => setRespostas([])} className={botaoAcao}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {t("contactAssist.restart")}
            </button>
          </div>
        )}
      </header>

      {/* Histórico da conversa */}
      <div role="log" aria-live="polite" aria-relevant="additions" className="space-y-3 mb-4">
        {respostas.map((r, i) => (
          <div key={`${r.campo}-${i}`} className="space-y-3">
            <div className="flex">
              <p className={`${bolha} bg-white/5 border border-white/10 text-neutral-200`}>{t(`contactAssist.questions.${r.campo}`)}</p>
            </div>
            <div className="flex justify-end">
              <p className={`${bolha} bg-orange-500/15 border border-orange-500/30 text-orange-100`}>
                <span className="sr-only">{t("contactAssist.youChose")}: </span>
                {rotulo(r.campo, r.valor)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pergunta atual */}
      {atual && (
        <div ref={perguntaRef} tabIndex={-1} role="group" aria-labelledby="assistente-pergunta" className="focus:outline-none">
          <div className="flex mb-3">
            <p id="assistente-pergunta" className={`${bolha} bg-white/5 border border-white/10 text-white font-medium`}>
              <span className="block text-[11px] uppercase tracking-wider text-orange-400/90 font-semibold mb-0.5">
                {t("contactAssist.botName")} · {t("contactAssist.botTag")}
              </span>
              {t(`contactAssist.questions.${atual}`)}
            </p>
          </div>
          <ul className="flex flex-wrap gap-2" role="list">
            {OPCOES[atual].map((valor) => (
              <li key={valor}>
                <button
                  type="button"
                  onClick={() => responder(atual, valor)}
                  className={`min-h-[44px] rounded-full border border-white/15 bg-neutral-950 px-4 py-2 text-sm text-neutral-200 hover:border-orange-500/60 hover:text-white hover:-translate-y-0.5 transition-[transform,border-color,color] duration-150 ease-out motion-reduce:hover:translate-y-0 ${focusRing}`}
                >
                  {rotulo(atual, valor)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Desfecho */}
      {concluido && motivo && (
        <div ref={perguntaRef} tabIndex={-1} className="focus:outline-none space-y-4 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          {!motivoAbreFormulario(motivo) ? (
            <Filtro motivo={motivo as "academy" | "pessoal" | "vaga"} />
          ) : (
            <>
              {motivo === "incidente" && (
                <div role="note" className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-red-100 mb-1">{t("contactAssist.incidentNotice.title")}</p>
                    <p>{t("contactAssist.incidentNotice.body")}</p>
                    {respostas.some((r) => r.valor === "ativo_agora") && <p className="mt-2">{t("contactAssist.incidentNotice.active")}</p>}
                  </div>
                </div>
              )}
              <div className="flex">
                <p className={`${bolha} bg-white/5 border border-white/10 text-white`}>
                  {formAtivo ? t("contactAssist.readyForm") : t("contactAssist.readyMail")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-neutral-500">{t("contactAssist.summaryLabel")}:</span>
                {resumo.map((r) => (
                  <span key={r} className="rounded-full bg-orange-500/10 border border-orange-500/25 px-2.5 py-1 text-orange-300">
                    {r}
                  </span>
                ))}
              </div>
              {formAtivo && triagem ? (
                <ContatoForm triagem={triagem} />
              ) : (
                <a
                  href={mailto}
                  className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 min-h-[48px] text-sm font-semibold text-black hover:brightness-110 transition ${focusRing}`}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {t("contactAssist.mailCta")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
};

const Filtro = ({ motivo }: { motivo: "academy" | "pessoal" | "vaga" }) => {
  const { t } = useTranslation();
  const base = `contactAssist.filters.${motivo}`;
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-950/60 p-5">
      <div className="flex items-start gap-3">
        {motivo === "academy" ? (
          <Bot className="h-5 w-5 shrink-0 text-orange-400 mt-0.5" aria-hidden="true" />
        ) : (
          <Ban className="h-5 w-5 shrink-0 text-neutral-400 mt-0.5" aria-hidden="true" />
        )}
        <div>
          <p className="font-semibold text-white mb-1">{t(`${base}.title`)}</p>
          <p className="text-sm text-neutral-400 leading-relaxed">{t(`${base}.body`)}</p>
          {motivo === "academy" && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to={L("/academy")} className={`inline-flex items-center gap-1.5 text-sm font-medium text-orange-400 hover:text-orange-300 rounded ${focusRing}`}>
                {t("contactAssist.filters.academy.cta")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="mailto:academy@cydef.com.br" className={`inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white rounded ${focusRing}`}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                {t("contactAssist.filters.academy.mail")}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
