import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  FlaskConical,
  GitFork,
  Layers,
  Lock,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { L, currentLang } from "@/lib/lang";
import { htmlTitles } from "@/i18n";
import { JsonLd } from "@/lib/seo";
import { hasLabsArtifactFor } from "@/lib/labs/artifacts";
import { getFrameworkContent } from "@/lib/labs/framework.content";

/**
 * Página de artefato do CyDef Labs — rota /labs/:slug (Fase 4–5).
 * Conteúdo por idioma (PT-first): se o artefato não existe no idioma atual,
 * responde NotFound — mesmo padrão do artigo de blog PT-only.
 * Hoje o único artefato com página é o SIEM Health and Maturity Assessment
 * Framework; o catálogo cresce quando novos artefatos forem reais.
 */
const LabsArtifact = () => {
  useScrollReveal();
  const { slug } = useParams<{ slug: string }>();
  const lang = currentLang();

  const content =
    slug === "siem-health-maturity-framework" ? getFrameworkContent(lang) : undefined;

  useEffect(() => {
    if (content) {
      document.title = `${content.h1} | ${content.badge}`;
    }
    return () => {
      document.title = htmlTitles[currentLang()];
    };
  }, [content]);

  if (!slug || !content || !hasLabsArtifactFor(slug, lang)) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
        <Navigation />
        <main id="conteudo" tabIndex={-1} className="outline-none">
          <section className="relative pt-48 pb-32 px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter">
              Artefato não encontrado
            </h1>
            <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
              Este artefato não existe ou ainda não está disponível neste idioma.
            </p>
            <Link
              to={L("/labs")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-black font-bold rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para o Labs
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CreativeWork", name: content.h1, description: content.lead, inLanguage: "pt-BR", url: `https://www.cydef.com.br/pt/labs/${slug}`, publisher: { "@id": "https://www.cydef.com.br/#org", name: "CyDef" } }} />
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          <div className="container mx-auto max-w-5xl text-center relative z-10 animate-on-scroll">
            <Link
              to={L("/labs")}
              className="inline-flex items-center gap-2 text-neutral-400 hover:text-orange-400 transition-colors text-sm font-medium mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para o Labs
            </Link>
            <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium">
                <FlaskConical className="h-4 w-4" />
                {content.badge}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {content.stateBadge}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tighter leading-tight">
              {content.h1}
            </h1>
            <p className="text-xl text-orange-400/90 font-medium mb-5">
              {content.sub}
            </p>
            <p className="text-lg text-white/60 max-w-3xl mx-auto font-medium leading-relaxed">
              {content.lead}
            </p>
          </div>
        </section>

        {/* Ideia central */}
        <section className="py-20 px-4 relative">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-neutral-900 border border-orange-500/20 rounded-2xl p-8 md:p-10 animate-on-scroll">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                  <ShieldCheck className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-orange-400 mb-2">
                    {content.ideaTitle}
                  </h2>
                  <p className="text-neutral-300 leading-relaxed">
                    {content.ideaBody}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* O que é */}
        <section className="py-20 px-4 bg-white/[0.02] border-y border-white/5">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-start gap-4 bg-neutral-900 border border-white/10 rounded-2xl p-8 md:p-10 animate-on-scroll">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <BookOpen className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  {content.whatTitle}
                </h2>
                <p className="text-neutral-400 leading-relaxed">
                  {content.whatBody}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Fases */}
        <section className="py-20 px-4 relative">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tighter">
                {content.phasesTitle}
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                {content.phasesLead}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-5 animate-on-scroll">
              {content.phases.map((phase) => (
                <div
                  key={phase.n}
                  className="bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 font-bold text-sm shrink-0">
                      {phase.n}
                    </span>
                    <h3 className="font-bold text-white leading-snug">
                      {phase.title}
                    </h3>
                  </div>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    {phase.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Implementações */}
        <section className="py-20 px-4 bg-white/[0.02] border-y border-white/5">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tighter">
                {content.implTitle}
              </h2>
              <p className="text-white/60 text-lg max-w-3xl mx-auto">
                {content.implBody}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 animate-on-scroll">
              <div className="bg-neutral-900 border border-emerald-500/20 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/25">
                    <GitFork className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {content.implCurrentTitle}
                  </h3>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {content.implCurrentBody}
                </p>
              </div>
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Layers className="w-5 h-5 text-neutral-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {content.implPlannedTitle}
                  </h3>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {content.implPlannedBody}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recursos */}
        <section className="py-20 px-4 relative">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12 animate-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tighter">
                {content.resourcesTitle}
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                {content.resourcesBody}
              </p>
            </div>
            <div className="space-y-4 animate-on-scroll">
              {content.resources.map((res) => {
                const inner = (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                      {res.external ? (
                        <FileText className="w-6 h-6 text-orange-400" />
                      ) : (
                        <ScrollText className="w-6 h-6 text-orange-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white mb-1">{res.label}</h3>
                      <p className="text-neutral-400 text-sm leading-relaxed">
                        {res.desc}
                      </p>
                    </div>
                    {res.external && (
                      <ExternalLink className="w-5 h-5 text-neutral-500 shrink-0 group-hover:text-orange-400 transition-colors" />
                    )}
                  </>
                );
                const cls =
                  "group flex items-center gap-4 bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-colors";
                return res.external ? (
                  <a
                    key={res.label}
                    href={res.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cls}
                  >
                    {inner}
                  </a>
                ) : (
                  <Link key={res.label} to={L(res.href)} className={cls}>
                    {inner}
                  </Link>
                );
              })}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-neutral-400 animate-on-scroll">
              <span className="inline-flex items-center gap-2">
                <Lock className="w-4 h-4 text-neutral-500" />
                Licença: Apache-2.0
              </span>
              <span className="inline-flex items-center gap-2">
                <GitFork className="w-4 h-4 text-neutral-500" />
                Repositório: público
              </span>
              <span className="inline-flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-neutral-500" />
                {content.updated}
              </span>
            </div>
          </div>
        </section>

        {/* O que não é */}
        <section className="py-16 px-4 border-t border-white/5">
          <div className="container mx-auto max-w-4xl">
            <div className="border border-white/10 bg-neutral-900/60 rounded-2xl p-8 animate-on-scroll">
              <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">
                {content.notTitle}
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {content.notBody}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LabsArtifact;
