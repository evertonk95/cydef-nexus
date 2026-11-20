import type { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { L, currentLang } from "@/lib/lang";
import { legacyCoursePaths } from "@/lib/routes";
import { JsonLd } from "@/lib/seo";
import { courseLd } from "@/lib/seo-data";
import { focusRing } from "@/components/academy/ctaStyles";
import {
  cargaHoraria,
  cursoDoCatalogo,
  duracaoAula,
  formatarPreco,
  linkCompraSite,
  NIVEL_KEY,
  type CursoCatalogo,
} from "@/lib/academy/catalogo";
import { caminhoCurso } from "@/lib/academy/caminhos";
import { ArrowLeft, ArrowRight, BarChart, BookOpen, CheckCircle, Clock, ExternalLink, Target, Users } from "lucide-react";

/**
 * Página do curso (fase 14). Os dados vêm do catálogo do banco, o mesmo do
 * portal e da Hotmart: sobre, o que se aprende, ementa, quem ensina, carga
 * horária e preço. O curso é em português, então a página existe só em
 * /pt/cursos/<slug>; nos outros idiomas o endereço leva para ela.
 */
const CoursePage = () => {
  useScrollReveal();
  const { courseId } = useParams();
  const destino = courseId ? legacyCoursePaths[courseId] : undefined;
  const curso = cursoDoCatalogo(courseId);

  if (destino) return <Navigate to={L(destino)} replace />;
  if (curso && currentLang() !== "pt") return <Navigate to={caminhoCurso(curso.slug)} replace />;
  if (!curso) return <CursoNaoEncontrado />;
  return <PaginaCurso curso={curso} />;
};

const CursoNaoEncontrado = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased">
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <div className="container mx-auto px-4 py-40 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{t("course.notFound")}</h1>
          <Link to={L("/academy/catalogo")} className={`inline-block mt-4 rounded ${focusRing}`}>
            <span className="button-custom">
              <span className="inner">{t("academyCourse.back")}</span>
            </span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Caixa = ({ children }: { children: ReactNode }) => (
  <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 flex-1">{children}</div>
);

const PaginaCurso = ({ curso }: { curso: CursoCatalogo }) => {
  const { t } = useTranslation();
  const horas = cargaHoraria(curso.carga_horaria_h);
  const compra = linkCompraSite(curso);
  const preco = compra && curso.preco_centavos != null ? curso.preco_centavos : null;
  const avise = `mailto:academy@cydef.com.br?subject=${encodeURIComponent(t("academyCourse.notifySubject", { titulo: curso.titulo }))}`;
  const como = t("academyCourse.how", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <JsonLd
        data={courseLd({
          name: curso.titulo,
          description: curso.descricao,
          lang: "pt",
          courseId: curso.slug,
          price: preco ?? undefined,
          hours: curso.carga_horaria_h ?? undefined,
          teachers: curso.instrutores.map((i) => i.nome),
        })}
      />
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        {/* Hero */}
        <section className="relative pt-36 md:pt-40 pb-16 md:pb-20 px-4 overflow-hidden border-b border-white/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          <div className="container mx-auto relative z-10 max-w-7xl">
            <Link to={L("/academy/catalogo")} className={`inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-8 rounded ${focusRing}`}>
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              {t("academyCourse.back")}
            </Link>
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="px-3 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-xs font-semibold">
                  {t(`academy.level.${NIVEL_KEY[curso.nivel]}`)}
                </span>
                {horas ? (
                  <span className="flex items-center gap-2 text-white/60 font-medium text-sm">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    {horas}
                  </span>
                ) : null}
                {curso.modulos.length > 0 ? (
                  <span className="flex items-center gap-2 text-white/60 font-medium text-sm">
                    <BarChart className="w-4 h-4" aria-hidden="true" />
                    {curso.modulos.length} {t("academyCourse.modules").toLowerCase()}
                  </span>
                ) : null}
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">{curso.titulo}</h1>
              <p className="text-xl text-white/70 mb-10 leading-relaxed font-medium">{curso.descricao}</p>
              {compra ? (
                <a href={compra} target="_blank" rel="noopener" className={`button-custom inline-block rounded-full ${focusRing}`}>
                  <span className="inner flex items-center gap-2">
                    {t("academyCourse.buy")}
                    <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    <span className="sr-only">{t("academyCourse.newTab")}</span>
                  </span>
                </a>
              ) : (
                <a href={avise} className={`button-custom inline-block rounded-full ${focusRing}`}>
                  <span className="inner flex items-center gap-2">
                    {t("academyCourse.notifyMe")}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 px-4 relative">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-16 min-w-0">
                {curso.objetivos.length > 0 ? (
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                      <Target className="w-8 h-8 text-orange-500" aria-hidden="true" />
                      {t("academyCourse.learnTitle")}
                    </h2>
                    <ul className="grid sm:grid-cols-2 gap-4 list-none p-0 m-0">
                      {curso.objetivos.map((obj) => (
                        <li key={obj} className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="text-neutral-300 text-sm leading-relaxed">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {curso.modulos.length > 0 ? (
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                      <BookOpen className="w-8 h-8 text-orange-500" aria-hidden="true" />
                      {t("academyCourse.syllabusTitle")}
                    </h2>
                    <ol className="space-y-4 list-none p-0 m-0">
                      {curso.modulos.map((m) => (
                        <li key={m.ordem} className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
                          <div className="flex items-start gap-5">
                            <span className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20 text-orange-500 font-bold text-lg" aria-hidden="true">
                              {m.ordem}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold text-white mb-2">
                                <span className="sr-only">{t("academyCourse.moduleN", { n: m.ordem })}: </span>
                                {m.titulo}
                              </h3>
                              {m.resumo ? <p className="text-neutral-400 text-sm leading-relaxed">{m.resumo}</p> : null}
                              {m.aulas.length > 0 ? (
                                <ol className="mt-4 flex flex-col gap-2 list-none p-0 m-0">
                                  {m.aulas.map((a, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-neutral-300">
                                      <span className="flex-1">{a.titulo}</span>
                                      <span className="text-neutral-500">{duracaoAula(a.duracao_seg)}</span>
                                    </li>
                                  ))}
                                </ol>
                              ) : null}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {curso.publico || curso.pre_requisitos ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {curso.publico ? (
                      <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-white mb-6">{t("academyCourse.audienceTitle")}</h2>
                        <Caixa>
                          <div className="flex items-start gap-4">
                            <Users className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" aria-hidden="true" />
                            <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-line">{curso.publico}</p>
                          </div>
                        </Caixa>
                      </div>
                    ) : null}
                    {curso.pre_requisitos ? (
                      <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-white mb-6">{t("academyCourse.prereqTitle")}</h2>
                        <Caixa>
                          <div className="flex items-start gap-4">
                            <BookOpen className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" aria-hidden="true" />
                            <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-line">{curso.pre_requisitos}</p>
                          </div>
                        </Caixa>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {curso.instrutores.length > 0 ? (
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-8">{t("academyCourse.teachersTitle")}</h2>
                    <ul className="grid sm:grid-cols-2 gap-6 list-none p-0 m-0">
                      {curso.instrutores.map((i) => (
                        <li key={i.nome} className="flex flex-col">
                          <Caixa>
                            <p className="text-lg font-bold text-white">{i.nome}</p>
                            {i.cargo ? <p className="text-sm text-orange-400 mb-3">{i.cargo}</p> : null}
                            {i.papel === "convidado" ? <p className="text-xs text-neutral-500 mb-3">{t("academyCourse.guest")}</p> : null}
                            {i.bio ? <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">{i.bio}</p> : null}
                            {i.linkedin || i.site ? (
                              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                                {i.linkedin ? (
                                  <a href={i.linkedin} target="_blank" rel="noopener noreferrer" className={`text-neutral-300 hover:text-white underline underline-offset-4 rounded ${focusRing}`}>
                                    {t("academyCourse.linkedin", { nome: i.nome })}
                                  </a>
                                ) : null}
                                {i.site ? (
                                  <a href={i.site} target="_blank" rel="noopener noreferrer" className={`text-neutral-300 hover:text-white underline underline-offset-4 rounded ${focusRing}`}>
                                    {t("academyCourse.site", { nome: i.nome })}
                                  </a>
                                ) : null}
                              </div>
                            ) : null}
                          </Caixa>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              {/* Lateral: preço e compra */}
              <aside aria-label={t("academyCourse.invest")} className="lg:col-span-1">
                <div className="bg-neutral-900 border border-white/10 rounded-2xl lg:sticky lg:top-28 overflow-hidden">
                  <div className="p-8">
                    <p className="text-sm text-neutral-400 font-medium mb-2">{t("academyCourse.invest")}</p>
                    {preco != null && compra ? (
                      <>
                        <p className="text-4xl font-bold text-white mb-1 tracking-tight">{formatarPreco(preco)}</p>
                        {curso.preco_observacao ? <p className="text-sm text-neutral-400 mb-6">{curso.preco_observacao}</p> : <div className="mb-6" />}
                        <a
                          href={compra}
                          target="_blank"
                          rel="noopener"
                          className={`w-full py-4 bg-orange-600 hover:bg-orange-500 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${focusRing}`}
                        >
                          {t("academyCourse.buy")}
                          <ExternalLink className="w-5 h-5" aria-hidden="true" />
                          <span className="sr-only">{t("academyCourse.newTab")}</span>
                        </a>
                        <p className="text-xs text-neutral-500 mt-4 leading-relaxed">{t("academyCourse.buyNote")}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-white mb-2 tracking-tight">{t("academyCourse.soonTitle")}</p>
                        <p className="text-sm text-neutral-400 mb-6">{t("academyCourse.soonBody")}</p>
                        <a
                          href={avise}
                          className={`w-full py-4 border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${focusRing}`}
                        >
                          {t("academyCourse.notifyMe")}
                        </a>
                      </>
                    )}

                    <dl className="space-y-5 pt-8 mt-8 border-t border-white/10">
                      {horas ? (
                        <div>
                          <dt className="text-xs text-neutral-500 font-semibold">{t("academyCourse.hours")}</dt>
                          <dd className="text-white font-medium m-0">{horas}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="text-xs text-neutral-500 font-semibold">{t("academyCourse.level")}</dt>
                        <dd className="text-white font-medium m-0">{t(`academy.level.${NIVEL_KEY[curso.nivel]}`)}</dd>
                      </div>
                      {curso.modulos.length > 0 ? (
                        <div>
                          <dt className="text-xs text-neutral-500 font-semibold">{t("academyCourse.modules")}</dt>
                          <dd className="text-white font-medium m-0">{curso.modulos.length}</dd>
                        </div>
                      ) : null}
                    </dl>

                    {compra ? (
                      <div className="pt-8 mt-8 border-t border-white/10">
                        <h2 className="font-bold text-white mb-3 text-base">{t("academyCourse.howTitle")}</h2>
                        <ol className="list-decimal pl-5 space-y-2 text-sm text-neutral-400 leading-relaxed">
                          {como.map((passo) => (
                            <li key={passo}>{passo}</li>
                          ))}
                        </ol>
                      </div>
                    ) : null}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CoursePage;
