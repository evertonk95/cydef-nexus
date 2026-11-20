import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { formatarPreco, linkCompraSite, type OfertaCatalogo } from "@/lib/academy/catalogo";
import { focusRing } from "./ctaStyles";

/**
 * Ofertas da Hotmart além do curso avulso (fase 16b): a plataforma toda por
 * um período e a trilha completa. O Comprar leva ao checkout com sck=site.
 */

const periodo = (dias: number | null, t: (k: string, o?: Record<string, unknown>) => string) =>
  dias === 365 ? t("academyOffer.year") : dias ? t("academyOffer.days", { n: dias }) : t("academyOffer.lifetime");

export const OfertaPlataforma = ({ oferta }: { oferta: OfertaCatalogo }) => {
  const { t } = useTranslation();
  const link = linkCompraSite(oferta);
  if (!link) return null;
  return (
    <section
      aria-labelledby="oferta-plataforma"
      className="relative overflow-hidden rounded-2xl border border-orange-500/40 bg-neutral-900 p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6"
    >
      <div className="flex-1 min-w-0">
        <h3 id="oferta-plataforma" className="text-2xl font-bold text-white tracking-tight mb-2">
          {t("academyOffer.platformTitle")}
        </h3>
        <p className="text-neutral-400 leading-relaxed max-w-2xl">
          {t(oferta.cursos === 1 ? "academyOffer.platformBodyOne" : "academyOffer.platformBody", { n: oferta.cursos, periodo: periodo(oferta.duracao_dias, t) })}
        </p>
      </div>
      <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
        <p className="m-0 md:text-right">
          <span className="block text-3xl font-bold text-white tracking-tight">{formatarPreco(oferta.preco_centavos)}</span>
          {oferta.preco_observacao ? <span className="block text-sm text-neutral-400">{oferta.preco_observacao}</span> : null}
        </p>
        <a
          href={link}
          target="_blank"
          rel="noopener"
          className={`inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 px-5 py-3 font-bold text-black transition-colors ${focusRing}`}
        >
          {t("academyCourse.buy")}
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
          <span className="sr-only">{t("academyCourse.newTab")}</span>
        </a>
      </div>
    </section>
  );
};

export const OfertaTrilha = ({ oferta, titulo }: { oferta: OfertaCatalogo; titulo: string }) => {
  const { t } = useTranslation();
  const link = linkCompraSite(oferta);
  if (!link) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
      <p className="m-0 text-neutral-300">
        {t(oferta.cursos === 1 ? "academyOffer.trailBodyOne" : "academyOffer.trailBody", { n: oferta.cursos })}{" "}
        <span className="font-semibold text-white">{formatarPreco(oferta.preco_centavos)}</span>
        {oferta.preco_observacao ? <span className="text-neutral-400"> ({oferta.preco_observacao})</span> : null}
      </p>
      <a
        href={link}
        target="_blank"
        rel="noopener"
        aria-label={t("academyOffer.trailBuyLabel", { trilha: titulo })}
        className={`inline-flex items-center gap-2 rounded-full border border-orange-500/50 px-4 py-2 text-sm font-semibold text-orange-400 hover:bg-orange-500/10 transition-colors ${focusRing}`}
      >
        {t("academyOffer.trailBuy")}
        <ExternalLink className="w-4 h-4" aria-hidden="true" />
      </a>
    </div>
  );
};
