// playwright.config.ts — Estado en M04
// ---------------------------------------------------------------------
// M04 introduce el setup project + storageState + fixtures custom + la
// matriz multi-browser. El project `setup` corre PRIMERO (login vía UI,
// persiste .auth/user.json); los projects ui-* dependen de él y heredan
// la sesión autenticada vía storageState.
//
// (En el mono-repo del curso conviven además M01-M03 anónimos bajo un
// project `ui-anon`; este snapshot está enfocado en M04, así que solo
// incluye setup + los ui-* autenticados.)

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const STORAGE_STATE = ".auth/user.json";

export default defineConfig({
  testDir: ".",
  // Los specs del módulo + el .setup.ts viven en tests/
  testMatch: [/tests\/.*\.(spec|setup)\.ts/],

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
    // Corre primero: genera el badge (.auth/user.json).
    {
      name: "setup",
      testMatch: /tests\/setup\/.*\.setup\.ts/,
    },
    // ui-* dependen de setup y arrancan autenticados (heredan storageState).
    {
      name: "ui-chromium",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/],
    },
    {
      name: "ui-firefox",
      use: { ...devices["Desktop Firefox"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/],
    },
    {
      name: "ui-webkit",
      use: { ...devices["Desktop Safari"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/],
    },
  ],
});
