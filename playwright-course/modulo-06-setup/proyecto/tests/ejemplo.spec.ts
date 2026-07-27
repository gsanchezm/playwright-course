// ============================================================
// M06 — Arranca YA autenticado gracias al setup project
// ============================================================
// Este spec corre en el project `chromium`, que declara
// `dependencies: ['setup']` + `storageState: '.auth/user.json'`.
// Antes de ejecutarlo, Playwright corre `tests/setup/auth.setup.ts`
// (login por UI → guarda el badge) y este test HEREDA la sesión.
//
// Fíjate en lo que NO hay: ni goto('/'), ni selección de mercado,
// ni fill de credenciales, ni click en "Sign In". El badge ya trajo
// todo eso. Vamos DIRECTO al catálogo — con el MISMO CatalogPage
// que ya construiste en M04, inyectado por el fixture de M05.
// ============================================================

import { test, expect } from "../fixtures/omnipizza";

test.describe("Setup & auth — sesión heredada (M06)", () => {
  test("aterriza en /catalog sin hacer login @smoke", async ({ page, catalogPage }) => {
    // ⚠️ No hay paso de login. El storageState ya trajo la sesión.
    await page.goto("/catalog");

    // Señal de sesión abierta: seguimos en /catalog (no nos rebotó a "/")
    // y el catálogo muestra al menos una pizza — las mismas assertions
    // de CatalogPage que usaste en M04, no locators nuevos.
    await catalogPage.expectLoaded();
    await catalogPage.expectHasPizzas();
  });
});

// ============================================================
// 👉 Recordatorio (M04→M05→M06): el POM no cambió, los fixtures no
//    cambiaron — lo único nuevo es que el `page` YA llega autenticado.
// ============================================================
