# 2.1 — La cola `chain` y `step()`

> **Módulo 2 · El motor: cola thenable**

> **Analogía QA:** piensa en una **fila de tareas de regresión** que apuntas en un pizarrón: "1) abrir login, 2) elegir mercado, 3) iniciar sesión". Apuntar la tarea NO es ejecutarla — sólo la **encolas**. La ejecución llega después, cuando alguien (el `await`) lee el pizarrón de arriba a abajo. `step()` es el plumón que escribe en esa fila; `chain` es el pizarrón.

---

## ¿Qué aprendes?

- Que en este Fluent Interface las acciones **NO se ejecutan al llamarlas**: se **encolan**.
- Qué es `chain`: una sola `Promise<unknown>` que actúa como **fila de tareas**.
- Cómo `step()` encadena `this.chain = this.chain.then(...)` y devuelve `this` para que sigas escribiendo en una sola expresión.
- Qué hace el `seedChain` opcional del constructor (lo aprovecharás en M3).

> 🔷 **Recuerda la distinción del Módulo 1**
> El "fluent" de este curso es **tu POM** (`return this` + cola `thenable`), **no** el encadenamiento de locators nativo de Playwright (`page.locator(...).getByRole(...)`). Aquí construyes el motor a mano.

---

## El campo `chain`: una fila de tareas que vive en el Page

Cada Page hereda de `BasePage` un único campo privado, `chain`. Arranca **resuelta** (vacía: no hay nada pendiente) y se va alargando conforme encolas acciones.

```ts
// @file fluent-interface-course/pages/BasePage.ts
export class BasePage {
  // Cola interna de acciones encadenadas. Cada `step()` se encola aquí;
  // el `await` sobre el Page (vía `then`) la drena en orden.
  protected chain: Promise<unknown> = Promise.resolve();
```

`Promise.resolve()` es una promesa ya cumplida: la fila empieza **sin tareas pendientes**. Es `protected`, así que sólo las clases hijas (`LoginPage`, `CatalogPage`...) la ven — el spec nunca la toca directamente.

---

## El constructor y su `seedChain` opcional

El constructor recibe el `page` (la pestaña) y, opcionalmente, una **cola ya empezada**:

```ts
// @file fluent-interface-course/pages/BasePage.ts
// `protected readonly page` — herramienta interna, amarrada a una pestaña.
// `seedChain` — permite que una transición de pantalla (p. ej. loginInMarket)
// entregue su cola pendiente al siguiente Page.
constructor(protected readonly page: Page, seedChain?: Promise<unknown>) {
  if (seedChain) this.chain = seedChain;
}
```

El segundo parámetro, `seedChain`, es el truco que permite que un Page **herede la fila de tareas** de otro. Cuando una acción cruza de pantalla (de login a catálogo), no queremos perder lo encolado: le pasamos la cola al Page destino como semilla. Por ahora quédate con la idea — el mecanismo completo de transición lo desarmas en **M3 (3.3)**. Aquí lo importante es que la cola es un objeto que **se puede entregar**.

---

## `step()`: encolar una acción y devolver `this`

Aquí está el corazón del motor. `step()` recibe una acción `async`, la **añade al final de la fila** y devuelve `this`:

```ts
// @file fluent-interface-course/pages/BasePage.ts
/** Encola una acción async y devuelve `this` para encadenar. */
protected step(action: () => Promise<unknown>): this {
  this.chain = this.chain.then(() => action());
  return this;
}
```

Léelo despacio, porque son dos movimientos en dos líneas:

1. **`this.chain = this.chain.then(() => action())`** — toma la cola actual y le **encadena** una nueva tarea al final. No ejecuta `action()` ahora: registra que, *cuando* la cola se drene, se llamará `action()` **después** de lo anterior. Reasignar `this.chain` deja la fila más larga.
2. **`return this`** — devuelve la misma instancia del Page, así la siguiente llamada (`.selectMarket(...)`, `.loginAs(...)`) opera sobre el mismo objeto y vuelve a encolar.

Esa pareja —encolar + devolver `this`— es lo que hace posible escribir el flujo como una sola frase encadenada.

---

## Cómo lo usan los métodos del Page

Cada acción pública de un Page es, por dentro, una llamada a `step()`. Mira `goto()` y `selectMarket()` de `LoginPage`:

```ts
// @file fluent-interface-course/pages/LoginPage.ts
goto(): this {
  return this.step(() => this.page.goto(this.path));
}

selectMarket(code: CountryCode): this {
  return this.step(() => this.marketFlag(code).click());
}
```

Fíjate: ambas devuelven `this` (vía `step`). Ninguna lleva `async`/`await` en su firma — porque **no esperan nada**: sólo encolan y se apartan. Por eso puedes escribir:

```ts
// @file fluent-interface-course/tests/fluent-ejemplo.spec.ts
// Esto NO ejecuta nada todavía: sólo deja 2 tareas en la fila.
loginPage.goto().selectMarket("MX");
```

Tras esa línea, en `chain` hay dos tareas encoladas (navegar, luego clic en la bandera), pero **el navegador aún no se ha movido**. Falta el `await` que las dispara — y eso es justo lo que verás en **2.2**.

---

## Cómo correrlo

```bash
$ pnpm test tests/fluent-ejemplo.spec.ts
```

---

## Qué observar

- `chain` arranca como `Promise.resolve()`: una **fila vacía**, sin tareas pendientes.
- `step()` hace **dos** cosas: encola (`this.chain = this.chain.then(...)`) y devuelve `this`. Esa pareja es lo que habilita el encadenamiento.
- Llamar a una acción (`goto()`, `selectMarket()`) **no la ejecuta** — sólo la apunta en la fila. Es la diferencia clave entre este patrón y el `await` por acción que ya conoces.
- El `seedChain` del constructor permite **entregar** la cola a otro Page; lo usarás cuando una acción cruce de pantalla (M3).

⬅️ Anterior: [Síntesis M1](/docs/fluent-interface/m1-sintesis) · ➡️ Siguiente: [2.2 then(): el Page awaitable](/docs/fluent-interface/m2-then-awaitable)
