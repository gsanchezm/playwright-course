// ============================================================
// M06 — Setup & auth: inicia sesión UNA vez, guarda el "badge"
// ============================================================
// Un SOLO test de setup. Sin warmup separado, sin modo serial,
// sin login por API, sin sembrar localStorage a mano.
// Haces lo que un usuario real hace (login por UI, igual que en
// M01) y Playwright guarda la sesión completa en un archivo.
// ============================================================

import { test as setup, expect } from "@playwright/test";

const authFile = ".auth/user.json"; // el "badge" que heredarán los tests

setup("authenticate", async ({ page }) => {
  // Render (free tier) duerme el backend tras 15 min → margen extra la 1ª vez.
  setup.setTimeout(90_000);

  // 1) Login por UI — exactamente el flujo que ya practicaste en M01.
  await page.goto("/");
  await page.getByTestId("market-MX").click();
  await page.getByTestId("username-desktop").fill(process.env.TEST_USER_USERNAME ?? "standard_user");
  await page.getByTestId("password-desktop").fill(process.env.TEST_USER_PASSWORD ?? "pizza123");
  await page.getByRole("button", { name: "Sign In" }).click();

  // 2) Señal inequívoca de sesión abierta: llegamos al catálogo.
  await expect(page).toHaveURL(/\/catalog/);

  // 3) Guardar el badge. storageState serializa cookies + localStorage;
  //    OmniPizza guarda la sesión en localStorage, así que queda
  //    capturada AUTOMÁTICAMENTE — sin escribir el token a mano.
  await page.context().storageState({ path: authFile });
});
