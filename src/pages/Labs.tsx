import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { L, currentLang } from "@/lib/lang";
import { hasLabsArtifactFor } from "@/lib/labs/artifacts";
import {
  FlaskConical,
  ShieldCheck,
  Wrench,
  Lock,
  ScrollText,
  GitPullRequest,
  CircleDot,
  GitFork,
  ArrowRight,
} from "lucide-react";

/**
 * CyDef Labs (F3 - primeiro artefato real: CyDef Inora; F5 - framework público).
 * Catálogo honesto: só o que existe de verdade; estado interno de validação
 * declarado sem vitrine. Nada de "em breve", nada de data, nada de demo.
 * O framework é PT-first (decisão 04/09/2026): o card só é listado no idioma
 * em que a página existe (hoje PT; EN/ES quando a tradução chegar — Fase 10).
 */
const Labs = () => {
  useScrollReveal();
  const { t } = useTranslation();

  const legend = t("labs.legend", { returnObjects: true }) as {
    state: string;
    desc: string;
  }[];
  const inoraFacts = t("labs.inoraFacts", { returnObjects: true }) as string[];
  const fwFacts = t("labs.fwFacts", { returnObjects: true }) as string[];
  const showFramework = hasLabsArtifactFor(
    "siem-health-maturity-framework",
    currentLang(),
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          <div className="container mx-auto text-center relative z-10 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium mb-6">
              <FlaskConical className="h-4 w-4" />
              {t("labs.badge")}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
              {t("labs.h1a")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">
                {t("labs.h1b")}
              </span>
            </h1>
            <p className="text-lg text-white/60 max-w-3xl mx-auto font-medium leading-relaxed">
              {t("labs.lead")}
            </p>
          </div>
        </section>

        {/* Como ler o catálogo */}
        <section className="py-20 px-4 relative">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tighter">
                {t("labs.howTitle")}
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                {t("labs.howLead")}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 animate-on-scroll">
              {legend.map((item) => (
                <div
                  key={item.state}
                  className="bg-neutral-900 border border-white/10 rounded-2xl p-6"
                >
                  <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border bg-white/5 border-white/10 text-neutral-300 mb-3">
                    {item.state}
                  </span>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Catálogo */}
        <section className="py-20 px-4 bg-white/[0.02] border-y border-white/5">
          <div className="container mx-auto max-w-5xl">
            <div className="max-w-3xl mx-auto text-center mb-14 animate-on-scroll">
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tighter">
                {t("labs.catTitle")}
              </h2>
              <p className="text-white/60 text-lg">{t("labs.catLead")}</p>
            </div>

            {/* Artefato: CyDef Inora */}
            <article className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden animate-on-scroll">
              <div className="p-8 md:p-12">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 flex items-center justify-center border border-orange-500/30">
                      <ShieldCheck className="w-7 h-7 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white">
                        {t("labs.inoraName")}
                      </h3>
                      <p className="text-orange-400/90 text-sm font-medium mt-1">
                        {t("labs.inoraRole")}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border bg-amber-500/10 border-amber-500/30 text-amber-400">
                    <CircleDot className="w-3.5 h-3.5" />
                    {t("labs.inoraState")}
                  </span>
                </div>

                <p className="text-neutral-300 leading-relaxed mb-8">
                  {t("labs.inoraBody")}
                </p>

                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
                  {t("labs.inoraFactsTitle")}
                </h4>
                <ul className="space-y-3 mb-8">
                  {inoraFacts.map((fact) => (
                    <li
                      key={fact}
                      className="flex items-start gap-3 text-neutral-400 text-sm leading-relaxed"
                    >
                      <ScrollText className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      {fact}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-sm text-neutral-400">
                  <span className="inline-flex items-center gap-2">
                    <Lock className="w-4 h-4 text-neutral-500" />
                    {t("labs.inoraLicense")}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4 text-neutral-500" />
                    {t("labs.inoraRepo")}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-neutral-500" />
                    {t("labs.inoraUpdated")}
                  </span>
                </div>
              </div>

              <div className="border-t border-amber-500/20 bg-amber-500/[0.04] px-8 md:px-12 py-6">
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-2">
                  {t("labs.notTitle")}
                </h4>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {t("labs.notBody")}
                </p>
              </div>
            </article>

            {/* Artefato: CyDef SIEM Health & Maturity Assessment Framework (F5) */}
            {showFramework && (
              <article className="bg-neutral-900 border border-emerald-500/20 rounded-3xl overflow-hidden animate-on-scroll mt-10">
                <div className="p-8 md:p-12">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                        <GitFork className="w-7 h-7 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white">
                          {t("labs.fwName")}
                        </h3>
                        <p className="text-emerald-400/90 text-sm font-medium mt-1">
                          {t("labs.fwRole")}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                      <CircleDot className="w-3.5 h-3.5" />
                      {t("labs.fwState")}
                    </span>
                  </div>

                  <p className="text-neutral-300 leading-relaxed mb-8">
                    {t("labs.fwBody")}
                  </p>

                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">
                    {t("labs.fwFactsTitle")}
                  </h4>
                  <ul className="space-y-3 mb-8">
                    {fwFacts.map((fact) => (
                      <li
                        key={fact}
                        className="flex items-start gap-3 text-neutral-400 text-sm leading-relaxed"
                      >
                        <ScrollText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        {fact}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-sm text-neutral-400 mb-8">
                    <span className="inline-flex items-center gap-2">
                      <Lock className="w-4 h-4 text-neutral-500" />
                      {t("labs.fwLicense")}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <GitPullRequest className="w-4 h-4 text-neutral-500" />
                      {t("labs.fwRepo")}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-neutral-500" />
                      {t("labs.fwUpdated")}
                    </span>
                  </div>

                  <Link
                    to={L("/labs/siem-health-maturity-framework")}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded-xl transition-colors shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]"
                  >
                    {t("labs.fwCta")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            )}

            <p className="text-center text-neutral-500 mt-10 max-w-2xl mx-auto text-sm">
              {t("labs.otherNote")}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Labs;
