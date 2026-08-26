import { z } from "zod";

/**
 * Schema de validação do CLIENTE (UX — erros inline, A11Y-002).
 * A fronteira de segurança é o servidor (Edge Function + RPCs): este schema
 * nunca substitui a validação server-side (SEC-006).
 * Contrato HEL-M01: NÃO há campo `versao_aviso` — o servidor carimba a vigente.
 */

export const PERFIL_OPTIONS = [
  { value: "iniciante", label: "Iniciante em segurança" },
  { value: "transicao", label: "Em transição para cibersegurança" },
  { value: "profissional", label: "Profissional ativo" },
  { value: "estudante", label: "Estudante" },
  { value: "outro", label: "Outro" },
] as const;

export const preEnrollmentSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo.")
    .max(80, "Nome muito longo."),
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail.")
    .max(254, "E-mail muito longo.")
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), {
      message: "E-mail inválido. Ex.: nome@dominio.com",
    }),
  perfil: z.enum(["iniciante", "transicao", "profissional", "estudante", "outro"], {
    errorMap: () => ({ message: "Selecione seu perfil." }),
  }),
  aceito: z
    .boolean({ errorMap: () => ({ message: "É preciso concordar com o Aviso de Privacidade." }) })
    .refine((v) => v === true, {
      message: "É preciso concordar com o Aviso de Privacidade.",
    }),
  declaracao_idade: z
    .boolean({ errorMap: () => ({ message: "É preciso confirmar que você tem 16 anos ou mais." }) })
    .refine((v) => v === true, {
      message: "É preciso confirmar que você tem 16 anos ou mais.",
    }),
});

export type PreEnrollmentValues = z.infer<typeof preEnrollmentSchema>;

export const FORM_DEFAULT_VALUES: PreEnrollmentValues = {
  nome: "",
  email: "",
  perfil: "iniciante",
  aceito: false,
  declaracao_idade: false,
};
