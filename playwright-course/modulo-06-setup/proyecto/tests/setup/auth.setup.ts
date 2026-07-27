// ============================================================
// M06 — Setup & auth: inicia sesión UNA vez, guarda el "badge"
// ============================================================
// Un SOLO test de setup. Sin warmup separado, sin modo serial,
// sin login por API, sin sembrar localStorage a mano.
// Haces lo que un usuario real hace (login por UI, con el MISMO
// LoginPage + fixtures que construiste en M04/M05) y Playwright
// guarda la sesión completa en un archivo.
// ============================================================

import { test as setup, expect } from "../../fixtures/omnipizza";

const authFile = ".auth/user.json"; // el "badge" que heredarán los tests

setup("authenticate", async ({ page, loginPage, standardUser, defaultMarket }) => {
  // Render (free tier) duerme el backend tras 15 min → margen extra la 1ª vez.
  setup.setTimeout(90_000);

  // 1) Login por UI — el mismo LoginPage de M04, inyectado por el
  //    fixture de M05. El setup no reinventa el login: lo REUTILIZA.
  await loginPage.loginInMarket(standardUser, defaultMarket.code);

  // 2) Señal inequívoca de sesión abierta: llegamos al catálogo.
  await expect(page).toHaveURL(/\/catalog/);

  // 3) Guardar el badge. storageState serializa cookies + localStorage;
  //    OmniPizza guarda la sesión en localStorage, así que queda
  //    capturada AUTOMÁTICAMENTE — sin escribir el token a mano.
  await page.context().storageState({ path: authFile });
});
