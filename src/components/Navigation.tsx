import { Link } from "react-router-dom";
import { Shield, Menu, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-secondary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Shield className="h-8 w-8 text-secondary group-hover:text-accent transition-colors" />
            <span className="text-xl font-bold text-primary-foreground">
              Cy<span className="text-secondary">Def</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-primary-foreground hover:text-secondary transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/sobre"
              className="text-primary-foreground hover:text-secondary transition-colors font-medium"
            >
              Sobre
            </Link>
            <Link
              to="/servicos"
              className="text-primary-foreground hover:text-secondary transition-colors font-medium"
            >
              Serviços
            </Link>
            <Link
              to="/academy"
              className="flex items-center gap-1 text-primary-foreground hover:text-secondary transition-colors font-medium"
            >
              <GraduationCap className="h-4 w-4" />
              Academy
            </Link>
            <Link
              to="/blog"
              className="text-primary-foreground hover:text-secondary transition-colors font-medium"
            >
              Blog
            </Link>
            <Link to="/contato">
              <Button variant="cyber" size="sm">
                Contato
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-secondary/20">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className="text-primary-foreground hover:text-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/sobre"
                className="text-primary-foreground hover:text-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Sobre
              </Link>
              <Link
                to="/servicos"
                className="text-primary-foreground hover:text-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Serviços
              </Link>
              <Link
                to="/academy"
                className="text-primary-foreground hover:text-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Academy
              </Link>
              <Link
                to="/blog"
                className="text-primary-foreground hover:text-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              <Link to="/contato" onClick={() => setIsOpen(false)}>
                <Button variant="cyber" size="sm" className="w-full">
                  Contato
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
