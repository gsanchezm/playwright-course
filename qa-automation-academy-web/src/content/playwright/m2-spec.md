# El spec paso a paso

Esta página cubre la parte de **lectura y ejecución del ejemplo** de M02: correr el spec parametrizado, leer el bucle `for...of` data-driven y revisar el catálogo de locators. Al final tienes el código completo de `ejemplo.spec.ts`.

---

## Paso 6 — Ejecutar el ejemplo

```bash
# Headless — el smoke parametrizado, 4 mercados de un solo TC
pnpm m2

# UI mode — RECOMENDADO la primera vez
pnpm test:ui
```

**Qué debería pasar:**

- En la terminal verás **4 tests** corriendo, uno por mercado: `TC-MX`, `TC-US`, `TC-CH`, `TC-JP`.
- Todos pasan en verde (suelen tardar ~30-40s la primera vez por el cold start de Render).
- En UI mode, los 4 aparecen como hijos del mismo describe.

---

## Paso 7 — Lectura guiada del `for...of` data-driven

Abre `ejemplo.spec.ts` e identifica:

1. **El bucle `for (const market of markets)`** — un `test()` por cada elemento del array.
2. El **título dinámico** del test: `` `TC-${market.code} — login + catalog in market ${market.code} @smoke` `` — cada test tiene un nombre único.
3. La **validación condicional por mercado** (símbolo `$` en MX, `¥` en JP) — lógica de negocio data-driven.
4. El **CSS selector legítimo** `[data-testid^="pizza-card-"]` — explica por qué baja al nivel 4 de la jerarquía: los testids son dinámicos.
5. La **aserción de URL** `await expect(page).toHaveURL(/\/catalog/)` — el argumento es un **regex**, no un string.
6. La **materialización del listado** con `const allCards = await pizzaCards.all()` y el **bucle interno** `for (const card of allCards)` que recorre las tarjetas con un `await` por vuelta.

Varias de esas líneas se leen "de pasada" pero esconden una decisión de diseño. Si las cambias por la alternativa "obvia", el test se rompe o pierdes seguridad de tipos:

> 🔍 **Detalle que parece obvio — `const markets = marketsJson as Market[]`**
> **Qué es:** una *type assertion* — le dices a TypeScript "trata este JSON como `Market[]`". Es una promesa que haces tú; **no** es validación en runtime. Al ejecutar, nadie revisa que el JSON realmente cumpla el contrato.
> **Por qué así (y no la alternativa obvia):** importar un `.json` te da un tipo inferido amplio (y a veces `any`, según la config). El `as Market[]` te devuelve autocompletado y chequeo de `market.code`, `market.currency`, etc. en compile-time, que es donde queremos atrapar los errores.
> **Qué pasa si lo cambias:** si quitas el `as Market[]`, el tipo pasa a ser el inferido del JSON (o `any`) y **pierdes el autocompletado y la seguridad** de `market.code` / `market.currency`. (Ojo: como es assertion, no validación, un JSON con datos basura sí compilaría — el contrato real lo defiende el `.d.ts` vía `tsc`, no este cast.)

> 🔍 **Detalle que parece obvio — `` test(`TC-${market.code} — login + catalog in market ${market.code} @smoke`, ...) ``**
> **Qué es:** el título del test se construye con un *template string* que interpola `market.code` en cada vuelta del `for...of` sobre `markets`.
> **Por qué así (y no la alternativa obvia):** cada iteración del bucle registra un `test()` distinto, y Playwright **exige títulos únicos** dentro del mismo describe — `${market.code}` garantiza `TC-MX`, `TC-US`, `TC-CH`, `TC-JP`, nombres distintos y legibles en el reporte. Además, el tag `@smoke` embebido en el título es lo que permite filtrar con `--grep @smoke` (el atajo `pnpm test:smoke`).
> **Qué pasa si lo cambias:** si pones un título fijo (`"TC catálogo"`) para los 4, tendrás títulos duplicados — confusos en el reporte y difíciles de aislar con `--grep` o `-g "TC-MX"`. Si quitas `@smoke`, el caso deja de aparecer en `pnpm test:smoke`.

> 🔍 **Detalle que parece obvio — `await expect(page).toHaveURL(/\/catalog/)`**
> **Qué es:** el argumento entre `/.../` es una **expresión regular** (regex), **no** un string. Un regex hace *match parcial*: la aserción pasa si la URL **contiene/matchea** `/catalog` en cualquier parte. Un string, en cambio, exige que la URL sea **exactamente** ese valor.
> **Por qué así (y no la alternativa obvia):** OmniPizza puede añadir cosas a la URL del catálogo —querystring (`?locale=`), ids, o el locale dentro del path (`/mx/catalog`)—. Con regex toleras todo eso. El `\/` escapa la barra `/` porque en un literal regex de JS la `/` es el **delimitador** que abre y cierra la expresión; sin escaparla, el motor creería que el regex terminó ahí.
> **Qué pasa si lo cambias:** si pones el string `"/catalog"`, Playwright lo **resuelve contra `baseURL` con `new URL("/catalog", baseURL)`** y compara por **igualdad exacta** de la URL resultante. Como la URL real es algo como `https://.../catalog?...` (o `/mx/catalog`), nunca será literalmente `https://.../catalog` y el test **truena** con un timeout de aserción. Por eso aquí el regex (parcial, robusto) gana al string (igualdad, frágil).

