import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";
import { LANDING_PATH } from "@/lib/config";

/**
 * Página neutra de sucesso pós-inscrição (J1-OK) — acessível por URL direta.
 * O estado de sucesso principal é renderizado inline no formulário; esta
 * página existe como deep link neutro (sem PII na URL).
 */
const AcademyThankYou = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />
      <main className="pt-40 pb-24 px-4">
        <div className="container mx-auto max-w-xl text-center">
          <div className="bg-[#141416] border border-[#26262A] rounded-3xl p-8 md:p-12">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" aria-hidden="true" />
            <h1 className="text-3xl font-bold mb-4 tracking-tighter">
              Inscrição recebida!
            </h1>
            <p className="text-neutral-400 leading-relaxed mb-8">
              Enviamos um e-mail com o link de confirmação (válido por 48
              horas). Não encontrou? Verifique a caixa de spam ou lixo
              eletrônico.
            </p>
            <Link
              to={LANDING_PATH}
              className="inline-flex items-center justify-center px-6 py-3 min-h-[48px] rounded-full font-semibold text-black bg-gradient-to-r from-[#F46B27] to-[#F69021] hover:brightness-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F69021] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
            >
              Voltar à pré-inscrição
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AcademyThankYou;
