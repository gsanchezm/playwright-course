// playwright.config.ts — Estado en M07 (UI heredada + capa de API nueva)
// ---------------------------------------------------------------------
// M07 introduce la capa de servicios (services/) para probar la API SIN
// navegador — pero NO reemplaza la capa de UI que traes de M04-M06:
// `setup` + `chromium` (storageState + dependencies) siguen aquí, sin
// cambios, corriendo `tests/ui/*.spec.ts`. El project `api` no usa
// storageState ni setup: cada servicio crea su propio contexto
// autenticado vía AuthService. Corre contra API_URL (backend), no
// BASE_URL (frontend) — por eso api NO hereda el `baseURL` raíz.

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const STORAGE_STATE = ".auth/user.json";

export default defineConfig({
  testDir: ".",

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

  projects: [
    // --- UI (heredada de M04-M06, sin cambios) ---
    { name: "setup", testMatch: /tests\/setup\/.*\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testMatch: [/tests\/ui\/.*\.spec\.ts/],
    },

    // --- API (🆕 M07) — sin storageState, sin dependencies: la API no pasa por la UI ---
    {
      name: "api",
      use: { baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com" },
      testMatch: [/tests\/(ejemplo|reto)\.spec\.ts/, /tests\/api\/.*\.spec\.ts/],
    },
  ],
});
