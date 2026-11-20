import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock } from "lucide-react";
import { currentLang } from "@/lib/lang";
import { cargaHoraria, formatarPreco, NIVEL_KEY, type CursoCatalogo } from "@/lib/academy/catalogo";
import { caminhoCurso } from "@/lib/academy/caminhos";
import { badgeNeutral, badgeOrange, focusRing } from "./ctaStyles";

/**
 * Card de curso da vitrine (fase 14): a página da Academy (blocos por trilha)
 * e o catálogo completo usam o mesmo. O card inteiro leva à página do curso.
 */
export const CursoCard = ({ curso, headingLevel = 3 }: { curso: CursoCatalogo; headingLevel?: 2 | 3 }) => {
  const { t } = useTranslation();
  const lang = currentLang();
  const Titulo = headingLevel === 2 ? "h2" : "h3";
  const horas = cargaHoraria(curso.carga_horaria_h, lang === "en" ? "." : ",");
  const aVenda = curso.situacao === "a_venda" && curso.preco_centavos != null;

  return (
    <article className="group relative bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/40 transition-colors duration-200 flex flex-col h-full">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className={badgeOrange}>{t(`academy.level.${NIVEL_KEY[curso.nivel]}`)}</span>
        <span className={badgeNeutral}>{aVenda ? t("academyCatalog.onSale") : t("academyCatalog.soon")}</span>
      </div>
      <Titulo className="text-xl font-bold text-white mb-3 leading-tight">
        <Link to={caminhoCurso(curso.slug)} className={`rounded after:absolute after:inset-0 after:rounded-2xl ${focusRing}`}>
          {curso.titulo}
        </Link>
      </Titulo>
      <p className="text-neutral-400 text-sm leading-relaxed mb-6 flex-grow line-clamp-4">{curso.descricao}</p>
      {lang !== "pt" ? <p className="text-xs text-neutral-500 mb-3">{t("academyCatalog.ptOnly")}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4">
        {horas ? (
          <span className="inline-flex items-center gap-1.5 text-neutral-400 text-sm">
            <Clock className="w-4 h-4" aria-hidden="true" />
            {horas}
          </span>
        ) : (
          <span />
        )}
        {aVenda ? <span className="text-white font-semibold">{formatarPreco(curso.preco_centavos!)}</span> : null}
      </div>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-400 group-hover:text-orange-300 transition-colors duration-200" aria-hidden="true">
        {t("academyCatalog.seeCourse")}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
      </span>
    </article>
  );
};
