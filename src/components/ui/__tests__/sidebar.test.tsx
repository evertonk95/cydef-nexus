import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SidebarMenuSkeleton } from "../sidebar";

/**
 * A largura do placeholder era sorteada com `Math.random()` durante o render
 * (react-hooks/purity). Agora é determinística por instância (`useId`): estável
 * entre renders e dentro da faixa de 50% a 90%.
 */

function skeletonWidth(container: HTMLElement) {
  const element = container.querySelector('[data-sidebar="menu-skeleton-text"]');
  const style = element?.getAttribute("style") ?? "";
  const match = /--skeleton-width:\s*(\d+)%/.exec(style);
  return match ? Number(match[1]) : Number.NaN;
}

describe("SidebarMenuSkeleton", () => {
  it("largura determinística entre re-renders, na faixa de 50% a 90%", () => {
    const { container, rerender } = render(<SidebarMenuSkeleton />);
    const first = skeletonWidth(container);

    rerender(<SidebarMenuSkeleton />);
    const second = skeletonWidth(container);

    expect(Number.isNaN(first)).toBe(false);
    expect(first).toBeGreaterThanOrEqual(50);
    expect(first).toBeLessThanOrEqual(90);
    expect(second).toBe(first);
  });
});
