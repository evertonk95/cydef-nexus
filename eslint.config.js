import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

/**
 * Regras do preset de react-hooks (v7+). O preset `recommended` já habilita as
 * regras do React Compiler como erro; aqui elas entram como aviso, porque
 * adotá-las como erro exige ajustar quatro pontos do código (carousel.tsx,
 * sidebar.tsx, use-mobile.tsx e o formulário do Academy) e isso é uma decisão
 * separada da atualização de dependências.
 */
const reactHooksRules = Object.fromEntries(
  Object.entries(reactHooks.configs.recommended.rules).map(([rule, level]) => [
    rule,
    rule === "react-hooks/rules-of-hooks" || rule === "react-hooks/exhaustive-deps"
      ? level
      : "warn",
  ]),
);

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooksRules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
