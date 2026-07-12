# Módulo 05 — Fixtures (inyección de Page Objects + data isolation + `page.route()`)

**Duración estimada:** 60-80 min
**Piezas que suma al framework:**
- `fixtures/omnipizza.ts` — custom fixtures con `test.extend`: inyectan Page Objects + usuario/mercado.
- `helpers/unique-data.ts` — identificadores únicos por worker para paralelismo seguro.
- Demostración de `page.route()` para mocking de red (error, estado vacío, latencia).

---

> 🎁 **Proyecto de referencia — [`proyecto/`](proyecto/).** Este módulo trae una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el estado final de este módulo ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json` · `.env.example`, independiente del resto del curso). Es la **solución de referencia** para comparar: ábrela aparte y corre `pnpm install` → `cp .env.example .env` → `pnpm test`. Los pasos de este README siguen construyendo **tu** proyecto incremental; `proyecto/` es el "ya resuelto". Detalles en [`proyecto/README.md`](proyecto/README.md).

## 🏗️ Arquitectura al terminar este módulo

Aparecen **2 carpetas nuevas** (`fixtures/`, `helpers/`) que trabajan **encima** del Page Object Model de M04. El `playwright.config.ts` **NO cambia de orquestación**: sigue con un único project que corre los tests **sin sesión heredada** — el login se hace por UI dentro del test, encapsulado en el POM.

```
modulo-05-fixtures/proyecto/
├── data/                          ← (M03) markets.json, users.json
├── fixtures/                      ← 🆕 custom fixtures
│   └── omnipizza.ts               ← 🆕 test.extend → loginPage, catalogPage, defaultMarket, standardUser
├── helpers/                       ← 🆕
│   └── unique-data.ts             ← 🆕 uniqueEmail, uniqueOrderId (data isolation)
├── pages/                         ← (M04) Page Object Model
├── types/                         ← (M03)
├── tests/
│   ├── ejemplo.spec.ts            ← 🆕 fixtures inyectan POM + page.route() (mocking)
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

> 💡 **Para el facilitador:** deja claro desde el minuto uno que M05 es el módulo **fácil** de este par. Los fixtures **solo** inyectan objetos que el alumno ya conoce (los Page Objects de M04) — no tocan `projects`, ni sesión, ni red de auth. El módulo pesado (setup + `storageState` + `dependencies`) es **M06**, y llega después a propósito (decisión D2): primero los fixtures "en frío", luego cobran vida autenticados.

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

> **Cómo leer esta sección:** cada paso grande se parte en **micro-pasos `N.M`** con la tripleta **Qué hago / Por qué / Cómo verifico**. Cada micro-paso dice exactamente **qué archivo se crea o edita** y en qué orden. El orden importa: primero el helper (sin dependencias), luego los fixtures (dependen de `pages/`), luego el config, y al final el mocking y el reto.

### Paso 0 — Pre-requisitos

**0.1 — Verifica que M04 (POM) quede verde antes de empezar**
- **Qué hago:** desde el `proyecto/` corro los Page Objects de M04 y el typecheck.
  ```bash
  cd proyecto
  pnpm m5          # (aún no existe el spec de fixtures; primero confirma que el POM compila)
  pnpm typecheck   # debe pasar
  ```
  Si vienes construyendo tu proyecto incremental, lo que confirmas es que `pages/` (M04) funciona: los fixtures van a **inyectar** esos Page Objects, así que deben estar sanos.
- **Por qué:** M05 construye **encima** de `pages/`. Si el POM está roto, los fixtures arrastran el error y no sabrás si el bug es de M04 o de M05.
- **Cómo verifico:** `pnpm typecheck` no imprime errores; `ls pages/` muestra `BasePage.ts`, `LoginPage.ts`, `CatalogPage.ts`.

> 💡 **Para el facilitador:** este módulo introduce 2 conceptos ligeros (fixtures + mocking) sobre algo ya conocido (los Page Objects). Es un buen momento para respirar antes de M06, que sí es denso.

---

### Paso 1 — Dependencias

**1.1 — Confirma que no falta ningún paquete**
- **Qué hago:** **M05 no añade paquetes npm nuevos.** Los custom fixtures y `page.route()` viven dentro de `@playwright/test`. Solo confirmo las dependencias base.
  ```bash
  pnpm list @playwright/test dotenv typescript @types/node
  # Las 4 deben aparecer. Si no: pnpm install
  ```
- **Por qué:** todo lo nuevo de M05 (`test.extend`, `page.route()`) es API del propio runner. Reinstalar aquí sería ruido.
- **Cómo verifico:** las 4 dependencias aparecen listadas con su versión.

