import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LANGS, langLabels } from "@/i18n";
import { currentLang } from "@/lib/lang";
import { localizePath } from "@/lib/routes";

/** Seletor de idioma: troca o prefixo e traduz o slug da página (P2-03). */
export const LanguageSwitcher = ({ compact = false }: { compact?: boolean }) => {
  const { i18n } = useTranslation();
  const { pathname, search } = useLocation();
  const fromLang = currentLang();

  return (
    <div
      className={`flex items-center ${compact ? "gap-1" : "gap-1.5"}`}
      role="group"
      aria-label="Language"
    >
      {LANGS.map((lng) => {
        const active = i18n.language === lng || (i18n.resolvedLanguage ?? i18n.language) === lng;
        const base =
          pathname === `/${fromLang}` || pathname === `/${fromLang}/`
            ? "/"
            : pathname.replace(`/${fromLang}`, "");
        return (
          <Link
            key={lng}
            to={`${localizePath(base, lng, fromLang)}${search}`}
            lang={lng}
            aria-current={active ? "true" : undefined}
            className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors ${
              active
                ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                : "text-neutral-500 border border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            {compact ? lng : langLabels[lng]}
          </Link>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
