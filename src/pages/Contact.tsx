import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Mail, MapPin, MessageSquare, Phone, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { waLink } from "@/lib/lang";

const Contact = () => {
  useScrollReveal();
  const { t } = useTranslation();

  const faq = t("contact.faq", { returnObjects: true }) as { q: string; a: string }[];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="outline-none">

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="container mx-auto text-center relative z-10 animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-orange-500 text-sm font-medium mb-6">
            <MessageSquare className="h-4 w-4" />
            {t("contact.badge")}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            {t("contact.h1a")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">{t("contact.h1b")}</span>
          </h1>
          <p className="text-lg text-white/60 max-w-3xl mx-auto font-medium leading-relaxed">
            {t("contact.lead")}
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
            {/* Canais diretos */}
            <div className="animate-on-scroll">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tighter">
                {t("contact.panelTitle")}
              </h2>
              <p className="text-neutral-400 text-lg mb-8">
                {t("contact.panelBody")}
              </p>

              <div className="space-y-4">
                <a
                  href={waLink(t("contact.waMsg"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-5 bg-neutral-900 border border-green-500/20 rounded-2xl p-6 hover:border-green-500/50 transition-colors group"
                >
                  <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0 border border-green-500/25">
                    <MessageCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-green-400 transition-colors">
                      {t("contact.waLabel")} · +1 (508) 630-5886
                    </h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">{t("contact.waHint")}</p>
                  </div>
                </a>

                <a
                  href="mailto:contato@cydef.com.br"
                  className="flex items-start gap-5 bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-colors group"
                >
                  <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                    <Mail className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                      {t("contact.businessTitle")}
                    </h3>
                    <p className="text-neutral-400 break-all">contato@cydef.com.br</p>
                  </div>
                </a>

                <a
                  href="mailto:academy@cydef.com.br"
                  className="flex items-start gap-5 bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-colors group"
                >
                  <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                    <Mail className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                      {t("contact.academyTitle")}
                    </h3>
                    <p className="text-neutral-400 break-all">academy@cydef.com.br</p>
                  </div>
                </a>

                <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest mb-2">
                    {t("contact.hoursTitle")}
                  </h3>
                  <p className="text-neutral-400">{t("contact.hoursBody")}</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-8 animate-on-scroll" style={{ animationDelay: '150ms' }}>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tighter">
                  {t("contact.infoTitle")}
                </h2>
                <p className="text-neutral-400 text-lg mb-10">
                  {t("contact.infoBody")}
                </p>

                <div className="space-y-6">
                  <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-colors flex items-start gap-6">
                    <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                      <Mail className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{t("contact.emailLabel")}</h3>
                      <div className="space-y-1">
                        <a href="mailto:contato@cydef.com.br" className="block text-neutral-400 hover:text-orange-400 transition-colors">
                          contato@cydef.com.br
                        </a>
                        <a href="mailto:academy@cydef.com.br" className="block text-neutral-400 hover:text-orange-400 transition-colors">
                          academy@cydef.com.br
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-colors flex items-start gap-6">
                    <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                      <Phone className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{t("contact.phoneLabel")}</h3>
                      <a href="tel:+15086305886" className="block text-neutral-400 hover:text-orange-400 transition-colors">
                        +1 (508) 630-5886
                      </a>
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 transition-colors flex items-start gap-6">
                    <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                      <MapPin className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{t("contact.addressLabel")}</h3>
                      <p className="text-neutral-400 leading-relaxed">
                        {t("contact.addressLine1")}<br />{t("contact.addressLine2")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5 relative">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center tracking-tighter animate-on-scroll">
            {t("contact.faqTitle")}
          </h2>

          <div className="space-y-6 animate-on-scroll">
            {faq.map((item, i) => (
              <div key={i} className="bg-neutral-900 border border-white/10 rounded-2xl p-8 hover:border-orange-500/30 transition-colors">
                <h3 className="text-xl font-bold text-white mb-4">{item.q}</h3>
                <p className="text-neutral-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default Contact;
