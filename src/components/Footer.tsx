import { Link } from "react-router-dom";
import { Linkedin } from "lucide-react";
import { LANDING_PATH } from "@/lib/config";

export const Footer = () => {
  return (
    <footer className="overflow-hidden group bg-[#050505] w-full border-white/5 border-t relative">
      <div className="pointer-events-none z-0 absolute top-0 right-0 bottom-0 left-0">
        <div className="opacity-30 absolute top-0 right-0 bottom-0 left-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80"></div>
      </div>
      
      <div className="md:px-10 max-w-7xl relative mx-auto w-full pt-16 pr-6 pb-16 pl-6 z-10 flex flex-col">
        <div className="flex flex-col md:flex-row gap-12 md:gap-8 justify-between border-b border-white/5 pb-16">
          
          {/* Brand */}
          <div className="flex flex-col gap-4 max-w-sm">
            <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
              <img src="/assets/cydef-icon.webp" alt="CyDef" className="h-10 w-10 rounded-full" />
              <img src="/assets/cydef-wordmark.png" alt="CyDef" className="h-8 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed text-neutral-400 mt-2">
              Segurança que evolui com você. Estamos construindo um ecossistema
              global de cibersegurança com base em conhecimento, educação e
              confiança.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
            {/* Academy */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-white">Academy</span>
              <div className="flex flex-col gap-2">
                <Link to="/academy" className="text-sm text-neutral-400 hover:text-white transition-colors">Todos os Cursos</Link>
                <Link to={LANDING_PATH} className="text-sm text-neutral-400 hover:text-white transition-colors">Pré-inscrição gratuita</Link>
              </div>
            </div>

            {/* Empresa */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-white">Empresa</span>
              <div className="flex flex-col gap-2">
                <Link to="/sobre" className="text-sm text-neutral-400 hover:text-white transition-colors">Sobre</Link>
                <Link to="/blog" className="text-sm text-neutral-400 hover:text-white transition-colors">Blog</Link>
                <Link to="/servicos" className="text-sm text-neutral-400 hover:text-white transition-colors">O que estamos construindo</Link>
                <Link to="/contato" className="text-sm text-neutral-400 hover:text-white transition-colors">Contato</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-500 font-medium">
            © 2026 CyDef. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <a href="https://www.linkedin.com/company/cydef-group/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
          <div className="flex gap-4 text-xs font-medium text-neutral-500">
            <Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <span className="text-neutral-700">|</span>
            <Link to="/termos" className="hover:text-white transition-colors">Termos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
