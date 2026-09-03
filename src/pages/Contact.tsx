import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";

const Contact = () => {
  useScrollReveal();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="container mx-auto text-center relative z-10 animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium mb-6">
            <MessageSquare className="h-4 w-4" />
            Fale Conosco
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            Entre em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">Contato</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto font-medium">
            Fale com nossos especialistas e descubra como podemos proteger sua
            organização ou ajudá-lo a avançar na carreira em cibersegurança.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
            {/* Contact — canais diretos. Formulário web em implantação (NEX-P0-02):
                nenhuma ação reporta sucesso sem backend real. */}
            <div className="animate-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tighter">
                Fale com a CyDef
              </h2>
              <p className="text-neutral-400 text-lg mb-8">
                Nosso formulário web está em implantação. Enquanto isso, escreva
                direto para a equipe — responderemos por e-mail.
              </p>

              <div className="space-y-4">
                <a
                  href="mailto:contato@cydef.com.br"
                  className="flex items-start gap-5 bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-colors group"
                >
                  <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                    <Mail className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                      Soluções para empresas
                    </h3>
                    <p className="text-neutral-400 break-all">contato@cydef.com.br</p>
                  </div>
                </a>

                <a
                  href="mailto:academy@cydef.com.br"
                  className="flex items-start gap-5 bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-colors group"
                >
                  <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                    <Mail className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                      CyDef Academy
                    </h3>
                    <p className="text-neutral-400 break-all">academy@cydef.com.br</p>
                  </div>
                </a>

                <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-2">
                    Horário de resposta
                  </h3>
                  <p className="text-neutral-400">
                    Atendemos em horário comercial — fora dele, retornamos no
                    próximo dia útil.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-8 animate-on-scroll" style={{ animationDelay: '150ms' }}>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tighter">
                  Informações de Contato
                </h2>
                <p className="text-neutral-400 text-lg mb-10">
                  Entre em contato conosco por qualquer um dos canais abaixo.
                  Estamos prontos para atender você.
                </p>

                <div className="space-y-6">
                  <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-colors flex items-start gap-6">
                    <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                      <Mail className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">E-mail</h3>
                      <div className="space-y-1">
                        <a href="mailto:contato@cydef.com.br" className="block text-neutral-400 hover:text-orange-400 transition-colors">
                          contato@cydef.com.br
                        </a>
                        <a href="mailto:academy@cydef.com.br" className="block text-neutral-400 hover:text-orange-400 transition-colors">
                          academy@cydef.com.br
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-colors flex items-start gap-6">
                    <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                      <Phone className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Telefone</h3>
                      <a href="tel:+15086305886" className="block text-neutral-400 hover:text-orange-400 transition-colors">
                        +1 (508) 630-5886
                      </a>
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-colors flex items-start gap-6">
                    <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                      <MapPin className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Endereço</h3>
                      <p className="text-neutral-400 leading-relaxed">
                        São Paulo, SP<br />Brasil
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5 relative">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center tracking-tighter animate-on-scroll">
            Perguntas Frequentes
          </h2>

          <div className="space-y-6 animate-on-scroll">
            {[
              {
                q: "Como funciona o processo de contratação dos serviços?",
                a: "Após o contato inicial, agendamos uma reunião para entender suas necessidades. Em seguida, elaboramos uma proposta customizada com escopo, prazos e valores. Após aprovação, iniciamos o onboarding."
              },
              {
                q: "Os cursos possuem certificado?",
                a: "Sim! Todos os cursos da CyDef Academy incluem certificado de conclusão digital. Os preparatórios também fornecem material completo para certificações de mercado."
              },
              {
                q: "Qual o prazo para início dos serviços de SOC?",
                a: "Dependendo da complexidade do ambiente, o onboarding completo leva de 2 a 4 semanas. Isso inclui integração de ferramentas, configuração de alertas e treinamento do time."
              },
              {
                q: "Oferecem consultoria pontual ou apenas contratos recorrentes?",
                a: "Trabalhamos com ambos os modelos. Oferecemos consultorias pontuais para projetos específicos e também contratos recorrentes para serviços contínuos como SOC e Blue Team."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-neutral-900 border border-white/10 rounded-2xl p-8 hover:border-orange-500/30 transition-colors">
                <h3 className="text-xl font-bold text-white mb-4">{faq.q}</h3>
                <p className="text-neutral-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
