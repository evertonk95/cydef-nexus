import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PrimaryCta } from "./PrimaryCta";
import { focusRing } from "./ctaStyles";

/**
 * Layout das paginas curtas da Academy (confirmacoes e avisos): fundo do site,
 * card central com icone laranja, titulo, texto, conteudo extra e acoes.
 */
export const AcademyMessageLayout = ({
  icon,
  title,
  body,
  children,
  primary,
  secondary,
}: {
  icon: ReactNode;
  title: string;
  body: ReactNode;
  children?: ReactNode;
  primary: { to: string; label: string };
  secondary: { to: string; label: string };
}) => (
  <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
    <Navigation />
    <main id="conteudo" tabIndex={-1} className="relative isolate overflow-hidden outline-none pt-36 md:pt-44 pb-24 md:pb-32 px-2 sm:px-6">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[70vh] -z-10 pointer-events-none">
        <img
          alt=""
          className="w-full h-full object-cover opacity-25"
          src="/assets/cydef-hero-bg.webp"
          srcSet="/assets/cydef-hero-bg-960.webp 960w, /assets/cydef-hero-bg.webp 1920w"
          sizes="100vw"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-[#050505]/80 to-[#050505]" />
      </div>

      <div className="container mx-auto max-w-2xl">
        <div className="relative rounded-3xl border border-white/10 bg-neutral-900/90 backdrop-blur-md p-6 sm:p-10 md:p-12 shadow-[0_0_60px_-20px_rgba(249,115,22,0.4)]">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center mb-8">
            {icon}
          </div>
          <h1 className="text-4xl md:text-5xl font-medium tracking-tighter text-white mb-5">{title}</h1>
          <div className="text-lg text-neutral-300 leading-relaxed">{body}</div>
          {children ? <div className="mt-10">{children}</div> : null}
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <PrimaryCta to={primary.to}>{primary.label}</PrimaryCta>
            <Link
              to={secondary.to}
              className={`text-sm font-medium text-orange-400 hover:text-orange-300 underline-offset-4 hover:underline transition-colors duration-200 rounded ${focusRing}`}
            >
              {secondary.label}
            </Link>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);
