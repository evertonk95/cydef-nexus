import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Shield, Target, Eye, Award, CheckCircle } from "lucide-react";

const About = () => {
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
            Sobre a CyDef
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            Especialistas em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">Cibersegurança</span>
          </h1>
          <p className="text-lg text-white/60 max-w-3xl mx-auto font-medium">
            Somos especialistas comprometidos em proteger
            organizações através de tecnologia avançada e expertise comprovada.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8 animate-on-scroll">
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                <Target className="h-7 w-7 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Missão</h3>
              <p className="text-neutral-400 leading-relaxed">
                Proteger organizações contra ameaças cibernéticas através de
                soluções inovadoras, expertise técnica e educação de
                excelência, tornando a segurança acessível e eficaz.
              </p>
            </div>

            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-14 w-14 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
                <Eye className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Visão</h3>
              <p className="text-neutral-400 leading-relaxed">
                Ser referência em serviços de Blue Team e educação em
                cibersegurança, reconhecida pela qualidade técnica e impacto
                na proteção de organizações globalmente.
              </p>
            </div>

            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="h-14 w-14 rounded-xl bg-orange-600/10 flex items-center justify-center mb-6 border border-orange-600/20">
                <Shield className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Valores</h3>
              <p className="text-neutral-400 leading-relaxed">
                Excelência técnica, ética profissional, inovação contínua,
                compromisso com resultados e desenvolvimento contínuo do ecossistema de
                segurança.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              Nossa Filosofia de Segurança
            </h2>
            <p className="text-white/60 text-lg">
              Trabalhamos com os frameworks e metodologias mais reconhecidos do
              mercado para garantir eficácia e conformidade em cada camada da sua defesa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 animate-on-scroll">
            {[
              {
                title: "NIST Cybersecurity Framework",
                desc: "Utilizamos o NIST CSF para estruturar nossos serviços em cinco pilares: Identificar, Proteger, Detectar, Responder e Recuperar, garantindo uma abordagem completa de segurança."
              },
              {
                title: "MITRE ATT&CK",
                desc: "Baseamos nossa detecção e resposta no framework MITRE ATT&CK, mapeando táticas e técnicas de adversários reais para defesa proativa e eficaz."
              },
              {
                title: "ISO/IEC 27001",
                desc: "Implementamos e auxiliamos na conformidade com ISO 27001, estabelecendo sistemas de gestão de segurança da informação robustos e auditáveis."
              },
              {
                title: "CIS Benchmarks",
                desc: "Aplicamos os CIS Benchmarks para hardening de sistemas, seguindo as melhores práticas reconhecidas internacionalmente para configuração segura."
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 bg-white/5 border border-white/10 rounded-xl hover:border-orange-500/30 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Differentials */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter">
              Diferenciais do Nosso Time
            </h2>
            <p className="text-white/60 text-lg">
              Profissionais experientes com vivência em ambientes corporativos
              complexos e projetos de alto impacto.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto animate-on-scroll">
            {[
              { icon: Award, title: "Especialistas SOC", desc: "Analistas experientes em detecção, investigação e resposta a incidentes de segurança" },
              { icon: Shield, title: "Projetos Reais", desc: "Experiência comprovada em detecção, resposta e hardening em ambientes críticos" },
              { icon: Eye, title: "Ambientes Corporativos", desc: "Conhecimento profundo em SIEM, EDR, Cloud Security e ferramentas enterprise" },
              { icon: Target, title: "Threat Hunting", desc: "Caça proativa a ameaças utilizando técnicas avançadas e inteligência contextual" },
              { icon: CheckCircle, title: "Compliance", desc: "Expertise em adequação a normas e frameworks regulatórios e de mercado" },
              { icon: Award, title: "Educação Técnica", desc: "Instrutores com experiência real compartilhando conhecimento prático e aplicável" }
            ].map((item, i) => (
              <div key={i} className="text-center space-y-4 p-6 rounded-2xl hover:bg-white/5 transition-colors duration-300">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-500/20 flex items-center justify-center mx-auto border border-orange-500/20">
                  <item.icon className="h-8 w-8 text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg text-white">{item.title}</h3>
                <p className="text-neutral-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
