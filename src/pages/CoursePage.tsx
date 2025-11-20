import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useParams } from "react-router-dom";
import {
  Clock,
  BarChart,
  Award,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Users,
  Target,
} from "lucide-react";

const courseData: { [key: string]: any } = {
  "cybersecurity-fundamentals": {
    title: "Cybersecurity Fundamentals",
    level: "Iniciante",
    duration: "40 horas",
    price: "R$ 997",
    description:
      "Construa uma base sólida em segurança da informação com este curso completo que aborda desde conceitos fundamentais até práticas essenciais de proteção.",
    objectives: [
      "Compreender os princípios fundamentais de segurança da informação",
      "Dominar conceitos de redes e protocolos essenciais",
      "Entender criptografia e sua aplicação prática",
      "Identificar e mitigar ameaças comuns",
      "Aplicar boas práticas de segurança no dia a dia",
    ],
    target:
      "Iniciantes em cibersegurança, profissionais de TI buscando especialização, estudantes de tecnologia, e qualquer pessoa interessada em construir carreira em segurança.",
    prerequisites: "Conhecimentos básicos de informática. Não é necessária experiência prévia em segurança.",
    modules: [
      {
        title: "Fundamentos de Segurança",
        topics: [
          "Confidencialidade, Integridade e Disponibilidade (CIA)",
          "Princípios de Defesa em Profundidade",
          "Gestão de Riscos",
          "Controles de Segurança",
        ],
      },
      {
        title: "Redes e Protocolos",
        topics: [
          "Modelo OSI e TCP/IP",
          "Protocolos de Rede Essenciais",
          "Firewalls e Segmentação",
          "VPNs e Túneis Seguros",
        ],
      },
      {
        title: "Criptografia",
        topics: [
          "Criptografia Simétrica e Assimétrica",
          "Funções Hash",
          "Certificados Digitais",
          "PKI e Infraestrutura de Chave Pública",
        ],
      },
      {
        title: "Ameaças e Vulnerabilidades",
        topics: [
          "Tipos de Malware",
          "Ataques Comuns (Phishing, Ransomware, etc)",
          "Engenharia Social",
          "Ciclo de Vida de um Ataque",
        ],
      },
      {
        title: "Práticas de Segurança",
        topics: [
          "Gestão de Identidade e Acesso",
          "Segurança de Endpoints",
          "Backup e Recuperação",
          "Políticas e Procedimentos",
        ],
      },
    ],
  },
  "soc-analyst": {
    title: "SOC Analyst – Formação Completa (N1 + N2)",
    level: "Intermediário",
    duration: "80 horas",
    price: "R$ 2.497",
    description:
      "Formação completa para atuar como Analista SOC Nível 1 e 2, com foco em detecção, análise e resposta a incidentes de segurança em ambientes corporativos.",
    objectives: [
      "Dominar análise de logs e correlação de eventos",
      "Operar SIEM e ferramentas de detecção",
      "Investigar e responder a incidentes de segurança",
      "Aplicar o framework MITRE ATT&CK na prática",
      "Criar e executar playbooks de resposta",
    ],
    target:
      "Profissionais que desejam atuar em SOC, analistas de suporte buscando especialização, profissionais de TI migrando para segurança.",
    prerequisites:
      "Conhecimentos em redes, sistemas operacionais e fundamentos de segurança. Recomendado ter concluído Cybersecurity Fundamentals ou experiência equivalente.",
    modules: [
      {
        title: "Introdução ao SOC",
        topics: [
          "Estrutura e Processos de um SOC",
          "Papéis e Responsabilidades",
          "Métricas e KPIs",
          "Integração com outras áreas",
        ],
      },
      {
        title: "Análise de Logs",
        topics: [
          "Logs de Sistemas Operacionais",
          "Logs de Rede e Firewall",
          "Logs de Aplicações",
          "Correlação de Eventos",
        ],
      },
      {
        title: "SIEM e Ferramentas de Detecção",
        topics: [
          "Operação de SIEM",
          "Criação de Regras de Detecção",
          "Dashboards e Alertas",
          "Integração de Fontes de Dados",
        ],
      },
      {
        title: "Detecção e Análise de Ameaças",
        topics: [
          "Identificação de Indicadores de Compromisso (IOCs)",
          "Análise de Malware em Contexto SOC",
          "Threat Intelligence",
          "Técnicas de Evasão",
        ],
      },
      {
        title: "Resposta a Incidentes",
        topics: [
          "Fases da Resposta a Incidentes",
          "Triagem e Priorização",
          "Containment e Erradicação",
          "Recovery e Lições Aprendidas",
        ],
      },
      {
        title: "MITRE ATT&CK",
        topics: [
          "Framework MITRE ATT&CK",
          "Mapeamento de Táticas e Técnicas",
          "Detecção Baseada em ATT&CK",
          "Casos Práticos",
        ],
      },
    ],
  },
  "blue-team-advanced": {
    title: "Blue Team Advanced",
    level: "Avançado",
    duration: "60 horas",
    price: "R$ 2.997",
    description:
      "Curso avançado para profissionais experientes que buscam aprofundar conhecimentos em defesa cibernética, threat hunting, análise forense e estratégias de Blue Team.",
    objectives: [
      "Realizar threat hunting proativo",
      "Conduzir análises forenses avançadas",
      "Implementar defesa em profundidade",
      "Operar EDR em nível avançado",
      "Desenvolver estratégias de detecção customizadas",
    ],
    target:
      "Analistas SOC experientes, profissionais de Blue Team, especialistas em segurança que desejam evoluir para posições sênior.",
    prerequisites:
      "Experiência sólida em SOC ou segurança defensiva. Recomendado ter concluído SOC Analyst ou experiência equivalente de 1+ ano.",
    modules: [
      {
        title: "Threat Hunting Avançado",
        topics: [
          "Metodologias de Hunting",
          "Hipóteses e Investigações",
          "Hunting em Rede",
          "Hunting em Endpoints",
        ],
      },
      {
        title: "Análise Forense Digital",
        topics: [
          "Aquisição e Preservação de Evidências",
          "Análise de Memória",
          "Análise de Disco",
          "Timeline Analysis",
        ],
      },
      {
        title: "EDR Avançado",
        topics: [
          "Detecção Comportamental",
          "Response Automatizado",
          "Análise de Telemetria",
          "Tuning e Otimização",
        ],
      },
      {
        title: "Defesa em Profundidade",
        topics: [
          "Arquitetura de Defesa em Camadas",
          "Segmentação Avançada",
          "Microsegmentação",
          "Zero Trust",
        ],
      },
    ],
  },
};

