# El spec paso a paso

Esta página cubre la parte de **lectura y ejecución del ejemplo** de M03: correr el smoke parametrizado por los 5 mercados y leer el bucle `for...of` data-driven pieza por pieza. Al final tienes el código completo de `ejemplo.spec.ts`.

---

## Paso 6 — Ejecutar el ejemplo

```bash
# Headless — el smoke parametrizado, 5 mercados de un solo TC
pnpm m3

# UI mode — RECOMENDADO la primera vez
pnpm test:ui
```

**Qué debería pasar:**

- En la terminal verás **5 tests** corriendo, uno por mercado: `TC-MX`, `TC-US`, `TC-CH`, `TC-JP`, `TC-SA`.
- Todos pasan en verde (suelen tardar ~30-40s la primera vez por el cold start de Render).
- En UI mode, los 5 aparecen como hijos del mismo describe.

Ver con tus ojos que **un solo `test()` se registró 5 veces** (uno por mercado) cierra el concepto data-driven. No son 5 tests copy/pasteados: es un `for` que llamó a `test()` cinco veces. **Playwright NO tiene `test.each()`** — esos 5 casos los registró un `for` de JavaScript.

---

## Paso 7 — Lectura guiada del `for...of` data-driven

Abre `ejemplo.spec.ts` e identifica, en este orden:

1. **Los imports tipados** — `import type { Market, User, Currency }` + los `import` de JSON.
2. **El bucle `for (const market of markets)`** — un `test()` por cada elemento del array.
3. El **título dinámico** del test: `` `TC-${market.code} — login + catalog in market ${market.code} @smoke` `` — cada test tiene un nombre único.
4. La **validación condicional por mercado** (símbolo `$` en MX, `￥` en JP) — lógica de negocio data-driven, con el **CSS selector legítimo** `[data-testid^="pizza-card-"]` y la **materialización del listado** con `.all()`.

Varias de esas líneas se leen "de pasada" pero esconden una decisión de diseño. Si las cambias por la alternativa "obvia", el test se rompe o pierdes seguridad de tipos:

> 🔍 **Detalle que parece obvio — `await expect(page).toHaveURL(/\/catalog/)`**
> **Qué es:** el argumento entre `/.../` es una **expresión regular** (regex), **no** un string, y eso es deliberado. Un regex hace *match parcial*: la aserción pasa si la URL **contiene/matchea** `/catalog` en cualquier parte. Un string, en cambio, exige que la URL sea **exactamente** ese valor.
> **Por qué así (y no la alternativa obvia):** OmniPizza puede añadir cosas a la URL del catálogo —querystring (`?locale=`), ids, el locale dentro del path (`/mx/catalog`) o un slash final— y el regex tolera todo eso. El `\/` escapa la barra `/` porque en un literal regex de JS la `/` es el **delimitador** que abre y cierra la expresión; sin escaparla, el motor creería que el regex terminó ahí.
> **Qué pasa si lo cambias:** si pones el string `"/catalog"`, Playwright lo **resuelve contra `baseURL` con `new URL("/catalog", baseURL)`** y compara por **IGUALDAD exacta** de la URL resultante. Como la URL real es algo como `https://.../catalog?...` (o `/mx/catalog`), nunca será literalmente `https://.../catalog` y el test **truena** con un timeout de aserción. Por eso aquí el regex (parcial, robusto) gana al string (igualdad, frágil).

> 🔍 **Detalle que parece obvio — `` test(`TC-${market.code} — login + catalog in market ${market.code} @smoke`, ...) ``**
> **Qué es:** el título del test es un *template string* que interpola `market.code` en cada vuelta del `for...of` — eso garantiza `TC-MX`, `TC-US`, `TC-CH`, `TC-JP`, `TC-SA`: nombres distintos y legibles en el reporte. Playwright **exige títulos únicos** dentro del mismo describe.
> **Por qué así (y no la alternativa obvia):** además, el tag `@smoke` va **embebido en el título** a propósito: es lo que permite filtrar con `--grep @smoke` (el atajo `pnpm test:smoke`).
> **Qué pasa si lo cambias:** si pones un título fijo (`"TC catálogo"`) para los 5, tendrás títulos duplicados — confusos en el reporte y difíciles de aislar con `--grep` o `-g "TC-MX"`. Si quitas `@smoke`, el caso deja de aparecer en `pnpm test:smoke`.

