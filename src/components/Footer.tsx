import { Link } from "react-router-dom";
import { Linkedin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { L, waLink } from "@/lib/lang";
import { LANDING_PATH } from "@/lib/config";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const linkClass = "text-sm text-neutral-400 hover:text-white transition-colors";

  return (
    <footer className="overflow-hidden group bg-[#050505] w-full border-white/5 border-t relative">
      <div className="pointer-events-none z-0 absolute top-0 right-0 bottom-0 left-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/80"></div>
      </div>

      <div className="md:px-10 max-w-7xl relative mx-auto w-full pt-16 pr-6 pb-16 pl-6 z-10 flex flex-col">
        <div className="flex flex-col md:flex-row gap-12 md:gap-8 justify-between border-b border-white/5 pb-16">

          {/* Brand */}
          <div className="flex flex-col gap-4 max-w-sm">
            <Link to={L("/")} className="flex items-center gap-2.5 group cursor-pointer">
              <img src="/assets/cydef-icon.webp" alt="CyDef" className="h-10 w-10 rounded-full" />
              <img src="/assets/cydef-wordmark.png" alt="CyDef" className="h-8 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed text-neutral-400 mt-2">
              {t("footer.sub")}
            </p>
            <div className="flex gap-3 items-center mt-1">
              <a href="https://www.linkedin.com/company/cydef-group/" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href={waLink(t("contact.waMsg"))} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors text-xs font-medium">
                WhatsApp
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
            {/* Academy */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-white">{t("footer.academyTitle")}</span>
              <div className="flex flex-col gap-2">
                <Link to={L("/academy")} className={linkClass}>{t("footer.allCourses")}</Link>
                <Link to={L(LANDING_PATH)} className={linkClass}>{t("footer.freeEnrollment")}</Link>
              </div>
            </div>

            {/* Empresa */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-white">{t("footer.companyTitle")}</span>
              <div className="flex flex-col gap-2">
                <Link to={L("/sobre")} className={linkClass}>{t("nav.about")}</Link>
                <Link to={L("/blog")} className={linkClass}>{t("nav.blog")}</Link>
                <Link to={L("/servicos")} className={linkClass}>{t("footer.whatWeBuild")}</Link>
                <Link to={L("/contato")} className={linkClass}>{t("contact.badge")}</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-500 font-medium">
            {t("footer.rights", { year })}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-600 font-medium">{t("footer.language")}</span>
            <LanguageSwitcher />
          </div>
          <div className="flex gap-4 text-xs font-medium text-neutral-500">
            <Link to={L("/privacidade")} className="hover:text-white transition-colors">{t("footer.privacy")}</Link>
            <span className="text-neutral-700">|</span>
            <Link to={L("/termos")} className="hover:text-white transition-colors">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
