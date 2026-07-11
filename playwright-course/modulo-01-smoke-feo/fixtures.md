# Fixtures en Playwright — la guía corta de M01

> 📌 **Por qué este archivo vive en M01:**
> El README dice que en este módulo **no hay fixtures**. Es una mentira piadosa. Mira tu `ejemplo.spec.ts`:
>
> ```ts
> test("TC-001 ...", async ({ page }) => { ... });
> ```
>
> Ese `{ page }` que recibes en cada test **es un fixture**. Lo que aún no tienes son fixtures **propios** (esos llegan en M05). Antes de llegar ahí, conviene entender qué es lo que ya estás usando sin darte cuenta.

---

## 1. ¿Qué es un fixture? — la analogía QA

Imagina que cada caso de prueba manual tuviera **un kit listo sobre el escritorio antes de empezar**:

- Navegador abierto en la URL de QA ✅
- Usuario de pruebas ya logueado ✅
- Base de datos con datos semilla cargados ✅
- Al terminar el TC, alguien recoge el kit y lo deja limpio para el siguiente ✅

Ese kit, **preparado antes y desmontado después**, es un **fixture**. En Playwright es código que:

1. Se ejecuta **antes** del test → te entrega un objeto listo para usar.
2. Te lo **inyecta** como parámetro (lo recibes en `async ({ aquí }) => { ... }`).
3. Se ejecuta **después** del test → limpia lo que haya quedado (cierra el navegador, borra cookies, etc).

| Concepto Playwright | Equivalente del tester manual |
|---|---|
| Fixture `page` | Pestaña nueva del navegador, ya abierta |
| Fixture `browser` | La instancia del navegador (Chrome) que comparte todo el worker |
| Fixture `context` | Una sesión incógnito (cookies aisladas) |
| Fixture `request` | Postman embebido para llamadas API sin UI |
| Tu fixture custom `loginPage` (M04+M05) | Page Object inyectado ya construido |
| Tu fixture custom `authenticatedPage` (M05) | Página YA logueada antes de empezar el test |

---

## 2. Los fixtures **built-in** que Playwright te regala

Playwright trae varios fixtures ya hechos. Estos son los más usados:

| Fixture | Tipo | Para qué sirve | ¿En M01 lo usas? |
|---|---|---|---|
| `page` | `Page` | Una pestaña del navegador, aislada por test | ✅ Sí, en TC-001 y TC-002 |
| `request` | `APIRequestContext` | Cliente HTTP (GET/POST/etc) sin navegador | ❌ Aún no (lo usarás en M07, API layer) |
| `context` | `BrowserContext` | Sesión incógnita (cookies/storage propios) | ❌ Aún no (M04/M05) |
| `browser` | `Browser` | La instancia del navegador para todo el worker | ❌ Aún no |
| `browserName` | `'chromium' \| 'firefox' \| 'webkit'` | El nombre del navegador actual (para condicionales) | ❌ Aún no |
| `playwright` | objeto | Acceso al módulo Playwright completo (raro) | ❌ Aún no |

> 💡 **Atajo mental:** si en una firma de test ves `async ({ algo }) => {...}`, ese `algo` **es un fixture**. Playwright mira el nombre exacto del parámetro y te inyecta el fixture correspondiente. Si te equivocas en el nombre (escribes `pag` en vez de `page`), TypeScript te lo grita.

---

## 3. Cómo Playwright "inyecta" un fixture — destructuring

Mira esta línea de tu `ejemplo.spec.ts`:

```ts
test("TC-001 — login exitoso con usuario válido @smoke", async ({ page }) => {
  await page.goto("/");
  // ...
});
```

Lo que pasa por debajo, paso a paso:

1. Playwright lee la firma del callback → ve que pides `{ page }`.
2. **Antes** del test: construye un `Browser`, un `BrowserContext` y abre una `Page` nueva.
3. Te entrega ese `Page` como argumento `page`.
4. Ejecutas el cuerpo del test.
5. **Después** del test: Playwright cierra la `Page` y el `BrowserContext` (cookies se borran). El `Browser` se queda vivo para el siguiente test del mismo worker.

Si pides **dos** fixtures, Playwright te construye los dos (ejemplo **genérico**, no es código de M01):

```ts
test("ejemplo doble", async ({ page, context }) => {
  // page: navegador listo
  // context: la sesión incógnito que aloja a esa page
  await context.clearCookies();
  await page.goto("/");
});
```

> ⚠️ **No hagas `new Page()` a mano.** Si necesitas una página, pídela como fixture o créala desde `context.newPage()`. Saltarse el sistema rompe el aislamiento y el teardown.

---

## 4. Scopes — `test` vs `worker`

Un fixture vive durante una **ventana de tiempo**. Esa ventana se llama **scope**:

| Scope | Qué dura | Ejemplo built-in | Cuándo elegirlo |
|---|---|---|---|
| **`test`** (default) | Se crea y destruye por cada `test()` | `page`, `context`, `request` | Estado aislado por TC. **El 90% de los casos.** |
| **`worker`** | Se crea una vez por proceso worker; sobrevive entre tests | `browser`, `browserName` | Cosas caras de construir (un cliente DB, un browser) que pueden compartirse sin contaminar tests |

> 💡 **Por qué importa para M01:**
> El fixture `page` que usan TC-001 y TC-002 es **`test`-scoped por default**: Playwright te da una pestaña **nueva y limpia** en cada test. Por eso ambos tests repiten el login desde cero — no comparten sesión, y ese aislamiento es justo lo que te hace **sentir la duplicación**. En cambio `browser` es **`worker`-scoped**: se construye una sola vez por proceso y se reutiliza entre tests porque abrir un navegador es caro. En M06 aprovecharás el scope `worker` con un `setup project` que loguea **una vez** y comparte el `storageState`.

