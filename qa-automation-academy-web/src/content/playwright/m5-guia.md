# M05 · Guía del módulo: Fixtures

> 🎁 **Proyecto de referencia.** En el repo del curso, este módulo incluye una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el estado de este módulo ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json` · `.env.example`, independiente del monorepo). Úsalo como **solución de referencia**: ábrelo aparte y corre `pnpm install` → `cp .env.example .env` → `pnpm test`. Los pasos de esta guía siguen construyendo **tu** proyecto incremental; `proyecto/` es el "ya resuelto".

**Duración estimada:** 60-80 min
**Piezas que suma al framework:**
- `fixtures/omnipizza.ts` — custom fixtures con `test.extend`: inyectan Page Objects + usuario/mercado.
- `helpers/unique-data.ts` — identificadores únicos por worker para paralelismo seguro.
- Demostración de `page.route()` para mocking de red (error, estado vacío, latencia).
- `pages/ProfilePage.ts` + `pages/PizzaCustomizerModal.ts` + `pages/CheckoutPage.ts` ampliado (radio de pago, `<select>` de tarjeta, tooltips, confirmación de orden en 2 pasos) y `tests/interacciones-nuevas.spec.ts` — interacciones con [widgets nuevos](/docs/playwright/m5-interacciones) (8 tests).

---

## 🏗️ Arquitectura al terminar este módulo

Aparecen **2 carpetas nuevas** (`fixtures/`, `helpers/`) que trabajan **encima** del Page Object Model de M04. El `playwright.config.ts` **NO cambia de orquestación**: sigue con un único project que corre los tests **sin sesión heredada** — el login se hace por UI dentro del test, encapsulado en el POM.

```
modulo-05-fixtures/
├── data/                          ← (M03) markets.json, users.json
├── fixtures/                      ← 🆕 custom fixtures
│   └── omnipizza.ts               ← 🆕 test.extend → loginPage, catalogPage, defaultMarket, standardUser
├── helpers/                       ← 🆕
│   └── unique-data.ts             ← 🆕 uniqueEmail, uniqueOrderId (data isolation)
├── pages/                         ← (M04) Page Object Model
│   ├── ProfilePage.ts             ← 🆕 date picker nativo (<input type=date>)
│   ├── PizzaCustomizerModal.ts    ← 🆕 modal "Customize Pizza"
│   └── CheckoutPage.ts            ← ampliado: radio pago, <select> tarjeta, tooltips, confirmación de orden
├── types/                         ← (M03)
├── tests/
│   ├── ejemplo.spec.ts            ← 🆕 fixtures inyectan POM + page.route() (mocking)
│   ├── interacciones-nuevas.spec.ts  ← 🆕 widgets nuevos (date picker, modal Customize, checkout 2 pasos, tooltips) — 8 tests
│   └── reto.spec.ts               ← 🆕 mock con latencia simulada
├── playwright.config.ts           ← un solo project `chromium` (sin setup, sin storageState)
├── package.json · tsconfig.json · .env.example
```

**Flujo del dato dentro de un test** (cómo el fixture inyecta el POM):

```
fixtures/omnipizza.ts ──► test.extend<{loginPage, catalogPage, ...}>()
                                          │
                                          ▼
