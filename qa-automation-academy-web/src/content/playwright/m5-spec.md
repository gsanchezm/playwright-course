# El spec paso a paso

Esta página cubre la parte de **lectura y ejecución del ejemplo** de M05: las clases de la capa de servicios, correr la suite API, leer el flujo `auth → list pizzas by market` y comparar API vs UI. Al final tienes el código completo de `ejemplo.spec.ts`.

---

## Esqueletos de la capa de servicios

Estos son los archivos que creaste en el **Paso 2** de la guía. Cada uno con su propia ruta.

```ts
// @file services/BaseService.ts
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
> 📚 Lo viste en [TS · M05 — Clases](/docs/typescript/m5-base-page) (y el contrato que impone se ve a fondo en [TS · M06 — Interfaces](/docs/typescript/m6-web-actions)). Aquí lo aplicas a `BaseService`, que fuerza a `AuthService`/`OrderService`/`PizzaService` a declarar su `basePath()`.

```ts
// @file services/AuthService.ts
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
> 📚 Lo viste en [TS · M05 — Clases](/docs/typescript/m5-base-page). Aquí lo aplicas para construir cada servicio con su `APIRequestContext` (y, en las hijas con auth, sus headers) ya conectado.

> 🔷 **TypeScript — genéricos `Promise<T>`**
> `Promise<LoginResponse>` es un **genérico**: `Promise` es el contenedor y `<LoginResponse>` el tipo que resuelve dentro. Al hacer `await auth.login(user)` TypeScript ya sabe que tienes un `LoginResponse` (con su `access_token`), no un `any`. Cambia el `<LoginResponse>` del retorno de `login()` por `<any>` y verás que el tipo del genérico deja de propagarse: quien hace `await` pierde el autocompletado de `access_token`.
> 📚 Lo viste en [TS · M03 — Funciones](/docs/typescript/m3-login) (`async`/`await` y el tipo de retorno `Promise<T>`). Aquí lo aplicas a cada método de servicio para que el `await` devuelva el contrato correcto y no `any`.

```ts
// @file services/index.ts
export { BaseService } from "./BaseService";
export { AuthService, createAuthedContext } from "./AuthService";
export { OrderService } from "./OrderService";
export { PizzaService } from "./PizzaService";
```

`PizzaService` y `OrderService` siguen el mismo molde — los completas con el ejemplo.

---

## Paso 4 — Lectura guiada de `services/BaseService.ts`

Abre el archivo y fíjate punto por punto:

1. **`export abstract class BaseService`** — la palabra **`abstract` aparece por primera vez en el curso**.
2. **`protected constructor(...)`** — protegido, no público. Eso significa que **no puedes hacer `new BaseService(...)` desde fuera**. Solo las hijas pueden llamarlo (vía `super(...)`).
3. **`protected abstract basePath(): string`** — método sin implementación. Cada hijo DEBE proveerlo o TS no compila. Si le quitaras `abstract`, el compilador dejaría de exigir que cada hija lo defina — y `url()` podría construir rutas contra un `basePath` inexistente.
4. **`url(path)`** — helper compartido por todas las hijas: junta `baseURL + basePath() + path`.
5. **`dispose()`** — cierra el `APIRequestContext`. Si no lo llamas, hay leaks.

> 💡 **Pruébalo en vivo:** abre un editor y escribe `const x = new BaseService(...)`. TypeScript debe quejarse con **"Cannot create an instance of an abstract class"**. Eso es el valor de `abstract` en una sola línea. (No guardes el archivo — es solo para demostrarlo).

---

## Paso 5 — Lectura guiada de `AuthService.ts` y `PizzaService.ts`

Cosas en las que fijarte:

- **`static async create(...)`** — el factory. Reemplaza al `new ServiceX(...)` directo porque necesita **construcción async** (Playwright crea el `APIRequestContext` con `await playwright.request.newContext(...)`).
- **`createAuthedContext(baseURL, token, extraHeaders)`** — helper que inyecta `Authorization: Bearer <token>` y `X-Country-Code` en TODAS las requests del contexto.
- Cada servicio **implementa `basePath()`** — TS no compila sin eso.
- Tras usar, **siempre `await service.dispose()`** — tenlo presente.

