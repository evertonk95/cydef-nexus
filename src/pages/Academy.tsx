import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { L } from "@/lib/lang";
import { LANDING_PATH } from "@/lib/config";
import {
  GraduationCap,
  ArrowRight,
  Clock,
  CheckCircle,
  BookOpen,
  Compass,
} from "lucide-react";

const Academy = () => {
  useScrollReveal();
  const { t } = useTranslation();

  const slugById: Record<string, string> = {
    fundamentals: "cybersecurity-fundamentals",
    soc: "soc-analyst",
    blue: "blue-team-advanced",
    sc900: "sc-900-prep",
    secplus: "security-plus-prep",
    malware: "malware-analysis",
    incident: "incident-investigation",
  };

  const courses = [
    { id: "fundamentals", levelKey: "beginner", duration: "40h", available: true },
    { id: "soc", levelKey: "intermediate", duration: "80h", available: true },
    { id: "blue", levelKey: "advanced", duration: "60h", available: true },
    { id: "sc900", levelKey: "beginner", duration: "30h", available: false },
    { id: "secplus", levelKey: "intermediate", duration: "50h", available: false },
    { id: "malware", levelKey: "intermediate", duration: "40h", available: false },
    { id: "incident", levelKey: "advanced", duration: "45h", available: false },
  ];

  const benefits = t("academy.benefits", { returnObjects: true }) as { title: string; desc: string }[];
  const features = t("academy.features", { returnObjects: true }) as { title: string; desc: string }[];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="outline-none">

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="container mx-auto text-center relative z-10 animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium mb-6">
            <GraduationCap className="h-4 w-4" />
            {t("academy.badge")}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            CyDef <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">Academy</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto font-medium">
            {t("academy.lead")}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <a href="#cursos" className="inline-block">
              <button className="button-custom" type="button">
                <div className="points_wrapper">
                  <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                </div>
                <span className="inner flex items-center gap-2">{t("academy.ctaCourses")} <ArrowRight className="w-4 h-4" /></span>
              </button>
            </a>
            <Link to={L(LANDING_PATH)} className="inline-block">
              <button className="px-6 py-4 rounded-lg border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500 transition-colors font-medium text-sm" type="button">
                {t("academy.ctaFree")} <ArrowRight className="w-4 h-4 inline ml-1" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              {t("academy.whyTitle")}
            </h2>
            <p className="text-white/60 text-lg">{t("academy.whyLead")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-on-scroll">
            {benefits.map((item, i) => (
              <div key={i} className="bg-neutral-900 border border-white/10 rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 text-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
                  <CheckCircle className="h-7 w-7 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="cursos" className="py-24 px-4 bg-white/[0.02] border-y border-white/5 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-10 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              {t("academy.coursesTitle")}
            </h2>
            <p className="text-white/60 text-lg">{t("academy.coursesLead")}</p>
          </div>

          {/* Acesso gratuito */}
          <Link to={L(LANDING_PATH)} className="block mb-10 group animate-on-scroll">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 md:p-8 hover:border-orange-500/60 transition-colors">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 text-orange-400 text-xs font-semibold tracking-widest uppercase mb-2">
                  <GraduationCap className="h-4 w-4" /> {t("academy.freeBannerTag")}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">{t("academy.freeBannerTitle")}</h3>
                <p className="text-white/60 text-sm mt-1">{t("academy.freeBannerBody")}</p>
              </div>
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-semibold text-sm transition-colors shrink-0">
                {t("academy.freeBannerCta")} <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-on-scroll">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)] transition-all duration-300 group flex flex-col h-full"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {t(`academy.level.${course.levelKey}`)}
                  </span>
                  <span className="px-3 py-1 bg-white/10 text-neutral-300 border border-white/15 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {t("academy.prep")}
                  </span>
                  <div className="flex items-center gap-1 text-neutral-400 text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-orange-400 transition-colors">
                  {t(`academy.courses.${course.id}`)}
                </h3>

                <p className="text-neutral-400 text-sm leading-relaxed mb-6 flex-grow">
                  {t(`academy.descs.${course.id}`)}
                </p>

                {course.available ? (
                  <Link
                    to={L(`/cursos/${slugById[course.id]}`)}
                    className="mt-auto block w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-white/10"
                  >
                    {t("academy.details")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <div
                    className="mt-auto block w-full py-3 bg-white/[0.03] text-neutral-500 font-medium rounded-lg flex items-center justify-center gap-2 border border-white/5"
                    aria-disabled="true"
                  >
                    {t("academy.prepCta")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-4xl animate-on-scroll">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              {t("academy.featuresTitle")}
            </h2>
          </div>

          <div className="space-y-6">
            {features.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-6 bg-neutral-900 border border-white/10 rounded-2xl hover:border-orange-500/30 transition-colors">
                <Compass className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-neutral-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/5 blur-[150px] -z-10 pointer-events-none"></div>
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-3xl p-12 md:p-20 text-center relative backdrop-blur-md animate-on-scroll">
            <BookOpen className="h-16 w-16 text-orange-500 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              {t("academy.ctaTitle")}
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              {t("academy.ctaBody")}
            </p>
            <Link to={L(LANDING_PATH)} className="inline-block">
              <button className="button-custom" type="button">
                <div className="points_wrapper">
                  <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                </div>
                <span className="inner flex items-center gap-2">{t("academy.talk")} <ArrowRight className="w-4 h-4" /></span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default Academy;
