// ============================================================
// playwright.config.ts — configuración del harness OmniPizza
// ============================================================
// Analogía QA: el "master test plan" del harness. Define dónde
// viven los tests, la ejecución en paralelo, la matriz
// cross-browser + responsive (UI) frente al project de API,
// timeouts generosos para el cold start de Render y el reporteo —
// incluyendo nuestro reporter Observer (./src/core/reporter.ts).
// ============================================================

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  // Los specs viven junto a cada slice vertical en src/features/<feature>/.
  testDir: "./src/features",

  // Paralelo real: cada archivo corre en su propio worker y, dentro del
  // archivo, los tests también van en paralelo.
  fullyParallel: true,

  // Guardas de CI: rechaza un test.only olvidado; reintenta sólo en CI.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  // Workers: en CI fijamos 2 por estabilidad; en local, undefined deja que
  // Playwright use ~50% de los núcleos disponibles.
  workers: process.env.CI ? 2 : undefined,

  // Timeout generoso por el cold start de Render; expect con su propio margen.
  timeout: 60_000,
  expect: { timeout: 10_000 },

  // Reporteo: la lista nativa + nuestro reporter Observer del ciclo de vida.
  reporter: [["list"], ["./src/core/reporter.ts"]],

  // Defaults para todos los projects.
  use: {
    baseURL: process.env.BASE_URL,
    trace: "retain-on-failure",
  },

  projects: [
    // --- UI: matriz cross-browser + responsive -----------------------------
    // Los cinco projects de UI excluyen los *.api.spec.ts (esos corren SÓLO en
    // el project "api", para no lanzar un browser sin necesidad).
    {
      name: "ui-chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /.*\.api\.spec\.ts/,
    },
    {
      name: "ui-firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: /.*\.api\.spec\.ts/,
    },
    {
      name: "ui-webkit",
      use: { ...devices["Desktop Safari"] },
      testIgnore: /.*\.api\.spec\.ts/,
    },
    {
      // Viewport móvil (<768px): ejercita la rama "-responsive" de tid()
      // en BasePage (testids con sufijo -responsive vs -desktop).
      name: "ui-mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testIgnore: /.*\.api\.spec\.ts/,
    },
    {
      name: "ui-mobile-safari",
      use: { ...devices["iPhone 13"] },
      testIgnore: /.*\.api\.spec\.ts/,
    },
    // --- API: sin navegador, sólo los *.api.spec.ts ------------------------
    {
      name: "api",
      use: { baseURL: process.env.API_URL },
      testMatch: /.*\.api\.spec\.ts/,
    },
  ],
});
