import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { L } from "@/lib/lang";
import type { BlogPostMeta } from "@/lib/blog/posts";
import type { AcademyCourseCard } from "@/lib/academy/catalog";

/**
 * Secoes da home alimentadas por dado real (issue #143).
 * Cada componente devolve null quando a fonte vem vazia, entao a secao some
 * sozinha quando nao ha conteudo publicado no idioma.
 */

const SectionHeading = ({
  id,
  title,
  lead,
  cta,
  href,
}: {
  id: string;
  title: string;
  lead: string;
  cta: string;
  href: string;
}) => (
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 px-6 md:px-10">
    <div>
      <h2 id={id} className="text-3xl md:text-4xl font-bold tracking-tighter text-white mb-2">
        {title}
      </h2>
      <p className="text-neutral-400 max-w-xl">{lead}</p>
    </div>
    <Link
      to={href}
      className="inline-flex items-center gap-2 text-sm font-medium text-orange-400 hover:text-orange-300 transition-colors duration-200"
    >
      {cta}
      <ArrowRight className="w-4 h-4" aria-hidden="true" />
    </Link>
  </div>
);

export const PostsSection = ({ posts }: { posts: BlogPostMeta[] }) => {
  const { t } = useTranslation();
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="home-artigos" className="mt-8 pt-16 pb-8 border-t border-white/5">
      <SectionHeading
        id="home-artigos"
        title={t("home.blogSectionTitle")}
        lead={t("home.blogSectionLead")}
        cta={t("home.blogSectionCta")}
        href={L("/blog")}
      />
      <div className="grid md:grid-cols-3 gap-6 px-6 md:px-10">
        {posts.map((post) => (
          <Link
            key={post.slug}
            to={L(`/blog/${post.slug}`)}
            className="group bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-colors duration-200 flex flex-col"
          >
            <div className="aspect-[16/10] overflow-hidden bg-neutral-950">
              <img
                src={post.image}
                alt=""
                width={640}
                height={400}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
              />
            </div>
            <div className="p-6 flex flex-col gap-3 flex-1">
              <span className="text-xs font-medium text-neutral-500">{post.date}</span>
              <h3 className="text-lg font-semibold text-white leading-snug group-hover:text-orange-400 transition-colors duration-200">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export const AcademySection = ({ courses }: { courses: AcademyCourseCard[] }) => {
  const { t } = useTranslation();
  if (courses.length === 0) return null;

  return (
    <section aria-labelledby="home-academy" className="mt-8 pt-16 pb-8 border-t border-white/5">
      <SectionHeading
        id="home-academy"
        title={t("home.academySectionTitle")}
        lead={t("home.academySectionLead")}
        cta={t("home.academySectionCta")}
        href={L("/academy")}
      />
      <div className="grid md:grid-cols-3 gap-6 px-6 md:px-10">
        {courses.map((curso) => (
          <Link
            key={curso.id}
            to={L("/academy")}
            className="group bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-colors duration-200 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-orange-500/10 border border-orange-500/30 text-orange-400">
                {t(`academy.level.${curso.levelKey}`)}
              </span>
              <span className="text-xs font-medium text-neutral-500">{curso.duration}</span>
            </div>
            <h3 className="text-lg font-semibold text-white leading-snug group-hover:text-orange-400 transition-colors duration-200">
              {t(`academy.courses.${curso.id}`)}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export const LabsSection = ({ visible }: { visible: boolean }) => {
  const { t } = useTranslation();
  if (!visible) return null;

  return (
    <section aria-labelledby="home-labs" className="mt-8 pt-16 pb-24 border-t border-white/5">
      <div className="px-6 md:px-10">
        <h2 id="home-labs" className="text-3xl md:text-4xl font-bold tracking-tighter text-white mb-2">
          {t("home.labsSectionTitle")}
        </h2>
        <p className="text-neutral-400 max-w-xl mb-10">{t("home.labsSectionLead")}</p>
        <Link
          to={L("/labs")}
          className="group block bg-neutral-900 border border-white/10 rounded-3xl p-8 md:p-10 hover:border-orange-500/50 transition-colors duration-200"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors duration-200">
                {t("labs.inoraName")}
              </h3>
              <p className="text-orange-400/90 text-sm font-medium mt-1">{t("labs.inoraRole")}</p>
            </div>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border bg-amber-500/10 border-amber-500/30 text-amber-400">
              {t("labs.inoraState")}
            </span>
          </div>
          <p className="text-neutral-300 leading-relaxed line-clamp-3">{t("labs.inoraBody")}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-orange-400">
            {t("home.labsSectionCta")}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </section>
  );
};
