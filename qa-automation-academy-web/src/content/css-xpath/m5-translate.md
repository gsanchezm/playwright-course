# 5.4 — translate() para case-insensitive

> **Módulo 5 · XPath Texto y funciones**

> **Analogía QA:** a veces el texto llega con un casing que no controlas (`"Pepperoni"`, `"PEPPERONI"`, `"pepperoni"` según el CMS o el idioma). Quieres un match que ignore mayúsculas. El problema: el XPath de los navegadores es **1.0** y **no** tiene `lower-case()`. El truco clásico es `translate()`: un "buscar y reemplazar" carácter por carácter que baja todo a minúsculas.

---

## ¿Qué aprendes?

- Qué hace `translate(cadena, de, a)`: sustituye **carácter por carácter** (posición a posición).
- Cómo lograr una comparación **case-insensitive** mapeando `A→a`, `B→b`, ...
- Que XPath 1.0 (navegadores) **no** tiene `lower-case()` / `matches()` / `ends-with()` — y por qué `translate()` es la herramienta correcta.
- Que `translate(texto, "$", "")` también **borra** caracteres (mapear a vacío).

---

## translate() baja el texto a minúsculas

`translate(., "ABC...", "abc...")` reemplaza cada mayúscula por su minúscula (posición a posición). `"Pepperoni"` → `"pepperoni"`. Ahora la igualdad ignora el casing original del DOM. En el código usamos dos constantes para no repetir las 26 letras:

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/04-translate.ts
const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const abc = "abcdefghijklmnopqrstuvwxyz";

check(
  '//h3[translate(normalize-space(.), ABC, abc)="pepperoni"] → 1',
  countXpath(`//h3[translate(normalize-space(.), "${ABC}", "${abc}")="pepperoni"]`),
  1,
);
```

> ⚠️ **GUARDRAIL XPath 1.0:** en XPath 1.0 (lo que corren los navegadores) **no** existen `lower-case()`, `upper-case()`, `matches()` ni `ends-with()`. Esas son de XPath 2.0. Si las usas en Chrome / Playwright / Selenium, el motor lanza un **error de sintaxis**. `translate()` es la herramienta correcta para case-insensitive aquí.

---

## translate() + contains() = subcadena case-insensitive

Bajamos el string-value a minúsculas y luego buscamos la subcadena (también en minúsculas). `"Cuatro Quesos"` contiene `"quesos"`; `"Suprema de Carnes"` contiene `"carnes"`. Dos pizzas distintas, mismo patrón insensible a casing.

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/04-translate.ts
check(
  '//h3[contains(translate(., ABC, abc), "quesos")] → 1',
  countXpath(`//h3[contains(translate(., "${ABC}", "${abc}"), "quesos")]`),
  1,
);
check(
  '//h3[contains(translate(., ABC, abc), "carnes")] → 1',
  countXpath(`//h3[contains(translate(., "${ABC}", "${abc}"), "carnes")]`),
  1,
);
```

---

## translate() también BORRA caracteres (mapear a vacío)

Si el segundo argumento es **más corto** que el primero, los caracteres sin pareja se **eliminan**. `translate(texto, "$", "")` quita el símbolo de moneda: `"$189.00"` → `"189.00"`. Útil para limpiar antes de comparar.

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/04-translate.ts
check(
  '//span[@data-testid="price-101"][translate(normalize-space(.), "$", "")="189.00"] → 1',
  countXpath('//span[@data-testid="price-101"][translate(normalize-space(.), "$", "")="189.00"]'),
  1,
);
```

> 🔷 **qa_transfer:** en Playwright **no** necesitas este truco — `page.getByText(/pepperoni/i)` usa una regex con la flag `i` y resuelve el case-insensitive de forma nativa. `translate()` es lo que escribes cuando estás **confinado** a XPath 1.0 (Selenium puro, locators `xpath=` heredados, herramientas que solo aceptan XPath).

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-xpath-texto-funciones/04-translate.ts
```

---

## Qué observar

- `translate(s, de, a)` sustituye **carácter por carácter por posición**: el mapeo `ABC...→abc...` baja todo a minúsculas.
- Es la forma **idiomática** de case-insensitive en XPath 1.0, porque `lower-case()` **no existe** en navegadores.
- Combinado con `contains()`, logras subcadena insensible a mayúsculas (Quesos / Carnes).
- Con un segundo argumento más corto, `translate()` **borra** caracteres: `"$"` → vacío para limpiar precios.

➡️ Siguiente: [5.5 position() y last()](/docs/css-xpath/m5-position-last)
