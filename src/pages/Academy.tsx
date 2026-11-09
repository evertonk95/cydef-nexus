import type { ReactNode } from "react";
import { PrimaryCta } from "@/components/academy/PrimaryCta";
import { badgeFree, badgeNeutral, badgeOrange, focusRing } from "@/components/academy/ctaStyles";
import { freeCourseArt } from "@/lib/academy/art";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { academyCatalog, type AcademyCourseCard } from "@/lib/academy/catalog";
import { COURSES } from "@/pages/AcademyLanding/data";
import { COURSES_EN } from "@/pages/AcademyLanding/data.en";
import { COURSES_ES } from "@/pages/AcademyLanding/data.es";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { L, currentLang } from "@/lib/lang";
import { LANDING_PATH, isCaptureEnabled } from "@/lib/config";
import {
  GraduationCap,
  ArrowRight,
  Clock,
  CreditCard,
  MailCheck,
  ShieldCheck,
  Home,
  BookOpen,
  Route,
  BarChart3,
  PlayCircle,
} from "lucide-react";

/**
 * Home da CyDef Academy (redesenho de 09/11/2026).
 * Regras: so dado real (cursos gratuitos vem da landing, catalogo de catalog.ts),
 * estados honestos, sem pessoas, depoimentos ou precos.
 */

interface FreeCourse {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  topics: readonly string[];
}

/** Etapas da trilha: ids reais do catalogo, na ordem de progressao. */
const TRAIL_IDS = ["fundamentals", "soc", "blue"] as const;

const SectionHeader = ({ id, title, lead, aside }: { id: string; title: string; lead: string; aside?: ReactNode }) => (
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
    <div className="max-w-2xl">
      <h2 id={id} className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-3">
        {title}
      </h2>
      <p className="text-neutral-400 text-lg leading-relaxed">{lead}</p>
    </div>
    {aside}
  </div>
);

