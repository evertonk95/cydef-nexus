import type { LevelKey } from "./nivel";

/** Nível do banco (pt) para a chave de i18n do site. Módulo leve. */
export const NIVEL_KEY: Record<"iniciante" | "intermediario" | "avancado", LevelKey> = {
  iniciante: "beginner",
  intermediario: "intermediate",
  avancado: "advanced",
};
