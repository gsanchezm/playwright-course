// ============================================================
// 🚩 Reto M04 — Flujo E2E completo con POM
// ============================================================
// Objetivo pedagógico: sentir cuánto cambia el ESTILO de escribir
// un E2E cuando todas las pantallas tienen su Page Object.
//
// Vas a implementar: login → catálogo → addToCart → checkout →
// confirmación. Parametrizado por los 5 mercados (MX/US/CH/JP/SA).
// SIN locators inline.
//
// ⚠️ Arabia Saudita (SA) es el market nuevo y trae DOS diferencias
// reales que este reto te hace descubrir:
//   · su checkout NO tiene `zip-code`: usa el campo `district`.
//   · "Place order" abre un MODAL de confirmación (role="dialog")
//     antes de enviar; hay que confirmarlo.
//
// Regla de oro del POM:
//   "Si necesitas un locator que no existe en su Page, NO lo escribas
//    inline en el spec. Añádelo al Page como `private get`."
// ============================================================
//
// 🧰 Pre-requisitos:
//   ✔ pnpm m4 corre en verde con los 5 mercados (MX/US/CH/JP/SA).
//   ✔ Lees pages/CheckoutPage.ts y conoces sus métodos públicos.
//
// ▶ Cómo correr SOLO este reto:
//   pnpm exec playwright test tests/reto.spec.ts --headed --project=ui-anon
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

test.describe("Challenge M04 — E2E checkout with POM", () => {
  for (const market of markets) {
    test(`Challenge-${market.code} — complete checkout in ${market.country}`, async ({
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
      //   `fillWithMarket` rellena nombre, teléfono, dirección y el
      //   campo de dirección por mercado.
      //
      // Pista:
      //   await checkoutPage.fillWithMarket(market);
      //
      // ⚠️ Reto real de SA: el checkout saudí NO tiene `zip-code`,
      //   tiene `district` (testid `district`). Si `fillWithMarket`
      //   siempre rellena `zip-code`, el caso SA fallará. Extiende
      //   `CheckoutPage` para que, según `market.code`, rellene
      //   `district` (con `market.district`) en SA y `zip-code` en el
      //   resto. Ésa es la ventaja del POM: el cambio vive en UN
      //   método, no en 5 tests.
      //
      // Cómo verificar (UI mode):
      //   Los inputs del form aparecen rellenados; en SA se llena
      //   `district`, no `zip-code`.


      // ────────────────────────────────────────────────────────
      // TODO 5 — Enviar y CONFIRMAR la orden (2 pasos)
      // ────────────────────────────────────────────────────────
      // Qué hacer:
      //   "Place order" ya NO envía directo: abre un MODAL de
      //   confirmación (role="dialog", testid `confirm-order-modal`).
      //   Hay que hacer click en "Place order" y luego confirmar en
      //   el modal (`confirm-order-yes`).
      //
      // Pista (añade el método de confirmación a CheckoutPage si falta):
      //   await checkoutPage.placeOrder();     // abre el modal
      //   await checkoutPage.confirmOrder();   // confirm-order-yes


      // ────────────────────────────────────────────────────────
      // TODO 6 — Verificar la pantalla de éxito (/order-success)
      // ────────────────────────────────────────────────────────
      // Qué hacer:
      //   Tras confirmar, la app navega a /order-success (pantalla
      //   completa, no modal) con un id de orden generado.
      //
      // Pista:
      //   await checkoutPage.expectOrderSuccess();
      //
      // Criterio de éxito:
      //   El test termina en VERDE para los 5 mercados.
      //   En la terminal verás:
      //     ✓ Challenge-MX — complete checkout in Mexico
      //     ✓ Challenge-US — complete checkout in United States
      //     ✓ Challenge-CH — complete checkout in Switzerland
      //     ✓ Challenge-JP — complete checkout in Japan
      //     ✓ Challenge-SA — complete checkout in Saudi Arabia


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
//   3. Si tu colega añade un mercado nuevo a `markets.json`, ¿este
//      reto se rompe? (Esperado: casi nunca — se ejecuta una vez más
//      solo. La EXCEPCIÓN fue SA: como cambió el CAMPO de dirección
//      (`district` vs `zip-code`), tocaste UN método del POM, no 5
//      tests. Ése es el límite sano del data-driven: los DATOS
//      escalan gratis; un cambio de CONTRATO se absorbe en el POM.)
//
// 👉 En M06 vas a eliminar incluso la línea de login: un
//    `auth.setup.ts` se ejecutará UNA sola vez y todos los TCs
//    arrancarán ya autenticados.
// ============================================================
