import type { LevelKey } from "@/lib/courses";

/**
 * Catalogo visual da Academy (issue #143): o card da home e a pagina da Academy
 * precisam da mesma lista, e o conteudo do curso continua em courses.ts.
 * `available` marca curso com pagina publicada; o card da home so mostra esses.
 */
export interface AcademyCourseCard {
  id: string;
  slug: string;
  levelKey: LevelKey;
  duration: string;
  available: boolean;
}

export const academyCatalog: AcademyCourseCard[] = [
  { id: "fundamentals", slug: "cybersecurity-fundamentals", levelKey: "advanced", duration: "40h", available: true },
  { id: "soc", slug: "soc-analyst", levelKey: "intermediate", duration: "80h", available: true },
  { id: "blue", slug: "blue-team-advanced", levelKey: "advanced", duration: "60h", available: true },
  { id: "sc900", slug: "sc-900-prep", levelKey: "beginner", duration: "30h", available: false },
  { id: "secplus", slug: "security-plus-prep", levelKey: "intermediate", duration: "50h", available: false },
  { id: "malware", slug: "malware-analysis", levelKey: "intermediate", duration: "40h", available: false },
  { id: "incident", slug: "incident-investigation", levelKey: "advanced", duration: "45h", available: false },
];

export const availableAcademyCourses = academyCatalog.filter((c) => c.available);