> 🔍 **Detalle que parece obvio — `page.locator('[data-testid^="pizza-card-"]')`**
> **Qué es:** un CSS selector con el operador de atributo `^=`, que significa **"el atributo empieza con"**. Aquí matchea cualquier elemento cuyo `data-testid` arranque con `pizza-card-`.
> **Por qué así (y no la alternativa obvia):** los testids completos son dinámicos (`pizza-card-123`, `pizza-card-456`...), así que un `getByTestId("pizza-card-123")` con id fijo solo encontraría una pizza concreta (frágil) o ninguna. Bajar al nivel 4 es legítimo justamente por eso (la jerarquía de locators la viste en M02) — no es deuda técnica: es la herramienta correcta para testids variables.
> **Qué pasa si lo cambias:** si usas `=` en vez de `^=` (`[data-testid="pizza-card-"]`), exiges igualdad exacta y no matcheas **ninguna** tarjeta.

> 🔍 **Detalle que parece obvio — `const allCards = await pizzaCards.all()`**
> **Qué es:** `.all()` devuelve `Promise<Locator[]>` — **materializa** la lista: consulta el DOM *ahora* y te entrega un array fijo de locators. Por eso lleva `await`.
> **Por qué así (y no la alternativa obvia):** comparado con `pizzaCards.first()`, que **no** necesita `await` porque devuelve un `Locator` perezoso (lazy) — un puntero que recién resuelve el DOM cuando lo usas en una acción o aserción. `.all()` rompe esa pereza a propósito: necesitas el array concreto para iterarlo y contar (`allCards.length`).
> **Qué pasa si lo cambias:** si omites el `await`, `allCards` queda como una `Promise`, no como array; `allCards.length` da `undefined` y el `for...of` no itera nada (o falla). Si en cambio creías que `.first()` necesita `await` y lo agregas, no rompe pero es ruido — el locator es perezoso por diseño.

> 🔷 **TypeScript — `import type`**
> `import type { Market }` trae **solo la forma** (el tipo), no código ejecutable: el compilador la borra del bundle final. La alternativa `import { Market }` (sin `type`) también compila, pero arrastra una dependencia de valor innecesaria y puede crear ciclos de import en proyectos grandes.
> 📚 Lo viste en [TS · M06 — interfaces](/docs/typescript/m6-api-response). Aquí lo aplicas a `Market`, `User` y `Currency`: contratos que solo existen en compile-time.

> 🔷 **TypeScript — arrays tipados (`Market[]` / `User[]`)**
> `Type[]` significa "array cuyos elementos son `Type`". `marketsJson as Market[]` le dice a TS "trata este JSON como una lista de `Market`", lo que te da autocompletado de `market.code`/`market.currency` dentro del `for...of` — importar un `.json` a secas te da un tipo inferido amplio (y a veces `any`, según la config). Si quitas el `as Market[]`, vuelves a ese tipo inferido (o `any`) y pierdes el autocompletado y el chequeo.
> ⚠️ **Ojo: `as` es una *type assertion*, no una validación.** Es una promesa que haces tú; en runtime **nadie** revisa que el JSON realmente cumpla el contrato — un JSON con datos basura compilaría igual. El contrato real lo defiende `types/omnipizza.d.ts` vía `tsc`, no este cast.
> 📚 Lo viste en [TS · M02 — types](/docs/typescript/m2-arrays). Aquí lo aplicas al array que alimenta el bucle data-driven.

> 🔷 **TypeScript — `for...of` para iterar**
> `for (const x of array)` recorre los **valores** del array (no los índices, que sería `for...in`). En este módulo lo usas en dos niveles: para **registrar** un `test()` por mercado, y dentro del test para **recorrer** las tarjetas de pizza — ahí `for...of` **serializa** los `await`: espera a que termine la aserción de una tarjeta antes de pasar a la siguiente.
> La alternativa "obvia" `allCards.forEach(async …)` **no espera** los `await` internos: `forEach` ignora el valor de retorno del callback, así que las promesas se pierden, el test sigue de largo y las aserciones se disparan en paralelo sin que nadie las espere — un fallo puede explotar **después** de que el test ya terminó (unhandled rejection) y obtienes falsos verdes. Cuando hay `await` dentro, lo correcto es `for...of` (o `Promise.all` si quieres paralelismo controlado).
> 📚 Es construcción base de JavaScript/TypeScript (lo usaste desde [TS · M03 — functions](/docs/typescript/m3-login)). Aquí es el motor de la parametrización: un `for` reemplaza al inexistente `test.each()`.

> 🔷 **TypeScript — ternario / guard clause (`if (!symbol) return;`)**
> El *fast return* (o guard clause) sale temprano cuando no hay nada que hacer, en vez de anidar `if/else`. Aquí `const symbol = currencySymbol[market.currency]` es `string | undefined` (por el `Partial`), y TS te **obliga** a manejar el `undefined`: `if (!symbol) return;` cierra el caso y deja el código plano.
> 📚 Lo viste en [TS · M03 — functions](/docs/typescript/m3-void-functions) (control de flujo y `return`). Aquí lo aplicas a la validación de currency por mercado.

---

## Código completo — `ejemplo.spec.ts`

