import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Database,
  Fingerprint,
  FolderClosed,
  GitBranch,
  Inbox,
  KeyRound,
  Layers,
  Lightbulb,
  Lock,
  MessagesSquare,
  Radar,
  ScrollText,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Webhook,
  Zap,
  Cloud,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Pledge } from "@/components/Pledge";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { L, currentLang } from "@/lib/lang";
import { JsonLd } from "@/lib/seo";
import { inoraSoftwareLd } from "@/lib/seo-data";
import {
  AlertQueueMock,
  AnalysisMock,
  ApprovalMock,
  CaseTimelineMock,
  ChangesMock,
  HeroDashboard,
  InoraLockup,
  KbMock,
  KpiMock,
  MsspMock,
  SearchMock,
} from "@/components/inora/Mockups";

type Item = { title: string; desc: string };
type Faq = { q: string; a: string };

const CONTACT_EMAIL = "contato@cydef.com.br";
const mailto = (subject: string, body?: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}` +
  (body ? `&body=${encodeURIComponent(body)}` : "");

/** Botão principal no padrão do site (pílula escura com brilho laranja). */
const PrimaryCta = ({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) => (
  <a href={href} className={`button-custom ${className}`}>
    <div className="points_wrapper">
      <i className="point"></i>
      <i className="point"></i>
      <i className="point"></i>
      <i className="point"></i>
    </div>
    <span className="inner flex items-center gap-2">
      {children} <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </span>
  </a>
);

/** Botão laranja sólido, usado onde a ação precisa de mais peso (planos, CTA final). */
const SolidCta = ({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) => (
  <a
    href={href}
    className={`inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-black shadow-[0_8px_26px_-8px_rgba(249,115,22,0.65)] transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-[0_14px_36px_-10px_rgba(249,115,22,0.75)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 ${className}`}
  >
    {children}
  </a>
);

const GhostCta = ({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) => (
  <a
    href={href}
    className={`inline-flex items-center justify-center gap-2 rounded-full border border-orange-500/40 px-6 py-3 text-sm font-medium text-orange-300 transition-colors duration-200 hover:border-orange-500 hover:bg-orange-500/10 ${className}`}
  >
    {children}
  </a>
);

const SectionTitle = ({ id, children, lead, eyebrow }: { id: string; children: ReactNode; lead?: string; eyebrow?: string }) => (
  <div className="mx-auto mb-14 max-w-3xl text-center animate-on-scroll">
    {eyebrow ? (
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-orange-400">{eyebrow}</p>
    ) : null}
    <h2 id={id} className="mb-5 text-4xl md:text-5xl font-bold tracking-tighter text-white">
      {children}
    </h2>
    {lead ? <p className="text-lg text-white/60">{lead}</p> : null}
  </div>
);

/** Card de recurso do bento: título, descrição e a tela ilustrativa. */
const FeatureCard = ({
  title,
  desc,
  children,
  className = "",
  fill = false,
}: {
  title: string;
  desc: string;
  children: ReactNode;
  className?: string;
  /** A tela ocupa a altura que sobra no card (card que ocupa duas linhas). */
  fill?: boolean;
}) => (
  <article
    className={`group flex flex-col rounded-2xl border border-white/10 bg-neutral-900/70 p-5 transition-colors duration-300 hover:border-orange-500/40 ${className}`}
  >
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="mb-5 mt-1.5 text-sm leading-relaxed text-neutral-400">{desc}</p>
    <div className={fill ? "flex flex-1 flex-col" : "mt-auto"}>{children}</div>
  </article>
);

const HOW_ICONS: LucideIcon[] = [Inbox, Target, Search, Zap, BookOpen];
const PAIN_ICONS: LucideIcon[] = [BellRing, Users, Layers];
const SECURITY_ICONS: LucideIcon[] = [KeyRound, Fingerprint, Database, ScrollText, ShieldCheck, Lock];

// CyDef Inora: página comercial (decisão do Everton, 16/11/2026). Rota no site
// principal; o subdomínio fica reservado para a aplicação em nuvem. Sem preço,
// sem prazo de atendimento, sem logo de cliente e sem métrica de resultado: os
// números das telas são dados de demonstração (aviso abaixo do hero).
const Inora = () => {
  useScrollReveal();
  const { t } = useTranslation();
  const lang = currentLang();
  const s = (key: string) => String(t(`inora.${key}`));
  const list = <V,>(key: string) => t(`inora.${key}`, { returnObjects: true }) as V[];

  const demoHref = mailto(s("mail.demoSubject"), s("mail.demoBody"));
  const proposalHref = (plan: string) =>
    mailto(String(t("inora.mail.proposalSubject", { plan })), s("mail.proposalBody"));

  const chips = list<string>("chips");
  const steps = list<Item>("how.steps");
  const pains = list<Item>("pain.items");
  const security = list<Item>("security.items");
  const msspBullets = list<string>("mssp.bullets");
  const faqs = list<Faq>("faq.items");

  const subnav: [string, string][] = [
    ["plataforma", s("subnav.platform")],
    ["recursos", s("subnav.features")],
    ["integracoes", s("subnav.integrations")],
    ["mssp", s("subnav.mssp")],
    ["seguranca", s("subnav.security")],
    ["planos", s("subnav.plans")],
    ["faq", s("subnav.faq")],
  ];

  const integrations: [string, LucideIcon, string, boolean][] = [
    ["Wazuh", Radar, s("integrations.kinds.siem"), true],
    ["VirusTotal", ShieldCheck, s("integrations.kinds.reputation"), false],
    ["AbuseIPDB", Target, s("integrations.kinds.reputation"), false],
    ["MISP", GitBranch, s("integrations.kinds.intel"), false],
    ["Webhooks", Webhook, s("integrations.kinds.notify"), false],
    [s("integrations.api"), Code2, s("integrations.kinds.api"), false],
    ["SSO OIDC", KeyRound, s("integrations.kinds.sso"), false],
  ];
  const soonIntegrations = ["Elastic Security", "Microsoft Sentinel", "Splunk", "QRadar", "CrowdStrike", "Suricata"];

  const plans: { key: "installed" | "mssp" | "cloud"; icon: LucideIcon; highlight?: boolean; soon?: boolean }[] = [
    { key: "installed", icon: Server },
    { key: "mssp", icon: Building2, highlight: true },
    { key: "cloud", icon: Cloud, soon: true },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-clip selection:bg-orange-500/30">
      <JsonLd data={inoraSoftwareLd(lang, s("lead"))} />
      <Navigation />

      {/* Navegação da página do produto: fica presa logo abaixo do menu do site. */}
      <div className="sticky top-[69px] z-40 mt-[69px] border-b border-white/5 bg-[#050505]/85 backdrop-blur-md">
        <div className="container mx-auto flex items-center gap-6 px-6 py-2.5 md:px-10">
          <a href="#plataforma" className="shrink-0" aria-label="CyDef Inora">
            <InoraLockup size="sm" />
          </a>
          <nav aria-label={s("subnav.label")} className="hidden lg:block min-w-0">
            <ul className="flex items-center gap-5">
              {subnav.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-xs font-medium text-neutral-400 transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href={demoHref}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-orange-500 px-4 py-1.5 text-xs font-semibold text-black shadow-[0_6px_20px_-8px_rgba(249,115,22,0.7)] transition-colors hover:bg-orange-400"
          >
            {s("ctaDemo")}
          </a>
        </div>
      </div>

      <main id="conteudo" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section id="plataforma" aria-labelledby="inora-titulo" className="relative scroll-mt-32 overflow-hidden px-4 pb-20 pt-14 md:pt-20">
          <div className="pointer-events-none absolute right-[-10%] top-0 -z-10 h-[620px] w-[720px] rounded-full bg-orange-500/[0.13] blur-[140px]" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background-image:radial-gradient(rgba(249,115,22,0.35)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_70%_30%,black,transparent_65%)]"
            aria-hidden="true"
          />
          <div className="container mx-auto grid grid-cols-1 max-w-7xl items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-orange-400">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {s("badge")}
              </div>
              <h1 id="inora-titulo" className="mb-6 text-display-lg font-bold text-white">
                {s("h1a")}
                <br />
                <span className="text-orange-500">{s("h1b")}</span>
              </h1>
              <p className="mb-4 text-2xl font-semibold leading-snug tracking-tight text-neutral-200 md:text-[1.7rem]">
                {s("sub")}
              </p>
              <p className="mb-9 max-w-xl text-lg leading-relaxed text-neutral-400">{s("lead")}</p>
              <div className="mb-9 flex flex-wrap gap-4">
                <PrimaryCta href={demoHref}>{s("ctaDemo")}</PrimaryCta>
                <GhostCta href="#recursos">{s("ctaPlatform")}</GhostCta>
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-neutral-400">
                {chips.map((chip, i) => {
                  const Icon = [Radar, Server, Building2][i] ?? Check;
                  return (
                    <li key={chip} className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4 text-orange-400" aria-hidden="true" />
                      {chip}
                    </li>
                  );
                })}
              </ul>
            </div>
            <figure className="relative">
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-orange-500/10 blur-3xl" aria-hidden="true" />
              <div className="lg:[transform:perspective(2000px)_rotateY(-12deg)_rotateX(4deg)] lg:origin-left transition-transform duration-500 ease-out lg:hover:[transform:perspective(2000px)_rotateY(-6deg)_rotateX(2deg)] motion-reduce:transition-none">
                <div className="rounded-2xl border border-orange-500/25 p-1 shadow-[0_0_80px_-20px_rgba(249,115,22,0.55)]">
                  <HeroDashboard />
                </div>
              </div>
              <figcaption className="mt-4 text-center text-xs text-neutral-500 lg:text-right">{s("mockNote")}</figcaption>
            </figure>
          </div>
        </section>

        {/* Como funciona */}
        <section aria-labelledby="como-funciona" className="border-y border-white/5 bg-white/[0.02] px-4 py-20">
          <div className="container mx-auto max-w-6xl">
            <SectionTitle id="como-funciona" eyebrow={s("how.eyebrow")}>
              {s("how.title")}
            </SectionTitle>
            <ol className="relative grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-4 animate-on-scroll">
              <span
                className="pointer-events-none absolute left-[10%] right-[10%] top-8 hidden h-px bg-gradient-to-r from-orange-500/0 via-orange-500/70 to-orange-500/0 shadow-[0_0_12px_rgba(249,115,22,0.6)] md:block"
                aria-hidden="true"
              />
              {steps.map((step, i) => {
                const Icon = HOW_ICONS[i] ?? Zap;
                return (
                  <li key={step.title} className="relative flex flex-col items-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/30 bg-neutral-950 shadow-[0_0_30px_-8px_rgba(249,115,22,0.5)]">
                      <Icon className="h-7 w-7 text-orange-400" aria-hidden="true" />
                    </div>
                    <span className="font-display text-sm font-bold text-orange-500">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-1 text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-1 max-w-[14rem] text-sm leading-relaxed text-neutral-400">{step.desc}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* A dor */}
        <section aria-labelledby="dor" className="px-4 py-24">
          <div className="container mx-auto max-w-6xl">
            <SectionTitle id="dor">{s("pain.title")}</SectionTitle>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 animate-on-scroll">
              {pains.map((p, i) => {
                const Icon = PAIN_ICONS[i] ?? BellRing;
                return (
                  <div key={p.title} className="rounded-2xl border border-white/10 bg-neutral-900/70 p-7">
                    <Icon className="mb-5 h-7 w-7 text-orange-400" aria-hidden="true" />
                    <h3 className="mb-2 text-lg font-semibold text-white">{p.title}</h3>
                    <p className="text-sm leading-relaxed text-neutral-400">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Recursos */}
        <section id="recursos" aria-labelledby="recursos-titulo" className="scroll-mt-32 border-y border-white/5 bg-white/[0.02] px-4 py-24">
          <div className="container mx-auto max-w-7xl">
            <SectionTitle id="recursos-titulo" lead={s("features.lead")}>
              {s("features.title")}
            </SectionTitle>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 animate-on-scroll">
              <FeatureCard title={s("features.cases.title")} desc={s("features.cases.desc")} className="lg:row-span-2" fill>
                <CaseTimelineMock />
              </FeatureCard>
              <FeatureCard title={s("features.alerts.title")} desc={s("features.alerts.desc")}>
                <AlertQueueMock />
              </FeatureCard>
              <FeatureCard title={s("features.analysis.title")} desc={s("features.analysis.desc")}>
                <AnalysisMock />
              </FeatureCard>
              <FeatureCard title={s("features.search.title")} desc={s("features.search.desc")}>
                <SearchMock />
              </FeatureCard>
              <FeatureCard title={s("features.dashboards.title")} desc={s("features.dashboards.desc")}>
                <KpiMock />
              </FeatureCard>
              <FeatureCard title={s("features.changes.title")} desc={s("features.changes.desc")} className="lg:col-span-2">
                <ChangesMock />
              </FeatureCard>
              <FeatureCard title={s("features.kb.title")} desc={s("features.kb.desc")}>
                <KbMock />
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* Quem pede não aprova */}
        <section aria-labelledby="aprovacao" className="relative overflow-hidden px-4 py-24">
          <div className="pointer-events-none absolute right-0 top-1/2 -z-10 h-[420px] w-[520px] -translate-y-1/2 rounded-full bg-orange-500/10 blur-[130px]" aria-hidden="true" />
          <div className="container mx-auto grid grid-cols-1 max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] animate-on-scroll">
            <div>
              <MessagesSquare className="mb-5 h-8 w-8 text-orange-400" aria-hidden="true" />
              <h2 id="aprovacao" className="mb-5 text-4xl md:text-5xl font-bold tracking-tighter text-white">
                {s("approval.title")}
              </h2>
              <p className="text-lg leading-relaxed text-neutral-300">{s("approval.body")}</p>
            </div>
            <ApprovalMock />
          </div>
        </section>

        {/* Integrações */}
        <section id="integracoes" aria-labelledby="integracoes-titulo" className="scroll-mt-32 border-y border-white/5 bg-white/[0.02] px-4 py-24">
          <div className="container mx-auto max-w-6xl">
            <SectionTitle id="integracoes-titulo" lead={s("integrations.lead")}>
              {s("integrations.title")}
            </SectionTitle>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7 animate-on-scroll">
              {integrations.map(([name, Icon, kind, native]) => (
                <li
                  key={name}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-5 text-center ${
                    native ? "border-orange-500/40 bg-orange-500/[0.06] shadow-[0_0_40px_-18px_rgba(249,115,22,0.7)]" : "border-white/10 bg-neutral-900/70"
                  }`}
                >
                  <Icon className={`h-7 w-7 ${native ? "text-orange-400" : "text-neutral-300"}`} aria-hidden="true" />
                  <span className="text-sm font-semibold text-white">{name}</span>
                  <span className="text-[11px] leading-tight text-neutral-500">{kind}</span>
                  {native ? (
                    <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">
                      {s("integrations.native")}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
            <ul className="mt-5 flex flex-wrap justify-center gap-3 animate-on-scroll">
              {soonIntegrations.map((name) => (
                <li key={name} className="flex items-center gap-2.5 rounded-full border border-dashed border-white/15 py-2 pl-4 pr-2 text-sm text-neutral-400">
                  <span>{name}</span>
                  <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                    {s("integrations.soon")}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-center text-xs text-neutral-500">{s("integrations.note")}</p>
          </div>
        </section>

        {/* MSSP */}
        <section id="mssp" aria-labelledby="mssp-titulo" className="scroll-mt-32 px-4 py-24">
          <div className="container mx-auto grid grid-cols-1 max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] animate-on-scroll">
            <div className="order-2 lg:order-1">
              <MsspMock />
            </div>
            <div className="order-1 lg:order-2">
              <h2 id="mssp-titulo" className="mb-5 text-4xl md:text-5xl font-bold tracking-tighter text-white">
                {s("mssp.title1")}
                <br />
                <span className="text-orange-500">{s("mssp.title2")}</span>
              </h2>
              <p className="mb-6 text-lg text-neutral-300">{s("mssp.lead")}</p>
              <ul className="space-y-3">
                {msspBullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-neutral-200">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Segurança */}
        <section id="seguranca" aria-labelledby="seguranca-titulo" className="scroll-mt-32 border-y border-white/5 bg-white/[0.02] px-4 py-24">
          <div className="container mx-auto max-w-6xl">
            <SectionTitle id="seguranca-titulo" lead={s("security.lead")}>
              {s("security.title")}
            </SectionTitle>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-on-scroll">
              {security.map((item, i) => {
                const Icon = SECURITY_ICONS[i] ?? ShieldCheck;
                return (
                  <div key={item.title} className="flex gap-4 rounded-2xl border border-white/10 bg-neutral-900/70 p-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-500/25 bg-orange-500/10">
                      <Icon className="h-5 w-5 text-orange-400" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-white">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-neutral-400">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Implantação com a CyDef */}
        <section aria-labelledby="implantacao" className="px-4 py-24">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 md:grid-cols-2 animate-on-scroll">
              <div className="relative min-h-[320px]">
                <img
                  src="/assets/inora/inora-implantacao.webp"
                  srcSet="/assets/inora/inora-implantacao-480.webp 480w, /assets/inora/inora-implantacao.webp 800w"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  alt={s("deploy.alt")}
                  width={800}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-[50%_25%]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-neutral-950 hidden md:block" aria-hidden="true" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent md:hidden" aria-hidden="true" />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12">
                <Lightbulb className="mb-5 h-8 w-8 text-orange-400" aria-hidden="true" />
                <h2 id="implantacao" className="mb-5 text-3xl md:text-4xl font-bold tracking-tighter text-white">
                  {s("deploy.title")}
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-neutral-300">{s("deploy.body")}</p>
                <Link
                  to={L("/consultoria")}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-500/40 px-6 py-3 text-sm font-medium text-orange-300 transition-colors duration-200 hover:border-orange-500 hover:bg-orange-500/10"
                >
                  {s("deploy.cta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" aria-labelledby="planos-titulo" className="scroll-mt-32 border-y border-white/5 bg-white/[0.02] px-4 py-24">
          <div className="container mx-auto max-w-6xl">
            <SectionTitle id="planos-titulo" lead={s("plans.lead")}>
              {s("plans.title")}
            </SectionTitle>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 animate-on-scroll">
              {plans.map(({ key, icon: Icon, highlight, soon }) => {
                const bullets = list<string>(`plans.${key}.bullets`);
                const name = s(`plans.${key}.name`);
                return (
                  <article
                    key={key}
                    className={`relative flex flex-col rounded-2xl border p-7 ${
                      highlight
                        ? "border-orange-500/60 bg-gradient-to-b from-orange-500/[0.09] to-neutral-950 shadow-[0_0_60px_-20px_rgba(249,115,22,0.6)]"
                        : "border-white/10 bg-neutral-900/70"
                    }`}
                  >
                    {highlight || soon ? (
                      <span
                        className={`absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          highlight ? "bg-orange-500 text-black" : "border border-white/15 text-neutral-300"
                        }`}
                      >
                        {highlight ? s("plans.highlight") : s("plans.soonBadge")}
                      </span>
                    ) : null}
                    <Icon className="mb-5 h-8 w-8 text-orange-400" aria-hidden="true" />
                    <h3 className="mb-2 text-2xl font-bold text-white">{name}</h3>
                    <p className="mb-6 text-sm leading-relaxed text-neutral-400">{s(`plans.${key}.desc`)}</p>
                    <ul className="mb-8 space-y-2.5">
                      {bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 text-sm text-neutral-200">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" aria-hidden="true" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto">
                      {soon ? (
                        <GhostCta href={mailto(s("mail.cloudSubject"))} className="w-full">
                          {s("plans.ctaSoon")}
                        </GhostCta>
                      ) : highlight ? (
                        <SolidCta href={proposalHref(name)} className="w-full">
                          {s("plans.cta")}
                        </SolidCta>
                      ) : (
                        <GhostCta href={proposalHref(name)} className="w-full">
                          {s("plans.cta")}
                        </GhostCta>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="mx-auto mt-8 flex max-w-4xl items-center justify-center gap-2.5 rounded-xl border border-orange-500/20 bg-orange-500/[0.05] px-5 py-3 text-center text-sm text-neutral-300">
              <FolderClosed className="h-4 w-4 shrink-0 text-orange-400" aria-hidden="true" />
              {s("plans.soonStrip")}
            </p>
          </div>
        </section>

        {/* Compromisso social: 1% do lucro líquido */}
        <Pledge />

        {/* FAQ */}
        <section id="faq" aria-labelledby="faq-titulo" className="scroll-mt-32 px-4 py-24">
          <div className="container mx-auto grid grid-cols-1 max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <h2 id="faq-titulo" className="text-4xl md:text-5xl font-bold tracking-tighter text-white animate-on-scroll">
              {s("faq.title")}
            </h2>
            <div className="space-y-3 animate-on-scroll">
              {faqs.map((f, i) => (
                <details
                  key={f.q}
                  open={i === 0}
                  className="group rounded-xl border border-white/10 bg-neutral-900/70 open:border-orange-500/30"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-white [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-orange-400 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-neutral-400">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section aria-labelledby="cta-final" className="relative overflow-hidden px-4 pb-28 pt-8">
          <div className="container mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-3xl border border-orange-500/25 bg-neutral-950 px-8 py-16 text-center md:px-16 md:py-20 animate-on-scroll">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/20 blur-[120px]" aria-hidden="true" />
              <img
                src="/assets/cydef-icon.webp"
                alt=""
                width={256}
                height={256}
                loading="lazy"
                decoding="async"
                className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
              />
              <div className="relative">
                <h2 id="cta-final" className="mb-5 text-4xl md:text-5xl font-bold tracking-tighter text-white">
                  {s("final.title")}
                </h2>
                <p className="mx-auto mb-10 max-w-2xl text-lg text-white/70">{s("final.body")}</p>
                <SolidCta href={demoHref} className="whitespace-nowrap px-6 py-4 text-base sm:px-8">
                  {s("final.cta")} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </SolidCta>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Inora;
