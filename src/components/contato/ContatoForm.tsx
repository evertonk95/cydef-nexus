import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2, Loader2, Send, ShieldCheck } from "lucide-react";
import { buildContatoSchema, CONTATO_DEFAULTS, type ContatoValues } from "./schema";
import { Turnstile } from "./Turnstile";
import { contactApiUrl, turnstileSiteKey } from "@/lib/config";
import { LIMITES_CONTATO } from "@/lib/contato/validate";
import type { Triagem } from "@/lib/contato/triagem";
import { L, currentLang } from "@/lib/lang";
import { track } from "@/lib/analytics";
import { PrimaryCtaContent } from "@/components/academy/PrimaryCta";
import { primaryCtaClass, focusRing } from "@/components/academy/ctaStyles";

/**
 * Formulário de contato comercial. Só é montado com a flag ligada e com a
 * triagem do bot concluída. Controles no cliente (UX + primeira barreira):
 * honeypot, tempo de preenchimento, Turnstile, limites e regras iguais às do
 * servidor, request_id por montagem (reenvio idempotente) e mensagens de erro
 * que nunca refletem o que o servidor recebeu.
 */

type ErroServidor = "rateLimited" | "capacity" | "verification" | "emailRejected" | "tooManyLinks" | "generic";
type Estado =
  | { kind: "initial" }
  | { kind: "submitting" }
  | { kind: "success"; protocolo: string }
  | { kind: "error"; erro: ErroServidor };

/** Tempo de preenchimento (fora do componente: chamado só no envio). */
const msDesde = (inicio: number) => Date.now() - inicio;

const Erro = ({ id, msg }: { id: string; msg?: string }) =>
  msg ? (
    <p id={id} className="mt-2 text-sm text-red-400 flex items-start gap-1.5">
      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      {msg}
    </p>
  ) : null;

