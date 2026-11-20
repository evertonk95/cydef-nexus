/**
 * Guarda da issue #143: as secoes da home sao alimentadas por dado real e
 * somem quando a fonte vem vazia.
 */
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AcademySection, LabsSection, PostsSection } from "@/components/home/HomeSections";
import i18n from "@/i18n";
import type { BlogPostMeta } from "@/lib/blog/posts";
import type { CursoMeta } from "@/lib/academy/catalogo-meta";

const en = (key: string) => String(i18n.getFixedT("en")(key));

const withRouter = (ui: React.ReactNode) => (
  <MemoryRouter initialEntries={["/en"]}>{ui}</MemoryRouter>
);

const post = (slug: string): BlogPostMeta =>
  ({
    slug,
    title: `Titulo ${slug}`,
    category: "SOC",
    excerpt: "resumo",
    date: "November 1, 2026",
    dateISO: "2026-11-01",
    readTime: "5 min read",
    image: `/assets/blog/${slug}.webp`,
    author: "CyDef Team",
  }) as BlogPostMeta;

const curso: CursoMeta = {
  slug: "soc-analyst",
  titulo: "SOC Analyst: Formação Completa",
  descricao: "Formação para analista SOC.",
  nivel: "intermediario",
  situacao: "em_breve",
  carga_horaria_h: 80,
};

describe("secoes da home", () => {
  it("nao renderiza a secao de artigos sem artigos", () => {
    const { container } = render(withRouter(<PostsSection posts={[]} />));
    expect(container.innerHTML).toBe("");
  });

  it("renderiza um card por artigo, com link do proprio slug", () => {
    const { container } = render(withRouter(<PostsSection posts={[post("primeiro"), post("segundo")]} />));
    expect(container.querySelectorAll('a[href*="/blog/"]')).toHaveLength(2);
    expect(container.querySelector('a[href="/en/blog/primeiro"]')).not.toBeNull();
    expect(container.querySelector('img[loading="lazy"]')).not.toBeNull();
    expect(container.textContent).toContain(en("home.blogSectionTitle"));
  });

  it("nao renderiza a secao da Academy sem curso disponivel", () => {
    const { container } = render(withRouter(<AcademySection courses={[]} />));
    expect(container.innerHTML).toBe("");
  });

  it("renderiza o curso do catálogo com nível, carga horária e link para a página dele em pt", () => {
    const { container } = render(withRouter(<AcademySection courses={[curso]} />));
    expect(container.textContent).toContain(curso.titulo);
    expect(container.textContent).toContain(en("academy.level.intermediate"));
    expect(container.textContent).toContain("80h");
    expect(container.querySelector('a[href="/pt/cursos/soc-analyst"]')).not.toBeNull();
  });

  it("nao renderiza a secao do Labs sem artefato publicado", () => {
    const { container } = render(withRouter(<LabsSection visible={false} />));
    expect(container.innerHTML).toBe("");
  });

  it("renderiza o card do Inora reaproveitando a copy do Labs", () => {
    const { container } = render(withRouter(<LabsSection visible />));
    expect(container.textContent).toContain(en("labs.inoraName"));
    expect(container.textContent).toContain(en("home.labsSectionCta"));
  });
});
