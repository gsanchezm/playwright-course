# 🚩 Reto M05

## Paso 8 — Resolver el reto

Abre `reto.spec.ts`. Tu trabajo es **mockear `/api/pizzas` con latencia simulada** y validar que la UI muestra un skeleton/loader mientras el backend "tarda".

El flujo del reto:

1. Interceptar `GET /api/pizzas*` con `page.route()` y, **antes** de dejar pasar el request al backend real, esperar 3 segundos con `setTimeout` + `route.continue()`. Eso simula un backend lento **de forma determinista** (3s exactos, no el tiempo real variable).
2. Hacer login por UI con el fixture `loginPage` para aterrizar en `/catalog` — el mock se dispara al cargar el catálogo.
3. Validar que durante esos ~3s aparece un indicador de carga (skeleton/loader).
4. Validar que **después** de los 3s aparecen las pizzas reales (el mock dejó pasar el request, así que el backend responde tarde pero responde).

Cada TODO del reto sigue el formato **Qué hacer / Pista / Cómo verificar**. No están resueltos aquí a propósito.

**El detalle clave que refuerza este reto:** el mock se registra **ANTES** del login (que navega). `page.route` persiste durante toda la vida de la pestaña; si lo registras después de que `/api/pizzas` ya se pidió, llegas tarde.

> 💡 **Si OmniPizza no muestra un skeleton, este reto te enseña algo: abre un bug.** Una carga larga **sin** feedback visual es un defecto de UX clásico — esa es la conversación QA↔UX. El reto no es solo "haz que pase el test", es reconocer cuándo el test revela un hueco de producto.

Este reto **no** toca sesión ni `storageState` (eso llega en M06). Corre en el project `chromium` anónimo: el catálogo se alcanza haciendo login por UI.

---

## ▶️ Cómo correr solo este reto

```bash
pnpm exec playwright test tests/reto.spec.ts --headed --project=chromium
```

Criterio de éxito: el test pasa y su duración total es **≥ 3s** (por la latencia mockeada).

---

## Código completo — `reto.spec.ts`

```ts
// @file modulo-05-fixtures/tests/reto.spec.ts
// ============================================================
// 🚩 Reto M05 — Mock con latencia simulada (page.route + delay)
// ============================================================
// Objetivo: interceptar /api/pizzas, meterle una demora artificial
// con `setTimeout` + `route.continue()`, y validar que la UI muestra
// un skeleton/loader mientras el backend "tarda".
//
// Este reto NO toca sesión ni storageState (eso llega en M06). Corre
// en el project `chromium` anónimo: el catálogo se alcanza haciendo
// login por UI con el fixture `loginPage`.
//
// 🧰 Pre-requisitos:
//   ✔ pnpm m5 corre en verde
//   ✔ Conoces fixtures/omnipizza.ts (loginPage/catalogPage inyectados)
//   ✔ Entiendes que el mock se registra ANTES de navegar
//
// ▶ Cómo correr SOLO este reto:
//   pnpm exec playwright test tests/reto.spec.ts --headed --project=chromium
// ============================================================

import { test, expect } from "../fixtures/omnipizza";

// ============================================================
// Mock con latencia y validar el skeleton/loader
// ============================================================
test.describe("Reto M05 — mock con latencia @regression", () => {
  test("un backend lento muestra el skeleton/loader antes de las pizzas", async ({
    page,
    loginPage,
    standardUser,
    defaultMarket,
  }) => {
    // ────────────────────────────────────────────────────────
    // TODO 1 — Registrar el mock con delay artificial
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Interceptar GET /api/pizzas* y, antes de dejar pasar el request
    //   al backend real, esperar 3 segundos. Eso simula un backend lento.
    //
    // ⚠️ El mock debe registrarse ANTES del login (que navega a /catalog):
    //    page.route sigue vivo durante todo el ciclo de la pestaña.
    //
    // Pista (ya viene rellenado abajo; léelo, no lo borres):
    await page.route("**/api/pizzas*", async (route) => {
      await new Promise((r) => setTimeout(r, 3_000));
      await route.continue();
    });

    // ────────────────────────────────────────────────────────
    // TODO 2 — Login por UI para llegar al catálogo
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Usa el fixture loginPage para autenticarte por UI y aterrizar en
    //   /catalog. El mock se disparará al cargar el catálogo y tendrás
    //   ~3s de "loading" hasta que el backend real responda.
    //
    // Pista:
    //   await loginPage.loginInMarket(standardUser, defaultMarket.code);


    // ────────────────────────────────────────────────────────
    // TODO 3 — Validar que el skeleton/loader aparece
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   ANTES de que las pizzas reales aparezcan (en los primeros
    //   ~3 segundos), debe ser visible un indicador de carga. Su
    //   testid puede ser `catalog-loading`, `skeleton-card`, etc.
    //
    // Pista (ajusta el testid al DOM real de OmniPizza):
    //   await expect(page.getByTestId("catalog-loading")).toBeVisible();
    //
    // 💡 Si OmniPizza no muestra un skeleton, este reto te enseña algo:
    //    abre un bug. Las cargas largas SIN feedback visual son un
    //    defecto de UX clásico — esa es la conversación QA↔UX.


    // ────────────────────────────────────────────────────────
    // TODO 4 — Validar que tras los 3s, las pizzas aparecen
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Esperar a que aparezcan tarjetas reales de pizza (el mock dejó
    //   pasar el request, así que el backend responde tarde pero responde).
    //
    // Pista:
    //   const pizzaCards = page.locator('[data-testid^="pizza-card-"]');
    //   await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 });
    //
    // Criterio de éxito:
    //   El test pasa. La duración total será ≥ 3s.


    // Placeholder para que el TS compile aunque no hayas terminado.
    await expect(page.locator("body")).toBeVisible();
  });
});

// ============================================================
// 📝 Reflexión final — responde mentalmente:
// ============================================================
//
//   1. Si el mock NO existiera (latencia real del backend), ¿el test
//      sería determinista? (Esperado: NO — el tiempo real varía. Por eso
//      mockeamos la demora: 3s exactos, reproducibles.)
//
//   2. ¿Por qué registramos el mock ANTES del login y no justo antes de
//      llegar a /catalog? (Esperado: page.route persiste durante toda la
//      pestaña; si lo registras después de que /api/pizzas ya se pidió,
//      llegas tarde. Registrarlo primero garantiza que lo intercepte.)
//
//   3. ¿Qué otro caso de red mockearías con page.route además de latencia?
//      (Esperado: errores 5xx/404, respuestas vacías, respuestas con
//      esquema inesperado — todos deterministas sin tocar el backend.)
//
// 👉 En M06 vas a ver la otra cara: en vez de hacer login por UI en cada
//    test, un `auth.setup.ts` lo hace UNA vez, guarda el badge
//    (storageState) y todos los tests arrancan ya autenticados.
// ============================================================
```
