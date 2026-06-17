# 2.3 — Descendiente vs hijo directo

> **Módulo 2 · CSS Atributos y combinadores**

> **Analogía QA:** el **espacio** y el **`>`** son dos preguntas de parentesco distintas. El espacio pregunta *"¿está en algún lugar **dentro** de...?"* (descendiente: hijo, nieto, bisnieto). El `>` pregunta *"¿es hijo **inmediato** de...?"* (un solo nivel). Elegir mal cambia el conteo **y** la resistencia de tu selector ante un remaquetado.

---

## ¿Qué aprendes?

- `A B` (espacio) = **descendiente**: `B` en cualquier nivel dentro de `A`.
- `A > B` = **hijo directo**: `B` colgando inmediatamente de `A` (un nivel).
- Cómo el mismo blanco da conteos distintos según el combinador.
- Por qué `>` es más **frágil** ante cambios de maquetado.

---

## Espacio = descendiente (cualquier nivel)

`A B` baja por **todo** el subárbol de `A`. `.catalog .price` encuentra los 4 `.price` aunque estén anidados dentro de cada `<article>`: no le importa la profundidad.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/03-descendiente-vs-hijo.ts
import { countCss } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

titulo("Espacio = descendiente (cualquier nivel)");
check(".catalog .price (descendiente) → 4", countCss(".catalog .price"), 4);
check(".pizza-grid article (descendiente) → 4", countCss(".pizza-grid article"), 4);
```

---

## `>` = hijo directo (un solo nivel)

`A > B` exige que `B` sea hijo **inmediato** de `A`. Las 4 cards cuelgan directo del grid, así que `.pizza-grid > article` da 4. Pero `.price` **no** es hijo directo del grid (vive dentro del `<article>`): con `>` el conteo cae a **0**, mientras que con espacio era 4.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/03-descendiente-vs-hijo.ts
titulo("> = hijo directo (un solo nivel)");
check(".pizza-grid > article (hijo directo) → 4", countCss(".pizza-grid > article"), 4);

// Mismo blanco, distinto parentesco: 0 con ">", 4 con espacio.
check(".pizza-grid > .price (hijo directo) → 0", countCss(".pizza-grid > .price"), 0);
check(".pizza-grid .price (descendiente) → 4", countCss(".pizza-grid .price"), 4);
```

---

## El mismo blanco, distinto parentesco: el header

`header a` (descendiente) cuenta **todos** los `<a>` bajo el header: el brand + los 3 del nav = 4. `header > a` (hijo directo) cuenta solo el brand, que cuelga directo del `<header>`; los 3 enlaces del nav son hijos del `<nav>`, no del header.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/03-descendiente-vs-hijo.ts
titulo("header a vs header > a");
check("header a (descendiente) → 4", countCss("header a"), 4);
check("header > a (hijo directo, solo el brand) → 1", countCss("header > a"), 1);
```

---

## Por qué importa en QA: `>` es frágil ante remaquetado

`.catalog > article` da **0** hoy (entre `.catalog` y los `<article>` hay un `<h2>` y el `.pizza-grid` de por medio). Si un dev envuelve los articles en otro `<div>`, ese `>` seguiría roto, mientras que `.catalog article` (descendiente) **sobrevive** al cambio y mantiene 4.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/03-descendiente-vs-hijo.ts
titulo("Fragilidad del hijo directo");
check(".catalog > article (hijo directo) → 0", countCss(".catalog > article"), 0);
check(".catalog article (descendiente, resiste anidado) → 4", countCss(".catalog article"), 4);
```

> ⚠️ El `>` te ata a un nivel **exacto** del árbol. Un wrapper nuevo (muy común en refactors de UI) rompe `A > B` pero no `A B`. Usa `>` solo cuando necesites **excluir nietos** a propósito; por defecto, prefiere el descendiente.

> 🔷 **qa_transfer:** `page.locator('.pizza-grid > article')` en Playwright se evalúa con el **mismo motor CSS** del navegador. La regla de parentesco es idéntica.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-css-atributos-combinadores/03-descendiente-vs-hijo.ts
```

---

## Qué observar

- Espacio = **cualquier profundidad**; `>` = **un solo nivel**.
- El mismo `.price` da 4 (descendiente) o 0 (hijo directo del grid): el combinador cambia el conteo.
- `header > a` revela la estructura real: solo el brand cuelga directo del header.
- `>` es **frágil**: un wrapper intermedio lo rompe. Prefiere el descendiente salvo que necesites excluir nietos.

➡️ Siguiente: [2.4 Hermanos: adyacente y general](/docs/css-xpath/m2-hermanos)
