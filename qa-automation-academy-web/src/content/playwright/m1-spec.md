# El spec paso a paso

## Paso 7 — Crear tu primer spec file

Ahora sí, **el código del módulo**. Crea la carpeta y el archivo:

```bash
# 1. Crea la carpeta del módulo (si no existe)
mkdir -p modulo-01-smoke-feo

# 2. Crea el archivo del spec
touch modulo-01-smoke-feo/ejemplo.spec.ts
```

Abre `modulo-01-smoke-feo/ejemplo.spec.ts` en VS Code y **escribe esto exactamente** (no copies y pegues a ciegas — escribirlo a mano fija la sintaxis):

```ts
import { test, expect } from "@playwright/test";

// Credenciales leídas de .env (gracias a dotenv en playwright.config.ts)
const USERNAME = process.env.TEST_USER_USERNAME ?? "standard_user";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "pizza123";

test.describe("Smoke OmniPizza — versión fea (M01)", () => {
  test("TC-001 — login exitoso con usuario válido @smoke", async ({ page }) => {
    // Paso 1 — abrir la pantalla de login
    await page.goto("/");

    // Paso 2 — seleccionar mercado (MX)
    await page.getByTestId("market-MX").click();

    // Paso 3 — llenar credenciales
    await page.getByTestId("username-desktop").fill(USERNAME);
    await page.getByTestId("password-desktop").fill(PASSWORD);

    // Paso 4 — enviar formulario
    await page.getByTestId("login-button-desktop").click();

    // Resultado esperado — aterrizar en el catálogo
    await expect(page).toHaveURL(/\/catalog/);
  });
});
```

**Anatomía línea por línea:**

| Línea | Concepto |
|---|---|
| `import { test, expect } from "@playwright/test"` | El runner y la librería de aserciones |
| `process.env.TEST_USER_USERNAME ?? "standard_user"` | `dotenv` cargó esto; el `??` es el fallback si falta |
| `test.describe(...)` | Suite — agrupa varios `test()` con un nombre común |
| `test("TC-001 — ...", async ({ page }) => {...})` | Un caso de prueba; `page` es la pestaña inyectada por Playwright |
| `await page.goto("/")` | Concatena con `baseURL` del config → `https://omnipizza-frontend.onrender.com/` |
| `await page.getByTestId(...)` | Locator nivel 3 de la jerarquía (M02 explica los otros niveles) |
| `await expect(page).toHaveURL(/\/catalog/)` | Aserción con regex; Playwright espera automáticamente |

**Verifica que compila** antes de ejecutarlo:

```bash
pnpm exec tsc --noEmit
# Sin output = sin errores = puedes correr el test.
```

> 📌 **Nota sobre el spec del repo:** el archivo `ejemplo.spec.ts` que ya viene en el curso es **más completo** — incluye un `test.beforeAll` para warmup del backend dormido y un `TC-002` para validar el catálogo. **No te lo entrego completo aquí a propósito**: la idea del Paso 9 es que escribas TC-002 a mano y **sientas la duplicación** entre los dos tests. Si quieres el archivo final ya hecho, ábrelo desde el repo.

---

## Paso 8 — Ejecutar el ejemplo

Tres formas de correrlo, en orden de utilidad pedagógica:

```bash
# A) UI mode — RECOMENDADO para la primera vez (ves cada paso en vivo)
pnpm test:ui

# B) Modo headed — abre el navegador real, sin UI mode
pnpm exec playwright test modulo-01-smoke-feo --headed --project=ui-chromium

# C) Headless — la forma rápida (sin ventana)
pnpm m1
```

**Qué debería pasar:**

1. La primera vez tarda 30-40 segundos (cold start de OmniPizza en Render free tier).
2. Verás **2 tests verdes**: `TC-001` y `TC-002`.
3. Si te falla con `TimeoutError` en el primer test, **vuelve a correr el comando** — el backend ya estará despierto.

---

## Paso 9 — Observar el dolor (lectura guiada de 5 min)

Abre `ejemplo.spec.ts` y **señala con el dedo**:

