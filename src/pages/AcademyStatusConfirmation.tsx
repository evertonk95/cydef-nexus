import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Info, ShieldCheck } from "lucide-react";
import { AcademyMessageLayout } from "@/components/academy/AcademyMessageLayout";
import { track } from "@/lib/analytics";
import { LANDING_PATH } from "@/lib/config";
import { L } from "@/lib/lang";

/**
 * Página neutra de status de confirmação (HEL-M02/M05).
 * TODOS os desfechos do token (válido/inválido/expirado/reutilizado) chegam
 * aqui pela MESMA URL, SEM query string — a página não diferencia estados
 * (sem oracle para o cliente). O estado vive apenas no servidor.
 * Beacon `confirmacao_concluida` dispara daqui (sem token presente — M02).
 * A nota sobre o prazo de 48 horas aparece sempre, para qualquer desfecho,
 * e por isso não revela o estado do token.
 */
const AcademyStatusConfirmation = () => {
  const { t } = useTranslation();

  useEffect(() => {
    track("confirmacao_concluida");
  }, []);

  return (
    <AcademyMessageLayout
      icon={<ShieldCheck className="w-7 h-7 text-orange-400" aria-hidden="true" />}
      title={t("status.title")}
      body={<p>{t("status.body")}</p>}
      primary={{ to: L("/academy"), label: t("status.explore") }}
      secondary={{ to: L(LANDING_PATH), label: t("status.back") }}
    >
      <p className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 text-sm text-neutral-400 leading-relaxed">
        <Info className="w-5 h-5 shrink-0 text-orange-400 mt-0.5" aria-hidden="true" />
        {t("status.note")}
      </p>
    </AcademyMessageLayout>
  );
};

export default AcademyStatusConfirmation;
