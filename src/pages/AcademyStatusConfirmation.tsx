import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { track } from "@/lib/analytics";
import { LANDING_PATH } from "@/lib/config";

/**
 * Página neutra de status de confirmação (HEL-M02/M05).
 * TODOS os desfechos do token (válido/inválido/expirado/reutilizado) chegam
 * aqui pela MESMA URL, SEM query string — a página não diferencia estados
 * (sem oracle para o cliente). O estado vive apenas no servidor.
 * Beacon `confirmacao_concluida` dispara daqui (sem token presente — M02).
 */
const AcademyStatusConfirmation = () => {
  useEffect(() => {
    track("confirmacao_concluida");
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-orange-500/30">
      <Navigation />
      <main className="pt-40 pb-24 px-4">
        <div className="container mx-auto max-w-xl text-center">
          <div className="bg-[#141416] border border-[#26262A] rounded-3xl p-8 md:p-12">
            <h1 className="text-3xl font-bold mb-4 tracking-tighter">
              Obrigado!
            </h1>
            <p className="text-neutral-400 leading-relaxed mb-8">
              Sua confirmação foi processada. Se você confirmou sua
              pré-inscrição recentemente, o próximo passo é aguardar o e-mail
              com as instruções de acesso.
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

export default AcademyStatusConfirmation;
