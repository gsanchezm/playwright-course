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
