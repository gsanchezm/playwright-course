# 4.2 — ¿Cuándo SÍ / cuándo NO?

> **Módulo 4 · Proyecto E2E y criterio**

> **Analogía QA:** ningún tester senior automatiza *todo* igual. Decides caso por caso: un smoke crítico se cuida distinto que un test exploratorio desechable. El Fluent Interface es una **herramienta más** en tu caja, no un dogma. Esta lección es la conversación honesta que tendrías con tu equipo antes de adoptarlo: dónde brilla, dónde estorba, y el riesgo que nadie te cuenta en los blogs que lo venden como "código elegante".

---

## ¿Qué aprendes?

- Que el Fluent Interface encadenable es un patrón **avanzado y poco idiomático** en Playwright (lo normal es un `await` por acción).
- El **riesgo silencioso** número uno: olvidar el `await` y que el test **pase en verde sin ejecutar nada**.
- **Cuándo SÍ aporta**: E2E largos, legibilidad como user story, una API expresiva por pantalla.
- **Cuándo NO conviene**: equipos junior, debugging paso a paso, suites donde el verde-falso te puede costar caro.
- A tomar la decisión con **trade-offs equilibrados**, sin vender humo ni satanizar el patrón.

---

## Primero, el riesgo que nadie te cuenta: el verde-falso

Antes que cualquier ventaja, mira lo que puede salir mal. El Page es *thenable*: las acciones **encolan** y el `await` final **drena** la cola. ¿Qué pasa si olvidas ese `await`?

El demo más limpio no necesita navegar a ninguna pantalla profunda: basta la pantalla de login y una assertion que **debería fallar** (en una carga limpia NO hay error de login). Comparemos las dos versiones, idénticas salvo por un `await`:

```ts
import { test } from "@playwright/test";
import { LoginPage } from "../pages";

test("verde-falso — SIN await (BUG silencioso)", async ({ page }) => {
  // ❌ Falta el `await`. Esto NO drena la cola: solo la construye.
  // `expectLoginError()` queda ENCOLADA y nunca corre.
  // En una carga limpia NO hay error de login, así que SI corriera, fallaría.
  // Pero como no se drena... el test pasa ✅ VERDE. Verde por no hacer NADA.
  new LoginPage(page).goto().expectLoginError();
});
```

```ts
import { test } from "@playwright/test";
import { LoginPage } from "../pages";

test("rojo-honesto — CON await (correcto)", async ({ page }) => {
  // ✅ El `await` drena la cola: navega y EJECUTA la assertion.
  // No hay error de login en una carga limpia → la assertion falla en ROJO.
  // Ese rojo es la prueba de que la verificación SÍ se ejecutó.
  await new LoginPage(page).goto().expectLoginError();
});
```

La diferencia entre un test que protege tu producto y uno que solo *parece* protegerlo es **una palabra**: `await`. Las dos versiones tienen la **misma** assertion, que en una carga limpia debería fallar. La versión correcta **falla en rojo** (la verificación corrió y no pasó); la versión sin `await` **pasa en verde** (la verificación nunca corrió). En un `await page.click()` clásico, olvidar el `await` te da, en el peor caso, una condición de carrera ruidosa. Aquí el fallo es **mudo**: la suite se pinta de verde y nadie se entera de que las assertions nunca corrieron. Por eso la regla de oro de todo este curso es una sola:

> 🔷 **Regla de oro — SIEMPRE `await` la cadena**
> Cada cadena fluida termina con un `await`. No es un consejo estético: es lo único que distingue "ejecuté el flujo y verifiqué" de "construí una cola que tiré a la basura". Si ves una línea que empieza con un Page Object y NO empieza con `await`, es un bug hasta que demuestres lo contrario.

---

## Una aclaración que evita confusiones: cuál "fluent" es éste

Cuando alguien dice "fluent en Playwright", casi siempre habla del **encadenamiento nativo de locators**:

```ts
// Esto es chaining NATIVO de Playwright — NO es el patrón de este curso.
await page
  .locator('[data-testid^="pizza-card-"]')
  .filter({ hasText: "Pepperoni" })
  .getByRole("button")
  .click();
```

Eso es Playwright resolviendo un locator dentro de otro: cada `.locator`/`.filter`/`.getBy...` **acota** el anterior. El "Fluent Interface" de **este** curso es otra cosa: un **POM custom** donde tú escribes el `return this`, mantienes una **cola thenable** y haces el Page *awaitable* con `then()`. No los confundas al evaluar el patrón: el chaining de locators es idiomático y barato; el POM encadenable es el que estamos pesando aquí.

---

## Cuándo SÍ aporta

```ts
// @file fluent-interface-course/tests/fluent-ejemplo.spec.ts
// Un E2E largo se lee como el caso de prueba manual que escribirías:
await loginPage
  .goto()
  .withUsername(standardUser.username)
  .withPassword(standardUser.password)
  .andMarket("MX")
  .login();
```

