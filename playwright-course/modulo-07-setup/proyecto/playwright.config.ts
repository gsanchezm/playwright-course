// ============================================================
// Estado en M07 — Setup & auth con DOS setups separados
// ============================================================
// 4 projects, dos caminos de login que NO se mezclan:
//   · setup-api  → login por API (AuthService) + token sembrado en
//                  localStorage → .auth/user.api.json
//   · setup-ui   → login por la UI (LoginPage) → .auth/user.ui.json
//   · chromium           → depende de setup-api: el badge de los tests
//                          del día a día (ejemplo/reto)
//   · chromium-ui-badge  → depende de setup-ui: solo prueba que el
//                          badge hecho por UI también deja sesión activa
// (Sin firefox/webkit: la matriz cross-browser vive en M08 · CI.)
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
    // 1) Setups: cada uno genera SU badge, en su propio archivo.
    { name: "setup-ui", testMatch: /auth\.ui\.setup\.ts/ },
    { name: "setup-api", testMatch: /auth\.api\.setup\.ts/ },

    // 2) Tests autenticados con el badge de la API (el camino rápido).
    {
      name: "chromium",
      testMatch: [/ejemplo\.spec\.ts/, /reto\.spec\.ts/, /badge-api\.spec\.ts/],
      use: { ...devices["Desktop Chrome"], storageState: ".auth/user.api.json" },
      dependencies: ["setup-api"],
    },

    // 3) Mismo navegador, pero con el badge hecho por la UI.
    {
      name: "chromium-ui-badge",
      testMatch: /badge-ui\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: ".auth/user.ui.json" },
      dependencies: ["setup-ui"],
    },
  ],
});
