// ============================================================
// 🚩 Reto M01 — TC-003: filtrar por categoría "popular"
// ============================================================
// Objetivo pedagógico: que SIENTAS la duplicación.
//
// Vas a escribir un tercer smoke que repite ~8 líneas de TC-001
// y TC-002 (`ejemplo.spec.ts`). NO intentes refactorizar — el dolor
// es el ejercicio. En M04 destruiremos esta duplicación con POM.
// ============================================================
//
// 🧰 Pre-requisitos antes de empezar:
//   ✔ pnpm install               → dotenv + playwright instalados
//   ✔ pnpm exec playwright install → navegadores descargados
//   ✔ cp .env.example .env       → archivo .env creado
//   ✔ pnpm m1                    → TC-001 y TC-002 corren en verde
// ============================================================
//
// ▶ Cómo correr SOLO este reto:
//   pnpm exec playwright test tests/reto.spec.ts --headed --project=ui-anon
//
//   (o con UI mode, recomendado para depurar paso a paso:)
//   pnpm test:ui
// ============================================================

import { test, expect } from "@playwright/test";

// Las credenciales viajan vía dotenv → process.env (ver
// playwright.config.ts: `import "dotenv/config"`).
// El `??` es un fallback por si alguien corre sin .env.
const USERNAME = process.env.TEST_USER_USERNAME ?? "standard_user";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "pizza123";

test.describe("Smoke Challenge M01", () => {
  test("TC-003 — the 'popular' category filters pizzas @smoke", async ({
    page,
  }) => {
    // ────────────────────────────────────────────────────────
    // TODO 1 — Navegar a la pantalla de login
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Abrir la URL base (`/`). Playwright concatena con
    //   `baseURL` definido en `playwright.config.ts`.
    //
    // Pista:
    //   await page.goto("/");
    //
    // Cómo verificar (UI mode):
    //   El navegador muestra la pantalla "Choose your market".


    // ────────────────────────────────────────────────────────
    // TODO 2 — Seleccionar el mercado MX
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Click sobre la bandera/botón del mercado México.
    //
    // Pista:
    //   await page.getByTestId("market-MX").click();
    //
    // Cómo verificar (UI mode):
    //   Aparece el formulario de login (campos username / password).


    // ────────────────────────────────────────────────────────
    // TODO 3 — Rellenar credenciales y hacer login
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Tres acciones, en este orden:
    //     1) fill en el input de username (testid: username-desktop)
    //        con la variable USERNAME.
    //     2) fill en el input de password (testid: password-desktop)
    //        con la variable PASSWORD.
    //     3) click en el botón submit (testid: login-button-desktop).
    //
    // Pistas:
    //   await page.getByTestId("username-desktop").fill(USERNAME);
    //   await page.getByTestId("password-desktop").fill(PASSWORD);
    //   await page.getByTestId("login-button-desktop").click();
    //
    // Cómo verificar (UI mode):
    //   La URL del navegador cambia a algo que contiene "/catalog".


    // ────────────────────────────────────────────────────────
    // TODO 4 — Esperar a estar en /catalog (resultado del login)
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Aserción con expect → la URL debe contener "/catalog".
    //   Playwright espera automáticamente (auto-waiting), NO uses sleep.
    //
    // Pista:
    //   await expect(page).toHaveURL(/\/catalog/);
    //
    // Cómo verificar:
    //   Si tras 30s la URL aún no coincide, el test falla con timeout
    //   (cold start de Render — vuelve a correr una segunda vez).


    // ────────────────────────────────────────────────────────
    // TODO 5 — Click sobre la categoría "popular"
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   En la barra de categorías superior, click en el chip "popular".
    //
    // Pista:
    //   await page.getByTestId("category-popular").click();
    //
    // Cómo verificar (UI mode):
    //   El grid de pizzas se actualiza visualmente (puede mostrar
    //   un loader breve).


    // ────────────────────────────────────────────────────────
    // TODO 6 — Verificar que tras filtrar SÍ hay pizzas visibles
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   1) Crear un locator que matchee CUALQUIER card que empiece
    //      con `pizza-card-` (selector con `^=`).
    //   2) Esperar a que la primera card esté visible (con timeout
    //      generoso por el cold start).
    //   3) Contar las cards y asegurar que hay > 0.
    //
    // Pistas:
    //   const pizzaCards = page.locator('[data-testid^="pizza-card-"]');
    //   await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 });
    //   const count = await pizzaCards.count();
    //   expect(count).toBeGreaterThan(0);
    //
    // Criterio de éxito:
    //   El test termina en VERDE. En la terminal verás:
    //     ✓ TC-003 — la categoría 'popular' filtra pizzas @smoke
  });
});

// ============================================================
// 📝 Reflexión final — responde mentalmente:
// ============================================================
//
//   1. ¿Cuántas líneas de este reto son IDÉNTICAS a TC-001 o TC-002
//      del `ejemplo.spec.ts`? (cuéntalas literalmente)
//
//   2. ¿Cuánto tiempo tardaste en escribirlas? ¿Las copiaste-pegaste
//      o las reescribiste?
//
//   3. Si tuvieras que añadir 10 smokes más (TC-004 … TC-013),
//      ¿cuánto tiempo perderías repitiendo esas mismas ~8 líneas?
//
// Guarda la respuesta — en M04 (POM) la vamos a medir en concreto.
// Pista de lo que viene: en M04 estas ~8 líneas se vuelven 1 sola:
//     await loginPage.loginInMarket(standardUser, "MX");
// ============================================================
