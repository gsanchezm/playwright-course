// playwright.config.ts — Estado en M01 (reconciliado desde el scaffold)
// ---------------------------------------------------------------------
// "master test plan" del framework. Partimos del config que genera
// `pnpm create playwright` y lo recortamos a lo mínimo de M01. En
// módulos siguientes vamos a agregar de nuevo: projects multi-browser
// (M08), setup project con dependencies (M06), project api (M07),
// retries+workers+CI flags reales (M08).

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config"; // ← descomentado: carga .env en process.env

export default defineConfig({
  // --- Dónde buscar los tests (el installer ponía "./tests") ---
  testDir: ".",
  testMatch: [/tests\/.*\.spec\.ts/],

  // --- Timeouts (generosos por el cold start de Render free tier) ---
  timeout: 60_000,
  expect: { timeout: 10_000 },

  // --- Reporteo (html del installer + list para feedback en terminal) ---
  reporter: [["html", { open: "never" }], ["list"]],

  // --- Defaults para todos los projects ---
  use: {
    baseURL: process.env.BASE_URL ?? "https://omnipizza-frontend.onrender.com",
    trace: "retain-on-failure", // el installer ponía "on-first-retry"
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  // --- Projects (en M01 solo uno y ANÓNIMO; el installer traía chromium+firefox+webkit) ---
  projects: [
    {
      // Anónimo a propósito: M01-M05 son ejercicios de login por UI, sin
      // sesión heredada. El project autenticado (ui-chromium + storageState
      // + setup) nace en M06, no antes.
      name: "ui-anon",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
