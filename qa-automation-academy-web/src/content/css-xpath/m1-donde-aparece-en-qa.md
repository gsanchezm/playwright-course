# 1.5 — Dónde aparece en QA

> **Módulo 1 · CSS Fundamentos**

> **Analogía QA:** el mismo selector CSS que practicas aquí es **exactamente** el que escribirás en Playwright, Selenium o la consola de DevTools. La herramienta cambia; el selector es el mismo. Aquí **no** montamos el navegador: probamos el selector **offline** con `countCss()` contra el fixture y mostramos en prosa la línea que iría en cada herramienta.

---

## ¿Qué aprendes?

- Cómo el mismo selector CSS viaja a **Playwright**, **Selenium** y **DevTools**.
- Que `page.locator(".pizza-card")` usa CSS por defecto (el explícito es `css=`).
- Que el `$$` de la consola es **azúcar** de `document.querySelectorAll`.
- Por qué `:has-text()` / `:text-is()` **no** son CSS estándar (son de Playwright).

---

## Playwright: `page.locator(".pizza-card")`

En Playwright, `page.locator(".pizza-card")` usa CSS por defecto; el explícito `page.locator("css=.pizza-card")` es lo mismo. El selector que validas aquí es el que pondrías allá.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/05-donde-aparece-en-qa.ts
// El selector .pizza-card es el mismo que usarías en page.locator(...).
check("el selector .pizza-card encuentra 4 tarjetas", countCss(".pizza-card"), 4);
```

---

## Selenium: `By.cssSelector("#login-form")`

Selenium expone CSS vía `By.cssSelector(...)`. `findElement` (singular) lanza si no encuentra; `findElements` (plural) devuelve la lista. El mismo `#login-form`.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/05-donde-aparece-en-qa.ts
check("el selector #login-form encuentra el formulario único", countCss("#login-form"), 1);
```

---

## DevTools: `$$(".pizza-card")` en la consola

En la consola del navegador, `$$(sel)` es **azúcar** de `document.querySelectorAll(sel)` (devuelve un array). Por eso nuestro helper `$$` se llama igual: replica ese gesto. Lo usas para verificar un selector **a mano** antes de pegarlo en tu test.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/05-donde-aparece-en-qa.ts
const cards = $$(".pizza-card");
check("$$('.pizza-card') devuelve 4 (como en la consola)", cards.length, 4);
check("la primera del array es 'Pepperoni'", text(cards[0].querySelector("h3")), "Pepperoni");
```

---

## El mismo selector vale para contar (auditar la UI)

Un caso típico: aseverar **cuántos** elementos hay. "El catálogo muestra 4 pizzas" es una aserción de conteo sobre el mismo selector `.pizza-card`.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/05-donde-aparece-en-qa.ts
check("el catálogo muestra 4 pizzas", countCss(".pizza-card"), 4);
check("el carrito tiene 2 líneas", countCss(".cart-line"), 2);
```

---

## Cuidado: `:has-text()` / `:text-is()` no son CSS estándar

Son pseudo-clases **custom de Playwright** (su motor las entiende). En CSS real —y en `querySelectorAll`— **no** existen y lanzan error. Aquí usamos el `:has()` **estándar** (sí soportado) para localizar "la tarjeta que contiene un `.badge`".

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/05-donde-aparece-en-qa.ts
// page.locator('.pizza-card:has-text("Pepperoni")') es válido SOLO en Playwright.
check(".pizza-card:has(.badge) → 3 (las que llevan etiqueta)",
  countCss(".pizza-card:has(.badge)"), 3);
```

> ⚠️ `:has-text()` y `:text-is()` viven **solo** dentro del motor de Playwright. Si los pasas a `document.querySelectorAll` (o a `By.cssSelector`) lanzan un error de sintaxis. Para texto en CSS estándar no hay pseudo-clase; usa `:has()` sobre estructura, o salta a XPath (Módulo 5).

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-css-fundamentos/05-donde-aparece-en-qa.ts
```

---

## Qué observar

- El **mismo** selector CSS funciona en Playwright (`locator`), Selenium (`By.cssSelector`) y DevTools (`$$`).
- `page.locator(".pizza-card")` ya es CSS; el `css=` explícito solo lo hace evidente.
- El `$$` de la consola = `document.querySelectorAll` (por eso nuestro helper se llama igual).
- `:has-text()` / `:text-is()` son **de Playwright**, no CSS; offline usa el `:has()` estándar.

➡️ Siguiente: [Reto M1](/docs/css-xpath/m1-reto)
