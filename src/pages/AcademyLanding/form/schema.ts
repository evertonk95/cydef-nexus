import { z } from "zod";

/**
 * Schema de validação do CLIENTE (UX — erros inline, A11Y-002).
 * A fronteira de segurança é o servidor (Edge Function + RPCs): este schema
 * nunca substitui a validação server-side (SEC-006).
 * Contrato HEL-M01: NÃO há campo `versao_aviso` — o servidor carimba a vigente.
 * Mensagens localizadas: o schema é construído com o `t` do idioma ativo.
 */

export const PERFIL_VALUES = ["iniciante", "transicao", "profissional", "estudante", "outro"] as const;
export type PerfilValue = (typeof PERFIL_VALUES)[number];

type TFunc = (key: string) => string;

export const buildPerfilOptions = (t: TFunc) =>
  PERFIL_VALUES.map((value) => ({ value, label: t(`form.perfilOptions.${value}`) }));

export const buildPreEnrollmentSchema = (t: TFunc) =>
  z.object({
    nome: z
      .string()
      .trim()
      .min(2, t("form.errors.nomeMin"))
      .max(80, t("form.errors.nomeMax")),
    email: z
      .string()
      .trim()
      .min(1, t("form.errors.emailReq"))
      .max(254, t("form.errors.emailMax"))
      .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), {
        message: t("form.errors.emailInvalid"),
      }),
    perfil: z.enum(PERFIL_VALUES, {
      errorMap: () => ({ message: t("form.errors.perfilReq") }),
    }),
    aceito: z
      .boolean({ errorMap: () => ({ message: t("form.errors.aceitoReq") }) })
      .refine((v) => v === true, {
        message: t("form.errors.aceitoReq"),
      }),
    declaracao_idade: z
      .boolean({ errorMap: () => ({ message: t("form.errors.idadeReq") }) })
      .refine((v) => v === true, {
        message: t("form.errors.idadeReq"),
      }),
  });

export type PreEnrollmentValues = z.infer<ReturnType<typeof buildPreEnrollmentSchema>>;

export const FORM_DEFAULT_VALUES: PreEnrollmentValues = {
  nome: "",
  email: "",
  perfil: "iniciante",
  aceito: false,
  declaracao_idade: false,
};
