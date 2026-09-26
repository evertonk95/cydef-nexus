// Mapa página -> componente do `PageRouter` (src/lib/SeoRouter.tsx).
//
// Vive em módulo próprio, e não dentro do SeoRouter, porque o router exporta
// componentes e o `react-refresh/only-export-components` reclama (warning) de
// arquivo que exporta constante junto de componente.
//
// O tipo `Record<PageKey, …>` é a guarda de paridade com `pageSlugs`
// (src/lib/routes.ts): chave de página nova sem componente aqui não passa no
// typecheck, e o teste src/lib/sitemap-paginas.test.ts usa este MESMO mapa para
// exigir que toda URL do sitemap tenha página de verdade. A falta dessa
// paridade publicou `/pt|/en|/es/(cursos|courses)/` no sitemap enquanto o
// `PageRouter` respondia `NotFound` (soft-404 nos 3 idiomas, etapa 82).
import type { ComponentType } from "react";
import type { PageKey } from "@/lib/routes";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Labs from "@/pages/Labs";
import Research from "@/pages/Research";
import Academy from "@/pages/Academy";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";

export const PAGE_COMPONENTS: Record<PageKey, ComponentType> = {
  about: About,
  ecosystem: Services,
  academy: Academy,
  labs: Labs,
  research: Research,
  blog: Blog,
  contact: Contact,
  privacy: Privacy,
  terms: Terms,
};
