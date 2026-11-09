/**
 * Estilos compartilhados da Academy (home, landing e formulario).
 * Ficam num .ts separado para os arquivos de componente exportarem so componentes.
 */

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";

/** Botao principal no padrao da home do site: pilula escura, icone laranja, seta e brilho. */
export const primaryCtaClass = `group inline-flex items-center gap-3 rounded-full bg-neutral-950/90 border border-white/10 py-2 pl-2 pr-3 text-base font-medium text-white shadow-[0_0_25px_rgba(249,115,22,0.3),0_8px_40px_rgba(249,115,22,0.15)] hover:border-orange-500/50 hover:shadow-[0_0_40px_rgba(249,115,22,0.45)] hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-200 ease-out disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${focusRing}`;

export const badgeOrange =
  "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-orange-500/10 border border-orange-500/30 text-orange-400";

export const badgeNeutral =
  "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white/5 border border-white/15 text-neutral-400";

export const badgeFree =
  "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-orange-500 text-black";