1. **Líneas duplicadas entre TC-001 y TC-002:**
   - `page.goto("/")` — repetida.
   - `page.getByTestId("market-MX").click()` — repetida.
   - `fill(USERNAME)` y `fill(PASSWORD)` — repetidas.
   - `click()` en `login-button-desktop` — repetido.
   - `expect(page).toHaveURL(/\/catalog/)` — repetido.
2. **Locators inline** — el string `"market-MX"` está hardcoded; no hay un "objeto LoginPage" que lo encapsule.
3. **El warmup del backend** vive dentro del mismo spec (`beforeAll`) — en M04 esto se convierte en un `setup project` reutilizable.
4. **Las credenciales** se leen con `process.env.TEST_USER_USERNAME ?? "standard_user"` — el fallback existe por seguridad, pero **la fuente real es `.env`**.

**Pregúntate:** *"si añadiera un tercer smoke, ¿cuántas líneas duplicaría?"* — la respuesta es **~8**. Esa es la deuda que M02 y M03 van a pagar.

---

## Código completo de `ejemplo.spec.ts`

```ts
// @file modulo-01-smoke-feo/ejemplo.spec.ts
// ============================================================
// M01 — Smoke "feo" contra OmniPizza live
// ============================================================
// Objetivo pedagógico: que duela.
//
// - Locators inline en cada test.
// - Login duplicado.
// - Mercado hardcoded.
// - No hay POM, ni fixtures, ni data-driven.
//
// En M02 parametrizaremos. En M03 refactorizaremos a POM.
// ============================================================

import { test, expect } from "@playwright/test";

// Credenciales leídas de .env (M01 ya enseña secrets desde día 1).
const USERNAME = process.env.TEST_USER_USERNAME ?? "standard_user";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "pizza123";

test.describe("Smoke OmniPizza — versión fea (M01)", () => {
  // beforeAll de warmup: OmniPizza vive en Render free tier y el
  // primer request del día tarda 30-40s (cold start). En M04
  // reemplazaremos esto por un `auth.setup.ts` project.
  test.beforeAll(async ({ request }) => {
    await request.get(`${process.env.API_URL}/health`).catch(() => {
      // Si /health no responde aún, el primer navigate lo despertará igual.
    });
  });

  test("TC-001 — login exitoso con usuario válido @smoke", async ({ page }) => {
    // Paso 1 — abrir la pantalla de login
    await page.goto("/");

    // Paso 2 — seleccionar mercado (MX)
    await page.getByTestId("market-MX").click();

    // Paso 3 — llenar credenciales
    await page.getByTestId("username-desktop").fill(USERNAME);
    await page.getByTestId("password-desktop").fill(PASSWORD);

    // Paso 4 — enviar formulario
    await page.getByTestId("login-button-desktop").click();

    // Resultado esperado — aterrizar en el catálogo
    await expect(page).toHaveURL(/\/catalog/);
  });

  test("TC-002 — catálogo muestra al menos 1 pizza @smoke", async ({ page }) => {
    // Paso 1 — abrir login (OTRA VEZ)
    await page.goto("/");

    // Paso 2 — seleccionar mercado (DUPLICADO)
    await page.getByTestId("market-MX").click();

    // Paso 3 — llenar credenciales (DUPLICADO)
    await page.getByTestId("username-desktop").fill(USERNAME);
    await page.getByTestId("password-desktop").fill(PASSWORD);

    // Paso 4 — enviar (DUPLICADO)
    await page.getByTestId("login-button-desktop").click();

    // Paso 5 — esperar catálogo (DUPLICADO)
    await expect(page).toHaveURL(/\/catalog/);

    // Paso 6 — nuevo: verificar que hay pizzas
    const pizzaCards = page.locator('[data-testid^="pizza-card-"]');
    await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 });
    const count = await pizzaCards.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ============================================================
// Nota para el alumno:
//
// Cuenta las líneas que se repiten entre TC-001 y TC-002:
//   - page.goto("/")
//   - getByTestId("market-MX").click()
//   - fill de username / password
//   - click de login-button
//   - expect URL /catalog
//
// Son ~6 líneas por test × N tests futuros.
// Esa es la duplicación que vas a matar en M03.
// ============================================================
```
