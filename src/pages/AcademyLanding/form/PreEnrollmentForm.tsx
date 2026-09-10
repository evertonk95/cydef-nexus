import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import {
  buildPerfilOptions,
  buildPreEnrollmentSchema,
  FORM_DEFAULT_VALUES,
  type PreEnrollmentValues,
} from "./schema";
import { captureApiUrl, isCaptureEnabled, isEmailEnabled, privacyPath } from "@/lib/config";
import { L } from "@/lib/lang";
import { track } from "@/lib/analytics";

/**
 * Formulário de pré-inscrição (J1) — estados: initial · submitting ·
 * validation-error · server-error · success · email-failure · rate-limited.
 *
 * - Capture desabilitada (default fail secure) → estado "inscrições em breve":
 *   NENHUM dado sai para a rede (S-02).
 * - Opt-in NÃO pré-marcado; declaração 16+ obrigatória (SEC-001/002).
 * - request_id único por montagem → retry idempotente (sem duplicar registro).
 * - Honeypot oculto (anti-bot) — humanos não veem/preenchem.
 * - Sem `versao_aviso` no payload (HEL-M01).
 * - Beacon `preinscricao_submitida` (sem PII) apenas em 202.
 * - Idioma: o componente é remontado por idioma (key={lang} no index) para que
 *   o schema zod (mensagens localizadas) seja reconstruído.
 */

type FormState =
  | { kind: "initial" }
  | { kind: "submitting" }
  | { kind: "success"; email: string }
  | { kind: "server-error" }
  | { kind: "rate-limited" }
  | { kind: "email-failure"; email: string };

