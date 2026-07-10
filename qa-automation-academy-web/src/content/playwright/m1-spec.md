# El spec paso a paso

## Paso 7 — Crear tu primer spec file

Ahora sí, **el código del módulo**. Crea la carpeta y el archivo:

```bash
# 1. Crea la carpeta del módulo (si no existe)
mkdir modulo-01-smoke-feo

# 2. Crea y abre el archivo del spec en VS Code (se crea al guardar)
code modulo-01-smoke-feo/ejemplo.spec.ts
```

Abre `modulo-01-smoke-feo/ejemplo.spec.ts` en VS Code y **escribe esto exactamente** (no copies y pegues a ciegas — escribirlo a mano fija la sintaxis):

```ts
import { test, expect } from "@playwright/test";

// Credenciales leídas de .env (gracias a dotenv en playwright.config.ts)
const USERNAME = process.env.TEST_USER_USERNAME ?? "standard_user";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "pizza123";

test.describe("Smoke OmniPizza — ugly version (M01)", () => {
  test("TC-001 — successful login with valid user @smoke", async ({ page }) => {
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

> 🔷 **TypeScript — anotación de tipo `string` (por inferencia)**
> `USERNAME` y `PASSWORD` son de tipo `string` **sin que escribas `: string`**: TypeScript lo **infiere** porque `process.env.X` es `string | undefined` y el `?? "literal"` garantiza un `string`. Podrías anotarlo explícito (`const USERNAME: string = …`), pero aquí la inferencia es suficiente y más limpia.
> 📚 Lo viste en [TS · M02 — Types](/docs/typescript/m2-strings). Aquí lo aplicas: pasarás estos `string` a `.fill(...)`, que **espera** un `string`.

> 🔷 **TypeScript — `async` / `await` y `Promise` (intro)**
> `.click()`, `.fill()` y `expect(...)` devuelven una **`Promise`** (una operación que terminará *después*). El `await` delante de cada una **pausa** hasta que se resuelve, así el orden real de ejecución coincide con el orden que lees. Una función marcada `async` es la única donde puedes usar `await`.
> 📚 Lo viste en [TS · M03 — Functions](/docs/typescript/m3-login). Aquí lo aplicas a **cada** acción y aserción del spec.

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

> 🔍 **Detalle que parece obvio — `await page.goto("/")`**
> **Qué es:** abre el navegador en la **ruta raíz** del sitio; la `/` sola se concatena con el `baseURL` del config (lo acabas de ver en la anatomía).
> **Por qué así (y no la alternativa obvia):** poner solo `/` deja el host en **un único lugar** (el config). El día que el frontend cambie de URL (staging, otro dominio, otro puerto), tocas una línea en el config y **todos los specs siguen funcionando**.
> **Qué pasa si lo cambias:** si hardcodeas `page.goto("https://omnipizza-frontend.onrender.com/")` el test funciona igual hoy… pero esa URL queda regada por cada spec. Multiplica por 50 tests y un cambio de dominio se vuelve un *find & replace* frágil. Además ignora el `baseURL`, así que `--config` o un override por entorno dejan de tener efecto.

> 🔍 **Detalle que parece obvio — `await page.getByTestId("market-MX").click()` (el `await` de cada línea)**
> **Qué es:** el `await` delante de **cada acción y cada aserción** del spec. Playwright es **asíncrono**: `.click()`, `.fill()` y `expect(...)` devuelven una *promesa* (una operación que terminará *después*); el `await` pausa hasta que se resuelve.
> **Por qué así (y no la alternativa obvia):** sin `await`, la promesa se dispara pero **nadie la espera**. El runner sigue a la siguiente línea antes de que el click ocurra, y el orden real de ejecución deja de coincidir con el orden que lees.
> **Qué pasa si lo cambias:** quitar el `await` produce el peor de los bugs de QA: un test que **pasa o falla de forma engañosa**. Una aserción sin `await` (`expect(page).toHaveURL(...)`) puede reportar verde sin haber comprobado nada, porque la promesa quedó pendiente y el test terminó antes. Es un falso positivo silencioso.

> 🔍 **Detalle que parece obvio — `await page.getByTestId("login-button-desktop").click()`**
> **Qué es:** el spec localiza el botón de login por su **test id** (`data-testid="login-button-desktop"`), no por su rol accesible (`getByRole("button", { name: "Sign In" })`).
> **Por qué así (y no la alternativa obvia):** ya conoces las dos analogías de los Conceptos JIT de la guía (el sticker que el dev puso vs el lector de pantalla): el test id es **estable aunque cambie el texto o el idioma** del botón; `getByRole(..., { name })` depende del **texto visible**, y el `name` es lo que cambia todo — si el botón pasa de "Sign In" a "Iniciar sesión", el `getByRole` rompe y el `getByTestId` no.
> **Qué pasa si lo cambias:** migrar a `getByRole` te acerca a probar accesibilidad real (bueno), pero acoplas el test al copy de la UI. En M02 verás la jerarquía de locators completa; en M01 usamos `getByTestId` porque OmniPizza ya trae esos ids y queremos que el smoke sea inmune al texto.

**Verifica que compila** antes de ejecutarlo:

```bash
pnpm exec tsc --noEmit
# Sin output = sin errores = puedes correr el test.
```

> 📌 **Nota sobre el spec del repo:** el archivo `ejemplo.spec.ts` que ya viene en el curso es **más completo** — incluye un `TC-002` para validar el catálogo. **No te lo entrego completo aquí a propósito**: la idea del Paso 9 es que escribas TC-002 a mano y **sientas la duplicación** entre los dos tests. Si quieres el archivo final ya hecho, ábrelo desde el repo. (No hay `beforeAll` de warmup: el cold start de Render lo absorben los timeouts generosos del config.)

---

## Paso 8 — Ejecutar el ejemplo

Tres formas de correrlo, en orden de utilidad pedagógica:

```bash
# A) UI mode — RECOMENDADO para la primera vez (ves cada paso en vivo)
pnpm test:ui

