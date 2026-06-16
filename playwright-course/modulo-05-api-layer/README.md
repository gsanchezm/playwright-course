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

> Cada micro-paso lleva la tripleta **Qué hago / Por qué / Cómo verifico**, y dice **qué archivo se crea/edita** y en qué orden. El orden importa: primero `BaseService` (el contrato), luego las clases concretas que lo extienden, después el barrel y por último el config que las pone a correr.

### Paso 0 — Pre-requisitos

**0.1 — Confirmar que M04 está sano**
- **Qué hago:** desde `playwright-course/` corro `pnpm m4` y luego `pnpm typecheck`.
- **Por qué:** M05 reutiliza `types/` (M02), `helpers/` (M04) y `data/`. Si M04 ya rompe, no quiero diagnosticar dos capas a la vez.
- **Cómo verifico:** `pnpm m4` pasa en verde y `pnpm typecheck` no imprime errores.

```bash
# Estando en playwright-course/
pnpm m4            # los fixtures y el setup project funcionan
pnpm typecheck     # debe pasar
```

> 💡 **Para el facilitador:** este módulo NO usa `storageState` ni el setup project — el project `api` está aislado a propósito. Las cookies de UI no contaminan los tests de API. Pídeles que abran `playwright.config.ts` y vean que el project `api` **no** tiene `dependencies: ['setup']` y **no** tiene `storageState`.

---

### Paso 1 — Dependencias requeridas

**1.1 — Verificar que no falta nada (M05 no añade paquetes)**
- **Qué hago:** corro `pnpm list @playwright/test dotenv typescript @types/node`.
- **Por qué:** `APIRequestContext` ya viene dentro de `@playwright/test`. No hay `npm add` nuevo en este módulo — la capa de API se construye con lo que ya tienes.
- **Cómo verifico:** las 4 dependencias aparecen listadas. Si alguna falta, `pnpm install` (si ya están en `package.json`) o `pnpm add -D @playwright/test dotenv typescript @types/node`.

```bash
pnpm list @playwright/test dotenv typescript @types/node
# Las 4 deben aparecer. Si no:
#   pnpm install     (si package.json ya las lista)
#   pnpm add -D @playwright/test dotenv typescript @types/node
```

---

### Paso 2 — Crear `services/` y `tests/api/`

**2.1 — Crear las carpetas y los archivos vacíos**
- **Qué hago:** creo `services/` y `tests/api/`, y creo vacíos los 5 archivos de servicios + los 2 specs de API.
- **Por qué:** `services/` es la **nueva capa** de este módulo (el cliente HTTP), `tests/api/` es la suite que la consume. Tenerlos vacíos primero me deja llenar el contrato (`BaseService`) antes que las hijas.
- **Cómo verifico:** `ls services` muestra los 5 archivos de servicios y `ls tests/api` los 2 specs.

```bash
mkdir services
mkdir tests
mkdir tests/api
```

`tests/` probablemente ya existe desde M04 (ahí vive `tests/setup/`) — si ya existe, salta esa línea.

Crea los 7 archivos abriéndolos en VS Code (cada `code <ruta>` abre el archivo como nuevo; guárdalo con `Ctrl+S` para que exista en disco — los llenarás en 2.2-2.5):

```bash
code services/BaseService.ts
code services/AuthService.ts
code services/OrderService.ts
code services/PizzaService.ts
code services/index.ts
code tests/api/auth.spec.ts
code tests/api/pizzas.spec.ts
```

**2.2 — Escribir `services/BaseService.ts` (la clase abstracta — el contrato)**
- **Qué hago:** escribo la primera **clase abstracta del curso**: un `protected constructor`, un `protected abstract basePath()` y los helpers compartidos `url()` y `dispose()`.
- **Por qué:** las 3 hijas (`Auth`, `Order`, `Pizza`) comparten `api`, `baseURL`, `url()` y `dispose()`. `abstract` impide instanciar la base directa y **obliga** a cada hija a definir `basePath()`. Por eso este archivo va **primero**: es el molde que las demás extienden.
- **Cómo verifico:** el editor no subraya en rojo; `pnpm exec tsc --noEmit` sigue verde (aún no hay hijas, pero el archivo solo compila).

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

