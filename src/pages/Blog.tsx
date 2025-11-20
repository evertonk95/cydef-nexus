import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Tag } from "lucide-react";

const blogPosts = [
  {
    id: "1",
    title: "Como estruturar um SOC do zero: Guia completo",
    excerpt:
      "Aprenda os passos essenciais para criar um Centro de Operações de Segurança eficiente, desde o planejamento até a operação.",
    category: "SOC",
    author: "Equipe CyDef",
    date: "15 de Janeiro, 2025",
    readTime: "8 min",
  },
  {
    id: "2",
    title: "MITRE ATT&CK na prática: Detectando técnicas de adversários",
    excerpt:
      "Entenda como usar o framework MITRE ATT&CK para mapear ameaças e criar regras de detecção eficazes no seu ambiente.",
    category: "Blue Team",
    author: "Equipe CyDef",
    date: "10 de Janeiro, 2025",
    readTime: "10 min",
  },
  {
    id: "3",
    title: "Threat Hunting: Por onde começar?",
    excerpt:
      "Introdução ao threat hunting com metodologias, ferramentas e dicas práticas para caçar ameaças proativamente.",
    category: "Detecção e Resposta",
    author: "Equipe CyDef",
    date: "5 de Janeiro, 2025",
    readTime: "7 min",
  },
  {
    id: "4",
    title: "Hardening de servidores Linux com CIS Benchmarks",
    excerpt:
      "Passo a passo para implementar hardening em servidores Linux seguindo as recomendações do CIS Benchmark.",
    category: "Hardening",
    author: "Equipe CyDef",
    date: "28 de Dezembro, 2024",
    readTime: "12 min",
  },
  {
    id: "5",
    title: "Carreira em Cibersegurança: Certificações que fazem diferença",
    excerpt:
      "Análise das principais certificações de segurança e como escolher as mais adequadas para seu momento profissional.",
    category: "Carreira e Certificações",
    author: "Equipe CyDef",
    date: "20 de Dezembro, 2024",
    readTime: "6 min",
  },
  {
    id: "6",
    title: "Segurança em Cloud AWS: Melhores práticas essenciais",
    excerpt:
      "Guia prático de segurança para ambientes AWS com foco em IAM, VPC, CloudTrail e outros serviços críticos.",
    category: "Cloud Security",
    author: "Equipe CyDef",
    date: "15 de Dezembro, 2024",
    readTime: "9 min",
  },
  {
    id: "7",
    title: "Análise de logs: Identificando comportamentos maliciosos",
    excerpt:
      "Aprenda a correlacionar eventos de log e identificar padrões que indicam atividades suspeitas ou maliciosas.",
    category: "SOC",
    author: "Equipe CyDef",
    date: "10 de Dezembro, 2024",
    readTime: "11 min",
  },
  {
    id: "8",
    title: "Inteligência de Ameaças: Como usar IOCs efetivamente",
    excerpt:
      "Entenda como coletar, validar e aplicar Indicadores de Comprometimento no contexto de defesa proativa.",
    category: "Inteligência de Ameaças",
    author: "Equipe CyDef",
    date: "5 de Dezembro, 2024",
    readTime: "8 min",
  },
];

const categories = [
  "Todos",
  "SOC",
  "Blue Team",
  "Detecção e Resposta",
  "Hardening",
  "Cloud Security",
  "Carreira e Certificações",
  "Inteligência de Ameaças",
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-hero">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-primary-foreground mb-6">
            Blog CyDef
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Artigos técnicos, guias práticos e insights sobre cibersegurança,
            Blue Team e SOC escritos por especialistas.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 border-b border-border">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === "Todos"
                    ? "bg-gradient-cyber text-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary/20 hover:text-secondary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card
                key={post.id}
                className="border-border/50 hover:border-secondary transition-all hover:shadow-card group"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-secondary" />
                    <span className="text-sm text-secondary font-medium">
                      {post.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground group-hover:text-secondary transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-muted-foreground">{post.excerpt}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{post.date}</span>
                      </div>
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <button className="inline-flex items-center text-secondary hover:text-accent transition-colors font-medium">
                    Ler artigo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination placeholder */}
          <div className="mt-12 flex justify-center gap-2">
            <button className="px-4 py-2 rounded bg-gradient-cyber text-foreground font-medium">
              1
            </button>
            <button className="px-4 py-2 rounded bg-muted text-muted-foreground hover:bg-secondary/20 hover:text-secondary transition-all">
              2
            </button>
            <button className="px-4 py-2 rounded bg-muted text-muted-foreground hover:bg-secondary/20 hover:text-secondary transition-all">
              3
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold text-foreground">
              Receba conteúdo exclusivo
            </h2>
            <p className="text-muted-foreground text-lg">
              Cadastre-se para receber artigos, guias e novidades sobre
              cibersegurança diretamente no seu e-mail.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button className="px-6 py-3 bg-gradient-cyber text-foreground font-semibold rounded-md hover:shadow-glow hover:scale-105 transition-all">
                Inscrever-se
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Sem spam. Apenas conteúdo de qualidade.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
