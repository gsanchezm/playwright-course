# 3.4 — Assertions encadenables

> **Módulo 3 · Patrones de POM fluido**

> **Analogía QA:** al cerrar un caso de prueba no verificas una sola cosa — verificas una **lista de criterios de aceptación**: "la pantalla cargó, hay productos, el carrito muestra 1". En un guion manual los pones como viñetas seguidas. En el POM fluido los pones como una **cadena de assertions**: `expectLoaded().expectHasPizzas().expectCartCount(1)`, leídas como esa misma lista de checks.

---

## ¿Qué aprendes?

- Que las **assertions también devuelven `this`** y se encadenan igual que las acciones.
- Cómo una assertion encadenable encola un `expect(...)` vía `step()`.
- Que puedes **mezclar acciones y assertions** en una sola cadena, drenada por un único `await`.
- El catálogo de assertions encadenables de `CatalogPage` y `CheckoutPage`.

---

## Una assertion también es un paso encolado

Una assertion encadenable no es nada especial: es un `step()` que encola un `expect(...)` y devuelve `this`, idéntico a una acción. Por eso puedes ponerla en la misma cadena que `goto` o `addFirstPizza`. Mira las de `CatalogPage`:

```ts
// @file fluent-interface-course/pages/CatalogPage.ts
// --- Assertions encadenables ---

expectLoaded(): this {
  return this.step(async () => {
    await expect(this.page).toHaveURL(/\/catalog/);
    await expect(this.pizzaCards.first()).toBeVisible({ timeout: 30_000 });
  });
}

expectHasPizzas(): this {
  return this.step(async () => {
    const count = await this.pizzaCards.count();
    expect(count).toBeGreaterThan(0);
  });
}

expectCartCount(n: number): this {
  return this.step(() => expect(this.cartCount).toHaveText(String(n)));
}
```

Cada una termina en `return this.step(...)`: encola la verificación y devuelve la instancia. El `expect` **no** corre cuando llamas el método — corre cuando el `await` final drena la cola, exactamente como una acción. Si una assertion falla, la promesa de la cola se rechaza y tu `await` lanza el error: el test se pone rojo en el punto correcto.

---

## Encadenar assertions: la lista de criterios

Así se ve la cadena de assertions en el test. Se lee como una lista de criterios de aceptación, cerrada por un solo `await`:

```ts
// @file fluent-interface-course/tests/fluent-ejemplo.spec.ts
const loginPage = new LoginPage(page);
const catalogPage = loginPage.loginInMarket(standardUser, market.code);

await catalogPage.expectLoaded().expectHasPizzas();
```

`expectLoaded()` encola "la URL es /catalog y la primera card es visible"; devuelve `this`; `expectHasPizzas()` encola "hay al menos una pizza"; devuelve `this`; el `await` ejecuta ambas en orden, **después** del login que el `CatalogPage` heredó (lección 3.3). Tres verificaciones de negocio en una sola línea legible.

---

## Mezclar acciones y assertions en la misma cadena

Como acciones y assertions son ambas `step()` que devuelven `this`, puedes **intercalarlas** libremente. Por ejemplo, sobre `CatalogPage`: esperar el catálogo, añadir la primera pizza, y verificar que el carrito subió a 1 — todo encadenado:

```ts
// @file fluent-interface-course/tests/fluent-ejemplo.spec.ts
// Acción + acción + assertion, en una sola cadena drenada por un await.
await catalogPage
  .waitForCatalog()
  .addFirstPizza()
  .expectCartCount(1);
```

La cola garantiza el orden: primero espera el catálogo, luego hace click en "add to cart", y solo entonces verifica el contador. No hay forma de que la assertion corra antes que la acción que la precede — porque ambas están en la misma cola secuencial.

---

## Assertions de `CheckoutPage`

El mismo patrón en la pantalla de checkout, que usarás en el reto. Las assertions de confirmación y de total también devuelven `this`:

```ts
// @file fluent-interface-course/pages/CheckoutPage.ts
// --- Assertions encadenables ---

expectLoaded(): this {
  return this.step(() => expect(this.placeOrderButton).toBeVisible());
}

expectConfirmation(): this {
  return this.step(() => expect(this.orderConfirmation).toBeVisible({ timeout: 20_000 }));
}

expectTotalContains(currencySymbol: string): this {
  return this.step(() => expect(this.orderTotal).toContainText(currencySymbol));
}
```

Con esto puedes cerrar un flujo de checkout encadenando la acción y sus verificaciones: `checkoutWith(market).expectConfirmation().expectTotalContains("$")` — el pedido se envía y, en la misma cola, se verifica la confirmación y que el total muestra el símbolo de moneda esperado.

> 🔷 **Assertion encadenable vs. query terminal — la diferencia**
> Una assertion encadenable **verifica** y devuelve `this` (sigues encadenando): `expectHasPizzas()`. Una **query** (lección 2.3) **devuelve un dato** y termina la cadena vía `query()`: `getPizzaCount()` resuelve un `number`, no un `this`, así que no puedes poner un `.` después. Regla práctica: si el método empieza con `expect…`, encadena; si empieza con `get…`, cierra la cadena con su valor.

---

## Cómo correrlo

```bash
$ pnpm test tests/fluent-ejemplo.spec.ts
```

---

## Qué observar

- Una assertion encadenable es un `step()` que encola un `expect(...)` y **devuelve `this`** — igual que una acción.
- El `expect` no corre al llamar el método; corre cuando el **`await` final** drena la cola.
- Puedes **mezclar** acciones y assertions en una cadena; la cola garantiza el orden secuencial.
- `CatalogPage` aporta `expectLoaded` / `expectHasPizzas` / `expectCartCount`; `CheckoutPage`, `expectConfirmation` / `expectTotalContains`.
- `expect…` encadena (devuelve `this`); `get…` es **terminal** (devuelve un dato vía `query()`).

---

⬅️ Anterior: [3.3 Transición de página con herencia de cola](/docs/fluent-interface/m3-transicion-de-pagina) · ➡️ Siguiente: [Reto M3](/docs/fluent-interface/m3-reto)
