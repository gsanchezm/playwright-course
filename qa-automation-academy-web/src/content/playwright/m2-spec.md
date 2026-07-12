# El spec paso a paso

Esta página cubre la parte de **lectura y ejecución del ejemplo** de M02: correr el smoke de un mercado, leer cada locator del login/catálogo justificando su **nivel** en la jerarquía, y escanear la chuleta viva de locators. Al final tienes el código completo de `ejemplo.spec.ts`.

---

## Paso 3 — Ejecutar el smoke

```bash
# Headless — el smoke de UN mercado (MX), con la jerarquía aplicada
pnpm m2

# UI mode — RECOMENDADO la primera vez
pnpm test:ui
```

**Qué debería pasar:**

- La terminal muestra **1 test verde** (`TC-001`) y **2 skipped** (los bloques de referencia `test.skip`).
- La 1ª corrida puede tardar ~30-40s por el cold start de Render.
- Los dos bloques `test.skip` **no se ejecutan** — aparecen como *skipped* en el reporte: son una chuleta, no un caso de prueba.

---

## Paso 4 — Lectura guiada del smoke aplicando la jerarquía

Abre `ejemplo.spec.ts` y lee el bloque de login fijándote en **por qué** cada línea usa el locator que usa:

```ts
await page.goto("/");
await page.getByTestId("market-MX").click();                 // testid: bandera icon-only (nombre accesible = emoji)
await page.getByTestId("username-desktop").fill(USERNAME);    // testid: input SIN <label> ni aria-label
await page.getByTestId("password-desktop").fill(PASSWORD);    // testid: mismo caso
await page.getByRole("button", { name: "Sign In" }).click();  // role: el botón SÍ expone su rol → nivel 1
await expect(page).toHaveURL(/\/catalog/);
```

El login de OmniPizza es el ejemplo canónico de "misma pantalla, dos niveles": los inputs y la bandera **obligan** a `getByTestId`, pero el botón "Sign In" **sí** coopera con `getByRole`. Elegir el nivel correcto por elemento es toda la lección de M02.

Luego el bloque del catálogo:

```ts
const pizzaCards = page.locator('[data-testid^="pizza-card-"]');
await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 });
expect(await pizzaCards.count()).toBeGreaterThan(0);
```

Las cards tienen testids **dinámicos** (`pizza-card-123`, `pizza-card-456`…), así que un `getByTestId` con id fijo sería frágil. Bajar al nivel 4 (CSS con prefijo `^=`) es la herramienta correcta, no deuda técnica.

Varias de esas líneas se leen "de pasada" pero esconden una decisión de diseño. Si las cambias por la alternativa "obvia", el test se rompe o pierdes robustez:

> 🔍 **Detalle que parece obvio — `getByRole("button", { name: "Sign In" })` (y no `getByTestId`)**
> **Qué es:** para el botón de login sí usamos `getByRole` (nivel 1), aunque para los inputs de arriba bajamos a `getByTestId` (nivel 3). No es incoherencia: es la jerarquía aplicada elemento por elemento.
> **Por qué así (y no la alternativa obvia):** el botón expone un **rol accesible** (`button`) con un **nombre accesible** legible ("Sign In"), así que el nivel más alto de la jerarquía funciona. Los inputs no tienen `<label>` ni `aria-label`, así que `getByRole("textbox", { name: "Username" })` **no matchea nada** — su nombre accesible saldría del placeholder, no del `<div>` "Username" de al lado.
> **Qué pasa si lo cambias:** si fuerzas `getByRole` en los inputs, el test falla por "no encontró el elemento". Si bajas el botón a `getByTestId("login-button-desktop")` funciona, pero desperdicias un locator role-first perfectamente bueno (y más resiliente al cambio de idioma/copy).

> 🔍 **Detalle que parece obvio — `await expect(page).toHaveURL(/\/catalog/)`**
> **Qué es:** el argumento entre `/.../` es una **expresión regular** (regex), **no** un string, y eso es deliberado. Un regex hace *match parcial*: la aserción pasa si la URL **contiene** `/catalog` en cualquier parte. Un string, en cambio, exige que la URL sea **exactamente** ese valor.
> **Por qué así (y no la alternativa obvia):** OmniPizza puede añadir cosas a la URL —querystring (`?locale=`), el locale dentro del path (`/mx/catalog`) o un slash final— y el regex tolera todo eso. El `\/` escapa la barra `/` porque en un literal regex de JS la `/` es el **delimitador** que abre y cierra la expresión; sin escaparla, el motor creería que el regex terminó ahí.
> **Qué pasa si lo cambias:** si pones el string `"/catalog"`, Playwright lo **resuelve contra `baseURL` con `new URL("/catalog", baseURL)`** y compara por **IGUALDAD exacta** de la URL resultante. Como la URL real es algo como `https://.../catalog?...` (o `/mx/catalog`), nunca será literalmente `https://.../catalog` y el test **truena** con un timeout de aserción. Por eso aquí el regex (parcial, robusto) gana al string (igualdad, frágil).

> 🔍 **Detalle que parece obvio — `page.locator('[data-testid^="pizza-card-"]')`**
> **Qué es:** un CSS selector con el operador de atributo `^=`, que significa **"el atributo empieza con"**. Aquí matchea cualquier elemento cuyo `data-testid` arranque con `pizza-card-`.
> **Por qué así (y no la alternativa obvia):** los testids completos son dinámicos (`pizza-card-123`, `pizza-card-456`…), así que un `getByTestId("pizza-card-123")` con id fijo sólo encontraría una pizza concreta (frágil) o ninguna. Bajar al nivel 4 de la jerarquía (la tabla está en la guía del módulo) es **legítimo** justamente por eso. En el login, en cambio, un CSS NO sería legítimo: ahí los testids son estables.
> **Qué pasa si lo cambias:** si usas `=` en vez de `^=` (`[data-testid="pizza-card-"]`), exiges igualdad exacta y no matcheas **ninguna** tarjeta.

