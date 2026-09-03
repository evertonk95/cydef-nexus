import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { blogPosts } from "@/lib/blog/posts";

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
  useScrollReveal();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const filteredPosts =
    activeCategory === "Todos"
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="container mx-auto text-center relative z-10 animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium mb-6">
            <Tag className="h-4 w-4" />
            Insights & Artigos
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            Blog <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">CyDef</span>
          </h1>
          <p className="text-lg text-white/60 max-w-3xl mx-auto font-medium">
            Artigos técnicos, guias práticos e insights sobre cibersegurança,
            Blue Team e SOC escritos por especialistas.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 border-b border-white/5 relative z-20">
        <div className="container mx-auto animate-on-scroll">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                  category === activeCategory
                    ? "bg-orange-500/10 border-orange-500/50 text-orange-400 shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)]"
                    : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-on-scroll">
            {filteredPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)] transition-all duration-300 group flex flex-col h-full cursor-pointer"
              >
                <div className="rounded-xl overflow-hidden border border-white/10 mb-4">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-4 leading-tight group-hover:text-orange-400 transition-colors">
                  {post.title}
                </h3>

                <p className="text-neutral-400 text-sm leading-relaxed mb-6 flex-grow">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                  <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{post.date}</span>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 px-4 relative overflow-hidden border-t border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-orange-500/5 blur-[150px] -z-10 pointer-events-none"></div>
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-3xl p-12 text-center relative backdrop-blur-md animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tighter">
              Em breve: CyDef Brief
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
              Nossa newsletter ainda está em preparação (NEX-P2-02). Enquanto
              isso, os artigos do blog e o LinkedIn da CyDef seguem no ar —
              sem cadastro, sem ruído.
            </p>
            <a
              href="https://www.linkedin.com/company/cydef-group/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)]"
            >
              Seguir a CyDef no LinkedIn
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