---

## 5. Fixtures vs Hooks (`beforeEach`, `afterEach`) — la confusión típica

Ambos sirven para preparar/limpiar. ¿Cuál uso?

| | **Hooks** (`beforeEach`, `afterEach`) | **Fixtures custom** |
|---|---|---|
| Sintaxis | `test.beforeEach(async ({ page }) => {...})` | `export const test = base.extend({...})` |
| Comparte código entre archivos | ❌ Tienes que copiarlo o importarlo | ✅ Importas el `test` extendido y listo |
| Inyecta un objeto como parámetro | ❌ No — solo ejecuta código | ✅ Sí — recibes `{ loginPage }`, `{ apiClient }`, etc. |
| Tipado fuerte del objeto inyectado | ❌ N/A | ✅ Sí — TypeScript autocompleta |
| Ideal cuando | El setup es trivial y local a un archivo | El setup se repite en muchos archivos |

**Regla pragmática del curso:**
- M01–M04 → solo usamos los fixtures **built-in** (`page`) y, cuando hace falta repetir setup, hooks como `beforeEach`. Es suficiente.
- M05 → migramos a fixtures custom (`authenticatedPage`, `apiClient`). Ahí sentirás la ganancia.

---

## 6. Lo que estás sufriendo en M01 y que un fixture **arreglaría**

Cuenta cuántas veces se repiten estas líneas entre TC-001 y TC-002 de `ejemplo.spec.ts`:

```ts
await page.goto("/");
await page.getByTestId("market-MX").click();
await page.getByTestId("username-desktop").fill(USERNAME);
await page.getByTestId("password-desktop").fill(PASSWORD);
await page.getByTestId("login-button-desktop").click();
await expect(page).toHaveURL(/\/catalog/);
```

**Son ~6 líneas, idénticas, en cada test.** Ahora imagina que en M05 vas a tener esto:

```ts
test("TC-002 — catálogo muestra al menos 1 pizza @smoke", async ({ authenticatedPage }) => {
  // ¡Ya estás logueado en /catalog! El fixture lo hizo por ti.
  const pizzaCards = authenticatedPage.locator('[data-testid^="pizza-card-"]');
  await expect(pizzaCards.first()).toBeVisible();
});
```

Las 6 líneas → **0 líneas en el test**. Viven una sola vez, dentro del fixture `authenticatedPage`. Ese es el premio que pagas con el dolor de M01.

---

## 7. Preview rápido de un fixture custom (NO lo escribas todavía)

Solo para que veas la sintaxis a la que estás corriendo. **No lo implementes en M01** — es spoiler de M05:

```ts
// tests/fixtures/auth.fixture.ts (esto NACE en M05, no aquí)
import { test as base, expect, type Page } from "@playwright/test";

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // 1) Setup — antes del test
    await page.goto("/");
    await page.getByTestId("market-MX").click();
    await page.getByTestId("username-desktop").fill(process.env.TEST_USER_USERNAME!);
    await page.getByTestId("password-desktop").fill(process.env.TEST_USER_PASSWORD!);
    await page.getByTestId("login-button-desktop").click();
    await expect(page).toHaveURL(/\/catalog/);

    // 2) Entrega el objeto listo al test
    await use(page);

    // 3) Teardown — después del test (opcional)
    // p.ej. logout, limpiar cookies, etc.
  },
});

export { expect };
```

Anatomía sin entrar a fondo (esto se profundiza en M05):

| Pieza | Qué hace |
|---|---|
| `base.extend<AuthFixtures>({...})` | Crea un `test` extendido que ofrece fixtures nuevos además de los built-in |
| `async ({ page }, use) => {...}` | Recibe otros fixtures (`page`) y un callback `use` |
| Código **antes** de `await use(...)` | Setup |
| `await use(page)` | "El test corre **aquí dentro** con el objeto que le entrego" |
| Código **después** de `await use(...)` | Teardown |

---

## 8. Errores comunes con fixtures (para que los reconozcas cuando lleguen)

| Error que verás | Causa típica |
|---|---|
| `Test fixture "miFixture" is not registered` | Importaste `test` desde `@playwright/test` en vez de tu `test` extendido |
| El test pide `{ page }` y recibe `undefined` | Olvidaste `async` en la firma o pusiste el destructuring fuera de los `{}` |
| Setup corre 1000 veces y el test va lentísimo | Convertiste a fixture algo que debía ser worker-scoped (DB, browser) |
| Cookies se filtran entre tests | Estás reusando un `context` en vez de pedir un fixture nuevo por test |

---

## 9. Resumen de 30 segundos

1. **Un fixture es un objeto que Playwright te prepara, te inyecta y limpia.**
2. **Ya usas uno en M01 sin saberlo:** `page` (el `request` para API llega en M07).
3. **El scope decide cuánto vive:** `test` (por TC) o `worker` (por proceso).
4. **Hooks ≠ fixtures.** Hooks ejecutan código; fixtures **además te entregan un objeto tipado y reutilizable entre archivos**.
5. **Cuando sientas que copias las mismas 6 líneas en cada test → ese es el momento de crear un fixture custom.** Ese momento llega oficialmente en M05.

---

## 10. Para profundizar (opcional, fuera de M01)

- Docs oficiales: <https://playwright.dev/docs/test-fixtures>
- En este curso, los siguientes módulos te llevan paso a paso:
  - **M04** → crearás Page Objects (todavía sin envolverlos en fixtures).
  - **M05** → envuelves esos Page Objects en fixtures custom.
  - **M06** → storage state reutilizable (login una vez, compartido vía setup project).
  - **M07** → fixture `apiClient` para tests de API sin pasar por la UI.
