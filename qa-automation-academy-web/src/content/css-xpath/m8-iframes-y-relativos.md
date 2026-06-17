# 8.5 — iframes y relative locators

> **Módulo 8 · Técnicas del 1%**

> **Analogía QA:** un `<iframe>` es un documento **dentro** de otro documento —como un formulario de pago de terceros incrustado. Tus selectores **no cruzan** ese límite: hay que "entrar" al frame primero (`frameLocator` / `switchTo`). Y los **relative locators** (above/below/near) localizan por **posición visual**, lo que es potente pero **frágil**: depende del render. jsdom no renderiza ni cruza frames, así que esos temas van en prosa; abajo demostramos el análogo **offline** y robusto: navegar por **ejes** según la posición **estructural**.

---

## ¿Qué aprendes?

- Por qué un selector vive en **un** documento y **no** entra a un `<iframe>` sin "cambiar de contexto".
- Cómo se entra a un frame en Playwright (`frameLocator`) y en Selenium (`switchTo().frame()`).
- Qué son los **relative locators** de Selenium 4 y por qué su **fragilidad** los hace un último recurso.
- El análogo offline y resiliente: relación **estructural** por ejes (`following-sibling::`, `preceding-sibling::`).

---

## iframes: el selector no cruza documentos

Un selector vive en **un** documento. Un `querySelector` desde la página padre **no** ve dentro del `<iframe>` (es otro `document`). Hay que **entrar** al frame primero:

```text
// Playwright — entras al frame y desde ahi localizas:
await page.frameLocator("iframe#pago").getByRole("button", { name: "Pagar" }).click();

// Selenium — cambias el contexto del driver al frame:
driver.switchTo().frame(driver.findElement(By.id("pago")));
driver.findElement(By.cssSelector("button.pay")).click();
driver.switchTo().defaultContent(); // y vuelves al documento principal
```

> ⚠️ **Sin "entrar", el elemento es invisible.** El error clásico es "mi selector es correcto pero `findElement` no lo encuentra": casi siempre el target vive dentro de un `<iframe>` y olvidaste `frameLocator`/`switchTo`. Y el contexto es **stateful** en Selenium: si no haces `defaultContent()`, los siguientes selectores siguen buscando dentro del frame.

---

## Relative locators (Selenium 4): potentes pero frágiles

Selenium 4 agregó localizadores por **geometría del render**: `above()`, `below()`, `near()`, `toLeftOf()`, `toRightOf()`.

```text
// Selenium 4 — "el input que esta debajo de la etiqueta 'Email'":
WebElement email = driver.findElement(
    RelativeLocator.with(By.tagName("input")).below(By.id("label-email")));
```

Son legibles, pero **frágiles**: cambia un `margin` o un wrap responsive y "el botón a la derecha de X" deja de serlo. Sus análogos en Playwright (`:near`, `:right-of`) están **deprecados** justo por eso.

> 🔷 **Prefiere relación estructural sobre relación visual.** La geometría (píxeles) cambia con cada breakpoint; la estructura (DOM) es estable. Si dos elementos están relacionados, casi siempre lo están también en el árbol (hermanos, ancestro común): ánclate ahí, no en "lo que se ve cerca".

---

## El análogo offline y robusto: relación por **ejes**

En vez de "el precio que está visualmente bajo el nombre" (geometría), usamos "el precio que es **hermano siguiente** del nombre" (estructura). Mismo objetivo, pero atado al DOM, no al píxel: sobrevive al re-render.

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/05-iframes-y-relativos.ts
// Desde el nombre "Pepperoni", el precio hermano siguiente de su tarjeta.
const precioDePepperoni =
  "//h3[normalize-space()='Pepperoni']/following-sibling::span[contains(@class,'price')]";
check("precio hermano de 'Pepperoni' -> 1", countXpath(precioDePepperoni), 1);
check(
  "y su texto (normalize-space limpia el whitespace) es $189.00",
  text($x(precioDePepperoni)[0] as Element),
  "$189.00",
);
```

El análogo de "below" estructural: el control que **viene después** del ancla en el DOM.

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/05-iframes-y-relativos.ts
const botonDespuesDelNombre =
  "//h3[normalize-space()='Pan de Ajo']/following-sibling::button[contains(@class,'add-to-cart')]";
check("boton tras 'Pan de Ajo' -> 1", countXpath(botonDespuesDelNombre), 1);
check(
  "es add-to-cart-104",
  attr($x(botonDespuesDelNombre)[0] as Element, "data-testid"),
  "add-to-cart-104",
);
```

Y el análogo de "toLeftOf": `preceding-sibling::` para volver al ancla anterior.

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/05-iframes-y-relativos.ts
const nombrePrevioAlPrecio =
  "//article[@data-testid='pizza-card-101']//span[contains(@class,'price')]/preceding-sibling::h3";
check(
  "el <h3> previo al precio en la card 101 es 'Pepperoni'",
  text($x(nombrePrevioAlPrecio)[0] as Element),
  "Pepperoni",
);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-08-tecnicas-1-percent/05-iframes-y-relativos.ts
```

---

## Qué observar

- Los selectores **no cruzan** el límite de un `<iframe>`: entras con `frameLocator` (Playwright) o `switchTo().frame()` (Selenium), y recuerdas volver con `defaultContent()`.
- Los **relative locators** (above/below/near) dependen del render: úsalos como último recurso, no como base.
- El análogo robusto es la relación **estructural** por ejes: `following-sibling::` / `preceding-sibling::` atan al DOM, no al píxel.
- Igual que en 8.1, todo parte de un **ancla de texto**: la estructura cuelga de ahí.

➡️ Siguiente: [Reto M8](/docs/css-xpath/m8-reto)
