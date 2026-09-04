import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { obterAviso, hashDoAviso } from "@/lib/academy/consent";
import { LANDING_PATH } from "@/lib/config";
import { L, currentLang } from "@/lib/lang";
import { ArrowLeft } from "lucide-react";

/**
 * Aviso de Privacidade da landing — URL imutável por versão (HEL-M01/SEC-003):
 * /academy/privacidade/v<versão>.
 * O conteúdo de uma versão publicada nunca é sobrescrito; nova versão = nova URL.
 * A página exibe o hash SHA-256 do conteúdo (prova de integridade da versão).
 * O texto do aviso é documento legal (rascunho v2026.1 aguardando jurídico/DPO —
 * SEC-003): permanece em português; o chrome da página é localizado e, para
 * idiomas ≠ PT, exibe aviso de que o documento vigente é publicado em PT.
 */
const AcademyPrivacy = () => {
  const { versao } = useParams<{ versao: string }>();
  const { t } = useTranslation();
  const [hash, setHash] = useState<string | null>(null);
  const showPtNote = currentLang() !== "pt";

  const aviso = versao ? obterAviso(versao) : undefined;

  useEffect(() => {
    if (!versao) return;
    let ativo = true;
    hashDoAviso(versao)
      .then((h) => {
        if (ativo) setHash(h);
      })
      .catch(() => {
        if (ativo) setHash(null);
      });
    return () => {
      ativo = false;
    };
  }, [versao]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />
      <main id="conteudo" tabIndex={-1} className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          {!aviso ? (
            <div className="text-center py-16">
              <h1 className="text-3xl font-bold mb-4">{t("academyPrivacy.notFoundTitle")}</h1>
              <p className="text-neutral-400 mb-8">{t("academyPrivacy.notFoundBody")}</p>
              <Link
                to={L(LANDING_PATH)}
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 underline underline-offset-4"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {t("academyPrivacy.back")}
              </Link>
            </div>
          ) : (
            <article>
              <p className="text-xs uppercase tracking-widest text-orange-400 font-semibold mb-3">
                {t("academyPrivacy.badgePre")} {aviso.versao}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-6 tracking-tighter">
                {t("academyPrivacy.title")}
              </h1>
              {showPtNote && (
                <p className="text-sm text-neutral-500 bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 mb-6">
                  {t("academyPrivacy.ptNote")}
                </p>
              )}
              <div className="prose prose-invert prose-neutral max-w-none [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-3 [&_strong]:text-white [&_a]:text-orange-400 [&_p]:text-neutral-300 [&_li]:text-neutral-300">
                {aviso.texto.split("\n").map((linha, i) => {
                  const h2 = linha.match(/^## (.+)$/);
                  if (h2) {
                    return (
                      <h2 key={i} className="text-xl font-bold mt-8 mb-3">
                        {h2[1]}
                      </h2>
                    );
                  }
                  if (linha.startsWith("# ")) {
                    return (
                      <p key={i} className="sr-only">
                        {linha.replace(/^# /, "")}
                      </p>
                    );
                  }
                  if (linha.startsWith("> ")) {
                    return (
                      <blockquote key={i} className="border-l-4 border-orange-500/40 pl-4 text-neutral-400 italic my-3">
                        {linha.replace(/^> /, "")}
                      </blockquote>
                    );
                  }
                  if (linha.trim() === "") return null;
                  return (
                    <p key={i} className="my-3 text-neutral-300 leading-relaxed">
                      {linha}
                    </p>
                  );
                })}
              </div>

              <div className="mt-10 p-4 rounded-lg bg-white/5 border border-white/10 text-xs text-neutral-500 break-all">
                <span className="font-semibold text-neutral-400">{t("academyPrivacy.hashLabel")}</span>{" "}
                {hash ?? t("academyPrivacy.hashPending")}
              </div>

              <div className="mt-8">
                <Link
                  to={L(LANDING_PATH)}
                  className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 underline underline-offset-4"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  {t("academyPrivacy.back")}
                </Link>
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AcademyPrivacy;