# B) Modo headed — abre el navegador real, sin UI mode
pnpm exec playwright test modulo-01-smoke-feo --headed --project=ui-anon

# C) Headless — la forma rápida (sin ventana)
pnpm m1
```

**Qué debería pasar:**

1. La primera vez tarda 30-40 segundos (cold start de OmniPizza en Render free tier).
2. Verás **2 tests verdes**: `TC-001` y `TC-002`.
3. Si te falla con `TimeoutError` en el primer test, **vuelve a correr el comando** — el backend ya estará despierto.

### Depurar paso a paso con `--debug` (Playwright Inspector)

Cuando un locator no encuentra nada o quieres ver **qué hace cada `await`**, corre el smoke en modo depuración:

```bash
pnpm exec playwright test modulo-01-smoke-feo --project=ui-anon --debug
# (o el atajo del curso: pnpm test:debug)
```

Se abre el **Playwright Inspector** (una ventana aparte) junto al navegador. `--debug` **pausa** la ejecución antes de cada acción y resalta en el navegador **el locator exacto** que Playwright va a usar. Usa **▶ (Resume)** para avanzar entre acciones y **⤼ (Step over)** para ejecutar **una sola** línea a la vez. Cada `await` es el "breakpoint" implícito donde puedes detenerte: ves en vivo si el selector matchea 0, 1 o varios elementos, sin adivinar. Además puedes editar y probar locators en el panel del Inspector.

### Abrir el HTML report (`show-report`)

Después de una corrida (con `pnpm m1`, no con UI mode), abre el reporte HTML:

```bash
pnpm exec playwright show-report
# (o el atajo del curso: pnpm report)
```

Se abre en el navegador en `http://localhost:9323`. El config genera el reporter `html` (lo dejaste en el Paso 4); es el **artefacto compartible** del resultado: en CI (M06) lo subiremos como artifact para que el equipo lo revise sin re-correr nada. Click en un test → verás sus **pasos** expandibles, y si falló, su **trace** (el **Trace Viewer**: timeline, snapshot del DOM por acción, network y consola), **screenshot** y **video**. Si dice *"No report found"*, corre primero `pnpm m1`.

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
3. **El cold start de Render** lo absorben los **timeouts generosos del config** — sin warmup explícito en el spec. En M04 el backend se despertará de forma controlada con un `auth.setup.ts` reutilizable (que además guardará la sesión).
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

test.describe("Smoke OmniPizza — ugly version (M01)", () => {
  // Nota: OmniPizza vive en Render free tier y el primer request del
  // día tarda 30-40s (cold start). NO hacemos warmup explícito: los
  // timeouts generosos del playwright.config.ts lo absorben. En M04 el
  // backend se despierta de forma controlada con un `auth.setup.ts`.

  test("TC-001 — successful login with valid user @smoke", async ({ page }) => {
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

  test("TC-002 — catalog shows at least 1 pizza @smoke", async ({ page }) => {
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

> 🔍 **Detalle que parece obvio — `await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 })`** (el Paso 6 de TC-002)
> **Qué es:** la espera de que la primera card de pizza aparezca. Fíjate que **no hay ningún `sleep()` ni `waitForTimeout()`** en todo el spec — solo un `timeout` como opción de la aserción.
> **Por qué así (y no la alternativa obvia):** Playwright tiene **auto-waiting**: `toBeVisible()` reintenta en bucle hasta que la condición se cumple o se agota el timeout. Aquí subimos el timeout a 30s **por el cold start de Render**, no para "dar tiempo a que cargue" a ciegas.
> **Qué pasa si lo cambias:** si lo reemplazas por `await page.waitForTimeout(30000)` esperas **siempre** 30 segundos completos aunque la card aparezca en 2 — tests lentos. Y si pones un sleep corto (`waitForTimeout(2000)`) en un día de cold start, la card aún no existe y el test **falla intermitente** (flaky). El auto-waiting espera *lo justo*: sigue en cuanto la condición se cumple.
