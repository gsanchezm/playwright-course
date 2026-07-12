# 🚩 Reto M03

## Paso 8 — Resolver el reto

Abre `reto.spec.ts`. La meta es **añadir un 5º mercado (`CA`, Canadá, `CAD`) sin tocar el spec**. Vas a editar solo **dos** archivos:

1. `data/markets.json` → añadir el nuevo objeto.
2. `types/omnipizza.d.ts` → ampliar el union (`CountryCode` y `Currency`).

Y luego completar los TODOs del reto para que la validación de currency sea data-driven (no hardcoded como en el ejemplo). Es la prueba de fuego del data-driven: si la parametrización está bien hecha, un mercado nuevo aparece como un test extra **sin escribir ni una línea de spec**.

Cada TODO indica **Qué hacer / Pista / Cómo verificar**.

---

## Código completo — `reto.spec.ts`

```ts
// @file modulo-03-data-driven/reto.spec.ts
// ============================================================
// 🚩 Reto M03 — Añadir un 5º mercado sin tocar este spec
// ============================================================
// Objetivo pedagógico: comprobar que la parametrización funciona.
// Vas a añadir Canadá (CA / CAD) y el test extra se ejecutará
// automáticamente, sin tocar ni una línea de este archivo.
//
// El "truco" es que `markets.json` está tipado por la interfaz
// `Market` (en types/omnipizza.d.ts). Si rompes el contrato,
// TypeScript te lo dice ANTES de correr.
// ============================================================
//
// 🧰 Pre-requisitos:
//   ✔ pnpm m3 corre en verde con los 4 mercados actuales (MX/US/CH/JP).
//   ✔ Abres `types/omnipizza.d.ts` y `data/markets.json` en el editor.
//
// ▶ Cómo correr SOLO este reto:
//   pnpm exec playwright test modulo-03-data-driven/reto.spec.ts --headed --project=ui-anon
//
//   (o con UI mode:)
//   pnpm test:ui
// ============================================================

import { test, expect } from "@playwright/test";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

const markets = marketsJson as Market[];
const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test.describe("Challenge M03 — extended parameterization", () => {
  // ────────────────────────────────────────────────────────
  // TODO 0 — Antes de venir aquí, edita estos DOS archivos:
  // ────────────────────────────────────────────────────────
  //
  //   A) data/markets.json — añade al final del array:
  //        {
  //          "code": "CA",
  //          "fullName": "Marie Tremblay",
  //          "country": "Canada",
  //          "currency": "CAD"
  //        }
  //
  //   B) types/omnipizza.d.ts — amplía los union types:
  //        export type CountryCode = "MX" | "US" | "CH" | "JP" | "CA";
  //        export type Currency    = "MXN" | "USD" | "CHF" | "JPY" | "CAD";
  //
  //   Verifica:
  //     pnpm typecheck            ← debe pasar en verde
  //     pnpm exec playwright test modulo-03-data-driven/reto.spec.ts --list
  //                               ← debe listar 5 tests (uno por mercado)
  //
  //   💡 Si typecheck se queja con "Type '\"CA\"' is not assignable to
  //   type 'CountryCode'", es señal de que aún no actualizaste el .d.ts.

  for (const market of markets) {
    test(`Challenge-${market.code} — catalog loads in ${market.country}`, async ({
      page,
    }) => {
      // ────────────────────────────────────────────────────────
      // TODO 1 — Login con standard_user en este mercado
      // ────────────────────────────────────────────────────────
      // Qué hacer:
      //   Replicar el bloque de login que ya viste en `ejemplo.spec.ts`:
      //     goto, click market, fill username, fill password,
      //     click login-button.
      //
      // Pista:
      //   await page.goto("/");
      //   await page.getByTestId(`market-${market.code}`).click();
      //   await page.getByTestId("username-desktop").fill(standardUser.username);
      //   await page.getByTestId("password-desktop").fill(standardUser.password);
      //   await page.getByTestId("login-button-desktop").click();
      //
      // Cómo verificar (UI mode):
      //   Para el caso `Challenge-CA`, te aterriza en `/catalog` igual que
      //   con MX/US/CH/JP (OmniPizza no diferencia visualmente CA;
      //   lo importante es que la parametrización funciona).


      // ────────────────────────────────────────────────────────
      // TODO 2 — Validar que llegaste al catálogo
      // ────────────────────────────────────────────────────────
      // Qué hacer:
      //   Aserción de URL: debe contener "/catalog".
      //
      // Pista:
      //   await expect(page).toHaveURL(/\/catalog/);


      // ────────────────────────────────────────────────────────
      // TODO 3 — Contar las pizzas del catálogo en este mercado
      // ────────────────────────────────────────────────────────
      // Qué hacer:
      //   1) Crear un locator que matchee `[data-testid^="pizza-card-"]`.
      //   2) Esperar a que la primera sea visible (timeout 30s por
      //      el cold start de Render).
      //   3) Obtener el array con `.all()` y validar que `.length > 0`.
      //
      // Pista:
      //   const pizzaCards = page.locator('[data-testid^="pizza-card-"]');
      //   await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 });
      //   const all = await pizzaCards.all();
      //   expect(all.length).toBeGreaterThan(0);
      //
      // Cómo verificar (UI mode):
      //   Verás un grid de pizzas con varias tarjetas — cuenta visualmente
      //   que coincide con lo que reporta `all.length` en el log.


      // ────────────────────────────────────────────────────────
      // TODO 4 — Validación DATA-DRIVEN de la currency
      // ────────────────────────────────────────────────────────
      // Qué hacer:
      //   Mapear cada `market.currency` a su símbolo y aseverar que
      //   el body de la página lo contiene. Esto reemplaza el
      //   `if (market.code === "MX")` del ejemplo (que era hardcoded).
      //
      // Pista:
      //   const symbol = {
      //     MXN: "$",
      //     USD: "$",
      //     CHF: "Fr",
      //     JPY: "￥",     // ← full-width (U+FFE5), no el half-width ¥
      //     CAD: "$",     // ← tu nuevo mercado
      //   }[market.currency];
      //   await expect(page.locator("body")).toContainText(symbol);
      //
      // Cómo verificar:
      //   El test pasa para los 5 mercados. Si el símbolo no aparece,
      //   revisa qué muestra OmniPizza para esa currency (puede usar
      //   un código distinto como "CA$").


      expect(market).toBeDefined(); // placeholder — quítalo cuando termines
    });
  }
});

// ============================================================
// 📝 Reflexión final — responde mentalmente:
// ============================================================
//
//   1. ¿Cuántos archivos tocaste para añadir un 5º mercado?
//      (Esperado: 2 — markets.json y omnipizza.d.ts.
//       Si tocaste el spec, perdiste el premio del data-driven.)
//
//   2. ¿Qué pasaría si OmniPizza añadiera 50 mercados nuevos?
//      ¿Cuántas líneas de spec tendrías que escribir? (Esperado: 0.)
//
//   3. Si quitas `as Market[]` del cast, ¿qué hace TypeScript?
//      Pruébalo en tu editor: el tipo se vuelve `any` y pierdes
//      el autocompletado de `market.code`. Por eso el cast importa.
//
// 👉 En M04 vas a refactorizar este bloque de login a una clase
//    POM: 5 líneas se convertirán en 1.
// ============================================================
```

---

## Paso 9 — Versiona tu trabajo (Git JIT)

Cuando el reto quede en verde, agrega **solo lo que cambió en este módulo** y commitéalo con un mensaje convencional:

```bash
git add .
git commit -m "feat(m03): data-driven con JSON tipado"
```

M03 introduce dos carpetas reusables (`types/`, `data/`) más el spec del módulo. Versionarlas en un commit atómico deja un punto de retorno limpio **antes** de que M04 empiece a refactorizar hacia POM. (Aquí Git es JIT: commit al cerrar; las ramas y el push llegan en M04/M05, cuando el flujo los pida.)

**Cómo verificas:**

```bash
git log --oneline -1        # muestra el commit feat(m03) recién creado
git status                  # working tree limpio para lo que tocaste
```
