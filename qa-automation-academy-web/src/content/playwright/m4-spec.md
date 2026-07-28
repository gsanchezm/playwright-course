# El spec paso a paso

Esta página cubre la parte de **ejecución y lectura del ejemplo** de M04: correr los specs limpios que ya usan los Page Objects y comparar el antes/después contra M03. Al final tienes el código completo de `ejemplo.spec.ts`.

---

## Paso 7 — Ejecutar el ejemplo

```bash
# Headless
pnpm m4

# UI mode (recomendado para ver el flujo limpio)
pnpm test:ui
```

**Qué esperar:**

- Los **mismos 5 tests** que en M03 (uno por mercado) corren en verde.
- En el spec verás `loginPage.loginInMarket(user, 'MX')` en lugar del bloque de 5 líneas.
- Hay un segundo `describe` ("using granular actions") que muestra que el POM **no obliga** a usar siempre el método de alto nivel — puedes encadenar `goto / selectMarket / loginAs` cuando un TC necesite control fino.
- Cuatro `describe` más cierran el archivo y tocan el resto del roster de Pages del módulo: navegación con `MenuPage`, un checkout de un solo mercado con `CheckoutPage`, el modal `PizzaCustomizerModal` (confirmar y cancelar) y `ProfilePage` (el date picker nativo y guardar cambios). En total corren **12 tests** — todo el roster de `pages/` vive en este único archivo.

---

## Paso 8 — Comparativa antes/después (5 min)

Abre M03 y M04 simultáneamente y responde:

1. ¿Qué pasa si el campo `username-desktop` cambia de testid?
   - En M03: **modificas 5 tests**.
   - En M04: **modificas 1 línea** en `LoginPage.ts`.
2. Si añadieras un nuevo flujo "logout" desde el catálogo, ¿dónde viviría?
   - Respuesta: como método público en `CatalogPage` (o un nuevo `LogoutPage` si fuera más grande).
3. ¿Por qué los locators son `private`?
   - Para que el test **no sepa** cómo está el DOM por dentro. Eso es encapsulación.

---

## Código completo — `ejemplo.spec.ts`