export const PreEnrollmentForm = () => {
  const captureEnabled = useMemo(() => isCaptureEnabled(), []);
  const emailEnabled = useMemo(() => isEmailEnabled(), []);
  const apiUrl = useMemo(() => captureApiUrl(), []);
  const { t } = useTranslation();
  const schema = useMemo(() => buildPreEnrollmentSchema(t), [t]);
  const perfilOptions = useMemo(() => buildPerfilOptions(t), [t]);
  const requestIdRef = useRef<string>(crypto.randomUUID());
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<FormState>({ kind: "initial" });
  const successRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PreEnrollmentValues>({
    resolver: zodResolver(schema),
    defaultValues: FORM_DEFAULT_VALUES,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (state.kind === "success" || state.kind === "email-failure") {
      successRef.current?.focus();
    }
  }, [state]);

  const onSubmit = handleSubmit(async (values) => {
    if (!captureEnabled || !apiUrl) {
      // Fail secure: sem endpoint configurado nada é enviado.
      setState({ kind: "server-error" });
      return;
    }
    setState({ kind: "submitting" });
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: values.nome,
          email: values.email,
          perfil: values.perfil,
          aceito: values.aceito,
          declaracao_idade: values.declaracao_idade,
          honeypot,
          request_id: requestIdRef.current,
        }),
      });
      if (res.status === 202) {
        track("preinscricao_submitida");
        setState({ kind: "success", email: values.email });
        return;
      }
      if (res.status === 429) {
        setState({ kind: "rate-limited" });
        return;
      }
      // 400/413/415/503/network → erro de servidor genérico (sem reflexão de entrada).
      setState({ kind: "server-error" });
    } catch {
      setState({ kind: "server-error" });
    }
  });

  const handleResend = async () => {
    if (!apiUrl || (state.kind !== "email-failure" && state.kind !== "success")) return;
    setState({ kind: "submitting" });
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resend",
          request_id: requestIdRef.current,
          honeypot: "",
        }),
      });
      if (res.status === 202) {
        setState({ kind: "success", email: state.email });
      } else if (res.status === 429) {
        setState({ kind: "rate-limited" });
      } else {
        setState({ kind: "email-failure", email: state.email });
      }
    } catch {
      setState({ kind: "email-failure", email: state.email });
    }
  };

  const idBase = "pre";
  const err = (field: keyof PreEnrollmentValues) =>
    errors[field]?.message ? String(errors[field]?.message) : undefined;

  const inputClass = (hasError?: string) =>
    `w-full min-h-[48px] px-4 py-3 rounded-lg bg-[#0F0F10] border text-white placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F69021] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] transition ${
      hasError ? "border-red-500" : "border-[#26262A] hover:border-white/20"
    }`;

  // -------------------------------------------------------------------------
  // Estado "inscrições em breve" (capture desabilitada — S-02): sem coleta.
  // -------------------------------------------------------------------------
  if (!captureEnabled) {
    return (
      <section id="pre-inscricao" aria-labelledby="pre-inscricao-titulo" className="py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-[#141416] border border-[#26262A] rounded-3xl p-8 md:p-12 text-center">
            <h2 id="pre-inscricao-titulo" className="text-3xl font-bold text-white mb-4 tracking-tighter">
              {t("form.soonTitle")}
            </h2>
            <p className="text-neutral-400 leading-relaxed mb-6">
              {t("form.soonBodyA")}
              <a
                href={L(privacyPath())}
                className="text-orange-400 underline underline-offset-4 hover:text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F69021] rounded"
              >
                {t("form.soonLink")}
              </a>
              {t("form.soonBodyB")}
            </p>
            <div
              role="status"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("form.soonBadge")}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // -------------------------------------------------------------------------
  // Estados de sucesso / falha de e-mail (J1-OK / email-failure)
  // -------------------------------------------------------------------------
  if (state.kind === "success" || state.kind === "email-failure") {
    const isEmailFailure = state.kind === "email-failure";
    return (
      <section id="pre-inscricao" aria-labelledby="pre-inscricao-titulo" className="py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <div
            className="bg-[#141416] border border-[#26262A] rounded-3xl p-8 md:p-12 text-center"
            role={isEmailFailure ? "alert" : "status"}
          >
            {isEmailFailure ? (
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" aria-hidden="true" />
            )}
            <h2
              id="pre-inscricao-titulo"
              ref={successRef}
              tabIndex={-1}
              className="text-3xl font-bold text-white mb-4 tracking-tighter focus:outline-none"
            >
              {isEmailFailure ? t("form.emailFailTitle") : t("form.successTitle")}
            </h2>
            <p className="text-neutral-400 leading-relaxed mb-6">
              {isEmailFailure ? (
                t("form.emailFailBody")
              ) : (
                <>
                  {t("form.successBodyA")}{" "}
                  <strong className="text-white">{state.email}</strong>{" "}
                  {t("form.successBodyB")}
                </>
              )}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={isSubmitting || !emailEnabled}
                className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] rounded-full font-semibold text-black bg-gradient-to-r from-[#F46B27] to-[#F69021] hover:brightness-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F69021] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Mail className="h-4 w-4" aria-hidden="true" />}
                {t("form.resend")}
              </button>
              {!emailEnabled && (
                <span className="text-xs text-neutral-500">{t("form.resendDisabledNote")}</span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-6">{t("form.spamHint")}</p>
          </div>
        </div>
      </section>
    );
  }

  // -------------------------------------------------------------------------
  // Formulário ativo (capture habilitada)
  // -------------------------------------------------------------------------
  const isRateLimited = state.kind === "rate-limited";
  const isServerError = state.kind === "server-error";
  const isSubmittingUi = state.kind === "submitting" || isSubmitting;

  return (
    <section id="pre-inscricao" aria-labelledby="pre-inscricao-titulo" className="py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-[#141416] border border-[#26262A] rounded-3xl p-8 md:p-12">
          <h2 id="pre-inscricao-titulo" className="text-3xl font-bold text-white mb-2 tracking-tighter">
            {t("form.formTitle")}
          </h2>
          <p className="text-neutral-400 mb-8">{t("form.formSub")}</p>

          {/* Anúncios de status (WCAG 4.1.3) */}
          <div aria-live="polite" className="mb-4">
            {isRateLimited && (
              <div role="status" className="flex items-start gap-2 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span>{t("form.rateLimited")}</span>
              </div>
            )}
            {isServerError && (
              <div role="alert" className="flex items-start gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span>{t("form.serverError")}</span>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-6">
            {/* Honeypot (oculto para humanos; bots preenchem) */}
            <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor={`${idBase}-website`}>{t("form.honeyLabel")}</label>
              <input
                id={`${idBase}-website`}
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor={`${idBase}-nome`} className="block text-sm font-medium text-white mb-2">
                {t("form.labelNome")}
              </label>
              <input
                id={`${idBase}-nome`}
                type="text"
                autoComplete="name"
                aria-required="true"
                aria-invalid={err("nome") ? true : undefined}
                aria-describedby={err("nome") ? `${idBase}-nome-erro` : undefined}
                className={inputClass(err("nome"))}
                placeholder={t("form.phNome")}
                disabled={isSubmittingUi}
                {...register("nome")}
              />
              {err("nome") && (
                <p id={`${idBase}-nome-erro`} className="mt-2 text-sm text-red-400 flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {err("nome")}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={`${idBase}-email`} className="block text-sm font-medium text-white mb-2">
                {t("form.labelEmail")}
              </label>
              <input
                id={`${idBase}-email`}
                type="email"
                autoComplete="email"
                aria-required="true"
                aria-invalid={err("email") ? true : undefined}
                aria-describedby={err("email") ? `${idBase}-email-erro` : undefined}
                className={inputClass(err("email"))}
                placeholder={t("form.phEmail")}
                disabled={isSubmittingUi}
                {...register("email")}
              />
              {err("email") && (
                <p id={`${idBase}-email-erro`} className="mt-2 text-sm text-red-400 flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {err("email")}
                </p>
              )}
            </div>

            <div>
              <label htmlFor={`${idBase}-perfil`} className="block text-sm font-medium text-white mb-2">
                {t("form.labelPerfil")}
              </label>
              <select
                id={`${idBase}-perfil`}
                aria-required="true"
                aria-invalid={err("perfil") ? true : undefined}
                aria-describedby={err("perfil") ? `${idBase}-perfil-erro` : undefined}
                className={inputClass(err("perfil"))}
                disabled={isSubmittingUi}
                {...register("perfil")}
              >
                {perfilOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0F0F10]">
                    {opt.label}
                  </option>
                ))}
              </select>
              {err("perfil") && (
                <p id={`${idBase}-perfil-erro`} className="mt-2 text-sm text-red-400 flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {err("perfil")}
                </p>
              )}
            </div>

            {/* Opt-in LGPD — NUNCA pré-marcado (SEC-001) */}
            <fieldset className="space-y-3">
              <legend className="sr-only">{t("form.legendConsents")}</legend>
              <div className="flex items-start gap-3">
                <input
                  id={`${idBase}-aceito`}
                  type="checkbox"
                  aria-invalid={err("aceito") ? true : undefined}
                  aria-describedby={err("aceito") ? `${idBase}-aceito-erro` : undefined}
                  className="mt-1 h-5 w-5 rounded border-[#26262A] bg-[#0F0F10] accent-[#F69021] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F69021] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                  disabled={isSubmittingUi}
                  {...register("aceito")}
                />
                <label htmlFor={`${idBase}-aceito`} className="text-sm text-neutral-300 leading-relaxed">
                  {t("form.consentPre")}{" "}
                  <a
                    href={L(privacyPath())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 underline underline-offset-4 hover:text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F69021] rounded"
                  >
                    {t("form.consentLink")}
                  </a>{" "}
                  {t("form.consentPost")}
                </label>
              </div>
              {err("aceito") && (
                <p id={`${idBase}-aceito-erro`} className="text-sm text-red-400 flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {err("aceito")}
                </p>
              )}

              {/* Barreira 16+ (SEC-002) */}
              <div className="flex items-start gap-3">
                <input
                  id={`${idBase}-idade`}
                  type="checkbox"
                  aria-invalid={err("declaracao_idade") ? true : undefined}
                  aria-describedby={err("declaracao_idade") ? `${idBase}-idade-erro` : undefined}
                  className="mt-1 h-5 w-5 rounded border-[#26262A] bg-[#0F0F10] accent-[#F69021] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F69021] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                  disabled={isSubmittingUi}
                  {...register("declaracao_idade")}
                />
                <label htmlFor={`${idBase}-idade`} className="text-sm text-neutral-300 leading-relaxed">
                  {t("form.ageDeclare")}
                </label>
              </div>
              {err("declaracao_idade") && (
                <p id={`${idBase}-idade-erro`} className="text-sm text-red-400 flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {err("declaracao_idade")}
                </p>
              )}
            </fieldset>

            <button
              type="submit"
              disabled={isSubmittingUi}
              className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] rounded-full font-semibold text-black bg-gradient-to-r from-[#F46B27] to-[#F69021] hover:brightness-110 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F69021] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmittingUi ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {t("form.submitSending")}
                </>
              ) : (
                t("form.submit")
              )}
            </button>
            <p className="text-xs text-neutral-500 text-center">
              {t("form.footnotePre")}{" "}
              <a
                href={L(privacyPath())}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 underline underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F69021] rounded"
              >
                {t("form.footnoteLink")}
              </a>
              {t("form.footnotePost")}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};
