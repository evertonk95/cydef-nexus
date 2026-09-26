import { Navigate, useParams } from "react-router-dom";
import { DEFAULT_LANG, isLang, type Lang } from "@/i18n";
import { areaSlugFor, pageKeyForSlug, slugFor, type PageKey } from "@/lib/routes";
import { PAGE_COMPONENTS } from "@/lib/page-components";
import NotFound from "../pages/NotFound";
import CoursePage from "../pages/CoursePage";

import { SITE_ORIGIN } from "@/lib/site";
export { SITE_ORIGIN };
/** Resolves a first-segment page (localized slugs + alias redirects).
 *  O componente de cada página vem de `PAGE_COMPONENTS`
 *  (src/lib/page-components.ts): mapa tipado por `PageKey`, então página nova
 *  sem componente não passa no typecheck e não chega aqui como NotFound. */
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

  const Page = PAGE_COMPONENTS[key];
  return <Page />;
};

/** Área de cursos com slug localizado + redirect de área legada. */
export const CourseArea = () => {
  const { lang, area, courseId } = useParams();
  const l: Lang = isLang(lang) ? lang : DEFAULT_LANG;
  const allowed = areaSlugFor("courses", l);
  if (!area) return <NotFound />;
  if (area !== allowed) {
    // Slug de área de outro idioma (ex.: /en/cursos/x, /pt/courses/x) → canônico.
    const known = (["pt", "en", "es"] as Lang[]).some(
      (lg) => areaSlugFor("courses", lg) === area,
    );
    if (!known) return <NotFound />;
    return <Navigate to={`/${l}/${allowed}/${courseId}`} replace />;
  }
  return <CoursePage />;
};
