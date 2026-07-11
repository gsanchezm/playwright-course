// playwright.config.ts — Estado en M05 (Fixtures)
// ---------------------------------------------------------------------
// M05 introduce SOLO fixtures custom (inyección de Page Objects) + data
// isolation + page.route(). NO toca projects: un único project `chromium`
// que corre los specs SIN sesión heredada (el login se hace por UI dentro
// del test).
//
// El setup project + storageState + dependencies + multi-browser NO viven
// aquí: llegan en M06 (Setup) y M08 (CI). Este config es deliberadamente
// mínimo — así el módulo se enfoca en fixtures, no en orquestación.

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  testDir: "./tests",

  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: process.env.BASE_URL ?? "https://omnipizza-frontend.onrender.com",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  // Un solo project, anónimo: los tests hacen login por UI (el badge
  // heredado con storageState nace en M06).
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
