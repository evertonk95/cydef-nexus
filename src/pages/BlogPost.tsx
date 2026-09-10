import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  Calendar,
  ArrowLeft,
  Tag,
  ExternalLink,
  Lightbulb,
  FlaskConical,
  AlertTriangle,
  Info,
  ListTree,
  User,
} from "lucide-react";
import { getPostBySlug } from "@/lib/blog/posts.content";
import { L, currentLang } from "@/lib/lang";
import { htmlTitles } from "@/i18n";
import { JsonLd } from "@/lib/seo";
import { blogPostingLd } from "@/lib/seo-data";
import type {
  BlogPost,
  BlogSection,
  BlogBlock,
  BlogCallout,
  BlogTable,
  BlogFigure,
} from "@/lib/blog/posts";

/** Gera um id âncora estável a partir de um heading (acentos removidos). */
const slugify = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const CALLOUT_STYLE: Record<
  BlogCallout["kind"],
  { icon: typeof Lightbulb; color: string; label: string }
> = {
  regra: { icon: Lightbulb, color: "text-orange-400", label: "Regra" },
  exemplo: { icon: FlaskConical, color: "text-sky-400", label: "Exemplo" },
  ponto: { icon: AlertTriangle, color: "text-red-400", label: "Ponto crítico" },
  aviso: { icon: Info, color: "text-amber-400", label: "Aviso" },
};

const Callout = ({ callout }: { callout: BlogCallout }) => {
  const { t } = useTranslation();
  const style = CALLOUT_STYLE[callout.kind];
  const Icon = style.icon;
  const labelKey =
    callout.kind === "regra"
      ? "regra"
      : callout.kind === "exemplo"
        ? "exemplo"
        : callout.kind === "ponto"
          ? "ponto"
          : "aviso";
  return (
    <div className="my-5 flex gap-3 rounded-xl border border-white/10 bg-neutral-900/70 p-5">
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${style.color}`} />
      <div className="min-w-0">
        <p
          className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${style.color}`}
        >
          {callout.title ??
            t(`blogPost.callout.${labelKey}`)}
        </p>
        <p className="text-neutral-300 leading-relaxed text-[15px]">
          {callout.body}
        </p>
      </div>
    </div>
  );
};

