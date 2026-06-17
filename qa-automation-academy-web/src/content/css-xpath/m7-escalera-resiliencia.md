# 7.4 — La escalera de resiliencia

> **Módulo 7 · CSS vs XPath y resiliencia**

> **Analogía QA:** elegir un selector es como elegir una referencia para una cita. El folio único (**testid**) nunca falla; "el botón que dice Sign In" (**rol + nombre**) es claro; "el párrafo con ese texto" (**texto**) ya depende de la copy; y "el 3er div" (**estructura / clase-hash**) es la peor — se rompe con cualquier refactor.

---

## ¿Qué aprendes?

- La **escalera de resiliencia**: testid › rol+nombre › texto › estructura/clase.
- A bajar un peldaño **solo** cuando el de arriba no aplica.
- La **excepción real**: inputs sin `<label>` rompen `getByRole`/`getByLabel` → caen a `getByPlaceholder`/testid.
- Que las clases hash `css-*` son exactamente **lo que no debes usar**.

---

## La escalera, de más a menos resiliente

| Peldaño | Hook | Ejemplo | Por qué |
| --- | --- | --- | --- |
| **1** | `testid` | `[data-testid="login-button-desktop"]` | Contrato explícito puesto para pruebas. |
| **2** | rol + nombre | `getByRole("button", { name: "Sign In" })` | Semántico; sobrevive a cambios de clase. |
| **3** | texto | `getByText("Please enter your details.")` | Depende de la copy (idioma/versión). |
| **4** | estructura / clase | `:nth-child(3)`, `.css-1a2b3c` | ❌ Evitar: se rompe con cualquier refactor. |

---

## Peldaño 1 — testid: el contrato más estable

El botón de login expone `data-testid="login-button-desktop"`. Es un hook puesto **a propósito** para pruebas: sobrevive a cambios de texto, clase y posición. Es el primer peldaño y el preferido cuando existe.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/04-escalera-resiliencia.ts
const porTestid = countCss('[data-testid="login-button-desktop"]');
check("testid del botón de login cuenta 1", porTestid, 1);
```

---

## Peldaño 2 — rol + nombre accesible (getByRole)

El **mismo** botón es un `<button>` con nombre accesible `"Sign In"`. En Playwright sería `getByRole("button", { name: "Sign In" })`. Offline lo aproximamos con XPath: un `<button>` cuyo texto normalizado es `"Sign In"`. Apunta al mismo nodo.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/04-escalera-resiliencia.ts
const porRol = countXpath("//button[normalize-space(.)='Sign In']");
check("botón con nombre accesible 'Sign In' cuenta 1", porRol, 1);
const nodoTestid = $$('[data-testid="login-button-desktop"]')[0];
const nodoRol = $x("//button[normalize-space(.)='Sign In']")[0] as Element;
check("testid y rol+nombre son el MISMO botón", nodoTestid === nodoRol, true);
```

---

## Peldaño 3 — texto (getByText)

Si no hay testid ni rol claro, localizas por texto visible. El subtítulo `"Please enter your details."` no tiene testid: `getByText` es su mejor hook. Más frágil (la copy cambia entre idiomas/versiones) pero válido.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/04-escalera-resiliencia.ts
const porTexto = countXpath("//p[normalize-space(.)='Please enter your details.']");
check("párrafo localizado por su texto cuenta 1", porTexto, 1);
```

---

## La excepción real: inputs sin `<label>` rompen el peldaño 2

El campo *Username* **no** tiene `<label for>` (su rótulo es un `<div class="field-label">`). Por eso `getByRole`/`getByLabel` **no** lo encuentran por nombre accesible → el peldaño 2 falla. La regla "baja un peldaño" te lleva a `getByPlaceholder` o al testid.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/04-escalera-resiliencia.ts
const labelsConFor = countCss("label[for]");
check("no existe ningún label[for] (rótulos son <div>)", labelsConFor, 0);
const porPlaceholder = countCss('[placeholder="standard_user"]');
const porTestidInput = countCss('[data-testid="username-desktop"]');
check("getByPlaceholder('standard_user') rescata el input", porPlaceholder, 1);
check("...o su testid 'username-desktop'", porTestidInput, 1);
check("placeholder y testid son el mismo input", $$('[placeholder="standard_user"]')[0] === $$('[data-testid="username-desktop"]')[0], true);
```

> ⚠️ **La escalera tiene excepciones reales.** El botón *Sign In* sí vive en el peldaño 2 (tiene nombre accesible). Pero los **inputs sin label** no: ahí el peldaño 2 no aplica y bajas a placeholder/testid **no por pereza, sino porque el DOM no expone un nombre accesible**. Resiliencia es elegir el peldaño más alto **que de verdad funcione**.

---

## Peldaño 4 — lo que NO debes usar: clases hash `css-*`

`.css-9z8y7x` apunta hoy al `login-form`, pero es una clase generada por el bundler: **cambia en cada build**. Hay **6** de estas en el fixture — ruido frágil. El testid del **mismo** form (`data-testid="login-form"`) es lo correcto.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/04-escalera-resiliencia.ts
const hashFragil = countCss(".css-9z8y7x");
const formResiliente = countCss('[data-testid="login-form"]');
check("la clase hash apunta a 1 nodo HOY", hashFragil, 1);
check("el testid del MISMO form también cuenta 1", formResiliente, 1);
check("hash y testid son el mismo nodo (pero solo el testid es estable)", $$(".css-9z8y7x")[0] === $$('[data-testid="login-form"]')[0], true);
check("hay 6 clases hash css-* frágiles en la página", countCss('[class*="css-"]'), 6);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-07-css-vs-xpath-resilientes/04-escalera-resiliencia.ts
```

---

## Qué observar

- Empieza por el peldaño **más alto** que aplique: testid › rol+nombre › texto › estructura.
- El botón *Sign In* **sí** vive en el peldaño 2; los inputs sin label **no** (caen a placeholder/testid).
- Las clases hash `css-*` apuntan a un nodo **hoy**, pero cambian en cada build: son el anti-patrón.
- Distintos peldaños pueden señalar el **mismo nodo**; lo que cambia es cuánto sobrevive al refactor.

➡️ Siguiente: [7.5 Depurar contando matches](/docs/css-xpath/m7-depurar-con-conteo)
