# 3.1 — El builder fluido que se lee como una user story

> **Módulo 3 · Patrones de POM fluido**

> **Analogía QA:** un buen caso de prueba manual no se escribe en jerga técnica, se escribe como una **historia de usuario**: "ingreso mi usuario, ingreso mi contraseña, elijo el mercado MX y presiono Entrar". El builder fluido hace que tu spec se lea **igual** que ese guion manual — paso a paso, en orden, en lenguaje de negocio — sin perder ni una pizca de la potencia del código.

---

## ¿Qué aprendes?

- Qué es un **builder fluido**: una cadena de pasos `withX().withY().andZ().do()` que se lee como prosa.
- Cómo esos métodos (`withUsername`, `withPassword`, `andMarket`, `login`) son **nombres semánticos** sobre acciones base que ya tenías.
- Que cada paso **encola** su trabajo y **devuelve `this`** — por eso puedes seguir escribiendo `.` sin un `await` intermedio.
- Cómo el `await` final dispara toda la cadena de una sola vez, en orden.

---

## La idea central: nombres que cuentan una historia

En el POM básico ya tenías acciones como `selectMarket(code)` y el helper `typeInput(testid, texto)`. Funcionan, pero un test que los usa se lee como **instrucciones técnicas**: "escribe en el input username, escribe en el input password, haz click en el botón de mercado". El builder fluido pone una capa de **nombres de negocio** encima de esos primitivos. Mira `LoginPage`: cada paso del builder hace UNA cosa, le da un nombre que se lee como frase, y reutiliza un primitivo que ya existía.

```ts
// @file fluent-interface-course/pages/LoginPage.ts
// --- Fluent builder expresivo ---
// Cada paso hace UNA cosa, devuelve `this` y se lee como una frase.
// Reutiliza los primitivos de arriba (typeInput / selectMarket):
//   await loginPage.goto()
//     .withUsername(user.username)
//     .withPassword(user.password)
//     .andMarket(code)
//     .login();

withUsername(username: string): this {
  return this.typeInput(this.txtUsername, username);
}

withPassword(password: string): this {
  return this.typeInput(this.txtPassword, password);
}

andMarket(code: CountryCode): this {
  return this.selectMarket(code);
}

login(): this {
  return this.step(() => this.tid(this.btnSignIn).click());
}
```

Fíjate: `withUsername` **no** reimplementa el clear+fill — delega en `typeInput`. `andMarket` **no** vuelve a buscar la bandera del mercado — delega en `selectMarket`. El builder no añade lógica nueva: añade **vocabulario**. Es una fachada que se lee bien.

> 🔷 **Por qué "with…" y "and…" (no "setUsername / setPassword")**
> Los nombres con preposición — `withUsername`, `andMarket` — están elegidos para que la cadena suene a frase en inglés: *with username, with password, and market, login*. Es la misma razón por la que un `it("should…")` se lee como oración. El objetivo del builder fluido no es solo encadenar: es que el **diff de un PR** se lea como un caso de prueba que cualquiera (incluido un QA manual) entiende a la primera.

---

## Cada paso devuelve `this`: por eso encadenas

La clave técnica que hace posible la cadena es que **cada método devuelve `this`** (la misma instancia de `LoginPage`). Devolver `this` es lo que te permite poner otro `.` y seguir llamando métodos sobre el mismo objeto. Y debajo de `this`, cada paso **encola** su trabajo en una cola interna en vez de ejecutarlo en el acto. Esa mecánica vive en `BasePage`:

```ts
// @file fluent-interface-course/pages/BasePage.ts
/** Encola una acción async y devuelve `this` para encadenar. */
protected step(action: () => Promise<unknown>): this {
  this.chain = this.chain.then(() => action());
  return this;
}

/**
 * DRY (Don't Repeat Yourself): clear + fill en un solo lugar. Encola la
 * escritura y devuelve `this` para encadenar.
 */
protected typeInput(base: string, text: string): this {
  return this.step(async () => {
    await this.tid(base).clear();
    await this.tid(base).fill(text);
  });
}
```

Cuando llamas `loginPage.withUsername("standard_user")`, no se escribe nada **todavía**: `step()` mete la acción en la cola `chain` y te devuelve `this`. Por eso puedes seguir con `.withPassword(...)` inmediatamente, sin `await` en medio. La escritura real sucede cuando haces `await` de la cadena completa — ese drenado de la cola es el tema de la lección 2.2 que ya viste.

> 🔷 **Builder fluido vs. encadenamiento nativo de Playwright — no los confundas**
> El "fluent" de este curso es **tu POM**: tus métodos devuelven `this` y encolan. Es distinto del *locator chaining* nativo de Playwright (`page.locator(".x").getByRole("button").first()`), que encadena **localización**, no acciones de negocio encoladas. Aquí construyes el azúcar tú mismo, sobre tu Page Object.

---

## El builder en un test real

Así se usa en el spec de ejemplo. Una sola expresión, leída de arriba a abajo como el guion de un caso manual, cerrada con un único `await`:

```ts
// @file fluent-interface-course/tests/fluent-ejemplo.spec.ts
const loginPage = new LoginPage(page);
const catalogPage = new CatalogPage(page);

// Fluent builder: cada paso hace UNA cosa y se lee como una frase.
// Las acciones ENCOLAN su trabajo; el `await` ejecuta toda la cadena en orden.
await loginPage
  .goto()
  .withUsername(standardUser.username)
  .withPassword(standardUser.password)
  .andMarket("MX")
  .login();
```

Compara mentalmente con el estilo "un `await` por acción": ahí tendrías cinco `await` sueltos y cinco líneas que empiezan con `await loginPage.`. Aquí hay **un** `await` y la cadena se lee como una sola idea: "ve a la página, con este usuario, con esta contraseña, y el mercado MX, entra".

---

## Cómo correrlo

```bash
$ pnpm test tests/fluent-ejemplo.spec.ts
```

---

## Qué observar

- El builder fluido es **vocabulario**, no lógica nueva: `withUsername` delega en `typeInput`, `andMarket` delega en `selectMarket`.
- Cada paso **devuelve `this`** — esa es la condición técnica que permite seguir con otro `.`.
- Cada paso **encola** vía `step()`; nada se ejecuta hasta el `await` final que drena la cola.
- La cadena se lee como **user story**: un solo `await` envuelve toda la historia, en orden.
- Esto es POM fluido custom, **no** el locator chaining nativo de Playwright.

---

➡️ Siguiente: [3.2 DRY + 2 formas de locator](/docs/fluent-interface/m3-dry-y-2-formas)
