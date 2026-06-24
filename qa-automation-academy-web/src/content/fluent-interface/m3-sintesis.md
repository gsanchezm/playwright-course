# 3.5 — Síntesis del Módulo 3

> **Módulo 3 · Patrones de POM fluido**

> **Analogía QA:** cerramos el módulo como cierras un ciclo de pruebas: con el resumen de lo verificado. Ya no solo entiendes la **mecánica** del fluent (cola, `then`, `query`) — ahora tienes los **patrones** que la convierten en un POM que se lee como prosa: builders expresivos, DRY, transiciones de pantalla y assertions encadenables.

---

## Lo que cubriste

| Mini-clase | Idea clave |
| --- | --- |
| 3.1 El builder fluido | `withUsername().withPassword().andMarket().login()` se lee como user story; cada paso encola y devuelve `this`, son nombres semánticos sobre acciones base. |
| 3.2 DRY + 2 formas de locator | `typeInput` (clear+fill en un lugar, encola, devuelve `this`); Forma A = testid string + `typeInput`, Forma B = getters `Locator`. Mismo resultado, elige UNA. |
| 3.3 Transición de página | `loginInMarket()` cruza de pantalla: `return new CatalogPage(this.page, this.chain)` hereda la cola vía `seedChain`; el test sigue encadenando sin `await` intermedio. |
| 3.4 Assertions encadenables | `expectLoaded()` / `expectHasPizzas()` / `expectCartCount()` / `expectConfirmation()` / `expectTotalContains()` devuelven `this`; se mezclan con acciones en una cadena. |
| 🚩 Reto | Implementar `expectMinPizzas(min)` encadenable y usarla tras `loginInMarket`, con un solo `await`. |

---

## 🧠 Síntesis e insights clave — Módulo 3

- **Builder expresivo:** el fluent no añade lógica, añade **vocabulario**. `withUsername` delega en `typeInput`, `andMarket` en `selectMarket`; el valor es que el spec se lee como un caso de prueba manual.
- **DRY = un punto de cambio:** `typeInput` reúne `clear()+fill()` una sola vez. Si la app cambia cómo se escribe en un input, tocas una línea y todo el POM lo hereda.
- **Dos formas, un estilo:** testid en string (Forma A) o getter `Locator` (Forma B) producen el **mismo resultado**. Conviven aquí solo para comparar; en producción **eliges UNA** por consistencia.
- **Page-transition con herencia de cola:** una acción que **cambia de pantalla** devuelve el **Page destino** y le pasa `this.chain` por el `seedChain` del constructor. La cola pendiente viaja con el nuevo Page, así el `await` final drena login + catálogo en orden.
- **Assertions encadenables:** una assertion es un `step()` que encola un `expect` y devuelve `this`, idéntico a una acción. Por eso `await catalogPage.expectLoaded().expectHasPizzas()` funciona, y puedes intercalar acciones y verificaciones en la misma cadena.
- **Regla de retorno:** misma pantalla → `this`; cambio de pantalla → Page destino; verificación → `this` (assertion) o dato terminal (query con `get…`).

---

> 🌉 **Puente al Módulo 4**
> Ya tienes el POM fluido completo: builders, DRY, transiciones y assertions encadenables, todo sobre la cola encolada de los Módulos 1 y 2. En **M4** ensamblas un **reto E2E completo** que encadena las tres pantallas (login → catálogo → checkout) en un flujo fluido de punta a punta, y después das un paso atrás para la pregunta honesta: **¿cuándo SÍ conviene este patrón y cuándo NO?** Porque tan importante como saber construir el fluent es saber cuándo el `await`-por-acción idiomático de Playwright es la mejor opción.

---

⬅️ Anterior: [Reto M3](/docs/fluent-interface/m3-reto) · ➡️ Siguiente: [4.1 Reto E2E completo](/docs/fluent-interface/m4-reto-e2e)
