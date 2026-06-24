# 2.4 — Síntesis del Módulo 2

> **Módulo 2 · El motor: cola thenable**

> **Analogía QA:** cerramos el módulo como cierras un test run: con el resumen de lo verificado. Ya desarmaste el **motor** del Fluent Interface: la fila de tareas (`chain`) y los tres verbos que operan sobre ella. Con esto entiendes *por qué* `await loginPage.goto().login()` funciona — y por qué nunca debes olvidar el `await`.

---

## Lo que cubriste

| Mini-clase | Idea clave |
| --- | --- |
| 2.1 La cola `chain` y `step()` | Las acciones **no se ejecutan al llamarlas**: `step()` las **encola** (`this.chain = this.chain.then(...)`) y devuelve `this`. El `seedChain` permite entregar la cola a otro Page. |
| 2.2 `then()`: el Page awaitable | El Page es **thenable**: `await page` invoca `then()`, que **drena** la cola en orden. Resuelve a **`undefined`**, nunca a `this`, para no auto-adoptarse y colgarse. |
| 2.3 `query()`: terminal | Para **leer datos**: `await this.chain` (drena) y luego computa. Devuelve `Promise<T>`, no `this`. Es **terminal**: cierra la cadena. |
| 🚩 Reto | Drenar una cadena encolada (`await`) y cerrarla con una query (`getPizzaNames`). |

---

## El trío del motor, lado a lado

| Verbo | Sobre la cola | Devuelve | ¿Encadenable? | Para qué |
| --- | --- | --- | --- | --- |
| **`step()`** | **encola** | `this` | sí | ejecutar una acción (clic, fill, navegar) |
| **`then()`** | **drena** | `undefined` | no (lo dispara el `await`) | ejecutar toda la cadena en orden |
| **`query()`** | **drena** | datos (`Promise<T>`) | no (terminal) | leer un valor del estado de la página |

`then` y `query` **comparten** el "drenar la cola"; difieren en lo que entregan: `then` **descarta** el valor (su trabajo es *ejecutar*), `query` lo **devuelve** (su trabajo es *leer*).

---

## 🧠 Síntesis e insights clave — Módulo 2

- **Encolar ≠ ejecutar.** Llamar a una acción (`goto()`, `selectMarket()`) sólo la apunta en `chain`. La ejecución la dispara el `await` (vía `then`). Olvidar el `await` = cadena fantasma que nunca toca la app.
- **El Page es awaitable porque implementa `then`.** Esa es toda la magia del "thenable": un método `then` convierte cualquier objeto en algo que `await` sabe esperar.
- **`then()` resuelve a `undefined` a propósito.** Si resolviera a `this` (otro thenable), el `await` se **auto-adoptaría** recursivamente y se colgaría hasta el timeout. `.then<void>(() => undefined)` corta esa recursión.
- **`query()` es terminal.** Drena primero (para medir sobre un estado estable) y devuelve datos, no `this`. No puedes encadenar después de una query — y eso es correcto.
- **`seedChain`** deja **entregar** la cola de un Page a otro: la semilla de la transición de pantalla que verás en M3.

---

> 🔷 **Puente al Módulo 3 — del motor a la API expresiva**
> Ya tienes el motor (`chain` + `step`/`then`/`query`). En **M3** lo conviertes en una **API que se lee como una frase**:
> - **3.1–3.2** — el *builder fluido* (`withUsername().withPassword().login()`) y el DRY de `typeInput`, con las 2 formas de declarar un locator.
> - **3.3** — la **transición de página**: aquí por fin usas el `seedChain` que viste en 2.1 — `loginInMarket` cruza de `LoginPage` a `CatalogPage` **heredando la cola** pendiente.
> - **3.4** — assertions encadenables (`expectLoaded().expectHasPizzas()`), que por dentro son `step()` envolviendo un `expect`.
> Todo M3 se apoya en el motor que acabas de desarmar. Sin entender `step`/`then`/`query`, la API de M3 sería magia; ahora sabes exactamente qué pasa por debajo.

---

⬅️ Anterior: [Reto M2](/docs/fluent-interface/m2-reto) · ➡️ Siguiente: [3.1 Builder fluido](/docs/fluent-interface/m3-builder-fluido)
