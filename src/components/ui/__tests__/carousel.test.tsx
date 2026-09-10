import { describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../carousel";

/**
 * O estado de scroll do carrossel passou a ser lido por `useSyncExternalStore`
 * sobre a API do Embla (antes: setState síncrono dentro de efeito, reprovado por
 * react-hooks/set-state-in-effect). Este teste monta o carrossel real e garante
 * que a API chega ao consumidor sem laço de render.
 */

describe("Carousel", () => {
  it("monta, entrega a API do Embla e renderiza os itens e controles", async () => {
    const setApi = vi.fn();

    const { container } = render(
      <Carousel setApi={setApi}>
        <CarouselContent>
          <CarouselItem>um</CarouselItem>
          <CarouselItem>dois</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );

    await waitFor(() => expect(setApi).toHaveBeenCalled());
    expect(container.querySelector('[aria-roledescription="carousel"]')).not.toBeNull();
    expect(container.textContent).toContain("um");
    expect(container.textContent).toContain("dois");
  });
});
