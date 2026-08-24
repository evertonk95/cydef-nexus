import axe from "axe-core";
import { expect } from "vitest";

/**
 * Runner de a11y (axe-core) para testes de componente.
 * Regras que exigem renderização real (ex.: color-contrast precisa de canvas)
 * são puladas automaticamente pelo axe em jsdom — a auditoria completa
 * (contraste medido, NVDA/VoiceOver, reflow/zoom) fica com Vera Validação
 * (A11Y-001/002 retestes obrigatórios no build).
 */
export async function expectNoViolations(container: HTMLElement): Promise<void> {
  const results = await axe.run(container, {
    rules: {
      // jsdom não calcula cor; a regra é validada manualmente/em browser real.
      "color-contrast": { enabled: false },
    },
  });
  expect(
    results.violations.map((v) => `${v.id}: ${v.help}`),
    `Violações axe (${results.violations.length})`,
  ).toEqual([]);
}
