# 🚩 Reto — Módulo 4: "Un E2E que se lee como user story"

> **Módulo 4 · Proyecto E2E y criterio**

> **Analogía QA:** este es el examen final de un tester E2E. No vas a verificar una pantalla suelta: vas a recorrer el flujo de compra completo —entrar, elegir pizza, pagar, confirmar— como lo haría un cliente real. La diferencia es que esta vez el guion del test se lee casi como el caso de prueba manual que escribirías en tu gestor de tests: *login → catálogo → carrito → checkout → confirmación*. Cada paso es una frase, no una instrucción técnica.

---

## Instrucciones

Vas a completar un spec parametrizado por mercado que recorre el flujo completo de OmniPizza, **todo fluido**, orquestando tres Page Objects (`LoginPage`, `CatalogPage`, `CheckoutPage`):

1. **Login** con `standard_user` en el mercado de turno.
2. **Catálogo**: esperar a que cargue y añadir la primera pizza al carrito.
3. **Checkout**: navegar al checkout, rellenar el formulario con los datos del mercado.
4. **Confirmar** la orden y verificar la pantalla de confirmación.

La plantilla vive en `fluent-interface-course/tests/fluent-reto.spec.ts` y trae varios `// TODO`. Tu trabajo es reemplazarlos por **cadenas fluidas** (acciones que devuelven `this`, cerradas con **un único `await`** que drena la cola), no por una pila de `await` sueltos.

En el camino vas a tocar las tres ideas finas del curso: la **trampa de `loginInMarket`** (cruza de pantalla y devuelve el Page destino — **NO lo `await`es**), la **costura cruda** entre catálogo y checkout (un punto donde el patrón fluido no llega y haces una acción inline), y la **regla de oro** (si olvidas el `await`, la cola nunca se drena).

> Es **esperado** que la plantilla sin resolver termine en ❌: al final del test hay una assertion fija (`expectConfirmation`) que solo pasa si tu flujo navegó de verdad hasta la confirmación. Mientras los `// TODO` sigan vacíos, el flujo no avanza y el test falla en rojo. Cuando completes las cadenas, los 4 mercados quedan en ✅.

> 🔷 **Recordatorio del estilo — esto NO es un await por acción**
> El reflejo de Playwright es `await pageObject.accion()` una y otra vez. En este curso el POM es **encadenable**: cada acción devuelve `this` y **encola** su trabajo en la cola interna (`chain`). El `await` final es el que **drena** la cola en orden. Por eso el reto se escribe como **frases encadenadas**, no como una lista de líneas `await`. Tu modelo de estilo es el `fluent-ejemplo.spec.ts` **resuelto de este curso**, no un POM `await`-por-acción.

---

## Plantilla

```ts
// @file fluent-interface-course/tests/fluent-reto.spec.ts
import { test } from "@playwright/test";
import { LoginPage, CatalogPage, CheckoutPage } from "../pages";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

// Este reto ARRANCA con login por UI (loginInMarket hace goto("/") +
// selectMarket + loginAs). El proyecto corre ANÓNIMO por defecto
// (sin storageState ni setup), así que no hay que resetear nada.

const markets = marketsJson as Market[];
const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test.describe("Reto M4 — E2E fluido: login → catálogo → checkout", () => {
  for (const market of markets) {
    test(`Reto-${market.code} — checkout completo en ${market.fullName}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const checkoutPage = new CheckoutPage(page);

      // ──────────────────────────────────────────────────────────
      // TODO 1 — Login fluido que CRUZA al catálogo
      // ──────────────────────────────────────────────────────────
      // `loginInMarket` encola el login y devuelve el CatalogPage destino
      // heredando la cola. OJO: NO lo await-es — devuelve un Page (thenable),
      // no una promesa de datos. Guarda el handle.
      //
      //   const catalogPage = loginPage.loginInMarket(standardUser, market.code);
      const catalogPage: CatalogPage = /* TODO */ new CatalogPage(page);

      // ──────────────────────────────────────────────────────────
      // TODO 2 — Cadena del catálogo (un solo await drena login + catálogo)
      // ──────────────────────────────────────────────────────────
      // Encadena sobre catalogPage: espera el catálogo, añade la primera
      // pizza y valida que el carrito subió a 1. Cierra con UN await.
      //
      //   await catalogPage.waitForCatalog().addFirstPizza().expectCartCount(1);
      // TODO

      // ──────────────────────────────────────────────────────────
      // TODO 3 — La costura cruda: navegar al checkout (acción INLINE)
      // ──────────────────────────────────────────────────────────
      // No existe un método fluido catálogo→checkout (ningún Page devuelve
      // un CheckoutPage). Aquí el patrón fluido NO llega: haces la nav
      // inline y luego retomas la cadena en el CheckoutPage.
      //
      //   await page.getByTestId("nav-checkout-desktop").click();
      //   await checkoutPage.expectLoaded();
      // TODO

      // ──────────────────────────────────────────────────────────
      // TODO 4 — Cadena del checkout: rellenar → confirmar → verificar
      // ──────────────────────────────────────────────────────────
      // Encadena sobre checkoutPage: rellena el form con los datos del
      // mercado, haz click en "Place order" y verifica la confirmación.
      // Todo en UNA cadena cerrada con UN await.
      //
      //   await checkoutPage.fillWithMarket(market).placeOrder().expectConfirmation();
      // TODO

      // ──────────────────────────────────────────────────────────
      // Validación fija (NO la toques) — falla en ROJO hasta que tu flujo
      // navegue de verdad hasta la confirmación. Con los TODO vacíos, esto
      // nunca aparece y el test queda en rojo (como debe ser hasta resolver).
      // ──────────────────────────────────────────────────────────
      await checkoutPage.expectConfirmation();
    });
  }
});
```

> 🔷 **El bug más caro del patrón — `loginInMarket` no se `await`**
> Mira la firma real: `loginInMarket(user, code): CatalogPage`. Devuelve el Page **de forma síncrona** (`return new CatalogPage(this.page, this.chain)`), pasándole la cola pendiente. Como el Page es *thenable*, si escribes `const cp = await loginPage.loginInMarket(...)`, el `await` **drena la cola y resuelve a `undefined`** — pierdes el handle y la siguiente línea revienta con un `Cannot read properties of undefined`. La forma correcta es **sin `await`**: guardas el `CatalogPage` y el `await` que drena llega después, sobre la cadena del catálogo.

---

## Cómo correrlo

```bash
$ npx playwright test tests/fluent-reto.spec.ts
```

```bash
# UI mode (recomendado la 1ª vez, para ver el flujo paso a paso):
$ npx playwright test tests/fluent-reto.spec.ts --ui
```

Con los `// TODO` sin resolver, los 4 tests **fallan en rojo**: la validación fija del final (`expectConfirmation`) hace timeout porque tu flujo nunca navegó hasta la confirmación. Eso es lo **esperado** de arranque.

