import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { L, waLink } from "@/lib/lang";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SkipLink } from "@/components/SkipLink";

export const Navigation = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const itemClass = "text-xs font-medium tracking-widest uppercase hover:text-white transition-colors text-neutral-400";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 animate-fadeSlideIn">
      <SkipLink />
      <div className="container mx-auto">
        <div className="flex items-center justify-between py-4 px-6 md:px-10">
          {/* Logo */}
          <Link to={L("/")} className="flex items-center gap-2.5 group cursor-pointer">
            <img src="/assets/cydef-icon.webp" alt="" className="h-9 w-9 rounded-full" />
            <img src="/assets/cydef-wordmark.png" alt="CyDef" className="h-7 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7">
            <Link to={L("/")} className={itemClass}>{t("nav.home")}</Link>
            <Link to={L("/sobre")} className={itemClass}>{t("nav.about")}</Link>
            <Link to={L("/servicos")} className={itemClass}>{t("nav.ecosystem")}</Link>
            <Link to={L("/academy")} className={itemClass}>{t("nav.academy")}</Link>
            <Link to={L("/blog")} className={itemClass}>{t("nav.blog")}</Link>
            <div className="border-l border-white/10 pl-4">
              <LanguageSwitcher compact />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to={L("/academy/entrar")} className="text-sm font-medium hover:text-white transition-colors text-neutral-400">
              {t("nav.signIn")}
            </Link>
            <a href={waLink(t("contact.waMsg"))} target="_blank" rel="noopener noreferrer" className="button-custom scale-95">
              <div className="points_wrapper">
                <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
              </div>
              <span className="inner">{t("common.talkToCydef")}</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <LanguageSwitcher compact />
            <button
              type="button"
              className="text-white hover:text-orange-500 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/5 bg-[#050505]">
            <div className="flex flex-col gap-4 px-6">
              <Link to={L("/")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                {t("nav.home")}
              </Link>
              <Link to={L("/sobre")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                {t("nav.about")}
              </Link>
              <Link to={L("/servicos")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                {t("nav.ecosystem")}
              </Link>
              <Link to={L("/academy")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                {t("nav.academy")}
              </Link>
              <Link to={L("/blog")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                {t("nav.blog")}
              </Link>
              <Link to={L("/academy/entrar")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                {t("nav.signIn")}
              </Link>
              <a
                href={waLink(t("contact.waMsg"))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="button-custom w-full mt-4"
              >
                <div className="points_wrapper">
                  <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                </div>
                <span className="inner">{t("common.talkToCydef")}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
