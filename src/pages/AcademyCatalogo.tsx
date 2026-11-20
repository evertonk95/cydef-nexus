import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CursoCard } from "@/components/academy/CursoCard";
import { focusRing } from "@/components/academy/ctaStyles";
import { L } from "@/lib/lang";
import { LANDING_PATH } from "@/lib/config";
import { catalogoAcademy, NIVEL_KEY, type Nivel } from "@/lib/academy/catalogo";

const NIVEIS: Nivel[] = ["iniciante", "intermediario", "avancado"];

const chip = (ativo: boolean) =>
  `h-9 rounded-full border px-4 text-sm font-medium transition-colors duration-200 ${focusRing} ${
    ativo ? "border-orange-500 bg-orange-500/15 text-orange-300" : "border-white/15 text-neutral-400 hover:border-white/30 hover:text-white"
  }`;

/**
 * Catálogo completo da Academy (fase 14): todos os cursos da vitrine, com
 * filtro por trilha e por nível. O HTML pré-renderizado traz todos os cursos;
 * o filtro só esconde no navegador.
 */
const AcademyCatalogo = () => {
  const { t } = useTranslation();
  const [trilha, setTrilha] = useState<string | null>(null);
  const [nivel, setNivel] = useState<Nivel | null>(null);
  const { trilhas, cursos } = catalogoAcademy;

  const selecionada = trilhas.find((x) => x.slug === trilha);
  const ordem = selecionada ? selecionada.cursos : cursos.map((c) => c.slug);
  const lista = ordem
    .flatMap((s) => cursos.filter((c) => c.slug === s))
    .filter((c) => !nivel || c.nivel === nivel);
  const niveisPresentes = NIVEIS.filter((n) => cursos.some((c) => c.nivel === n));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <section aria-labelledby="catalogo-h1" className="pt-36 md:pt-44 pb-12 px-2 sm:px-6">
          <div className="container mx-auto max-w-7xl">
            <Link to={L("/academy")} className={`text-sm text-neutral-400 hover:text-white rounded ${focusRing}`}>
              CyDef Academy
            </Link>
            <h1 id="catalogo-h1" className="mt-4 text-5xl md:text-6xl leading-[0.95] tracking-tighter font-medium text-white mb-6">
              {t("academyCatalog.h1")}
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-neutral-300 max-w-2xl">{t("academyCatalog.lead")}</p>
          </div>
        </section>

        <section aria-label={t("academyCatalog.h1")} className="pb-24 md:pb-32 px-2 sm:px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 mb-10">
              {trilhas.length > 0 ? (
                <div role="group" aria-label={t("academyCatalog.filterTrail")} className="flex flex-wrap gap-2">
                  <button type="button" aria-pressed={trilha === null} onClick={() => setTrilha(null)} className={chip(trilha === null)}>
                    {t("academyCatalog.allTrails")}
                  </button>
                  {trilhas.map((x) => (
                    <button key={x.slug} type="button" aria-pressed={trilha === x.slug} onClick={() => setTrilha(x.slug)} className={chip(trilha === x.slug)}>
                      {x.titulo}
                    </button>
                  ))}
                </div>
              ) : null}
              {niveisPresentes.length > 1 ? (
                <div role="group" aria-label={t("academyCatalog.filterLevel")} className="flex flex-wrap gap-2">
                  <button type="button" aria-pressed={nivel === null} onClick={() => setNivel(null)} className={chip(nivel === null)}>
                    {t("academyCatalog.allLevels")}
                  </button>
                  {niveisPresentes.map((n) => (
                    <button key={n} type="button" aria-pressed={nivel === n} onClick={() => setNivel(n)} className={chip(nivel === n)}>
                      {t(`academy.level.${NIVEL_KEY[n]}`)}
                    </button>
                  ))}
                </div>
              ) : null}
              {selecionada?.descricao ? <p className="text-neutral-400 max-w-3xl">{selecionada.descricao}</p> : null}
            </div>

            {lista.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-neutral-900 p-8 max-w-xl">
                <p className="text-neutral-300 mb-4">{t("academyCatalog.empty")}</p>
                <button
                  type="button"
                  onClick={() => {
                    setTrilha(null);
                    setNivel(null);
                  }}
                  className={`text-sm font-medium text-orange-400 hover:text-orange-300 rounded ${focusRing}`}
                >
                  {t("academyCatalog.clear")}
                </button>
              </div>
            ) : (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
                {lista.map((curso) => (
                  <li key={curso.slug}>
                    <CursoCard curso={curso} headingLevel={2} />
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-16 text-neutral-400">
              {t("academyCatalog.freeNote")}{" "}
              <Link to={L(LANDING_PATH)} className={`inline-flex items-center gap-1 font-medium text-orange-400 hover:text-orange-300 rounded ${focusRing}`}>
                {t("academyCatalog.freeLink")}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AcademyCatalogo;
