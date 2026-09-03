import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { Shield, Target, Globe, ArrowRight, Compass, HandHeart, Scale, Users, BookOpen, Lightbulb, Flag } from "lucide-react";

// Sobre reescrito pela CyDef Strategic Foundation v1.1 (documento de
// C:\Users\User\Documents\CyDef) — narrativa honesta da marca em construção.
const About = () => {
  useScrollReveal();

  const codigo = [
    {
      icon: Scale,
      title: "Ser justo",
      desc: "Agimos com justiça mesmo quando a decisão justa não é a mais conveniente.",
    },
    {
      icon: Users,
      title: "Responsabilidade pelo time",
      desc: "Liderar significa desenvolver, apoiar, reconhecer e proteger quem torna o trabalho possível.",
    },
    {
      icon: HandHeart,
      title: "Respeito às pessoas",
      desc: "Competência técnica nunca é desculpa para arrogância ou desrespeito.",
    },
    {
      icon: Flag,
      title: "O bem maior primeiro",
      desc: "Interesses pessoais nunca vêm antes dos interesses legítimos do time, do cliente, da organização, da comunidade ou da sociedade.",
    },
    {
      icon: BookOpen,
      title: "Compartilhar conhecimento",
      desc: "Crescer deve aumentar a quantidade de conhecimento útil que a CyDef devolve à comunidade de cibersegurança.",
    },
    {
      icon: Compass,
      title: "Dono do resultado",
      desc: "A CyDef não apenas identifica problemas — assume a responsabilidade de ajudar a resolvê-los.",
    },
  ];

  const pilares = [
    { nome: "Media", papel: "compartilhar" },
    { nome: "Academy", papel: "ensinar" },
    { nome: "Labs", papel: "construir" },
    { nome: "Research", papel: "descobrir" },
    { nome: "Consulting", papel: "proteger" },
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
            Sobre a CyDef
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            Quem somos e <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">para onde vamos</span>
          </h1>
          <p className="text-lg text-white/60 max-w-3xl mx-auto font-medium leading-relaxed">
            A CyDef é uma empresa de cibersegurança em construção, desenhada
            desde o início para ser global. Nosso propósito é proteger pessoas,
            compartilhar conhecimento e contribuir para uma sociedade digital
            mais segura — e vamos construindo isso em fases, com transparência.
          </p>
        </div>
      </section>

      {/* O que é real hoje */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-neutral-900 border border-amber-500/20 rounded-2xl p-8 md:p-10 text-center animate-on-scroll">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
              Onde estamos agora
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              Estamos construindo o ecossistema em fases, sem atalhos. Hoje
              existe de verdade: a <strong className="text-white">CyDef Media</strong> (blog técnico
              com fontes) e a <strong className="text-white">CyDef Academy gratuita</strong> (pré-inscrição
              com confirmação). <strong className="text-white">Labs, Research e Consulting</strong> entram
              quando existirem de fato — nada de vitrine.
            </p>
            <Link to="/servicos" className="inline-flex items-center gap-2 mt-6 text-orange-400 hover:text-orange-300 transition-colors font-medium text-sm">
              Ver o que já é real <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Propósito, Visão, Ambição */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8 animate-on-scroll">
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
              <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                <Target className="h-7 w-7 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Propósito</h3>
              <p className="text-neutral-400 leading-relaxed">
                Proteger pessoas, compartilhar conhecimento e contribuir para
                uma sociedade digital mais segura. A CyDef existe porque
                acreditamos que cibersegurança é, antes de tudo, sobre pessoas.
              </p>
            </div>

            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
              <div className="h-14 w-14 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
                <Globe className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Visão</h3>
              <p className="text-neutral-400 leading-relaxed">
                Tornar-se uma referência global em cibersegurança, reconhecida
                por excelência técnica, parceria genuína, compartilhamento de
                conhecimento e contribuição real para o setor e para a
                sociedade.
              </p>
            </div>

            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
              <div className="h-14 w-14 rounded-xl bg-orange-600/10 flex items-center justify-center mb-6 border border-orange-600/20">
                <Lightbulb className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Ambição de longo prazo</h3>
              <p className="text-neutral-400 leading-relaxed mb-6">
                Um ecossistema global conectando conhecimento, educação,
                pesquisa, tecnologia e serviços profissionais — com a ambição
                de se tornar uma das empresas líderes do setor.
              </p>
              <div className="flex flex-wrap gap-2">
                {pilares.map((p) => (
                  <span key={p.nome} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-neutral-300">
                    {p.nome} · {p.papel}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Código CyDef */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              O Código CyDef
            </h2>
            <p className="text-white/60 text-lg">
              Princípios não negociáveis. Na CyDef, a forma como alcançamos um
              resultado importa tanto quanto o próprio resultado.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-on-scroll">
            {codigo.map((item, i) => (
              <div key={i} className="bg-neutral-900 border border-white/10 rounded-2xl p-8 hover:border-orange-500/30 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <item.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-xs font-mono text-neutral-500">0{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
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
            <Shield className="h-16 w-16 text-orange-500 mx-auto mb-6 opacity-80" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              Faça parte dessa construção
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
              Aprenda nos cursos gratuitos, leia o blog ou fale com a gente.
              Quem acompanha a CyDef desde o começo faz parte da história.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/academy" className="inline-block">
                <button className="button-custom" type="button">
                  <div className="points_wrapper">
                    <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                  </div>
                  <span className="inner flex items-center gap-2">Começar na Academy <ArrowRight className="w-4 h-4" /></span>
                </button>
              </Link>
              <Link to="/contato" className="inline-block">
                <button className="px-6 py-4 rounded-lg border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500 transition-colors font-medium text-sm" type="button">
                  Falar com a CyDef
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
