import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Clock, CreditCard, ExternalLink, GraduationCap, MailCheck, ShieldCheck } from "lucide-react";
import { PrimaryCtaContent } from "@/components/academy/PrimaryCta";
import { badgeFree, badgeOrange, focusRing, primaryCtaClass } from "@/components/academy/ctaStyles";
import { freeCourseArt } from "@/lib/academy/art";
import { COURSES, FAQ_ITEMS, STEPS } from "./data";
import { COURSES_EN, FAQ_ITEMS_EN, STEPS_EN } from "./data.en";
import { COURSES_ES, FAQ_ITEMS_ES, STEPS_ES } from "./data.es";
import { currentLang, L } from "@/lib/lang";
import { LANDING_PATH, privacyPath } from "@/lib/config";

const useContent = () => {
  useTranslation(); // assina troca de idioma
  const lang = currentLang();
  return {
    courses: lang === "en" ? COURSES_EN : lang === "es" ? COURSES_ES : COURSES,
    steps: lang === "en" ? STEPS_EN : lang === "es" ? STEPS_ES : STEPS,
    faq: lang === "en" ? FAQ_ITEMS_EN : lang === "es" ? FAQ_ITEMS_ES : FAQ_ITEMS,
  };
};

/** Referencias citadas nos cursos, cada uma com link para o site oficial do framework. */
const REFERENCES = [
  { label: "NIST", href: "https://www.nist.gov/cyberframework" },
  { label: "MITRE ATT&CK", href: "https://attack.mitre.org/" },
  { label: "CIS Controls", href: "https://www.cisecurity.org/controls" },
] as const;

const SectionTitle = ({ id, title, lead }: { id: string; title: string; lead?: string }) => (
  <div className="max-w-2xl mb-12">
    <h2 id={id} className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-3">
      {title}
    </h2>
    {lead ? <p className="text-neutral-400 text-lg leading-relaxed">{lead}</p> : null}
  </div>
);

/** Hero em duas colunas: proposta a esquerda, formulario de pre-inscricao a direita. */
export const Hero = ({ form }: { form: ReactNode }) => {
  const { t } = useTranslation();
  const trust = t("landing.trust", { returnObjects: true }) as string[];
  const trustIcons = [ShieldCheck, CreditCard, MailCheck];

  return (
    <section aria-labelledby="landing-h1" className="relative isolate overflow-hidden pt-32 md:pt-40 pb-20 md:pb-28 px-2 sm:px-6">
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

      <div className="container mx-auto max-w-7xl grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
            <span className="text-xs font-bold tracking-widest uppercase text-orange-500/90">{t("landing.badge")}</span>
          </div>
          <h1 id="landing-h1" className="text-[2.5rem] sm:text-5xl md:text-6xl leading-[0.95] tracking-tighter font-medium text-white mb-8">
            {t("landing.h1a")}{" "}
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600">
              {t("landing.h1b")}.
            </span>
          </h1>
          <p className="text-lg md:text-xl leading-relaxed text-neutral-300 max-w-xl mb-10">{t("landing.lead")}</p>
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
        <div className="relative">
          <div aria-hidden="true" className="absolute -inset-6 bg-orange-500/10 blur-[70px] rounded-full pointer-events-none" />
          <div className="relative">{form}</div>
        </div>
      </div>
    </section>
  );
};

