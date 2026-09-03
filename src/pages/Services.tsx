import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
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
  Code,
} from "lucide-react";

const Services = () => {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="container mx-auto text-center relative z-10 animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Nossos Serviços
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            Serviços de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">Segurança</span>
          </h1>
          <p className="text-lg text-white/60 max-w-3xl mx-auto font-medium">
            Soluções completas de cibersegurança para proteger sua organização
            contra ameaças avançadas e garantir conformidade contínua.
          </p>
        </div>
      </section>

      {/* SOC as a Service */}
      <section id="soc" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-on-scroll">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium mb-6">
                <Eye className="h-4 w-4" />
                SOC as a Service
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
                Monitoramento 24x7 com Resposta Especializada
              </h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                Centro de Operações de Segurança completo, com monitoramento
                contínuo, detecção avançada e resposta rápida a incidentes em tempo real.
              </p>

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-white/5 p-2 rounded-lg border border-white/10">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Monitoramento Contínuo
                    </h4>
                    <p className="text-neutral-400 text-sm">
                      Vigilância 24x7 de logs, eventos e alertas de segurança
                      em toda sua infraestrutura
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-white/5 p-2 rounded-lg border border-white/10">
                    <Target className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">
                      Classificação e Resposta
                    </h4>
                    <p className="text-neutral-400 text-sm">
                      Triagem inteligente de incidentes com resposta baseada em
                      playbooks personalizados
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/contato" className="inline-block">
                <button className="button-custom" type="button">
                  <div className="points_wrapper">
                    <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                  </div>
                  <span className="inner flex items-center gap-2">Solicitar Proposta <ArrowRight className="w-4 h-4"/></span>
                </button>
              </Link>
            </div>
            
            {/* Painel simulado de status removido (NEX-P0-03: "Operacional"/"99.9%"
                eram telemetria falsa). Card honesto com conversão real. */}
            <div className="relative animate-on-scroll">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-600/20 to-amber-600/20 rounded-2xl blur-xl opacity-50"></div>
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 relative shadow-2xl text-center">
                <Shield className="w-12 h-12 text-orange-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">Pronto para começar?</h3>
                <p className="text-neutral-400 leading-relaxed mb-8">
                  Fale com a CyDef para desenhar o SOC certo para o momento da
                  sua organização.
                </p>
                <Link to="/contato" className="inline-block">
                  <button className="button-custom" type="button">
                    <span className="inner flex items-center gap-2">Solicitar Proposta <ArrowRight className="w-4 h-4" /></span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blue Team Services */}
      <section id="blue-team" className="py-24 px-4 bg-white/[0.02] border-y border-white/5 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Blue Team Services
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              Defesa Proativa e Threat Hunting
            </h2>
            <p className="text-white/60 text-lg">
              Serviços especializados de defesa cibernética com foco em
              detecção avançada e caça proativa a ameaças.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 animate-on-scroll">
            {[
              { icon: Shield, title: "Threat Hunting", desc: "Caça proativa a ameaças ocultas no ambiente, utilizando hipóteses baseadas em inteligência e comportamento de adversários." },
              { icon: FileSearch, title: "Análise de Logs Avançada", desc: "Investigação profunda de logs com correlação de eventos e identificação de padrões maliciosos complexos." },
              { icon: Target, title: "MITRE ATT&CK Mapping", desc: "Implementação de regras de detecção mapeadas nas técnicas e táticas do framework MITRE ATT&CK." },
              { icon: Lock, title: "Defesa em Profundidade", desc: "Estratégias de defesa em múltiplas camadas para proteção abrangente de ativos críticos." }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-colors duration-300 group">
                <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center mb-6 border border-white/5 group-hover:border-orange-500/50 transition-colors">
                  <item.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultoria */}
      <section id="consultoria" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium mb-6">
              <BarChart className="h-4 w-4" />
              Consultoria Estratégica
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              Governança e Segurança
            </h2>
            <p className="text-white/60 text-lg">
              Assessoria especializada para estruturação, governança e
              implementação de programas de segurança robustos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 animate-on-scroll">
            {[
              { icon: BarChart, title: "Governança", desc: "Estruturação de políticas, processos e controles de segurança alinhados aos objetivos de negócio." },
              { icon: CheckCircle, title: "ISO 27001", desc: "Implementação e adequação completa aos requisitos da norma ISO 27001 para SGSI." },
              { icon: Shield, title: "Segurança em Cloud", desc: "Assessoria especializada em AWS com foco em arquitetura segura e conformidade." },
              { icon: Users, title: "Revisão de Políticas", desc: "Análise e atualização de políticas de segurança para alinhamento com melhores práticas." },
              { icon: Eye, title: "Criação de SOC", desc: "Estruturação completa de SOC interno com processos, pessoas e tecnologia." },
              { icon: Target, title: "Roadmap de Segurança", desc: "Planejamento estratégico de evolução da maturidade de segurança da organização." }
            ].map((item, i) => (
              <div key={i} className="bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-500/20 flex items-center justify-center mb-6">
                  <item.icon className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
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
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              Proteja sua organização com especialistas
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Agende uma conversa com nosso time para entender como podemos
              elevar a segurança da sua empresa ao próximo nível.
            </p>
            <Link to="/contato" className="inline-block">
              <button className="button-custom" type="button">
                <div className="points_wrapper">
                  <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                </div>
                <span className="inner flex items-center gap-2">Solicitar Proposta <ArrowRight className="w-4 h-4"/></span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
