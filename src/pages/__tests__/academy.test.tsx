import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Academy from "@/pages/Academy";
import { academyCatalog } from "@/lib/academy/catalog";
import { COURSES_EN } from "@/pages/AcademyLanding/data.en";
import i18n from "@/i18n";

const en = (key: string) => String(i18n.getFixedT("en")(key));

const renderAcademy = () =>
  render(
    <MemoryRouter initialEntries={["/en/academy"]}>
      <Academy />
    </MemoryRouter>,
  );

describe("home da CyDef Academy", () => {
  it("tem um unico H1 com a proposta da Academy", () => {
    const { container } = renderAcademy();
    const h1s = container.querySelectorAll("h1");
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toContain(en("academy.heroH1a"));
    expect(h1s[0].textContent).toContain(en("academy.heroH1b"));
  });

  it("mostra os cursos gratuitos de entrada vindos da landing, como cards", () => {
    const { container } = renderAcademy();
    const free = container.querySelector("#gratuito");
    expect(free).not.toBeNull();
    for (const course of COURSES_EN) {
      expect(free?.textContent).toContain(course.title);
    }
    expect(free?.querySelectorAll("article")).toHaveLength(COURSES_EN.length);
  });

  it("lista todo o catalogo com estado honesto e so linka curso com pagina publicada", () => {
    const { container } = renderAcademy();
    const section = container.querySelector("#cursos");
    expect(section?.querySelectorAll("article")).toHaveLength(academyCatalog.length);
    const links = Array.from(section?.querySelectorAll("a") ?? []).map((a) => a.getAttribute("href"));
    const available = academyCatalog.filter((c) => c.available);
    expect(links).toHaveLength(available.length);
    for (const course of available) {
      expect(links.some((href) => href?.endsWith(`/${course.slug}`))).toBe(true);
    }
  });

  it("monta a trilha na ordem iniciante, intermediario, avancado", () => {
    const { container } = renderAcademy();
    const steps = Array.from(container.querySelectorAll("#trilha li h3")).map((h) => h.textContent);
    expect(steps).toEqual([
      en("academy.courses.fundamentals"),
      en("academy.courses.soc"),
      en("academy.courses.blue"),
    ]);
  });

  it("nao exibe pessoas, depoimentos, precos nem claims sem base", () => {
    const { container } = renderAcademy();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/official|oficial|recognized|reconhecid|best.?seller|\$\s?\d|R\$/i);
    expect(text).not.toMatch(/Everton/i);
    expect(text).not.toContain("—");
  });
});
