// playwright.config.ts — Estado en M06 (UI por fixture + capa de API nueva)
// ---------------------------------------------------------------------
// M06 introduce la capa de servicios (services/) para probar la API SIN
// navegador. Aquí NO hay setup, NI storageState, NI `.auth/`: dos
// projects independientes, sin `dependencies`.
//   - `chromium`: UI (tests/ui/**). Cada test hace login por UI con la
//     fixture `loginPage` (mecanismo de M05). Corre contra BASE_URL.
//   - `api`: capa de servicios (tests/api/** y tests/{ejemplo,reto}.spec.ts).
//     Cada servicio crea su propio contexto autenticado vía AuthService.
//     Corre contra API_URL (backend), no BASE_URL — por eso api NO hereda
//     el `baseURL` raíz.
// El badge (storageState) llega después, en M07 (Setup).

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

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
    // --- UI (login por fixture, sin badge ni dependencies) ---
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: [/tests\/ui\/.*\.spec\.ts/],
    },

    // --- API (🆕 M06) — sin storageState, sin dependencies: la API no pasa por la UI ---
    {
      name: "api",
      use: { baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com" },
      testMatch: [/tests\/(ejemplo|reto)\.spec\.ts/, /tests\/api\/.*\.spec\.ts/],
    },
  ],
});