test("...", async ({ loginPage, catalogPage }) => {  ◄── ya vienen listos, sin "new"
  await loginPage.loginInMarket(user, "MX")          ◄── login por UI (aún no hay badge)
  await catalogPage.expectLoaded()
})
```

**Qué NO existe todavía:**

| Carpeta / pieza | Llega en | Para qué |
|---|---|---|
| `tests/setup/`, `.auth/`, `storageState`, `dependencies` | M06 | Setup project: login UNA vez → badge heredado |
| `services/`, `tests/api/` | M07 | Suite de API pura (BaseService abstracta) |
| `.github/workflows/` + multi-browser (firefox/webkit) | M08 | CI/CD con matrix por browser |

---

## Analogía de apertura

El fixture es el **ambiente de prueba YA preparado**: el tester manual, al sentarse, encuentra su estación lista — el navegador abierto, sus herramientas a mano, su libreta de pedidos con folios propios. No arma nada: **recibe** todo listo y ejecuta sus pasos. Además, si varios testers trabajan en paralelo, **cada uno usa datos propios** (emails únicos, órdenes con su folio) para no pisarse.

En Playwright eso se traduce en dos cosas: (1) `test.extend` te **entrega** el `loginPage`/`catalogPage` ya construidos y ligados a tu pestaña, y (2) `uniqueEmail(workerInfo)` le da a cada worker su propio dato.

---

## ¿Qué aprenderás?

1. **Custom fixtures con `test.extend`** para inyectar Page Objects (Dependency Injection).
2. **Worker vs test fixtures** — cuándo usar cada scope.
3. **Data isolation:** `uniqueEmail(workerInfo)` para `fullyParallel: true`.
4. **`page.route()`** — mocking de red para casos de error / vacío / latencia deterministas.
5. **Por qué el fixture reemplaza `new LoginPage(page)`** — el test se lee como user story, no como plomería.

---

## Conceptos JIT

| Concepto | Analogía |
|---|---|
| `test.extend` | Adaptador custom del test runner: extiende lo que recibe cada TC |
| Test fixture | 1 instancia por TC (ej. `loginPage`, ligado a la pestaña) |
| Worker fixture | 1 instancia por worker (ej. `defaultMarket`, dato inmutable) |
| `scope: "worker"` | "Créalo una vez por proceso paralelo, no por test" |
| `workerInfo.workerIndex` | El número del tester paralelo (0, 1, 2…) |
| `uniqueEmail()` | Cada worker genera sus propios folios de orden |
| `page.route('**/api/pizzas', ...)` | Stub en Postman Mock Server: tú decides la respuesta |
| `route.fulfill(...)` | Respondo yo, el backend ni se entera |
| `route.continue()` | Dejo pasar al backend real (útil para meter latencia) |

---

## Paso a paso

> **Cómo leer esta sección:** cada paso dice exactamente **qué archivo se crea o edita** y en qué orden. El orden importa: primero el helper (sin dependencias), luego los fixtures (dependen de `pages/`), luego el config.

### Paso 0 — Pre-requisitos

Verifica que **M04 (POM) quede verde** antes de empezar. M05 construye **encima** de `pages/`: los fixtures van a **inyectar** esos Page Objects, así que deben estar sanos.

```bash
# Desde el proyecto/
pnpm typecheck     # debe pasar limpio
ls pages/          # BasePage.ts, LoginPage.ts, CatalogPage.ts, CheckoutPage.ts
```

Si el POM está roto, los fixtures arrastran el error y no sabrás si el bug es de M04 o de M05. Vuelve a M04 antes de avanzar.

---

### Paso 1 — Dependencias

**M05 no añade paquetes npm nuevos.** Los custom fixtures y `page.route()` viven dentro de `@playwright/test`. Solo confirma las dependencias base:

```bash
pnpm list @playwright/test dotenv typescript @types/node
# Las 4 deben aparecer. Si no: pnpm install
```

Todo lo nuevo de M05 (`test.extend`, `page.route()`) es API del propio runner. Reinstalar aquí sería ruido.

---

### Paso 2 — Crear los archivos nuevos (helpers → fixtures)

**2.1 — Escribe `helpers/unique-data.ts` (data isolation).** Es el archivo **sin dependencias**, por eso va primero.

```ts
// @file modulo-05-fixtures/helpers/unique-data.ts
import type { TestInfo } from "@playwright/test";

// Email único por worker + timestamp. Ej: customer+w0-1714000000000@omnipizza.test
export function uniqueEmail(info: TestInfo, prefix = "customer"): string {
  return `${prefix}+w${info.workerIndex}-${Date.now()}@omnipizza.test`;
}

// Identificador único de orden. Ej: ORD-w0-1714000000000-4821
export function uniqueOrderId(info: TestInfo): string {
  const random = Math.floor(Math.random() * 10_000);
  return `ORD-w${info.workerIndex}-${Date.now()}-${random}`;
}