- **E2E largos con muchos pasos.** Cuando un flujo tiene 8-12 acciones, la cadena las agrupa en una sola expresión legible. Un muro de `await ...; await ...; await ...;` esconde la *historia* del test; la cadena la cuenta.
- **Legibilidad como user story.** `loginPage.goto().withUsername(u).withPassword(p).andMarket("MX").login()` se lee como el caso manual. El builder expresivo (`withUsername`, `andMarket`, `login`) convierte el test en una frase, justo lo que un stakeholder no técnico podría revisar.
- **Una API expresiva y consistente por pantalla.** Si tu equipo ya domina el POM y quiere una capa de DSL (lenguaje específico de dominio) sobre las pantallas, el fluido da esa fachada limpia sin librerías extra.
- **Transiciones modeladas.** Cuando la transición *sí* está en el POM (como login→catálogo con `loginInMarket` devolviendo el `CatalogPage`), el flujo cruza pantallas sin que el spec toque locators.

---

## Cuándo NO conviene

- **Equipos junior o mixtos.** El patrón añade conceptos que no son obvios: una cola interna, un Page que es *thenable*, un `return this` en cada acción, y la regla "no `await`es la transición". Cada uno es una pregunta nueva en code review. Un `await` por acción no necesita explicación: **se entiende solo**.
- **Debugging paso a paso.** Cuando un test falla, una cadena de 10 acciones te da **un solo** stack trace en el punto donde se drenó la cola, no en la acción que realmente falló. Con `await` por línea, el error apunta a la línea exacta. Poner un breakpoint "entre el `fill` y el `click`" es trivial con awaits sueltos y enrevesado dentro de una cadena.
- **El verde-falso pesa demasiado.** En una suite de regresión crítica (pagos, checkout, compliance), un test que pasa por olvidar un `await` es un riesgo inaceptable. El estilo `await` por acción no tiene esa trampa: olvidar el `await` ahí suele romper *ruidosamente* o lo cazan los linters de `no-floating-promises`.
- **Costuras sin modelar.** Lo viste en el reto: la transición catálogo→checkout **no** tiene método fluido, y terminaste con una nav inline. El patrón solo es "fluido" donde el POM lo modeló; en cada hueco se nota la costura y el código mezcla dos estilos.
- **Onboarding y rotación.** Si entra gente nueva seguido, cada quien tiene que aprender tu cola thenable antes de tocar un test. Un POM estándar con `await` por acción es lo que cualquier persona con Playwright ya sabe leer.

---

## La tabla honesta

| Dimensión | Fluent encadenable (este curso) | `await` por acción (idiomático) |
| --- | --- | --- |
| Legibilidad en E2E largos | **Alta** (se lee como user story) | Media (muro de `await`) |
| Curva de aprendizaje | Alta (cola, thenable, `return this`) | **Baja** (estándar Playwright) |
| Debugging paso a paso | Difícil (un stack al drenar) | **Fácil** (error en la línea exacta) |
| Riesgo de verde-falso | **Alto** (olvidar el `await` no rompe) | Bajo (suele romper ruidoso) |
| Idiomático en Playwright | No | **Sí** |
| Reutilización / DRY | Alta (igual que cualquier POM) | Alta (igual que cualquier POM) |

Fíjate en lo que la tabla **no** dice: el fluido no es "mejor POM". El DRY, la encapsulación y los locators privados —el corazón del POM— los tienes en **ambos** estilos. Lo único que el fluido cambia es la **superficie de escritura** del test: más expresiva, a cambio de más conceptos y un riesgo nuevo.

---

## Pruébalo tú mismo

Comprueba el verde-falso con tus propios ojos: pega las **dos** versiones de arriba en un spec temporal (por ejemplo `tests/verde-falso.spec.ts`) y córrelo. La versión **sin `await`** pasa en verde con una assertion que jamás se ejecutó; la versión **con `await`** ejecuta esa misma assertion y **falla** en una carga limpia.

```bash
$ npx playwright test tests/verde-falso.spec.ts
# verde-falso — SIN await  → pasa ✅ (la assertion nunca corrió)
# rojo-honesto — CON await  → FALLA ❌ (la assertion SÍ corrió)
```

---

## Qué observar

- El test **sin `await`** pasa en **verde** aunque su assertion (`expectLoginError`) debería fallar: nunca llegó a ejecutarse. La cola se construyó y se descartó al terminar el test. Verde por no verificar nada.
- El test **con `await`** ejecuta esa **misma** assertion y **falla en rojo** (en una carga limpia no hay error de login). Ese rojo es la prueba de que la verificación corrió — exactamente la red de seguridad que el verde-falso te quitaba.
- La moraleja no es "el rojo es bueno": es que **la misma assertion** da verde o rojo según si la cola se drenó. El `await` es lo único que decide si tu test verifica o solo finge.
- El veredicto de ingeniería: el Fluent Interface es **una opción**, no un upgrade obligatorio. Aporta en E2E largos donde la legibilidad manda y el equipo ya es senior; estorba cuando priorizas debugging simple, onboarding rápido o cero tolerancia al verde-falso.
- Si lo adoptas, blíndalo: una regla de lint `no-floating-promises` convierte el verde-falso en error de compilación y le quita su mayor riesgo.

---

⬅️ Anterior: [Reto M4](/docs/fluent-interface/m4-reto-e2e) · ➡️ Siguiente: [Síntesis global](/docs/fluent-interface/sintesis-global)
