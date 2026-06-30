// ============================================================
// 🚩 Reto M03 — Flujo E2E completo con POM
// ============================================================
// Objetivo pedagógico: sentir cuánto cambia el ESTILO de escribir
// un E2E cuando todas las pantallas tienen su Page Object.
//
// Vas a implementar: login → catálogo → addToCart → checkout →
// confirmación. Parametrizado por mercado. SIN locators inline.
//
// Regla de oro del POM:
//   "Si necesitas un locator que no existe en su Page, NO lo escribas
//    inline en el spec. Añádelo al Page como `private get`."
// ============================================================
//
// 🧰 Pre-requisitos:
//   ✔ pnpm m3 corre en verde (POM básico funciona).
//   ✔ Lees pages/CheckoutPage.ts y conoces sus métodos públicos.
//
// ▶ Cómo correr SOLO este reto:
//   pnpm exec playwright test modulo-03-pom/reto.spec.ts --headed --project=ui-anon
//
//   (o con UI mode:)
//   pnpm test:ui
// ============================================================

import { test, expect } from "@playwright/test";
import { LoginPage, CatalogPage, CheckoutPage } from "../pages";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

const markets = marketsJson as Market[];
const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test.describe("Reto M03 — E2E checkout con POM", () => {
  for (const market of markets) {
    test(`Reto-${market.code} — checkout completo en ${market.fullName}`, async ({
      page,
    }) => {
      // Instanciamos los 3 Page Objects con el mismo `page`.
      // El POM no comparte estado entre ellos — solo la pestaña.
      const loginPage = new LoginPage(page);
      const catalogPage = new CatalogPage(page);
      const checkoutPage = new CheckoutPage(page);

      // ────────────────────────────────────────────────────────
      // TODO 1 — Login con standard_user en este mercado
      // ────────────────────────────────────────────────────────
      // Qué hacer:
      //   Una sola llamada al método de alto nivel `loginInMarket`.
      //   No hagas goto/click/fill por separado: el POM ya empaqueta
      //   esos 5 pasos en uno solo.
      //
      // Pista:
      //   await loginPage.loginInMarket(standardUser, market.code);
      //
      // Cómo verificar (UI mode):
      //   El navegador termina en `/catalog`.


      // ────────────────────────────────────────────────────────
      // TODO 2 — Esperar catálogo y añadir la primera pizza
      // ────────────────────────────────────────────────────────
      // Qué hacer:
      //   1) Esperar a que el catálogo esté listo.
      //   2) Hacer click en "Add to cart" de la PRIMERA pizza.
      //   3) (Opcional) validar que el contador del carrito subió a 1.
      //
      // Pistas:
      //   await catalogPage.waitForCatalog();
      //   await catalogPage.addFirstPizza();
      //   await catalogPage.expectCartCount(1);   // opcional pero útil
      //
      // Cómo verificar (UI mode):
      //   El badge del carrito cambia a "1" tras el click.


      // ────────────────────────────────────────────────────────
      // TODO 3 — Navegar a la pantalla de checkout
      // ────────────────────────────────────────────────────────
      // Qué hacer:
      //   Click en el enlace/ícono de "checkout" en la nav. El
      //   testid suele ser `nav-checkout-desktop` (verifica en UI mode
      //   si es distinto).
      //
      // Pista:
      //   await page.getByTestId("nav-checkout-desktop").click();
      //   await checkoutPage.expectLoaded();
      //
      // 💡 Nota de POM: si terminas usando `nav-checkout-desktop`
      // en varios tests, AÑADE un método público a `LoginPage` o
      // crea un `NavBar` page. Por ahora, déjalo en el spec.


      // ────────────────────────────────────────────────────────
      // TODO 4 — Rellenar el formulario con datos del mercado
      // ────────────────────────────────────────────────────────
      // Qué hacer:
      //   `fillWithMarket` rellena nombre, teléfono, dirección y zip
      //   con datos coherentes para el `market.code`.
      //
      // Pista:
      //   await checkoutPage.fillWithMarket(market);
      //
      // Cómo verificar (UI mode):
      //   Los 4 inputs del form aparecen rellenados con strings
      //   distintos según el mercado.


      // ────────────────────────────────────────────────────────
      // TODO 5 — Confirmar la orden
      // ────────────────────────────────────────────────────────
      // Qué hacer:
      //   Click en el botón "Place order".
      //
      // Pista:
      //   await checkoutPage.placeOrder();


      // ────────────────────────────────────────────────────────
      // TODO 6 — Verificar la pantalla de confirmación
      // ────────────────────────────────────────────────────────
      // Qué hacer:
      //   Aserción de UI: el badge/texto de confirmación aparece.
      //
      // Pista:
      //   await checkoutPage.expectConfirmation();
      //
      // Criterio de éxito:
      //   El test termina en VERDE para los 4 mercados.
      //   En la terminal verás:
      //     ✓ Reto-MX — checkout completo en Mexico
      //     ✓ Reto-US — checkout completo en United States
      //     ✓ Reto-CH — checkout completo en Switzerland
      //     ✓ Reto-JP — checkout completo en Japan


      expect(market).toBeDefined(); // placeholder — quítalo cuando termines
    });
  }
});

// ============================================================
// 📝 Reflexión final — responde mentalmente:
// ============================================================
//
//   1. ¿Cuántas líneas de Playwright (page.* / locator.*) terminaste
//      escribiendo INLINE en el spec? (Esperado: ~1 — la del
//      `nav-checkout-desktop`. El resto vive en los Pages.)
//
//   2. Si OmniPizza renombra el botón "Place order" a "Confirm",
//      ¿cuántos archivos modificas? (Esperado: 1 — `CheckoutPage.ts`.)
//
//   3. Si tu colega añade un mercado nuevo a `markets.json`,
//      ¿este reto se rompe? (Esperado: NO — se ejecuta una vez más
//      sin que toques este archivo.)
//
// 👉 En M04 vas a eliminar incluso la línea de login: un
//    `auth.setup.ts` se ejecutará UNA sola vez y todos los TCs
//    arrancarán ya autenticados.
// ============================================================