> 🔷 **TypeScript — `abstract class` + métodos abstractos**
> Una clase `abstract` **no se puede instanciar** (`new BaseService(...)` no compila) y puede declarar métodos sin cuerpo (`abstract basePath(): string`) que cada hija **está obligada** a implementar. Es la diferencia clave con una clase normal: una normal con un método "vacío" compila aunque la hija se olvide de él; `abstract` lo convierte en error de compilación.
> **Qué pasa si lo cambias:** si quitas `abstract` solo de `basePath()`, el compilador deja de exigir que cada hija lo defina — y `url()` podría construir rutas contra un `basePath` inexistente.
> 📚 Lo viste en [TS · M05 — Clases](../../typescript-qa-course/modulo-05-classes/) (y el contrato que impone se ve a fondo en [TS · M06 — Interfaces](../../typescript-qa-course/modulo-06-interfaces/)). Aquí lo aplicas a `BaseService`, que fuerza a `AuthService`/`OrderService`/`PizzaService` a declarar su `basePath()`.

> ⚠️ **Primera vez que aparece `abstract` en el curso — y a propósito.** En M03 `BasePage` era una clase **normal**: con una sola hija, `abstract` no aportaba nada. Aquí ya hay **3 servicios** que comparten comportamiento, así que el patrón por fin se gana su lugar. Ese es el sentido de *just-in-time*: el concepto entra cuando el problema lo reclama.

**2.3 — Escribir `services/AuthService.ts` (primera clase concreta + factory async)**
- **Qué hago:** creo `AuthService extends BaseService`, implemento `basePath()`, añado el factory `static async create(...)` y el método `login()`. Aquí también vive el helper `createAuthedContext(...)` que inyecta el Bearer.
- **Por qué:** `AuthService` es la primera **hija concreta**: prueba que el contrato de `BaseService` funciona. El factory `create()` es `static async` porque crear el `APIRequestContext` requiere `await` — y un `constructor` no puede ser `async`.
- **Cómo verifico:** `pnpm exec tsc --noEmit` verde; el editor reconoce `AuthService.create` y `auth.login`.

