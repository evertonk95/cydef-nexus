import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
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

const Academy = () => {
  useScrollReveal();

  const courses = [
    {
      id: "cybersecurity-fundamentals",
      title: "Cybersecurity Fundamentals",
      level: "Iniciante",
      duration: "40h",
      description: "Base sólida em conceitos de segurança da informação, redes, criptografia e princípios de defesa.",
      topics: ["Fundamentos de Segurança", "Redes e Protocolos", "Criptografia", "Ameaças Comuns"],
    },
    {
      id: "soc-analyst",
      title: "SOC Analyst – Formação Completa",
      level: "Intermediário",
      duration: "80h",
      description: "Formação completa para analista SOC N1 e N2 com práticas em detecção, análise e resposta a incidentes.",
      topics: ["Análise de Logs", "SIEM", "Detecção de Ameaças", "Resposta a Incidentes", "MITRE ATT&CK"],
    },
    {
      id: "blue-team-advanced",
      title: "Blue Team Advanced",
      level: "Avançado",
      duration: "60h",
      description: "Técnicas avançadas de defesa, threat hunting, análise forense e implementação de controles de segurança.",
      topics: ["Threat Hunting", "Análise Forense", "EDR Avançado", "Defesa em Profundidade"],
    },
    {
      id: "sc-900-prep",
      title: "Preparatório SC-900",
      level: "Iniciante",
      duration: "30h",
      description: "Preparação completa para o exame Microsoft Security, Compliance, and Identity Fundamentals.",
      topics: ["Azure Security", "Compliance", "Identity & Access", "Simulados"],
    },
    {
      id: "security-plus-prep",
      title: "Preparatório Security+",
      level: "Intermediário",
      duration: "50h",
      description: "Preparação completa para a certificação CompTIA Security+ com exercícios práticos e simulados.",
      topics: ["Ameaças e Vulnerabilidades", "Arquitetura", "Operações", "Governança"],
    },
    {
      id: "malware-analysis",
      title: "Análise de Malware para SOC",
      level: "Intermediário",
      duration: "40h",
      description: "Introdução à análise de malware com foco em contexto SOC, identificação de comportamentos e IOCs.",
      topics: ["Análise Estática", "Análise Dinâmica", "IOCs", "Sandboxing"],
    },
    {
      id: "incident-investigation",
      title: "Investigação de Incidentes (MITRE ATT&CK)",
      level: "Avançado",
      duration: "45h",
      description: "Investigação profunda de incidentes utilizando o framework MITRE ATT&CK para detecção e resposta.",
      topics: ["MITRE ATT&CK", "Investigação Avançada", "Timeline Analysis", "Containment"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="container mx-auto text-center relative z-10 animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium mb-6">
            <GraduationCap className="h-4 w-4" />
            Educação de Excelência
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            CyDef <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">Academy</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto font-medium">
            Do básico ao avançado, formamos profissionais com as habilidades
            necessárias para os desafios reais da cibersegurança.
          </p>
          <div className="mt-10 flex justify-center">
            <Link to="#cursos" className="inline-block">
              <button className="button-custom" type="button">
                <div className="points_wrapper">
                  <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                </div>
                <span className="inner flex items-center gap-2">Ver Cursos <ArrowRight className="w-4 h-4"/></span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              Por que escolher a CyDef Academy?
            </h2>
            <p className="text-white/60 text-lg">
              Educação prática e focada em resultados com instrutores experientes no mercado.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-on-scroll">
            {[
              { icon: BookOpen, title: "Conteúdo Prático", desc: "Hands-on com ferramentas reais e cenários do dia a dia de um profissional SOC" },
              { icon: Users, title: "Instrutores Experientes", desc: "Profissionais atuantes no mercado compartilhando experiências reais" },
              { icon: Award, title: "Certificados", desc: "Certificados de conclusão reconhecidos e preparatórios para certificações" },
              { icon: Target, title: "Comunidade", desc: "Acesso à comunidade exclusiva de alunos e networking com profissionais" }
            ].map((item, i) => (
              <div key={i} className="bg-neutral-900 border border-white/10 rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 text-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-500/20 flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
                  <item.icon className="h-7 w-7 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="cursos" className="py-24 px-4 bg-white/[0.02] border-y border-white/5 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              Nossos Cursos
            </h2>
            <p className="text-white/60 text-lg">
              Formações completas para todas as etapas da sua carreira em cibersegurança.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-on-scroll">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)] transition-all duration-300 group flex flex-col h-full"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1 text-neutral-400 text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-orange-400 transition-colors">
                  {course.title}
                </h3>
                
                <p className="text-neutral-400 text-sm leading-relaxed mb-6 flex-grow">
                  {course.description}
                </p>

                <div className="mb-6 border-t border-white/5 pt-4">
                  <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-3">Principais Tópicos</p>
                  <div className="flex flex-wrap gap-2">
                    {course.topics.slice(0, 3).map((topic, i) => (
                      <span key={i} className="px-2 py-1 bg-white/5 text-neutral-300 rounded text-xs">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <Link to={`/cursos/${course.id}`} className="mt-auto block">
                  <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-white/10">
                    Ver Detalhes
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-4xl animate-on-scroll">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              O que você ganha com a CyDef Academy
            </h2>
          </div>

          <div className="space-y-6">
            {[
              { title: "Roadmaps Formativos Completos", desc: "Trilhas de aprendizado estruturadas do iniciante ao avançado, com progressão clara e objetivos definidos." },
              { title: "Preparatórios para Certificações", desc: "Cursos focados nas principais certificações do mercado como Security+, SC-900, e outras." },
              { title: "Labs Práticos e Ambientes Reais", desc: "Acesso a ambientes de laboratório com ferramentas reais usadas por profissionais SOC e Blue Team." },
              { title: "Suporte e Mentoria", desc: "Acompanhamento direto com instrutores e suporte para dúvidas durante todo o curso." },
              { title: "Material Atualizado", desc: "Conteúdo constantemente atualizado com as últimas ameaças, técnicas e ferramentas do mercado." }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-6 bg-neutral-900 border border-white/10 rounded-2xl hover:border-orange-500/30 transition-colors">
                <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-neutral-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/5 blur-[150px] -z-10 pointer-events-none"></div>
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-3xl p-12 md:p-20 text-center relative backdrop-blur-md animate-on-scroll">
            <Shield className="h-16 w-16 text-orange-500 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              Comece sua jornada hoje
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Escolha o curso ideal para o seu momento e dê o próximo passo na
              sua carreira profissional em cibersegurança.
            </p>
            <Link to="/contato" className="inline-block">
              <button className="button-custom" type="button">
                <div className="points_wrapper">
                  <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                </div>
                <span className="inner flex items-center gap-2">Falar com Especialista <ArrowRight className="w-4 h-4"/></span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Academy;