/** Prévia ilustrativa da area do aluno, montada com os cursos gratuitos reais. */
const StudentAreaPreview = ({ course }: { course: FreeCourse }) => {
  const { t } = useTranslation();
  const nav = t("academy.mock.nav", { returnObjects: true }) as string[];
  const navIcons = [Home, BookOpen, Route, BarChart3];

  return (
    <div role="img" aria-label={t("academy.mock.label")} className="relative w-full max-w-xl mx-auto lg:mx-0">
      <div aria-hidden="true" className="absolute -inset-8 bg-orange-500/15 blur-[80px] rounded-full pointer-events-none" />
      <div aria-hidden="true" className="relative">
        <div className="rounded-t-2xl border border-white/10 bg-neutral-950 p-2 shadow-2xl shadow-black/60">
          <div className="rounded-xl border border-white/5 bg-[#0b0b0b] overflow-hidden grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] min-h-[260px] sm:min-h-[300px]">
            <div className="border-r border-white/5 p-3 sm:p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 mb-4">
                <img src="/assets/cydef-icon.webp" alt="" width={18} height={18} className="w-[18px] h-[18px]" />
                <span className="text-[11px] font-semibold text-white">
                  CyDef <span className="text-orange-400">Academy</span>
                </span>
              </div>
              {nav.map((label, i) => {
                const Icon = navIcons[i] ?? Home;
                return (
                  <span
                    key={label}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] sm:text-[11px] ${
                      i === 0 ? "bg-orange-500/15 text-orange-300 border border-orange-500/30" : "text-neutral-400"
                    }`}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    {label}
                  </span>
                );
              })}
            </div>
            <div className="p-3 sm:p-5 flex flex-col gap-4">
              <div className="rounded-lg border border-white/10 bg-neutral-900 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-orange-400" />
                  <span className="text-[10px] sm:text-[11px] text-neutral-400">{t("academy.mock.continue")}</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white mb-3">{course.title}</p>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500" />
                </div>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 mb-2">{t("academy.mock.next")}</p>
                <ul className="flex flex-col gap-2">
                  {course.topics.slice(0, 3).map((topic) => (
                    <li
                      key={topic}
                      className="flex items-center gap-2 rounded-md border border-white/5 bg-white/[0.03] px-2.5 py-2 text-[10px] sm:text-[11px] text-neutral-200"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="h-3 -mx-[4%] rounded-b-xl bg-gradient-to-b from-neutral-700 to-neutral-900 border-x border-b border-white/10" />
      </div>
    </div>
  );
};

const FreeCourseCard = ({ course, open }: { course: FreeCourse; open: boolean }) => {
  const { t } = useTranslation();
  const art = freeCourseArt[course.id];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-orange-500/30 bg-neutral-900 shadow-[0_0_40px_-12px_rgba(249,115,22,0.35)] hover:border-orange-500/60 transition-colors duration-200">
      {art ? (
        <div className="relative aspect-[16/7] overflow-hidden bg-neutral-950">
          <img
            src={art}
            alt=""
            width={800}
            height={350}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent" />
        </div>
      ) : null}
      <div className="flex flex-col gap-4 p-5 sm:p-6 md:p-8 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={badgeFree}>
            {t("academy.freeTag")}
          </span>
          <span className={open ? badgeOrange : badgeNeutral}>{open ? t("academy.freeOpen") : t("academy.freeSoon")}</span>
          <span className={badgeNeutral}>{course.level}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-sm text-neutral-400">
            <Clock className="w-4 h-4" aria-hidden="true" />
            {course.duration}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight">{course.title}</h3>
        <p className="text-neutral-400 leading-relaxed">{course.description}</p>
        <ul className="flex flex-wrap gap-2">
          {course.topics.map((topic) => (
            <li key={topic} className="px-3 py-1 rounded-full text-xs text-neutral-300 bg-white/5 border border-white/10">
              {topic}
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-2">
          <PrimaryCta to={L(LANDING_PATH)}>{t("academy.ctaPrimary")}</PrimaryCta>
        </div>
      </div>
    </article>
  );
};

const CatalogCard = ({ course }: { course: AcademyCourseCard }) => {
  const { t } = useTranslation();
  return (
    <article className="group bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/40 transition-colors duration-200 flex flex-col h-full">
      <div className="mb-5">
        <span className={badgeOrange}>{t(`academy.level.${course.levelKey}`)}</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-3 leading-tight">{t(`academy.courses.${course.id}`)}</h3>
      <p className="text-neutral-400 text-sm leading-relaxed mb-6 flex-grow">{t(`academy.descs.${course.id}`)}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 mb-5">
        <span className="inline-flex items-center gap-1.5 text-neutral-400 text-sm">
          <Clock className="w-4 h-4" aria-hidden="true" />
          {course.duration}
        </span>
        <span className={badgeNeutral}>{t("academy.prep")}</span>
      </div>
      {course.available ? (
        <Link
          to={L(`/cursos/${course.slug}`)}
          className={`mt-auto inline-flex items-center gap-2 text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors duration-200 rounded ${focusRing}`}
        >
          {t("academy.details")}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true" />
        </Link>
      ) : (
        <span className="mt-auto text-sm font-medium text-neutral-500" aria-disabled="true">
          {t("academy.prepCta")}
        </span>
      )}
    </article>
  );
};

const Academy = () => {
  useScrollReveal();
  const { t } = useTranslation();
  const lang = currentLang();

  const freeCourses: readonly FreeCourse[] = lang === "en" ? COURSES_EN : lang === "es" ? COURSES_ES : COURSES;
  const captureOpen = isCaptureEnabled();
  const trust = t("academy.trust", { returnObjects: true }) as string[];
  const trustIcons = [CreditCard, MailCheck, ShieldCheck];
  const principlesRaw = t("home.principles", { returnObjects: true }) as { title: string; desc: string }[] | string;
  const principles = Array.isArray(principlesRaw) ? principlesRaw : [];
  const trail = TRAIL_IDS.map((id) => academyCatalog.find((c) => c.id === id)).filter(
    (c): c is AcademyCourseCard => Boolean(c),
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section aria-labelledby="academy-h1" className="relative isolate overflow-hidden pt-32 md:pt-40 pb-20 md:pb-28 px-2 sm:px-6">
          <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none">
            <img
              alt=""
              className="w-full h-full object-cover opacity-40"
              src="/assets/cydef-hero-bg.webp"
              srcSet="/assets/cydef-hero-bg-960.webp 960w, /assets/cydef-hero-bg.webp 1920w"
              sizes="100vw"
              loading="eager"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,_rgba(5,5,5,0.35)_0%,_rgba(5,5,5,0.75)_55%,_rgba(5,5,5,0.95)_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/60 to-[#050505]" />
          </div>

          <div className="container mx-auto max-w-7xl grid lg:grid-cols-[1.05fr_1fr] gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
                <span className="text-xs font-bold tracking-widest uppercase text-orange-500/90">{t("academy.badge")}</span>
              </div>
              <h1 id="academy-h1" className="text-5xl md:text-6xl leading-[0.95] tracking-tighter font-medium text-white mb-8">
                {t("academy.heroH1a")}
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600">
                  {t("academy.heroH1b")}
                </span>
              </h1>
              <p className="text-lg md:text-xl leading-relaxed text-neutral-300 max-w-xl mb-10">{t("academy.heroLead")}</p>
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <PrimaryCta to={L(LANDING_PATH)}>{t("academy.ctaPrimary")}</PrimaryCta>
                <a
                  href="#cursos"
                  className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500 transition-colors duration-200 font-medium text-sm ${focusRing}`}
                >
                  {t("academy.ctaCourses")}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-3">
                {trust.map((item, i) => {
                  const Icon = trustIcons[i] ?? ShieldCheck;
                  return (
                    <li key={item} className="inline-flex items-center gap-2 text-sm text-neutral-300">
                      <Icon className="w-4 h-4 text-orange-400" aria-hidden="true" />
                      {item}
                    </li>
                  );
                })}
              </ul>
            </div>
            {freeCourses[0] ? <StudentAreaPreview course={freeCourses[0]} /> : null}
          </div>
        </section>

        {/* Cursos gratuitos de entrada */}
        <section id="gratuito" aria-labelledby="academy-gratuito" className="py-24 md:py-32 px-2 sm:px-6 border-t border-white/5">
          <div className="container mx-auto max-w-7xl animate-on-scroll">
            <SectionHeader id="academy-gratuito" title={t("academy.freeTitle")} lead={t("academy.freeLead")} />
            <div className="grid md:grid-cols-2 gap-6">
              {freeCourses.map((course) => (
                <FreeCourseCard key={course.id} course={course} open={captureOpen} />
              ))}
            </div>
          </div>
        </section>

        {/* Proximos cursos */}
        <section id="cursos" aria-labelledby="academy-cursos" className="py-24 md:py-32 px-2 sm:px-6 bg-white/[0.02] border-y border-white/5">
          <div className="container mx-auto max-w-7xl animate-on-scroll">
            <SectionHeader id="academy-cursos" title={t("academy.coursesTitle")} lead={t("academy.coursesLead")} />
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {academyCatalog.map((course) => (
                <CatalogCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>

        {/* Trilha de progressao */}
        <section id="trilha" aria-labelledby="academy-trilha" className="py-24 md:py-32 px-6">
          <div className="container mx-auto max-w-7xl animate-on-scroll">
            <SectionHeader id="academy-trilha" title={t("academy.trailTitle")} lead={t("academy.trailLead")} />
            <div className="relative">
              <div
                aria-hidden="true"
                className="hidden md:block absolute top-6 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-orange-500/20 via-orange-500/70 to-orange-500/20"
              />
              <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
                {trail.map((course, i) => (
                  <li key={course.id} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
                    <span className="relative z-10 shrink-0 w-12 h-12 rounded-full border border-orange-500/60 bg-[#050505] flex items-center justify-center text-orange-400 font-semibold shadow-[0_0_20px_rgba(249,115,22,0.25)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-3 md:items-center">
                      <h3 className="text-xl font-bold text-white leading-tight">{t(`academy.courses.${course.id}`)}</h3>
                      <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">{t(`academy.descs.${course.id}`)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Como trabalhamos: mesmas quatro regras da home (mesma fonte de texto) */}
        {principles.length > 0 ? (
          <section aria-labelledby="academy-principios" className="py-24 md:py-32 px-2 sm:px-6 border-t border-white/5">
            <div className="container mx-auto max-w-7xl animate-on-scroll">
              <SectionHeader id="academy-principios" title={t("home.principlesTitle")} lead={t("home.principlesLead")} />
              <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {principles.map((item, i) => (
                  <li
                    key={item.title}
                    className="bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/40 transition-colors duration-200"
                  >
                    <span className="block text-3xl font-semibold tracking-tight text-orange-500 mb-4" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-lg font-semibold text-white mb-2 leading-snug">{item.title}</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed">{item.desc}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}

        {/* CTA final */}
        <section aria-labelledby="academy-cta" className="py-24 md:py-32 px-2 sm:px-6 relative overflow-hidden border-t border-white/5">
          <div className="container mx-auto max-w-4xl">
            <div className="relative overflow-hidden bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-3xl p-10 md:p-20 text-center animate-on-scroll">
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-orange-500/15 to-transparent pointer-events-none" />
              <h2 id="academy-cta" className="relative text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
                {t("academy.ctaTitle")}
              </h2>
              <p className="relative text-white/70 text-lg mb-10 max-w-2xl mx-auto">{t("academy.ctaBody")}</p>
              <div className="relative flex justify-center">
                <PrimaryCta to={L(LANDING_PATH)}>{t("academy.ctaPrimary")}</PrimaryCta>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Academy;
