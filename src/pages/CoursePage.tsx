import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link, useParams } from "react-router-dom";
import {
  Clock,
  BarChart,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Users,
  Target,
} from "lucide-react";

interface CourseModule {
  title: string;
  topics?: string[];
}

interface Course {
  id?: string;
  title: string;
  level: string;
  duration: string;
  description: string;
  modules?: CourseModule[];
  objectives?: string[];
  prerequisites?: string;
  target?: string;
  topics?: string[];
}

const courseData: Record<string, Course> = {
  "cybersecurity-fundamentals": {
    title: "Cybersecurity Fundamentals",
    level: "Iniciante",
    duration: "40 horas",
    description: "Construa uma base sólida em segurança da informação com este curso completo que aborda desde conceitos fundamentais até práticas essenciais de proteção.",
    objectives: [
      "Compreender os princípios fundamentais de segurança da informação",
      "Dominar conceitos de redes e protocolos essenciais",
      "Entender criptografia e sua aplicação prática",
      "Identificar e mitigar ameaças comuns",
      "Aplicar boas práticas de segurança no dia a dia",
    ],
    target: "Iniciantes em cibersegurança, profissionais de TI buscando especialização, estudantes de tecnologia, e qualquer pessoa interessada em construir carreira em segurança.",
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
    title: "SOC Analyst – Formação Completa",
    level: "Intermediário",
    duration: "80 horas",
    description: "Formação completa para atuar como Analista SOC Nível 1 e 2, com foco em detecção, análise e resposta a incidentes de segurança em ambientes corporativos.",
    objectives: [
      "Dominar análise de logs e correlação de eventos",
      "Operar SIEM e ferramentas de detecção",
      "Investigar e responder a incidentes de segurança",
      "Aplicar o framework MITRE ATT&CK na prática",
      "Criar e executar playbooks de resposta",
    ],
    target: "Profissionais que desejam atuar em SOC, analistas de suporte buscando especialização, profissionais de TI migrando para segurança.",
    prerequisites: "Conhecimentos em redes, sistemas operacionais e fundamentos de segurança. Recomendado ter concluído Cybersecurity Fundamentals ou experiência equivalente.",
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
    description: "Curso avançado para profissionais experientes que buscam aprofundar conhecimentos em defesa cibernética, threat hunting, análise forense e estratégias de Blue Team.",
    objectives: [
      "Realizar threat hunting proativo",
      "Conduzir análises forenses avançadas",
      "Implementar defesa em profundidade",
      "Operar EDR em nível avançado",
      "Desenvolver estratégias de detecção customizadas",
    ],
    target: "Analistas SOC experientes, profissionais de Blue Team, especialistas em segurança que desejam evoluir para posições sênior.",
    prerequisites: "Experiência sólida em SOC ou segurança defensiva. Recomendado ter concluído SOC Analyst ou experiência equivalente de 1+ ano.",
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

// Cursos planejados (sem página de detalhe ainda) — NEX-P1-04: estado honesto
// em vez de "Curso não encontrado" para rotas conhecidas do catálogo.
const plannedCourses: Record<string, { title: string; description: string }> = {
  "sc-900-prep": {
    title: "Preparatório SC-900",
    description: "Preparação completa para o exame Microsoft Security, Compliance, and Identity Fundamentals.",
  },
  "security-plus-prep": {
    title: "Preparatório Security+",
    description: "Preparação completa para a certificação CompTIA Security+ com exercícios práticos e simulados.",
  },
  "malware-analysis": {
    title: "Análise de Malware para SOC",
    description: "Introdução à análise de malware com foco em contexto SOC, identificação de comportamentos e IOCs.",
  },
  "incident-investigation": {
    title: "Investigação de Incidentes (MITRE ATT&CK)",
    description: "Investigação profunda de incidentes utilizando o framework MITRE ATT&CK para detecção e resposta.",
  },
};

const CoursePage = () => {
  useScrollReveal();
  const { courseId } = useParams();
  const course = courseId ? courseData[courseId] : null;
  const planned = courseId ? plannedCourses[courseId] : undefined;

  if (!course) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans antialiased">
        <Navigation />
        <div className="container mx-auto px-4 py-40 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {planned ? planned.title : "Curso não encontrado"}
          </h1>
          {planned ? (
            <>
              <p className="text-lg text-white/60 max-w-2xl mx-auto mb-3">
                {planned.description}
              </p>
              <p className="text-neutral-400 max-w-xl mx-auto mb-10">
                Esta turma está em preparação e ainda não aceita matrículas.
                Cadastre seu e-mail para ser avisado quando abrir.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <a
                  href={`mailto:academy@cydef.com.br?subject=${encodeURIComponent(`Interesse no curso: ${planned.title}`)}`}
                  className="inline-block px-6 py-4 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold transition-colors shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)]"
                >
                  Avisar-me por e-mail
                </a>
                <Link to="/academy" className="inline-block">
                  <button className="px-6 py-4 rounded-lg border border-white/15 text-neutral-300 hover:bg-white/5 hover:text-white transition-colors font-medium text-sm" type="button">
                    Voltar para a Academy
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <Link to="/academy" className="inline-block mt-4">
              <button className="button-custom" type="button">
                <span className="inner">Voltar para Academy</span>
              </button>
            </Link>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="container mx-auto relative z-10 animate-on-scroll">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">
                {course.level}
              </span>
              <div className="flex items-center gap-2 text-white/60 font-medium">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{course.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 font-medium">
                <BarChart className="w-4 h-4" />
                <span className="text-sm">{course.modules.length} Módulos</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
              {course.title}
            </h1>
            <p className="text-xl text-white/70 mb-10 leading-relaxed font-medium">
              {course.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contato">
                <button className="button-custom" type="button">
                  <div className="points_wrapper">
                    <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                  </div>
                  <span className="inner flex items-center gap-2">
                    Pedir cotação
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </Link>
            </div>
            <p className="text-sm text-neutral-500 mt-5 max-w-md">
              Curso em preparação — valor informado sob consulta, sem
              compromisso. Preços publicados anteriormente eram simulados e
              foram removidos.
            </p>
          </div>
        </div>
      </section>

      {/* Course Info */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-16 animate-on-scroll">
              {/* Objectives */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                  <Target className="w-8 h-8 text-orange-500" />
                  O que você vai aprender
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {course.objectives.map((obj: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-orange-500/30 transition-colors">
                      <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <p className="text-neutral-300 text-sm leading-relaxed">{obj}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modules */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-orange-500" />
                  Conteúdo Programático
                </h2>
                <div className="space-y-4">
                  {course.modules?.map((module, i: number) => (
                    <div key={i} className="bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-colors">
                      <div className="flex items-start gap-6">
                        <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                          <span className="text-orange-500 font-bold text-lg">
                            {i + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-4">
                            {module.title}
                          </h3>
                          <ul className="grid sm:grid-cols-2 gap-3">
                            {module.topics.map((topic: string, j: number) => (
                              <li key={j} className="flex items-center gap-3 text-neutral-400 text-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-orange-500/50" />
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Audience & Prerequisites */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Para quem é este curso
                  </h2>
                  <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 h-full hover:border-orange-500/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <Users className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                      <p className="text-neutral-400 text-sm leading-relaxed">{course.target}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Pré-requisitos
                  </h2>
                  <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 h-full hover:border-orange-500/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <BookOpen className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                      <p className="text-neutral-400 text-sm leading-relaxed">{course.prerequisites}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 animate-on-scroll" style={{ animationDelay: '150ms' }}>
              <div className="bg-neutral-900 border border-white/10 rounded-2xl sticky top-28 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent pointer-events-none"></div>
                <div className="p-8">
                  <div className="mb-8">
                    <p className="text-sm text-neutral-400 font-medium mb-2 uppercase tracking-widest">Investimento</p>
                    <h3 className="text-4xl font-bold text-white mb-2 tracking-tight">
                      Sob consulta
                    </h3>
                    <p className="text-sm text-neutral-500 mb-6">
                      Sem preço publicado até o lançamento oficial.
                    </p>
                    <Link to="/contato" className="block w-full">
                      <button className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)]">
                        Pedir cotação
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </Link>
                  </div>

                  <div className="space-y-6 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Clock className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Duração</p>
                        <p className="text-white font-medium">{course.duration}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <BarChart className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Nível</p>
                        <p className="text-white font-medium">{course.level}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 mt-8 border-t border-white/10">
                    <h4 className="font-bold text-white mb-3">Estado atual</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      Curso em preparação. Características finais (certificado,
                      suporte, acesso ao conteúdo) serão publicadas quando a
                      turma for lançada oficialmente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CoursePage;
