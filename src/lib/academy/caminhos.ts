import { contentAreaSlugs } from "@/lib/routes";

/** Os cursos são em português: a página do curso fica só em /pt/cursos/<slug>. */
export const caminhoCurso = (slug: string): string => `/pt/${contentAreaSlugs.courses.pt}/${slug}`;
