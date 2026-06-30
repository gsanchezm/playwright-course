// ============================================================
// playwright.config.ts — Configuración maestra del framework
// ============================================================
// Analogía QA: este archivo es el "master test plan" — define
// ambientes (projects), precondiciones (setup dependency),
// timeouts, reintentos, reporteo y artefactos para TODA la suite.
// ============================================================

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const STORAGE_STATE = ".auth/user.json";

export default defineConfig({
  // --- Dónde buscar los tests ---
  testDir: ".",
  testMatch: [/tests\/.*\.(spec|setup)\.ts/, /modulo-.*\/.*\.spec\.ts/],

  // --- Paralelismo y reintentos ---
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  // Timeout generoso para cold start de Render
  timeout: 60_000,
  expect: { timeout: 10_000 },

  // --- Reporteo ---
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }], ["junit", { outputFile: "results.xml" }]]
    : [["html", { open: "never" }], ["list"]],

  // --- Defaults para todos los projects ---
  use: {
    baseURL: process.env.BASE_URL ?? "https://omnipizza-frontend.onrender.com",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  // --- Projects ---
  // 1. `setup` corre primero (login vía API, persiste storageState).
  // 2. `ui-chromium/firefox/webkit` dependen de `setup` y heredan el
  //    storageState autenticado → para M04+ (cuando el curso ya enseña
  //    setup project + sesión persistida).
  // 3. `ui-anon` corre M01-M03 (los módulos de login por UI) ANÓNIMOS:
  //    sin `setup`, sin `storageState`. El concepto de sesión heredada
  //    entra hasta M04, no antes. `api` tampoco hereda storageState.
  projects: [
    {
      name: "setup",
      testMatch: /tests\/setup\/.*\.setup\.ts/,
    },
    {
      name: "ui-chromium",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/, /modulo-0[123]-.*/],
    },
    {
      name: "ui-firefox",
      use: { ...devices["Desktop Firefox"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/, /modulo-0[123]-.*/],
    },
    {
      name: "ui-webkit",
      use: { ...devices["Desktop Safari"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/, /modulo-0[123]-.*/],
    },
    {
      name: "api",
      use: { baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com" },
      testMatch: [/tests\/api\/.*\.spec\.ts/, /modulo-05-api-layer\/.*\.spec\.ts/],
    },
    {
      // M01-M03: módulos de login por UI. Corren ANÓNIMOS (sin setup,
      // sin storageState) porque su lección ES el login — no tendría
      // sentido arrastrar una sesión de API. También cubre flujos
      // negativos `*.anon.spec.ts`.
      name: "ui-anon",
      use: { ...devices["Desktop Chrome"] },
      testMatch: [/modulo-0[123]-.*\/.*\.spec\.ts/, /tests\/.*\.anon\.spec\.ts/],
    },
  ],
});
