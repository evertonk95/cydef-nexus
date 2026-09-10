import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTranslation } from "react-i18next";
import { Microscope, FileText, PauseCircle, BookMarked, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { L } from "@/lib/lang";

/**
 * CyDef Research (F3) - página de estado honesto.
 * A torre está INATIVA: nenhuma publicação existe ainda. A página descreve o
 * que o pilar será (formato citável) sem prometer nada, e será atualizada
 * quando houver mudança real. Nada de catálogo vazio ou papers fantasma.
 */
const Research = () => {
  useScrollReveal();
  const { t } = useTranslation();

  const statusItems = t("research.statusItems", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          <div className="container mx-auto text-center relative z-10 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium mb-6">
              <Microscope className="h-4 w-4" />
              {t("research.badge")}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
              {t("research.h1a")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">
                {t("research.h1b")}
              </span>
            </h1>
            <p className="text-lg text-white/60 max-w-3xl mx-auto font-medium leading-relaxed">
              {t("research.lead")}
            </p>
          </div>
        </section>

        {/* O que Research será */}
        <section className="py-20 px-4 relative">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-start gap-4 bg-neutral-900 border border-white/10 rounded-2xl p-8 md:p-10 animate-on-scroll">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <FileText className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {t("research.whatTitle")}
                </h2>
                <p className="text-neutral-400 leading-relaxed">
                  {t("research.whatBody")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Status atual */}
        <section className="py-20 px-4 bg-white/[0.02] border-y border-white/5">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tighter">
                {t("research.statusTitle")}
              </h2>
            </div>
            <div className="bg-neutral-900 border border-neutral-700/60 rounded-2xl p-8 md:p-10 animate-on-scroll">
              <div className="flex flex-col md:flex-row items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <PauseCircle className="w-6 h-6 text-neutral-400" />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border bg-white/5 border-white/10 text-neutral-400 mb-3">
                    {t("research.inactiveLabel")}
                  </span>
                  <p className="text-neutral-300 leading-relaxed">
                    {t("research.inactiveBody")}
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                {statusItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-neutral-400 text-sm leading-relaxed"
                  >
                    <BookMarked className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="text-neutral-500 text-sm leading-relaxed mt-8 border-t border-white/10 pt-6">
                {t("research.updateNote")}
              </p>
            </div>

            <div className="text-center mt-12 animate-on-scroll">
              <Link
                to={L("/labs")}
                className="inline-flex items-center gap-2 text-orange-400 text-sm font-medium hover:text-orange-300 transition-colors"
              >
                {t("research.labsLink")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Research;