export const Courses = () => {
  const { t } = useTranslation();
  const { courses } = useContent();
  return (
    <section aria-labelledby="o-que-voce-recebe" className="py-24 md:py-32 px-2 sm:px-6 border-t border-white/5">
      <div className="container mx-auto max-w-7xl">
        <SectionTitle id="o-que-voce-recebe" title={t("landing.coursesTitle")} lead={t("landing.coursesLead")} />
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const art = freeCourseArt[course.id];
            return (
              <article
                key={course.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 hover:border-orange-500/40 transition-colors duration-200"
              >
                {art ? (
                  <div className="relative aspect-[16/7] overflow-hidden bg-neutral-950">
                    <img src={art} alt="" width={800} height={350} loading="lazy" decoding="async" className="w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/20 to-transparent" />
                  </div>
                ) : null}
                <div className="flex flex-col gap-4 p-5 sm:p-6 md:p-8 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={badgeFree}>{t("academy.freeTag")}</span>
                    <span className={badgeOrange}>{course.level}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-sm text-neutral-400">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                      {course.duration}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{course.title}</h3>
                  <p className="text-neutral-400 leading-relaxed">{course.description}</p>
                  <ul className="mt-auto flex flex-wrap gap-2 pt-2">
                    {course.topics.map((topic) => (
                      <li key={topic} className="px-3 py-1 rounded-full text-xs text-neutral-300 bg-white/5 border border-white/10">
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const HowItWorks = () => {
  const { t } = useTranslation();
  const { steps } = useContent();
  return (
    <section aria-labelledby="como-funciona" className="py-24 md:py-32 px-2 sm:px-6 bg-white/[0.02] border-y border-white/5">
      <div className="container mx-auto max-w-7xl">
        <SectionTitle id="como-funciona" title={t("landing.howTitle")} />
        <div className="relative">
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-6 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-orange-500/20 via-orange-500/70 to-orange-500/20"
          />
          <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-5 md:flex-col md:items-center md:text-center">
                <span className="relative z-10 shrink-0 w-12 h-12 rounded-full border border-orange-500/60 bg-[#0a0a0a] flex items-center justify-center text-orange-400 font-semibold shadow-[0_0_20px_rgba(249,115,22,0.25)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-2 md:items-center">
                  <h3 className="text-xl font-bold text-white leading-tight">{step.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export const Proof = () => {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="por-que-cydef" className="py-24 md:py-32 px-2 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center rounded-3xl border border-white/10 bg-neutral-900 p-6 sm:p-8 md:p-12">
          <div>
            <ShieldCheck className="h-10 w-10 text-orange-400 mb-6" aria-hidden="true" />
            <h2 id="por-que-cydef" className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tighter">
              {t("landing.proofTitle")}
            </h2>
            <p className="text-neutral-400 leading-relaxed">{t("landing.proofBody")}</p>
          </div>
          <div className="lg:border-l lg:border-white/10 lg:pl-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">{t("landing.refsLabel")}</p>
            <ul className="flex flex-col gap-3">
              {REFERENCES.map((ref) => (
                <li key={ref.label}>
                  <a
                    href={ref.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center justify-between gap-3 rounded-xl border border-orange-500/30 bg-orange-500/5 px-5 py-3 font-mono text-base text-orange-300 hover:border-orange-500/70 hover:bg-orange-500/10 transition-colors duration-200 ${focusRing}`}
                  >
                    <span>{ref.label}</span>
                    <ExternalLink className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity duration-200" aria-hidden="true" />
                    <span className="sr-only">{t("landing.newTab")}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Faq = () => {
  const { t } = useTranslation();
  const { faq } = useContent();
  return (
    <section aria-labelledby="faq" className="py-24 md:py-32 px-2 sm:px-6 bg-white/[0.02] border-y border-white/5">
      <div className="container mx-auto max-w-3xl">
        <h2 id="faq" className="text-4xl md:text-5xl font-bold text-white mb-10 tracking-tighter">
          {t("landing.faqTitle")}
        </h2>
        <Accordion type="single" collapsible className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-5 sm:px-6">
          {faq.map((item, i) => (
            <AccordionItem key={item.question} value={`item-${i}`} className="border-white/10 last:border-b-0">
              <AccordionTrigger className="text-left text-white hover:no-underline hover:text-orange-300 data-[state=open]:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-neutral-400 leading-relaxed">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

/** CTA final: leva de volta ao formulario do topo. */
export const FinalCta = () => {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="landing-cta" className="py-24 md:py-32 px-2 sm:px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-10 md:p-16 text-center">
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-orange-500/15 to-transparent pointer-events-none" />
          <h2 id="landing-cta" className="relative text-3xl md:text-5xl font-bold text-white mb-5 tracking-tighter">
            {t("landing.finalTitle")}
          </h2>
          <p className="relative text-white/70 text-lg mb-10 max-w-2xl mx-auto">{t("landing.finalBody")}</p>
          <div className="relative flex justify-center">
            <a href="#pre-inscricao" className={primaryCtaClass}>
              <PrimaryCtaContent>{t("landing.cta")}</PrimaryCtaContent>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

/** Faixa de links da landing (o Aviso de Privacidade versionado fica sempre acessivel). */
export const LandingFooter = () => {
  const { t } = useTranslation();
  return (
    <div className="border-t border-white/5 py-6 px-2 sm:px-6">
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-orange-400" aria-hidden="true" />
          <span className="font-medium text-neutral-400">
            CyDef <span className="text-orange-400">Academy</span>
          </span>
        </div>
        <nav aria-label={t("landing.footerNavLabel")} className="flex flex-wrap items-center justify-center gap-6">
          <Link to={L("/contato")} className={`hover:text-white transition-colors duration-200 rounded ${focusRing}`}>
            {t("landing.footerContact")}
          </Link>
          <Link to={L(privacyPath())} className={`hover:text-white transition-colors duration-200 rounded ${focusRing}`}>
            {t("landing.footerPrivacy")}
          </Link>
          <Link to={L(LANDING_PATH)} className={`hover:text-white transition-colors duration-200 rounded ${focusRing}`}>
            {t("landing.footerPre")}
          </Link>
        </nav>
      </div>
    </div>
  );
};
