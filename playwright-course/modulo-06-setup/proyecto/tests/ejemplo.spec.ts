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

test.describe("Setup & auth — inherited session (M06)", () => {
  test("lands on /catalog without logging in @smoke", async ({ page, catalogPage }) => {
    // ⚠️ No hay paso de login. El storageState ya trajo la sesión.
    await page.goto("/catalog");

    // Señal de sesión abierta: seguimos en /catalog (no nos rebotó a "/")
    // y el catálogo muestra al menos una pizza — las mismas assertions
    // de CatalogPage que usaste en M04, no locators nuevos.
    await catalogPage.expectLoaded();
    await catalogPage.expectHasPizzas();
  });

  test("the badge persists across pages without re-login @smoke", async ({
    page,
    catalogPage,
    profilePage,
    checkoutPage,
  }) => {
    // Prueba más fuerte que el test de arriba: no solo aterrizas
    // autenticado en /catalog — la MISMA sesión te sigue a /profile y
    // a /checkout sin volver a pasar por login en ningún punto.
    await page.goto("/catalog");
    await catalogPage.expectLoaded();
    await catalogPage.addFirstPizza();

    await profilePage.goto();
    await profilePage.expectLoaded();

    await page.goto("/checkout");
    await checkoutPage.expectLoaded();
  });
});

// ============================================================
// 👉 Recordatorio (M04→M05→M06): el POM no cambió, los fixtures no
//    cambiaron — lo único nuevo es que el `page` YA llega autenticado.
// ============================================================

// ============================================================
// 🧩 Un widget de muestra bajo sesión heredada (heredado de M05)
// ============================================================
// M05 ya enseñó los 8 escenarios de widgets (date picker, dropdowns,
// método de pago, 2 tooltips, modal, mercado SA/RTL, confirmación de
// orden) haciendo login por UI en cada test. Repetirlos aquí completos
// no enseñaría nada nuevo — la técnica de cada widget no cambia según
// cómo llegaste autenticado.
//
// Este módulo se queda con UNO solo, a modo de muestra, para probar
// que el patrón sigue funcionando bajo `storageState`: el modal
// "Customize Pizza". Se eligió este y no otro porque SÍ hereda la
// sesión (a diferencia de SA/RTL y confirmación de orden, que dependen
// del mercado elegido AL LOGIN y por eso renuncian al badge) y porque
// el contraste es el más visible: en M05 hacía falta login + catálogo
// completo antes de abrir el modal; aquí es solo `page.goto('/catalog')`.
//
// Los otros 7 no se repiten — siguen siendo los mismos de M05, sin
// cambios. Repásalos en `modulo-05-fixtures/proyecto/tests/widgets/`.
// ============================================================
test.describe("Modal 'Customize Pizza' (M06)", () => {
  test("open → pick size + topping → confirm adds to cart @regression", async ({
    page,
    catalogPage,
    pizzaCustomizer,
    menuPage,
  }) => {
    await page.goto("/catalog");
    await catalogPage.expectLoaded();

    // Abrir el modal (sin confirmar).
    await catalogPage.openCustomizerForFirst();
    await pizzaCustomizer.expectOpen();

    // Interacción típica de modal: elegir tamaño + un topping.
    await pizzaCustomizer.selectSize("large");
    await pizzaCustomizer.toggleTopping("mushrooms");

    // Confirmar cierra el modal y suma la pizza al carrito.
    await pizzaCustomizer.confirm();
    await pizzaCustomizer.expectClosed();
    await menuPage.expectCartCount(1);
  });
});
