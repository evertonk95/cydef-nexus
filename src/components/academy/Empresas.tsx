import { useTranslation } from "react-i18next";
import { Building2, Mail, UsersRound } from "lucide-react";
import { focusRing } from "./ctaStyles";

/**
 * Academy para empresas (fase 17): sem preço público. Duas formas, a venda
 * casada com a consultoria e o plano para times, e um e-mail para conversar.
 */
export const AcademyEmpresas = () => {
  const { t } = useTranslation();
  const mailto =
    `mailto:contato@cydef.com.br?subject=${encodeURIComponent(t("academyBusiness.mailSubject"))}` +
    `&body=${encodeURIComponent(t("academyBusiness.mailBody"))}`;
  const formas = [
    { Icone: Building2, titulo: t("academyBusiness.bundleTitle"), texto: t("academyBusiness.bundleBody") },
    { Icone: UsersRound, titulo: t("academyBusiness.teamTitle"), texto: t("academyBusiness.teamBody") },
  ];
  const passos = [t("academyBusiness.how1"), t("academyBusiness.how2"), t("academyBusiness.how3")];

  return (
    <section id="empresas" aria-labelledby="academy-empresas" className="py-24 md:py-32 px-2 sm:px-6 border-t border-white/5">
      <div className="container mx-auto max-w-7xl animate-on-scroll">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-12 lg:gap-16 items-start">
          <div className="max-w-xl">
            <h2 id="academy-empresas" className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-5">
              {t("academyBusiness.title")}
            </h2>
            <p className="text-lg text-neutral-400 leading-relaxed mb-8">{t("academyBusiness.lead")}</p>
            <h3 className="text-sm font-semibold text-white mb-3">{t("academyBusiness.howTitle")}</h3>
            <ul className="m-0 p-0 list-none flex flex-col gap-3 mb-10">
              {passos.map((p) => (
                <li key={p} className="flex gap-3 text-neutral-300 leading-relaxed">
                  <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-orange-500" />
                  {p}
                </li>
              ))}
            </ul>
            <a
              href={mailto}
              className={`inline-flex items-center gap-2 rounded-full bg-orange-600 hover:bg-orange-500 px-6 py-3.5 font-bold text-black transition-colors ${focusRing}`}
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              {t("academyBusiness.cta")}
            </a>
          </div>
          <ul className="m-0 p-0 list-none grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {formas.map(({ Icone, titulo, texto }) => (
              <li key={titulo} className="bg-neutral-900 border border-white/10 rounded-2xl p-7">
                <Icone className="w-6 h-6 text-orange-500 mb-5" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">{titulo}</h3>
                <p className="text-neutral-400 leading-relaxed">{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