---

### Paso 2 — Crear los archivos nuevos (helpers → fixtures)

**2.1 — Escribe `helpers/unique-data.ts` (data isolation)**
- **Qué hago:** creo las funciones de datos únicos por worker. Es el archivo **sin dependencias**, por eso va primero.
  ```ts
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
- **Por qué:** con `fullyParallel: true` varios workers corren a la vez. Si todos siembran el mismo email/orden, colisionan. `workerIndex` (0, 1, 2…) garantiza que el dato de cada worker sea **propio**, y `Date.now()` lo hace único entre corridas.
- **Cómo verifico:** `pnpm exec tsc --noEmit` no marca `helpers/unique-data.ts`; el editor autocompleta `info.workerIndex`.

> 🔷 **TypeScript — función tipada + parámetro `TestInfo`**
> `uniqueEmail(info: TestInfo, ...): string` declara el **tipo de cada parámetro** y el **tipo de retorno**. `TestInfo` es el objeto que Playwright inyecta con metadata del test en curso (incluido `workerIndex`). El gotcha: si tipas el retorno como `string`, TS te avisa si por accidente devuelves `undefined` en algún branch.
> 📚 Lo viste en [TS · M03 — Funciones](../../typescript-qa-course/modulo-03-functions/). Aquí lo aplicas para que cada helper de data isolation reciba el `TestInfo` correcto y devuelva siempre un `string`.

> 🔷 **TypeScript — parámetro por defecto (`prefix = "customer"`)**
> `prefix = "customer"` hace el parámetro **opcional**: si no lo pasas, vale `"customer"`. No necesitas escribir `prefix?: string` ni chequear `if (!prefix)` — el default cubre el caso. El gotcha: un parámetro con default debe ir **después** de los obligatorios.
> 📚 Lo viste en [TS · M03 — Funciones](../../typescript-qa-course/modulo-03-functions/). Aquí lo aplicas para que `uniqueEmail(info)` use `"customer"` y `uniqueEmail(info, "locked")` use otro prefijo, sin sobrecargar la función.

> 🔷 **TypeScript — template literals (`` `${prefix}+w${info.workerIndex}-...` ``)**
> Las comillas invertidas (`` ` ``) permiten **interpolar** variables con `${...}` dentro del string, en vez de concatenar con `+`. El gotcha: dentro de `${}` puedes poner cualquier expresión (`info.workerIndex`, `Date.now()`), no solo variables sueltas.
> 📚 Lo viste en [TS · M02 — Tipos](../../typescript-qa-course/modulo-02-types/). Aquí lo aplicas para componer el email/folio único en una sola línea legible.

