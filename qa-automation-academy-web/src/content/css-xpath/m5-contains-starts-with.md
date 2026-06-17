# 5.2 — contains() y starts-with()

> **Módulo 5 · XPath Texto y funciones**

> **Analogía QA:** cuando no conoces el texto **exacto** (un total que cambia, un id dinámico, un href con prefijo fijo), no puedes pedir igualdad. Pides una **coincidencia parcial**: "que contenga..." o "que empiece con...". Es el `LIKE '%texto%'` de SQL, pero para el DOM.

---

## ¿Qué aprendes?

- `contains(haystack, needle)`: ¿la **subcadena** `needle` aparece en `haystack`? — y que es **literal, NO regex**.
- `starts-with(cadena, prefijo)`: ¿`cadena` arranca con `prefijo`? — ideal para atributos con prefijo fijo.
- Que ambas funcionan sobre **atributos** (`@class`, `@href`) y sobre **texto** (`.`, `normalize-space(.)`).
- Cómo combinarlas para enganchar un **prefijo estable + sufijo dinámico** (testids).

---

## contains(.,...) busca subcadena (literal, NO regex)

**Ojo:** `contains()` es **subcadena literal**, no una regex. `"Marg"` no son comodines ni clases de caracteres: es texto exacto que debe aparecer tal cual. Sobre `.` (string-value) atrapa texto aunque esté repartido en hijos.

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/02-contains-starts-with.ts
check('//h3[contains(., "Quesos")] → 1', countXpath('//h3[contains(., "Quesos")]'), 1);

check('//span[contains(@class, "badge--popular")] → 1', countXpath('//span[contains(@class, "badge--popular")]'), 1);

check(
  '//li[contains(@class, "cart-line")][contains(., "Cuatro Quesos")] → 1',
  countXpath('//li[contains(@class, "cart-line")][contains(., "Cuatro Quesos")]'),
  1,
);
```

---

## starts-with(@attr, prefijo) ancla al inicio del atributo

Ideal para atributos con prefijo fijo. El enlace de contacto del footer es el único cuyo `href` empieza con `"mailto:"`. Sobre **texto**, combínalo con `normalize-space` para que el whitespace no rompa el prefijo.

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/02-contains-starts-with.ts
check('//a[starts-with(@href, "mailto:")] → 1', countXpath('//a[starts-with(@href, "mailto:")]'), 1);

check('//a[starts-with(@href, "http")] → 4', countXpath('//a[starts-with(@href, "http")]'), 4);

check(
  '//h3[starts-with(normalize-space(.), "Pep")] → 1',
  countXpath('//h3[starts-with(normalize-space(.), "Pep")]'),
  1,
);
```

---

## Prefijo estable + sufijo dinámico

El testid dinámico de las tarjetas empieza con `"pizza-card-"` (prefijo estable) y termina en un id que no conocemos de antemano. `starts-with` sobre el atributo es el hook resiliente.

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/02-contains-starts-with.ts
check(
  '//article[starts-with(@data-testid, "pizza-card-")] → 4',
  countXpath('//article[starts-with(@data-testid, "pizza-card-")]'),
  4,
);
```

> 🔷 **qa_transfer:** en Playwright, `contains` de texto = `page.getByText("Quesos")` (subcadena por defecto); el prefijo de atributo no tiene azúcar dedicado y se escribe igual: `page.locator('xpath=//a[starts-with(@href,"mailto:")]')`.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-xpath-texto-funciones/02-contains-starts-with.ts
```

---

## Qué observar

- `contains()` busca **subcadena literal**: `"Marg"` no es un patrón, es texto exacto — nada de comodines de regex.
- `contains(., ...)` usa el **string-value**, así que atrapa texto repartido entre hijos del elemento.
- `starts-with(@href, "mailto:")` ancla al **inicio** del atributo: solo el contacto del footer cumple.
- Para enganchar testids con sufijo dinámico, `starts-with(@data-testid, "pizza-card-")` es el hook **estable** (los 4 articles).

➡️ Siguiente: [5.3 normalize-space() anti-flaky](/docs/css-xpath/m5-normalize-space)
