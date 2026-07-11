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

- Los **mismos 4 tests** que en M03 (uno por mercado) corren en verde.
- En el spec verás `loginPage.loginInMarket(user, 'MX')` en lugar del bloque de 5 líneas.
- Hay un segundo `describe` ("using granular actions") que muestra que el POM **no obliga** a usar siempre el método de alto nivel — puedes encadenar `goto / selectMarket / loginAs` cuando un TC necesite control fino.

---

## Paso 8 — Comparativa antes/después (5 min)

Abre M03 y M04 simultáneamente y responde:

1. ¿Qué pasa si el campo `username-desktop` cambia de testid?
   - En M03: **modificas 4 tests**.
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

import { test } from "@playwright/test";
import { LoginPage, CatalogPage } from "../pages";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

const markets = marketsJson as Market[];
const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test.describe("POM — login + catalog per market (M04)", () => {
  for (const market of markets) {
    test(`TC-${market.code} — clean flow in ${market.fullName} @smoke`, async ({ page }) => {
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
```
