# 2.2 — Operadores de atributo

> **Módulo 2 · CSS Atributos y combinadores**

> **Analogía QA:** si `[attr="x"]` es *"igual a"*, los operadores son los demás comparadores de un filtro: *"empieza con"*, *"termina con"*, *"contiene"*, *"está en la lista"*. Son tu arsenal para enganchar valores **dinámicos** (testids con id, hrefs de archivos, listas de `rel`) sin escribir el valor completo a mano.

---

## ¿Qué aprendes?

- `^=` prefijo, `$=` sufijo, `*=` subcadena, `~=` palabra en lista, `|=` código de idioma.
- El flag `i` para comparar **sin distinguir** mayúsculas.
- La diferencia fina entre `*=` (subcadena) y `~=` (palabra completa).
- La trampa de `|=`: **no** es "empieza con", es "exacto `v` o prefijo `v-`".

---

## `^=` prefijo y `$=` sufijo

`^=` matchea cuando el valor **empieza con** algo; `$=` cuando **termina con** algo. Los testids de las cards son dinámicos (`pizza-card-101`, `-102`...): `[data-testid^="pizza-card-"]` los engancha a **todos** por su prefijo estable. Y `[href$=".pdf"]` captura archivos por su extensión.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/02-operadores-de-atributo.ts
import { countCss } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

titulo("^= prefijo");
check('[data-testid^="pizza-card-"] → 4 cards', countCss('[data-testid^="pizza-card-"]'), 4);
check('[data-testid^="add-to-cart-"] → 4 botones', countCss('[data-testid^="add-to-cart-"]'), 4);

titulo("$= sufijo");
check('[href$=".pdf"] → 1 (Términos)', countCss('[href$=".pdf"]'), 1);
check('[data-testid$="-desktop"] → 13', countCss('[data-testid$="-desktop"]'), 13);
```

---

## `*=` subcadena vs `~=` palabra

`*=` matchea si el valor **contiene** la cadena en cualquier parte, sin respetar límites de palabra. Ojo con la trampa: `[class*="badge"]` da **4**, no 3 — atrapa los 3 `<span class="badge ...">` de las cards **y** el `span.cart-badge` del header. En cambio `~=` exige una **palabra completa** dentro de un atributo separado por espacios: `[rel~="noopener"]` matchea tanto `rel="noopener"` como `rel="noopener noreferrer"`.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/02-operadores-de-atributo.ts
titulo("*= subcadena");
// 4: la subcadena "badge" también vive en "cart-badge".
check('[class*="badge"] → 4 (3 badges + cart-badge)', countCss('[class*="badge"]'), 4);
check('[src*="cuatro"] → 1', countCss('[src*="cuatro"]'), 1);

titulo("~= palabra en lista");
check('[rel~="noopener"] → 2', countCss('[rel~="noopener"]'), 2);
check('[rel~="noreferrer"] → 1 (solo el de privacidad)', countCss('[rel~="noreferrer"]'), 1);
```

> ⚠️ `*=` y `~=` se confunden seguido. `*=` es **subcadena cruda** (mira dentro de las palabras: por eso `"badge"` cuela en `"cart-badge"`). `~=` es **palabra exacta** dentro de una lista separada por espacios (no parte de una palabra).

---

## `|=` código de idioma: exacto `v` o prefijo `v-`

`[lang|="es"]` **no** significa "empieza con `es`". Significa el valor **exacto** `"es"` **o** que empiece con `"es-"` (`es-MX`, `es-ES`). Está pensado para subcódigos de idioma con guion. Por eso `[lang|="es"]` matchearía `lang="es"` y `lang="es-MX"`, pero **no** `lang="estonia"`.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/02-operadores-de-atributo.ts
titulo("|= idioma: exacto v o prefijo v-");
// Solo <html lang="es"> en el fixture.
check('[lang|="es"] → 1 (html lang="es")', countCss('[lang|="es"]'), 1);
```

> ⚠️ Trampa de `|=`: es **exacto `es` o prefijo `es-`**, no "cualquier cosa que empiece con `es`". `es-MX` matchea (subcódigo de idioma); `estonia` **no**. Si lo que quieres es "empieza con", usa `^=`.

---

## flag `i`: comparación insensible a mayúsculas

Por defecto el valor se compara **case-sensitive**. Pon una `i` antes del `]` para volverla insensible: útil cuando el casing del dato no es confiable.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/02-operadores-de-atributo.ts
titulo("flag i (case-insensitive)");
check('[data-category="VEGGIE"] (sin i) → 0', countCss('[data-category="VEGGIE"]'), 0);
check('[data-category="VEGGIE" i] (con i) → 1', countCss('[data-category="VEGGIE" i]'), 1);
```

> 🔷 **qa_transfer:** estos operadores viven igual dentro de `page.locator('[data-testid^="pizza-card-"]')`. Son CSS estándar: el motor del navegador los entiende sin cambios.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-css-atributos-combinadores/02-operadores-de-atributo.ts
```

---

## Qué observar

- `^=` / `$=` enganchan **valores dinámicos** por su parte estable (prefijo o sufijo).
- `*=` es subcadena cruda: cuidado, atrapa coincidencias dentro de otras palabras (`badge` ⊂ `cart-badge`).
- `~=` exige **palabra completa** en una lista separada por espacios.
- `|=` es para **idiomas** (exacto o `v-`), no para "empieza con": para eso está `^=`.
- El flag `i` vuelve la comparación insensible a mayúsculas.

➡️ Siguiente: [2.3 Descendiente vs hijo directo](/docs/css-xpath/m2-descendiente-vs-hijo)
