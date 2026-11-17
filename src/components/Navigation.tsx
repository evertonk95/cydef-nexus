import { Link } from "react-router-dom";
import { ChevronDown, FlaskConical, Gauge, Menu, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { L } from "@/lib/lang";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SkipLink } from "@/components/SkipLink";

const FRAMEWORK_PATH = "/labs/siem-health-maturity-framework";

/** Labs com submenu: CyDef Inora e o SIEM Health Framework (decisão do Everton,
 *  16/11/2026). Abre no hover e no clique da seta; fecha no Esc, ao sair o
 *  foco do grupo e ao escolher um item. */
const LabsMenu = ({ itemClass }: { itemClass: string }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const items = [
    { to: "/inora", icon: ShieldCheck, title: t("nav.inora"), desc: t("nav.inoraDesc") },
    { to: FRAMEWORK_PATH, icon: Gauge, title: t("nav.framework"), desc: t("nav.frameworkDesc") },
  ];

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <div className="flex items-center gap-1">
        <Link to={L("/labs")} className={itemClass}>{t("nav.labs")}</Link>
        <button
          type="button"
          aria-label={t("nav.labsMenu")}
          aria-expanded={open}
          aria-controls="menu-labs"
          onClick={() => setOpen((v) => !v)}
          className="rounded p-0.5 text-neutral-400 transition-colors hover:text-white"
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </div>
      {open && (
        <div id="menu-labs" className="absolute left-1/2 top-full z-50 w-[22rem] -translate-x-1/2 pt-3">
          <div className="rounded-2xl border border-white/10 bg-[#0b0b0d]/95 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md animate-fadeSlideIn">
            {items.map(({ to, icon: Icon, title, desc }) => (
              <Link
                key={to}
                to={L(to)}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-orange-500/25 bg-orange-500/10">
                  <Icon className="h-4 w-4 text-orange-400" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">{title}</span>
                  <span className="block text-xs text-neutral-400">{desc}</span>
                </span>
              </Link>
            ))}
            <Link
              to={L("/labs")}
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2 border-t border-white/5 px-3 pb-1.5 pt-2.5 text-xs font-medium text-orange-400 transition-colors hover:text-orange-300"
            >
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" /> {t("nav.labsAll")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

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
          <div className="hidden xl:flex items-center gap-7">
            <Link to={L("/")} className={itemClass}>{t("nav.home")}</Link>
            <Link to={L("/sobre")} className={itemClass}>{t("nav.about")}</Link>
            <Link to={L("/consultoria")} className={itemClass}>{t("nav.consulting")}</Link>
            <Link to={L("/academy")} className={itemClass}>{t("nav.academy")}</Link>
            <LabsMenu itemClass={itemClass} />
            <Link to={L("/blog")} className={itemClass}>{t("nav.blog")}</Link>
            <div className="border-l border-white/10 pl-4">
              <LanguageSwitcher compact />
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-6">
            <Link to={L("/academy/entrar")} className="text-sm font-medium hover:text-white transition-colors text-neutral-400">
              {t("nav.signIn")}
            </Link>
            <Link to={L("/contato")} className="button-custom scale-95">
              <div className="points_wrapper">
                <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
              </div>
              <span className="inner">{t("common.talkToCydef")}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 xl:hidden">
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
          <div className="xl:hidden py-4 border-t border-white/5 bg-[#050505]">
            <div className="flex flex-col gap-4 px-6">
              <Link to={L("/")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                {t("nav.home")}
              </Link>
              <Link to={L("/sobre")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                {t("nav.about")}
              </Link>
              <Link to={L("/consultoria")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                {t("nav.consulting")}
              </Link>
              <Link to={L("/academy")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                {t("nav.academy")}
              </Link>
              <Link to={L("/labs")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                {t("nav.labs")}
              </Link>
              <div className="-mt-1 flex flex-col gap-3 border-l border-white/10 pl-4">
                <Link to={L("/inora")} className="text-sm text-neutral-400 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
                  {t("nav.inora")}
                </Link>
                <Link to={L(FRAMEWORK_PATH)} className="text-sm text-neutral-400 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
                  {t("nav.framework")}
                </Link>
              </div>
              <Link to={L("/blog")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                {t("nav.blog")}
              </Link>
              <Link to={L("/academy/entrar")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                {t("nav.signIn")}
              </Link>
              <Link
                to={L("/contato")}
                onClick={() => setIsOpen(false)}
                className="button-custom w-full mt-4"
              >
                <div className="points_wrapper">
                  <i className="point"></i><i className="point"></i><i className="point"></i><i className="point"></i>
                </div>
                <span className="inner">{t("common.talkToCydef")}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
