# 1.2 — `return this`: la idea base

> **Módulo 1 · Fundamentos del encadenamiento**

> **Analogía QA:** cuando ejecutas un caso manual y al terminar un paso sigues **en la misma pantalla**, el siguiente paso lo haces ahí mismo, sin volver a abrir nada. `return this` es eso en código: un método termina su acción y te **devuelve el mismo Page** para que sigas operando sobre él. Es lo que convierte tres llamadas sueltas en una sola frase encadenada.

---

## ¿Qué aprendes?

- Qué es `this` dentro de un método de clase: una referencia al **objeto sobre el que se llamó** el método.
- Por qué `return this` al final de una acción permite **encadenar** la siguiente sobre el mismo Page.
- Cómo se ve en métodos reales de `LoginPage` (`goto`, `selectMarket`) y por qué cambia el tipo de retorno de `Promise<void>` a `this`.
- Que esto es solo la **superficie**: el `this` que retornas no ejecuta la acción todavía, solo la encola — el detalle llega en el Módulo 2.

---

## Qué es `this`

Dentro de un método de clase, `this` apunta al **objeto concreto** sobre el que invocaste el método. Si escribes `loginPage.selectMarket("MX")`, durante esa llamada `this` **es** `loginPage`. No es un concepto nuevo del curso: es el `this` de toda la vida de las clases de TypeScript. Lo nuevo es lo que hacemos con él.

La idea base del fluent interface cabe en una frase:

> **Si un método termina con `return this`, devuelve el mismo objeto, así que puedes seguir llamando métodos sobre él en la misma expresión.**

Eso es todo. No hay magia adicional en esta clase. Un método que no retorna nada útil (`Promise<void>`) corta la cadena: tienes que volver a nombrar la variable. Un método que retorna `this` te deja seguir.

---

## El cambio mínimo: de `Promise<void>` a `this`

En un POM clásico, `goto` y `selectMarket` devolverían `Promise<void>` — "hago la acción y no te entrego nada". En este curso devuelven `this`:

```ts
// @file fluent-interface-course/pages/LoginPage.ts
goto(): this {
  return this.step(() => this.page.goto(this.path));
}

selectMarket(code: CountryCode): this {
  return this.step(() => this.marketFlag(code).click());
}
```

Fíjate en el tipo de retorno: **`this`**, no `Promise<void>` ni `void`. Esa firma es la que le dice a TypeScript (y a ti) "después de esta acción puedes seguir encadenando". El `this.step(...)` que ves dentro es el motor que encola el trabajo y **devuelve `this`** por ti; lo desarmamos en el Módulo 2. Por ahora basta con leer la firma: **devuelve `this` → encadenable**.

> 🔷 **Retornar `this` ≠ ejecutar la acción**
> Aquí hay una trampa sutil que el Módulo 2 resuelve del todo: cuando `goto()` retorna `this`, la navegación **todavía no ocurrió**. El método solo **encoló** la acción y te devolvió el Page para seguir. El trabajo real se dispara cuando haces `await` de la cadena completa. Por eso la regla de oro de este patrón es: **siempre `await` la cadena**. Si no la esperas, encolaste acciones que nunca se ejecutan.

---

## Por qué eso habilita el encadenamiento

Como `goto()` devuelve `this` (el mismo `loginPage`), la expresión `loginPage.goto()` *vale* `loginPage`. Y sobre `loginPage` puedes volver a llamar `selectMarket(...)`, que **también** devuelve `this`. Encadenas tantos pasos como quieras:

```ts
// Cada método devuelve `this`, así que la siguiente acción se pega a la anterior.
const loginPage = new LoginPage(page);

await loginPage
  .goto()                 // devuelve this  → puedo seguir
  .selectMarket("MX")     // devuelve this  → puedo seguir
  .loginAs(standardUser); // devuelve this  → cierro con await
```

Compara mentalmente con la versión sin `return this`: tendrías que escribir `await loginPage.goto();` y luego `await loginPage.selectMarket("MX");` y luego `await loginPage.loginAs(standardUser);` — repitiendo `await loginPage.` tres veces. El `return this` es lo que elimina esa repetición.

Y observa `loginAs`: por dentro también encadena, reutilizando los primitivos de la propia clase. Es la misma idea aplicada *dentro* del Page:

```ts
// @file fluent-interface-course/pages/LoginPage.ts
// Forma A — escribe vía el helper DRY `typeInput()` y encadena con `.step(...)`.
loginAs(user: User): this {
  return this
    .typeInput(this.txtUsername, user.username)
    .typeInput(this.txtPassword, user.password)
    .step(() => this.tid(this.btnSignIn).click());
}
```

`typeInput(...)` devuelve `this`, así que puedes pegarle otro `typeInput(...)` y cerrar con `.step(...)`. La cadena no es solo para el test: es **el estilo interno** con que se arman las acciones de alto nivel.

---

## Cómo correrlo

El fragmento de arriba es **ilustrativo**. Para ver el encadenamiento real ejecutándose, corre el ejemplo resuelto del curso:

```bash
$ pnpm test tests/fluent-ejemplo.spec.ts
```

---

## Qué observar

- `this` dentro de un método **es** el objeto sobre el que llamaste el método (`loginPage`).
- Cambiar el tipo de retorno de `Promise<void>` a **`this`** es lo que vuelve una acción **encadenable**.
- `goto()`, `selectMarket()` y `loginAs()` devuelven `this` — por eso se pegan una tras otra en una sola expresión.
- Retornar `this` **no ejecuta** la acción todavía: solo la encola. El trabajo se dispara con el `await` final (detalle del Módulo 2).
- El encadenamiento se usa también **dentro** de los métodos (`loginAs` encadena dos `typeInput` + un `step`), no solo en el test.

⬅️ Anterior: [1.1 El dolor de repetir](/docs/fluent-interface/m1-el-dolor-de-repetir) · ➡️ Siguiente: [Reto M1](/docs/fluent-interface/m1-reto)
