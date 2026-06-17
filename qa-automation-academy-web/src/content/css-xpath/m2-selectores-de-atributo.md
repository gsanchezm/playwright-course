# 2.1 — Selectores de atributo

> **Módulo 2 · CSS Atributos y combinadores**

> **Analogía QA:** un selector de atributo es como filtrar una tabla de datos por una **columna**, no por su posición. En vez de "la fila 3", dices "las filas donde `categoria = veggie`". El DOM es la tabla; los atributos son las columnas; `[attr]` y `[attr="valor"]` son tu filtro.

---

## ¿Qué aprendes?

- `[attr]` = **presencia**: el elemento lleva ese atributo, sin importar el valor.
- `[attr="valor"]` = valor **exacto**: la columna vale exactamente eso.
- Cómo combinar atributo con etiqueta/clase para estrechar el universo.
- Por qué un atributo de datos (`data-price`, `data-category`) es un **contrato limpio**: lo lees sin parsear el texto visible.

---

## Presencia: `[attr]`

`[data-testid]` matchea **todo** elemento que lleve el atributo, sin mirar el valor. Es el filtro más amplio: *"¿esta columna existe en la fila?"*. Los atributos booleanos como `hidden` o un `data-sold-out` también se enganchan por presencia.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/01-selectores-de-atributo.ts
import { countCss, $$, attr, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

titulo("Presencia: [attr]");
check('[data-testid] (presencia) matchea muchos', countCss("[data-testid]"), 61);

// Booleanos: el banner de cold-start está oculto en el fixture → 1.
check('[hidden] (atributo booleano) → 1', countCss("[hidden]"), 1);

// Solo la card agotada (103) lleva data-sold-out.
check('[data-sold-out] (presencia) → 1', countCss("[data-sold-out]"), 1);
```

---

## Valor exacto: `[attr="valor"]`

Con comillas exiges el valor **completo**. `[data-category="veggie"]` solo toma la card 102 (Cuatro Quesos). El valor exacto distingue **estado**: `[aria-pressed="true"]` aísla la bandera de mercado seleccionada (MX); las otras 3 tienen `aria-pressed="false"` y no matchean.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/01-selectores-de-atributo.ts
titulo('Valor exacto: [attr="valor"]');
check('[data-category="veggie"] → 1', countCss('[data-category="veggie"]'), 1);

// Estado: "true" no es "false".
check('[aria-pressed="true"] (bandera activa MX) → 1', countCss('[aria-pressed="true"]'), 1);
check('[aria-pressed="false"] (banderas inactivas) → 3', countCss('[aria-pressed="false"]'), 3);
```

---

## Atributo + etiqueta: el atributo afina, la etiqueta acota

`article[data-category="meat"]` es *"el `<article>` cuya categoría es carnes"*: la etiqueta acota el tipo, el atributo afina el valor. Y como el atributo es un **contrato de datos**, leemos `data-price` directo, sin parsear el texto `"$210.00"` (con símbolo y decimales).

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/01-selectores-de-atributo.ts
titulo("Atributo + etiqueta");
const meat = $$('article[data-category="meat"]');
check('article[data-category="meat"] → 1', meat.length, 1);
check("...y es la Suprema de Carnes", text(meat[0].querySelector(".pizza-name")), "Suprema de Carnes");

// El atributo es un dato limpio: sin $, sin decimales.
const precioMeat = attr(meat[0], "data-price");
check("data-price del meat = '210' (dato limpio, sin $)", precioMeat, "210");
```

> 🔷 **qa_transfer:** en Playwright esto es `page.locator('[data-category="veggie"]')`. El selector de atributo es idéntico; cambia solo el motor que lo evalúa.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-css-atributos-combinadores/01-selectores-de-atributo.ts
```

---

## Qué observar

- `[attr]` (presencia) es el filtro más amplio: cualquier valor sirve, basta que el atributo **exista**.
- `[attr="valor"]` exige el valor **completo y exacto**: `"true"` y `"false"` son blancos distintos.
- Combinar `etiqueta[atributo]` estrecha el match: tipo + dato.
- Prefiere leer un **atributo de dato** (`data-price`) en vez de parsear el texto visible: el dato viene limpio.

➡️ Siguiente: [2.2 Operadores de atributo](/docs/css-xpath/m2-operadores-de-atributo)
