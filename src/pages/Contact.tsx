import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
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
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve.",
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
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-primary-foreground mb-6">
            Entre em Contato
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Fale com nossos especialistas e descubra como podemos proteger sua
            organização ou ajudá-lo a avançar na carreira em cibersegurança.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Envie sua mensagem
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Seu nome"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    placeholder="Nome da empresa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Como podemos ajudar?"
                    rows={6}
                  />
                </div>

                <Button type="submit" variant="cyber" size="lg" className="w-full">
                  Enviar Mensagem
                  <Send className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Informações de Contato
                </h2>
                <p className="text-muted-foreground mb-8">
                  Entre em contato conosco por qualquer um dos canais abaixo.
                  Estamos prontos para atender você.
                </p>

                <div className="space-y-6">
                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center flex-shrink-0">
                          <Mail className="h-6 w-6 text-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            E-mail
                          </h3>
                          <a
                            href="mailto:contato@cydef.com.br"
                            className="text-secondary hover:text-accent transition-colors"
                          >
                            contato@cydef.com.br
                          </a>
                          <br />
                          <a
                            href="mailto:academy@cydef.com.br"
                            className="text-secondary hover:text-accent transition-colors"
                          >
                            academy@cydef.com.br
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center flex-shrink-0">
                          <Phone className="h-6 w-6 text-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            Telefone
                          </h3>
                          <a
                            href="tel:+5511999999999"
                            className="text-secondary hover:text-accent transition-colors"
                          >
                            +55 (11) 99999-9999
                          </a>
                          <p className="text-sm text-muted-foreground mt-1">
                            Seg - Sex: 9h às 18h
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-6 w-6 text-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">
                            Endereço
                          </h3>
                          <p className="text-muted-foreground">
                            São Paulo, SP
                            <br />
                            Brasil
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Office Hours */}
              <Card className="border-border/50 bg-gradient-hero">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-primary-foreground mb-4">
                    Horário de Atendimento
                  </h3>
                  <div className="space-y-2 text-primary-foreground/80">
                    <div className="flex justify-between">
                      <span>Segunda - Sexta</span>
                      <span className="font-medium">9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábado</span>
                      <span className="font-medium">9:00 - 13:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingo</span>
                      <span className="font-medium">Fechado</span>
                    </div>
                  </div>
                  <p className="text-sm text-primary-foreground/60 mt-4">
                    * SOC 24x7 disponível para clientes
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            Perguntas Frequentes
          </h2>

          <div className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Como funciona o processo de contratação dos serviços?
                </h3>
                <p className="text-muted-foreground">
                  Após o contato inicial, agendamos uma reunião para entender suas
                  necessidades. Em seguida, elaboramos uma proposta customizada com
                  escopo, prazos e valores. Após aprovação, iniciamos o onboarding.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Os cursos possuem certificado?
                </h3>
                <p className="text-muted-foreground">
                  Sim! Todos os cursos da CyDef Academy incluem certificado de
                  conclusão digital. Os preparatórios também fornecem material
                  completo para certificações de mercado.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Qual o prazo para início dos serviços de SOC?
                </h3>
                <p className="text-muted-foreground">
                  Dependendo da complexidade do ambiente, o onboarding completo leva
                  de 2 a 4 semanas. Isso inclui integração de ferramentas,
                  configuração de alertas e treinamento do time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Oferecem consultoria pontual ou apenas contratos recorrentes?
                </h3>
                <p className="text-muted-foreground">
                  Trabalhamos com ambos os modelos. Oferecemos consultorias pontuais
                  para projetos específicos e também contratos recorrentes para
                  serviços contínuos como SOC e Blue Team.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