---

## Paso 6 — Correr la suite API

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

## Paso 7 — Lectura guiada del flujo del `ejemplo.spec.ts`

Identifica el patrón:

1. **Auth**: `AuthService.create(API_URL)` → `auth.login(user)` → guardas el `access_token` → `auth.dispose()`.
2. **Reutilización del token**: el mismo token se usa en cada `PizzaService.create(...)`.
3. **Iteración por mercado**: el bucle `for (const market of markets)` crea un `PizzaService` por mercado, lista pizzas, valida currency, dispose.

**Patrón clave que memorizar:** *"un servicio por endpoint family, factory async, dispose siempre"*.

> 🔷 **TypeScript — union types para errores (`Order | ApiError`)**
> Un **union type** dice "esto es A **o** B". Míralo en negativo: sin el guard de `res.ok()` + `throw` temprano, la firma honesta de `createOrder()` (en `OrderService`) sería `Promise<Order | ApiError>` — y **cada** llamada tendría que **estrechar** (narrow) el union antes de tocar un campo de `Order`. El `throw` temprano saca el camino de error de la firma y te deja devolver un `Promise<Order>` limpio; `ApiError` (en `types/omnipizza.d.ts`) describe la forma del body de error que el backend devuelve.
> 📚 Lo viste en [TS · M04 — Tipos de objetos](/docs/typescript/m4-union-types) (uniones y forma de objetos). Aquí el guard de `res.ok()` es lo que te ahorra cargar ese union en cada firma de la capa.

---

## Paso 8 — Comparativa con UI (5 min)

Compara:

| Aspecto | Test UI (M03) | Test API (M05) |
|---|---|---|
| Duración por TC | ~10-15s | <1s |
| Determinismo | Medio (DOM, animaciones) | Alto (HTTP) |
| Cubre regresión visual | Sí | No |
| Cubre lógica de negocio | Indirecto | Directo |

**Mensaje:** la API es la base de la pirámide. **No reemplaza** los E2E de UI; los **acompaña**.

---

## Código completo — `ejemplo.spec.ts`

```ts
// @file modulo-05-api-layer/ejemplo.spec.ts
// ============================================================
// M05 — API Layer con BaseService abstracta
// ============================================================
// Este ejemplo demuestra:
//   1. Clase abstracta con método abstracto obligatorio.
//   2. Factory pattern con auth inyectada.
//   3. Data-driven vía datos tipados compartidos con UI.
//   4. Data isolation con uniqueOrderId (prepara para OrderService).
// ============================================================

import { test, expect } from "@playwright/test";
import { AuthService, PizzaService } from "../services";
import type { User, Market } from "../types";
import usersJson from "../data/users.json";
import marketsJson from "../data/markets.json";
import { uniqueOrderId } from "../helpers/unique-data";

const users = usersJson as User[];
const markets = marketsJson as Market[];
const standardUser = users.find((u) => u.username === "standard_user")!;
const API_URL = process.env.API_URL ?? "https://omnipizza-backend.onrender.com";

test.describe("M05 — service layer demonstration @api", () => {
  test("full flow: auth → list pizzas by market", async () => {
    // 1. Login via AuthService (clase concreta que extiende BaseService)
    const auth = await AuthService.create(API_URL);
    const { access_token } = await auth.login(standardUser);
    await auth.dispose();

    // 2. Iterar mercados reutilizando el token
    for (const market of markets) {
      const pizzas = await PizzaService.create(API_URL, access_token, market.code);
      const list = await pizzas.list();
      await pizzas.dispose();

      expect(list.length).toBeGreaterThan(0);
      expect(list[0]).toHaveProperty("id");
      expect(list[0]).toHaveProperty("name");
      expect(list[0].currency).toBe(market.currency);
    }
  });

  test("uniqueOrderId generates unique order ids per worker", async ({}, testInfo) => {
    const id1 = uniqueOrderId(testInfo);
    const id2 = uniqueOrderId(testInfo);
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^ORD-w\d+-\d+-\d+$/);
  });
});
```
