import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PrinciplesSection } from "@/components/home/HomeSections";
import i18n from "@/i18n";

const en = (key: string) => String(i18n.getFixedT("en")(key));

describe("secao Como trabalhamos", () => {
  it("renderiza os quatro principios vindos do i18n", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/en"]}>
        <PrinciplesSection />
      </MemoryRouter>,
    );
    const items = i18n.getFixedT("en")("home.principles", { returnObjects: true }) as {
      title: string;
    }[];

    expect(container.textContent).toContain(en("home.principlesTitle"));
    expect(items).toHaveLength(4);
    for (const item of items) {
      expect(container.textContent).toContain(item.title);
    }
    expect(container.querySelectorAll("section h3")).toHaveLength(4);
  });

  it("nao mostra foto nem nome de pessoa na secao", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/en"]}>
        <PrinciplesSection />
      </MemoryRouter>,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).not.toMatch(/Everton/i);
  });
});
