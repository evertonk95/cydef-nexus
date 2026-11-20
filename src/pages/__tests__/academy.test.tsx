import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Academy from "@/pages/Academy";
import { trilhasComCursos } from "@/lib/academy/catalogo";
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

  it("mostra um bloco por trilha com os cursos do catálogo, cada um com link para a página dele em pt", () => {
    const { container } = renderAcademy();
    const section = container.querySelector("#cursos");
    const trilhas = trilhasComCursos();
    expect(trilhas.length).toBeGreaterThan(0);
    const blocos = Array.from(section?.querySelectorAll("h3[id^=\"trilha-\"]") ?? []).map((h) => h.textContent);
    expect(blocos).toEqual(trilhas.map((t) => t.titulo));
    for (const t of trilhas) {
      const bloco = section?.querySelector(`[aria-labelledby="trilha-${t.slug}"]`);
      expect(bloco?.querySelectorAll("article")).toHaveLength(t.cursosDaTrilha.length);
      for (const c of t.cursosDaTrilha) expect(bloco?.querySelector(`a[href="/pt/cursos/${c.slug}"]`)).not.toBeNull();
    }
    expect(section?.querySelector('a[href="/en/academy/catalogo"]')?.textContent).toContain(en("academyCatalog.seeAll"));
  });

  it("nao exibe pessoas, depoimentos, preco de curso fora de venda nem claims sem base", () => {
    const { container } = renderAcademy();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/official|oficial|recognized|reconhecid|best.?seller|\$\s?\d|R\$/i);
    expect(text).not.toMatch(/Everton/i);
    expect(text).not.toContain("—");
  });
});