// Prefijo determinista por worker (sin timestamp), útil para seeds reproducibles.
export function workerPrefix(info: TestInfo): string {
  return `w${info.workerIndex}`;
}
```

Con `fullyParallel: true` varios workers corren a la vez. Si todos siembran el mismo email/orden, colisionan. `workerIndex` (0, 1, 2…) garantiza que el dato de cada worker sea **propio**, y `Date.now()` lo hace único entre corridas.

> 🔷 **TypeScript — función tipada + parámetro `TestInfo`**
> `uniqueEmail(info: TestInfo, ...): string` declara el **tipo de cada parámetro** y el **tipo de retorno**. `TestInfo` es el objeto que Playwright inyecta con metadata del test en curso (incluido `workerIndex`). El gotcha: si tipas el retorno como `string`, TS te avisa si por accidente devuelves `undefined` en algún branch.
> 📚 Lo viste en [TS · M03 — Funciones](/docs/typescript/m3-login). Aquí lo aplicas para que cada helper de data isolation reciba el `TestInfo` correcto y devuelva siempre un `string`.

> 🔷 **TypeScript — parámetro por defecto (`prefix = "customer"`)**
> `prefix = "customer"` hace el parámetro **opcional**: si no lo pasas, vale `"customer"`. No necesitas escribir `prefix?: string` ni chequear `if (!prefix)` — el default cubre el caso. El gotcha: un parámetro con default debe ir **después** de los obligatorios.
> 📚 Lo viste en [TS · M03 — Funciones](/docs/typescript/m3-navigate). Aquí lo aplicas para que `uniqueEmail(info)` use `"customer"` y `uniqueEmail(info, "locked")` use otro prefijo, sin sobrecargar la función.

> 🔷 **TypeScript — template literals (`` `${prefix}+w${info.workerIndex}-...` ``)**
> Las comillas invertidas (`` ` ``) permiten **interpolar** variables con `${...}` dentro del string, en vez de concatenar con `+`. El gotcha: dentro de `${}` puedes poner cualquier expresión (`info.workerIndex`, `Date.now()`), no solo variables sueltas.
> 📚 Lo viste en [TS · M02 — Tipos](/docs/typescript/m2-strings). Aquí lo aplicas para componer el email/folio único en una sola línea legible.

**2.2 — Escribe `fixtures/omnipizza.ts` (inyecta Page Objects con `test.extend`).** Extiende el `test` base para que inyecte Page Objects, el usuario estándar y el mercado por defecto.

```ts
// @file modulo-05-fixtures/fixtures/omnipizza.ts
import { test as base, expect } from "@playwright/test";
import { LoginPage, CatalogPage, CheckoutPage } from "../pages";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

const markets = marketsJson as Market[];
const users = usersJson as User[];

type PageFixtures = {
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  checkoutPage: CheckoutPage;
  standardUser: User;
};
type WorkerFixtures = {
  defaultMarket: Market;   // worker-scoped: 1 vez por worker
};

export const test = base.extend<PageFixtures, WorkerFixtures>({
  // --- Worker fixture ---
  // eslint-disable-next-line no-empty-pattern
  defaultMarket: [async ({}, use) => {
    const mx = markets.find((m) => m.code === "MX");
    if (!mx) throw new Error("MX market not found in data/markets.json");
    await use(mx);
  }, { scope: "worker" }],

  // --- Test fixtures ---
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  catalogPage: async ({ page }, use) => { await use(new CatalogPage(page)); },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },
  // eslint-disable-next-line no-empty-pattern
  standardUser: async ({}, use) => {
    const u = users.find((u) => u.username === "standard_user");
    if (!u) throw new Error("standard_user not found in data/users.json");
    await use(u);
  },
});

export { expect };
export type { Market, User };
```

Con `test.extend` el TC **ya no escribe `new LoginPage(page)`** — el fixture se lo entrega listo y ligado a su pestaña. El primer genérico (`PageFixtures`) son fixtures **por test**; el segundo (`WorkerFixtures`) son **por worker** (`defaultMarket` se crea 1 vez por proceso).

> 🔍 **Detalle que parece obvio — worker fixture vs test fixture (el `scope`)**
> **Qué es:** `base.extend<PageFixtures, WorkerFixtures>()` — el **primer** genérico son **test fixtures** (1 por TC), el **segundo** son **worker fixtures** (1 por worker). `loginPage`/`catalogPage`/`standardUser` son test fixtures; `defaultMarket` lleva `{ scope: "worker" }`.
> **Por qué así (y no la alternativa obvia):** un Page Object está **ligado al `page`** de un test concreto, así que debe recrearse por TC (test fixture). Un dato inmutable como el mercado por defecto es igual para todos: recrearlo por TC sería desperdicio → worker fixture, 1 vez por proceso.
> **Qué pasa si lo cambias:** un worker fixture que **muta** estado se comparte entre TCs del mismo worker (riesgo de contaminación); un test fixture caro recreado por TC hace la suite lenta. La regla: **datos inmutables/caros → worker; objetos ligados al `page` → test**.

