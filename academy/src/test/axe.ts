import axe from "axe-core";

/** Roda o axe e devolve só as violações sérias ou críticas. */
export async function violacoesGraves(el: Element): Promise<string[]> {
  const r = await axe.run(el, { rules: { "color-contrast": { enabled: false } } });
  return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.help}`);
}
