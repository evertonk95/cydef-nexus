import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, BadgeCheck, Clock, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { COURSES, FAQ_ITEMS, STEPS } from "./data";
import { LANDING_PATH, privacyPath } from "@/lib/config";

/** Skip link: primeiro elemento focável (WCAG 2.4.1). */
export const SkipLink = () => (
  <a
    href="#conteudo"
    className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-[#F69021] focus:text-black focus:font-semibold"
  >
    Pular para o conteúdo
  </a>
);

export const Hero = () => (
  <section className="relative pt-36 pb-20 px-4 overflow-hidden border-b border-white/5">
    <div
      aria-hidden="true"
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none"
    />
    <div className="container mx-auto max-w-4xl text-center relative">
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-400 text-sm font-medium mb-6">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Cursos gratuitos de entrada
      </span>
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
        Comece sua carreira de Cybersecurity —{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F46B27] to-[#F69021]">
          de graça
        </span>
      </h1>
      <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
        2 cursos práticos para entrar no mundo da cibersegurança.
        Pré-inscreva-se e receba o acesso.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href="#pre-inscricao"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-black bg-gradient-to-r from-[#F46B27] to-[#F69021] hover:brightness-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F69021] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] min-h-[48px]"
        >
          Quero meu acesso gratuito
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
        <span className="inline-flex items-center gap-2 text-sm text-neutral-400">
          <BadgeCheck className="h-4 w-4 text-orange-400" aria-hidden="true" />
          100% gratuito · sem cartão
        </span>
      </div>
    </div>
  </section>
);

export const Courses = () => (
  <section aria-labelledby="o-que-voce-recebe" className="py-20 px-4">
    <div className="container mx-auto max-w-5xl">
      <h2 id="o-que-voce-recebe" className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tighter text-center">
        O que você recebe
      </h2>
      <p className="text-neutral-400 text-center mb-12 max-w-2xl mx-auto">
        Dois cursos de nível iniciante, em português, criados por quem opera
        SOC e Blue Team de verdade.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        {COURSES.map((course) => (
          <article
            key={course.id}
            className="bg-[#141416] border border-[#26262A] rounded-2xl p-8 flex flex-col h-full"
          >
            <div className="flex justify-between items-center mb-4 gap-3">
              <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">
                {course.level}
              </span>
              <span className="inline-flex items-center gap-1 text-neutral-400 text-sm">
                <Clock className="w-4 h-4" aria-hidden="true" />
                {course.duration}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 leading-tight">{course.title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">{course.description}</p>
            <ul className="mt-auto flex flex-wrap gap-2">
              {course.topics.map((topic) => (
                <li key={topic} className="px-2 py-1 bg-white/5 text-neutral-300 rounded text-xs">
                  {topic}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export const HowItWorks = () => (
  <section aria-labelledby="como-funciona" className="py-20 px-4 bg-white/[0.02] border-y border-white/5">
    <div className="container mx-auto max-w-4xl">
      <h2 id="como-funciona" className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tighter text-center">
        Como funciona
      </h2>
      <ol className="mt-12 grid md:grid-cols-3 gap-6">
        {STEPS.map((step, i) => (
          <li key={step.title} className="bg-[#141416] border border-[#26262A] rounded-2xl p-6">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-tr from-[#F46B27]/20 to-[#F69021]/20 border border-orange-500/20 text-orange-400 font-bold mb-4">
              {i + 1}
            </span>
            <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">{step.description}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export const Proof = () => (
  <section aria-labelledby="por-que-cydef" className="py-20 px-4">
    <div className="container mx-auto max-w-4xl">
      <div className="bg-[#141416] border border-[#26262A] rounded-3xl p-8 md:p-12">
        <ShieldCheck className="h-10 w-10 text-orange-400 mb-6" aria-hidden="true" />
        <h2 id="por-que-cydef" className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tighter">
          Quem cria é quem opera
        </h2>
        <p className="text-neutral-400 leading-relaxed max-w-3xl">
          A CyDef opera SOC e Blue Team de verdade, protegendo organizações com
          monitoramento, resposta a incidentes e consultoria. Os cursos gratuitos
          nascem dessa operação real — conteúdo prático, sem promessas de
          emprego ou resultado que não podemos sustentar.
        </p>
      </div>
    </div>
  </section>
);

export const Faq = () => (
  <section aria-labelledby="faq" className="py-20 px-4 bg-white/[0.02] border-y border-white/5">
    <div className="container mx-auto max-w-3xl">
      <h2 id="faq" className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tighter text-center">
        Perguntas frequentes
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem key={item.question} value={`item-${i}`} className="border-white/10">
            <AccordionTrigger className="text-left text-white hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F69021] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-neutral-400 leading-relaxed">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

/** Footer da landing: usa o Footer do site (contentinfo único — a11y). */
export const LandingFooter = () => (
  <div className="border-t border-white/5 py-6 px-4">
    <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-orange-400" aria-hidden="true" />
        <span className="font-medium text-neutral-400">CyDef Academy</span>
      </div>
      <nav aria-label="Links da landing" className="flex flex-wrap items-center justify-center gap-4">
        <Link to="/contato" className="hover:text-white transition-colors">
          Contato
        </Link>
        <Link to={privacyPath()} className="hover:text-white transition-colors">
          Aviso de Privacidade
        </Link>
        <Link to={LANDING_PATH} className="hover:text-white transition-colors">
          Pré-inscrição
        </Link>
      </nav>
      <p>© 2026 CyDef. Todos os direitos reservados.</p>
    </div>
  </div>
);
