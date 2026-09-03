// Landing content — Spanish (editorial translation of data.ts, 2026-09-03).
// Same shapes as the PT canonical data. Human review via PR.
import type { CourseItem, StepItem, FaqItem } from "./data-types";

export const COURSES_ES: CourseItem[] = [
  {
    id: "fundamentos-para-soc",
    title: "Fundamentos para SOC",
    description:
      "Conceptos esenciales de seguridad operativa, triaje de alertas y primeros pasos para trabajar en un Centro de Operaciones de Seguridad.",
    level: "Principiante",
    duration: "~4h",
    topics: ["Conceptos de SOC", "Triaje de alertas", "Primeros pasos"],
  },
  {
    id: "cybersecurity-fundamentals",
    title: "Cybersecurity Fundamentals",
    description:
      "Base de seguridad de la información para el día a día: principios, amenazas comunes y buenas prácticas de defensa.",
    level: "Principiante",
    duration: "~6h",
    topics: ["Principios de seguridad", "Amenazas comunes", "Buenas prácticas"],
  },
];

export const STEPS_ES: StepItem[] = [
  {
    title: "Preinscríbete",
    description: "Completa el formulario en menos de 30 segundos y confirma tu correo.",
  },
  {
    title: "Recibe el acceso",
    description: "Enviaremos el acceso a los cursos gratuitos a tu correo electrónico.",
  },
  {
    title: "Estudia a tu ritmo",
    description: "Contenido práctico para empezar a construir tu base en seguridad.",
  },
];

export const FAQ_ITEMS_ES: FaqItem[] = [
  {
    question: "¿Es realmente gratis?",
    answer:
      "Sí. Estos dos cursos de entrada son 100 % gratuitos, sin tarjeta de crédito y sin cargos ocultos. La CyDef Academy tendrá cursos de pago en el futuro: siempre te informaremos con claridad sobre qué es gratis y qué es de pago.",
  },
  {
    question: "¿Cuándo empieza?",
    answer:
      "Los grupos de la fase de preinscripción empiezan cuando el contenido esté publicado y recibas el acceso por correo. Confirmar la preinscripción no garantiza un cupo inmediato: garantiza prioridad en la comunicación.",
  },
  {
    question: "¿Necesito experiencia?",
    answer:
      "No. Ambos cursos son de nivel principiante, diseñados para quienes empiezan o migran hacia la ciberseguridad (SOC, Blue Team, gobernanza y otras áreas).",
  },
  {
    question: "¿Qué viene después?",
    answer:
      "Después de los cursos gratuitos, conocerás la CyDef Academy completa, con formaciones avanzadas y de pago, siempre con transparencia sobre costos y contenido.",
  },
];
