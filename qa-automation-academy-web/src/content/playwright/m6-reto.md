# 🚩 Reto M06

## Paso 9 — Resolver el reto

Tienes que extender `OrderService` con **un método nuevo**, `getById(orderId)` (envuelve `GET /api/orders/{order_id}`), junto a `listMine()`, y luego escribir un test de **contrato** que lo use. No basta con "devuelve algo": hay que verificar tres cosas.

1. **Caso feliz:** status 200 y **schema** del detalle (`order_id`, `subtotal`, `total`, `currency`, `timestamp`, `items`, con su tipo correcto).
2. **404:** una orden inexistente se rechaza con `Order ... not found`.
3. **403 `Access denied`:** otro usuario (`performance_glitch_user`) pide la orden de `standard_user` — autenticado SÍ, autorizado NO.

El reto sigue **Qué hacer / Pista / Cómo verificar** por cada TODO (TODO 0 = el método en `services/OrderService.ts`; TODO 1-3 = los tres casos de arriba; TODO 4 = `dispose`). Los códigos y mensajes reales de la API salen de probar los endpoints en Swagger (ver la sección «Cómo probar los endpoints en Swagger» de la guía M6, con el historial y el detalle de órdenes).

Para correrlo, quita el `test.skip` y la línea sentinela:

```bash
pnpm exec playwright test tests/reto.spec.ts --project=api
```



---

## Código completo — `reto.spec.ts`