> 🔍 **Detalle que parece obvio — `page.locator('[data-testid^="pizza-card-"]')`**
> **Qué es:** un CSS selector con el operador de atributo `^=`, que significa **"el atributo empieza con"**. Aquí matchea cualquier elemento cuyo `data-testid` arranque con `pizza-card-`.
> **Por qué así (y no la alternativa obvia):** los testids de las pizzas son **dinámicos** (`pizza-card-123`, `pizza-card-456`...), así que no puedes usar `getByTestId("pizza-card-123")` con un id fijo: solo encontrarías una pizza concreta (frágil) o ninguna. Bajar al nivel 4 de la jerarquía (la tabla está en la guía del módulo) es **legítimo** justamente por eso. No es deuda técnica: es la herramienta correcta para testids variables.
> **Qué pasa si lo cambias:** si usas `=` en vez de `^=` (`[data-testid="pizza-card-"]`), exiges igualdad exacta y no matcheas **ninguna** tarjeta.

> 🔍 **Detalle que parece obvio — `const allCards = await pizzaCards.all()`**
> **Qué es:** `.all()` devuelve `Promise<Locator[]>` — **materializa** la lista: consulta el DOM *ahora* y te entrega un array fijo de locators. Por eso lleva `await`.
> **Por qué así (y no la alternativa obvia):** comparado con `pizzaCards.first()`, que **no** necesita `await` porque devuelve un `Locator` perezoso (lazy) — un puntero que recién resuelve el DOM cuando lo usas en una acción o aserción. `.all()` rompe esa pereza a propósito: necesitas el array concreto para iterarlo y contar (`allCards.length`).
> **Qué pasa si lo cambias:** si omites el `await`, `allCards` queda como una `Promise`, no como array; `allCards.length` da `undefined` y el `for...of` no itera nada (o falla). Si en cambio creías que `.first()` necesita `await` y lo agregas, no rompe pero es ruido — el locator es perezoso por diseño.

> 🔍 **Detalle que parece obvio — `for (const card of allCards) { await expect(card)... }`**
> **Qué es:** un bucle `for...of` que recorre el array de locators y hace una aserción `await` por cada tarjeta.
> **Por qué así (y no la alternativa obvia):** `for...of` **serializa** los `await`: espera a que termine la aserción de una tarjeta antes de pasar a la siguiente. La alternativa "obvia" `allCards.forEach(async (card) => { await ... })` **no espera** las promesas — `forEach` ignora el valor de retorno del callback, así que los `await` de adentro se pierden y el test sigue de largo.
> **Qué pasa si lo cambias:** con `forEach`, las aserciones se disparan en paralelo sin que el test las espere; un fallo puede ocurrir **después** de que el test ya terminó (unhandled rejection) y obtienes falsos verdes. `for...of` (o `Promise.all` si quieres paralelismo controlado) es lo correcto cuando hay `await` dentro.

> 🔷 **TypeScript — `import type`**
> `import type { Market }` trae **solo la forma** (el tipo), no código ejecutable: el compilador la borra del bundle final. La alternativa `import { Market }` (sin `type`) también compila, pero arrastra una dependencia de valor innecesaria y puede crear ciclos de import en proyectos grandes.
> 📚 Lo viste en [TS · M06 — interfaces](/docs/typescript/m6-api-response). Aquí lo aplicas a `Market`, `User` y `Currency`: contratos que solo existen en compile-time.

> 🔷 **TypeScript — arrays tipados (`Market[]` / `User[]`)**
> `Type[]` significa "array cuyos elementos son `Type`". Qué hace el `as Market[]`, por qué es una *assertion* y no una validación, y qué pierdes si lo quitas, ya lo tienes en el detalle 🔍 de `const markets = marketsJson as Market[]`, arriba.
> 📚 Lo viste en [TS · M02 — types](/docs/typescript/m2-arrays). Aquí lo aplicas al array que alimenta el bucle data-driven.

