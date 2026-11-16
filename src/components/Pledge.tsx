import { useTranslation } from "react-i18next";
import { HandHeart } from "lucide-react";

/**
 * Compromisso social da CyDef (decisão do Everton, 16/11/2026): 1% do lucro
 * líquido de cada mês vai para instituições de caridade. Vale para tudo o que a
 * CyDef vende (consultoria, Inora e o que vier). O texto deixa explícito que a
 * base é o LUCRO LÍQUIDO, não o faturamento.
 *
 * Bloco único, usado na home, na Consultoria e na página do Inora, para o
 * texto nunca divergir entre as páginas.
 */
export const Pledge = ({ className = "" }: { className?: string }) => {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="compromisso-titulo" className={`py-20 px-4 relative ${className}`}>
      <div className="container mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-orange-500/25 bg-gradient-to-br from-orange-500/[0.09] via-neutral-950 to-neutral-950 p-8 md:p-14 animate-on-scroll">
          <div
            className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-orange-500/20 blur-[110px]"
            aria-hidden="true"
          />
          <div className="relative grid grid-cols-1 items-center gap-10 md:grid-cols-[auto_1fr] md:gap-14">
            <div className="flex flex-col items-start md:items-center">
              <span
                className="font-display text-[5.5rem] md:text-[8.5rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-orange-300 via-orange-500 to-orange-700 drop-shadow-[0_0_35px_rgba(249,115,22,0.35)]"
                aria-hidden="true"
              >
                {t("pledge.figure")}
              </span>
              <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                <HandHeart className="h-3.5 w-3.5" aria-hidden="true" />
                {t("pledge.tagline")}
              </span>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-orange-400">
                {t("pledge.eyebrow")}
              </p>
              <h2 id="compromisso-titulo" className="mb-5 text-3xl md:text-4xl font-bold tracking-tighter text-white">
                {t("pledge.title")}
              </h2>
              <p className="mb-5 max-w-2xl text-lg leading-relaxed text-neutral-300">{t("pledge.body")}</p>
              <p className="inline-flex items-center gap-2 border-l-2 border-orange-500/60 pl-3 text-sm font-medium text-neutral-400">
                {t("pledge.fine")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
