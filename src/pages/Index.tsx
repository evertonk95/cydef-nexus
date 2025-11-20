import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Shield,
  Eye,
  Lock,
  FileSearch,
  CheckCircle,
  ArrowRight,
  Users,
  Award,
  Clock,
  Target,
  GraduationCap,
  Code,
} from "lucide-react";
import heroCyber from "@/assets/hero-cyber.jpg";
import socServices from "@/assets/soc-services.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section
        className="relative pt-32 pb-20 px-4 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 22, 40, 0.9), rgba(10, 22, 40, 0.85)), url(${heroCyber})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium">
                <Shield className="h-4 w-4" />
                Expertise em Blue Team & SOC
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground leading-tight">
              Segurança que{" "}
              <span className="text-transparent bg-clip-text bg-gradient-cyber">
                evolui
              </span>{" "}
              com você
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Protegemos sua organização com serviços avançados de SOC, Blue Team
              e educação em cibersegurança de classe mundial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/contato">
                <Button variant="hero" size="lg">
                  Solicitar Proposta
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/academy">
                <Button variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                  Conhecer Cursos
                  <GraduationCap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Serviços de Segurança
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Soluções completas de cibersegurança para proteger sua organização
              contra ameaças avançadas
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/50 hover:border-secondary transition-all hover:shadow-card group">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center group-hover:shadow-glow transition-all">
                  <Eye className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  SOC as a Service
                </h3>
                <p className="text-muted-foreground">
                  Monitoramento 24x7, detecção e resposta a incidentes com
                  playbooks personalizados e integração completa.
                </p>
                <Link
                  to="/servicos#soc"
                  className="inline-flex items-center text-secondary hover:text-accent transition-colors font-medium"
                >
                  Saiba mais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all hover:shadow-card group">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center group-hover:shadow-glow transition-all">
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Blue Team Services
                </h3>
                <p className="text-muted-foreground">
                  Defesa proativa, threat hunting e análise de logs avançada com
                  foco em MITRE ATT&CK.
                </p>
                <Link
                  to="/servicos#blue-team"
                  className="inline-flex items-center text-secondary hover:text-accent transition-colors font-medium"
                >
                  Saiba mais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all hover:shadow-card group">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center group-hover:shadow-glow transition-all">
                  <Lock className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Hardening & Compliance
                </h3>
                <p className="text-muted-foreground">
                  Implementação de CIS Benchmarks, ISO 27001 e hardening de
                  sistemas operacionais e cloud.
                </p>
                <Link
                  to="/servicos#hardening"
                  className="inline-flex items-center text-secondary hover:text-accent transition-colors font-medium"
                >
                  Saiba mais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all hover:shadow-card group">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center group-hover:shadow-glow transition-all">
                  <FileSearch className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Gestão de Vulnerabilidades
                </h3>
                <p className="text-muted-foreground">
                  Scans periódicos, relatórios técnicos e executivos com
                  priorização baseada em risco real.
                </p>
                <Link
                  to="/servicos#vulnerabilidades"
                  className="inline-flex items-center text-secondary hover:text-accent transition-colors font-medium"
                >
                  Saiba mais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all hover:shadow-card group">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center group-hover:shadow-glow transition-all">
                  <Target className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Consultoria de Segurança
                </h3>
                <p className="text-muted-foreground">
                  Governança, implementação ISO 27001, segurança em Cloud AWS e
                  revisão de políticas.
                </p>
                <Link
                  to="/servicos#consultoria"
                  className="inline-flex items-center text-secondary hover:text-accent transition-colors font-medium"
                >
                  Saiba mais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all hover:shadow-card group">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center group-hover:shadow-glow transition-all">
                  <Code className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Hardening de Sistemas
                </h3>
                <p className="text-muted-foreground">
                  Baselines de segurança, validações técnicas e adequação
                  contínua aos padrões do mercado.
                </p>
                <Link
                  to="/servicos#hardening"
                  className="inline-flex items-center text-secondary hover:text-accent transition-colors font-medium"
                >
                  Saiba mais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link to="/servicos">
              <Button variant="secondary" size="lg">
                Ver Todos os Serviços
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Academy Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block mb-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium">
                  <GraduationCap className="h-4 w-4" />
                  Educação de Excelência
                </span>
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                CyDef Academy
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Do básico ao avançado, preparamos profissionais para os desafios
                reais da cibersegurança com cursos práticos, hands-on e
                alinhados com as demandas do mercado.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    Cursos do básico ao avançado com roadmaps formativos
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    Preparatórios para certificações de mercado
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    Hands-on com ferramentas reais e cenários práticos
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    Comunidade exclusiva e certificados de conclusão
                  </span>
                </li>
              </ul>
              <Link to="/academy">
                <Button variant="cyber" size="lg">
                  Conhecer os Cursos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img
                src={socServices}
                alt="CyDef Academy"
                className="rounded-lg shadow-card"
              />
              <div className="absolute -bottom-6 -left-6 bg-card border border-border/50 rounded-lg p-6 shadow-card max-w-xs">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-cyber flex items-center justify-center">
                    <Users className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">500+</p>
                    <p className="text-sm text-muted-foreground">
                      Alunos Formados
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why CyDef Section */}
      <section className="py-20 px-4 bg-gradient-dark">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary-foreground mb-4">
              Por que escolher a CyDef?
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Experiência, expertise e compromisso com a segurança da sua
              organização
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                <Award className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-primary-foreground">
                Especialistas Certificados
              </h3>
              <p className="text-primary-foreground/70">
                Time com certificações e experiência em ambientes corporativos
                complexos
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-primary-foreground">
                Suporte 24x7
              </h3>
              <p className="text-primary-foreground/70">
                Monitoramento contínuo e resposta rápida a incidentes críticos
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-primary-foreground">
                Frameworks Reconhecidos
              </h3>
              <p className="text-primary-foreground/70">
                Baseados em NIST CSF, MITRE ATT&CK, ISO 27001 e CIS Benchmarks
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                <Target className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-primary-foreground">
                Foco em Resultados
              </h3>
              <p className="text-primary-foreground/70">
                Redução comprovada de riscos e melhoria contínua da postura de
                segurança
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-hero rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-4xl font-bold text-primary-foreground">
                Pronto para elevar sua segurança?
              </h2>
              <p className="text-primary-foreground/80 text-lg">
                Fale com nossos especialistas e descubra como podemos proteger
                sua organização contra ameaças avançadas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/contato">
                  <Button variant="hero" size="lg">
                    Solicitar Proposta
                  </Button>
                </Link>
                <Link to="/sobre">
                  <Button variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                    Conhecer a CyDef
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
