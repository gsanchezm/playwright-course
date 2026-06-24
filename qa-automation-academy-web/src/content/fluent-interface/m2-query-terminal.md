# 2.3 — `query()`: operaciones terminales

> **Módulo 2 · El motor: cola thenable**

> **Analogía QA:** hasta ahora apuntabas tareas en el pizarrón (`step`) y al final las ejecutabas (`then`). Pero a veces no quieres *hacer* algo: quieres **leer un dato** — "¿cuántas pizzas hay en el catálogo?", "¿cómo se llaman?". Eso es como pedir el **conteo de un reporte**: primero terminas de ejecutar todo lo pendiente, y *luego* lees el número. `query()` es ese cierre que drena la fila y te devuelve el dato.

---

## ¿Qué aprendes?

- La diferencia entre una **acción** (cambia el estado, no devuelve datos) y una **query** (devuelve datos, no encadena).
- Cómo `query()` primero **drena** la cola pendiente (`await this.chain`) y *después* computa el valor.
- Por qué `query()` es **terminal**: devuelve `Promise<T>`, no `this` — la cadena termina ahí.
- Ejemplos reales: `getPizzaCount()` y `getPizzaNames()` de `CatalogPage`.

---

## Acción vs query: dos verbos distintos

Hasta ahora todos los métodos del Page **encolaban trabajo** y devolvían `this` (vía `step`). Pero un Page también necesita **responder preguntas**: el conteo de pizzas, la lista de nombres, el total de un pedido. Esas operaciones tienen una naturaleza opuesta:

| | Acción (`step`) | Query (`query`) |
| --- | --- | --- |
| Qué hace | ejecuta algo (clic, fill, navegar) | lee y devuelve un dato |
| Cuándo corre | encolada, corre al `await` de la cadena | drena la cola y computa **ya** |
| Qué devuelve | `this` (encadenable) | `Promise<T>` (datos) |
| ¿Encadenable? | **sí** | **no** — es **terminal** |

Una query no puede simplemente "encolarse y devolver `this`": necesita un **valor de vuelta**, y ese valor sólo es correcto **después** de que todo lo encolado antes haya corrido. Por eso `query()` existe.

---

## El `query()` real

```ts
// @file fluent-interface-course/pages/BasePage.ts
/**
 * Para QUERIES que devuelven datos: primero drena la cola pendiente,
 * luego computa y devuelve el valor. Es terminal — no es encadenable.
 */
protected async query<T>(compute: () => Promise<T> | T): Promise<T> {
  await this.chain;
  return compute();
}
```

Dos líneas, dos fases:

1. **`await this.chain`** — espera a que **toda** la fila de tareas pendientes se complete. Si encadenaste `waitForCatalog()` antes de preguntar el conteo, esta línea garantiza que el catálogo ya cargó cuando vayas a contar. **Drena, igual que `then`** — pero aquí no descartamos a `undefined`: simplemente esperamos.
2. **`return compute()`** — ahora que el estado de la página está estable, computa el valor (contar las cards, leer los nombres) y lo devuelve.

El orden importa: si computaras **antes** de drenar, contarías sobre una página a medio cargar. `query()` te da la garantía de "primero termina lo pendiente, luego mide".

---

## Ejemplo 1: `getPizzaCount()` — la query mínima

```ts
// @file fluent-interface-course/pages/CatalogPage.ts
getPizzaCount(): Promise<number> {
  return this.query(() => this.pizzaCards.count());
}
```

Fíjate en la firma: devuelve `Promise<number>`, **no** `this`. No es `async` en su declaración porque `query()` ya es async y devuelve la promesa directamente. El `compute` es minúsculo —`this.pizzaCards.count()`— pero corre **después** de drenar la cola.

---

## Ejemplo 2: `getPizzaNames()` — query con cómputo real

```ts
// @file fluent-interface-course/pages/CatalogPage.ts
getPizzaNames(): Promise<string[]> {
  return this.query(async () => {
    const names: string[] = [];
    const cards = await this.pizzaCards.all();
    for (const card of cards) {
      const name = await card.getByRole("heading").first().textContent();
      if (name) names.push(name.trim());
    }
    return names;
  });
}
```

Aquí el `compute` es un callback `async` con lógica: obtiene todas las cards con `.all()`, recorre cada una, lee el `heading` (el nombre de la pizza) con `getByRole("heading").first().textContent()` y lo acumula ya **trimeado**. Todo ese cómputo sólo corre cuando `query()` terminó de drenar la cola — así nunca lees nombres de un catálogo a medio renderizar.

---

## Cómo se usan: la cadena se cierra

En el spec, las acciones se encadenan y la query **cierra** la frase devolviendo datos:

```ts
// @file fluent-interface-course/tests/fluent-ejemplo.spec.ts
// El catálogo encadena acciones; la QUERY (getPizzaNames) cierra la cadena
// devolviendo DATOS — ya no se puede seguir encadenando sobre ella.
await catalogPage.waitForCatalog();
const names = await catalogPage.getPizzaNames();
console.log(`Pizzas en MX: ${names.length}`);
```

Como `getPizzaNames()` devuelve `Promise<string[]>` y **no** `this`, intentar `catalogPage.getPizzaNames().selectCategory("veggie")` no compilaría: un `string[]` no tiene `.selectCategory`. Eso es lo que significa **terminal** — la query es el punto final de la cadena.

> 🔷 **El trío del motor, completo**
> Con `query()` ya tienes las tres piezas del Fluent Interface encadenable:
> - **`step()`** → **encola** y devuelve `this` (encadenable).
> - **`then()`** → **drena** y resuelve a `undefined` (awaitable; ejecuta la cadena).
> - **`query()`** → **drena** y devuelve **datos** (terminal; cierra la cadena).
> `then` y `query` comparten el "drenar la cola"; difieren en lo que entregan después: `then` descarta el valor (es para *ejecutar*), `query` lo devuelve (es para *leer*).

---

## Cómo correrlo

```bash
$ pnpm test tests/fluent-ejemplo.spec.ts
```

---

## Qué observar

- Una **acción** cambia estado y devuelve `this`; una **query** devuelve datos y es **terminal**.
- `query()` hace `await this.chain` **antes** de computar: garantiza que mides sobre un estado estable, no a medio cargar.
- `getPizzaCount()` devuelve `Promise<number>` y `getPizzaNames()` devuelve `Promise<string[]>` — **nunca** `this`. Por eso no puedes seguir encadenando tras una query.
- `getPizzaNames()` lee cada nombre con `getByRole("heading").first().textContent()` y lo guarda **trimeado**.
- `step` y `query` se parecen (ambos viven sobre `chain`) pero son opuestos: `step` **encola** y devuelve `this`; `query` **drena** y devuelve el dato.

⬅️ Anterior: [2.2 then(): el Page awaitable](/docs/fluent-interface/m2-then-awaitable) · ➡️ Siguiente: [Reto M2](/docs/fluent-interface/m2-reto)