const CoursePage = () => {
  const { courseId } = useParams();
  const course = courseId ? courseData[courseId] : null;

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Curso não encontrado
          </h1>
          <Link to="/academy">
            <Button variant="cyber">Voltar para Academy</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-hero">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-medium">
                {course.level}
              </span>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{course.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <BarChart className="h-4 w-4" />
                <span className="text-sm">{course.modules.length} Módulos</span>
              </div>
            </div>

            <h1 className="text-5xl font-bold text-primary-foreground mb-6">
              {course.title}
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8">
              {course.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contato">
                <Button variant="hero" size="lg">
                  Matricular-se • {course.price}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                Falar com Suporte
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Course Info */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Objectives */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  O que você vai aprender
                </h2>
                <div className="space-y-3">
                  {course.objectives.map((obj: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                      <p className="text-foreground">{obj}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modules */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Conteúdo Programático
                </h2>
                <div className="space-y-4">
                  {course.modules.map((module: any, i: number) => (
                    <Card key={i} className="border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-lg bg-gradient-cyber flex items-center justify-center flex-shrink-0">
                            <span className="text-foreground font-bold">
                              {i + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground mb-3">
                              {module.title}
                            </h3>
                            <ul className="space-y-2">
                              {module.topics.map((topic: string, j: number) => (
                                <li
                                  key={j}
                                  className="flex items-center gap-2 text-muted-foreground"
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                                  {topic}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Para quem é este curso
                </h2>
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Users className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                      <p className="text-foreground">{course.target}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Prerequisites */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Pré-requisitos
                </h2>
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <BookOpen className="h-6 w-6 text-secondary flex-shrink-0 mt-1" />
                      <p className="text-foreground">{course.prerequisites}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-border/50 sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      {course.price}
                    </h3>
                    <Link to="/contato" className="block">
                      <Button variant="cyber" size="lg" className="w-full">
                        Matricular-se Agora
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-border">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Duração
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {course.duration}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <BarChart className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Nível
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {course.level}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Certificado
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Incluído
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Suporte
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Direto com instrutores
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border space-y-3">
                    <h4 className="font-semibold text-foreground">
                      Inclui também:
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        Acesso vitalício ao conteúdo
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        Material complementar
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        Comunidade exclusiva
                      </li>
                      <li className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-secondary" />
                        Certificado de conclusão
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CoursePage;
