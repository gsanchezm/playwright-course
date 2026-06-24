# 1.1 — El dolor: un `await` por acción

> **Módulo 1 · Fundamentos del encadenamiento**

> **Analogía QA:** piensa en un caso manual escrito como receta paso a paso: "abre la página", "espera", "haz clic en México", "espera", "escribe el usuario", "espera"… Cada línea es un acto separado y entre líneas hay una pausa. Funciona, pero leerlo cansa. El test E2E con un `await` por acción es exactamente esa receta: correcta, pero ruidosa. En este módulo aprendes a escribirla como una sola **frase fluida**.

---

## ¿Qué aprendes?

- Por qué un Page Object Model "normal" termina con **un `await` por cada acción** y cómo se siente esa repetición.
- Qué gana la legibilidad cuando el mismo flujo se escribe como una **cadena fluida**: `goto().withUsername(...).withPassword(...).login()`.
- A **distinguir** este "fluent interface" (tu POM custom que devuelve `this`) del *locator chaining* nativo de Playwright — no son lo mismo.
- Que aquí solo **sientes** el contraste; el *cómo* funciona la cadena (la cola interna y el `await`) lo desarmas en el Módulo 2.

---

## El "antes": un `await` por cada acción

Ya sabes POM básico: cada acción del Page (login, seleccionar mercado, escribir) es un método `async` que devuelve `Promise<void>`. El test los llama uno por uno, y cada llamada necesita su propio `await`:

```ts
// Estilo POM "clásico": un await por acción. Correcto, pero verboso.
const loginPage = new LoginPage(page);

await loginPage.goto();
await loginPage.selectMarket("MX");
await loginPage.loginAs(standardUser);
```

No hay nada *malo* aquí: es el estilo idiomático de Playwright y es el que usas a diario. Pero fíjate en el patrón: tres acciones, tres `await`, tres líneas. Cada vez que añades un paso (esperar el catálogo, validar el carrito) sumas otra línea con su `await` al frente. El flujo de negocio — "entra a la página, elige México, haz login" — queda **diluido** entre la repetición de la palabra `await`.

> 🔷 **No confundir con el *chaining* de Playwright**
> Playwright ya encadena **locators**: `page.getByRole("row").getByRole("cell").first()`. Eso es navegar el DOM. Lo de este curso es otra cosa: encadenar **acciones de tu Page Object** (`goto().selectMarket().loginAs()`). Una cadena describe *dónde* está un elemento; la otra describe *qué hace* tu flujo. Mantén la distinción clara desde el primer minuto.

---

## El "después": una sola frase fluida

Ahora el mismo flujo, pero con un POM que devuelve `this` en cada acción. Las acciones se **encadenan** y un único `await` cierra toda la expresión:

```ts
// Estilo fluido: las acciones se encadenan; UN solo await cierra la cadena.
const loginPage = new LoginPage(page);

await loginPage
  .goto()
  .withUsername(standardUser.username)
  .withPassword(standardUser.password)
  .andMarket("MX")
  .login();
```

Léelo en voz alta: *"ve a la página, con el usuario X, con la contraseña Y, y el mercado MX, haz login"*. Se lee como una **user story**, no como una lista de instrucciones técnicas. El `await` aparece **una sola vez**, al principio, y abarca toda la cadena. La intención del test salta a la vista; el ruido del `await` repetido desaparece.

Este builder es código real de OmniPizza. Cada paso (`withUsername`, `andMarket`, `login`) es un método del `LoginPage` que hace **una** cosa y devuelve `this` para que puedas seguir encadenando:

```ts
// @file fluent-interface-course/pages/LoginPage.ts
// Cada paso hace UNA cosa, devuelve `this` y se lee como una frase.
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

No te preocupes todavía por `this.typeInput`, `this.step` o por qué un `await` al final ejecuta toda la cadena. Eso es la maquinaria del **Módulo 2**. Por ahora quédate con la idea de superficie: **cada método retorna `this`, y por eso puedes seguir llamando métodos sobre el mismo objeto**.

---

## El contraste de un vistazo

| | `await` por acción (clásico) | Cadena fluida (este curso) |
| --- | --- | --- |
| Líneas por flujo | Una por acción + su `await` | Una expresión, un `await` |
| Cómo se lee | Lista de instrucciones técnicas | Frase / user story |
| `await` visible | Uno por cada paso | Uno, al cerrar la cadena |
| Cada acción devuelve | `Promise<void>` | `this` (el mismo Page) |

Las dos versiones hacen **exactamente lo mismo** y terminan en `/catalog`. La diferencia no es de comportamiento: es de **legibilidad**. Y esa legibilidad la habilita un detalle minúsculo que verás en la próxima clase: que cada método retorne `this`.

---

## Cómo correrlo

Los dos bloques de arriba son **ilustrativos** (el contraste *antes/después*). El estilo fluido **en acción** vive en el ejemplo resuelto del curso:

```bash
$ pnpm test tests/fluent-ejemplo.spec.ts
```

---

## Qué observar

- El estilo clásico (un `await` por acción) **no está mal**: es lo idiomático. El fluido es una capa *opcional* encima del POM, no un reemplazo.
- En la versión fluida, el `await` aparece **una sola vez** y cubre toda la cadena de acciones.
- La cadena se lee como una **frase de negocio**; el flujo deja de estar diluido entre `await`s.
- El "fluent interface" de este curso encadena **acciones de tu Page**, no **locators** de Playwright. Son cosas distintas.
- Aún no sabes *cómo* un solo `await` ejecuta varias acciones en orden — eso es el Módulo 2. Aquí solo sentiste el problema y viste el contraste.

➡️ Siguiente: [1.2 return this: la idea base](/docs/fluent-interface/m1-return-this)
