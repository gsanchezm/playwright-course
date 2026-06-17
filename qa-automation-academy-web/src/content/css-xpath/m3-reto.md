# 🚩 Reto — Módulo 3: "Aislar con pseudo-clases relacionales"

> **Módulo 3 · CSS Pseudo-clases**

> **Analogía QA:** tu tarea es aislar **un solo** elemento combinando una **relación** (`:has()`) con una **exclusión** (`:not()`). Es justo lo que haces al escribir un locator robusto: "la card que tenga *este* badge y que **no** esté en *aquel* estado". Una condición sola no basta; la intersección de dos sí.

---

## Instrucciones

1. Tu tarea: escribe **un** selector CSS que use `:has()` y/o `:not()` y aísle **exactamente** la card "Sin Gluten" que **no** esté agotada. En OmniPizza esa card es **Cuatro Quesos** (`data-testid="pizza-card-102"`): tiene el badge `.badge--sin-gluten` y **no** tiene el atributo `data-sold-out`.
2. Reemplaza el selector marcado con `CAMBIAME` (ahora `.pizza-card`, que matchea las 4) por tu selector. Debe dejar **exactamente 1** match y que ese match sea la card **102**.
3. Ejecuta el archivo y verifica que **las 2 filas** queden en ✅.

> Es **esperado** que veas ❌ hasta resolverlo: con `.pizza-card` el conteo da **4** (no 1) y la identidad no es `pizza-card-102`. Cuando tu selector esté bien, las dos filas quedan en ✅: exactamente 1 match y es la card 102.

---

## Plantilla

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/reto.ts
import { $$, attr } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 3: Aislar con pseudo-clases relacionales =====");

// TODO: reemplaza el selector CAMBIAME por uno con :has() y/o :not() que
//       deje EXACTAMENTE 1 match: la card Sin Gluten NO agotada (102).
const SELECTOR_RETO = ".pizza-card"; // CAMBIAME

// Aserciones (NO las toques): 1 match, y ese match es la card 102.
const elegidos = $$(SELECTOR_RETO);
check("el selector deja EXACTAMENTE 1 match", elegidos.length, 1);
check(
  "ese único match es la card Sin Gluten no agotada (102)",
  attr(elegidos[0], "data-testid"),
  "pizza-card-102",
);
```

El archivo trae además un **bonus** comentado: aislar el único `input` deshabilitado de toppings (el checkbox **Jalapeño**, `value="jalapeno"`). Descoméntalo y resuélvelo con `:disabled`.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-css-pseudoclases/reto.ts
```

**Objetivo:** cuando tu selector esté listo, las **2 filas** muestran ✅ (1 match y es `pizza-card-102`).

---

## Checklist de auto-corrección

- [ ] El selector parte de `.pizza-card` (no de un `data-testid`: eso sería hacer trampa).
- [ ] Usa `:has(.badge--sin-gluten)` para exigir el **badge correcto**.
- [ ] Usa `:not([data-sold-out])` para **excluir** la card agotada.
- [ ] El conteo da **exactamente 1** (ni 0 ni 4).
- [ ] Ese único match tiene `data-testid="pizza-card-102"`.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- `:has()` te deja pedir "la card que **contenga** un badge concreto" (revisa [3.5](/docs/css-xpath/m3-has)).
- `:not([...])` te deja **excluir** las que tengan un atributo (revisa [3.4](/docs/css-xpath/m3-not-is-where)).
- Combínalos en **un solo** selector sobre `.pizza-card`: una condición positiva (`:has`) y una negativa (`:not`).
- Para el bonus: el único `input` bloqueado de toppings se aísla con `:disabled` (revisa [3.1](/docs/css-xpath/m3-estado)).

</details>

---

⬅️ Anterior: [3.5 :has(), el selector relacional](/docs/css-xpath/m3-has) · ➡️ Siguiente: [Síntesis M3](/docs/css-xpath/m3-sintesis)
