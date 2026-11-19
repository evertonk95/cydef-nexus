/**
 * Cybersecurity Fundamentals é curso gratuito (decisão do Everton,
 * 18/11/2026): sai da lista de cursos pagos e fica só na seção de cursos
 * gratuitos. A página antiga do curso redireciona para a página dos
 * gratuitos, e o nome bate com o do portal (academy.cydef.com.br). Antes
 * desta correção a página dizia "Cybersecurity Avançado", nível avançado,
 * 40 horas e "sob consulta".
 */
import { describe, expect, it } from "vitest";
import { courseDataEn, courseDataEs, courseDataPt } from "@/lib/courses";
import { academyCatalog } from "@/lib/academy/catalog";
import { legacyCoursePaths, legacyPageSlugs } from "@/lib/routes";
import { COURSES } from "@/pages/AcademyLanding/data";
import { COURSES_EN } from "@/pages/AcademyLanding/data.en";
import { COURSES_ES } from "@/pages/AcademyLanding/data.es";
import { pt } from "@/i18n/pt";
import { en } from "@/i18n/en";
import { es } from "@/i18n/es";

const GRATUITOS = ["fundamentos-para-soc", "cybersecurity-fundamentals"];

describe("cursos gratuitos fora da lista de cursos pagos", () => {
  it("nenhum curso gratuito aparece no catálogo pago nem tem página de curso pago", () => {
    for (const slug of GRATUITOS) {
      expect(academyCatalog.some((c) => c.slug === slug)).toBe(false);
      for (const dados of [courseDataPt, courseDataEn, courseDataEs]) expect(dados[slug]).toBeUndefined();
    }
  });

  it("os dois continuam na seção de cursos gratuitos, nos três idiomas, como iniciantes", () => {
    for (const lista of [COURSES, COURSES_EN, COURSES_ES]) {
      expect(lista.map((c) => c.id).sort()).toEqual([...GRATUITOS].sort());
    }
    expect(COURSES.find((c) => c.id === "cybersecurity-fundamentals")).toMatchObject({ level: "Iniciante", duration: "~6h" });
  });

  it("a página antiga do Cybersecurity Fundamentals redireciona para os gratuitos", () => {
    expect(legacyCoursePaths["cybersecurity-fundamentals"]).toBe("/academy/gratuito");
    // Não pode colidir com slug antigo de página.
    for (const lang of ["pt", "en", "es"] as const) expect(legacyPageSlugs[lang]["cybersecurity-fundamentals"]).toBeUndefined();
  });

  it("o nome é o mesmo do portal nos três idiomas", () => {
    for (const t of [pt, en, es]) expect(t.academy.courses.fundamentals).toBe("Cybersecurity Fundamentals");
  });
});