```ts
// @file modulo-03-data-driven/ejemplo.spec.ts
// ============================================================
// M03 — Data-driven testing (bucle for...of por mercado)
// ============================================================
// Avance sobre M02: el smoke de login ahora corre contra los
// 5 mercados de OmniPizza (MX/US/CH/JP/SA) consumiendo JSON tipado
// (data/ + types/). Un `for...of` REGISTRA un test() por mercado.
//
// La jerarquía de locators ya la practicaste en M02; aquí el foco
// es el DATO. Aún no hay POM — sigue habiendo duplicación de
// pasos, pero al menos ya no hay datos hardcoded.
// ============================================================

import { test, expect } from "@playwright/test";
import type { Market, User, Currency } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

// Casting tipado del JSON: TypeScript verifica que el JSON cumple el contrato.
const markets = marketsJson as Market[];
const users = usersJson as User[];

// ────────────────────────────────────────────────────────
// Guard clause: si el dataset no trae el usuario que el smoke
// necesita, FALLAMOS RÁPIDO con un mensaje claro — en vez de
// usar `!` y dejar que el test reviente más adelante con un
// críptico "Cannot read property 'username' of undefined".
// ────────────────────────────────────────────────────────
const standardUser = users.find((u) => u.username === "standard_user");
if (!standardUser) {
  throw new Error(
    'data/users.json does not contain a user with username "standard_user". ' +
      "Check the data seed before running M03.",
  );
}

// Mapa currency → símbolo que esperamos ver renderizado en la UI.
// Si añades un mercado nuevo, agrega su símbolo aquí (o déjalo
// fuera para que la validación se SALTE en ese mercado).
const currencySymbol: Partial<Record<Currency, string>> = {
  MXN: "$",
  // La app japonesa renderiza el yen FULL-WIDTH ￥ (U+FFE5) vía
  // Intl.NumberFormat('ja-JP'), NO el half-width ¥ (U+00A5).
  JPY: "￥",
  // Arabia Saudita (RTL): el riyal se renderiza como "ر.س" — símbolo
  // inequívoco, así que sí lo validamos (a diferencia de USD/CHF que
  // dejamos fuera por ambigüedad del "$"/símbolo suizo).
  SAR: "ر.س",
};

test.describe("Smoke parameterized by market (M03)", () => {
  // OJO: Playwright NO tiene `test.each()` (eso es de Jest/Vitest).
  // Para parametrizar, un `for` recorre el array y REGISTRA un
  // `test()` por dato → 5 TCs independientes (TC-MX, TC-US, ...),
  // no un test que itera por dentro.
  for (const market of markets) {
    test(`TC-${market.code} — login + catalog in market ${market.code} @smoke`, async ({ page }) => {
      // --- PASO 1: Login ---
      // Jerarquía: primero por testid (OmniPizza los tiene), luego por CSS prefix.
      await page.goto("/");
      await page.getByTestId(`market-${market.code}`).click();
      await page.getByTestId("username-desktop").fill(standardUser.username);
      await page.getByTestId("password-desktop").fill(standardUser.password);
      await page.getByTestId("login-button-desktop").click();

      // --- PASO 2: Validar que llegamos al catálogo ---
      // El argumento es un REGEX (match PARCIAL, robusto): pasa si la
      // URL CONTIENE "/catalog" — tolera ?query, locale o slash final.
      // Un string se fusiona con baseURL vía new URL() y se compara por
      // IGUALDAD exacta → frágil. El \/ escapa el delimitador del regex.
      await expect(page).toHaveURL(/\/catalog/);

      // --- PASO 3: Iterar el listado de pizzas (ciclo real) ---
      // CSS selector con prefijo — legítimo porque los testids son dinámicos.
      const pizzaCards = page.locator('[data-testid^="pizza-card-"]');
      await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 });
      const allCards = await pizzaCards.all();
      expect(allCards.length).toBeGreaterThan(0);

      // Recorrer cada tarjeta (for...of sobre el array de locators)
      for (const card of allCards) {
        await expect(card).toBeVisible();
      }

      // --- PASO 4: Validación dinámica por mercado ---
      // Reemplazamos la cadena `if / else if` por un LOOKUP MAP +
      // GUARD CLAUSE (fast return): si el mercado no tiene símbolo
      // definido, saltamos la aserción y seguimos. Cero ramificación,
      // cero `else`, fácil de extender (basta añadir una entrada al
      // mapa `currencySymbol`).
      const symbol = currencySymbol[market.currency];
      if (!symbol) return; // ← guard clause: nada que validar para esta currency

      await expect(page.locator("body")).toContainText(symbol);
    });
  }
});

// ============================================================
// 📚 ¿Buscas la chuleta de locators (los dos test.skip de
//    referencia)? Se movió a M02 — Locators, que es donde se
//    enseña la jerarquía. Aquí el foco es el DATO.
// ============================================================
```
