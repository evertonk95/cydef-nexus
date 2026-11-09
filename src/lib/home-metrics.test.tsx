/**
 * Guarda da issue #141: os numeros da home vem da fonte de dados, nunca digitados a mao.
 * Se alguem trocar um valor por constante literal, este teste quebra.
 */
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Index from "@/pages/Index";
import i18n, { type Lang } from "@/i18n";
import { countPostsForLang } from "@/lib/blog/posts";
import { coursesByLang } from "@/lib/courses";
import { labsArtifactsMeta } from "@/lib/labs/artifacts";

const valorDe = (container: HTMLElement, key: string): string | null =>
  container.querySelector(`[data-testid="metric-${key}"]`)?.textContent?.trim() ?? null;

const renderHome = () =>
  render(
    <MemoryRouter initialEntries={["/en"]}>
      <Index />
    </MemoryRouter>,
  );

describe("metricas da home", () => {
  it("deriva artigos, idiomas, cursos e projetos das fontes reais", () => {
    const lang = (i18n.resolvedLanguage ?? i18n.language ?? "en") as Lang;
    const { container } = renderHome();

    expect(valorDe(container, "statArticles")).toBe(String(countPostsForLang(lang)));
    expect(valorDe(container, "statLangs")).toBe(String(["en", "pt", "es"].length));
    expect(valorDe(container, "statCourses")).toBe(
      String(Object.keys(coursesByLang[lang]).length),
    );
    expect(valorDe(container, "statLabs")).toBe(String(labsArtifactsMeta.length));
  });

  it("nao exibe alunos matriculados: a construcao da Academy ainda nao fechou (decisao 09/11/2026)", () => {
    const { container } = renderHome();
    expect(valorDe(container, "statStudents")).toBeNull();
  });
});