**2.2 — Escribe `fixtures/omnipizza.ts` (inyecta Page Objects con `test.extend`)**
- **Qué hago:** extiendo el `test` base para que inyecte Page Objects, el usuario estándar y el mercado por defecto.
  ```ts
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
- **Por qué:** con `test.extend` el TC **ya no escribe `new LoginPage(page)`** — el fixture se lo entrega listo y ligado a su pestaña. El primer genérico (`PageFixtures`) son fixtures **por test**; el segundo (`WorkerFixtures`) son **por worker** (`defaultMarket` se crea 1 vez por proceso).
- **Cómo verifico:** en un spec, `import { test } from "../fixtures/omnipizza"` y el editor autocompleta `catalogPage`, `standardUser` y `defaultMarket` dentro del callback del test.

> 🔍 **Detalle que parece obvio — worker fixture vs test fixture (el `scope`)**
> **Qué es:** `base.extend<PageFixtures, WorkerFixtures>()` — el **primer** genérico son **test fixtures** (1 por TC), el **segundo** son **worker fixtures** (1 por worker). `loginPage`/`catalogPage`/`standardUser` son test fixtures; `defaultMarket` lleva `{ scope: "worker" }`.
> **Por qué así (y no la alternativa obvia):** un Page Object está **ligado al `page`** de un test concreto, así que debe recrearse por TC (test fixture). Un dato inmutable como el mercado por defecto es igual para todos: recrearlo por TC sería desperdicio → worker fixture, 1 vez por proceso.
> **Qué pasa si lo cambias:** un worker fixture que **muta** estado se comparte entre TCs del mismo worker (riesgo de contaminación); un test fixture caro recreado por TC hace la suite lenta. La regla: **datos inmutables/caros → worker; objetos ligados al `page` → test**.

> 🔷 **TypeScript — inferencia de tipos en `test.extend<...>()`**
> Al pasar los genéricos `base.extend<PageFixtures, WorkerFixtures>(...)`, TS **infiere** el tipo de cada fixture y lo propaga al callback del test: dentro de `async ({ catalogPage }) => {...}`, `catalogPage` **ya es** `CatalogPage`, sin casts. El gotcha: si declaras un fixture en el objeto pero lo olvidas en el genérico (o al revés), TS marca el desajuste en vez de fallar en runtime.
> 📚 Lo viste en [TS · M05 — Clases](../../typescript-qa-course/modulo-05-classes/) y [TS · M06 — Interfaces](../../typescript-qa-course/modulo-06-interfaces/). Aquí los tipos `PageFixtures`/`WorkerFixtures` son el **contrato** que hace que `{ catalogPage }` venga tipado y autocompletado en cada TC.

---

### Paso 3 — El `playwright.config.ts` NO cambia de orquestación

> **📐 Config — cambios vs M04**
> ```diff
> # playwright.config.ts — SIN cambios de projects vs M04
> # (M05 añade fixtures/ y helpers/, que son ARCHIVOS de código, no config
> #  del runner. Un solo project `chromium`, anónimo, sigue corriendo todo.)
> ```
> **Se mantiene:** `baseURL`, timeouts, reporter, `trace`, y el **único project `chromium`** (anónimo). **Entra:** nada en el config. El próximo cambio real llega en **M06**, donde nacen el `setup` project + `storageState` + `dependencies`.

**3.1 — Confirma el config mínimo (edita solo si hiciera falta)**
- **Qué hago:** verifico que el `playwright.config.ts` tenga un único project `chromium` y `testDir: "./tests"` — sin `setup`, sin `storageState`, sin `dependencies`, sin firefox/webkit.

```ts
// playwright.config.ts — Estado en M05 (Fixtures)
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
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
```

- **Por qué:** el incremental de M05 es de **arquitectura de código** (fixtures + helpers), no del runner. Los tests corren **anónimos**: cada uno hace su login por UI (encapsulado en el POM). Ese login repetido es exactamente el "dolor" que M06 elimina con el setup project.
- **Cómo verifico:** `pnpm exec playwright test --list` corre sin error de parseo y lista los tests bajo el único project `chromium`.

**3.2 — Confirma el `include` del `tsconfig.json` (edita si falta algo)**
- **Qué hago:** confirmo que `fixtures/`, `helpers/` y `tests/` estén en el `include`.
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
- **Por qué:** si una carpeta nueva no está en `include`, TS no la typechequea: `pnpm typecheck` quedaría verde por **omisión**, ocultando errores reales en `fixtures/` o `helpers/`.
- **Cómo verifico:** `pnpm exec tsc --noEmit` recorre los 2 archivos nuevos (mete un error a propósito en `helpers/unique-data.ts` y verás que TS lo reporta).

**3.3 — Añade el script `m5` al `package.json` (edita `package.json`)**
- **Qué hago:** confirmo/añado el atajo del módulo.
  ```json
  "scripts": {
    "m5": "playwright test --project=chromium"
  }
  ```
- **Por qué:** `pnpm m5` es azúcar sintáctica del comando largo.
- **Cómo verifico:** `pnpm m5 --list` no falla con "script not found".

---

### Paso 4 — Lectura guiada de `fixtures/omnipizza.ts`

**4.1 — Distingue test fixture de worker fixture (con el código en pantalla)**
- **Qué hago:** abro `fixtures/omnipizza.ts` y señalo:
  - `loginPage`, `catalogPage`, `checkoutPage`, `standardUser` son **test fixtures**: Playwright los crea por TC y los inyecta al callback.
  - `defaultMarket` es **worker fixture** (`scope: "worker"`): se crea una vez por proceso paralelo.
  - En el test ya **no escribes `new LoginPage(page)`** — el fixture te lo entrega listo.
- **Por qué:** este es el corazón del módulo. El detalle del `scope` (recuadro 🔍 de arriba) es lo que hace que la suite sea rápida y correcta a la vez.
- **Cómo verifico:** en un spec, al teclear `async ({ ` el editor sugiere `loginPage`, `catalogPage`, `standardUser` (test) y `defaultMarket` (worker), todos ya tipados.

**4.2 — Corre el ejemplo de fixtures**
- **Qué hago:**
  ```bash
  pnpm m5
  ```
- **Por qué:** demuestra el fixture en acción — el test usa `loginPage.loginInMarket(...)` y `catalogPage.expectLoaded()` sin construir un solo Page Object a mano.
- **Cómo verifico:** el test `los fixtures entregan LoginPage/CatalogPage ya listos` pasa; el test `defaultMarket es un worker fixture` confirma `defaultMarket.code === "MX"`.

> 💡 **Para el facilitador:** haz notar que **este spec todavía hace login por UI** en cada TC (dentro de `loginInMarket`). Ese es el puente a M06: *"¿y si el login se hiciera UNA sola vez y todos arrancaran ya dentro?"* — esa pregunta es literalmente el módulo siguiente.

---

### Paso 5 — Demostración de `page.route()` (mocking)

**5.1 — Lee la sección `page.route()` de `ejemplo.spec.ts`**
- **Qué hago:** abro `page.route() — network mocking` en `ejemplo.spec.ts` y reviso:
  1. **El mock se registra ANTES de navegar** — si lo registras después, el primer request ya pasó.
  2. `route.fulfill({...})` devuelve una respuesta totalmente inventada (status, headers, body).
  3. `route.continue()` deja pasar el request al backend real (útil para introducir latencia, no para cambiar la respuesta).
- **Por qué:** mockear la red da **determinismo absoluto** para casos de error (5xx, 404) o estado vacío, sin depender de qué responda hoy el backend real.
- **Cómo verifico:** el patrón del ejemplo usa `**/api/pizzas*` como URL del route; el `route.fulfill` con `status: 500` produce el caso de error sin tocar OmniPizza.

> 🔍 **Detalle que parece obvio — registrar el mock ANTES del login, no justo antes de `/catalog`**
> **Qué es:** en el ejemplo el `page.route("**/api/pizzas*", ...)` va **arriba del todo del test**, antes del `loginPage.loginInMarket(...)` que navega.
> **Por qué así (y no la alternativa obvia):** `page.route` no es "para esta navegación" — queda **vivo durante toda la vida de la pestaña**. Si esperaras a registrarlo justo antes de `/catalog`, en un flujo real el login puede disparar el fetch de pizzas antes de que llegues a esa línea.
> **Qué pasa si lo cambias:** registrarlo **después** de que `/api/pizzas` ya se pidió = llegas tarde; el request real pasó y tu mock nunca corre. Registrarlo primero garantiza que lo intercepte pase lo que pase.

**Pregunta al grupo:** *"¿qué pasa si registras 2 mocks distintos al mismo URL?"* — respuesta: gana el último registrado.

> 💡 **Para el facilitador:** los locators de error/empty en el ejemplo (`catalog-error`, `catalog-empty`) pueden no existir en OmniPizza tal cual. Es un PATRÓN a aprender, no un test que tenga que pasar perfectamente — está intencional como prototipo (por eso el assert real es un `body` visible tentativo).

**5.2 — Versiona tu trabajo (Git)**
- **Qué hago:** ahora que la suite corre verde, hago commit de lo nuevo del módulo.
  ```bash
  git add fixtures helpers tests playwright.config.ts package.json tsconfig.json
  git commit -m "feat(m05): custom fixtures + data isolation + page.route()"
  ```
- **Por qué:** un commit atómico con mensaje claro deja un punto de retorno limpio. M05 no toca secretos ni `.auth/` (eso es M06), así que el commit es directo.
- **Cómo verifico:** `git log --oneline -1` muestra el commit `feat(m05): ...`.

---

### Paso 6 — Resolver el reto

**6.1 — Completa `reto.spec.ts` (mock con latencia)**
- **Qué hago:** abro `reto.spec.ts`; tiene un solo reto con TODOs detallados (formato **Qué hacer / Pista / Cómo verificar**): interceptar `/api/pizzas*` con `page.route()`, meterle 3s de demora con `setTimeout` + `route.continue()`, hacer login por UI para llegar a `/catalog`, y validar que la UI muestra un skeleton mientras tanto (y que después aparecen las pizzas reales).
- **Por qué:** el reto te hace sentir la diferencia entre latencia real (no determinista) y latencia mockeada (determinista, 3s exactos). Y refuerza el detalle de registrar el mock **antes** de navegar.
- **Cómo verifico:** sigues los TODOs del archivo — **no** están resueltos aquí a propósito. El test pasa y su duración total es ≥ 3s. Si OmniPizza no muestra skeleton, el reto te invita a **abrir un bug** (carga larga sin feedback visual = defecto de UX).

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo:** desde `proyecto/`, `pnpm m5`
- **UI mode:** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Solo el reto:** `pnpm exec playwright test tests/reto.spec.ts --headed --project=chromium`
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** variables de entorno con `$env:VAR="x"; pnpm m5` (no `VAR=x pnpm m5`)

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
