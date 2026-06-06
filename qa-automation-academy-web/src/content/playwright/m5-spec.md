# El spec paso a paso

Esta página cubre la parte de **lectura y ejecución del ejemplo** de M05: las clases de la capa de servicios, correr la suite API, leer el flujo `auth → list pizzas por mercado` y comparar API vs UI. Al final tienes el código completo de `ejemplo.spec.ts`.

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

```ts
// @file services/AuthService.ts
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
3. **`protected abstract basePath(): string`** — método sin implementación. Cada hijo DEBE proveerlo o TS no compila.
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

test.describe("M05 — demostración de la capa de servicios @api", () => {
  test("flujo completo: auth → list pizzas por mercado", async () => {
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

  test("uniqueOrderId genera folios únicos por worker", async ({}, testInfo) => {
    const id1 = uniqueOrderId(testInfo);
    const id2 = uniqueOrderId(testInfo);
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^ORD-w\d+-\d+-\d+$/);
  });
});
```