> 🔎 **Pruébalo en Swagger (sin código):** `POST /api/auth/login` (no requiere auth) → body `{ "username": "standard_user", "password": "pizza123" }` → **Execute** → copia el `access_token` de la respuesta. Eso es exactamente lo que hace `auth.login(user)` aquí abajo. [Abrir Swagger](https://omnipizza-backend.onrender.com/api/docs) · (el walkthrough completo está en [🔎 Cómo probar los endpoints en Swagger](#-cómo-probar-los-endpoints-en-swagger-sin-código))

```ts
import { request, type APIRequestContext } from "@playwright/test";
import { BaseService } from "./BaseService";
import type { LoginResponse, User } from "../types";

export class AuthService extends BaseService {
  protected basePath(): string {
    return "/api/auth";
  }

  // Factory — crea una instancia con un APIRequestContext listo.
  static async create(baseURL: string): Promise<AuthService> {
    const api = await request.newContext({ baseURL });
    return new AuthService(api, baseURL);
  }

  // Login con usuario/contraseña. Devuelve el token o lanza.
  async login(user: User): Promise<LoginResponse> {
    const res = await this.api.post(this.url("/login"), {
      data: { username: user.username, password: user.password },
    });
    if (!res.ok()) {
      const body = await res.text();
      throw new Error(`Login failed (${res.status()}): ${body}`);
    }
    return (await res.json()) as LoginResponse;
  }
}

// Utilidad — crea un APIRequestContext ya autenticado con Bearer.
export async function createAuthedContext(
  baseURL: string,
  token: string,
  extraHeaders: Record<string, string> = {},
): Promise<APIRequestContext> {
  return request.newContext({
    baseURL,
    extraHTTPHeaders: { Authorization: `Bearer ${token}`, ...extraHeaders },
  });
}
```

> 🔍 **Detalle que parece obvio — `const api = await request.newContext({ baseURL })`**
> **Qué es:** el servicio importa `request` de `@playwright/test` y crea su propio contexto HTTP; el tipo de ese contexto es `APIRequestContext`.
> **Por qué así (y no la alternativa obvia):** `request.newContext()` levanta un cliente HTTP **sin navegador**. La alternativa `page.request` existe, pero exige una `page` (y por tanto un browser arrancado), que aquí no se necesita para nada.
> **Qué pasa si lo cambias:** si usaras `page.request`, tendrías que pedir el fixture `page` y pagar el costo de abrir un navegador por test. Quedarte con `request.newContext()` es la razón del efecto que verás en el Paso 6: los tests del project `api` corren en <1s y sin abrir navegador — son llamadas HTTP puras.

> 🔍 **Detalle que parece obvio — `if (!res.ok()) throw new Error(... ${res.status()} ...)`**
> **Qué es:** cada método (`login` aquí, y luego `list`, `createOrder`, `listMine`) chequea `res.ok()` y, si falla, lanza incluyendo `res.status()` y el body.
> **Por qué así (y no la alternativa obvia):** `res.ok()` es `true` para cualquier 2xx; chequearlo explícito convierte un 4xx/5xx en un error claro **antes** de intentar `res.json()`. La alternativa "asumir 200 y parsear directo" produciría un crash opaco al deserializar un body de error.
> **Qué pasa si lo cambias:** sin el guard, un login con password inválido devolvería un body de error y `res.json()` lo parsearía como si fuera el token — el test fallaría más tarde y con un mensaje confuso. Justamente `auth.spec.ts` valida `rejects.toThrow(/Login failed/)` apoyado en este patrón.

> 🔍 **Detalle que parece obvio — `this.api.post(this.url("/login"), { data: { ... } })`**
> **Qué es:** los POST mandan el body con la opción `data` (objeto JS), no `form`.
> **Por qué así (y no la alternativa obvia):** `data` con un objeto serializa a **JSON** y fija `Content-Type: application/json`, que es lo que espera el backend de OmniPizza. `form` enviaría `application/x-www-form-urlencoded`, otro formato de body.
> **Qué pasa si lo cambias:** si cambias `data` por `form`, el backend recibe campos urlencoded en vez de JSON; lo más probable es un 4xx (body no parseable como JSON) y, gracias al guard de `res.ok()` de arriba, un `Error` con el status real.

> 🔷 **TypeScript — factory con `static`**
> Un método `static` pertenece a la **clase**, no a la instancia: se llama como `AuthService.create(...)`, sin haber creado nada todavía. Lo usamos porque la construcción es **asíncrona** (`await request.newContext(...)`) y un `constructor` en TS/JS **no puede ser `async`**. El factory `static async create()` envuelve ese `await` y devuelve la instancia ya armada.
> 📚 Lo viste en [TS · M05 — Clases](../../typescript-qa-course/modulo-05-classes/). Aquí lo aplicas para construir cada servicio con su `APIRequestContext` (y, en las hijas con auth, sus headers) ya conectado.

> 🔷 **TypeScript — genéricos `Promise<T>`**
> `Promise<LoginResponse>` es un **genérico**: `Promise` es el contenedor y `<LoginResponse>` el tipo que resuelve dentro. Al hacer `await auth.login(user)` TypeScript ya sabe que tienes un `LoginResponse` (con su `access_token`), no un `any`. Cambia el `<LoginResponse>` del retorno de `login()` por `<any>` y verás que el tipo del genérico deja de propagarse: quien hace `await` pierde el autocompletado de `access_token`.
> 📚 Lo viste en [TS · M03 — Funciones](../../typescript-qa-course/modulo-03-functions/) (`async`/`await` y el tipo de retorno `Promise<T>`). Aquí lo aplicas a cada método de servicio para que el `await` devuelva el contrato correcto y no `any`.

**2.4 — Escribir `services/PizzaService.ts` y `services/OrderService.ts` (mismo molde, con auth)**
- **Qué hago:** creo las otras dos hijas. Ambas implementan `basePath()` y un factory `create(baseURL, token, country)` que usa `createAuthedContext` para meter `Authorization: Bearer` + `X-Country-Code`.
- **Por qué:** `Pizza` y `Order` necesitan **token y mercado**, a diferencia de `Auth` (que aún no tiene token). El header `X-Country-Code` hace que el backend filtre por mercado. `PizzaService` es la base del **reto** (le añadirás métodos después).
- **Cómo verifico:** `pnpm exec tsc --noEmit` verde con las 3 hijas implementadas.

> 🔎 **Pruébalo en Swagger (sin código):** `GET /api/pizzas` (⚠️ **requiere auth** — primero pega el token con **Authorize**) → añade el header `X-Country-Code: MX` → **Execute** → verás el catálogo con precios por mercado. Es lo que devuelve `PizzaService.list()`. Cambia el header a `US`/`CH`/`JP` y observa cómo cambia la `currency`. [Abrir Swagger](https://omnipizza-backend.onrender.com/api/docs)

```ts
import { BaseService } from "./BaseService";
import { createAuthedContext } from "./AuthService";
import type { CountryCode, Pizza, PizzasResponse } from "../types";

export class PizzaService extends BaseService {
  protected basePath(): string {
    return "/api/pizzas";
  }

  static async create(
    baseURL: string,
    token: string,
    country: CountryCode,
  ): Promise<PizzaService> {
    const api = await createAuthedContext(baseURL, token, {
      "X-Country-Code": country,
    });
    return new PizzaService(api, baseURL);
  }

  async list(): Promise<Pizza[]> {
    const res = await this.api.get(this.url(""));
    if (!res.ok()) {
      throw new Error(`list pizzas failed (${res.status()}): ${await res.text()}`);
    }
    const body = (await res.json()) as PizzasResponse;
    return body.pizzas ?? [];
  }
}
```

`OrderService.ts` sigue el mismo molde (`basePath() → "/api/orders"`, factory con auth, `createOrder()` y `listMine()`). Con un matiz importante en la API real de OmniPizza: **`/api/orders` sirve solo para LEER** — `GET /api/orders` es el historial y `GET /api/orders/{order_id}` el detalle. **La orden se CREA con `POST /api/checkout`**, no con `POST /api/orders`. Por eso `listMine()` hace `GET` sobre el `basePath` y `createOrder()` postea al endpoint de checkout (no al `basePath`) — así está ya en el código.

> 💡 **Por qué `createOrder()` no usa `this.url()` — y postea directo a `/api/checkout`.** En esta capa hay una asimetría deliberada: `listMine()` lee con `GET` sobre el `basePath` (`/api/orders`), pero `createOrder()` **ya postea** a `${this.baseURL}/api/checkout` (mira `OrderService.ts`). El motivo es que la API real **no crea órdenes en `/api/orders`** (ese endpoint es solo lectura: historial y detalle); la creación vive en **`POST /api/checkout`**. Como el endpoint de creación cae fuera del `basePath` del servicio, `createOrder()` construye la URL directo desde `baseURL` en vez de usar `this.url()`/`basePath()` (que armaría `/api/orders`). El body que envía cumple `OrderPayload` (`country_code`, `items`, `name`, `address`, `phone` + el campo de dirección por mercado, p. ej. `colonia` en MX, y opcionalmente la propina como `propina`). Puedes confirmar el endpoint en Swagger (ver más abajo).

> 🔎 **Pruébalo en Swagger (sin código):** la orden se crea con `POST /api/checkout` (⚠️ requiere auth). Tras crearla, `GET /api/orders` muestra el historial y `GET /api/orders/{order_id}` el detalle. [Abrir Swagger](https://omnipizza-backend.onrender.com/api/docs) · pasos detallados en [🔎 Cómo probar los endpoints en Swagger](#-cómo-probar-los-endpoints-en-swagger-sin-código).

**2.5 — Escribir `services/index.ts` (barrel export)**
- **Qué hago:** reexporto las 3 clases y el helper desde un solo `index.ts`.
- **Por qué:** así los specs importan `from "../services"` en una línea, en vez de cuatro rutas distintas. Es la fachada pública de la capa.
- **Cómo verifico:** en `ejemplo.spec.ts`, `import { AuthService, PizzaService } from "../services"` resuelve sin error.

```ts
export { BaseService } from "./BaseService";
export { AuthService, createAuthedContext } from "./AuthService";
export { OrderService } from "./OrderService";
export { PizzaService } from "./PizzaService";
```

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

**3.1 — Añadir el project `api` (sin `storageState`, sin `dependencies`)**
- **Qué hago:** dentro del array `projects` agrego un cuarto project `api` que solo fija `baseURL` (el backend) y su `testMatch`.
- **Por qué:** los tests de API se autentican solos — `AuthService.create()` hace login y obtiene un `access_token` fresco que `PizzaService`/`OrderService` inyectan como `Authorization: Bearer`. NO deben heredar las cookies de UI (la sesión de navegador que el setup deja en `.auth/user.json`) ni esperar al setup project — el aislamiento es intencional.
- **Cómo verifico:** `pnpm exec playwright test --list --project=api` lista los specs de `tests/api/` y de `modulo-05-api-layer/`.

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
> **Qué pasa si lo cambias:** si le agregas `storageState`, Playwright intentaría cargar cookies de UI en un `APIRequestContext` que no las usa (ruido, y dependencia falsa de un artefacto de otra capa). Si le agregas `dependencies: ["setup"]`, cada corrida de API esperaría al login de UI por navegador — más lento y acoplado a algo que la API no consume.

**3.2 — Excluir la carpeta del módulo y `tests/api/` de los `ui-*`**
- **Qué hago:** amplío el `testIgnore` de `ui-chromium`, `ui-firefox` y `ui-webkit` para que ignoren `tests/api/` y `modulo-05-api-layer/`.
- **Por qué:** sin esto, los projects de UI intentarían correr los tests de API **sin headers de API** (y arrancando un navegador inútil). Un mismo archivo pertenece o no a un project según las reglas de match/ignore.
- **Cómo verifico:** `pnpm exec playwright test --list --project=ui-chromium` ya **no** muestra los specs de API.

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

**3.3 — Añadir los scripts de M05 a `package.json`**
- **Qué hago:** agrego `m5` (corre solo este módulo en el project api) y `test:api` (la suite API completa).
- **Por qué:** atajos memorables para el alumno; `--project=api` evita arrancar UI/setup sin querer.
- **Cómo verifico:** `pnpm m5` y `pnpm test:api` arrancan sin "missing script".

```json
"scripts": {
  "m5": "playwright test modulo-05-api-layer --project=api",
  "test:api": "playwright test --project=api"
}
```

**3.4 — Confirmar que `tsconfig.json` incluye `services/`**
- **Qué hago:** reviso que el array `include` de `tsconfig.json` tenga `"services/**/*.ts"`.
- **Por qué:** si la nueva carpeta no está en `include`, `pnpm typecheck` no la chequea y los errores de tipo de los servicios pasarían desapercibidos.
- **Cómo verifico:** `pnpm exec tsc --noEmit` reporta errores de `services/` cuando los introduces a propósito (y ninguno cuando el código está bien).

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

**4.1 — Leer el contrato línea por línea**
- **Qué hago:** abro `BaseService.ts` y señalo en voz alta: `export abstract class` (primera vez en el curso), `protected constructor` (nadie de fuera puede `new`), `protected abstract basePath()` (cada hija lo DEBE definir), `url()` (helper compartido) y `dispose()` (cierra el contexto HTTP).
- **Por qué:** entender el molde antes de ver las hijas hace obvio por qué `AuthService` "solo" declara `basePath()` y el factory: todo lo demás lo heredó.
- **Cómo verifico (en vivo):** escribo `const x = new BaseService(...)` en un editor; TypeScript se queja con **"Cannot create an instance of an abstract class"**. Ese error en una línea es el valor de `abstract`. (No guardo el archivo — es solo demostración.)

---

### Paso 5 — Lectura guiada de `AuthService.ts` y `PizzaService.ts`

**5.1 — Identificar el patrón factory + auth + dispose**
- **Qué hago:** recorro las hijas y marco: `static async create(...)` (el factory, porque la construcción es `async`); `createAuthedContext(baseURL, token, extraHeaders)` (inyecta `Authorization: Bearer` + `X-Country-Code` en TODAS las requests); cada servicio implementa `basePath()` (sin eso TS no compila); y `await service.dispose()` al final de cada uso.
- **Por qué:** es el patrón que se repite en los 3 servicios — "un servicio por endpoint family, factory async, dispose siempre". Reconocerlo aquí evita explicarlo 3 veces.
- **Cómo verifico:** en el editor, autocompletar `pizzas.` muestra `list`, `create` y `dispose`; `AuthService.create` aparece como `static`.

---

### Paso 6 — Correr la suite API

**6.1 — Ejecutar solo el project `api`**
- **Qué hago:** corro `pnpm test:api` (o `pnpm exec playwright test --project=api`).
- **Por qué:** valida que servicios + config + specs encajan, sin arrancar UI ni setup. Son llamadas HTTP puras: por eso corren en <1s cada una.
- **Cómo verifico:** el HTML report muestra los tests de `tests/api/*.spec.ts` **y** el `ejemplo.spec.ts` de este módulo en verde, sin que se abra ningún navegador. (La primera corrida del día puede tardar 30-40s por el cold start de Render.)

```bash
# Solo el project api (sin UI projects ni setup)
pnpm test:api

# O directamente
pnpm exec playwright test --project=api
```

---

### Paso 7 — Lectura guiada del flujo del `ejemplo.spec.ts`

**7.1 — Trazar el flujo auth → list por mercado**
- **Qué hago:** identifico con el grupo las 3 fases del test: (1) **Auth** — `AuthService.create(API_URL)` → `auth.login(user)` → guardo el `access_token` → `auth.dispose()`; (2) **Reutilización del token** — el mismo token alimenta cada `PizzaService.create(...)`; (3) **Iteración por mercado** — `for (const market of markets)` crea un `PizzaService` por mercado, lista pizzas, valida `currency`, dispose.
- **Por qué:** es el patrón canónico de la capa de API — *"un servicio por endpoint family, factory async, dispose siempre"*. El `for...of` sobre `markets` es data-driven puro (un `for`, no una API mágica de Playwright).
- **Cómo verifico:** `pnpm exec playwright test modulo-05-api-layer/ejemplo.spec.ts --project=api` pasa en verde; el report muestra el flujo completo sin abrir navegador.

> 🔷 **TypeScript — union types para errores (`Order | ApiError`)**
> Un **union type** dice "esto es A **o** B". Míralo en negativo: sin el guard de `res.ok()` + `throw` temprano, la firma honesta de `createOrder()` (en `OrderService`) sería `Promise<Order | ApiError>` — y **cada** llamada tendría que **estrechar** (narrow) el union antes de tocar un campo de `Order`. El `throw` temprano saca el camino de error de la firma y te deja devolver un `Promise<Order>` limpio; `ApiError` (en `types/omnipizza.d.ts`) describe la forma del body de error que el backend devuelve.
> 📚 Lo viste en [TS · M04 — Tipos de objetos](../../typescript-qa-course/modulo-04-objects-types/) (uniones y forma de objetos). Aquí el guard de `res.ok()` es lo que te ahorra cargar ese union en cada firma de la capa.

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

**9.1 — Extender `PizzaService` con `getByMarket` y `getById`, y escribir el test**
- **Qué hago:** abro `modulo-05-api-layer/reto.spec.ts` y sigo sus TODOs. Añado **dos métodos públicos** a `services/PizzaService.ts` (`getByMarket(market)` y `getById(id)`) junto al `list()` existente, y luego escribo un test que los use juntos.
- **Por qué:** practica el patrón "un método por endpoint" dentro de una hija concreta de `BaseService`. El reto **conserva sus TODOs** a propósito — el dolor de implementarlo es el ejercicio; no lo resuelvas aquí.
- **Cómo verifico:** `pnpm typecheck` pasa con los métodos nuevos, y `pnpm exec playwright test modulo-05-api-layer/reto.spec.ts --project=api` queda en verde (tras quitar el `test.skip`).

> El reto sigue **Qué hacer / Pista / Cómo verificar** por cada TODO, indicando dónde escribir cada método dentro de `services/PizzaService.ts`. Los TODOs se quedan sin resolver en este README — vívelos en el archivo.

---

### Paso 10 — Versiona tu trabajo (Git JIT)

**10.1 — Commitear la capa de API**
- **Qué hago:** agrego solo lo que toca este módulo y commiteo con un mensaje convencional.
- **Por qué:** la capa de servicios + su config + el módulo son una unidad coherente. Un commit por capa deja un historial legible (y, en M06, fácil de revertir en CI).
- **Cómo verifico:** `git log --oneline -1` muestra el commit `feat(m05): ...` en la cima.

```bash
git add services tests/api playwright.config.ts modulo-05-api-layer
git commit -m "feat(m05): API layer con BaseService abstracta"
git log --oneline -1
```

> 🪟 **Windows / PowerShell:** los comandos `git` son idénticos; no necesitas escapar nada aquí.

---

## 🔎 Cómo probar los endpoints en Swagger (sin código)

Antes (o en vez) de correr un test, puedes **ver con tus propios ojos** qué hace cada endpoint: ir a la URL, mandar la petición, y leer la respuesta. Es el equivalente a abrir Postman, pero ya viene servido por el backend. Esto te da la **fuente de la verdad** contra la que comparar lo que devuelven `AuthService`, `PizzaService` y `OrderService`.

> 💡 **Para el facilitador:** haz este recorrido en vivo **antes** de leer el código de los servicios. Cuando luego vean `auth.login()` o `pizzas.list()`, ya sabrán exactamente qué request/response está envolviendo cada método — el `.ts` deja de ser "magia".

### Tabla de endpoints (la chuleta)

| Endpoint | Método | ¿Requiere auth? | Headers relevantes | Lo envuelve |
|---|---|---|---|---|
| `/api/auth/login` | POST | No | — | `AuthService.login()` |
| `/api/pizzas` | GET | **Sí** (Bearer) | `X-Country-Code` (MX/US/CH/JP), `X-Language` (opc.) | `PizzaService.list()` |
| `/api/checkout` | POST | **Sí** (Bearer) | `Authorization: Bearer`, `X-Country-Code` | `OrderService.createOrder()` |
| `/api/orders` | GET | **Sí** (Bearer) | `Authorization: Bearer` | `OrderService.listMine()` |
| `/api/orders/{order_id}` | GET | **Sí** (Bearer) | `Authorization: Bearer` | (detalle de una orden) |

> **Headers transversales:** `Authorization: Bearer <token>` autentica cualquier endpoint protegido. `X-Country-Code` (uno de **MX / US / CH / JP**) elige el mercado y por tanto precios/moneda. `X-Language` (**en / es / de / fr / ja**, opcional) traduce los textos de la respuesta.

> 💡 **Crear vs. leer órdenes:** la orden **se crea con `POST /api/checkout`**, mientras que `/api/orders` es solo lectura (historial y detalle). Por eso `OrderService.createOrder()` postea a `/api/checkout` y `listMine()` hace `GET` sobre `/api/orders` (ver la nota del Paso 2.4 para el porqué del diseño).

### Walkthrough paso a paso

**1 — Abre el Swagger UI.** Ve a **https://omnipizza-backend.onrender.com/api/docs** (es **FastAPI**, así que verás la interfaz Swagger con todos los endpoints agrupados).

> ⚠️ **Render free-tier "duerme".** La primera petición del día puede tardar **30-40s** mientras el servicio "despierta" (cold start). Si la primera llamada se queda colgada o da un timeout, reintenta — es el mismo motivo por el que la primera corrida de `pnpm test:api` tarda más.

**2 — Autentícate (obtén el token).** Expande **`POST /api/auth/login`** → botón **"Try it out"** → en el body pega:

```json
{ "username": "standard_user", "password": "pizza123" }
```

→ **Execute**. En la respuesta (200) verás el cuerpo con **`access_token`** (más `token_type`, `username` y `behavior`). **Copia el valor de `access_token`** — es lo que vas a autorizar en el siguiente paso. (Esto es lo mismo que devuelve `auth.login(user)` en el código, tipado como `LoginResponse`.)

**3 — Autoriza (mete el token en Swagger).** Pulsa el botón **Authorize** (arriba a la derecha, con el candado) → en el modal (esquema **HTTP Bearer**) pega el token → **Authorize** → **Close**. A partir de ahora Swagger añade `Authorization: Bearer <token>` automáticamente a cada llamada protegida.

> ⚠️ **Pega SOLO el token, sin la palabra `Bearer`.** El esquema HTTP Bearer de Swagger ya antepone `Bearer ` por ti. Si pegas `Bearer eyJ...` se duplica el prefijo (`Bearer Bearer ...`) y obtendrás **401**.

**4 — Ejecuta un endpoint protegido (`GET /api/pizzas`).** Expande **`GET /api/pizzas`** (⚠️ requiere auth — por eso el paso 3 va primero) → **"Try it out"** → en el campo del header **`X-Country-Code`** escribe **`MX`** → **Execute**. Verás el catálogo de pizzas con **precios en la moneda del mercado**. Cambia `X-Country-Code` a `US` / `CH` / `JP` y vuelve a **Execute**: los precios y la `currency` cambian. (Esto es exactamente lo que itera `ejemplo.spec.ts` con su `for (const market of markets)`.)

**5 — Crea una orden y míralas (`POST /api/checkout` → `GET /api/orders`).** Expande **`POST /api/checkout`** (el que **crea** la orden) → **"Try it out"** → pega un body válido. Un body mínimo para **MX** (toma un `pizza_id` real del catálogo del paso 4):

```json
{
  "country_code": "MX",
  "items": [{ "pizza_id": 1, "quantity": 1 }],
  "name": "QA Tester",
  "address": "Av. Siempre Viva 742",
  "phone": "5512345678",
  "colonia": "Centro",
  "propina": 10
}
```

→ **Execute**. La respuesta (2xx) confirma la orden creada con su `order_id`.

> ⚠️ Si recibes **422**, al body le falta un campo **requerido**: revisa que `pizza_id` exista (cópialo del paso 4) y que esté el **campo de dirección del mercado** — el único obligatorio por mercado: en **MX** `colonia`, en **US** `zip_code` (5 dígitos), en **CH** `plz`, en **JP** `prefectura`. La **propina es opcional** y NO causa 422 si la omites (`propina` en MX, `tip` en US, `trinkgeld` en CH, `chip` en JP).

Después, expande **`GET /api/orders`** → **Execute** → verás el **historial** con la orden que acabas de crear. Y **`GET /api/orders/{order_id}`** → pega el `order_id` de arriba → **Execute** → verás el **detalle** de esa orden.

> 💡 **El "premio" de este recorrido:** ahora cada método de servicio tiene un referente visible. Cuando un test API falle, abre Swagger, repite la llamada a mano, y compara la respuesta real con lo que el test esperaba — así sabes si el bug está en el test, en el servicio, o en el backend.

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
