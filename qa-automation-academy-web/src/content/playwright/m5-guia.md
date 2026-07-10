# M05 · Guía del módulo: API Layer

> 🎁 **Proyecto de referencia.** En el repo del curso, este módulo incluye una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el estado de este módulo ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json`, independiente del monorepo). Úsalo como **solución de referencia**: ábrelo aparte y corre `pnpm install` → `cp .env.example .env` → `pnpm test`. Los pasos de esta guía siguen construyendo **tu** proyecto incremental; `proyecto/` es el "ya resuelto".

**Duración estimada:** 50-60 min
**Piezas que suma al framework:**
- `services/BaseService.ts` — **clase abstracta** (primera aparición del término en el curso).
- `services/AuthService.ts`, `OrderService.ts`, `PizzaService.ts`.
- `tests/api/*.spec.ts` — suite API pura.

---

## 🏗️ Arquitectura al terminar este módulo

Aparece la carpeta **`services/`** (la capa de API) y se llena **`tests/api/`** (la suite que la consume). La novedad conceptual: por primera vez en el curso aparece una **clase abstracta**.

```
playwright-course/
├── .auth/                         ← (M04 — solo UI usa storageState)
├── data/                          ← (M02 — compartido entre UI y API)
├── fixtures/                      ← (M04 — solo UI)
├── helpers/                       ← (M04 — uniqueEmail / uniqueOrderId)
├── pages/                         ← (M03 — solo UI)
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
│   └── setup/                     ← (M04 — UI; api NO depende de esto)
├── types/                         ← (M02 — los mismos contratos sirven a UI y API)
├── modulo-05-api-layer/           ← 🆕 ESTE MÓDULO
│   ├── README.md
│   ├── ejemplo.spec.ts            ← 🆕 flujo: auth → list pizzas por mercado
│   └── reto.spec.ts               ← 🆕 extender PizzaService con getByMarket + getById
└── playwright.config.ts           ← ✏️ project `api` (sin storageState, sin setup)
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

**Pirámide de testing** (cómo M05 complementa lo anterior):

```
                /\
               /  \   ◄── UI E2E (M03, M04) — pocos, caros, regresión visual
              /────\
             /      \
            / API    \  ◄── M05 — muchos, rápidos, validan contratos
           /──────────\
          / unit (–)   \  ◄── fuera del alcance del curso
         /──────────────\
```

**Qué NO existe todavía:**

| Carpeta | Llega en | Para qué |
|---|---|---|
| `.github/workflows/` | M06 | CI/CD con matrix por browser + traces como artefactos |

Nota: `types/` (de M02) alimenta TANTO a UI como a API — ese es el premio del tipado fuerte. Si OmniPizza cambia `interface Pizza`, los specs de UI y API rompen al mismo tiempo y los arreglas de un solo golpe.

---

## Analogía de apertura

Hasta ahora el framework "entra por la puerta principal" (UI). Pero los servidores aceptan llamadas directas al backend (API). Probar por API es **como abrir Postman dentro del test**: más rápido, más estable, y valida contratos sin pintar píxeles.

Aquí aparece por primera vez la **clase abstracta** — un **formato obligatorio de reporte de bug** corporativo. Cada servicio concreto (`AuthService`, `OrderService`, `PizzaService`) **debe** rellenar las secciones obligatorias (`basePath()`) antes de contar como servicio válido. TypeScript se niega a compilar un hijo incompleto — como el sistema de tickets rechaza un reporte sin severidad.

---

## ¿Por qué hasta ahora?

En M03 `BasePage` era una **clase normal**. `abstract` no aportaba; con un solo hijo no hay patrón.

Ahora en M05 tenemos **3 servicios** (`Auth`, `Order`, `Pizza`) que comparten `baseURL`, `api`, `dispose()`. Sin `abstract`:
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
# Estando en playwright-course/
pnpm m4            # los fixtures y el setup project funcionan
pnpm typecheck     # debe pasar
```

Este módulo NO usa `storageState` ni el setup project — el project `api` está aislado a propósito. Las cookies de UI no contaminan los tests de API. Abre `playwright.config.ts` y observa que el project `api` **no** tiene `dependencies: ['setup']` y **no** tiene `storageState`.

---

### Paso 1 — Dependencias requeridas

**M05 no añade paquetes npm nuevos.** `APIRequestContext` ya viene en `@playwright/test`.

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

`tests/` probablemente ya existe desde M04 (ahí vive `tests/setup/`) — si ya existe, salta esa línea.

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

### Paso 3 — Ajustes a `playwright.config.ts` (estado al terminar M05)

> **📐 Config — cambios vs M04**
> ```diff
>   projects: [
>     { name: "setup", testMatch: /tests\/setup\/.*\.setup\.ts/ },
> -   { name: "ui-chromium", ..., testIgnore: [/tests\/setup\/.*/] },
> +   { name: "ui-chromium", ..., testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/] },
>     // (mismo testIgnore ampliado para ui-firefox y ui-webkit)
> +   { name: "api",
> +     use: { baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com" },
> +     testMatch: [/tests\/api\/.*\.spec\.ts/, /modulo-05-api-layer\/.*\.spec\.ts/] },
>   ]
> ```
> **Se mantiene:** projects `setup` + 3 browsers. **Entra:** project `api` — **sin `storageState` y sin `dependencies`** (aislado a propósito: las cookies de UI no deben contaminar los tests de API); y el `testIgnore` de los ui-* ahora excluye también los tests de API para que no se corran como UI.

Hay que **añadir el project `api`**. NO depende del setup ni hereda storageState.

Diff sobre el config de M04: dentro del array `projects`, agrega:

```ts
{
  name: "api",
  use: {
    baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com",
  },
  testMatch: [/tests\/api\/.*\.spec\.ts/, /modulo-05-api-layer\/.*\.spec\.ts/],
},
```

> 🔍 **Detalle que parece obvio — `{ name: "api", ... }` sin `storageState`, sin `dependencies`**
> **Por qué así (y no la alternativa obvia):** los tests de API se autentican por su cuenta — `AuthService.create()` hace login y obtiene un `access_token` fresco que `PizzaService`/`OrderService` inyectan como `Authorization: Bearer`. No necesitan la sesión de navegador que el setup deja en `.auth/user.json`.
> **Qué pasa si lo cambias:** si le agregas `storageState`, Playwright intentaría cargar cookies de UI en un `APIRequestContext` que no las usa (ruido, y dependencia falsa de un artefacto de otra capa). Si le agregas `dependencies: ["setup"]`, cada corrida de API esperaría al login de UI por navegador — más lento y acoplado a algo que la API no consume. El aislamiento es intencional.

Y **excluye** la carpeta del módulo 5 de los `ui-*` (para que no la corran sin headers de API):

```ts
{
  name: "ui-chromium",
  // ...
  testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/],
},
// idem en ui-firefox y ui-webkit
```

**Estado completo del config en M05:**

```ts
// playwright.config.ts — Estado en M05
import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const STORAGE_STATE = ".auth/user.json";