const Table = ({ table }: { table: BlogTable }) => (
  <div className="my-5 overflow-x-auto rounded-xl border border-white/10">
    <table className="w-full min-w-[560px] border-collapse text-left">
      <thead>
        <tr className="bg-white/[0.03]">
          {table.headers.map((h, i) => (
            <th
              key={i}
              className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-orange-400 border-b border-white/10"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row, r) => (
          <tr key={r} className="border-b border-white/5 last:border-0">
            {row.map((cell, c) => (
              <td
                key={c}
                className="px-4 py-3 align-top text-sm text-neutral-300 leading-relaxed"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Figure = ({ figure }: { figure: BlogFigure }) => (
  <figure className="my-6">
    <div className="rounded-xl overflow-hidden border border-white/10">
      <img
        src={figure.src}
        alt={figure.alt}
        loading="lazy"
        className="w-full h-auto object-contain bg-[#0a0a0a]"
      />
    </div>
    {figure.caption && (
      <figcaption className="mt-3 text-center text-sm text-neutral-500">
        {figure.caption}
      </figcaption>
    )}
  </figure>
);

/** Renderiza **negrito** e [texto](url) inline */
const renderInline = (text: string, keyPrefix: string, baseKey: number) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${baseKey}-${i}`} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return (
        <a
          key={`${keyPrefix}-${baseKey}-${i}`}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors break-all"
        >
          {link[1]}
        </a>
      );
    }
    return <span key={`${keyPrefix}-${baseKey}-${i}`}>{part}</span>;
  });
};

const Block = ({ block, sectionIdx, blockIdx }: { block: BlogBlock; sectionIdx: number; blockIdx: number }) => {
  const key = `${sectionIdx}-${blockIdx}`;
  switch (block.type) {
    case "p":
      return (
        <p key={key} className="text-neutral-300 leading-relaxed mb-5 text-[17px]">
          {renderInline(block.text, "p", blockIdx)}
        </p>
      );
    case "list":
      return (
        <div key={key} className="bg-neutral-900/70 border border-white/10 rounded-xl p-5 my-5">
          {block.title && (
            <p className="font-bold text-orange-400 mb-2 text-sm uppercase tracking-wider">
              {block.title}
            </p>
          )}
          <ul className="space-y-2">
            {block.items.map((item, m) => (
              <li key={m} className="flex gap-3 text-neutral-300 leading-relaxed">
                <span className="text-orange-500 mt-1.5 shrink-0">▸</span>
                <span>{renderInline(item, "li", m)}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "code":
      return (
        <pre
          key={key}
          className="bg-black/60 border border-white/10 rounded-xl p-5 my-5 overflow-x-auto text-sm text-neutral-300 leading-relaxed font-mono"
        >
          {block.text}
        </pre>
      );
    case "table":
      return <div key={key}><Table table={block.table} /></div>;
    case "callout":
      return <div key={key}><Callout callout={block.callout} /></div>;
    case "figure":
      return <div key={key}><Figure figure={block.figure} /></div>;
    case "note":
      return (
        <p key={key} className="text-sm text-neutral-500 border-l-2 border-orange-500/50 pl-4 italic my-5">
          {block.text}
        </p>
      );
    default:
      return null;
  }
};

/** Renderiza uma seção — modo legado (campos soltos) ou modo blocos ordenados. */
const Section = ({
  section,
  sectionIdx,
}: {
  section: BlogSection;
  sectionIdx: number;
}) => {
  const { t } = useTranslation();
  if (section.blocks) {
    return (
      <div key={sectionIdx} className="mb-10">
        {section.heading && (
          <h2
            id={slugify(section.heading)}
            className="text-2xl md:text-3xl font-bold text-white mb-5 tracking-tight leading-snug scroll-mt-24"
          >
            {section.heading}
          </h2>
        )}
        {section.blocks.map((block, i) => (
          <Block key={i} block={block} sectionIdx={sectionIdx} blockIdx={i} />
        ))}
      </div>
    );
  }
  return (
    <div key={sectionIdx} className="mb-10">
      {section.heading && (
        <h2
          id={slugify(section.heading)}
          className="text-2xl md:text-3xl font-bold text-white mb-5 tracking-tight leading-snug scroll-mt-24"
        >
          {section.heading}
        </h2>
      )}
      {(section.paragraphs ?? []).map((p, j) => (
        <p key={j} className="text-neutral-300 leading-relaxed mb-5 text-[17px]">
          {renderInline(p, "p", j)}
        </p>
      ))}
      {section.lists &&
        section.lists.map((list, k) => (
          <div key={k} className="bg-neutral-900/70 border border-white/10 rounded-xl p-5 my-5">
            {list.title && (
              <p className="font-bold text-orange-400 mb-2 text-sm uppercase tracking-wider">
                {list.title}
              </p>
            )}
            <ul className="space-y-2">
              {list.items.map((item, m) => (
                <li key={m} className="flex gap-3 text-neutral-300 leading-relaxed">
                  <span className="text-orange-500 mt-1.5 shrink-0">▸</span>
                  <span>{renderInline(item, "li", m)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      {(section.paragraphsAfter ?? []).map((p, j) => (
        <p key={`after-${j}`} className="text-neutral-300 leading-relaxed mb-5 text-[17px]">
          {renderInline(p, "pa", j)}
        </p>
      ))}
      {section.code && (
        <pre className="bg-black/60 border border-white/10 rounded-xl p-5 my-5 overflow-x-auto text-sm text-neutral-300 leading-relaxed font-mono">
          {section.code}
        </pre>
      )}
      {section.note && (
        <p className="text-sm text-neutral-500 border-l-2 border-orange-500/50 pl-4 italic my-5">
          {section.note}
        </p>
      )}
    </div>
  );
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  useScrollReveal();
  const { t } = useTranslation();
  const post: BlogPost | undefined = slug
    ? getPostBySlug(slug, currentLang())
    : undefined;

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | ${t("blog.title")}`;
    }
    return () => {
      document.title = htmlTitles[currentLang()];
    };
  }, [post, t]);

  /** Seções com heading — base do TOC (artigos longos, `toc: true`). */
  const headings = useMemo(
    () =>
      post && post.toc
        ? post.sections
            .map((s, i) => ({ i, heading: s.heading }))
            .filter((s): s is { i: number; heading: string } => !!s.heading)
        : [],
    [post],
  );

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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-neutral-500 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{post.date}</span>
            </div>
            <span>{post.readTime}</span>
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
          </div>
          {post.authorRole && (
            <p className="text-sm text-neutral-500 mb-4">{post.authorRole}</p>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-neutral-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
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
          {/* TOC (artigos longos) */}
          {headings.length > 1 && (
            <nav
              aria-label={t("blogPost.tocLabel")}
              className="mb-12 rounded-xl border border-white/10 bg-neutral-900/60 p-6"
            >
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-orange-400 mb-4">
                <ListTree className="h-4 w-4" />
                {t("blogPost.tocTitle")}
              </p>
              <ol className="space-y-2">
                {headings.map(({ i, heading }) => (
                  <li key={i}>
                    <a
                      href={`#${slugify(heading)}`}
                      className="text-neutral-400 hover:text-orange-400 transition-colors text-[15px] leading-snug"
                    >
                      {heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {post.sections.map((section, i) => (
            <Section key={i} section={section} sectionIdx={i} />
          ))}

          {/* Fontes */}
          {post.sources.length > 0 && (
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
          )}
        </div>
      </article>

      {/* CTA — contextual (post.cta, F5) ou genérico fixo como fallback */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-3xl text-center animate-on-scroll">
          {post.cta ? (
            <>
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tighter">
                {post.cta.title}
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
                {post.cta.body}
              </p>
              <Link
                to={L(post.cta.to)}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-black font-bold rounded-xl transition-colors shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)]"
              >
                {post.cta.label}
              </Link>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
