# 🚩 Reto — Módulo 1: "Apunta a las 4 pizzas"

> **Módulo 1 · CSS Fundamentos**

> **Analogía QA:** tu primera tarea es escribir el selector que tu suite usaría para aseverar "el catálogo muestra 4 pizzas". Suena trivial, pero es justo lo que hace un test de catálogo: localizar el conjunto exacto de tarjetas, ni una de más, ni una de menos.

---

## Instrucciones

1. Tu tarea: escribe un selector CSS que encuentre **exactamente** las 4 tarjetas de pizza del catálogo de OmniPizza. Ni una más, ni una menos.
2. Reemplaza el selector marcado con `// TODO:` (ahora es `.CAMBIAME`, que no matchea nada).
3. Ejecuta el archivo y verifica que **las 2 filas** queden en ✅.

> Es **esperado** que veas ❌ hasta que completes el selector: con `.CAMBIAME` el conteo da `0` (no `4`) y no hay un primer `<article>`, así que ambas filas salen ❌. Cuando resuelvas el reto, **ambas** deben quedar en ✅: 4 tarjetas y la primera es un `<article>` con su `<h3>`.

---

## Plantilla

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/reto.ts
import { $$, countCss, text } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 1: Apunta a las 4 pizzas =====");

// TODO: reemplaza ".CAMBIAME" por un selector CSS que matchee EXACTAMENTE
//       las 4 tarjetas de pizza.
const SELECTOR = ".CAMBIAME"; // TODO: completar (¿qué clase comparten las cards?)

// Validaciones (NO las toques): el selector debe encontrar 4 elementos y el
// primero debe ser un <article> que contenga un <h3>.
const matches = $$(SELECTOR);
const primero = matches[0];

check("el selector encuentra EXACTAMENTE 4 tarjetas", countCss(SELECTOR), 4);
check(
  "el primer match es un <article> con su <h3> de nombre",
  primero?.tagName === "ARTICLE" && text(primero.querySelector("h3")).length > 0,
  true,
);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-css-fundamentos/reto.ts
```

**Objetivo:** cuando tu selector esté listo, las **2 filas** deben mostrar ✅ (4 tarjetas y la primera es un `<article>` con `<h3>`).

---

## Checklist de auto-corrección

- [ ] El selector encuentra **exactamente 4** elementos (ni `*` ni algo demasiado amplio).
- [ ] El primer match es un `<article>` (la tarjeta entera, no un trozo suelto como el `.price`).
- [ ] Ese `<article>` contiene un `<h3>` con el nombre de la pizza.
- [ ] Al correrlo, las 2 filas muestran ✅.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- Las 4 tarjetas **comparten una clase**. ¿Cuál? La viste contar 4 en [1.2](/docs/css-xpath/m1-tipo-clase-id).
- Esa clase, como **selector de clase** (un punto + el nombre), ya devuelve las 4 tarjetas completas.
- Cada tarjeta es un `<article>`; el selector de clase apunta al `<article>`, no al `.price` ni al `.badge` que viven **dentro**.
- Si tu conteo da más de 4, probablemente estás usando un selector demasiado amplio (revisa el universal `*` en [1.3](/docs/css-xpath/m1-agrupacion-universal)).

</details>

---

⬅️ Anterior: [1.5 Dónde aparece en QA](/docs/css-xpath/m1-donde-aparece-en-qa) · ➡️ Siguiente: [Síntesis M1](/docs/css-xpath/m1-sintesis)
