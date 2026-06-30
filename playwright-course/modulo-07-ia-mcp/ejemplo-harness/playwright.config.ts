// ============================================================
// playwright.config.ts — configuración del harness OmniPizza
// ============================================================
// Analogía QA: el "master test plan" del harness. Define dónde
// viven los tests, los ambientes (projects UI vs API), timeouts
// generosos para el cold start de Render y el reporteo —
// incluyendo nuestro reporter Observer (./src/core/reporter.ts).
// ============================================================

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  // Los specs viven junto a cada slice vertical en src/features/<feature>/.
  testDir: "./src/features",

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
    {
      // Slices de UI sobre Chromium de escritorio.
      name: "ui-chromium",
      use: { ...devices["Desktop Chrome"] },
      // Los *.api.spec.ts corren SÓLO en el project "api" (no se duplican aquí).
      testIgnore: /.*\.api\.spec\.ts/,
    },
    {
      // Slices de API: apuntan al backend y sólo corren los *.api.spec.ts.
      name: "api",
      use: { baseURL: process.env.API_URL },
      testMatch: /.*\.api\.spec\.ts/,
    },
  ],
});
