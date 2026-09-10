import { Navigate, useParams } from "react-router-dom";
import { DEFAULT_LANG, isLang, type Lang } from "@/i18n";
import { pageKeyForSlug, slugFor, type PageKey } from "@/lib/routes";
import About from "../pages/About";
import Services from "../pages/Services";
import Labs from "../pages/Labs";
import Research from "../pages/Research";
import Academy from "../pages/Academy";
import Blog from "../pages/Blog";
import Contact from "../pages/Contact";
import Privacy from "../pages/Privacy";
import Terms from "../pages/Terms";
import NotFound from "../pages/NotFound";
import CoursePage from "../pages/CoursePage";

import { SITE_ORIGIN } from "@/lib/site";
export { SITE_ORIGIN };
/** Resolves a first-segment page (localized slugs + alias redirects). */
export const PageRouter = () => {
  const { lang, page } = useParams();
  const l: Lang = isLang(lang) ? lang : DEFAULT_LANG;
  if (!page) return <NotFound />;

  let key: PageKey | undefined = pageKeyForSlug(l, page);
  if (!key) {
    // Alias vindo de outro idioma (ex.: /en/sobre, /es/sobre, /pt/about): redireciona
    // para o slug canônico do idioma atual.
    for (const other of ["pt", "en", "es"] as Lang[]) {
      const k = pageKeyForSlug(other, page);
      if (k) {
        key = k;
        break;
      }
    }
  }
  if (!key) return <NotFound />;
  const canonical = slugFor(key, l);
  if (page !== canonical) return <Navigate to={`/${l}/${canonical}`} replace />;

  switch (key) {
    case "about":
      return <About />;
    case "ecosystem":
      return <Services />;
    case "academy":
      return <Academy />;
    case "labs":
      return <Labs />;
    case "research":
      return <Research />;
    case "blog":
      return <Blog />;
    case "contact":
      return <Contact />;
    case "privacy":
      return <Privacy />;
    case "terms":
      return <Terms />;
    default:
      return <NotFound />;
  }
};

/** Área de cursos com slug localizado + redirect de área legada. */
export const CourseArea = () => {
  const { lang, area, courseId } = useParams();
  const l: Lang = isLang(lang) ? lang : DEFAULT_LANG;
  const allowed = slugFor("courses", l);
  if (!area) return <NotFound />;
  if (area !== allowed) {
    // Slug de área de outro idioma (ex.: /en/cursos/x, /pt/courses/x) → canônico.
    const known = (["pt", "en", "es"] as Lang[]).some(
      (lg) => slugFor("courses", lg) === area,
    );
    if (!known) return <NotFound />;
    return <Navigate to={`/${l}/${allowed}/${courseId}`} replace />;
  }
  return <CoursePage />;
};
