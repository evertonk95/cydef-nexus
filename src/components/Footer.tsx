import { Link } from "react-router-dom";
import { Shield, Mail, Linkedin, Twitter, Github } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary border-t border-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-secondary" />
              <span className="text-xl font-bold text-primary-foreground">
                Cy<span className="text-secondary">Def</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm">
              Segurança que evolui com você. Protegendo organizações através de
              tecnologia avançada e expertise em cibersegurança.
            </p>
          </div>

          {/* Serviços */}
          <div>
            <h3 className="font-semibold text-primary-foreground mb-4">Serviços</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/servicos#soc"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  SOC as a Service
                </Link>
              </li>
              <li>
                <Link
                  to="/servicos#blue-team"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  Blue Team Services
                </Link>
              </li>
              <li>
                <Link
                  to="/servicos#consultoria"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  Consultoria
                </Link>
              </li>
              <li>
                <Link
                  to="/servicos#hardening"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  Hardening & Compliance
                </Link>
              </li>
            </ul>
          </div>

          {/* Academy */}
          <div>
            <h3 className="font-semibold text-primary-foreground mb-4">CyDef Academy</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/academy"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  Todos os Cursos
                </Link>
              </li>
              <li>
                <Link
                  to="/cursos/cybersecurity-fundamentals"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  Cybersecurity Fundamentals
                </Link>
              </li>
              <li>
                <Link
                  to="/cursos/soc-analyst"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  SOC Analyst
                </Link>
              </li>
              <li>
                <Link
                  to="/cursos/blue-team-advanced"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  Blue Team Advanced
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="font-semibold text-primary-foreground mb-4">Empresa</h3>
            <ul className="space-y-2 mb-4">
              <li>
                <Link
                  to="/sobre"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  Sobre a CyDef
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/contato"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                >
                  Contato
                </Link>
              </li>
            </ul>
            <div className="flex gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-secondary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-secondary transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-secondary transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © 2025 CyDef. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-primary-foreground/50 hover:text-secondary text-sm">
              Política de Privacidade
            </a>
            <a href="#" className="text-primary-foreground/50 hover:text-secondary text-sm">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
