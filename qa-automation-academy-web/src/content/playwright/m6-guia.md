# M06 · Guía del módulo: API Layer

> 🎁 **Proyecto de referencia.** En el repo del curso, este módulo incluye una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el estado de este módulo ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json`, independiente del monorepo). Úsalo como **solución de referencia**: ábrelo aparte y corre `pnpm install` → `cp .env.example .env` → `pnpm test`. Los pasos de esta guía siguen construyendo **tu** proyecto incremental; `proyecto/` es el "ya resuelto".

**Duración estimada:** 50-60 min
**Piezas que suma al framework:**
- `services/BaseService.ts` — **clase abstracta** (primera aparición del término en el curso).
- `services/AuthService.ts`, `OrderService.ts`, `PizzaService.ts`.
- `tests/api/*.spec.ts` — suite API pura.
- `tests/ui/ejemplo.spec.ts` — el MISMO flujo (login → pizzas → orden) por UI, para compararlo lado a lado con `tests/ejemplo.spec.ts` (API) en el **Paso 8**.
- `types/omnipizza.d.ts` **se amplía**: `Pizza`, `LoginResponse`, `PizzasResponse`, `OrderPayload`, `Order`, `ApiError` — los contratos de request/response que hasta ahora no hacían falta (M03–M05 solo tocan la app por UI).

**M06 SUMA, no reemplaza:** `pages/`, `fixtures/` y el project `chromium` de M04-M05 siguen aquí (la UI vive en `tests/ui/`, con login por fixture) — la capa de API corre AL LADO de la de UI, en su propio project, no en su reemplazo. **No hay `tests/setup/`, ni `.auth/`, ni `storageState`:** el badge llega en M07.

---

## 🏗️ Arquitectura al terminar este módulo

Aparece la carpeta **`services/`** (la capa de API) y se llena **`tests/api/`** (la suite que la consume). La novedad conceptual: por primera vez en el curso aparece una **clase abstracta**. Y algo que NO es novedad y por eso vale la pena señalarlo: `pages/` y `fixtures/` (POM + fixtures de M04-M05) **siguen aquí, intactos** — M06 SUMA una capa, no reemplaza la anterior. **No hay `tests/setup/`, ni `.auth/`, ni `storageState`:** la UI sigue haciendo login por la fixture `loginPage`, igual que en M05 (el badge llega en M07). `tests/ejemplo.spec.ts`/`tests/reto.spec.ts` de M05 se mudan a `tests/ui/` solo para no chocar de nombre con los `ejemplo.spec.ts`/`reto.spec.ts` NUEVOS de este módulo, que son de API. Los de `tests/ui/` ya no son los de M05: `ejemplo.spec.ts` es el flujo login → pizzas → orden por UI (el que se compara con la API en el Paso 8). El login negativo de `locked_out_user` no está aquí: se hace en M07, donde además decide qué badge usa cada test.

```
playwright-course/
├── data/                          ← (M03 — compartido entre UI y API)
├── fixtures/                      ← (M05 — sigue vigente sin cambios)
├── helpers/                       ← (M05 — uniqueEmail / uniqueOrderId)
├── pages/                         ← (M04 — sigue vigente sin cambios)
├── services/                      ← 🆕 capa de servicios HTTP
│   ├── BaseService.ts             ← 🆕 ABSTRACT — baseURL, api, dispose, url, basePath
│   ├── AuthService.ts             ← 🆕 factory: create(baseURL)
│   ├── OrderService.ts            ← 🆕 create(baseURL, token, country) — Bearer + X-Country-Code
│   ├── PizzaService.ts            ← 🆕 create(baseURL, token, country)
│   └── index.ts                   ← 🆕 barrel export
├── tests/
│   ├── api/                       ← 🆕 suite API pura
│   │   ├── auth.spec.ts           ← 🆕 login positivo + negativo
│   │   └── pizzas.spec.ts         ← 🆕 data-driven por mercado
│   └── ui/                        ← ✏️ MUDANZA — la UI, con login por fixture (sin badge)
│       ├── ejemplo.spec.ts        ← flujo login → pizzas → orden (contraparte del API)
│       └── reto.spec.ts           ← login negativo (locked_out_user)
├── types/omnipizza.d.ts           ← ✏️ AMPLÍA — +Pizza, LoginResponse, PizzasResponse, OrderPayload, Order, ApiError (M03 trajo User/Market/Currency/CountryCode/Role)
├── modulo-06-api-layer/           ← 🆕 ESTE MÓDULO
│   ├── README.md
│   ├── ejemplo.spec.ts            ← 🆕 flujo API: login → pizzas → crear orden
│   └── reto.spec.ts               ← 🆕 extender OrderService con getById + test de contrato
└── playwright.config.ts           ← ✏️ DOS projects: `chromium` (UI, tests/ui) y `api` (nuevo) — sin `setup`, sin `dependencies`
```

**Jerarquía de servicios** (el patrón abstracto + factory):

```
              BaseService (abstract)
              ─────────────────────
              · baseURL
              · api: APIRequestContext
              · abstract basePath(): string  ◄── cada hijo DEBE implementarlo
              · url(path)
              · dispose()
                        ▲
                        │ extends
        ┌───────────────┼────────────────┐
        │               │                │
   AuthService     OrderService     PizzaService
   /api/auth       /api/orders      /api/pizzas
   static create   static create    static create
   (factory)       (factory)        (factory)
```

**Pirámide de testing** (cómo M06 complementa lo anterior):

```
                /\
               /  \   ◄── UI E2E (M04–M05) — pocos, caros, regresión visual
              /────\
             /      \
            / API    \  ◄── M06 — muchos, rápidos, validan contratos
           /──────────\
          / unit (–)   \  ◄── fuera del alcance del curso
         /──────────────\
```

**Qué NO existe todavía:**

| Carpeta | Llega en | Para qué |
|---|---|---|
| `tests/setup/` + `.auth/` | M07 | Setup project que hace login una vez y guarda el badge (`storageState`) para que la UI arranque ya autenticada |
| `.github/workflows/` | M08 | CI/CD con matrix por browser + traces como artefactos |

Nota: `types/` (de M03) alimenta TANTO a UI como a API — ese es el premio del tipado fuerte. Si OmniPizza cambia `interface Pizza`, los specs de UI y API rompen al mismo tiempo y los arreglas de un solo golpe.

---

## Analogía de apertura

Hasta ahora el framework "entra por la puerta principal" (UI). Pero los servidores aceptan llamadas directas al backend (API). Probar por API es **como abrir Postman dentro del test**: más rápido, más estable, y valida contratos sin pintar píxeles.

Aquí aparece por primera vez la **clase abstracta** — un **formato obligatorio de reporte de bug** corporativo. Cada servicio concreto (`AuthService`, `OrderService`, `PizzaService`) **debe** rellenar las secciones obligatorias (`basePath()`) antes de contar como servicio válido. TypeScript se niega a compilar un hijo incompleto — como el sistema de tickets rechaza un reporte sin severidad.

---

## ¿Por qué hasta ahora?

En M04 `BasePage` era una **clase normal**. `abstract` no aportaba; con un solo hijo no hay patrón.

Ahora en M06 tenemos **3 servicios** (`Auth`, `Order`, `Pizza`) que comparten `baseURL`, `api`, `dispose()`. Sin `abstract`:
- El compilador no garantiza que cada hijo defina `basePath()`.
- Alguien podría instanciar `BaseService` directo y romper invariantes.

**Ahora sí vale la pena.** Ese es el sentido de "just-in-time": el concepto entra cuando el problema lo reclama.

Y la capa de API llega **justo después de las fixtures (M05)** por una razón práctica: ya tienes el `test` con `standardUser` y las páginas inyectadas, así que la UI no necesita nada nuevo para convivir con la API — cada una vive en su propio project. El badge (`storageState`) todavía no existe: se introduce en M07, cuando el login repetido por UI empiece a doler.

---

## Conceptos JIT

| Concepto | Analogía |
|---|---|
| Pirámide de testing | Muchos tests rápidos en API, pocos (y caros) por UI |
| `APIRequestContext` | Postman embebido en Playwright |
| `abstract class` | Formato obligatorio de reporte de bug: las secciones obligatorias deben estar |
| `abstract method` | Sección que CADA hijo debe rellenar — sin excepción |
| `static async create(...)` | Factory — construye la instancia con todo conectado |
| `extraHTTPHeaders: { Authorization }` | Bearer configurado una vez para toda la instancia |
| `dispose()` | Limpieza: cierra el contexto HTTP al final del TC |
| `test.beforeAll` / `test.afterAll` | Hermanos SUITE-scoped de los `beforeEach`/`afterEach` de M05 — corren 1 vez por archivo/describe, no por TC |

---

## Arquitectura

```
services/
├── BaseService.ts        ← ABSTRACT — baseURL, api, dispose(), url(), basePath()
├── AuthService.ts        ← factory: create(baseURL)
├── OrderService.ts       ← factory: create(baseURL, token, country) — Bearer + X-Country-Code
└── PizzaService.ts       ← factory: create(baseURL, token, country)

tests/api/
├── auth.spec.ts          ← login positivo + negativo
└── pizzas.spec.ts        ← data-driven por mercado

tests/ui/
├── ejemplo.spec.ts       ← flujo login → pizzas → orden por UI (login por fixture)
└── reto.spec.ts          ← login negativo (locked_out_user)
```

---

## Paso a paso

### Paso 0 — Pre-requisitos

```bash
# Desde proyecto/
cd proyecto
pnpm install
pnpm typecheck     # debe pasar
```

Este módulo NO usa `storageState` ni un setup project — el project `api` está aislado a propósito y la UI hace login por fixture, como en M05. Abre `playwright.config.ts` y observa que ningún project tiene `dependencies` ni `storageState`.

---

### Paso 1 — Dependencias requeridas

**M06 no añade paquetes npm nuevos.** `APIRequestContext` ya viene en `@playwright/test`.

```bash
pnpm list @playwright/test dotenv typescript @types/node
# Las 4 deben aparecer. Si no:
#   pnpm install     (si package.json ya las lista)
#   pnpm add -D @playwright/test dotenv typescript @types/node
```

---

### Paso 2 — Crear `services/` y `tests/api/`

```bash
mkdir services
mkdir tests
mkdir tests/api
```

`tests/` ya existe desde M05 (ahí vivían `ejemplo.spec.ts` y `reto.spec.ts`) — si ya existe, salta esa línea.

Crea los 7 archivos abriéndolos en VS Code (cada `code <ruta>` abre el archivo como nuevo; guárdalo con `Ctrl+S` para que exista en disco):

```bash
code services/BaseService.ts
code services/AuthService.ts
code services/OrderService.ts
code services/PizzaService.ts
code services/index.ts
code tests/api/auth.spec.ts
code tests/api/pizzas.spec.ts
```

Los esqueletos mínimos de `BaseService.ts`, `AuthService.ts` y `index.ts` los tienes en **El spec paso a paso** (con su `// @file`). `PizzaService` y `OrderService` siguen el mismo molde — los completas con el ejemplo.

---

### Paso 3 — Ajustes a `playwright.config.ts` (dos projects: `chromium` para la UI y `api` nuevo)

> **📐 Config — SUMA el project `api`; `chromium` solo acota su `testMatch` (M06)**
> ```diff
>   projects: [
> +   { name: "chromium", use: { ...devices["Desktop Chrome"] },
> +     testMatch: [/tests\/ui\/.*\.spec\.ts/] },
> +   { name: "api",
> +     use: { baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com" },
> +     testMatch: [/tests\/(ejemplo|reto)\.spec\.ts/, /tests\/api\/.*\.spec\.ts/] },
>   ]
> ```
> **Se mantiene:** el project `chromium` de M05 (UI, login por fixture) — solo se le acota el `testMatch` a `tests/ui/` porque ahora conviven con specs de API que NO deben correr bajo navegador. **Entra:** el project `api` — **sin `storageState` y sin `dependencies`**. Corre contra `API_URL` (backend); `chromium` sigue usando `BASE_URL` (frontend), definido en el `use:` raíz. No hay project `setup`: el badge (`storageState`) llega en M07.

Hay que **definir el project `api`**, DEBAJO de `chromium` (que dejas intacto salvo su `testMatch`). NO depende de ningún otro project ni hereda storageState.

Dentro del array `projects`:

```ts
{
  name: "api",
  use: {
    baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com",
  },
  testMatch: [/tests\/(ejemplo|reto)\.spec\.ts/, /tests\/api\/.*\.spec\.ts/],
},
```

> 🔍 **Detalle que parece obvio — `{ name: "api", ... }` sin `storageState`, sin `dependencies`**
> **Por qué así (y no la alternativa obvia):** los tests de API se autentican por su cuenta — `AuthService.create()` hace login y obtiene un `access_token` fresco que `PizzaService`/`OrderService` inyectan como `Authorization: Bearer`. No dependen de ninguna sesión de navegador.
> **Qué pasa si lo cambias:** si le agregas `storageState`, Playwright intentaría cargar cookies de UI en un `APIRequestContext` que no las usa (ruido, y dependencia falsa de un artefacto de otra capa). Si le agregas `dependencies` hacia otro project, cada corrida de API esperaría a que ese project termine — más lento y acoplado a algo que la API no consume. El aislamiento es intencional.

Con dos familias de specs conviviendo en `tests/` (UI en `tests/ui/`, API en el resto), `chromium` acota su suite con `testMatch: [/tests\/ui\/.*\.spec\.ts/]` en vez de un `testIgnore` — declara "esto SÍ" en vez de "esto NO". `pnpm exec playwright test --list --project=chromium` muestra solo `tests/ui/*`; `--project=api` muestra el resto, sin mezclarse.

**Estado completo del config en M06:**

```ts
// playwright.config.ts — Estado en M06 (UI por fixture + capa de API nueva)
// ---------------------------------------------------------------------
// M06 introduce la capa de servicios (services/) para probar la API SIN
// navegador. Aquí NO hay setup, NI storageState, NI `.auth/`: dos
// projects independientes, sin `dependencies`.
//   - `chromium`: UI (tests/ui/**). Cada test hace login por UI con la
//     fixture `loginPage` (mecanismo de M05). Corre contra BASE_URL.
//   - `api`: capa de servicios (tests/api/** y tests/{ejemplo,reto}.spec.ts).
//     Cada servicio crea su propio contexto autenticado vía AuthService.
//     Corre contra API_URL (backend), no BASE_URL — por eso api NO hereda
//     el `baseURL` raíz.
// El badge (storageState) llega después, en M07 (Setup).

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  testDir: ".",

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
    // --- UI (login por fixture, sin badge ni dependencies) ---
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: [/tests\/ui\/.*\.spec\.ts/],
    },

    // --- API (🆕 M06) — sin storageState, sin dependencies: la API no pasa por la UI ---
    {
      name: "api",
      use: { baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com" },
      testMatch: [/tests\/(ejemplo|reto)\.spec\.ts/, /tests\/api\/.*\.spec\.ts/],
    },
  ],
});
```

Añade los scripts de M06 al `package.json` (`test:ui` corre el project `chromium`; `test:pw-ui` y `test:pw-api` abren la **UI Mode** de Playwright, el segundo limitado al project `api`):

```json
"scripts": {
  "test:ui": "playwright test --project=chromium",
  "test:pw-ui": "playwright test --ui",
  "test:pw-api": "playwright test --ui --project=api",
  "test:api": "playwright test --project=api",
  "m6": "playwright test --project=api"
}
```

Y verifica que `tsconfig.json` incluya `pages/`, `fixtures/` (heredados) y `services/` (nuevo):

```json
{
  "include": [
    "playwright.config.ts",
    "types/**/*.ts",
    "types/**/*.d.ts",
    "pages/**/*.ts",
    "fixtures/**/*.ts",
    "helpers/**/*.ts",
    "services/**/*.ts",
    "tests/**/*.ts"
  ]
}
```

---

### Paso 9 — Resolver el reto

El reto de este módulo es de API: extender `OrderService` con `getById(orderId)` y escribir un **test de contrato** (200 + schema, 404 y 403 `Access denied`). Está en **🚩 Reto M6**.

---

### Paso 9 bis — Refactor: de hooks a fixtures (cuándo usar cada uno)

> 🎯 No reemplazas `auth.spec.ts`/`pizzas.spec.ts`/`orders.spec.ts` — los **comparas** contra la misma suite reescrita con fixtures (`tests/api/with-fixtures/`). Los 6 archivos corren juntos en `pnpm test:api`.

**El síntoma.** Un hook (`beforeAll`/`afterAll`) vive **dentro de un solo archivo** — no se importa. `auth.spec.ts` comparte 1 `AuthService` entre sus 2 tests con `beforeAll`, pero `pizzas.spec.ts` repite `AuthService.create()` + `login()` + `dispose()` **dentro del `for`** (una vez por mercado, 5 ejecuciones) porque no puede pedirle prestado el hook de otro archivo. Eso es lo que resuelven las fixtures: **reutilización entre archivos**.

**La fixture.** `fixtures/api.ts` compone sobre el `test` de M05 (hereda `standardUser` gratis) y suma `authService` (scope `worker`, un `AuthService` por archivo) y `accessToken` (scope `test`).

```ts
// @file fixtures/api.ts
// ============================================================
// fixtures/api.ts — Custom fixtures para la capa de API (M06)
// ============================================================
// Analogía QA: extiende el `test` de fixtures/omnipizza.ts (M05) en
// vez de reescribirlo — así los specs de API heredan `standardUser`
// gratis y solo suman lo propio de esta capa: `authService`
// (worker-scoped, un solo APIRequestContext por archivo, como hacía
// el beforeAll/afterAll manual) y `accessToken` (test-scoped, un
// login fresco por TC vía `authService.login(standardUser)`).
// ============================================================