export default defineConfig({
  testDir: ".",
  testMatch: [/tests\/.*\.(spec|setup)\.ts/, /modulo-.*\/.*\.spec\.ts/],
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
    { name: "setup", testMatch: /tests\/setup\/.*\.setup\.ts/ },
    {
      name: "ui-chromium",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/],
    },
    {
      name: "ui-firefox",
      use: { ...devices["Desktop Firefox"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/],
    },
    {
      name: "ui-webkit",
      use: { ...devices["Desktop Safari"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/],
    },
    {
      name: "api",  // 🆕 sin storageState, sin dependencies
      use: { baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com" },
      testMatch: [/tests\/api\/.*\.spec\.ts/, /modulo-05-api-layer\/.*\.spec\.ts/],
    },
  ],
});
```

Añade los scripts de M05 al `package.json`:

```json
"scripts": {
  "m5": "playwright test modulo-05-api-layer --project=api",
  "test:api": "playwright test --project=api"
}
```

Y verifica que `tsconfig.json` incluya `services/`:

```json
{
  "include": [
    "playwright.config.ts",
    "types/**/*.ts",
    "types/**/*.d.ts",
    "pages/**/*.ts",
    "services/**/*.ts",
    "fixtures/**/*.ts",
    "helpers/**/*.ts",
    "tests/**/*.ts",
    "modulo-*/**/*.ts"
  ]
}
```

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo (project api):** `pnpm m5`
- **Suite API completa:** `pnpm test:api`
- **UI mode:** `pnpm test:ui`
- **Debug:** `pnpm test:debug`
- **Filtrar:** por tag (`pnpm exec playwright test --grep "@api"` / `--grep "@regression"`) o por archivo (`pnpm exec playwright test modulo-05-api-layer/reto.spec.ts --project=api`)
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** las variables de entorno van con `$env:VAR="x"; pnpm m5` (no `VAR=x pnpm m5`). Ej.: `$env:API_URL="https://mi-backend"; pnpm m5`

> M05 corre contra el **backend** (`API_URL`), no el frontend (`BASE_URL`). El project `api` ya apunta a `process.env.API_URL ?? "https://omnipizza-backend.onrender.com"`.

---

## Outcome esperado

- [ ] Entiendes **por qué** `abstract` hasta ahora (y no en M03).
- [ ] Sabes qué pasa si intentas `new BaseService(...)` (TS lo bloquea).
- [ ] Puedes explicar el factory `static async create`.
- [ ] Sabes cómo se inyecta el Bearer con `extraHTTPHeaders`.
- [ ] Llamas `await service.dispose()` al final de cada uso.
- [ ] Los mismos contratos (`User`, `Market`, `Pizza`) alimentan UI y API.
- [ ] Completaste `getByMarket(market)` y `getById(id)` en `PizzaService`.
