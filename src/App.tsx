import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Academy from "./pages/Academy";
import CoursePage from "./pages/CoursePage";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import AcademyLanding from "./pages/AcademyLanding";
import AcademyPrivacy from "./pages/AcademyPrivacy";
import AcademyStatusConfirmation from "./pages/AcademyStatusConfirmation";
import AcademyThankYou from "./pages/AcademyThankYou";
import AcademyLogin from "./pages/AcademyLogin";
import { LANDING_PATH } from "./lib/config";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/servicos" element={<Services />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/cursos/:courseId" element={<CoursePage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/termos" element={<Terms />} />
          {/* CyDef Academy — landing de captura (fase protótipo/validação, S-02..S-06) */}
          <Route path={LANDING_PATH} element={<AcademyLanding />} />
          <Route path="/academy/privacidade/:versao" element={<AcademyPrivacy />} />
          <Route path="/academy/status-confirmacao" element={<AcademyStatusConfirmation />} />
          <Route path="/academy/obrigado" element={<AcademyThankYou />} />
          <Route path="/academy/entrar" element={<AcademyLogin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
