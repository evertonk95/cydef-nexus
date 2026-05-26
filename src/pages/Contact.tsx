import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  useScrollReveal();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensagem enviada com sucesso!",
      description: "Nossa equipe entrará em contato em breve.",
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    });
  };

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
            {/* Contact Form */}
            <div className="animate-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tighter">
                Envie sua mensagem
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 group">
                  <label htmlFor="name" className="text-sm font-medium text-neutral-400 group-focus-within:text-orange-500 transition-colors">Nome Completo *</label>
                  <input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Seu nome"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2 group">
                  <label htmlFor="email" className="text-sm font-medium text-neutral-400 group-focus-within:text-orange-500 transition-colors">E-mail *</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <label htmlFor="phone" className="text-sm font-medium text-neutral-400 group-focus-within:text-orange-500 transition-colors">Telefone</label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="(00) 00000-0000"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <label htmlFor="company" className="text-sm font-medium text-neutral-400 group-focus-within:text-orange-500 transition-colors">Empresa</label>
                    <input
                      id="company"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      placeholder="Nome da empresa"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <label htmlFor="message" className="text-sm font-medium text-neutral-400 group-focus-within:text-orange-500 transition-colors">Mensagem *</label>
                  <textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Como podemos ajudar?"
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-none"
                  />
                </div>

                <button type="submit" className="button-custom w-full group !py-4">
                  <div className="points_wrapper">
                    <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                  </div>
                  <span className="inner flex items-center justify-center gap-2">
                    Enviar Mensagem
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </button>
              </form>
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
                      <a href="tel:+5511999999999" className="block text-neutral-400 hover:text-orange-400 transition-colors mb-1">
                        +55 (11) 99999-9999
                      </a>
                      <p className="text-sm text-neutral-500 font-medium">Seg - Sex: 9h às 18h</p>
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

              {/* Office Hours */}
              <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full"></div>
                <h3 className="text-2xl font-bold text-white mb-6 tracking-tight relative z-10">
                  Horário de Atendimento
                </h3>
                <div className="space-y-4 text-neutral-300 relative z-10">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span>Segunda - Sexta</span>
                    <span className="font-semibold text-white">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span>Sábado</span>
                    <span className="font-semibold text-white">9:00 - 13:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Domingo</span>
                    <span className="font-semibold text-orange-400">Fechado</span>
                  </div>
                </div>
                <p className="text-sm text-orange-500/80 font-medium mt-6 relative z-10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  SOC 24x7 disponível para clientes
                </p>
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
