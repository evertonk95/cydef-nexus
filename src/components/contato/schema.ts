import { z } from "zod";
import type { TFunction } from "i18next";
import {
  LIMITES_CONTATO,
  validarNomeContato,
  validarCargo,
  validarEmpresa,
  emailDescartavel,
  contarLinks,
  contemInvisiveis,
  normalizarMensagem,
} from "@/lib/contato/validate";
import { validarEmail } from "@/lib/academy/validate";

/**
 * Schema do formulário de contato (UX). Usa as MESMAS regras do servidor
 * (src/lib/contato/validate.ts) para o visitante ver o erro antes de enviar;
 * a autoridade continua sendo a Edge Function.
 */
export function buildContatoSchema(t: TFunction) {
  const e = (k: string, o?: Record<string, unknown>) => t(`contactAssist.form.errors.${k}`, o) as string;
  return z.object({
    nome: z.string().refine((v) => validarNomeContato(v) !== null, { message: e("nome") }),
    cargo: z.string().refine((v) => validarCargo(v) !== null, { message: e("cargo") }),
    empresa: z.string().refine((v) => validarEmpresa(v) !== null, { message: e("empresa") }),
    email: z
      .string()
      .trim()
      .min(1, { message: e("emailReq") })
      .refine((v) => validarEmail(v) && !contemInvisiveis(v), { message: e("emailInvalid") })
      .refine((v) => !emailDescartavel(v), { message: e("emailDisposable") }),
    mensagem: z
      .string()
      .refine((v) => !contemInvisiveis(v.replace(/[\n\t\r]/g, "")), { message: e("invisible") })
      .refine((v) => normalizarMensagem(v).length >= LIMITES_CONTATO.mensagemMin, {
        message: e("mensagemMin", { min: LIMITES_CONTATO.mensagemMin }),
      })
      .refine((v) => normalizarMensagem(v).length <= LIMITES_CONTATO.mensagemMax, { message: e("mensagemMax") })
      .refine((v) => !/<\s*\/?\s*[a-z!][^>]*>/i.test(v), { message: e("html") })
      .refine((v) => contarLinks(v) <= LIMITES_CONTATO.linksMax, {
        message: e("links", { max: LIMITES_CONTATO.linksMax }),
      }),
    aceito: z.boolean().refine((v) => v === true, { message: e("aceito") }),
  });
}

export type ContatoValues = z.infer<ReturnType<typeof buildContatoSchema>>;

export const CONTATO_DEFAULTS: ContatoValues = {
  nome: "",
  cargo: "",
  empresa: "",
  email: "",
  mensagem: "",
  aceito: false,
};
