import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { L, waLink } from "@/lib/lang";
import { Shield, Target, Globe, ArrowRight, Compass, HandHeart, Scale, Users, BookOpen, Lightbulb, Flag } from "lucide-react";

const About = () => {
  useScrollReveal();
  const { t } = useTranslation();

  const codeIcons = [Scale, Users, HandHeart, Flag, BookOpen, Compass];
  const code = t("about.code", { returnObjects: true }) as { title: string; desc: string }[];
  const whereList = t("about.whereList", { returnObjects: true }) as string[];

  const pilares = [
    { key: "media" },
    { key: "academy" },
    { key: "labs" },
    { key: "research" },
    { key: "consulting" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="container mx-auto text-center relative z-10 animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            {t("about.badge")}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            {t("about.h1a")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">{t("about.h1b")}</span>
          </h1>
          <p className="text-lg text-white/60 max-w-3xl mx-auto font-medium leading-relaxed">
            {t("about.lead")}
          </p>
        </div>
      </section>

      {/* O que é real hoje */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-neutral-900 border border-amber-500/20 rounded-2xl p-8 md:p-10 text-center animate-on-scroll">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
              {t("about.whereTitle")}
            </h2>
            {whereList.map((paragraph, i) => (
              <p key={i} className="text-neutral-400 leading-relaxed mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
            <Link to={L("/servicos")} className="inline-flex items-center gap-2 mt-6 text-orange-400 hover:text-orange-300 transition-colors font-medium text-sm">
              {t("about.whereLink")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Propósito, Visão, Ambição */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8 animate-on-scroll">
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
              <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                <Target className="h-7 w-7 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t("about.purposeTitle")}</h3>
              <p className="text-neutral-400 leading-relaxed">{t("about.purposeBody")}</p>
            </div>

            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
              <div className="h-14 w-14 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
                <Globe className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t("about.visionTitle")}</h3>
              <p className="text-neutral-400 leading-relaxed">{t("about.visionBody")}</p>
            </div>

            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
              <div className="h-14 w-14 rounded-xl bg-orange-600/10 flex items-center justify-center mb-6 border border-orange-600/20">
                <Lightbulb className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{t("about.ambitionTitle")}</h3>
              <p className="text-neutral-400 leading-relaxed mb-6">{t("about.ambitionBody")}</p>
              <div className="flex flex-wrap gap-2">
                {pilares.map((p) => (
                  <span key={p.key} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-neutral-300">
                    {t(`about.pillars.${p.key}`)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Código CyDef */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              {t("about.codeTitle")}
            </h2>
            <p className="text-white/60 text-lg">{t("about.codeLead")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-on-scroll">
            {code.map((item, i) => {
              const Icon = codeIcons[i] ?? Shield;
              return (
                <div key={i} className="bg-neutral-900 border border-white/10 rounded-2xl p-8 hover:border-orange-500/30 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <Icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <span className="text-xs font-mono text-neutral-500">0{i + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/5 blur-[150px] -z-10 pointer-events-none"></div>
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-3xl p-12 md:p-20 text-center relative backdrop-blur-md animate-on-scroll">
            <Shield className="h-16 w-16 text-orange-500 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              {t("about.ctaTitle")}
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              {t("about.ctaBody")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to={L("/academy")} className="inline-block">
                <button className="button-custom" type="button">
                  <div className="points_wrapper">
                    <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                  </div>
                  <span className="inner flex items-center gap-2">{t("about.ctaStart")} <ArrowRight className="w-4 h-4" /></span>
                </button>
              </Link>
              <a href={waLink(t("contact.waMsg"))} target="_blank" rel="noopener noreferrer" className="inline-block">
                <button className="px-6 py-4 rounded-lg border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500 transition-colors font-medium text-sm" type="button">
                  {t("common.talkToCydef")}
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
