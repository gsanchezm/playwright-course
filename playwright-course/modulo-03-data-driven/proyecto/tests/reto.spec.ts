// ============================================================
// 🚩 Reto M03 — Añadir OTRO mercado sin tocar este spec
// ============================================================
// Objetivo pedagógico: comprobar que la parametrización funciona.
// Tu dataset YA trae 5 mercados: MX/US/CH/JP + SA (Arabia Saudita,
// el market nuevo de la plataforma). Vas a añadir un 6º, Canadá
// (CA / CAD), y el test extra se ejecutará automáticamente, sin
// tocar ni una línea de este archivo.
//
// El "truco" es que `markets.json` está tipado por la interfaz
// `Market` (en types/omnipizza.d.ts). Si rompes el contrato,
// TypeScript te lo dice ANTES de correr.
// ============================================================
//
// 🧰 Pre-requisitos:
//   ✔ pnpm m3 corre en verde con los 5 mercados actuales (MX/US/CH/JP/SA).
//   ✔ Abres `types/omnipizza.d.ts` y `data/markets.json` en el editor.
//
// ▶ Cómo correr SOLO este reto (desde proyecto/):
//   pnpm exec playwright test tests/reto.spec.ts --headed --project=ui-anon
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
  //          "currency": "CAD",
  //          "fullName": "Emily Tremblay",
  //          "country": "Canada",
  //          "phone": "+1 416 555 0199",
  //          "address": "100 Queen St W",
  //          "zipCode": "M5H 2N2",
  //          "taxRate": 0.13
  //        }
  //      (fullName es la PERSONA representante del mercado; country es el país.)
  //
  //   B) types/omnipizza.d.ts — amplía los union types (SA ya está;
  //      tú sumas CA):
  //        export type CountryCode = "MX" | "US" | "CH" | "JP" | "SA" | "CA";
  //        export type Currency    = "MXN" | "USD" | "CHF" | "JPY" | "SAR" | "CAD";
  //
  //   Verifica:
  //     pnpm typecheck            ← debe pasar en verde
  //     pnpm exec playwright test tests/reto.spec.ts --list
  //                               ← debe listar 6 tests (uno por mercado)
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
      //   Para el caso `Reto-CA`, te aterriza en `/catalog` igual que
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
      //     JPY: "¥",
      //     SAR: "ر.س",   // ← Arabia Saudita (ya en el base)
      //     CAD: "$",     // ← tu nuevo mercado
      //   }[market.currency];
      //   await expect(page.locator("body")).toContainText(symbol);
      //
      // Cómo verificar:
      //   El test pasa para los 6 mercados. Si el símbolo no aparece,
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
//   1. ¿Cuántos archivos tocaste para añadir otro mercado?
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
