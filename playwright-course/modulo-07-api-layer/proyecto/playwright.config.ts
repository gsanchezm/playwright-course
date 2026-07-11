// playwright.config.ts — Estado en M07 (enfoque API)
// ---------------------------------------------------------------------
// M07 introduce la capa de servicios (services/) para probar la API SIN
// navegador. El project `api` no usa storageState ni setup: cada servicio
// crea su propio contexto autenticado vía AuthService. Corre contra
// API_URL (backend), no BASE_URL (frontend).
//
// (En el mono-repo del curso conviven además los projects UI de M04-M06;
// este snapshot está enfocado en la lección de API, así que solo trae
// el project `api`.)

import { defineConfig } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  testDir: ".",
  testMatch: [/tests\/.*\.spec\.ts/],

  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    trace: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  projects: [
    {
      // Sin storageState, sin dependencies: la API no pasa por la UI.
      name: "api",
      use: { baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com" },
      testMatch: [/tests\/.*\.spec\.ts/],
    },
  ],
});