---

## Paso 5 — Practica combinadores, filtros y scoping

Con el catálogo abierto (en UI mode o en Codegen), practica las técnicas de la sección **Combinadores y filtros** de la guía y del **Bloque B** del `test.skip`: `.first()`, `.nth(2)`, `.filter({ hasText: "Pepperoni" })`, y el **scoping** `card.getByRole("button")`.

Un `getByRole("heading", { level: 3 })` matchea **todas** las pizzas — un *locator de muchos*. Estrechar por texto o por contexto (scoping) es lo que mantiene `getByRole` vivo en listas repetidas, sin caer a un `nth-child` posicional. El objetivo: tomar "todas las pizzas" y llegar a "exactamente Pepperoni" usando sólo `role` + `.filter`, y llegar a su botón add-to-cart acotando por la card.

---

## Paso 6 — Catálogo de locators (lectura, no ejecución)

Al final de `ejemplo.spec.ts` hay dos bloques `test.skip` (uno para la pantalla de login y otro para el catálogo). **No se ejecutan**, son una **referencia visual** de cada nivel de la jerarquía con selectores reales de OmniPizza (`getByRole({ name: "Sign In" })`, `getByPlaceholder("standard_user")`, `getByTestId("login-button-desktop")`, `getByAltText("Pepperoni")`, `[data-testid^="pizza-card-"]`) — escanéalos, los vas a copiar para el reto.

En esa chuleta los locators se **encadenan** (`pizzaCards.first()`, `pizzaCards.nth(2)`, `pizzaCards.filter({ hasText: "Pepperoni" })`...):

> 🔷 **TypeScript — encadenamiento de métodos (fluent API)**
> `page.locator(...).filter(...).getByRole(...)` es una **cadena fluida**: cada método devuelve otro `Locator`, así que puedes seguir encadenando. TS te da autocompletado en cada eslabón porque conoce el tipo de retorno (`Locator`) en todo momento. Si un método devolviera `Promise<Locator>` (como `.all()`), la cadena se cortaría hasta que hagas `await`.
> 📚 Es la misma idea de métodos que retornan `this`/un tipo encadenable que viste en [TS · M05 — Clases](/docs/typescript/m5-base-page). Aquí lo aplicas para estrechar locators sin variables intermedias.

---

## Código completo — `ejemplo.spec.ts`

```ts
// @file modulo-02-locators/ejemplo.spec.ts
// ============================================================
// M02 — Locators jerárquicos (smoke de UN mercado)
// ============================================================
// Avance sobre M01: el MISMO smoke de login + catálogo, pero
// ahora aplicando la JERARQUÍA de locators a conciencia:
//   · getByRole donde OmniPizza coopera (el botón "Sign In").
//   · getByTestId donde NO coopera (inputs sin <label>, banderas
//     icon-only cuyo nombre accesible es el emoji).
//   · CSS con prefijo para las cards (sus testids son dinámicos).
//
// Sigue siendo UN mercado hardcoded (MX). La parametrización por
// los 5 mercados con datos tipados (data/ + types/ + for...of)
// llega en M03 (data-driven).
// ============================================================

import { test, expect } from "@playwright/test";

// Credenciales leídas de .env (dotenv en playwright.config.ts).
const USERNAME = process.env.TEST_USER_USERNAME ?? "standard_user";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "pizza123";

test.describe("Smoke con jerarquía de locators (M02)", () => {
  test("TC-001 — login + catálogo aplicando la jerarquía @smoke", async ({ page }) => {
    // --- PASO 1: Login ---
    await page.goto("/");

    // Bandera de mercado: es un <button> cuyo nombre accesible es el
    // emoji 🇲🇽 (no "México") → getByRole no ayuda; bajamos a testid.
    await page.getByTestId("market-MX").click();

    // Inputs sin <label> ni aria-label → getByRole/getByLabel FALLAN.
    // El nivel correcto de la jerarquía aquí es getByTestId.
    await page.getByTestId("username-desktop").fill(USERNAME);
    await page.getByTestId("password-desktop").fill(PASSWORD);

    // El botón de login SÍ expone su rol accesible → aquí SÍ usamos
    // getByRole (nivel 1). Ojo: su texto es "Sign In", NO "Login".
    await page.getByRole("button", { name: "Sign In" }).click();

    // --- PASO 2: Validar que llegamos al catálogo ---
    // El argumento es un REGEX (match PARCIAL, robusto): pasa si la
    // URL CONTIENE "/catalog" — tolera ?query, locale o slash final.
    await expect(page).toHaveURL(/\/catalog/);

    // --- PASO 3: Localizar las pizzas del catálogo ---
    // Catálogo bien instrumentado, pero los testids de las cards son
    // DINÁMICOS (pizza-card-123, pizza-card-456...) → CSS con prefijo
    // `^=` ("empieza con"), nivel 4 legítimo. Ver la chuleta de abajo.
    const pizzaCards = page.locator('[data-testid^="pizza-card-"]');
    await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 });
    expect(await pizzaCards.count()).toBeGreaterThan(0);
  });
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
