# 🚩 Reto — Módulo 3: "Encadena el flujo, no lo cortes"

> **Módulo 3 · Patrones de POM fluido**

> **Analogía QA:** ya leíste el caso de prueba; ahora lo **ejecutas de corrido**. En la versión fluida, `loginInMarket` no devuelve datos: **encola el login y te entrega el `CatalogPage` destino** (heredando la cola). La trampa es instintiva — querrás ponerle un `await`. No lo hagas. El `await` llega **una sola vez al final**, sobre la cadena de assertions, y drena en orden el login encolado más cada verificación. Es justo lo que harías en un proyecto real: leer el spec como una historia, sin cortes.

---

## Instrucciones

Trabajas en **un solo archivo**: `tests/reto-m3.spec.ts`. Hay **un único `// TODO`**.

1. **Cruza a catálogo con `loginInMarket`** — reemplaza el placeholder `new CatalogPage(page)` por la llamada real `loginPage.loginInMarket(standardUser, "MX")`. Va **sin `await`**: devuelve un `CatalogPage` (no una promesa de datos) con el login ya encolado dentro.
2. **No toques la cadena de assertions.** La línea `await catalogPage.expectLoaded().expectHasPizzas();` ya está fija. Ese **único `await`** dispara la cola completa: primero el login heredado, luego las dos assertions, en orden.
3. Corre el test y verifica que pasa en **verde** para el mercado MX.

> Es **esperado** que veas ❌ (rojo) hasta que reemplaces el placeholder: mientras `catalogPage` sea un `new CatalogPage(page)` vacío, nunca se hace login real, no hay pizzas, y `expectLoaded` falla por timeout. Cuando cruces con `loginInMarket`, el test queda en ✅: login → catálogo → al menos una pizza, todo en una sola cadena encolada.

### Aparte — así se construye una assertion encadenable

En este reto **encadenas assertions que ya existen** (`expectLoaded` y `expectHasPizzas`). Pero vale la pena ver el patrón que hace que se puedan encadenar, por si quieres agregar las tuyas. Una nueva assertion, p. ej. `expectMinPizzas`, se vería así dentro del Page Object:

```ts
expectMinPizzas(min: number): this {
  return this.step(async () => {
    const count = await this.pizzaCards.count();
    expect(count).toBeGreaterThanOrEqual(min);
  });
}
```

El secreto está en `return this.step(...)`: `step()` **encola** la acción y **devuelve `this`**, así que el método es encolable *y* encadenable. Si escribieras el `expect` suelto (fuera de `step`), correría de inmediato, fuera de la cola, rompiendo el orden fluido; y sin el `return`, el método devolvería `undefined` y no podrías encadenar nada después. Este bloque es **ilustrativo** — no tienes que implementarlo para resolver el reto.

---

## Plantilla

```ts
// @file fluent-interface-course/tests/reto-m3.spec.ts
import { test } from "@playwright/test";
import { LoginPage, CatalogPage } from "../pages";
import type { User } from "../types";
import usersJson from "../data/users.json";

const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test("Reto M3 — login fluido + assertions encadenadas en MX", async ({ page }) => {
  const loginPage = new LoginPage(page);

  // ──────────────────────────────────────────────────────────
  // TODO — Cruza a catálogo con `loginInMarket` SIN `await`
  // ──────────────────────────────────────────────────────────
  // `loginInMarket(user, code)` encola el login y DEVUELVE el CatalogPage
  // destino (heredando la cola). OJO: NO lo await-es — devuelve un Page,
  // no una promesa de datos; await-earlo drenaría la cola y resolvería a
  // `undefined`, perdiendo el handle. Reemplaza el placeholder de abajo:
  //
  //   const catalogPage = loginPage.loginInMarket(standardUser, "MX");
  const catalogPage: CatalogPage = /* TODO: loginInMarket(...) */ new CatalogPage(page);

  // ──────────────────────────────────────────────────────────
  // Cadena de assertions (NO la toques) — un SOLO `await` drena la cola
  // heredada (el login encolado) y LUEGO las dos assertions, en orden.
  // Falla en ROJO mientras el placeholder de arriba no haga el login real.
  // ──────────────────────────────────────────────────────────
  await catalogPage.expectLoaded().expectHasPizzas();
});
```

---

## Cómo correrlo

```bash
$ npx playwright test tests/reto-m3.spec.ts
```

Mientras el placeholder siga ahí, el test **falla en ROJO** (`expectLoaded` no encuentra catálogo porque nunca hubo login). En cuanto reemplaces el `// TODO` por `loginPage.loginInMarket(standardUser, "MX")`, el mismo `await` final drena el login encolado y las assertions, y el test pasa en **VERDE**.

**Objetivo:** el test `Reto M3 — login fluido + assertions encadenadas en MX` termina en ✅ (verde).

---

## Checklist de auto-corrección

- [ ] Reemplazaste el placeholder `new CatalogPage(page)` por `loginPage.loginInMarket(standardUser, "MX")`.
- [ ] `loginInMarket(...)` se llama **sin `await`** y su retorno se guarda en `catalogPage`.
- [ ] **No** tocaste la línea fija `await catalogPage.expectLoaded().expectHasPizzas();`.
- [ ] La cadena queda cerrada por **un único `await`** al principio (no metiste un `await` extra en medio).
- [ ] `npx playwright test tests/reto-m3.spec.ts` pasa en **verde**.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- **El reemplazo, literal:** sustituye todo el lado derecho del `=` (el `/* TODO: ... */ new CatalogPage(page)`) por `loginPage.loginInMarket(standardUser, "MX");`. La anotación de tipo `: CatalogPage` puede quedarse — `loginInMarket` ya devuelve un `CatalogPage`.
- **Nada de `await` aquí:** `loginInMarket` no es `async` en la versión fluida (lección 3.3). Devuelve el `CatalogPage` al instante con la cola del login encolada dentro. Ponerle `await` drenaría la cola antes de tiempo, resolvería a `undefined` y perderías el handle.
- **Un solo `await`, al final:** el `await` ya está al principio de la última línea, envolviendo toda la cadena: `await catalogPage.expectLoaded().expectHasPizzas();`. Ese `await` dispara la cola completa heredada del login más las dos assertions, en orden. No agregues otro.
- **Por qué `return this.step(...)`:** así están escritas `expectLoaded` y `expectHasPizzas` — `step()` encola la acción **y** devuelve `this`, lo que permite encadenarlas. Es el mismo patrón del aparte de arriba.
- **Si falla con timeout en la primera card:** OmniPizza corre contra un backend desplegado que a veces tarda en arrancar; `expectLoaded` ya espera hasta 30s. Si persiste, vuelve a correr — no es tu código.

</details>

---

⬅️ Anterior: [3.4 Assertions encadenables](/docs/fluent-interface/m3-assertions-encadenables) · ➡️ Siguiente: [Síntesis M3](/docs/fluent-interface/m3-sintesis)