**Objetivo:** cuando completes las cadenas, los 4 mercados terminan en verde. En la lista verás:

```
✓ Reto-MX — checkout completo en Mexico
✓ Reto-US — checkout completo en United States
✓ Reto-CH — checkout completo en Switzerland
✓ Reto-JP — checkout completo en Japan
```

---

## Checklist de auto-corrección

- [ ] **TODO 1:** `loginInMarket` se llama **sin `await`** y su resultado se guarda en `catalogPage`.
- [ ] **TODO 2:** las acciones del catálogo están **encadenadas** (`.waitForCatalog().addFirstPizza()...`), no en líneas `await` sueltas.
- [ ] El **primer `await` real** del flujo aparece al cerrar la cadena del catálogo — y drena también el login encolado.
- [ ] **TODO 3:** reconoces que la nav al checkout es **inline** (no hay método fluido para esa transición) y la dejas como `await page.getByTestId(...).click()`.
- [ ] **TODO 4:** rellenar, confirmar y verificar van en **una sola cadena** cerrada con un `await`.
- [ ] **Cada cadena** que escribiste termina en `await`. Ninguna acción fluida queda sin drenar.
- [ ] Los 4 mercados pasan en verde (4 tests, uno por mercado del `markets.json`).
- [ ] No escribiste locators inline salvo la **única** línea esperada: el `nav-checkout-desktop` de la costura.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- **TODO 1 — la trampa del `await`.** `loginInMarket` NO devuelve datos: devuelve el `CatalogPage`. Escríbelo `const catalogPage = loginPage.loginInMarket(standardUser, market.code);` — sin `await`. Si lo `await`as, `catalogPage` queda `undefined` y el TODO 2 truena.

- **TODO 2 — un solo `await` drena dos pantallas.** El login se encoló en TODO 1 y viajó dentro de la cola del `CatalogPage` (herencia de cola). Cuando hagas `await catalogPage.waitForCatalog().addFirstPizza().expectCartCount(1);`, ese único `await` ejecuta **primero** el login pendiente y **luego** las acciones del catálogo, en orden. No necesitas un `await` para el login y otro para el catálogo: la cola los encadena.

- **TODO 3 — por qué esto SÍ es inline.** Revisa `CatalogPage`: tiene `waitForCatalog`, `addFirstPizza`, `expectCartCount`... pero **ninguna** acción que devuelva un `CheckoutPage`. El patrón fluido cubre las acciones *dentro* de una pantalla y la transición login→catálogo, pero esta transición concreta no está modelada. Lo honesto es navegar inline: `await page.getByTestId("nav-checkout-desktop").click();` y luego `await checkoutPage.expectLoaded();`. (Si esto te molesta, buena señal: es justo el tema de la siguiente lección.)

- **TODO 4 — la cadena del checkout.** `fillWithMarket(market)` rellena los 4 inputs vía el helper DRY `typeInput` y devuelve `this`; `placeOrder()` hace submit y devuelve `this`; `expectConfirmation()` asevera y devuelve `this`. Encadénalos: `await checkoutPage.fillWithMarket(market).placeOrder().expectConfirmation();`. (Atajo opcional: `checkoutWith(market)` ya hace fill + placeOrder.)

- **Síntoma de "olvidé el `await`".** Si tu test pasa en verde **sospechosamente rápido** y el navegador ni se movió, probablemente escribiste la cadena pero olvidaste el `await` que la drena. Sin `await`, la cola **nunca se ejecuta** y las assertions encoladas **nunca corren** — el test pasa por no haber hecho nada. Regla de oro: **SIEMPRE `await` la cadena.**

</details>

---

⬅️ Anterior: [Síntesis M3](/docs/fluent-interface/m3-sintesis) · ➡️ Siguiente: [¿Cuándo SÍ / cuándo NO?](/docs/fluent-interface/m4-cuando-si-cuando-no)
