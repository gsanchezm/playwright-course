# Módulo 05 — API Layer (N-layered completo)

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

> 💡 **Para el facilitador:** señala que `types/` (de M02) alimenta TANTO a UI como a API — ese es el premio del tipado fuerte. Si OmniPizza cambia `interface Pizza`, los specs de UI y API rompen al mismo tiempo y los arreglas de un solo golpe.

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

> 💡 **Para el facilitador:** este módulo NO usa `storageState` ni el setup project — el project `api` está aislado a propósito. Las cookies de UI no contaminan los tests de API. Pídeles que abran `playwright.config.ts` y vean que el project `api` **no** tiene `dependencies: ['setup']` y **no** tiene `storageState`.

---

### Paso 1 — Dependencias requeridas

**M05 no añade paquetes npm nuevos.** `APIRequestContext` ya viene en `@playwright/test`.

```bash
pnpm list @playwright/test dotenv typescript @types/node 2>/dev/null
# Las 4 deben aparecer. Si no:
#   pnpm install     (si package.json ya las lista)
#   pnpm add -D @playwright/test dotenv typescript @types/node
```

---

### Paso 2 — Crear `services/` y `tests/api/`

```bash
mkdir -p services tests/api
touch services/BaseService.ts services/AuthService.ts services/OrderService.ts \
      services/PizzaService.ts services/index.ts
touch tests/api/auth.spec.ts tests/api/pizzas.spec.ts
```

**Esqueletos mínimos:**

📄 `services/BaseService.ts` — **primera clase abstracta del curso**:

```ts
import type { APIRequestContext } from "@playwright/test";

export abstract class BaseService {
  protected constructor(
    protected readonly api: APIRequestContext,
    protected readonly baseURL: string,
  ) {}

  // Cada hijo DEBE definirlo o TS no compila.
  protected abstract basePath(): string;

  protected url(path = ""): string {
    return `${this.baseURL}${this.basePath()}${path}`;
  }

  async dispose(): Promise<void> {
    await this.api.dispose();
  }
}
```

📄 `services/AuthService.ts` — primera clase concreta + factory async:

```ts
import { request } from "@playwright/test";
import { BaseService } from "./BaseService";
import type { User } from "../types";

export async function createAuthedContext(
  baseURL: string,
  token: string,
  extra: Record<string, string> = {},
) {
  return await request.newContext({
    baseURL,
    extraHTTPHeaders: { Authorization: `Bearer ${token}`, ...extra },
  });
}

export class AuthService extends BaseService {
  protected basePath() { return "/api/auth"; }

  static async create(baseURL: string): Promise<AuthService> {
    const api = await request.newContext({ baseURL });
    return new AuthService(api, baseURL);
  }

  async login(user: User): Promise<{ access_token: string }> {
    const res = await this.api.post(this.url("/login"), {
      data: { username: user.username, password: user.password },
    });
    if (!res.ok()) throw new Error(`login failed (${res.status()}): ${await res.text()}`);
    return await res.json();
  }
}
```

📄 `services/index.ts` (barrel):

```ts
export { BaseService } from "./BaseService";
export { AuthService, createAuthedContext } from "./AuthService";
export { OrderService } from "./OrderService";
export { PizzaService } from "./PizzaService";
```

(`PizzaService` y `OrderService` siguen el mismo molde — los completas con el ejemplo.)

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

> 💡 **Para el facilitador:** después de añadir el project `api`, muestra **dos comandos lado a lado**:
> ```bash
> pnpm exec playwright test --project=ui-chromium tests/api/auth.spec.ts   # se salta (testIgnore)
> pnpm exec playwright test --project=api                                  # los corre todos
> ```
> Eso demuestra en vivo que **el mismo archivo puede pertenecer o no a un project según las reglas de match/ignore**.

---

### Paso 4 — Lectura guiada de `services/BaseService.ts`

Abre el archivo y señala punto por punto:

