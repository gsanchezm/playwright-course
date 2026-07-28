# M07 · Guía del módulo: API Layer

> 🎁 **Proyecto de referencia.** En el repo del curso, este módulo incluye una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el estado de este módulo ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json`, independiente del monorepo). Úsalo como **solución de referencia**: ábrelo aparte y corre `pnpm install` → `cp .env.example .env` → `pnpm test`. Los pasos de esta guía siguen construyendo **tu** proyecto incremental; `proyecto/` es el "ya resuelto".

**Duración estimada:** 50-60 min
**Piezas que suma al framework:**
- `services/BaseService.ts` — **clase abstracta** (primera aparición del término en el curso).
- `services/AuthService.ts`, `OrderService.ts`, `PizzaService.ts`.
- `tests/api/*.spec.ts` — suite API pura.
- `types/omnipizza.d.ts` **se amplía**: `Pizza`, `LoginResponse`, `PizzasResponse`, `OrderPayload`, `Order`, `ApiError` — los contratos de request/response que hasta ahora no hacían falta (M03–M06 solo tocan la app por UI).

**M07 SUMA, no reemplaza:** `pages/`, `fixtures/`, `tests/setup/` y los projects `setup`+`chromium` de M04-M06 siguen aquí sin cambios (los tests heredados viven en `tests/ui/`) — la capa de API corre AL LADO de la de UI, no en su reemplazo.

---

## 🏗️ Arquitectura al terminar este módulo

Aparece la carpeta **`services/`** (la capa de API) y se llena **`tests/api/`** (la suite que la consume). La novedad conceptual: por primera vez en el curso aparece una **clase abstracta**. Y algo que NO es novedad y por eso vale la pena señalarlo: `pages/`, `fixtures/`, `tests/setup/` (POM + storageState de M04-M06) **siguen aquí, intactos** — M07 SUMA una capa, no reemplaza la anterior. `tests/ejemplo.spec.ts`/`tests/reto.spec.ts` de M06 se mudan a `tests/ui/` (mismo contenido) solo para no chocar de nombre con los `ejemplo.spec.ts`/`reto.spec.ts` NUEVOS de este módulo, que son de API.

```
playwright-course/
├── .auth/                         ← (M06 — sigue vigente; solo lo usa el project chromium)
├── data/                          ← (M03 — compartido entre UI y API)
├── fixtures/                      ← (M05 — sigue vigente sin cambios)
├── helpers/                       ← (M05 — uniqueEmail / uniqueOrderId)
├── pages/                         ← (M04 — sigue vigente sin cambios)
├── services/                      ← 🆕 capa de servicios HTTP
│   ├── BaseService.ts             ← 🆕 ABSTRACT — baseURL, api, dispose, url, basePath
│   ├── AuthService.ts             ← 🆕 factory: create(baseURL)
│   ├── OrderService.ts            ← 🆕 create(baseURL, token, country) — Bearer + X-Country
│   ├── PizzaService.ts            ← 🆕 create(baseURL, token, country)
│   └── index.ts                   ← 🆕 barrel export
├── tests/
│   ├── api/                       ← 🆕 suite API pura
│   │   ├── auth.spec.ts           ← 🆕 login positivo + negativo
│   │   └── pizzas.spec.ts         ← 🆕 data-driven por mercado
│   ├── setup/                     ← (M06 — UI; el project `api` NO depende de esto)
│   └── ui/                        ← ✏️ MUDANZA — el ejemplo/reto de M06, sin cambios de contenido
│       ├── ejemplo.spec.ts        ← (M06) sesión heredada, catálogo autenticado
│       └── reto.spec.ts           ← (M06) login negativo (locked_out_user)
├── types/omnipizza.d.ts           ← ✏️ AMPLÍA — +Pizza, LoginResponse, PizzasResponse, OrderPayload, Order, ApiError (M03 trajo User/Market/Currency/CountryCode/Role)
├── modulo-07-api-layer/           ← 🆕 ESTE MÓDULO
│   ├── README.md
│   ├── ejemplo.spec.ts            ← 🆕 flujo: auth → list pizzas by market
│   └── reto.spec.ts               ← 🆕 extender PizzaService con getByMarket + getById
└── playwright.config.ts           ← ✏️ SUMA el project `api` — `setup`+`chromium` (M06) siguen intactos
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

**Pirámide de testing** (cómo M07 complementa lo anterior):

```
                /\
               /  \   ◄── UI E2E (M04–M06) — pocos, caros, regresión visual
              /────\
             /      \
            / API    \  ◄── M07 — muchos, rápidos, validan contratos
           /──────────\
          / unit (–)   \  ◄── fuera del alcance del curso
         /──────────────\
```

**Qué NO existe todavía:**

| Carpeta | Llega en | Para qué |
|---|---|---|
| `.github/workflows/` | M08 | CI/CD con matrix por browser + traces como artefactos |

Nota: `types/` (de M03) alimenta TANTO a UI como a API — ese es el premio del tipado fuerte. Si OmniPizza cambia `interface Pizza`, los specs de UI y API rompen al mismo tiempo y los arreglas de un solo golpe.

---

## Analogía de apertura

Hasta ahora el framework "entra por la puerta principal" (UI). Pero los servidores aceptan llamadas directas al backend (API). Probar por API es **como abrir Postman dentro del test**: más rápido, más estable, y valida contratos sin pintar píxeles.

Aquí aparece por primera vez la **clase abstracta** — un **formato obligatorio de reporte de bug** corporativo. Cada servicio concreto (`AuthService`, `OrderService`, `PizzaService`) **debe** rellenar las secciones obligatorias (`basePath()`) antes de contar como servicio válido. TypeScript se niega a compilar un hijo incompleto — como el sistema de tickets rechaza un reporte sin severidad.

---

## ¿Por qué hasta ahora?

En M04 `BasePage` era una **clase normal**. `abstract` no aportaba; con un solo hijo no hay patrón.

Ahora en M07 tenemos **3 servicios** (`Auth`, `Order`, `Pizza`) que comparten `baseURL`, `api`, `dispose()`. Sin `abstract`:
- El compilador no garantiza que cada hijo defina `basePath()`.
- Alguien podría instanciar `BaseService` directo y romper invariantes.

**Ahora sí vale la pena.** Ese es el sentido de "just-in-time": el concepto entra cuando el problema lo reclama.

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

El project `api` de este módulo NO usa `storageState` ni depende del setup — está aislado a propósito, así las cookies de UI no contaminan los tests de API. Pero el setup project y el project `chromium` de M06 **siguen en el config**, sin cambios: abre `playwright.config.ts` y observa que `api` **no** tiene `dependencies: ['setup']` y **no** tiene `storageState`, mientras `setup`/`chromium` siguen igual que en M06.

---

### Paso 1 — Dependencias requeridas

**M07 no añade paquetes npm nuevos.** `APIRequestContext` ya viene en `@playwright/test`.

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

`tests/` probablemente ya existe desde M06 (ahí vive `tests/setup/`) — si ya existe, salta esa línea.

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

### Paso 3 — Ajustes a `playwright.config.ts` (UI heredada + project `api` nuevo)

> **📐 Config — SUMA el project `api`, no reemplaza `setup`+`chromium` (M06)**
> ```diff
>   projects: [
> +   { name: "setup", testMatch: /tests\/setup\/.*\.setup\.ts/ },
> +   { name: "chromium", use: {..., storageState: ".auth/user.json"}, dependencies: ["setup"],
> +     testMatch: [/tests\/ui\/.*\.spec\.ts/] },
> +   { name: "api",
> +     use: { baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com" },
> +     testMatch: [/tests\/(ejemplo|reto)\.spec\.ts/, /tests\/api\/.*\.spec\.ts/] },
>   ]
> ```
> **Se mantiene:** `setup` + `chromium` tal cual los dejaste en M06 (mismo `storageState`, misma `dependencies`) — solo se les acota el `testMatch` a `tests/ui/` porque ahora conviven con specs de API que NO deben correr bajo navegador. **Entra:** el project `api` — **sin `storageState` y sin `dependencies`** (aislado a propósito: las cookies de UI no deben contaminar los tests de API). Corre contra `API_URL` (backend); `setup`/`chromium` siguen usando `BASE_URL` (frontend), ahora en el `use:` raíz.

Hay que **definir el project `api`**, DEBAJO de `setup`/`chromium` (que dejas intactos). NO depende del setup ni hereda storageState.

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
> **Por qué así (y no la alternativa obvia):** los tests de API se autentican por su cuenta — `AuthService.create()` hace login y obtiene un `access_token` fresco que `PizzaService`/`OrderService` inyectan como `Authorization: Bearer`. No necesitan la sesión de navegador que el setup deja en `.auth/user.json`.
> **Qué pasa si lo cambias:** si le agregas `storageState`, Playwright intentaría cargar cookies de UI en un `APIRequestContext` que no las usa (ruido, y dependencia falsa de un artefacto de otra capa). Si le agregas `dependencies: ["setup"]`, cada corrida de API esperaría al login de UI por navegador — más lento y acoplado a algo que la API no consume. El aislamiento es intencional.

Con dos familias de specs conviviendo en `tests/` (UI en `tests/ui/`, API en el resto), `chromium` acota su suite con `testMatch: [/tests\/ui\/.*\.spec\.ts/]` en vez de un `testIgnore` — declara "esto SÍ" en vez de "esto NO". `pnpm exec playwright test --list --project=chromium` muestra solo `tests/ui/*`; `--project=api` muestra el resto, sin mezclarse.

**Estado completo del config en M07:**

```ts
// playwright.config.ts — Estado en M07 (UI heredada + capa de API nueva)
// ---------------------------------------------------------------------
// M07 introduce la capa de servicios (services/) para probar la API SIN
// navegador — pero NO reemplaza la capa de UI que traes de M04-M06:
// `setup` + `chromium` (storageState + dependencies) siguen aquí, sin
// cambios, corriendo `tests/ui/*.spec.ts`. El project `api` no usa
// storageState ni setup: cada servicio crea su propio contexto
// autenticado vía AuthService. Corre contra API_URL (backend), no
// BASE_URL (frontend) — por eso api NO hereda el `baseURL` raíz.

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const STORAGE_STATE = ".auth/user.json";

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
    // --- UI (heredada de M04-M06, sin cambios) ---
    { name: "setup", testMatch: /tests\/setup\/.*\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testMatch: [/tests\/ui\/.*\.spec\.ts/],
    },

    // --- API (🆕 M07) — sin storageState, sin dependencies: la API no pasa por la UI ---
    {
      name: "api",
      use: { baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com" },
      testMatch: [/tests\/(ejemplo|reto)\.spec\.ts/, /tests\/api\/.*\.spec\.ts/],
    },
  ],
});
```

Añade los scripts de M07 al `package.json` (mantén `test:setup` y agrega `test:ui-smoke` para el project `chromium`, mismo patrón de M06):

```json
"scripts": {
  "test:setup": "playwright test --project=setup",
  "test:ui-smoke": "playwright test --project=chromium",
  "test:api": "playwright test --project=api",
  "m7": "playwright test --project=api"
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

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo (project api):** `pnpm m7`
- **Suite API completa:** `pnpm test:api`
- **Solo el setup (genera el badge de UI):** `pnpm test:setup`
- **Solo la capa de UI heredada (M04-M06):** `pnpm test:ui-smoke`
- **Verificar tipos:** `pnpm typecheck`
- **Filtrar:** por tag (`pnpm exec playwright test --grep "@api"` / `--grep "@regression"`) o por archivo (`pnpm exec playwright test tests/reto.spec.ts --project=api`)
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** las variables de entorno van con `$env:VAR="x"; pnpm m7` (no `VAR=x pnpm m7`). Ej.: `$env:API_URL="https://mi-backend"; pnpm m7`

> M07 corre contra el **backend** (`API_URL`), no el frontend (`BASE_URL`), para el project `api`. La capa de UI heredada (`setup`/`chromium`) sigue usando `BASE_URL` (frontend) — cada project apunta a lo suyo.

---

## Outcome esperado

- [ ] Entiendes **por qué** `abstract` hasta ahora (y no en M03).
- [ ] Sabes qué pasa si intentas `new BaseService(...)` (TS lo bloquea).
- [ ] Puedes explicar el factory `static async create`.
- [ ] Sabes cómo se inyecta el Bearer con `extraHTTPHeaders`.
- [ ] Llamas `await service.dispose()` al final de cada uso.
- [ ] Los mismos contratos (`User`, `Market`, `Pizza`) alimentan UI y API.
- [ ] Completaste `getByMarket(market)` y `getById(id)` en `PizzaService`.
