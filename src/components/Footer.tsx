import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { L, waLink } from "@/lib/lang";
import { LANDING_PATH } from "@/lib/config";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

/** Ícone do LinkedIn: a lucide-react 1.x removeu os ícones de marca, então o glifo
 *  oficial fica inline aqui (evita dependência extra só por um ícone). */
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
  </svg>
);

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
              <img src="/assets/cydef-icon.webp" alt="" className="h-10 w-10 rounded-full" />
              <img src="/assets/cydef-wordmark.png" alt="CyDef" className="h-8 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed text-neutral-400 mt-2">
              {t("footer.sub")}
            </p>
            <div className="flex gap-3 items-center mt-1">
              <a href="https://www.linkedin.com/company/cydef-group/" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors" aria-label="LinkedIn">
                <LinkedinIcon className="h-4 w-4" />
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
                <Link to={L("/labs")} className={linkClass}>{t("nav.labs")}</Link>
                <Link to={L("/research")} className={linkClass}>{t("footer.research")}</Link>
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
            <span className="text-xs text-neutral-500 font-medium">{t("footer.language")}</span>
            <LanguageSwitcher />
          </div>
          <div className="flex gap-4 text-xs font-medium text-neutral-500">
            <Link to={L("/privacidade")} className="hover:text-white transition-colors">{t("footer.privacy")}</Link>
            <span className="text-neutral-700" aria-hidden="true">|</span>
            <Link to={L("/termos")} className="hover:text-white transition-colors">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
