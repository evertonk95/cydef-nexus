import { defineConfig, devices } from "@playwright/test";

/**
 * Testes de ponta a ponta do portal: o build de produção, servido pelo
 * `vite preview`, conversando com um Supabase falso (e2e/supabase-falso.mjs).
 * Turnstile e YouTube são simulados nos próprios testes. Nada sai para a
 * internet.
 *
 * PW_CHROME aponta para um Chrome já instalado, quando não se quer baixar o
 * Chromium do Playwright (máquina local). No CI o Chromium é instalado.
 */
const API = "http://localhost:54399";
const PORTAL = "http://localhost:4180";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]] : "list",
  use: {
    baseURL: PORTAL,
    trace: "retain-on-failure",
    launchOptions: process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node e2e/supabase-falso.mjs",
      url: `${API}/__saude`,
      reuseExistingServer: !process.env.CI,
      env: { PORTA: "54399" },
    },
    {
      command: "npx vite build --outDir dist-e2e && npx vite preview --outDir dist-e2e --port 4180 --strictPort",
      url: PORTAL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        VITE_SUPABASE_URL: API,
        VITE_SUPABASE_ANON_KEY: "anon-e2e",
        VITE_ACESSO_API_URL: `${API}/functions/v1/academy-acesso`,
        VITE_TURNSTILE_SITE_KEY: "site-e2e",
      },
    },
  ],
});
