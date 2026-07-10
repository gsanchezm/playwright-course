// playwright.config.ts — Estado en M03 (igual que M01/M02)
// ---------------------------------------------------------------------
// M03 refactoriza los tests a Page Object Model (clases en pages/). Es
// PURO código: el runner corre igual que M01/M02. Un solo project
// ANÓNIMO `ui-anon` (M01-M03 son login por UI, sin sesión heredada; el
// project autenticado ui-chromium + setup nace en M04).

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