> 🔷 **TypeScript — `for...of` para iterar**
> `for (const x of array)` recorre los **valores** del array (no los índices, que sería `for...in`). En este módulo lo usas en dos niveles: para **registrar** un `test()` por mercado, y dentro del test para **recorrer** las tarjetas de pizza. (Por qué con `await` adentro se usa `for...of` y no `forEach` ya lo viste en el detalle 🔍 del bucle interno, arriba.)
> 📚 Es construcción base de JavaScript/TypeScript (lo usaste desde [TS · M03 — functions](/docs/typescript/m3-login)). Aquí es el motor de la parametrización: un `for` reemplaza al inexistente `test.each()`.

> 🔷 **TypeScript — ternario / guard clause (`if (!symbol) return;`)**
> El *fast return* (o guard clause) sale temprano cuando no hay nada que hacer, en vez de anidar `if/else`. Aquí `const symbol = currencySymbol[market.currency]` es `string | undefined` (por el `Partial`), y TS te **obliga** a manejar el `undefined`: `if (!symbol) return;` cierra el caso y deja el código plano.
> 📚 Lo viste en [TS · M03 — functions](/docs/typescript/m3-void-functions) (control de flujo y `return`). Aquí lo aplicas a la validación de currency por mercado.

---

## Paso 8 — Catálogo de locators (lectura, no ejecución)

Al final de `ejemplo.spec.ts` hay dos bloques `test.skip` (uno para la pantalla de login y otro para el catálogo). **No se ejecutan**, son una **referencia visual** de cada nivel de la jerarquía con selectores reales — escanéalos, los vas a copiar para el reto.

En esa chuleta los locators se **encadenan** (`pizzaCards.first()`, `pizzaCards.nth(2)`, `pizzaCards.filter({ hasText: "Pepperoni" })`...):

> 🔷 **TypeScript — encadenamiento de métodos (fluent API)**
> `page.locator(...).filter(...).getByRole(...)` es una **cadena fluida**: cada método devuelve otro `Locator`, así que puedes seguir encadenando. TS te da autocompletado en cada eslabón porque conoce el tipo de retorno (`Locator`) en todo momento. Si un método devolviera `Promise<Locator>` (como `.all()`), la cadena se cortaría hasta que hagas `await`.
> 📚 Es la misma idea de métodos que retornan `this`/un tipo encadenable que viste en [TS · M05 — Clases](/docs/typescript/m5-base-page). Aquí lo aplicas para estrechar locators sin variables intermedias.

---

## Código completo — `ejemplo.spec.ts`

