# 3.2 — DRY con `typeInput` y las 2 formas de un locator

> **Módulo 3 · Patrones de POM fluido**

> **Analogía QA:** cuando documentas pruebas manuales, no reescribes "abre el campo, bórralo, escribe el valor" en cada paso — lo defines **una vez** como "captura el campo X" y lo reutilizas. Y para señalar dónde está ese campo, unas personas escriben el `data-testid` en una tabla y otras hacen una captura con flechas: **dos estilos, el mismo campo**. Esta lección es exactamente eso, llevado al código.

---

## ¿Qué aprendes?

- Qué es **DRY** aplicado al POM: `typeInput` reúne `clear() + fill()` en un solo lugar, encola y devuelve `this`.
- Las **2 formas** de declarar y usar un locator: testid en string (Forma A) vs. getter `Locator` (Forma B).
- Que ambas formas producen **el mismo resultado**; son estilos, no recetas distintas.
- Por qué en un proyecto real debes **elegir UNA** por consistencia.

---

## DRY: el helper `typeInput` escribe en un solo lugar

Escribir en un input siempre es lo mismo: limpia lo que haya y rellena con el valor nuevo (`clear()` + `fill()`). Repetir ese par en cada método que toca un input es duplicación pura. `typeInput` lo encapsula una vez en `BasePage`, lo **encola** y devuelve `this` para que siga siendo encadenable:

```ts
// @file fluent-interface-course/pages/BasePage.ts
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

Es `protected`: lo ven las clases hijas (`LoginPage`, `CheckoutPage`), no los tests. Si mañana OmniPizza exige un `blur()` después de cada `fill()`, lo añades **aquí, una vez**, y todos los inputs del framework lo heredan. Ese es el pago de DRY: un solo punto de cambio.

---

## Forma A: el locator como testid en string

En la **Forma A** el locator vive como un `string` con el testid base, y se usa pasándolo a `typeInput` o a `tid()`. Es la "única fuente de verdad" del nombre del elemento. Mira `LoginPage` y `CheckoutPage`:

```ts
// @file fluent-interface-course/pages/LoginPage.ts
// --- Forma A: locators como testid en string (single source of truth) ---
private readonly txtUsername = "username";
private readonly txtPassword = "password";
private readonly btnSignIn = "login-button";

// Forma A — escribe vía el helper DRY `typeInput()` (testid string).
loginAs(user: User): this {
  return this
    .typeInput(this.txtUsername, user.username)
    .typeInput(this.txtPassword, user.password)
    .step(() => this.tid(this.btnSignIn).click());
}
```

```ts
// @file fluent-interface-course/pages/CheckoutPage.ts
// Forma A — rellena el form vía el helper DRY `typeInput()`.
fillWithMarket(market: Market): this {
  return this
    .typeInput(this.txtFullName, market.fullName)
    .typeInput(this.txtPhone, market.phone)
    .typeInput(this.txtAddress, market.address)
    .typeInput(this.txtZip, market.zipCode);
}
```

La Forma A se lee muy declarativa: una lista de "escribe esto en este campo", encadenada. El testid es un dato (`"username"`), y `typeInput`/`tid` lo convierten en acción.

---

## Forma B: el locator como getter `Locator`

En la **Forma B** el mismo elemento se expone como un **getter que devuelve un `Locator`** ya construido. Aquí no pasas un string a un helper: tienes el `Locator` en mano y llamas sus métodos (`clear`, `fill`, `click`) directamente, dentro de un solo `step()`.

```ts
// @file fluent-interface-course/pages/LoginPage.ts
// --- Forma B: los mismos locators como getters `Locator` (privados) ---
private get usernameInput(): Locator {
  return this.tid(this.txtUsername);
}

private get passwordInput(): Locator {
  return this.tid(this.txtPassword);
}

private get signInButton(): Locator {
  return this.tid(this.btnSignIn);
}

// Forma B — la MISMA acción usando los getters `Locator`. Demuestra que
// ambas formas conviven; en un proyecto real elige UNA por consistencia.
loginAsUser(user: User): this {
  return this.step(async () => {
    await this.usernameInput.clear();
    await this.usernameInput.fill(user.username);
    await this.passwordInput.clear();
    await this.passwordInput.fill(user.password);
    await this.signInButton.click();
  });
}
```

Y su gemelo en `CheckoutPage`, para verlo también en un formulario:

```ts
// @file fluent-interface-course/pages/CheckoutPage.ts
// Forma B — el MISMO llenado usando los getters `Locator`.
fillWithMarketByGetters(market: Market): this {
  return this.step(async () => {
    await this.fullNameInput.clear();
    await this.fullNameInput.fill(market.fullName);
    await this.phoneInput.clear();
    await this.phoneInput.fill(market.phone);
    await this.addressInput.clear();
    await this.addressInput.fill(market.address);
    await this.zipInput.clear();
    await this.zipInput.fill(market.zipCode);
  });
}
```

Fíjate en un detalle: la Forma B **no** reaprovecha `typeInput` (no hay `clear()+fill()` reutilizado), por eso ves el par repetido por cada campo. A cambio, trabajas con el objeto `Locator` directamente, lo que se siente más "orientado a objetos" y te deja encadenar métodos del propio `Locator` si los necesitaras.

---

## Mismo resultado, dos estilos — elige UNO

`loginAs` (Forma A) y `loginAsUser` (Forma B) hacen **exactamente lo mismo**: rellenan usuario y contraseña y presionan Entrar. Igual `fillWithMarket` y `fillWithMarketByGetters`. Conviven en el código del curso **solo para mostrarte las dos rutas** una al lado de la otra.

| | Forma A — testid string | Forma B — getter `Locator` |
| --- | --- | --- |
| El locator es… | un `string` (`"username"`) | un `get` que devuelve `Locator` |
| Cómo escribes | `typeInput(this.txtUsername, v)` | `this.usernameInput.fill(v)` |
| Reúsa `typeInput` (DRY) | Sí | No (clear+fill manual) |
| Se lee como | lista declarativa de campos | secuencia imperativa de pasos |

> 🔷 **En tu proyecto real: una sola forma por consistencia**
> Tener las dos formas en producción confunde a quien lee el código: "¿por qué este Page usa strings y este otro usa getters?". El consejo es simple — **escoge una y aplícala en todo el POM**. La Forma A (testid string + `typeInput`) tiende a producir métodos más cortos y aprovecha el DRY; la Forma B luce más natural cuando necesitas encadenar métodos del propio `Locator`. Aquí ves las dos solo con fin didáctico.

---

## Cómo correrlo

```bash
$ pnpm test tests/fluent-ejemplo.spec.ts
```

---

## Qué observar

- **DRY:** `typeInput` reúne `clear()+fill()` en un solo lugar, encola y devuelve `this`; un solo punto de cambio.
- **Forma A:** el locator es un testid en `string`; se usa vía `typeInput`/`tid` — declarativo y reúsa el DRY.
- **Forma B:** el locator es un getter `Locator`; llamas sus métodos directo — más OO, sin reúso de `typeInput`.
- `loginAs` ≡ `loginAsUser` y `fillWithMarket` ≡ `fillWithMarketByGetters`: **mismo resultado**, distinto estilo.
- En producción: **elige UNA** forma para todo el POM; las dos juntas solo aquí, para comparar.

---

⬅️ Anterior: [3.1 El builder fluido](/docs/fluent-interface/m3-builder-fluido) · ➡️ Siguiente: [3.3 Transición de página con herencia de cola](/docs/fluent-interface/m3-transicion-de-pagina)
