import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { currentLang } from "@/lib/lang";
import { privacyByLang } from "@/lib/privacyContent";
import { Shield } from "lucide-react";
import { ReactNode } from "react";

/** Renderiza **negrito** e *itálico* inline. */
const renderInline = (text: string): ReactNode[] => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="text-neutral-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const Privacy = () => {
  // Assina mudanças de idioma (re-render ao trocar :lang) e lê o doc ativo.
  useTranslation();
  const doc = privacyByLang[currentLang()];

  return (
    <div className="bg-[#050505] text-white font-sans antialiased overflow-x-hidden flex flex-col min-h-screen">
      <Navigation />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-10 pt-32 pb-24">
        <div className="inline-flex items-center gap-2 text-orange-500 mb-4">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest uppercase">LGPD</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-medium tracking-tighter mb-2">
          {doc.docTitle}
        </h1>
        <p className="text-sm text-neutral-500 mb-12">
          {doc.updatedLabel} {doc.updatedAt}
        </p>

        <div className="flex flex-col gap-10">
          {doc.sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-semibold text-white mb-3">{s.title}</h2>
              <div className="text-neutral-300 leading-relaxed space-y-3 text-[15px]">
                {s.paragraphs.map((p, i) => (
                  <p key={i}>{renderInline(p)}</p>
                ))}
                {s.list && (
                  s.list.ordered ? (
                    <ol className="list-decimal pl-5 space-y-1">
                      {s.list.items.map((item, i) => (
                        <li key={i}>{renderInline(item)}</li>
                      ))}
                    </ol>
                  ) : (
                    <ul className="list-disc pl-5 space-y-1">
                      {s.list.items.map((item, i) => (
                        <li key={i}>{renderInline(item)}</li>
                      ))}
                    </ul>
                  )
                )}
                {s.closing?.map((p, i) => (
                  <p key={`c-${i}`}>{renderInline(p)}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-sm text-neutral-500">
          <p>
            {doc.contactIntro}{" "}
            <span className="text-orange-400">{doc.dpoEmail}</span>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
