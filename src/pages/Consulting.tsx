import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Shield, Compass, Target, FlaskConical, BookOpen } from "lucide-react";
import { L, currentLang } from "@/lib/lang";
import { JsonLd } from "@/lib/seo";
import { consultingServicesLd } from "@/lib/seo-data";
import { CONSULTING_ICONS, CONSULTING_KEYS } from "@/lib/consulting";

type Item = { title: string; desc: string };

// CyDef Consulting: substitui a antiga página "O que estamos construindo"
// (decisão do Everton, 12/11/2026). Sem preço e sem prazo publicado.
const Consulting = () => {
  useScrollReveal();
  const { t } = useTranslation();
  const lang = currentLang();

  const why = t("consulting.why", { returnObjects: true }) as Item[];
  const steps = t("consulting.steps", { returnObjects: true }) as Item[];
  const formats = t("consulting.formats", { returnObjects: true }) as Item[];
  const whyIcons = [Compass, Target, FlaskConical, BookOpen];
  const whyLinks = [null, null, "/labs", "/blog"];

  const services = CONSULTING_KEYS.map((key) => ({
    key,
    title: t(`consulting.items.${key}.title`),
    desc: t(`consulting.items.${key}.desc`),
  }));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <JsonLd data={consultingServicesLd(lang, services)} />
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="outline-none">

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="container mx-auto text-center relative z-10 animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            {t("consulting.badge")}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter max-w-5xl mx-auto">
            {t("consulting.h1a")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">{t("consulting.h1b")}</span>
          </h1>
          <p className="text-lg text-neutral-200 max-w-3xl mx-auto font-medium leading-relaxed mb-10">
            {t("consulting.lead")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={L("/contato")} className="button-custom">
              <div className="points_wrapper">
                <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
              </div>
              <span className="inner flex items-center gap-2">{t("consulting.ctaPrimary")} <ArrowRight className="w-4 h-4" /></span>
            </Link>
            <a
              href="#como-trabalhamos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500 transition-colors font-medium text-sm"
            >
              {t("consulting.ctaSecondary")}
            </a>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section aria-labelledby="servicos" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll">
            <h2 id="servicos" className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              {t("consulting.servicesTitle")}
            </h2>
            <p className="text-white/60 text-lg">{t("consulting.servicesLead")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-on-scroll">
            {CONSULTING_KEYS.map((key) => {
              const Icon = CONSULTING_ICONS[key];
              return (
                <article
                  key={key}
                  id={key}
                  className="scroll-mt-28 bg-neutral-900 border border-white/10 rounded-2xl p-8 flex flex-col hover:border-orange-500/40 transition-colors duration-300"
                >
                  <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                    <Icon className="w-6 h-6 text-orange-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{t(`consulting.items.${key}.title`)}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6">{t(`consulting.items.${key}.desc`)}</p>
                  <dl className="mt-auto space-y-3 pt-6 border-t border-white/5 text-sm">
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-widest text-orange-400/90 mb-1">
                        {t("consulting.deliverablesLabel")}
                      </dt>
                      <dd className="text-neutral-300 leading-relaxed">{t(`consulting.items.${key}.deliverables`)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-widest text-orange-400/90 mb-1">
                        {t("consulting.formatLabel")}
                      </dt>
                      <dd className="text-neutral-300">{t(`consulting.items.${key}.format`)}</dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Por que a CyDef */}
      <section aria-labelledby="por-que" className="py-24 px-4 bg-white/[0.02] border-y border-white/5 relative">
        <div className="container mx-auto max-w-7xl">
          <h2 id="por-que" className="text-4xl md:text-5xl font-bold text-white mb-16 text-center tracking-tighter animate-on-scroll">
            {t("consulting.whyTitle")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-on-scroll">
            {why.map((item, i) => {
              const Icon = whyIcons[i] ?? Shield;
              const link = whyLinks[i];
              const card = (
                <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-7 h-full hover:border-orange-500/30 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-orange-400 mb-5" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
              return link ? (
                <Link key={item.title} to={L(link)} className="block">
                  {card}
                </Link>
              ) : (
                <div key={item.title}>{card}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Como trabalhamos */}
      <section id="como-trabalhamos" aria-labelledby="como-trabalhamos-titulo" className="scroll-mt-24 py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-on-scroll">
            <h2 id="como-trabalhamos-titulo" className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              {t("consulting.howTitle")}
            </h2>
            <p className="text-white/60 text-lg">{t("consulting.howLead")}</p>
          </div>
          <ol className="grid md:grid-cols-4 gap-6 animate-on-scroll">
            {steps.map((step, i) => (
              <li key={step.title} className="relative bg-neutral-900 border border-white/10 rounded-2xl p-7">
                <span className="block font-display text-4xl font-bold text-orange-500/80 mb-4" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Formatos de contratação */}
      <section aria-labelledby="formatos" className="py-24 px-4 bg-white/[0.02] border-y border-white/5 relative">
        <div className="container mx-auto max-w-6xl">
          <h2 id="formatos" className="text-4xl md:text-5xl font-bold text-white mb-16 text-center tracking-tighter animate-on-scroll">
            {t("consulting.formatsTitle")}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 animate-on-scroll">
            {formats.map((f) => (
              <div key={f.title} className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-3">{f.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-neutral-400 mt-10">{t("consulting.formatsNote")}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/5 blur-[150px] -z-10 pointer-events-none"></div>
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-3xl p-12 md:p-20 text-center relative backdrop-blur-md animate-on-scroll">
            <Shield className="h-16 w-16 text-orange-500 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              {t("consulting.ctaTitle")}
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              {t("consulting.ctaBody")}
            </p>
            <Link to={L("/contato")} className="button-custom inline-flex">
              <div className="points_wrapper">
                <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
              </div>
              <span className="inner flex items-center gap-2">{t("consulting.ctaButton")} <ArrowRight className="w-4 h-4" /></span>
            </Link>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default Consulting;
