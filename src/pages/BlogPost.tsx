import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Calendar, ArrowLeft, Tag, ExternalLink } from "lucide-react";
import { getPostBySlug } from "@/lib/blog/posts.content";
import { L, currentLang } from "@/lib/lang";
import { htmlTitles } from "@/i18n";
import { JsonLd } from "@/lib/seo";
import { blogPostingLd } from "@/lib/seo-data";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  useScrollReveal();
  const { t } = useTranslation();
  const post = slug ? getPostBySlug(slug, currentLang()) : undefined;

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | ${t("blog.title")}`;
    }
    return () => {
      document.title = htmlTitles[currentLang()];
    };
  }, [post, t]);

  // Renderiza **negrito** e [texto](url) inline
  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
      if (link) {
        return (
          <a
            key={i}
            href={link[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors"
          >
            {link[1]}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
        <Navigation />
        <main id="conteudo" tabIndex={-1} className="outline-none">
        <section className="relative pt-48 pb-32 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tighter">
            {t("blogPost.notFoundTitle")}
          </h1>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            {t("blogPost.notFoundBody")}
          </p>
          <Link
            to={L("/blog")}
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-black font-bold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t("blogPost.back")}
          </Link>
        </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      {/* Structured data: BlogPosting (NEX-P2-04) */}
      <JsonLd data={blogPostingLd(post, currentLang())} />
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="outline-none">

      {/* Hero */}
      <section className="relative pt-40 pb-12 px-4 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="container mx-auto max-w-4xl relative z-10 animate-on-scroll">
          <Link
            to={L("/blog")}
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-orange-400 transition-colors text-sm font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> {t("blogPost.back")}
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium mb-6">
            <Tag className="h-4 w-4" />
            {post.category}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tighter leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm font-medium text-neutral-500 mb-8">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{post.date}</span>
            </div>
            <span>{post.readTime}</span>
            <span>· {post.author}</span>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      <section className="px-4">
        <div className="container mx-auto max-w-4xl animate-on-scroll">
          <div className="rounded-2xl overflow-hidden border border-white/10">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto object-cover"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Article Body */}
      <article className="py-16 px-4">
        <div className="container mx-auto max-w-3xl animate-on-scroll">
          {post.sections.map((section, i) => (
            <div key={i} className="mb-10">
              {section.heading && (
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-5 tracking-tight leading-snug">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((p, j) => (
                <p key={j} className="text-neutral-300 leading-relaxed mb-5 text-[17px]">
                  {renderInline(p)}
                </p>
              ))}
              {section.lists && (
                <div className="space-y-4 my-5">
                  {section.lists.map((list, k) => (
                    <div
                      key={k}
                      className="bg-neutral-900/70 border border-white/10 rounded-xl p-5"
                    >
                      {list.title && (
                        <h3 className="font-bold text-orange-400 mb-2 text-sm uppercase tracking-wider">
                          {list.title}
                        </h3>
                      )}
                      <ul className="space-y-2">
                        {list.items.map((item, m) => (
                          <li key={m} className="flex gap-3 text-neutral-300 leading-relaxed">
                            <span className="text-orange-500 mt-1.5 shrink-0">▸</span>
                            <span>{renderInline(item)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {section.paragraphsAfter?.map((p, j) => (
                <p key={`after-${j}`} className="text-neutral-300 leading-relaxed mb-5 text-[17px]">
                  {renderInline(p)}
                </p>
              ))}
              {section.code && (
                <pre className="bg-black/60 border border-white/10 rounded-xl p-5 my-5 overflow-x-auto text-sm text-neutral-300 leading-relaxed font-mono">
                  {section.code}
                </pre>
              )}
              {section.note && (
                <p className="text-sm text-neutral-500 border-l-2 border-orange-500/50 pl-4 italic">
                  {section.note}
                </p>
              )}
            </div>
          ))}

          {/* Fontes */}
          <div className="mt-14 bg-neutral-900/70 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">{t("blogPost.sourcesTitle")}</h2>
            <ul className="space-y-2">
              {post.sources.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors font-medium break-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {post.changelog && post.changelog.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">
                {t("blogPost.changelogTitle")}
              </h2>
              <ul className="space-y-1 text-sm text-neutral-500">
                {post.changelog.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-3xl text-center animate-on-scroll">
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tighter">
            {t("blogPost.ctaTitle")}
          </h2>
          <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
            {t("blogPost.ctaBody")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={L("/servicos")}
              className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-black font-bold rounded-xl transition-colors shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)]"
            >
              {t("blogPost.ctaSoc")}
            </Link>
            <Link
              to={L("/academy")}
              className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
            >
              {t("blogPost.ctaAcademy")}
            </Link>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
