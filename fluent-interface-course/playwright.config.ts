// ============================================================
// playwright.config.ts — Configuración del curso Fluent Interface
// ============================================================
// Versión SIMPLIFICADA y self-contained: un solo project de UI sobre
// Chromium, sin setup project ni storageState. El login se hace por UI
// dentro de la cadena fluida (loginInMarket), así que cada test arranca
// anónimo contra la app OmniPizza desplegada.
//
// Timeouts generosos: la app vive en Render (free tier) y puede tardar
// en despertar tras un "cold start".
// ============================================================

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  // --- Dónde buscar los tests ---
  testDir: "tests",

  // --- Paralelismo y reintentos ---
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  // Timeouts generosos para el cold start de Render.
  timeout: 90_000,
  expect: { timeout: 15_000 },

  // --- Reporteo ---
  reporter: [["html", { open: "never" }], ["list"]],

  // --- Defaults para el project ---
  use: {
    baseURL: process.env.BASE_URL ?? "https://omnipizza-frontend.onrender.com",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
  },

  // --- Un solo project: UI sobre Chromium ---
  projects: [
    {
      name: "ui-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
