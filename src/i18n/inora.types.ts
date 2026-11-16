import type { inoraEn } from "./inora.en";

/** Forma do bloco `inora` do i18n (fonte: inglês). PT e ES são tipados contra
 *  ela, então chave faltando ou sobrando em qualquer idioma quebra o typecheck. */
export type InoraDict = typeof inoraEn;
