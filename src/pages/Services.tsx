import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { L, waLink, currentLang } from "@/lib/lang";
import { hasLabsArtifactFor } from "@/lib/labs/artifacts";
import {
  Eye,
  Shield,
  Lock,
  ArrowRight,
  BarChart,
  Code,
  Mail,
  Newspaper,
  GraduationCap,
  Wrench,
  ScanLine,
  Radar,
  FlaskConical,
} from "lucide-react";

// Página honesta de oferta: a CyDef ainda NÃO vende serviços gerenciados.
const Services = () => {
  useScrollReveal();
  const { t } = useTranslation();

  const territorios = [
    { key: "soc", icon: Eye },
    { key: "ir", icon: Radar },
    { key: "hunting", icon: ScanLine },
    { key: "hardening", icon: Wrench },
    { key: "siem", icon: Code },
    { key: "ai", icon: BarChart },
  ];

  const realItems = [
    { to: "/blog", icon: Newspaper, title: t("services.realMediaTitle"), body: t("services.realMediaBody"), cta: t("services.realMediaCta") },
    { to: "/academy", icon: GraduationCap, title: t("services.realAcademyTitle"), body: t("services.realAcademyBody"), cta: t("services.realAcademyCta") },
    { to: "/contato", icon: Mail, title: t("services.realContactTitle"), body: t("services.realContactBody"), cta: t("services.realContactCta") },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="outline-none">

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="container mx-auto text-center relative z-10 animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            {t("services.badge")}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            {t("services.h1a")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">{t("services.h1b")}</span>
          </h1>
          <p className="text-lg text-white/60 max-w-3xl mx-auto font-medium leading-relaxed">
            {t("services.lead")}
          </p>
        </div>
      </section>

      {/* O que já é real hoje */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              {t("services.realTitle")}
            </h2>
            <p className="text-white/60 text-lg">{t("services.realLead")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 animate-on-scroll">
            {realItems.map((item) => (
              <Link key={item.to} to={L(item.to)} className="block group">
                <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 h-full hover:border-orange-500/50 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-orange-500/30">
                    <item.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6">{item.body}</p>
                  <span className="inline-flex items-center gap-2 text-orange-400 text-sm font-medium">
                    {item.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Labs: framework público (F5) — card real do pilar Labs.
              Fase 10: visível nos 3 idiomas (página do artefato localizada). */}
          {hasLabsArtifactFor("siem-health-maturity-framework", currentLang()) && (
            <div className="mt-6 animate-on-scroll">
              <Link
                to={L("/labs/siem-health-maturity-framework")}
                className="block group"
              >
                <div className="bg-neutral-900 border border-emerald-500/25 rounded-2xl p-8 md:p-10 hover:border-emerald-500/60 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/25">
                        <FlaskConical className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-white">
                            {t("services.realLabsTitle")}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                            {t("labs.fwState")}
                          </span>
                        </div>
                        <p className="text-neutral-400 text-sm leading-relaxed max-w-3xl">
                          {t("services.realLabsBody")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-emerald-400 text-sm font-medium mt-4">
                    {t("services.realLabsCta")}{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Em validação interna (existe, mas não é público) */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              {t("services.becomingTitle")}
            </h2>
            <p className="text-white/60 text-lg">{t("services.becomingLead")}</p>
          </div>
          <div className="max-w-4xl mx-auto animate-on-scroll">
            <Link to={L("/labs")} className="block group">
              <div className="bg-neutral-900 border border-amber-500/20 rounded-2xl p-8 md:p-10 hover:border-amber-500/50 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                      <FlaskConical className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {t("services.becomingItemTitle")}
                      </h3>
                      <p className="text-neutral-400 text-sm leading-relaxed mb-4 max-w-2xl">
                        {t("services.becomingItemBody")}
                      </p>
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 text-amber-400 text-sm font-medium">
                  {t("services.becomingItemCta")}{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Territórios técnicos — futuro */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-6 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              {t("services.futureTitle")}
            </h2>
            <p className="text-white/60 text-lg">{t("services.futureLead")}</p>
          </div>

          <div className="max-w-3xl mx-auto text-center mb-14 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium">
              <Lock className="w-4 h-4 shrink-0" />
              {t("services.futureNote")}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-on-scroll">
            {territorios.map((item) => (
              <div key={item.key} className="bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:border-orange-500/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-500/20 flex items-center justify-center mb-6">
                  <item.icon className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-lg font-semibold text-white">{t(`services.territories.${item.key}.title`)}</h3>
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-semibold uppercase tracking-wider text-neutral-400 whitespace-nowrap">
                    {t("services.badgePrep")}
                  </span>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">{t(`services.territories.${item.key}.desc`)}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-neutral-500 mt-12 max-w-2xl mx-auto">
            {t("services.futureHelp")}
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/5 blur-[150px] -z-10 pointer-events-none"></div>
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-3xl p-12 md:p-20 text-center relative backdrop-blur-md animate-on-scroll">
            <Shield className="h-16 w-16 text-orange-500 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              {t("services.ctaTitle")}
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              {t("services.ctaBody")}
            </p>
            <a href={waLink(t("contact.waMsg"))} target="_blank" rel="noopener noreferrer" className="inline-block">
              <button className="button-custom" type="button">
                <div className="points_wrapper">
                  <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                </div>
                <span className="inner flex items-center gap-2">{t("services.ctaButton")} <ArrowRight className="w-4 h-4" /></span>
              </button>
            </a>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default Services;
