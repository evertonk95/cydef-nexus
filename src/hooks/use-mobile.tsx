import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

/**
 * O viewport e um sistema externo ao React: o hook le via `useSyncExternalStore`
 * (mesmo padrao do useMediaQuery canonico) em vez de sincronizar state dentro de
 * efeito, o que a regra react-hooks/set-state-in-effect reprova. Alem de passar
 * no lint, o valor correto ja esta disponivel no primeiro render.
 */
const subscribe = (onStoreChange: () => void) => {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
};

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;

/** SSG/prerender (jsdom sem layout): assume desktop, como antes do efeito. */
const getServerSnapshot = () => false;

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
