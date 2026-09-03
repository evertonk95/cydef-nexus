import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { currentLang } from "@/lib/lang";
import { trackPageview } from "@/lib/analytics";
import { PreEnrollmentForm } from "./form/PreEnrollmentForm";
import {
  SkipLink,
  Hero,
  Courses,
  HowItWorks,
  Proof,
  Faq,
  LandingFooter,
} from "./sections";

/**
 * Landing de captura — CyDef Academy (S-02, UX package v8).
 * Rota: /academy/gratuito (proposta; constante única em src/lib/config.ts).
 * Fluxo J1 100% navegável por teclado; WCAG 2.2 AA (labels, foco visível,
 * erro inline, aria-live, reflow 320px, prefers-reduced-motion global).
 * key={lang} no formulário: schema zod localizado é reconstruído por idioma.
 */
const AcademyLanding = () => {
  useScrollReveal();
  useTranslation(); // assina troca de idioma (re-render)
  const lang = currentLang();

  useEffect(() => {
    trackPageview(); // sem PII (SEC-008)
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <SkipLink />
      <Navigation />
      <main id="conteudo">
        <Hero />
        <Courses />
        <HowItWorks />
        <Proof />
        <Faq />
        <PreEnrollmentForm key={lang} />
      </main>
      <LandingFooter />
      <Footer />
    </div>
  );
};

export default AcademyLanding;