```ts
// @file modulo-02-locators-data/ejemplo.spec.ts
// ============================================================
// M02 — Locators jerárquicos + Data tipada (bucle for...of)
// ============================================================
// Avance sobre M01: el smoke de login ahora corre contra los
// 4 mercados de OmniPizza (MX/US/CH/JP) consumiendo JSON tipado.
//
// Aún no hay POM — sigue habiendo duplicación de pasos,
// pero al menos ya no hay datos hardcoded.
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
      "Check the data seed before running M02.",
  );
}

// Mapa currency → símbolo que esperamos ver renderizado en la UI.
// Si añades un mercado nuevo, agrega su símbolo aquí (o déjalo
// fuera para que la validación se SALTE en ese mercado).
const currencySymbol: Partial<Record<Currency, string>> = {
  MXN: "$",
  JPY: "¥",
};

test.describe("Smoke parameterized by market (M02)", () => {
  // OJO: Playwright NO tiene `test.each()` (eso es de Jest/Vitest).
  // Para parametrizar, un `for` recorre el array y REGISTRA un
  // `test()` por dato → 4 TCs independientes (TC-MX, TC-US, ...),
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
// M02 — Catálogo de locators (REFERENCIA, no se ejecuta)
// ============================================================
// Los dos bloques siguientes usan `test.skip`: son una CHULETA
// viva de cada nivel de la jerarquía, con selectores REALES de
// OmniPizza verificados contra el DOM. Copia el que necesites.
//
// Regla mental para TODOS los getBy*: te devuelven el ELEMENTO
// sobre el que vas a actuar (input, botón, heading, imagen...),
// NO un texto. Sirven para .click() / .fill() / expect(), no
// para "leer la etiqueta". (Para leer texto está getByText).
// ============================================================

test.describe("Reference — locator hierarchy", () => {
  // ──────────────────────────────────────────────────────────
  // BLOQUE A — Pantalla de login (no requiere autenticación)
  // ──────────────────────────────────────────────────────────
  test.skip("locators on the login screen", async ({ page }) => {
    await page.goto("/");

    // 1️⃣ getByRole — PREFERIDO. Localiza por el rol de
    //    accesibilidad (cómo "ve" la página un lector de pantalla)
    //    + el "nombre accesible" (texto visible / aria-label / alt).
    page.getByRole("button", { name: "Sign In" }); //   ✅ el botón de login REAL — su texto es "Sign In", NO "Login"
    page.getByRole("button", { name: /sign in/i }); //   ✅ `name` acepta regex → match parcial e insensible a mayúsculas
    page.getByRole("button", { name: "🇲🇽" }); //         ✅ las banderas de mercado son <button>; su nombre accesible es el emoji
    page.getByRole("heading", { name: "Welcome back!", level: 2 }); // ✅ opción `level` → filtra h1..h6 (aquí un <h2>)
    page.getByRole("heading", { level: 1 }); //          ✅ sin `name`: el único <h1> ("Crafting moments of pure flavor.")
    page.getByRole("textbox", { name: "standard_user" }); // ✅ el input de usuario. Su nombre accesible NO es "Username":
    //                                                       sale del PLACEHOLDER, porque el input no tiene <label>.
    page.getByRole("textbox", { name: "Username" }); //   ❌ NO matchea nada — "Username" es sólo texto visible, no el nombre accesible.

    // 2️⃣a getByLabel — devuelve el INPUT asociado a un <label>,
    //     NO el <label> ni su texto. (El error típico: creer que
    //     "obtienes el label"; en realidad obtienes el campo para
    //     escribir en él). Requiere una de estas estructuras:
    //
    //        <label for="user">Username</label>
    //        <input id="user">          ← getByLabel("Username") devuelve ESTE input
    //
    //     ...o <input aria-label="Username">, o el input ENVUELTO
    //     por el <label>. ⚠️ En OmniPizza el login NO cumple esto:
    //     "Username" es un <div> suelto (no un <label for>) y el
    //     input no tiene aria-label → getByLabel no encuentra nada.
    page.getByLabel("Username"); //                       ⚠️ patrón ILUSTRATIVO: sólo funciona si el input está bien etiquetado.

    // 2️⃣b getByPlaceholder — la alternativa que SÍ funciona aquí,
    //     porque los inputs de OmniPizza sí traen placeholder.
    page.getByPlaceholder("standard_user"); //           ✅ el input de usuario (su placeholder es "standard_user")
    page.getByPlaceholder("••••••••"); //                 ✅ el input de password

    // 2️⃣c getByText — localiza por el TEXTO visible. Match parcial
    //     por defecto; usa { exact: true } para igualdad exacta.
    page.getByText("Welcome"); //                         ✅ parcial: matchea "Welcome back!"
    page.getByText("Username"); //                        ✅ ESTE sí encuentra el texto "Username"... pero es un <div>: no sirve para escribir
    page.getByText("Please enter your details.", { exact: true }); // ✅ igualdad exacta

    // 3️⃣ getByTestId — cuando el dev cooperó con data-testid.
    //     OmniPizza sufija -desktop (≥768px) / -responsive (<768px).
    page.getByTestId("username-desktop");
    page.getByTestId("login-button-desktop");

    // 5️⃣ XPath — último recurso, frágil.
    page.locator('//button[@data-testid="login-button-desktop"]');
  });

  // ──────────────────────────────────────────────────────────
  // BLOQUE B — Catálogo (requiere login primero)
  // ──────────────────────────────────────────────────────────
  test.skip("locators in the catalog", async ({ page }) => {
    // Login mínimo para llegar al catálogo
    await page.goto("/");
    await page.getByTestId("market-MX").click();
    await page.getByTestId("username-desktop").fill("standard_user");
    await page.getByTestId("password-desktop").fill("pizza123");
    await page.getByTestId("login-button-desktop").click();
    await expect(page).toHaveURL(/\/catalog/);

    // 1️⃣ getByRole con distintos roles y atributos
    page.getByRole("textbox", { name: "Busca tu pizza favorita..." }); // ✅ el buscador (nombre accesible = su placeholder)
    page.getByRole("link", { name: "Catálogo" }); //     ✅ los enlaces del menú tienen rol "link"
    page.getByRole("button", { name: "Populares" }); //  ✅ botón de categoría
    page.getByRole("heading", { name: "Pepperoni", level: 3 }); // ✅ cada pizza es un <h3>

    // getByPlaceholder — el mismo buscador, por placeholder
    page.getByPlaceholder("Busca tu pizza favorita...");

    // getByAltText — localiza IMÁGENES por su atributo alt
    page.getByAltText("Pepperoni"); //                   ✅ la foto de la pizza Pepperoni

    // 4️⃣ CSS con prefijo — testids dinámicos (legítimo, ver README)
    const pizzaCards = page.locator('[data-testid^="pizza-card-"]'); // pizza-card-123, pizza-card-456...

    // Filtros y combinadores (encadenables sobre cualquier locator)
    pizzaCards.first(); //                               la primera tarjeta
    pizzaCards.nth(2); //                                la tercera (índice base 0)
    pizzaCards.filter({ hasText: "Pepperoni" }); //      sólo las tarjetas que contengan ese texto
    page.getByRole("heading", { level: 3 }).filter({ hasText: "Quesos" }); // → "Cuatro Quesos"
  });
});
```
