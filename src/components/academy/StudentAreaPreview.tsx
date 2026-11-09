import { useTranslation } from "react-i18next";
import { BarChart3, BookOpen, GraduationCap, Home, PlayCircle, Route } from "lucide-react";
import { currentLang } from "@/lib/lang";
import { COURSES } from "@/pages/AcademyLanding/data";
import { COURSES_EN } from "@/pages/AcademyLanding/data.en";
import { COURSES_ES } from "@/pages/AcademyLanding/data.es";

/**
 * Prévia ilustrativa da area do aluno, montada com o primeiro curso gratuito real
 * (dados da landing). Usada na home da Academy e na tela de login.
 */
export const StudentAreaPreview = () => {
  const { t } = useTranslation();
  const lang = currentLang();
  const courses = lang === "en" ? COURSES_EN : lang === "es" ? COURSES_ES : COURSES;
  const course = courses[0];
  if (!course) return null;
  const nav = t("academy.mock.nav", { returnObjects: true }) as string[];
  const navIcons = [Home, BookOpen, Route, BarChart3];

  return (
    <div role="img" aria-label={t("academy.mock.label")} className="relative w-full max-w-xl mx-auto lg:mx-0">
      <div aria-hidden="true" className="absolute -inset-8 bg-orange-500/15 blur-[80px] rounded-full pointer-events-none" />
      <div aria-hidden="true" className="relative">
        <div className="rounded-t-2xl border border-white/10 bg-neutral-950 p-2 shadow-2xl shadow-black/60">
          <div className="rounded-xl border border-white/5 bg-[#0b0b0b] overflow-hidden grid grid-cols-[120px_1fr] sm:grid-cols-[150px_1fr] min-h-[260px] sm:min-h-[300px]">
            <div className="border-r border-white/5 p-3 sm:p-4 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 mb-4">
                <img src="/assets/cydef-icon.webp" alt="" width={18} height={18} className="w-[18px] h-[18px]" />
                <span className="text-[11px] font-semibold text-white">
                  CyDef <span className="text-orange-400">Academy</span>
                </span>
              </div>
              {nav.map((label, i) => {
                const Icon = navIcons[i] ?? Home;
                return (
                  <span
                    key={label}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] sm:text-[11px] ${
                      i === 0 ? "bg-orange-500/15 text-orange-300 border border-orange-500/30" : "text-neutral-400"
                    }`}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    {label}
                  </span>
                );
              })}
            </div>
            <div className="p-3 sm:p-5 flex flex-col gap-4">
              <div className="rounded-lg border border-white/10 bg-neutral-900 p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-orange-400" />
                  <span className="text-[10px] sm:text-[11px] text-neutral-400">{t("academy.mock.continue")}</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white mb-3">{course.title}</p>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500" />
                </div>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 mb-2">{t("academy.mock.next")}</p>
                <ul className="flex flex-col gap-2">
                  {course.topics.slice(0, 3).map((topic) => (
                    <li
                      key={topic}
                      className="flex items-center gap-2 rounded-md border border-white/5 bg-white/[0.03] px-2.5 py-2 text-[10px] sm:text-[11px] text-neutral-200"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="h-3 -mx-[4%] rounded-b-xl bg-gradient-to-b from-neutral-700 to-neutral-900 border-x border-b border-white/10" />
      </div>
    </div>
  );
};
