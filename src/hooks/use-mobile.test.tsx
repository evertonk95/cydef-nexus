import { describe, expect, it, afterEach, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useIsMobile } from "./use-mobile";

/**
 * O hook passou a ler o viewport com `useSyncExternalStore` (antes: setState
 * dentro de efeito, reprovado por react-hooks/set-state-in-effect). Estes testes
 * guardam o contrato: valor correto já no primeiro render e reatividade à
 * mudança de media query, com a assinatura removida no unmount.
 */

type Listener = (event: MediaQueryListEvent) => void;

function stubMatchMedia(initialMatches: boolean) {
  const listeners = new Set<Listener>();
  let matches = initialMatches;

  const mql = {
    get matches() {
      return matches;
    },
    media: "(max-width: 767px)",
    onchange: null,
    addEventListener: (_type: string, listener: Listener) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: Listener) => {
      listeners.delete(listener);
    },
    addListener: (listener: Listener) => listeners.add(listener),
    removeListener: (listener: Listener) => listeners.delete(listener),
    dispatchEvent: () => false,
  };

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mql),
  );

  return {
    setMatches(next: boolean) {
      matches = next;
      act(() => {
        listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent));
      });
    },
    listenerCount: () => listeners.size,
  };
}

const Probe = () => <span data-testid="valor">{String(useIsMobile())}</span>;

describe("useIsMobile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("viewport móvel: responde true já no primeiro render", () => {
    stubMatchMedia(true);
    render(<Probe />);
    expect(screen.getByTestId("valor")).toHaveTextContent("true");
  });

  it("viewport desktop: responde false", () => {
    stubMatchMedia(false);
    render(<Probe />);
    expect(screen.getByTestId("valor")).toHaveTextContent("false");
  });

  it("reage à mudança de media query e remove a assinatura no unmount", () => {
    const media = stubMatchMedia(false);
    const { unmount } = render(<Probe />);
    expect(media.listenerCount()).toBe(1);

    media.setMatches(true);
    expect(screen.getByTestId("valor")).toHaveTextContent("true");

    unmount();
    expect(media.listenerCount()).toBe(0);
  });
});
