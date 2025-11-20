import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Award,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Target,
  Shield,
} from "lucide-react";
import academyHero from "@/assets/academy-hero.jpg";

const Academy = () => {
  const courses = [
    {
      id: "cybersecurity-fundamentals",
      title: "Cybersecurity Fundamentals",
      level: "Iniciante",
      duration: "40h",
      description:
        "Base sólida em conceitos de segurança da informação, redes, criptografia e princípios de defesa.",
      topics: ["Fundamentos de Segurança", "Redes e Protocolos", "Criptografia", "Ameaças Comuns"],
    },
    {
      id: "soc-analyst",
      title: "SOC Analyst – Formação Completa",
      level: "Intermediário",
      duration: "80h",
      description:
        "Formação completa para analista SOC N1 e N2 com práticas em detecção, análise e resposta a incidentes.",
      topics: [
        "Análise de Logs",
        "SIEM",
        "Detecção de Ameaças",
        "Resposta a Incidentes",
        "MITRE ATT&CK",
      ],
    },
    {
      id: "blue-team-advanced",
      title: "Blue Team Advanced",
      level: "Avançado",
      duration: "60h",
      description:
        "Técnicas avançadas de defesa, threat hunting, análise forense e implementação de controles de segurança.",
      topics: ["Threat Hunting", "Análise Forense", "EDR Avançado", "Defesa em Profundidade"],
    },
    {
      id: "sc-900-prep",
      title: "Preparatório SC-900",
      level: "Iniciante",
      duration: "30h",
      description:
        "Preparação completa para o exame Microsoft Security, Compliance, and Identity Fundamentals.",
      topics: [
        "Azure Security",
        "Compliance",
        "Identity & Access",
        "Simulados",
      ],
    },
    {
      id: "security-plus-prep",
      title: "Preparatório Security+",
      level: "Intermediário",
      duration: "50h",
      description:
        "Preparação completa para a certificação CompTIA Security+ com exercícios práticos e simulados.",
      topics: ["Ameaças e Vulnerabilidades", "Arquitetura", "Operações", "Governança"],
    },
    {
      id: "malware-analysis",
      title: "Análise de Malware para SOC",
      level: "Intermediário",
      duration: "40h",
      description:
        "Introdução à análise de malware com foco em contexto SOC, identificação de comportamentos e IOCs.",
      topics: ["Análise Estática", "Análise Dinâmica", "IOCs", "Sandboxing"],
    },
    {
      id: "incident-investigation",
      title: "Investigação de Incidentes com MITRE ATT&CK",
      level: "Avançado",
      duration: "45h",
      description:
        "Investigação profunda de incidentes utilizando o framework MITRE ATT&CK para detecção e resposta.",
      topics: [
        "MITRE ATT&CK",
        "Investigação Avançada",
        "Timeline Analysis",
        "Containment",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section
        className="relative pt-32 pb-20 px-4 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(10, 22, 40, 0.9), rgba(10, 22, 40, 0.85)), url(${academyHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-sm font-medium">
                <GraduationCap className="h-4 w-4" />
                Educação de Excelência em Cibersegurança
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground leading-tight">
              CyDef Academy
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Do básico ao avançado, formamos profissionais com as habilidades
              necessárias para os desafios reais da cibersegurança.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="#cursos">
                <Button variant="hero" size="lg">
                  Ver Cursos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contato">
                <Button variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                  Falar com Especialista
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Por que escolher a CyDef Academy?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Educação prática e focada em resultados com instrutores experientes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border/50 hover:border-secondary transition-all">
              <CardContent className="p-6 text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-gradient-cyber flex items-center justify-center mx-auto">
                  <BookOpen className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Conteúdo Prático
                </h3>
                <p className="text-muted-foreground">
                  Hands-on com ferramentas reais e cenários do dia a dia de um
                  profissional SOC
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all">
              <CardContent className="p-6 text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-gradient-cyber flex items-center justify-center mx-auto">
                  <Users className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Instrutores Experientes
                </h3>
                <p className="text-muted-foreground">
                  Profissionais atuantes no mercado compartilhando experiências
                  reais
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all">
              <CardContent className="p-6 text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-gradient-cyber flex items-center justify-center mx-auto">
                  <Award className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Certificados
                </h3>
                <p className="text-muted-foreground">
                  Certificados de conclusão reconhecidos e preparatórios para
                  certificações
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all">
              <CardContent className="p-6 text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-gradient-cyber flex items-center justify-center mx-auto">
                  <Target className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Comunidade
                </h3>
                <p className="text-muted-foreground">
                  Acesso à comunidade exclusiva de alunos e networking com
                  profissionais
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="cursos" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Nossos Cursos
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Formações completas para todas as etapas da sua carreira em
              cibersegurança
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="border-border/50 hover:border-secondary transition-all hover:shadow-card group"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                      {course.level}
                    </span>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground">
                    {course.title}
                  </h3>

                  <p className="text-muted-foreground text-sm">
                    {course.description}
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      Principais tópicos:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {course.topics.slice(0, 3).map((topic, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link to={`/cursos/${course.id}`}>
                    <Button
                      variant="outline"
                      className="w-full group-hover:border-secondary group-hover:text-secondary"
                    >
                      Ver Detalhes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
              O que você ganha com a CyDef Academy
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Roadmaps Formativos Completos
                  </h3>
                  <p className="text-muted-foreground">
                    Trilhas de aprendizado estruturadas do iniciante ao avançado,
                    com progressão clara e objetivos definidos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Preparatórios para Certificações
                  </h3>
                  <p className="text-muted-foreground">
                    Cursos focados nas principais certificações do mercado como
                    Security+, SC-900, e outras.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Labs Práticos e Ambientes Reais
                  </h3>
                  <p className="text-muted-foreground">
                    Acesso a ambientes de laboratório com ferramentas reais usadas
                    por profissionais SOC e Blue Team.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Suporte e Mentoria
                  </h3>
                  <p className="text-muted-foreground">
                    Acompanhamento direto com instrutores e suporte para dúvidas
                    durante todo o curso.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Material Atualizado
                  </h3>
                  <p className="text-muted-foreground">
                    Conteúdo constantemente atualizado com as últimas ameaças,
                    técnicas e ferramentas do mercado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-hero rounded-2xl p-12 text-center">
            <Shield className="h-16 w-16 text-secondary mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-primary-foreground mb-6">
              Comece sua jornada em Cibersegurança hoje
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              Escolha o curso ideal para o seu momento e dê o próximo passo na
              sua carreira profissional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contato">
                <Button variant="hero" size="lg">
                  Falar com Especialista
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                Ver Todos os Cursos
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Academy;