```ts
// @file modulo-06-api-layer/tests/reto.spec.ts
// ============================================================
// 🚩 Reto M06 — Nuevo método de servicio + test de contrato:
//               OrderService.getById (GET /api/orders/{order_id})
// ============================================================
// Objetivo pedagógico: practicar el patrón "un método por endpoint"
// y escribir un TEST DE CONTRATO: no solo "devuelve algo", sino
//   · el código de estado correcto,
//   · la FORMA (schema) de la respuesta,
//   · y los casos de error (404 / 403).
//
// Hoy `OrderService` tiene `createOrder()` y `listMine()`, pero el
// detalle de una orden (`GET /api/orders/{order_id}`, sección 7.2 de
// GUIA-SWAGGER.md) todavía no tiene método propio. Ese es tu trabajo.
//
// Vas a:
//   1. Añadir `getById(orderId)` a `services/OrderService.ts`.
//   2. Validar el SCHEMA de la respuesta (campos y tipos).
//   3. Validar los ERRORES reales del backend:
//        · orden inexistente        → 404 "Order ... not found"
//        · orden de OTRO usuario    → 403 "Access denied"
//
// 🧰 Pre-requisitos:
//   ✔ pnpm test:api corre en verde con el ejemplo del módulo.
//   ✔ Leíste la sección 7 de GUIA-SWAGGER.md (historial y detalle).
//   ✔ Lees `services/OrderService.ts` y `services/BaseService.ts`.
//   ✔ Cada uso de un servicio termina con `await service.dispose()`.
//
// ▶ Cómo correr SOLO este reto:
//   pnpm exec playwright test tests/reto.spec.ts --project=api
//
// ℹ️ M06 NO usa badge (storageState): cada servicio crea su propio
//   contexto autenticado con el token de AuthService. Nada de esto
//   pasa por el navegador.
// ============================================================

import { test, expect } from "@playwright/test";
import { AuthService, OrderService, PizzaService } from "../services";
import type { User, Market, OrderPayload } from "../types";
import usersJson from "../data/users.json";
import marketsJson from "../data/markets.json";

const users = usersJson as User[];
const markets = marketsJson as Market[];
const standardUser = users.find((u) => u.username === "standard_user")!;
// Segundo usuario: login normal, pero NO es el dueño de la orden de abajo.
const otherUser = users.find((u) => u.username === "performance_glitch_user")!;
const mxMarket = markets.find((m) => m.code === "MX")!;
const API_URL =
  process.env.API_URL ?? "https://omnipizza-backend.onrender.com";

test.describe("Challenge M06 — OrderService.getById (contract test)", () => {
  test.skip("TODO — implement getById and verify status, schema and errors", async () => {
    // ════════════════════════════════════════════════════════
    // 📁 TODO 0 — EN services/OrderService.ts (antes del test)
    // ════════════════════════════════════════════════════════
    // Añade un método público junto a `listMine()`:
    //
    //   async getById(orderId: string): Promise<Order> {
    //     const res = await this.api.get(this.url(`/${orderId}`));
    //     if (!res.ok()) {
    //       throw new Error(
    //         `getById(${orderId}) failed (${res.status()}): ${await res.text()}`
    //       );
    //     }
    //     return (await res.json()) as Order;
    //   }
    //
    // Fíjate: el mensaje del error lleva el STATUS y el BODY del backend.
    // Eso es lo que tus asserts de error van a leer más abajo.
    //
    // Cómo verificar:
    //   pnpm exec tsc --noEmit   → debe pasar
    // ════════════════════════════════════════════════════════

    // ────────────────────────────────────────────────────────
    // Preparación (ya está hecha) — login y una orden REAL
    // ────────────────────────────────────────────────────────
    // Quita el `test.skip(...)` de arriba y deja `test(...)`.
    // Crea la orden con el createOrder que ya existe: el detalle
    // necesita un `order_id` de verdad (los ids no se pueden inventar).
    const auth = await AuthService.create(API_URL);
    const { access_token } = await auth.login(standardUser);
    const { access_token: otherToken } = await auth.login(otherUser);
    await auth.dispose();

    const pizzas = await PizzaService.create(API_URL, access_token, mxMarket.code);
    const firstPizza = (await pizzas.list())[0];
    await pizzas.dispose();

    const orders = await OrderService.create(API_URL, access_token, mxMarket.code);
    const payload: OrderPayload = {
      country_code: mxMarket.code,
      items: [{ pizza_id: firstPizza.id, quantity: 1 }],
      name: mxMarket.fullName,
      address: mxMarket.address,
      phone: mxMarket.phone,
      colonia: mxMarket.colonia,
    };
    const created = await orders.createOrder(payload);

    // ────────────────────────────────────────────────────────
    // TODO 1 — Caso feliz: status 200 + schema del detalle
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   1) Pedir el detalle de la orden recién creada.
    //   2) Si el backend respondió != 2xx, `getById` ya lanza: el hecho de
    //      que el `await` NO explote ES tu assert del status (200).
    //   3) Validar el SCHEMA: que existan los campos del contrato y que
    //      tengan el TIPO correcto, no solo "que haya algo".
    //
    // Pista:
    //   const detail = await orders.getById(created.order_id);
    //   expect(detail.order_id).toBe(created.order_id);
    //   expect(detail).toMatchObject({
    //     order_id: expect.stringMatching(/^ORDER-/),
    //     subtotal: expect.any(Number),
    //     total: expect.any(Number),
    //     currency: mxMarket.currency,
    //     timestamp: expect.any(String),
    //     items: expect.any(Array),
    //   });
    //   expect(detail.items[0]).toMatchObject({
    //     pizza_id: firstPizza.id,
    //     quantity: 1,
    //   });
    //
    // 💡 El detalle es la MISMA forma que la respuesta de checkout
    //    (GUIA-SWAGGER.md §7.2): compara `detail.total` con `created.total`.

    // ────────────────────────────────────────────────────────
    // TODO 2 — Error 404: la orden no existe
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Pedir un order_id inventado y verificar que el servicio rechaza
    //   con el 404 y el mensaje real del backend.
    //
    // Pista:
    //   await expect(orders.getById("ORDER-NOEXISTE")).rejects.toThrow(
    //     /getById\(ORDER-NOEXISTE\) failed \(404\).*not found/s,
    //   );

    // ────────────────────────────────────────────────────────
    // TODO 3 — Error 403: la orden es de OTRO usuario
    // ────────────────────────────────────────────────────────
    // Qué hacer:
    //   Crear un OrderService con el token de `otherUser` y pedir la
    //   orden de standard_user. El backend responde 403 "Access denied"
    //   (autenticado SÍ, autorizado NO).
    //
    // Pista:
    //   const intruder = await OrderService.create(API_URL, otherToken, mxMarket.code);
    //   await expect(intruder.getById(created.order_id)).rejects.toThrow(
    //     /failed \(403\).*Access denied/s,
    //   );
    //   await intruder.dispose();
    //
    // Cómo verificar (todo el reto):
    //   ✓ Challenge M06 — OrderService.getById (contract test)

    // ────────────────────────────────────────────────────────
    // TODO 4 — SIEMPRE dispose al final
    // ────────────────────────────────────────────────────────
    await orders.dispose();
    void otherToken; // quita esta línea cuando uses `otherToken` en el TODO 3

    // ────────────────────────────────────────────────────────
    // SENTINELA — borra esta línea cuando termines los TODOs
    // ────────────────────────────────────────────────────────
    expect(false, "Reto sin resolver: quita test.skip, completa los TODOs y borra esta línea.").toBe(true);
  });
});

// ============================================================
// 📝 Reflexión final — responde mentalmente:
// ============================================================
//
//   1. ¿Por qué el 403 de otro usuario NO es el mismo caso que el 403
//      "Not authenticated" de GUIA-SWAGGER.md §5.1? (Esperado: aquel
//      es "el Bearer no llegó"; este es "el Bearer llegó y es válido,
//      pero la orden no es tuya". Mismo código, causa distinta: por eso
//      el test asserta también el MENSAJE, no solo el status.)
//
//   2. `getById` castea con `as Order`. Si el backend borrara `total`,
//      ¿quién se queja primero, TypeScript o el `expect`? (Esperado: el
//      `expect`, porque el cast confía en el contrato. Por eso el
//      `toMatchObject` con `expect.any(Number)` es el verdadero test
//      de contrato.)
//
//   3. ¿Por qué creamos la orden dentro del propio test y no usamos un
//      order_id fijo? (Esperado: aislamiento — un id hardcodeado puede
//      no existir en otro ambiente; crear la orden hace al test
//      independiente del estado previo del backend.)
//
// 👉 En M07 sacamos el login del test: un `setup` lo hace UNA vez y
//    guarda el badge (storageState) para que la UI arranque ya autenticada.
// ============================================================
```

---

## Paso 10 — Versiona tu trabajo (Git JIT)

Agrega solo lo que toca este módulo y commitea con un mensaje convencional. La capa de servicios + su config + el módulo son una unidad coherente: un commit por capa deja un historial legible (y, en M08, fácil de revertir en CI).

```bash
git add services tests playwright.config.ts
git commit -m "feat(m06): API layer con BaseService abstracta"
git log --oneline -1
```

> 🪟 **Windows / PowerShell:** los comandos `git` son idénticos; no necesitas escapar nada aquí.

**Cómo verificas:** `git log --oneline -1` muestra el commit `feat(m06): ...` en la cima.
