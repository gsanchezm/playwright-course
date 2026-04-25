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
  // 2. Los `ui-*` dependen de `setup` y heredan el storageState.
  // 3. `api` y `anonymous` NO heredan storageState (cookies de UI
  //    no deben contaminar tests de API ni flujos negativos).
  projects: [
    {
      name: "setup",
      testMatch: /tests\/setup\/.*\.setup\.ts/,
    },
    {
      name: "ui-chromium",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/],
    },
    {
      name: "ui-firefox",
      use: { ...devices["Desktop Firefox"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/],
    },
    {
      name: "ui-webkit",
      use: { ...devices["Desktop Safari"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/],
    },
    {
      name: "api",
      use: { baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com" },
      testMatch: [/tests\/api\/.*\.spec\.ts/, /modulo-05-api-layer\/.*\.spec\.ts/],
    },
    {
      // Para tests de login negativo u otros flujos anónimos
      name: "anonymous",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /tests\/.*\.anon\.spec\.ts/,
    },
  ],
});
