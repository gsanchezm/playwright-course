# 4.5 — XPath en Playwright, Selenium y DevTools

> **Módulo 4 · XPath Fundamentos**

> **Analogía QA:** el XPath que escribes es el **mismo** en las tres herramientas; lo que cambia es la "puerta de entrada". Playwright lo recibe con el prefijo `xpath=` (o el atajo `//`), Selenium con `By.xpath(...)`, y el DevTools del navegador con `$x("...")`. Todos delegan en el **mismo** motor XPath 1.0 del navegador real — por eso lo que verifiques aquí (la sintaxis) transfiere, y por eso el comportamiento de `(//x)[n]` que jsdom equivoca, en estas tres herramientas es **correcto**.

---

## ¿Qué aprendes?

- Que la **misma cadena** XPath viaja a Playwright, Selenium y DevTools.
- Playwright: el prefijo `xpath=` y el **atajo** `//` (equivalentes).
- El gotcha del **encadenado**: `.//` (relativo al nodo) vs `//` (re-ancla al documento).
- Que las tres son **XPath 1.0**: tienes `contains`/`starts-with`/`normalize-space`, no `lower-case()` ni `matches()`.

---

## 1) El XPath de "Sign In" viaja a todas partes

Esta es la **misma** cadena que pegarías en Playwright, Selenium o DevTools. Aquí la verificamos contra el fixture; allá apunta al botón real.

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/05-xpath-en-herramientas.ts
const xpSignIn = "//button[normalize-space()='Sign In']";
check("el XPath de Sign In encuentra 1 botón", countXpath(xpSignIn), 1);
//   Playwright : page.locator(`xpath=${xpSignIn}`)   // o el atajo: page.locator("//button[...]")
//   Selenium   : driver.findElement(By.xpath(xpSignIn))
//   DevTools   : $x("//button[normalize-space()='Sign In']")   // en la consola del navegador
```

---

## 2) Playwright: `xpath=` y el atajo `//`

En `page.locator()`, una cadena que empieza con `//` o con `xpath=` se trata como **XPath**; cualquier otra cosa es CSS. Son equivalentes:

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/05-xpath-en-herramientas.ts
// page.locator("xpath=//a[@data-testid='nav-checkout-desktop']")
// page.locator("//a[@data-testid='nav-checkout-desktop']")   // mismo resultado
check(
  "el XPath del nav Checkout = 1",
  countXpath("//a[@data-testid='nav-checkout-desktop']"),
  1,
);
```

---

## 3) Encadenado: `.//` se queda en el nodo, `//` re-ancla

Clave y sutil: cuando encadenas un XPath **dentro** de otro locator, un `//` que arranca con `/` se re-**ancla al documento entero** (ignora tu nodo base). Para mantenerte **dentro** del nodo base usa `.//` (relativo al nodo actual).

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/05-xpath-en-herramientas.ts
// const card = page.locator("//*[@data-testid='pizza-card-101']");
// card.locator(".//h3")   // ✅ el h3 DE ESA card
// card.locator("//h3")    // ✗ TODOS los h3 del documento (re-anclado)
const h3DeLaCard101 = $x("//*[@data-testid='pizza-card-101']//h3");
check("el h3 dentro de pizza-card-101 = 1", h3DeLaCard101.length, 1);
check("y dice 'Pepperoni'", text(h3DeLaCard101[0]), "Pepperoni");
```

> ⚠️ El motor offline (jsdom) evalúa siempre desde `document`, así que el efecto "relativo al nodo" no se puede **medir** con un `check()` aquí — lo verás de verdad al encadenar locators en Playwright. La regla a memorizar: **dentro de un locator usa `.//`**; un `//` "pelado" salta de vuelta a la raíz del documento y rompe el scoping.

---

## 4) Todas son XPath 1.0

El motor de los navegadores es **XPath 1.0**: **no** existen `lower-case()`, `matches()` ni `ends-with()`. Lo que SÍ tienes (y usarás en M5) es `contains()`, `starts-with()`, `normalize-space()` y `translate()` para insensibilidad a mayúsculas. Aquí lo verificamos con `starts-with` sobre los testids de `add-to-cart`:

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/05-xpath-en-herramientas.ts
check(
  "//button[starts-with(@data-testid,'add-to-cart-')] = 4",
  countXpath("//button[starts-with(@data-testid,'add-to-cart-')]"),
  4,
);
//   DevTools tip: prueba (//li)[1] con $x("(//li)[1]") en la app real y
//   compáralo con $x("//li[1]") — ahí verás la indexación global que jsdom no reproduce.
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-xpath-fundamentos/05-xpath-en-herramientas.ts
```

---

## Qué observar

- La **misma** cadena XPath funciona en Playwright (`xpath=` o `//`), Selenium (`By.xpath`) y DevTools (`$x`).
- En `page.locator()`, `//` o `xpath=` activan el motor XPath; el resto es CSS.
- Encadenado: usa `.//` para quedarte dentro del nodo; un `//` "pelado" re-ancla al documento.
- Las tres son **XPath 1.0**: sin `lower-case()`/`matches()`; usa `contains`/`starts-with`/`normalize-space`/`translate`.

➡️ Siguiente: [🚩 Reto M4](/docs/css-xpath/m4-reto)
