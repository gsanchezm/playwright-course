# 2.2 — `then()`: el Page awaitable

> **Módulo 2 · El motor: cola thenable**

> **Analogía QA:** apuntaste la fila de tareas en el pizarrón (2.1), pero nadie la ha leído todavía. El `await` es el tester que por fin **lee el pizarrón de arriba a abajo y ejecuta cada paso en orden**. Para que JavaScript sepa "este Page es algo que se puede esperar", el Page implementa `then()` — el método mágico que convierte cualquier objeto en *awaitable*.

---

## ¿Qué aprendes?

- Qué significa que un objeto sea **thenable** (awaitable): que implementa un método `then`.
- Cómo el `await` sobre el Page invoca `then()`, que **drena la cola en orden**.
- El punto crítico: `then()` debe resolver a **`undefined`**, **nunca** a `this` — o el `await` se cuelga **para siempre**.
- Por qué `.then<void>(() => undefined)` rompe esa recursión peligrosa.

---

## Qué es un "thenable"

En JavaScript, `await x` no exige que `x` sea una `Promise`. Basta con que `x` tenga un método `then(onfulfilled, onrejected)`: a eso se le llama un **thenable**. Cuando haces `await page`, el motor busca `page.then(...)` y, si existe, lo usa para resolver el `await`.

Aprovechamos exactamente esa regla: si el Page implementa `then()`, entonces `await loginPage.goto().selectMarket("MX")` es código legal — y `then()` será **quien dispare la cola**.

---

## El `then()` real

```ts
// @file fluent-interface-course/pages/BasePage.ts
/**
 * Hace al Page "awaitable" (thenable): al `await`, drena la cola en orden.
 * Resuelve a `undefined`, NUNCA a `this`: resolver con un thenable haría
 * que el `await` se readopte a sí mismo y se cuelgue para siempre.
 */
then<TResult1 = void, TResult2 = never>(
  onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
  onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
): Promise<TResult1 | TResult2> {
  return this.chain.then<void>(() => undefined).then(onfulfilled, onrejected);
}
```

La firma es verbosa por compatibilidad con la interfaz `PromiseLike` de TypeScript, pero el cuerpo es **una sola línea** que hace todo el trabajo. Vamos a desarmarla.

---

## Cómo drena la cola: `this.chain.then(...)`

El cuerpo es `this.chain.then<void>(() => undefined).then(onfulfilled, onrejected)`. Léelo en dos tramos:

1. **`this.chain.then<void>(() => undefined)`** — espera a que **toda** la fila de tareas que encolaste con `step()` (2.1) se complete en orden, y luego, en lugar de devolver lo que sea que la cola haya producido, **descarta ese valor y resuelve a `undefined`**. Este tramo es el que "lee el pizarrón de arriba a abajo".
2. **`.then(onfulfilled, onrejected)`** — entrega ese `undefined` a quien hizo el `await`. Si la cola falló (un click no encontró su elemento, una assertion reventó), el rechazo viaja por `onrejected` y tu test ve el error real.

Así, cuando escribes:

```ts
// @file fluent-interface-course/tests/fluent-ejemplo.spec.ts
// El await dispara la cola: navega, elige mercado, llena y hace clic — EN ORDEN.
await loginPage
  .goto()
  .withUsername(standardUser.username)
  .withPassword(standardUser.password)
  .andMarket("MX")
  .login();
```

las cinco acciones se encolaron al construir la frase (cada una devolvió `this`), y el `await` final invoca `then()`, que **las ejecuta en secuencia**. Sin ese `await`, la cola queda apuntada pero nunca se lee.

> 🔷 **Regla de oro de este patrón**
> **SIEMPRE haz `await` de la cadena.** Una cadena sin `await` es un pizarrón lleno de tareas que nadie ejecuta: tu test "pasa" sin haber tocado la app. Es el bug más sutil de este estilo — por eso es un patrón avanzado y poco idiomático frente al `await` por acción.

---

## El punto crítico: por qué `undefined` y NUNCA `this`

Aquí está la sutileza que define si el motor funciona o se cuelga. Mira de nuevo el comentario del código:

> *Resuelve a `undefined`, NUNCA a `this`: resolver con un thenable haría que el `await` se readopte a sí mismo y se cuelgue para siempre.*

El mecanismo es éste. Cuando un `await` (o un `then`) resuelve con un valor que **también es thenable**, JavaScript no lo entrega tal cual: lo **asimila recursivamente**, es decir, vuelve a esperar *su* `then`. Esa es la regla normal y útil con promesas anidadas.

Pero nuestro Page **es** un thenable (justo acabamos de darle un `then`). Imagina que `then()` resolviera a `this`:

- `await loginPage` invoca `loginPage.then(...)`.
- Si ese `then` resolviera a `this` (= `loginPage`), JavaScript vería "ah, el resultado es otro thenable" y volvería a esperar `loginPage.then(...)`.
- Que de nuevo resolvería a `loginPage`... que se volvería a esperar... **para siempre**.

Es una **auto-adopción infinita**: el `await` se queda esperando que el Page se resuelva a sí mismo, y nunca termina. Tu test se cuelga hasta el timeout, sin un error claro.

La defensa es la pieza `.then<void>(() => undefined)`: **corta la recursión** forzando que el valor resuelto sea `undefined` (que no es thenable), no el Page. Por eso esa línea no es decorativa — es lo que mantiene vivo el motor.

> 🔷 **Por eso `then()` no devuelve `this`**
> Es la diferencia clave con `step()`: **`step()` devuelve `this`** (para encadenar **antes** de ejecutar), mientras que **`then()` resuelve a `undefined`** (para ejecutar **sin** auto-adoptarse). Encadenar y resolver son fases distintas, y cada una usa el valor de retorno opuesto a propósito.

---

## Cómo correrlo

```bash
$ pnpm test tests/fluent-ejemplo.spec.ts
```

---

## Qué observar

- Un objeto es **awaitable** si tiene un método `then` — el Page lo implementa, y por eso `await loginPage.goto()...` es legal.
- `then()` **drena la cola** (`this.chain`) en orden y luego entrega el resultado a quien hizo el `await`.
- `then()` resuelve a **`undefined`**, no a `this`: si resolviera a un thenable (el propio Page), el `await` se **auto-adoptaría** y se colgaría hasta el timeout.
- La pieza `.then<void>(() => undefined)` es la que **rompe la recursión**. No es opcional.
- **Regla de oro:** sin `await`, la cadena se encola pero **nunca se ejecuta**.

⬅️ Anterior: [2.1 La cola y step()](/docs/fluent-interface/m2-la-cola-y-step) · ➡️ Siguiente: [2.3 query(): operaciones terminales](/docs/fluent-interface/m2-query-terminal)