1. **`export abstract class BaseService`** — la palabra **`abstract` aparece por primera vez en el curso**. Hazlo explícito en voz alta.
2. **`protected constructor(...)`** — protegido, no público. Eso significa que **no puedes hacer `new BaseService(...)` desde fuera**. Solo las hijas pueden llamarlo (vía `super(...)`).
3. **`protected abstract basePath(): string`** — método sin implementación. Cada hijo DEBE proveerlo o TS no compila.
4. **`url(path)`** — helper compartido por todas las hijas: junta `baseURL + basePath() + path`.
5. **`dispose()`** — cierra el `APIRequestContext`. Si no lo llamas, hay leaks.

> 💡 **Pruébalo en vivo:** abre un editor y escribe `const x = new BaseService(...)`. TypeScript debe quejarse con **"Cannot create an instance of an abstract class"**. Eso es el valor de `abstract` en una sola línea. (No guardes el archivo — es solo para demostrarlo).

---

### Paso 5 — Lectura guiada de `AuthService.ts` y `PizzaService.ts`

Cosas que señalar:

- **`static async create(...)`** — el factory. Reemplaza al `new ServiceX(...)` directo porque necesita **construcción async** (Playwright crea el `APIRequestContext` con `await playwright.request.newContext(...)`).
- **`createAuthedContext(baseURL, token, extraHeaders)`** — helper que inyecta `Authorization: Bearer <token>` y `X-Country-Code` en TODAS las requests del contexto.
- Cada servicio **implementa `basePath()`** — TS no compila sin eso.
- Tras usar, **siempre `await service.dispose()`** — recuérdalo al grupo varias veces.

---

### Paso 6 — Correr la suite API

```bash
# Solo el project api (sin UI projects ni setup)
pnpm test:api

# O directamente
pnpm exec playwright test --project=api
```

**Qué debería pasar:**

- Verás los tests de `tests/api/*.spec.ts` + el `ejemplo.spec.ts` de este módulo.
- Los tests **no abren navegador** — son llamadas HTTP puras. Por eso son rápidos.
- En la primera corrida del día puede tardar 30-40s (cold start de Render).

---

### Paso 7 — Lectura guiada del flujo del `ejemplo.spec.ts`

Identifica el patrón con el grupo:

1. **Auth**: `AuthService.create(API_URL)` → `auth.login(user)` → guardas el `access_token` → `auth.dispose()`.
2. **Reutilización del token**: el mismo token se usa en cada `PizzaService.create(...)`.
3. **Iteración por mercado**: el bucle `for (const market of markets)` crea un `PizzaService` por mercado, lista pizzas, valida currency, dispose.

**Patrón clave que repetir en voz alta:** *"un servicio por endpoint family, factory async, dispose siempre"*.

---

### Paso 8 — Comparativa con UI (5 min)

Mide en el pizarrón:

| Aspecto | Test UI (M03) | Test API (M05) |
|---|---|---|
| Duración por TC | ~10-15s | <1s |
| Determinismo | Medio (DOM, animaciones) | Alto (HTTP) |
| Cubre regresión visual | Sí | No |
| Cubre lógica de negocio | Indirecto | Directo |

**Mensaje:** la API es la base de la pirámide. **No reemplaza** los E2E de UI; los **acompaña**.

---

### Paso 9 — Resolver el reto

Tienes que extender `PizzaService` con DOS métodos nuevos: `getByMarket(market)` y `getById(id)`. Y luego escribir un test que los use juntos.

El reto sigue **Qué hacer / Pista / Cómo verificar** por cada TODO, indicando dónde escribir cada método dentro de `services/PizzaService.ts`.

---

## 🔍 Detalles que parecen obvios pero no lo son

