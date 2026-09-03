import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { L } from "@/lib/lang";
import { FileText, Mail } from "lucide-react";

const Terms = () => {
  useScrollReveal();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="container mx-auto text-center relative z-10 animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium mb-6">
            <FileText className="h-4 w-4" />
            {t("terms.badge")}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            {t("terms.h1a")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">{t("terms.h1b")}</span>
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-3xl space-y-8 animate-on-scroll">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">{t("terms.docTitle")}</h2>
            <p className="text-neutral-400 leading-relaxed">{t("terms.docBody")}</p>
          </div>

          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">{t("terms.nowTitle")}</h2>
            <p className="text-neutral-400 leading-relaxed mb-4">
              {t("terms.nowBody1")}{" "}
              <Link to={L("/privacidade")} className="text-orange-400 hover:text-orange-300 underline">
                {t("footer.privacy")}
              </Link>
            </p>
            <p className="text-neutral-400 leading-relaxed">
              {t("terms.nowBody2")}{" "}
              <a href="mailto:contato@cydef.com.br" className="text-orange-400 hover:text-orange-300 underline inline-flex items-center gap-1">
                <Mail className="h-4 w-4" /> contato@cydef.com.br
              </a>
            </p>
          </div>

          <p className="text-xs text-neutral-600 font-medium text-center">{t("terms.version")}</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