import { test as omnipizzaTest, expect } from "./omnipizza";
import { AuthService } from "../services";

export const API_URL =
  process.env.API_URL ?? "https://omnipizza-backend.onrender.com";

type ApiFixtures = {
  accessToken: string;
};

type ApiWorkerFixtures = {
  authService: AuthService;
};

export const test = omnipizzaTest.extend<ApiFixtures, ApiWorkerFixtures>({
  // eslint-disable-next-line no-empty-pattern
  authService: [
    async ({}, use) => {
      const auth = await AuthService.create(API_URL);
      await use(auth);
      await auth.dispose();
    },
    { scope: "worker" },
  ],

  accessToken: async ({ authService, standardUser }, use) => {
    const { access_token } = await authService.login(standardUser);
    await use(access_token);
  },
});

export { expect };
```

> Una fixture solo puede depender de otras de **igual o mayor** alcance: por eso `authService` (worker) no depende de `standardUser` (test), pero `accessToken` (test) sí puede pedir ambas.

**Antes / después en `auth.spec.ts`:**

| | Con hooks (`auth.spec.ts`) | Con fixtures (`with-fixtures/auth.spec.ts`) |
|---|---|---|
| Setup | `test.beforeAll` + `let auth: AuthService` | `authService` como parámetro del test |
| Teardown | `test.afterAll` manual | Automático — el `use()` de la fixture lo garantiza |
| Usuario | `users.find(...)` manual | `standardUser` (heredado de M05) |
| Firma del test | No declara qué necesita (variable de closure) | `async ({ authService, standardUser })` — explícito |

```ts
// @file tests/api/with-fixtures/auth.spec.ts
// ============================================================
// tests/api/with-fixtures/auth.spec.ts — la MISMA suite de
// auth.spec.ts, refactorizada a fixtures (M06 — Paso 9 bis)
// ============================================================
// Compara este archivo con ../auth.spec.ts línea por línea:
// el `beforeAll`/`afterAll` + `users.find(...)` manual desaparecen,
// reemplazados por `{ authService, standardUser }` como parámetros
// del test. Ver README → Paso 9 bis para el porqué.
// ============================================================

