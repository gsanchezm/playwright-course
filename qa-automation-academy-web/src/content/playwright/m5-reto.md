# 🚩 Reto M05

## Paso 9 — Resolver el reto

Tienes que extender `PizzaService` con DOS métodos nuevos: `getByMarket(market)` y `getById(id)`. Y luego escribir un test que los use juntos.

El reto sigue **Qué hacer / Pista / Cómo verificar** por cada TODO, indicando dónde escribir cada método dentro de `services/PizzaService.ts`.

---

## Código completo — `reto.spec.ts`

```ts
// @file modulo-05-api-layer/reto.spec.ts
// ============================================================
// 🚩 Reto M05 — Extender PizzaService con getByMarket y getById
// ============================================================
// Objetivo pedagógico: practicar el patrón "un método por endpoint"
// dentro de una clase concreta que extiende BaseService (abstract).
//
// Vas a:
//   1. Añadir dos métodos nuevos a `services/PizzaService.ts`.
//   2. Validar que los tipos siguen siendo seguros (TS no compila
//      si la respuesta no cumple `Pizza`).
//   3. Escribir un test que use ambos métodos juntos.
// ============================================================
//
// 🧰 Pre-requisitos:
//   ✔ pnpm test:api corre en verde con el ejemplo del módulo.
//   ✔ Lees `services/PizzaService.ts` y `services/BaseService.ts`.
//   ✔ Tienes claro que cada uso termina con `await pizzas.dispose()`.
//
// ▶ Cómo correr SOLO este reto:
//   pnpm exec playwright test modulo-05-api-layer/reto.spec.ts \
//     --project=api
// ============================================================

import { test, expect } from "@playwright/test";
import { AuthService, PizzaService } from "../services";
import type { User, Market } from "../types";
import usersJson from "../data/users.json";
import marketsJson from "../data/markets.json";

const users = usersJson as User[];
const markets = marketsJson as Market[];
const standardUser = users.find((u) => u.username === "standard_user")!;
const mxMarket = markets.find((m) => m.code === "MX")!;
const API_URL =
  process.env.API_URL ?? "https://omnipizza-backend.onrender.com";

test.describe("Reto M05 — extender PizzaService", () => {
  test.skip("TODO — implementa getByMarket y getById, luego usa ambos", async () => {
    // ────────────────────────────────────────────────────────
    // TODO 0 — Antes de escribir el test, MODIFICA el servicio
    // ────────────────────────────────────────────────────────
    // Abre `services/PizzaService.ts` y añade dos métodos públicos
    // junto al `list()` que ya existe.

    // ════════════════════════════════════════════════════════
    // 📁 EN services/PizzaService.ts:
    // ════════════════════════════════════════════════════════
    //
    // ──────── TODO A — getByMarket(market) ────────
    //
    //   Qué hacer:
    //     Listar pizzas del mercado actual y FILTRAR las que tengan
    //     `currency === market.currency`. (En OmniPizza basta con
    //     reutilizar `this.list()` porque el header X-Country-Code
    //     ya filtra del lado del backend — pero hacer el filtro
    //     explícito en cliente sirve como cinturón.)
    //
    //   Pista (cópialo dentro de la clase PizzaService):
    //
    //     async getByMarket(market: Market): Promise<Pizza[]> {
    //       const all = await this.list();
    //       return all.filter((p) => p.currency === market.currency);
    //     }
    //
    //   No olvides:
    //     · `import type { Market, Pizza } from "../types";` (si falta)
    //
    //   Cómo verificar:
    //     pnpm typecheck   → debe pasar
    //
    // ──────── TODO B — getById(id) ────────
    //
    //   Qué hacer:
    //     Hacer un GET a `/api/pizzas/:id` y devolver el objeto.
    //     Lanzar error si el response no es ok.
    //
    //   Pista (cópialo dentro de la clase PizzaService):
    //
    //     async getById(id: string | number): Promise<Pizza> {
    //       const res = await this.api.get(this.url(`/${id}`));
    //       if (!res.ok()) {
    //         throw new Error(
    //           `getById(${id}) failed (${res.status()}): ${await res.text()}`
    //         );
    //       }
    //       return (await res.json()) as Pizza;
    //     }
    //
    //   Cómo verificar:
    //     pnpm typecheck   → debe pasar
    //     Inspecciona el endpoint real de OmniPizza por si la ruta es
    //     `/api/pizzas/:id` o algo distinto (ajústalo si no responde).
    //
    // ════════════════════════════════════════════════════════
    // FIN de cambios en services/PizzaService.ts
    // ════════════════════════════════════════════════════════


    // ────────────────────────────────────────────────────────
    // TODO 1 — Quitar el `test.skip` y empezar el flujo
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Borra el `test.skip(...)` de arriba y deja `test(...)`.
    //   Después arranca con el login estándar:
    //
    // Pista:
    const auth = await AuthService.create(API_URL);
    const { access_token } = await auth.login(standardUser);
    await auth.dispose();


    // ────────────────────────────────────────────────────────
    // TODO 2 — Crear PizzaService apuntando al mercado MX
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Factory async: el servicio queda con Bearer + X-Country-Code listos.
    //
    // Pista:
    const pizzas = await PizzaService.create(
      API_URL,
      access_token,
      mxMarket.code,
    );


    // ────────────────────────────────────────────────────────
    // TODO 3 — Usar getByMarket(mxMarket) y validar el resultado
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   1) Llamar el método nuevo.
    //   2) Asegurar que la lista no está vacía.
    //   3) Asegurar que TODAS las pizzas tienen `currency === "MXN"`.
    //
    // Pista:
    //   const list = await pizzas.getByMarket(mxMarket);
    //   expect(list.length).toBeGreaterThan(0);
    //   for (const p of list) {
    //     expect(p.currency).toBe(mxMarket.currency);
    //   }


    // ────────────────────────────────────────────────────────
    // TODO 4 — Usar getById con la primera pizza de la lista
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   1) Tomar el `id` de la primera pizza.
    //   2) Pedir el detalle.
    //   3) Validar que `detail.id === first.id`.
    //
    // Pista:
    //   const first = list[0];
    //   const detail = await pizzas.getById(first.id);
    //   expect(detail.id).toBe(first.id);
    //   expect(detail).toHaveProperty("name");
    //
    // Criterio de éxito:
    //   El test pasa en VERDE. En la terminal verás:
    //     ✓ Reto M05 — extender PizzaService


    // ────────────────────────────────────────────────────────
    // TODO 5 — SIEMPRE dispose al final
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Cerrar el contexto HTTP para no dejar conexiones abiertas.
    //
    // Pista (DEBE ir en un try/finally en producción, aquí basta):
    await pizzas.dispose();

    expect(true).toBe(true);
  });
});

// ============================================================
// 📝 Reflexión final — responde mentalmente:
// ============================================================
//
//   1. Si `getById` devuelve un objeto SIN el campo `name`,
//      ¿quién se queja primero, TypeScript o el `expect`?
//      (Esperado: el `expect`, porque el cast `as Pizza` confía
//      en el contrato. Por eso `expect(detail).toHaveProperty("name")`
//      es una salvaguarda válida.)
//
//   2. ¿Qué pasa si te saltas `await pizzas.dispose()`?
//      (Esperado: leaks de conexiones HTTP. En suites grandes,
//      el runner empieza a fallar con "too many open sockets".)
//
//   3. Si OmniPizza añade `paymentMethod` a `Pizza`, ¿necesitas
//      modificar este test? (Esperado: no, mientras los campos
//      que validas sigan ahí.)
//
// 👉 En M06 llevamos todo esto a CI/CD: este mismo reto correrá
//    automáticamente en GitHub Actions cada vez que abras un PR,
//    sobre 3 browsers en paralelo, con traces descargables.
// ============================================================
```
