import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Shield, Target, Eye, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-primary-foreground mb-6">
            Sobre a CyDef
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Somos especialistas em cibersegurança comprometidos em proteger
            organizações através de tecnologia avançada e expertise comprovada.
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 hover:border-secondary transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="h-14 w-14 rounded-lg bg-gradient-cyber flex items-center justify-center">
                  <Target className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Missão</h3>
                <p className="text-muted-foreground">
                  Proteger organizações contra ameaças cibernéticas através de
                  soluções inovadoras, expertise técnica e educação de
                  excelência, tornando a segurança acessível e eficaz.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="h-14 w-14 rounded-lg bg-gradient-cyber flex items-center justify-center">
                  <Eye className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Visão</h3>
                <p className="text-muted-foreground">
                  Ser referência em serviços de Blue Team e educação em
                  cibersegurança, reconhecida pela qualidade técnica e impacto
                  na proteção de organizações.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:border-secondary transition-all">
              <CardContent className="p-8 space-y-4">
                <div className="h-14 w-14 rounded-lg bg-gradient-cyber flex items-center justify-center">
                  <Shield className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Valores</h3>
                <p className="text-muted-foreground">
                  Excelência técnica, ética profissional, inovação contínua,
                  compromisso com resultados e desenvolvimento do ecossistema de
                  segurança.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-foreground mb-8 text-center">
              Nossa Filosofia de Segurança
            </h2>
            <p className="text-muted-foreground text-lg mb-12 text-center">
              Trabalhamos com os frameworks e metodologias mais reconhecidos do
              mercado para garantir eficácia e conformidade.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-border/50">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    NIST Cybersecurity Framework
                  </h3>
                  <p className="text-muted-foreground">
                    Utilizamos o NIST CSF para estruturar nossos serviços em
                    cinco pilares: Identificar, Proteger, Detectar, Responder e
                    Recuperar, garantindo uma abordagem completa de segurança.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    MITRE ATT&CK
                  </h3>
                  <p className="text-muted-foreground">
                    Baseamos nossa detecção e resposta no framework MITRE
                    ATT&CK, mapeando táticas e técnicas de adversários reais
                    para defesa proativa e eficaz.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    ISO/IEC 27001
                  </h3>
                  <p className="text-muted-foreground">
                    Implementamos e auxiliamos na conformidade com ISO 27001,
                    estabelecendo sistemas de gestão de segurança da informação
                    robustos e auditáveis.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    CIS Benchmarks
                  </h3>
                  <p className="text-muted-foreground">
                    Aplicamos os CIS Benchmarks para hardening de sistemas,
                    seguindo as melhores práticas reconhecidas
                    internacionalmente para configuração segura.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Team Differentials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Diferenciais do Nosso Time
            </h2>
            <p className="text-muted-foreground text-lg">
              Profissionais experientes com vivência em ambientes corporativos
              complexos e projetos de alto impacto.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                <Award className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground">
                Especialistas SOC
              </h3>
              <p className="text-muted-foreground text-sm">
                Analistas experientes em detecção, investigação e resposta a
                incidentes de segurança
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground">
                Projetos Reais
              </h3>
              <p className="text-muted-foreground text-sm">
                Experiência comprovada em detecção, resposta e hardening em
                ambientes críticos
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                <Eye className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground">
                Ambientes Corporativos
              </h3>
              <p className="text-muted-foreground text-sm">
                Conhecimento profundo em SIEM, EDR, Cloud Security e
                ferramentas enterprise
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                <Target className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground">
                Threat Hunting
              </h3>
              <p className="text-muted-foreground text-sm">
                Caça proativa a ameaças utilizando técnicas avançadas e
                inteligência contextual
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground">
                Compliance
              </h3>
              <p className="text-muted-foreground text-sm">
                Expertise em adequação a normas e frameworks regulatórios e de
                mercado
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                <Award className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground">
                Educação Técnica
              </h3>
              <p className="text-muted-foreground text-sm">
                Instrutores com experiência real compartilhando conhecimento
                prático e aplicável
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
