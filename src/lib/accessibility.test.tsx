/**
 * Auditoria de acessibilidade (NEX-P2-05) — axe-core via vitest-axe (jsdom).
 * Meta: zero violações críticas/sérias nas páginas principais (WCAG 2.2 AA).
 * Regras que exigem layout/CSS real (ex.: color-contrast) ficam "incomplete"
 * em jsdom e não contam como violação — a validação visual/contraste é feita
 * em produção (axe no navegador, etapa pós-deploy).
 */
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import "vitest-axe/extend-expect";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Contact from "@/pages/Contact";
import Academy from "@/pages/Academy";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import CoursePage from "@/pages/CoursePage";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/NotFound";

// vitest-axe 0.1.0 augmenta `namespace Vi` (API antiga) — Vitest 3 usa o módulo.
declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- default exige `any` p/ casar com a interface do Vitest
  interface Assertion<T = any> {
    toHaveNoViolations(): Promise<void>;
  }
}

const withRouter = (ui: React.ReactNode) => (
  <MemoryRouter initialEntries={["/en"]}>{ui}</MemoryRouter>
);

const POST_SLUG = "como-estruturar-um-soc-do-zero";

const pages: [string, React.ReactNode][] = [
  ["Home (Index)", withRouter(<Index />)],
  ["About", withRouter(<About />)],
  ["Services (Ecossistema)", withRouter(<Services />)],
  ["Contact", withRouter(<Contact />)],
  ["Academy", withRouter(<Academy />)],
  ["Blog", withRouter(<Blog />)],
  ["Privacy", withRouter(<Privacy />)],
  ["Terms", withRouter(<Terms />)],
  ["NotFound", withRouter(<NotFound />)],
];

describe("acessibilidade WCAG 2.2 (axe, páginas principais)", () => {
  for (const [name, ui] of pages) {
    it(`${name} sem violações críticas/sérias`, async () => {
      const { container } = render(ui);
      expect(await axe(container)).toHaveNoViolations();
    });
  }

  it("BlogPost sem violações críticas/sérias", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={[`/en/blog/${POST_SLUG}`]}>
        <Routes>
          <Route path="/:lang/blog/:slug" element={<BlogPost />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("CoursePage (curso com ementa) sem violações críticas/sérias", async () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/en/courses/cybersecurity-fundamentals"]}>
        <Routes>
          <Route path="/:lang/:area/:courseId" element={<CoursePage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
