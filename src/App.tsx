import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams, Outlet } from "react-router-dom";
import { lazy, Suspense, useEffect, useLayoutEffect, useState } from "react";
import i18n, { DEFAULT_LANG, ensureLang, htmlTitles, isLang, type Lang } from "./i18n";
import Index from "./pages/Index";
import { HeadSeo } from "./lib/head-seo";
import { JsonLd } from "./lib/seo";
import { orgLd, webSiteLd } from "./lib/seo-data";

/** Rotas fora do primeiro paint: carregadas sob demanda (P3-01 code-splitting).
 *  A home (Index) fica no chunk inicial — é o LCP de todas as entradas. */
const BlogPost = lazy(() => import("./pages/BlogPost"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AcademyLanding = lazy(() => import("./pages/AcademyLanding"));
const AcademyPrivacy = lazy(() => import("./pages/AcademyPrivacy"));
const AcademyStatusConfirmation = lazy(() => import("./pages/AcademyStatusConfirmation"));
const AcademyThankYou = lazy(() => import("./pages/AcademyThankYou"));
const AcademyLogin = lazy(() => import("./pages/AcademyLogin"));
const PageRouter = lazy(() =>
  import("./lib/SeoRouter").then((m) => ({ default: m.PageRouter })),
);
const CourseArea = lazy(() =>
  import("./lib/SeoRouter").then((m) => ({ default: m.CourseArea })),
);

/** Fallback discreto durante o carregamento do chunk da rota (navegação SPA). */
const RouteFallback = () => (
  <div className="min-h-screen bg-[#050505]" aria-busy="true" />
);

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/** URLs sem prefixo de idioma: raiz -> idioma padrão; rotas legadas (PT) -> /pt. */
const LangGate = () => {
  const { pathname } = useLocation();
  const first = pathname.split("/")[1];
  if (isLang(first)) return null;
  const rest = pathname === "/" ? "" : pathname;
  const to = rest ? `/pt${rest}` : `/${DEFAULT_LANG}`;
  return <Navigate to={to} replace />;
};

/** Aplica o idioma da URL ao i18n e ao documento.
 *  Dicionário do idioma carrega sob demanda (P3-01): só o do idioma ativo
 *  entra no chunk inicial; os demais vêm como chunk próprio (ensureLang).
 *  O <Outlet/> só monta com o dicionário correto — sem flash do idioma errado. */
const LangShell = () => {
  const { lang } = useParams();
  const effective: Lang = isLang(lang) ? lang : DEFAULT_LANG;
  // Idioma padrão (EN) já está no bundle: primeiro paint imediato na home.
  const [loaded, setLoaded] = useState<Lang | null>(
    effective === DEFAULT_LANG ? DEFAULT_LANG : null,
  );

  useLayoutEffect(() => {
    let alive = true;
    void ensureLang(effective).then(() => {
      if (!alive) return;
      if (i18n.language !== effective) void i18n.changeLanguage(effective);
      document.documentElement.lang = effective;
      document.title = htmlTitles[effective];
      setLoaded(effective);
    });
    return () => {
      alive = false;
    };
  }, [effective]);

  if (loaded !== effective) {
    return <div className="min-h-screen bg-[#050505]" aria-busy="true" />;
  }

  return (
    <>
      {/* Structured data global (NEX-P2-04) */}
      <JsonLd data={orgLd()} />
      <JsonLd data={webSiteLd(effective)} />
      <HeadSeo />
      <Outlet />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <LangGate />
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/:lang" element={<LangShell />}>
              <Route index element={<Index />} />
              {/* Páginas com slug localizado por idioma (P2-03) + aliases legados */}
              <Route path=":page" element={<PageRouter />} />
              {/* Conteúdo com slug universal */}
              <Route path="blog/:slug" element={<BlogPost />} />
              <Route path=":area/:courseId" element={<CourseArea />} />
              {/* CyDef Academy — landing de captura (fase protótipo/validação, S-02..S-06) */}
              <Route path="academy/gratuito" element={<AcademyLanding />} />
              <Route path="academy/privacidade/:versao" element={<AcademyPrivacy />} />
              <Route path="academy/status-confirmacao" element={<AcademyStatusConfirmation />} />
              <Route path="academy/obrigado" element={<AcademyThankYou />} />
              <Route path="academy/entrar" element={<AcademyLogin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