import { test, expect } from "../../../fixtures/api";

test.describe("AuthService @api (con fixtures)", () => {
  test("successful login returns access_token", async ({
    authService,
    standardUser,
  }) => {
    const res = await authService.login(standardUser);
    expect(res.access_token).toBeTruthy();
    expect(typeof res.access_token).toBe("string");
  });

  test("login with invalid password fails", async ({
    authService,
    standardUser,
  }) => {
    await expect(
      authService.login({ ...standardUser, password: "wrong-password" }),
    ).rejects.toThrow(/Login failed/);
  });
});
```

> 🧭 **Hooks vs Fixtures — el criterio real no es "fixtures son mejores", es *reutilización entre archivos*.** Quédate con hooks cuando el setup es de un solo archivo; sube a fixtures en cuanto un segundo archivo necesite el mismo recurso, o quieras el teardown garantizado por diseño y la firma del test explícita. Mismo criterio que usaste en M04 para `abstract`: el patrón se paga cuando **2 o más consumidores** lo necesitan.

---

### Paso 10 — Versiona tu trabajo (Git JIT)

La capa de servicios + su config + el módulo son una unidad coherente: un commit por capa deja un historial legible (y, en M08, fácil de revertir en CI).

```bash
git add services tests playwright.config.ts
git commit -m "feat(m06): API layer con BaseService abstracta"
git log --oneline -1
```

**Cómo verificas:** `git log --oneline -1` muestra el commit `feat(m06): ...` en la cima.

---

## 🔎 Cómo probar los endpoints en Swagger (sin código)

Antes (o en vez) de correr un test, puedes **ver con tus propios ojos** qué hace cada endpoint: ir a la URL, mandar la petición y leer la respuesta. Es la **fuente de la verdad** contra la que comparar lo que devuelven `AuthService`, `PizzaService` y `OrderService`.

| Endpoint | Método | ¿Requiere auth? | Headers relevantes | Lo envuelve |
|---|---|---|---|---|
| `/api/auth/login` | POST | No | — | `AuthService.login()` |
| `/api/pizzas` | GET | **Sí** (Bearer) | `X-Country-Code` (MX/US/CH/JP/SA), `X-Language` (opc.) | `PizzaService.list()` |
| `/api/checkout` | POST | **Sí** (Bearer) | `Authorization: Bearer`, `X-Country-Code` | `OrderService.createOrder()` |
| `/api/orders` | GET | **Sí** (Bearer) | `Authorization: Bearer` | `OrderService.listMine()` |
| `/api/orders/{order_id}` | GET | **Sí** (Bearer) | `Authorization: Bearer` | `OrderService.getById()` (lo escribes en el reto) |

> **Crear vs. leer órdenes:** la orden **se crea con `POST /api/checkout`**; `/api/orders` es solo lectura (historial y detalle).

1. **Abre el Swagger UI:** https://omnipizza-backend.onrender.com/api/docs (FastAPI). La primera petición del día puede tardar 30-40s (cold start de Render).
2. **Autentícate:** `POST /api/auth/login` → *Try it out* → `{ "username": "standard_user", "password": "pizza123" }` → *Execute*. Copia el `access_token`.
3. **Autoriza:** botón *Authorize* → pega **solo el token, sin la palabra `Bearer`** (Swagger ya la antepone; si la duplicas, 401).
4. **`GET /api/pizzas`** con el header `X-Country-Code: MX` (y luego `US`/`CH`/`JP`/`SA`): cambian precios y `currency` — exactamente lo que itera `ejemplo.spec.ts`.
5. **`POST /api/checkout`** con un body válido del mercado (ej. MX: `country_code`, `items: [{ "pizza_id": "p01", "quantity": 1 }]`, `name`, `address`, `phone`, `colonia`). Si falta el campo de dirección del mercado (MX `colonia`, US `zip_code`, CH `plz`, JP `prefectura`, SA `district`) recibes **400** con `{"error": "Field '...' is required for country ..."}`; un body mal formado (p. ej. `address` de menos de 5 caracteres) da **422** con el body de Pydantic.
6. **`GET /api/orders`** (historial, envuelto en `{ "orders": [...] }`) y **`GET /api/orders/{order_id}`** (detalle). Para el reto necesitas los errores reales: orden inexistente → **404** `Order ... not found`; orden de otro usuario → **403** `Access denied`.

> 💡 Cuando un test API falle, repite la llamada a mano en Swagger y compara: así sabes si el bug está en el test, en el servicio o en el backend.

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo (project api):** `pnpm m6`
- **Suite API completa:** `pnpm test:api`
- **Solo la capa de UI (login por fixture):** `pnpm test:ui` (project `chromium`; necesita los navegadores: `pnpm exec playwright install chromium`)
- **Todo el módulo (UI + API):** `pnpm test`
- **UI Mode de Playwright (explorador interactivo):** `pnpm test:pw-ui` (todo) · `pnpm test:pw-api` (solo API)
- **Verificar tipos:** `pnpm typecheck`
- **Filtrar:** por tag (`pnpm exec playwright test --grep "@api"` / `--grep "@smoke"`) o por archivo (`pnpm exec playwright test tests/reto.spec.ts --project=api`)
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** las variables de entorno van con `$env:VAR="x"; pnpm m6` (no `VAR=x pnpm m6`). Ej.: `$env:API_URL="https://mi-backend"; pnpm m6`

> M06 corre contra el **backend** (`API_URL`) para el project `api`. El project `chromium` (UI) usa `BASE_URL` (frontend) — cada project apunta a lo suyo.

---

## Outcome esperado

- [ ] Entiendes **por qué** `abstract` hasta ahora (y no en M03).
- [ ] Sabes qué pasa si intentas `new BaseService(...)` (TS lo bloquea).
- [ ] Puedes explicar el factory `static async create`.
- [ ] Sabes cómo se inyecta el Bearer con `extraHTTPHeaders`.
- [ ] Llamas `await service.dispose()` al final de cada uso.
- [ ] Los mismos contratos (`User`, `Market`, `Pizza`) alimentan UI y API.
- [ ] Completaste `getById(orderId)` en `OrderService` y su test de contrato: 200 + schema, 404 y 403 `Access denied` para la orden de otro usuario.
- [ ] Comparaste el MISMO flujo (login → pizzas → orden) por UI y por API (Paso 8) y sabes qué cubre cada capa.
