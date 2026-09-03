import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { FileText, Mail } from "lucide-react";

const Terms = () => {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="container mx-auto text-center relative z-10 animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium mb-6">
            <FileText className="h-4 w-4" />
            Termos de Uso
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            Termos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">Uso</span>
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-3xl space-y-8 animate-on-scroll">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Documento em elaboração</h2>
            <p className="text-neutral-400 leading-relaxed">
              Os Termos de Uso da CyDef estão em elaboração e passarão por
              revisão jurídica antes da publicação. Esta página será atualizada
              assim que a versão oficial estiver disponível.
            </p>
          </div>

          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">O que vale enquanto isso</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              Até a publicação dos Termos, o uso deste site é regido pela{" "}
              <Link to="/privacidade" className="text-orange-400 hover:text-orange-300 underline">
                Política de Privacidade
              </Link>{" "}
              e pelas regras específicas de cada serviço (como a CyDef Academy).
            </p>
            <p className="text-neutral-400 leading-relaxed">
              Dúvidas sobre uso do site, conteúdo ou serviços:{" "}
              <a href="mailto:contato@cydef.com.br" className="text-orange-400 hover:text-orange-300 underline inline-flex items-center gap-1">
                <Mail className="h-4 w-4" /> contato@cydef.com.br
              </a>
              .
            </p>
          </div>

          <p className="text-xs text-neutral-600 font-medium text-center">
            v0.1 — rascunho · 03/09/2026
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
