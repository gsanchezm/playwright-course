# 3.3 — Transición de página: cruzar de pantalla heredando la cola

> **Módulo 3 · Patrones de POM fluido**

> **Analogía QA:** en una prueba manual, el login no termina en la pantalla de login — te **deja parado en el catálogo**. Tu siguiente paso ("ahora veo las pizzas") ya no pertenece al guion de login, pertenece al de catálogo, pero lo escribes sin pausa, en el mismo flujo. El POM fluido reproduce ese salto: el método de login **cruza de pantalla** y te entrega el Page del catálogo, con la cola de acciones pendientes intacta, para que sigas encadenando sin frenar.

---

## ¿Qué aprendes?

- Qué es una **transición de página** en POM fluido: un método que devuelve **otro Page**, no `this`.
- Cómo `loginInMarket()` encola el login y **cruza** a `CatalogPage` sin un `await` intermedio.
- El mecanismo de **herencia de cola**: el `seedChain` del constructor de `BasePage` recibe la cola pendiente.
- Por qué el test puede seguir encadenando assertions sobre el `CatalogPage` resultante.

---

## El problema: ¿cómo encadenas a través de dos pantallas?

Las acciones que devuelven `this` te dejan encadenar dentro de **un** Page. Pero un flujo E2E cruza pantallas: empiezas en login (`/`) y terminas en catálogo (`/catalog`). Si `loginInMarket` devolviera `this` (un `LoginPage`), no podrías encadenar `.expectHasPizzas()` después — ese método vive en `CatalogPage`, no en `LoginPage`. La solución: que el método de transición devuelva **el Page destino**.

```ts
// @file fluent-interface-course/pages/LoginPage.ts
// Orquestador de alto nivel. Encola el login y CRUZA de pantalla:
// devuelve el Page destino (Fluent page-transition) heredando la cola,
// para que el test siga encadenando sobre el CatalogPage.
loginInMarket(user: User, code: CountryCode): CatalogPage {
  this.goto().selectMarket(code).loginAs(user).waitForUrl(/\/catalog/);
  return new CatalogPage(this.page, this.chain);
}
```

Lee la firma: `loginInMarket(...): CatalogPage`. Devuelve un `CatalogPage`, no un `this`. Eso es una **transición de página**.

---

## La herencia de cola: pasar `this.chain` al Page destino

Aquí está el detalle que lo hace funcionar. La primera línea de `loginInMarket` **encola** cuatro acciones (`goto`, `selectMarket`, `loginAs`, `waitForUrl`) — pero, como sabes, encolar no ejecuta: solo llena `this.chain`. Si creáramos el `CatalogPage` con una cola limpia, esas cuatro acciones pendientes se **perderían**.

Por eso pasamos `this.chain` como segundo argumento del constructor: `new CatalogPage(this.page, this.chain)`. El catálogo nace con la cola del login **ya cargada**. Quien recibe esa cola es el `seedChain` de `BasePage`:

```ts
// @file fluent-interface-course/pages/BasePage.ts
// Cola interna de acciones encadenadas. Cada `step()` se encola aquí;
// el `await` sobre el Page (vía `then`) la drena en orden.
protected chain: Promise<unknown> = Promise.resolve();

// `protected readonly page` — herramienta interna, amarrada a una pestaña.
// `seedChain` — permite que una transición de pantalla (p. ej. loginInMarket)
// entregue su cola pendiente al siguiente Page.
constructor(protected readonly page: Page, seedChain?: Promise<unknown>) {
  if (seedChain) this.chain = seedChain;
}
```

El constructor es la pieza clave: si le pasas un `seedChain`, **adopta** esa cola como propia (`this.chain = seedChain`). Si no (cuando haces `new LoginPage(page)` a secas), arranca con una cola vacía (`Promise.resolve()`). Así, el `CatalogPage` que sale de `loginInMarket` ya trae encoladas las 4 acciones del login; cuando el test encadene más acciones sobre él, se apilan **detrás** de esas cuatro, y el `await` final las drena todas en orden: login primero, catálogo después.

> 🔷 **Devolver `this` vs. devolver otro Page — la regla**
> Una acción que **se queda en la misma pantalla** devuelve `this` (encadenas más métodos del mismo Page). Una acción que **cambia de pantalla** devuelve el **Page destino** y le hereda la cola vía `seedChain`. Esa es toda la regla del page-transition fluido: el tipo de retorno te dice en qué pantalla estás después de la acción.

---

## El test cruza pantallas sin un `await` en medio

Mira cómo se ve en el spec. `loginInMarket` devuelve el `CatalogPage`; lo guardas y **sigues encadenando** assertions sobre él. El login y las assertions del catálogo viven en la misma cola heredada, y un único `await` las ejecuta todas:

```ts
// @file fluent-interface-course/tests/fluent-ejemplo.spec.ts
// Fluent: loginInMarket CRUZA a /catalog y DEVUELVE el CatalogPage
// (encadenable, hereda la cola). El `await` ejecuta el login y luego
// las assertions encadenadas en una sola expresión.
const loginPage = new LoginPage(page);
const catalogPage = loginPage.loginInMarket(standardUser, market.code);

await catalogPage.expectLoaded().expectHasPizzas();
```

Fíjate en lo que **no** hay: no hay `await` entre `loginInMarket(...)` y `expectLoaded()`. El login no se ejecuta al llamar `loginInMarket` — solo se encola y se hereda. El único `await` está al final, sobre `catalogPage`, y drena toda la historia: ir a la página, elegir mercado, hacer login, esperar `/catalog`, verificar que cargó y que hay pizzas. Una sola línea de `await` para un flujo de dos pantallas.

> 🔷 **No confundas con el `await loginInMarket(...)` del POM básico**
> Si modelaras esa transición en un POM **no fluido**, `loginInMarket` sería `async` y devolvería `Promise<CatalogPage>`, así que escribirías `const catalog = await loginPage.loginInMarket(...)`. En la versión **fluida** de este curso el método **no** es `async`: devuelve el `CatalogPage` de inmediato (con la cola encolada dentro), y el `await` se hace **después**, sobre la cadena de assertions. Misma intención de negocio, mecánica distinta.

---

## Cómo correrlo

```bash
$ pnpm test tests/fluent-ejemplo.spec.ts
```

---

## Qué observar

- Una **transición de página** es un método que devuelve **otro Page** (`CatalogPage`), no `this`.
- `loginInMarket` **encola** el login y devuelve `new CatalogPage(this.page, this.chain)` — cruza de pantalla.
- La **herencia de cola** la habilita el `seedChain` del constructor: el Page destino adopta la cola pendiente.
- El test sigue encadenando assertions sobre el `CatalogPage` **sin un `await` intermedio**; el `await` final drena todo en orden.
- Regla: misma pantalla → devuelve `this`; cambio de pantalla → devuelve el Page destino con la cola heredada.

---

⬅️ Anterior: [3.2 DRY + 2 formas de locator](/docs/fluent-interface/m3-dry-y-2-formas) · ➡️ Siguiente: [3.4 Assertions encadenables](/docs/fluent-interface/m3-assertions-encadenables)
