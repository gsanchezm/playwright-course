// ============================================================
// M06 — Setup & auth: el config MÍNIMO que hace falta
// ============================================================
// Solo 2 projects: `setup` corre primero y crea el badge;
// `chromium` depende de él y arranca ya autenticado.
// (Sin firefox/webkit: la matriz cross-browser vive en M08 · CI.
//  Sin testIgnore gigantes: este proyecto solo tiene SUS tests.)
// ============================================================

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

  projects: [
    // 1) Corre primero → genera .auth/user.json (el badge).
    { name: "setup", testMatch: /.*\.setup\.ts/ },

    // 2) Hereda el badge vía storageState + dependencies → arranca autenticado.
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: ".auth/user.json" },
      dependencies: ["setup"],
    },
  ],
});
