import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { L } from "@/lib/lang";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="outline-none">
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <p className="text-8xl font-bold text-white/10 tracking-tighter mb-6">404</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{t("notfound.title")}</h1>
        <p className="text-neutral-400 max-w-md mb-10">{t("notfound.body")}</p>
        <Link to={L("/")}>
          <button className="button-custom" type="button">
            <span className="inner">{t("notfound.home")}</span>
          </button>
        </Link>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
