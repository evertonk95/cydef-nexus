import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Info, Lock, Mail } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PrimaryCtaContent } from "@/components/academy/PrimaryCta";
import { StudentAreaPreview } from "@/components/academy/StudentAreaPreview";
import { focusRing, primaryCtaClass } from "@/components/academy/ctaStyles";
import { L } from "@/lib/lang";
import { LANDING_PATH } from "@/lib/config";

/**
 * Tela de login da Academy (redesenho de 09/11/2026).
 * O portal ainda não existe: o formulário mostra o modelo de acesso previsto
 * (link por e-mail, sem senha), mas o envio NÃO coleta nem transmite o e-mail.
 * Ao enviar, a tela só informa, de forma honesta, que o login ainda não está
 * disponível. Quando a autenticação existir, o envio passa a chamar o backend
 * e o aviso de "portal em desenvolvimento" sai.
 */
const AcademyLogin = () => {
  const { t } = useTranslation();
  const [avisoVisivel, setAvisoVisivel] = useState(false);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    setAvisoVisivel(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="relative isolate overflow-hidden outline-none pt-32 md:pt-40 pb-24 md:pb-28 px-2 sm:px-6">
        <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none">
          <img
            alt=""
            className="w-full h-full object-cover opacity-35"
            src="/assets/cydef-hero-bg.webp"
            srcSet="/assets/cydef-hero-bg-960.webp 960w, /assets/cydef-hero-bg.webp 1920w"
            sizes="100vw"
            loading="eager"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,_rgba(5,5,5,0.35)_0%,_rgba(5,5,5,0.75)_55%,_rgba(5,5,5,0.95)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/60 to-[#050505]" />
        </div>

        <div className="container mx-auto max-w-7xl grid lg:grid-cols-[1.1fr_1fr] gap-14 lg:gap-16 items-center">
          {/* Apresentação: no mobile vem depois do card, que é a ação principal */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
              <span className="text-xs font-bold tracking-widest uppercase text-orange-500/90">{t("login.badge")}</span>
            </div>
            <p className="text-4xl md:text-5xl leading-[0.95] tracking-tighter font-medium text-white mb-6">
              {t("login.h1a")}
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600">
                {t("login.h1b")}
              </span>
            </p>
            <p className="text-lg leading-relaxed text-neutral-300 max-w-xl mb-12">{t("login.lead")}</p>
            <StudentAreaPreview />
          </div>

          {/* Card de login */}
          <div className="order-1 lg:order-2 relative">
            <div aria-hidden="true" className="absolute -inset-6 bg-orange-500/10 blur-[70px] rounded-full pointer-events-none" />
            <section
              aria-labelledby="login-titulo"
              className="relative rounded-3xl border border-orange-500/30 bg-neutral-900/95 backdrop-blur-md p-6 sm:p-8 md:p-10 shadow-[0_0_60px_-15px_rgba(249,115,22,0.45)]"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-orange-400" aria-hidden="true" />
              </div>
              <h1 id="login-titulo" className="text-3xl md:text-4xl font-medium tracking-tighter text-white mb-2">
                {t("login.title")}
              </h1>
              <p className="text-neutral-400 mb-6">{t("login.sub")}</p>

              <p className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-neutral-300 leading-relaxed mb-6">
                <Info className="w-5 h-5 shrink-0 text-orange-400 mt-0.5" aria-hidden="true" />
                {t("login.note")}
              </p>

              <form onSubmit={enviar} noValidate className="space-y-5 [color-scheme:dark]">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-white mb-2">
                    {t("login.email")}
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="off"
                    placeholder={t("login.emailPh")}
                    className={`w-full min-h-[48px] px-4 py-3 rounded-lg bg-[#0A0A0A] border border-white/10 hover:border-white/20 text-white placeholder:text-neutral-500 transition-colors duration-200 ${focusRing}`}
                  />
                </div>
                <button type="submit" className={`${primaryCtaClass} w-full justify-between min-h-[48px]`}>
                  <PrimaryCtaContent icon={<Mail className="w-4 h-4 text-white" aria-hidden="true" />}>
                    {t("login.submit")}
                  </PrimaryCtaContent>
                </button>
                <div aria-live="polite">
                  {avisoVisivel ? (
                    <p role="status" className="flex items-start gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-sm text-orange-200">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      {t("login.error")}
                    </p>
                  ) : null}
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm">
                <p className="text-neutral-300">
                  {t("login.noAccount")}{" "}
                  <Link
                    to={L(LANDING_PATH)}
                    className={`font-medium text-orange-400 underline underline-offset-4 hover:text-orange-300 transition-colors duration-200 rounded ${focusRing}`}
                  >
                    {t("login.preRegister")}
                  </Link>
                </p>
                <Link
                  to={L("/academy")}
                  className={`mt-4 inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors duration-200 rounded ${focusRing}`}
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  {t("login.back")}
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AcademyLogin;
