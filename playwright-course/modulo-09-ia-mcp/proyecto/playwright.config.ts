// ============================================================
// Estado en M09 — Equipo de agentes de QA
// ============================================================
// 3 projects (partimos del estado final de M07, solo con login por API):
//   · setup-api  → login por API (AuthService) + token sembrado en
//                  localStorage → .auth/user.api.json
//   · chromium   → suite normal (ejemplo + lo que generen los agentes
//                  en tests/generated/). Depende de setup-api.
//                  IGNORA tests/seeded/. `pnpm test` corre solo este
//                  project (--project=chromium), asi no corre el spec de seeded/
//   · seeded     → SOLO tests/seeded/: el spec que falla (Paso 5). Mismo storageState y dependencia.
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
    // 1) Setup: login por API, genera el badge.
    { name: "setup-api", testMatch: /auth\.api\.setup\.ts/ },

    // 2) Suite normal (sin los specs de seeded/).
    {
      name: "chromium",
      testMatch: /.*\.spec\.ts/,
      testIgnore: /seeded\//,
      use: { ...devices["Desktop Chrome"], storageState: ".auth/user.api.json" },
      dependencies: ["setup-api"],
    },

    // 3) Specs de seeded/ (se corren solo a demanda).
    {
      name: "seeded",
      testMatch: /seeded\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: ".auth/user.api.json" },
      dependencies: ["setup-api"],
    },
  ],
});
