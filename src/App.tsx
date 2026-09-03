import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams, Outlet } from "react-router-dom";
import { useEffect } from "react";
import i18n, { DEFAULT_LANG, htmlTitles, isLang } from "./i18n";
import Index from "./pages/Index";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import AcademyLanding from "./pages/AcademyLanding";
import AcademyPrivacy from "./pages/AcademyPrivacy";
import AcademyStatusConfirmation from "./pages/AcademyStatusConfirmation";
import AcademyThankYou from "./pages/AcademyThankYou";
import AcademyLogin from "./pages/AcademyLogin";
import { PageRouter, CourseArea, HeadSeo } from "./lib/SeoRouter";

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

/** Aplica o idioma da URL ao i18n e ao documento. */
const LangShell = () => {
  const { lang } = useParams();
  const effective = isLang(lang) ? lang : DEFAULT_LANG;

  useEffect(() => {
    if (i18n.language !== effective) {
      void i18n.changeLanguage(effective);
    }
    document.documentElement.lang = effective;
    document.title = htmlTitles[effective];
  }, [effective]);

  return (
    <>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
