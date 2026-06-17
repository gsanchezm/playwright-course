# 8.4 — Shadow DOM

> **Módulo 8 · Técnicas del 1%**

> **Analogía QA:** un Web Component encapsula su interior en un **shadow root**, como una caja negra de terceros. Tu CSS/XPath normal **no entra** ahí: para el motor, ese árbol interno es **otro documento**. Saber esto te ahorra horas de "mi selector es correcto pero no encuentra nada". jsdom no renderiza shadow DOM, así que la teoría va en prosa; abajo demostramos lo **único** que se puede ejecutar offline: que la sintaxis **muerta** realmente revienta.

---

## ¿Qué aprendes?

- Por qué CSS y XPath estándar **no cruzan** el límite shadow.
- Qué pasó con `>>>`, `/deep/` y `::shadow` (spoiler: eliminados de Chrome).
- Qué `>>` de Playwright es un separador de **engines**, no el `>>>` muerto.
- Qué herramientas **sí** perforan open shadow (Playwright `css`, Selenium 4 `getShadowRoot()`) y cuáles **no** (XPath, `css:light`).

---

## Lo que debes recordar

- **CSS y XPath estándar no cruzan el límite shadow.** Un `querySelector` desde el `document` **no** ve los nodos dentro de un shadow root (open o closed). El árbol shadow es, a efectos del selector, otro documento.
- **`>>>`, `/deep/` y `::shadow` están eliminados de Chrome.** Eran del viejo *Shadow DOM v0*, retirado en **Chrome 89**. Hoy o lanzan error de sintaxis o no hacen nada. No los uses jamás.
- **El `>>` de Playwright es un separador de *engines*** (`css=... >> text=...`), **no** el `>>>` muerto. No perfora shadow por sí mismo; solo encadena motores de selección.
- **Playwright:** el engine `css` **sí** perfora open shadow automáticamente; `css:light` **no** (se limita al light DOM); y el engine **XPath nunca** perfora shadow.

> 🔷 **getByRole y el shadow DOM.** `getByRole` (y `getByText`, `getByLabel`...) perforan el open shadow porque **todos** los locators de Playwright lo hacen **por diseño del motor** — **no** "porque vayan por el accessibility tree". El motor resuelve atravesando shadow roots abiertos; el rol es solo el criterio de búsqueda, no la razón de la perforación.

- **Selenium 4:** `element.getShadowRoot()` te devuelve el root, y desde ahí buscas **solo con selectores CSS** (XPath no opera dentro del shadow root). El *closed* shadow sigue siendo inaccesible para todos.

> ⚠️ **closed vs open.** Un `{ mode: "closed" }` no expone su `shadowRoot` ni siquiera a estas herramientas. Si te topas con uno, el elemento es inalcanzable por selector: necesitas otra vía (API, hook que el equipo de front exponga) o reportarlo como no testeable.

---

## Demo ejecutable 1: `>>>` es sintaxis inválida → `querySelectorAll` lanza

No "devuelve 0": es un selector **ilegal**, el motor lo **rechaza**. Lo envolvemos en `try/catch` y verificamos que efectivamente lanzó (si no lo envolviéramos, el throw abortaría el archivo entero).

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/04-shadow-dom.ts
let lanzoDeep = false;
try {
  document.querySelectorAll("a >>> b"); // combinador inexistente -> error de sintaxis
} catch {
  lanzoDeep = true;
}
check("querySelectorAll('a >>> b') LANZA (selector invalido)", lanzoDeep, true);
```

---

## Demo ejecutable 2: los pseudos custom de Playwright no son CSS estándar

`:has-text()` y `:text-is()` son inventos del motor de Playwright; en un `querySelectorAll` real **no existen** y lanzan. Por eso en estos `.ts` offline usamos `:has()` **estándar** para "contiene", nunca `:has-text()`.

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/04-shadow-dom.ts
let lanzoHasText = false;
try {
  document.querySelectorAll("button:has-text('Sign In')"); // pseudo no estandar
} catch {
  lanzoHasText = true;
}
check("querySelectorAll(\"button:has-text('Sign In')\") LANZA", lanzoHasText, true);
```

---

## Contraste: `:has()` **sí** es estándar → no lanza

Para no dejar la idea en negativo: el `:has()` que usamos en todo el módulo es CSS válido y resuelve sin errores.

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/04-shadow-dom.ts
let lanzoHas = false;
try {
  document.querySelectorAll("button:has(svg)"); // :has() estandar, valido
} catch {
  lanzoHas = true;
}
check(":has() (estandar) NO lanza", lanzoHas, false);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-08-tecnicas-1-percent/04-shadow-dom.ts
```

---

## Qué observar

- CSS/XPath estándar **no** cruzan el límite shadow: si tu selector "correcto" no encuentra nada, sospecha de un shadow root.
- `>>>`, `/deep/`, `::shadow` están **muertos** (Chrome 89). El `>>` de Playwright es otra cosa (separador de engines).
- En Playwright, `css` perfora open shadow y `getByRole` también — **porque todos sus locators lo hacen por diseño**, no por el a11y tree.
- En estos `.ts` offline solo se puede **demostrar el throw** de la sintaxis muerta y de los pseudos custom; la perforación real se ve en el navegador.

➡️ Siguiente: [8.5 iframes y relative locators](/docs/css-xpath/m8-iframes-y-relativos)
