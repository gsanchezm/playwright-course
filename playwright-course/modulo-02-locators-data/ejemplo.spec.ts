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
  // La app japonesa renderiza el yen FULL-WIDTH ￥ (U+FFE5) vía
  // Intl.NumberFormat('ja-JP'), NO el half-width ¥ (U+00A5).
  JPY: "￥",
};

test.describe("Smoke parametrizado por mercado (M02)", () => {
  // OJO: Playwright NO tiene `test.each()` (eso es de Jest/Vitest).
  // Para parametrizar, un `for` recorre el array y REGISTRA un
  // `test()` por dato → 4 TCs independientes (TC-MX, TC-US, ...),
  // no un test que itera por dentro.
  for (const market of markets) {
    test(`TC-${market.code} — login + catálogo en mercado ${market.code} @smoke`, async ({ page }) => {
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

test.describe("Referencia — jerarquía de locators", () => {
  // ──────────────────────────────────────────────────────────
  // BLOQUE A — Pantalla de login (no requiere autenticación)
  // ──────────────────────────────────────────────────────────
  test.skip("locators en la pantalla de login", async ({ page }) => {
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
  test.skip("locators en el catálogo", async ({ page }) => {
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