```ts
// @file modulo-04-pom/ejemplo.spec.ts
// ============================================================
// M04 — Refactor a POM: el spec de M03 vuelto limpio
// ============================================================
// Compara este archivo con modulo-03-data-driven/ejemplo.spec.ts
// y cuenta las líneas eliminadas. Eso es lo que ganamos al tener
// un mapa reutilizable por pantalla.
//
// NOTA: `BasePage` aquí es clase normal (no abstracta). La
// palabra `abstract` llega en M07.
// ============================================================

import { test, expect } from "@playwright/test";
import {
  LoginPage,
  CatalogPage,
  MenuPage,
  CheckoutPage,
  ProfilePage,
  PizzaCustomizerModal,
} from "../pages";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

const markets = marketsJson as Market[];
const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;
const marketMX = markets.find((m) => m.code === "MX")!;

test.describe("POM — login + catalog per market (M04)", () => {
  for (const market of markets) {
    test(`TC-${market.code} — clean flow in ${market.country} @smoke`, async ({ page }) => {
      // El spec ahora se lee como user story, no como instrucción técnica.
      const loginPage = new LoginPage(page);
      const catalogPage = new CatalogPage(page);

      await loginPage.loginInMarket(standardUser, market.code);
      await catalogPage.expectLoaded();
      await catalogPage.expectHasPizzas();
    });
  }
});

test.describe("POM — using granular actions", () => {
  test("POM API demonstration @smoke", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);

    await loginPage.goto();
    await loginPage.selectMarket("MX");
    await loginPage.loginAs(standardUser);

    await catalogPage.waitForCatalog();
    const names = await catalogPage.getPizzaNames();
    console.log(`Pizzas in MX: ${names.length}`);
  });
});

// ============================================================
// Comparativa para el alumno:
//   - M03: ~18 líneas por test × 4 mercados = ~72 líneas
//   - M04: ~3 líneas por test × 4 mercados = ~12 líneas
//   - Reducción: ~83%
// ============================================================

// ============================================================
// 📚 Cobertura completa del roster de Pages (M04)
// ============================================================
// Los 4 bloques de abajo tocan lo que la comparativa de arriba no
// cubre: MenuPage, CheckoutPage, PizzaCustomizerModal y ProfilePage.
// Con esto, ejemplo.spec.ts ejercita al menos una vez cada clase que
// exporta pages/index.ts (BasePage se hereda, nunca se instancia
// directo — ver su comentario en pages/BasePage.ts).
//
// CheckoutPage aquí es una demo de UN mercado (MX) para mostrar su
// API. La versión parametrizada de los 5 mercados —con el caso
// especial de SA (`district` en vez de `zip-code`)— es el Reto de
// este módulo (tests/reto.spec.ts): no la adelantamos aquí para no
// arruinar el descubrimiento.
//
// PizzaCustomizerModal y ProfilePage traen DOS escenarios cada uno: el
// camino "feliz" (confirmar el modal / guardar el perfil) y el
// complementario (cancelar sin confirmar / llenar la fecha sin
// guardar) — antes vivían separados en tests/interacciones-nuevas.spec.ts,
// ahora están aquí para tener TODO el roster en un solo archivo.
//
// M05 suma 8 escenarios más de interacción para estos mismos widgets
// (dropdowns de tarjeta, método de pago, tooltips, mercado SA/RTL,
// confirmación en dos pasos): dependen de la versión "enriquecida" de
// CheckoutPage/CatalogPage que M05 construye — ese salto de riqueza es
// precisamente lo que M05 enseña, y los verás completos ahí.
// ============================================================

test.describe("POM — MenuPage: navigating between authenticated screens", () => {
  test("nav links move across profile, checkout and catalog @regression", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);
    const menuPage = new MenuPage(page);
    const profilePage = new ProfilePage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.loginInMarket(standardUser, "MX");
    await catalogPage.expectLoaded();

    // MenuPage vive en el header de toda pantalla autenticada: un solo
    // Page Object navega entre catálogo, perfil y checkout.
    await menuPage.goToProfile();
    await profilePage.expectLoaded();

    await menuPage.goToCatalog();
    await catalogPage.expectLoaded();

    // El checkout requiere al menos una pizza en el carrito: con el
    // carrito vacío, OmniPizza muestra el estado "Tu carrito está
    // vacío" en vez del formulario (sin `place-order-btn`).
    await catalogPage.addFirstPizza();

    await menuPage.goToCheckout();
    await checkoutPage.expectLoaded();

    await menuPage.logout();
    await loginPage.expectLoaded();
  });
});

test.describe("POM — CheckoutPage: filling and confirming an order", () => {
  test("checkoutWith(market) fills the form and opens the confirmation modal @regression", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);
    const menuPage = new MenuPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.loginInMarket(standardUser, "MX");
    await catalogPage.waitForCatalog();
    await catalogPage.addFirstPizza();
    await catalogPage.expectCartCount(1);

    await menuPage.goToCheckout();
    await checkoutPage.expectLoaded();

    await checkoutPage.checkoutWith(marketMX);
    await checkoutPage.expectConfirmation();
  });
});

test.describe("POM — PizzaCustomizerModal: choosing options, confirming and cancelling", () => {
  test("confirm() selects size + topping and adds the pizza to the cart @regression", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);
    const pizzaCustomizer = new PizzaCustomizerModal(page);
    const menuPage = new MenuPage(page);

    await loginPage.loginInMarket(standardUser, "MX");
    await catalogPage.expectLoaded();

    // Abrir el modal (sin confirmar). NO expone role="dialog" — nos
    // anclamos por testids propios del modal.
    await catalogPage.openCustomizerForFirst();
    await pizzaCustomizer.expectOpen();

    // "Choose Size" se marca REQUIRED en la UI, pero el botón confirmar
    // NO nace deshabilitado — un "requerido" visual no siempre bloquea
    // el submit; verifícalo, no lo asumas.
    await pizzaCustomizer.selectSize("large");
    await pizzaCustomizer.toggleTopping("mushrooms");

    // Confirmar cierra el modal y suma la pizza al carrito.
    await pizzaCustomizer.confirm();
    await pizzaCustomizer.expectClosed();
    await menuPage.expectCartCount(1);
  });

  test("close() dismisses the modal and leaves the cart untouched @regression", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);
    const pizzaCustomizer = new PizzaCustomizerModal(page);
    const menuPage = new MenuPage(page);

    await loginPage.loginInMarket(standardUser, "MX");
    await catalogPage.expectLoaded();

    await catalogPage.openCustomizerForFirst();
    await pizzaCustomizer.expectOpen();
    await pizzaCustomizer.selectSize("medium");

    // Camino complementario al de arriba: aquí cancelamos en vez de
    // confirmar. El carrito debe seguir vacío.
    await pizzaCustomizer.close();
    await pizzaCustomizer.expectClosed();
    expect(await menuPage.getCartCount()).toBe("0");
  });
});

test.describe("POM — ProfilePage: the native date picker and saving changes", () => {
  test("fill('YYYY-MM-DD') fija el cumpleaños sin tocar el calendario @regression", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);
    const profilePage = new ProfilePage(page);

    await loginPage.loginInMarket(standardUser, "MX");
    await catalogPage.expectLoaded();

    await profilePage.goto();
    await profilePage.expectLoaded();

    // Regla de oro: NO se clickea el calendario emergente (es UI del
    // navegador, fuera del DOM). Un input date se llena con .fill() en
    // formato ISO "YYYY-MM-DD" y su value SIEMPRE se lee en ISO.
    await profilePage.setBirthday("1990-05-15");
    await profilePage.expectBirthday("1990-05-15");
    // Sin .save(): el demo es de la INTERACCIÓN con el control, cero
    // efecto colateral sobre el estado del perfil.
  });

  test("save() submits the profile form @regression", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);
    const profilePage = new ProfilePage(page);

    await loginPage.loginInMarket(standardUser, "MX");
    await catalogPage.expectLoaded();

    await profilePage.goto();
    await profilePage.expectLoaded();

    // Camino complementario al de arriba: aquí sí completamos el
    // flujo con save().
    //
    // NOTA (verificado en vivo): save() SÍ persiste server-side — dispara
    // un PATCH a /api/users/me/profile y el valor sobrevive un reload
    // SIEMPRE que se espere esa respuesta antes de navegar (si navegas
    // de inmediato, cancelas el PATCH en vuelo). No probamos eso aquí con
    // un reload porque obligaría al spec a esperar la red directamente —
    // awareness de HTTP es contenido de M07 (API Layer). Este test se
    // queda en el contrato de M04: verificar por UI que el form guarda
    // el estado que se le pidió.
    await profilePage.setBirthday("1985-03-20");
    await profilePage.fillNotes("Sin cebolla, por favor");
    await profilePage.save();

    await profilePage.expectBirthday("1985-03-20");
  });
});
```
