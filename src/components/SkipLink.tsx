import { useTranslation } from "react-i18next";

/**
 * Skip link (WCAG 2.4.1 Bypass Blocks): primeiro elemento focável da página;
 * leva o foco direto ao conteúdo principal (#conteudo). Fica invisível até
 * receber foco via Tab (NEX-P2-05).
 */
export const SkipLink = () => {
  const { t } = useTranslation();
  return (
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-orange-600 focus:text-black focus:text-sm focus:font-semibold"
    >
      {t("common.skipToContent")}
    </a>
  );
};