export const ContatoForm = ({ triagem }: { triagem: Triagem }) => {
  const { t } = useTranslation();
  const schema = useMemo(() => buildContatoSchema(t), [t]);
  const apiUrl = useMemo(() => contactApiUrl(), []);
  const siteKey = useMemo(() => turnstileSiteKey(), []);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [inicio, setInicio] = useState(() => Date.now());
  const [honeypot, setHoneypot] = useState("");
  const [token, setToken] = useState("");
  const [tokenErro, setTokenErro] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [estado, setEstado] = useState<Estado>({ kind: "initial" });
  const statusRef = useRef<HTMLHeadingElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ContatoValues>({
    resolver: zodResolver(schema),
    defaultValues: CONTATO_DEFAULTS,
    mode: "onSubmit",
  });
  const tamanho = (useWatch({ control, name: "mensagem" }) ?? "").length;

  useEffect(() => {
    if (estado.kind === "success") statusRef.current?.focus();
  }, [estado]);

  const onToken = useCallback((tk: string) => {
    setToken(tk);
    if (tk) setTokenErro(false);
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      setTokenErro(true);
      return;
    }
    if (!apiUrl) {
      setEstado({ kind: "error", erro: "generic" });
      return;
    }
    setEstado({ kind: "submitting" });
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        referrerPolicy: "strict-origin",
        body: JSON.stringify({
          ...values,
          triagem,
          honeypot,
          tempo_ms: msDesde(inicio),
          turnstile_token: token,
          request_id: requestId,
        }),
      });
      if (res.status === 202) {
        track("contato_enviado");
        setEstado({ kind: "success", protocolo: requestId.slice(0, 8).toUpperCase() });
        return;
      }
      let erro: ErroServidor = "generic";
      if (res.status === 429) erro = "rateLimited";
      else if (res.status === 403) erro = "verification";
      else {
        const body = (await res.json().catch(() => ({}))) as { erro?: string };
        if (body.erro === "capacidade") erro = "capacity";
        else if (body.erro === "email_nao_aceito") erro = "emailRejected";
        else if (body.erro === "links_demais") erro = "tooManyLinks";
      }
      // Token do Turnstile é de uso único: qualquer falha pede um novo.
      setResetKey((k) => k + 1);
      setEstado({ kind: "error", erro });
    } catch {
      setResetKey((k) => k + 1);
      setEstado({ kind: "error", erro: "generic" });
    }
  });

  const novaMensagem = () => {
    reset(CONTATO_DEFAULTS);
    setRequestId(crypto.randomUUID());
    setInicio(Date.now());
    setResetKey((k) => k + 1);
    setEstado({ kind: "initial" });
  };

  if (estado.kind === "success") {
    return (
      <div role="status" className="rounded-2xl border border-orange-500/30 bg-neutral-950/60 p-6 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
        <CheckCircle2 className="h-10 w-10 text-orange-400 mx-auto mb-3" aria-hidden="true" />
        <h3 ref={statusRef} tabIndex={-1} className="text-xl font-bold text-white mb-2 focus:outline-none">
          {t("contactAssist.form.successTitle")}
        </h3>
        <p className="text-neutral-400 leading-relaxed mb-3">{t("contactAssist.form.successBody")}</p>
        <p className="text-sm text-neutral-500 mb-5">
          {t("contactAssist.form.protocol")}: <span className="font-mono text-white">{estado.protocolo}</span>
        </p>
        <button type="button" onClick={novaMensagem} className={`text-sm text-orange-400 underline underline-offset-4 hover:text-orange-300 rounded ${focusRing}`}>
          {t("contactAssist.form.newMessage")}
        </button>
      </div>
    );
  }

  const enviando = estado.kind === "submitting";
  const idBase = "contato";
  const err = (f: keyof ContatoValues) => (errors[f]?.message ? String(errors[f]?.message) : undefined);
  const inputClass = (e?: string) =>
    `w-full min-h-[48px] px-4 py-3 rounded-lg bg-[#0F0F10] border text-white placeholder:text-neutral-500 ${focusRing} transition-colors duration-150 ${
      e ? "border-red-500" : "border-[#26262A] hover:border-white/20"
    }`;

  const campo = (
    f: "nome" | "cargo" | "empresa" | "email",
    label: string,
    ph: string,
    extra: { type?: string; autoComplete: string; maxLength: number; hint?: string },
  ) => (
    <div>
      <label htmlFor={`${idBase}-${f}`} className="block text-sm font-medium text-white mb-2">
        {label}
      </label>
      <input
        id={`${idBase}-${f}`}
        type={extra.type ?? "text"}
        autoComplete={extra.autoComplete}
        maxLength={extra.maxLength}
        spellCheck={false}
        aria-required="true"
        aria-invalid={err(f) ? true : undefined}
        aria-describedby={[err(f) ? `${idBase}-${f}-erro` : "", extra.hint ? `${idBase}-${f}-dica` : ""].filter(Boolean).join(" ") || undefined}
        className={inputClass(err(f))}
        placeholder={ph}
        disabled={enviando}
        {...register(f)}
      />
      {extra.hint && !err(f) && (
        <p id={`${idBase}-${f}-dica`} className="mt-2 text-xs text-neutral-500">
          {extra.hint}
        </p>
      )}
      <Erro id={`${idBase}-${f}-erro`} msg={err(f)} />
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 [color-scheme:dark]" aria-labelledby={`${idBase}-titulo`}>
      <h3 id={`${idBase}-titulo`} className="text-lg font-bold text-white">
        {t("contactAssist.form.title")}
      </h3>

      <div aria-live="polite">
        {estado.kind === "error" && (
          <div role="alert" className="flex items-start gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span>{t(`contactAssist.form.server.${estado.erro}`)}</span>
          </div>
        )}
      </div>

      {/* Honeypot: invisível para humanos e leitores de tela; robô preenche. */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`${idBase}-site`}>{t("contactAssist.form.honeyLabel")}</label>
        <input id={`${idBase}-site`} type="text" name="site" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {campo("nome", t("contactAssist.form.labelNome"), t("contactAssist.form.phNome"), { autoComplete: "name", maxLength: LIMITES_CONTATO.nomeMax })}
        {campo("cargo", t("contactAssist.form.labelCargo"), t("contactAssist.form.phCargo"), { autoComplete: "organization-title", maxLength: LIMITES_CONTATO.cargoMax })}
        {campo("empresa", t("contactAssist.form.labelEmpresa"), t("contactAssist.form.phEmpresa"), { autoComplete: "organization", maxLength: LIMITES_CONTATO.empresaMax })}
        {campo("email", t("contactAssist.form.labelEmail"), t("contactAssist.form.phEmail"), {
          type: "email",
          autoComplete: "email",
          maxLength: LIMITES_CONTATO.emailMax,
          hint: t("contactAssist.form.hintEmail"),
        })}
      </div>

      <div>
        <label htmlFor={`${idBase}-mensagem`} className="block text-sm font-medium text-white mb-2">
          {t("contactAssist.form.labelMensagem")}
        </label>
        <textarea
          id={`${idBase}-mensagem`}
          rows={6}
          maxLength={LIMITES_CONTATO.mensagemMax}
          aria-required="true"
          aria-invalid={err("mensagem") ? true : undefined}
          aria-describedby={`${idBase}-mensagem-contador${err("mensagem") ? ` ${idBase}-mensagem-erro` : ""}`}
          className={`${inputClass(err("mensagem"))} resize-y min-h-[140px]`}
          placeholder={t("contactAssist.form.phMensagem")}
          disabled={enviando}
          {...register("mensagem")}
        />
        <p id={`${idBase}-mensagem-contador`} className="mt-1 text-xs text-neutral-500 text-right tabular-nums">
          {t("contactAssist.form.counter", { n: tamanho, max: LIMITES_CONTATO.mensagemMax })}
        </p>
        <Erro id={`${idBase}-mensagem-erro`} msg={err("mensagem")} />
      </div>

      {/* Consentimento LGPD: nunca pré-marcado. */}
      <div>
        <div className="flex items-start gap-3">
          <input
            id={`${idBase}-aceito`}
            type="checkbox"
            aria-invalid={err("aceito") ? true : undefined}
            aria-describedby={err("aceito") ? `${idBase}-aceito-erro` : undefined}
            className={`mt-0.5 h-5 w-5 shrink-0 rounded border-[#26262A] bg-[#0F0F10] accent-orange-500 ${focusRing}`}
            disabled={enviando}
            {...register("aceito")}
          />
          <label htmlFor={`${idBase}-aceito`} className="text-sm text-neutral-300 leading-relaxed">
            {t("contactAssist.form.consentPre")}{" "}
            <a href={L("/privacidade")} target="_blank" rel="noopener noreferrer" className={`text-orange-400 underline underline-offset-4 hover:text-orange-300 rounded ${focusRing}`}>
              {t("contactAssist.form.consentLink")}
            </a>{" "}
            {t("contactAssist.form.consentPost")}
          </label>
        </div>
        <Erro id={`${idBase}-aceito-erro`} msg={err("aceito")} />
      </div>

      <div>
        <Turnstile siteKey={siteKey} lang={currentLang()} resetKey={resetKey} onToken={onToken} loadingLabel={t("contactAssist.form.turnstileLoading")} />
        {tokenErro && <Erro id={`${idBase}-turnstile-erro`} msg={t("contactAssist.form.errors.turnstile")} />}
        <p className="mt-2 text-xs text-neutral-500 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-orange-400/80" aria-hidden="true" />
          {t("contactAssist.form.turnstileNote")}
        </p>
      </div>

      <button type="submit" disabled={enviando} className={`${primaryCtaClass} w-full justify-between min-h-[48px]`}>
        <PrimaryCtaContent
          icon={enviando ? <Loader2 className="w-4 h-4 text-white animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4 text-white" aria-hidden="true" />}
        >
          {enviando ? t("contactAssist.form.sending") : t("contactAssist.form.submit")}
        </PrimaryCtaContent>
      </button>
    </form>
  );
};
