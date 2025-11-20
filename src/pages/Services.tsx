import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Eye,
  Shield,
  Target,
  FileSearch,
  Lock,
  CheckCircle,
  ArrowRight,
  Clock,
  Users,
  BarChart,
} from "lucide-react";
import socServices from "@/assets/soc-services.jpg";

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-primary-foreground mb-6">
            Serviços de Segurança
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Soluções completas de cibersegurança para proteger sua organização
            contra ameaças avançadas e garantir conformidade.
          </p>
        </div>
      </section>

      {/* SOC as a Service */}
      <section id="soc" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium mb-6">
                <Eye className="h-4 w-4" />
                SOC as a Service
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Monitoramento 24x7 com Resposta Especializada
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Centro de Operações de Segurança completo, com monitoramento
                contínuo, detecção avançada e resposta rápida a incidentes.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Monitoramento Contínuo
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Vigilância 24x7 de logs, eventos e alertas de segurança
                      em toda sua infraestrutura
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Classificação e Resposta
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Triagem inteligente de incidentes com resposta baseada em
                      playbooks personalizados
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Integração Completa
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Conectamos com SIEM, EDR, Cloud e outras ferramentas do
                      seu ambiente
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Playbooks e Runbooks
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Procedimentos customizados para detecção e resposta
                      alinhados ao seu negócio
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/contato">
                <Button variant="cyber" size="lg">
                  Solicitar Proposta
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div>
              <img
                src={socServices}
                alt="SOC Services"
                className="rounded-lg shadow-card"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blue Team Services */}
      <section id="blue-team" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                Blue Team Services
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Defesa Proativa e Threat Hunting
              </h2>
              <p className="text-muted-foreground text-lg">
                Serviços especializados de defesa cibernética com foco em
                detecção avançada e caça proativa a ameaças.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Threat Hunting
                  </h3>
                  <p className="text-muted-foreground">
                    Caça proativa a ameaças ocultas no ambiente, utilizando
                    hipóteses baseadas em inteligência e comportamento de
                    adversários.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Análise de Logs Avançada
                  </h3>
                  <p className="text-muted-foreground">
                    Investigação profunda de logs com correlação de eventos e
                    identificação de padrões maliciosos complexos.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    MITRE ATT&CK Mapping
                  </h3>
                  <p className="text-muted-foreground">
                    Implementação de regras de detecção mapeadas nas técnicas e
                    táticas do framework MITRE ATT&CK.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    Defesa em Profundidade
                  </h3>
                  <p className="text-muted-foreground">
                    Estratégias de defesa em múltiplas camadas para proteção
                    abrangente de ativos críticos.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Consultoria */}
      <section id="consultoria" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium mb-6">
              <Target className="h-4 w-4" />
              Consultoria de Segurança
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Governança e Estratégia de Segurança
            </h2>
            <p className="text-muted-foreground text-lg">
              Assessoria especializada para estruturação, governança e
              implementação de programas de segurança robustos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border/50 hover:border-secondary transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center">
                  <BarChart className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Governança
                </h3>
                <p className="text-muted-foreground">
                  Estruturação de políticas, processos e controles de segurança
                  alinhados aos objetivos de negócio.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  ISO 27001
                </h3>
                <p className="text-muted-foreground">
                  Implementação e adequação completa aos requisitos da norma ISO
                  27001 para SGSI.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center">
                  <Shield className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Segurança em Cloud
                </h3>
                <p className="text-muted-foreground">
                  Assessoria especializada em AWS com foco em arquitetura
                  segura e conformidade.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center">
                  <Users className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Revisão de Políticas
                </h3>
                <p className="text-muted-foreground">
                  Análise e atualização de políticas de segurança para
                  alinhamento com melhores práticas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center">
                  <Eye className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Criação de SOC
                </h3>
                <p className="text-muted-foreground">
                  Estruturação completa de SOC interno com processos, pessoas e
                  tecnologia.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center">
                  <Target className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Roadmap de Segurança
                </h3>
                <p className="text-muted-foreground">
                  Planejamento estratégico de evolução da maturidade de
                  segurança da organização.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vulnerabilities and Hardening */}
      <section id="vulnerabilidades" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Gestão de Vulnerabilidades */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium mb-6">
                <FileSearch className="h-4 w-4" />
                Gestão de Vulnerabilidades
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Identificação e Priorização de Riscos
              </h2>
              <p className="text-muted-foreground mb-6">
                Programa completo de gestão de vulnerabilidades com scans
                periódicos, análise de risco e remediação priorizada.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Scans Periódicos
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Varreduras automatizadas em infraestrutura, aplicações e
                      cloud
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <BarChart className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Priorização por Risco
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Análise contextual com classificação baseada em impacto
                      real ao negócio
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileSearch className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Relatórios Detalhados
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Documentação técnica e executiva com recomendações claras
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Hardening */}
            <div id="hardening">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium mb-6">
                <Lock className="h-4 w-4" />
                Hardening & Compliance
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Fortificação de Sistemas e Conformidade
              </h2>
              <p className="text-muted-foreground mb-6">
                Implementação de baselines de segurança com base em CIS
                Benchmarks e validações técnicas contínuas.
              </p>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      CIS Benchmarks
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Configurações seguras baseadas em padrões reconhecidos
                      globalmente
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Baselines de Segurança
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Criação e implementação de linhas de base para SO, cloud e
                      aplicações
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Target className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Validações Contínuas
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Monitoramento de desvios e adequação periódica aos padrões
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-hero rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-primary-foreground mb-6">
              Proteja sua organização com especialistas
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Agende uma conversa com nosso time para entender como podemos
              elevar a segurança da sua empresa.
            </p>
            <Link to="/contato">
              <Button variant="hero" size="lg">
                Solicitar Proposta
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
