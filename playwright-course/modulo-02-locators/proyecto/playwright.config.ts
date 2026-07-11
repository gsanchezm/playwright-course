// playwright.config.ts — Estado en M02 (igual que M01)
// ---------------------------------------------------------------------
// M02 practica la JERARQUÍA de locators (getByRole / getByTestId / CSS),
// no configuración del runner. El config es idéntico al de M01: un solo
// project ANÓNIMO `ui-anon` (M01-M03 son ejercicios de login por UI, sin
// sesión heredada; el project autenticado nace con el setup de M06).

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  testDir: ".",
  testMatch: [/tests\/.*\.spec\.ts/],

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
    { name: "ui-anon", use: { ...devices["Desktop Chrome"] } },
  ],
});
