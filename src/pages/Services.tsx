import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import {
  Eye,
  Shield,
  Lock,
  ArrowRight,
  BarChart,
  Code,
  Mail,
  Newspaper,
  GraduationCap,
  Wrench,
  ScanLine,
  Radar,
} from "lucide-react";

// Página honesta de oferta (NEX-P0-02/P0-03 + diretriz do Everton 03/09):
// a CyDef ainda NÃO vende serviços gerenciados. Nada aqui promete o que não existe.
const Services = () => {
  useScrollReveal();

  const territorios = [
    {
      icon: Eye,
      title: "Security Operations (SOC)",
      desc: "Operação e maturidade de Centros de Operações de Segurança — processos, métricas e melhoria contínua.",
    },
    {
      icon: Radar,
      title: "Incident Response",
      desc: "Investigação, contenção, erradicação, recuperação e lições aprendidas de incidentes de segurança.",
    },
    {
      icon: ScanLine,
      title: "Threat Hunting",
      desc: "Caça proativa e baseada em hipóteses, usando comportamento, inteligência, TTPs e frameworks de ataque.",
    },
    {
      icon: Wrench,
      title: "Auditing & Hardening",
      desc: "Avaliação de postura, identificação de lacunas e fortalecimento sistemático de ambientes.",
    },
    {
      icon: Code,
      title: "SIEM & SOAR Engineering",
      desc: "Arquitetura, integrações, regras de correlação, tuning, orquestração e automação de segurança.",
    },
    {
      icon: BarChart,
      title: "AI for Cybersecurity",
      desc: "Aplicação prática de IA para triagem, enriquecimento, investigação, detecção e apoio à decisão.",
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
            <Shield className="h-4 w-4" />
            O que estamos construindo
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            Sem vitrine. Só o que <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">existe de verdade.</span>
          </h1>
          <p className="text-lg text-white/60 max-w-3xl mx-auto font-medium leading-relaxed">
            A CyDef está construindo um ecossistema global de cibersegurança —
            Media, Academy, Labs, Research e, no futuro, Consulting. Enquanto
            isso, não vendemos serviços gerenciados e não vamos fingir que
            vendemos. Esta página mostra o que é real hoje e para onde estamos
            indo, sem promessas que não possamos cumprir.
          </p>
        </div>
      </section>

      {/* O que já é real hoje */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              O que já é real hoje
            </h2>
            <p className="text-white/60 text-lg">
              Nada aqui é maquete. Cada item abaixo existe, está no ar e pode
              ser verificado agora.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 animate-on-scroll">
            <Link to="/blog" className="block group">
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 h-full hover:border-orange-500/50 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-orange-500/30">
                  <Newspaper className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">CyDef Media — Blog</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                  Artigos técnicos com fontes e data de verificação publicados
                  por autores identificados.
                </p>
                <span className="inline-flex items-center gap-2 text-orange-400 text-sm font-medium">
                  Ler o blog <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            <Link to="/academy" className="block group">
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 h-full hover:border-orange-500/50 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-orange-500/30">
                  <GraduationCap className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">CyDef Academy — gratuita</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                  Dois cursos gratuitos de entrada para SOC, com pré-inscrição
                  real, confirmação por e-mail e consentimento explícito.
                </p>
                <span className="inline-flex items-center gap-2 text-orange-400 text-sm font-medium">
                  Pré-inscrever-se <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            <Link to="/contato" className="block group">
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 h-full hover:border-orange-500/50 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-orange-500/30">
                  <Mail className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Contato direto</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                  E-mail real, respondido por pessoas. Sem robôs de atendimento
                  e sem formulários que fingem enviar.
                </p>
                <span className="inline-flex items-center gap-2 text-orange-400 text-sm font-medium">
                  Falar com a CyDef <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Territórios técnicos — futuro */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-6 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              Para onde estamos indo
            </h2>
            <p className="text-white/60 text-lg">
              Nossos territórios técnicos de atuação, definidos na fundação
              estratégica da CyDef.
            </p>
          </div>

          <div className="max-w-3xl mx-auto text-center mb-14 animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium">
              <Lock className="w-4 h-4" />
              Nenhum destes está à venda hoje — e não será anunciado antes de
              existir com processos, equipe e responsáveis reais.
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-on-scroll">
            {territorios.map((item, i) => (
              <div key={i} className="bg-neutral-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:border-orange-500/30 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-500/20 flex items-center justify-center mb-6">
                  <item.icon className="w-5 h-5 text-orange-400" />
                </div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-semibold uppercase tracking-wider text-neutral-400 whitespace-nowrap">
                    em construção
                  </span>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-neutral-500 mt-12 max-w-2xl mx-auto">
            Se a sua organização precisa de um destes serviços hoje, fale
            conosco: registramos sua necessidade e você será avisado quando
            houver oferta real — sem compromisso e sem promessas.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/5 blur-[150px] -z-10 pointer-events-none"></div>
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-3xl p-12 md:p-20 text-center relative backdrop-blur-md animate-on-scroll">
            <Shield className="h-16 w-16 text-orange-500 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              Acompanhe a construção
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Conteúdo técnico, formação gratuita e atualizações reais do
              ecossistema. Quando os serviços abrirem, você saberá pelos
              canais oficiais da CyDef.
            </p>
            <Link to="/contato" className="inline-block">
              <button className="button-custom" type="button">
                <div className="points_wrapper">
                  <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                </div>
                <span className="inner flex items-center gap-2">Falar com a CyDef <ArrowRight className="w-4 h-4"/></span>
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
