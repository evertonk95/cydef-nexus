import { useTranslation } from "react-i18next";
import { Check, MailCheck } from "lucide-react";
import { AcademyMessageLayout } from "@/components/academy/AcademyMessageLayout";
import { badgeNeutral, badgeOrange } from "@/components/academy/ctaStyles";
import { LANDING_PATH } from "@/lib/config";
import { L } from "@/lib/lang";

/**
 * Página neutra de sucesso pós-inscrição (J1-OK) — acessível por URL direta.
 * O estado de sucesso principal é renderizado inline no formulário; esta
 * página existe como deep link neutro (sem PII na URL).
 * Os passos mostram a jornada da pré-inscrição: o primeiro já aconteceu
 * (por isso a pessoa está aqui) e o segundo é a ação pendente.
 */
const AcademyThankYou = () => {
  const { t } = useTranslation();
  const steps = t("thankYou.steps", { returnObjects: true }) as { title: string; desc: string }[];

  return (
    <AcademyMessageLayout
      icon={<MailCheck className="w-7 h-7 text-orange-400" aria-hidden="true" />}
      title={t("thankYou.title")}
      body={<p>{t("thankYou.body")}</p>}
      primary={{ to: L("/academy"), label: t("thankYou.explore") }}
      secondary={{ to: L(LANDING_PATH), label: t("thankYou.back") }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-5">{t("thankYou.stepsLabel")}</h2>
      <ol className="flex flex-col gap-3">
        {steps.map((step, i) => {
          const done = i === 0;
          const current = i === 1;
          return (
            <li
              key={step.title}
              aria-current={current ? "step" : undefined}
              className={`flex items-start gap-4 rounded-2xl border p-4 sm:p-5 ${
                current ? "border-orange-500/40 bg-orange-500/5" : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <span
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${
                  done
                    ? "bg-gradient-to-b from-orange-400 to-orange-600 text-white"
                    : current
                      ? "border border-orange-500/60 text-orange-400 shadow-[0_0_16px_rgba(249,115,22,0.3)]"
                      : "border border-white/15 text-neutral-500"
                }`}
              >
                {done ? <Check className="w-4 h-4" aria-hidden="true" /> : String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className={`font-semibold ${i > 1 ? "text-neutral-400" : "text-white"}`}>{step.title}</h3>
                  {done ? <span className={badgeNeutral}>{t("thankYou.done")}</span> : null}
                  {current ? <span className={badgeOrange}>{t("thankYou.now")}</span> : null}
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed">{step.desc}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </AcademyMessageLayout>
  );
};

export default AcademyThankYou;