### `{ name: "api", use: { baseURL: ... }, testMatch: [...] }` (sin `storageState`, sin `dependencies`)
- **Qué es:** el project `api` se define sin `storageState: STORAGE_STATE` y sin `dependencies: ["setup"]`, a diferencia de los 3 projects `ui-*`.
- **Por qué así (y no la alternativa obvia):** los tests de API se autentican por su cuenta — `AuthService.create()` hace login y obtiene un `access_token` fresco que `PizzaService`/`OrderService` inyectan como `Authorization: Bearer`. No necesitan la sesión de navegador que el setup deja en `.auth/user.json`.
- **Qué pasa si lo cambias:** si le agregas `storageState`, Playwright intentaría cargar cookies de UI en un `APIRequestContext` que no las usa (ruido, y dependencia falsa de un artefacto de otra capa). Si le agregas `dependencies: ["setup"]`, cada corrida de API esperaría al login de UI por navegador — más lento y acoplado a algo que la API no consume. El aislamiento es intencional.

### `request` / `APIRequestContext` (no `page.request`)
- **Qué es:** los servicios importan `request` de `@playwright/test` y crean su contexto con `await request.newContext({ baseURL })`. El tipo del contexto es `APIRequestContext`.
- **Por qué así (y no la alternativa obvia):** `request.newContext()` levanta un cliente HTTP **sin navegador**. La alternativa `page.request` existe, pero exige una `page` (y por tanto un browser arrancado), que aquí no se necesita para nada.
- **Qué pasa si lo cambias:** si usaras `page.request`, tendrías que pedir el fixture `page` y pagar el costo de abrir un navegador por test. Por eso los tests del project `api` corren en menos de 1s y "no abren navegador" — son llamadas HTTP puras.

### `export abstract class BaseService`
- **Qué es:** la clase base es `abstract` y declara `protected abstract basePath(): string` más un `protected constructor(...)`.
- **Por qué así (y no la alternativa obvia):** `abstract` impide instanciar la base directamente y **obliga** a cada hijo (`AuthService`, `OrderService`, `PizzaService`) a implementar `basePath()`. Con un solo servicio no valdría la pena; con 3 que comparten `api`, `baseURL`, `url()` y `dispose()`, evita duplicación y garantiza el contrato.
- **Qué pasa si lo cambias:** escribir `new BaseService(...)` no compila — TypeScript responde **"Cannot create an instance of an abstract class"**. Y si quitas `abstract` de `basePath()`, el compilador deja de exigir que cada hijo lo defina, y `url()` podría construir rutas contra un `basePath` inexistente.

### `if (!res.ok()) throw new Error(... ${res.status()} ...)`
- **Qué es:** cada método (`login`, `list`, `createOrder`, `listMine`) chequea `res.ok()` y, si falla, lanza incluyendo `res.status()` y el body.
- **Por qué así (y no la alternativa obvia):** `res.ok()` es `true` para cualquier 2xx; chequearlo explícito convierte un 4xx/5xx en un error claro **antes** de intentar `res.json()`. La alternativa "asumir 200 y parsear directo" produciría un crash opaco al desserializar un body de error.
- **Qué pasa si lo cambias:** sin el guard, un login con password inválido devolvería un body de error y `res.json()` lo parsearía como si fuera el token — el test fallaría más tarde y con un mensaje confuso. Justamente `auth.spec.ts` valida `rejects.toThrow(/Login failed/)` apoyado en este patrón.

### `this.api.post(this.url("/login"), { data: { ... } })`
- **Qué es:** los POST mandan el body con la opción `data` (objeto JS), no `form`.
- **Por qué así (y no la alternativa obvia):** `data` con un objeto serializa a **JSON** y fija `Content-Type: application/json`, que es lo que espera el backend de OmniPizza. `form` enviaría `application/x-www-form-urlencoded`, otro formato de body.
- **Qué pasa si lo cambias:** si cambias `data` por `form`, el backend recibe campos urlencoded en vez de JSON; lo más probable es un 4xx (body no parseable como JSON) y, gracias al guard de `res.ok()`, un `Error` con el status real.

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo (project api):** `pnpm m5`
- **Suite API completa:** `pnpm test:api`
- **UI mode:** `pnpm test:ui`
- **Debug:** `pnpm test:debug`
- **Filtrar:** por tag (`pnpm exec playwright test --grep @api` / `--grep @regression`) o por archivo (`pnpm exec playwright test modulo-05-api-layer/reto.spec.ts --project=api`)
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
