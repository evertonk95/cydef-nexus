import type { contatoEn } from "./contato.en";

/** Forma do bloco `contactAssist` do i18n (fonte: inglês). PT e ES são tipados
 *  contra ela: chave faltando ou sobrando em qualquer idioma quebra o typecheck. */
export type ContatoDict = typeof contatoEn;