> 🔷 **TypeScript — inferencia de tipos en `test.extend<...>()`**
> Al pasar los genéricos `base.extend<PageFixtures, WorkerFixtures>(...)`, TS **infiere** el tipo de cada fixture y lo propaga al callback del test: dentro de `async ({ catalogPage }) => {...}`, `catalogPage` **ya es** `CatalogPage`, sin casts. El gotcha: si declaras un fixture en el objeto pero lo olvidas en el genérico (o al revés), TS marca el desajuste en vez de fallar en runtime.
> 📚 Lo viste en [TS · M05 — Clases](/docs/typescript/m5-base-page) y [TS · M06 — Interfaces](/docs/typescript/m6-api-response). Aquí los tipos `PageFixtures`/`WorkerFixtures` son el **contrato** que hace que `{ catalogPage }` venga tipado y autocompletado en cada TC.

---

### Paso 3 — El `playwright.config.ts` NO cambia de orquestación

> **📐 Config — cambios vs M04**
> ```diff
> # playwright.config.ts — SIN cambios de projects vs M04
> # (M05 añade fixtures/ y helpers/, que son ARCHIVOS de código, no config
> #  del runner. Un solo project `chromium`, anónimo, sigue corriendo todo.)
> ```
> **Se mantiene:** `baseURL`, timeouts, reporter, `trace`, y el **único project `chromium`** (anónimo). **Entra:** nada en el config — el incremental de M05 es de **arquitectura de código** (fixtures + helpers), no del runner. El próximo cambio real llega en **M06**, donde nacen el `setup` project + `storageState` + `dependencies`.

**3.1 — Confirma el config mínimo.** Un único project `chromium` y `testDir: "./tests"` — sin `setup`, sin `storageState`, sin `dependencies`, sin firefox/webkit.

```ts
// @file modulo-05-fixtures/playwright.config.ts
import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.BASE_URL ?? "https://omnipizza-frontend.onrender.com",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },
  // Un solo project, anónimo: los tests hacen login por UI (el badge
  // heredado con storageState nace en M06).
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

El incremental de M05 es de **arquitectura de código** (fixtures + helpers), no del runner. Los tests corren **anónimos**: cada uno hace su login por UI (encapsulado en el POM). Ese login repetido es exactamente el "dolor" que M06 elimina con el setup project.

**3.2 — Confirma el `include` del `tsconfig.json`.** `fixtures/`, `helpers/` y `tests/` deben estar en el `include`:

```json
"include": [
  "playwright.config.ts",
  "types/**/*.ts", "types/**/*.d.ts",
  "pages/**/*.ts",
  "fixtures/**/*.ts",
  "helpers/**/*.ts",
  "tests/**/*.ts"
]
```

Si una carpeta nueva no está en `include`, TS no la typechequea: `pnpm typecheck` quedaría verde por **omisión**, ocultando errores reales en `fixtures/` o `helpers/`.

**3.3 — Añade el script `m5` al `package.json`:**

```json
"scripts": {
  "m5": "playwright test --project=chromium"
}
```

`pnpm m5` es azúcar sintáctica del comando largo.

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo:** desde `proyecto/`, `pnpm m5`
- **UI mode (recomendado la 1ª vez):** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Solo el reto:** `pnpm exec playwright test tests/reto.spec.ts --headed --project=chromium`
- **Verificar tipos:** `pnpm typecheck`
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** variables de entorno con `$env:VAR="x"; pnpm m5` (no `VAR=x pnpm m5`, sintaxis bash que falla en PowerShell)

---

## Outcome esperado

- [ ] Puedes explicar worker fixture vs test fixture con un ejemplo concreto (`defaultMarket` vs `loginPage`).
- [ ] Los TCs usan `loginPage`/`catalogPage` inyectados — **sin** `new LoginPage(page)`.
- [ ] Sabes generar data única por worker con `uniqueEmail(info)`.
- [ ] Puedes mockear una respuesta con `page.route()` registrándolo **antes** del navigate.
- [ ] Entiendes por qué en M05 el login todavía corre por UI en cada test (y por qué M06 lo elimina).
- [ ] Resolviste el reto del mock con latencia (skeleton durante ~3s, pizzas después).

---

## ¿Qué viene en M06?

En M05 el login todavía corre por UI en **cada** test (dentro del fixture `loginPage`). En **M06 (Setup)** vas a eliminar ese login repetido: un `auth.setup.ts` se ejecuta **una sola vez**, guarda la sesión en `.auth/` (el "badge"), y todos los TCs arrancan **ya autenticados** gracias a `dependencies: ['setup']` + `storageState`. Es el primer cambio real de orquestación en el `playwright.config.ts` desde M01 — y los fixtures que armaste aquí van a "cobrar vida" corriendo ya con sesión.
