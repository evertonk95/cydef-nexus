import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { ArrowRight, Shield, Newspaper, GraduationCap, FlaskConical, Microscope, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { L, waLink, currentLang } from "@/lib/lang";
import { fetchAcademyStats, isAcademyStatsAvailable, STATS_POLL_INTERVAL_MS } from "@/lib/academy/stats";
import { countPostsForLang } from "@/lib/blog/posts";

const Index = () => {
  useScrollReveal();
  const { t } = useTranslation();
  const [alunosMatriculados, setAlunosMatriculados] = useState<number | null>(null);

  // Contagem real de alunos matriculados na Academy (atualiza automático — polling).
  // Só roda quando a feature está habilitada no build (fail secure).
  useEffect(() => {
    if (!isAcademyStatsAvailable()) return;
    let ativo = true;
    const carregar = async () => {
      try {
        const stats = await fetchAcademyStats();
        if (ativo) setAlunosMatriculados(stats.matriculados);
      } catch {
        // Mantém o último valor exibido; sem quebrar a home se a API falhar.
      }
    };
    carregar();
    const interval = setInterval(carregar, STATS_POLL_INTERVAL_MS);
    return () => {
      ativo = false;
      clearInterval(interval);
    };
  }, []);

  const pilares = [
    { key: "media", icon: Newspaper, para: "/blog", ativo: true },
    { key: "academy", icon: GraduationCap, para: "/academy", ativo: true },
    { key: "labs", icon: FlaskConical, para: "/servicos", ativo: false },
    { key: "research", icon: Microscope, para: "/servicos", ativo: false },
    { key: "consulting", icon: Briefcase, para: "/servicos", ativo: false },
  ];

  return (
    <div className="text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30 flex flex-col min-h-screen relative">
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="outline-none">

      {/* background-image-overlay */}
      <div className="fixed top-0 right-0 bottom-0 left-0 pointer-events-none -z-20">
        <img alt="" className="w-full h-full object-cover opacity-65" src="/assets/cydef-hero-bg.webp" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-[#050505]/45 to-[#050505]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-[#050505]/0 to-[#050505]/0"></div>
      </div>

      {/* aura-background */}
      <div
        className="fixed top-0 w-full h-screen -z-10 hue-rotate-0 saturate-100 mix-blend-screen opacity-50"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-7xl mr-auto ml-auto relative z-10 pt-20">

        {/* hero */}
        <div className="flex-1 flex flex-col items-center justify-center pt-32 pb-16 px-6 text-center">
          <div className="inline-flex items-center gap-2 text-orange-500 mb-8 animate-on-scroll">
            <span className="flex h-2 w-2 rounded-full bg-orange-500"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-orange-500/80">{t("home.eyebrow")}</span>
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter text-white font-medium mb-8 animate-on-scroll max-w-5xl">
            {t("home.h1a")}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 block mt-2">{t("home.h1b")}</span>
          </h1>
          <p className="leading-relaxed text-lg md:text-xl font-medium text-white/60 max-w-2xl animate-on-scroll mb-12">
            {t("home.lead")}
          </p>
          <div className="flex flex-wrap justify-center gap-6 items-center animate-on-scroll">
            <a className="group isolate inline-flex cursor-pointer overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_10px_rgba(249,115,22,0.45)] bg-gradient-to-b from-white/20 via-white/0 to-white/5 rounded-full relative shadow-[0_0_25px_rgba(249,115,22,0.3),0_8px_40px_rgba(249,115,22,0.15)]" href={waLink(t("contact.waMsg"))} target="_blank" rel="noopener noreferrer">
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="absolute inset-[-100%] w-[300%] h-[300%] left-[-100%] top-[-100%] animate-[spin_3s_linear_infinite]" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 80deg, rgba(253,186,116,0.8) 180deg, transparent 280deg, transparent 360deg)' }}></div>
              </div>
              <div className="absolute inset-[1px] rounded-full backdrop-blur-xl z-0 bg-neutral-950/90"></div>
              <div className="z-10 flex gap-3 sm:w-auto overflow-hidden text-sm font-medium text-white w-full rounded-full pt-3 pr-5 pb-3 pl-4 relative items-center">
                <div className="relative z-20 w-7 h-7 rounded-full bg-gradient-to-b from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="whitespace-nowrap relative z-10 font-medium tracking-tight text-base text-white/95 group-hover:text-white transition-colors">{t("home.ctaTalk")}</span>
                <span className="inline-flex items-center justify-center z-10 bg-white/10 w-6 h-6 rounded-full ml-1 relative group-hover:translate-x-0.5 transition-transform text-white/80 group-hover:text-white">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </a>
            <Link to={L("/academy")} className="inline-flex items-center gap-2 px-6 py-4 rounded-full border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500 transition-colors font-medium text-sm">
              {t("home.ctaFree")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ecossistema — 5 pilares com estado honesto */}
        <div className="md:px-10 mt-24 pt-16 pb-10 border-t border-white/5 relative z-20">
          <div className="text-center mb-12 animate-on-scroll">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter text-white mb-4">
              {t("home.ecoTitle")}
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              {t("home.ecoLead")}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-on-scroll">
            {pilares.map((p) => (
              <Link
                key={p.key}
                to={L(p.para)}
                className="bg-neutral-900 border border-white/10 rounded-2xl p-6 text-center hover:border-orange-500/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
                  <p.icon className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-orange-400 transition-colors">{t(`home.pillars.${p.key}.name`)}</h3>
                <p className="text-xs text-neutral-500 mb-3">{t(`home.pillars.${p.key}.role`)}</p>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                    p.ativo
                      ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                      : "bg-white/5 border-white/10 text-neutral-500"
                  }`}
                >
                  {t(`home.pillars.${p.key}.state`)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* stats — apenas números reais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-8 mt-20 pt-12 border-t border-white/5 pb-24 relative z-20">
          <div className="flex flex-col gap-2 items-center md:items-start animate-on-scroll">
            <div className="md:text-7xl lg:text-8xl leading-none text-6xl font-light text-white tracking-tighter">{countPostsForLang(currentLang())}</div>
            <div className="text-xl font-medium pl-1 text-neutral-400">{t("home.statArticles")}</div>
          </div>
          <div className="flex flex-col gap-2 items-center md:items-start animate-on-scroll">
            <div className="md:text-7xl lg:text-8xl leading-none text-6xl font-light text-white tracking-tighter">
              {isAcademyStatsAvailable()
                ? (alunosMatriculados !== null ? alunosMatriculados : "—")
                : "—"}
            </div>
            <div className="text-xl font-medium pl-1 text-neutral-400">{t("home.statStudents")}</div>
          </div>
        </div>

      </div>

      </main>
      <Footer />
    </div>
  );
};

export default Index;
