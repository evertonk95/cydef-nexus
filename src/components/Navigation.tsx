import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 animate-fadeSlideIn">
      <div className="container mx-auto">
        <div className="flex items-center justify-between py-4 px-6 md:px-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
            <img src="/assets/cydef-icon.png" alt="CyDef" className="h-9 w-9 rounded-full" />
            <img src="/assets/cydef-wordmark.png" alt="CyDef" className="h-7 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-xs font-medium tracking-widest uppercase hover:text-white transition-colors text-neutral-400">
              Home
            </Link>
            <Link to="/sobre" className="text-xs font-medium tracking-widest uppercase hover:text-white transition-colors text-neutral-400">
              Sobre
            </Link>
            <Link to="/servicos" className="text-xs font-medium tracking-widest uppercase hover:text-white transition-colors text-neutral-400">
              Serviços
            </Link>
            <Link to="/academy" className="text-xs font-medium tracking-widest uppercase hover:text-white transition-colors text-neutral-400">
              Academy
            </Link>
            <Link to="/blog" className="text-xs font-medium tracking-widest uppercase hover:text-white transition-colors text-neutral-400">
              Blog
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/contato" className="text-sm font-medium hover:text-white transition-colors text-neutral-400">
              Entrar
            </Link>
            <Link to="/contato">
              <button className="button-custom scale-95" type="button">
                <div className="points_wrapper">
                  <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                </div>
                <span className="inner">Obter Acesso</span>
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-orange-500 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/5 bg-[#050505]">
            <div className="flex flex-col gap-4 px-6">
              <Link to="/" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link to="/sobre" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                Sobre
              </Link>
              <Link to="/servicos" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                Serviços
              </Link>
              <Link to="/academy" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                Academy
              </Link>
              <Link to="/blog" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                Blog
              </Link>
              <Link to="/contato" onClick={() => setIsOpen(false)}>
                <button className="button-custom w-full mt-4" type="button">
                  <div className="points_wrapper">
                    <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                  </div>
                  <span className="inner">Obter Acesso</span>
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
