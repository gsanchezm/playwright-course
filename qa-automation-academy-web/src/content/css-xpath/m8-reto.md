# 🚩 Reto — Módulo 8: "El selector de elite"

> **Módulo 8 · Técnicas del 1%**

> **Analogía QA:** tu tarea final del módulo es la que separa a un automatizador del 1%: aislar **un** elemento sin hook propio combinando **ancla de texto + composición + exclusión**. En la app real es el botón "agregar al carrito" de la única pizza apta para celíacos que además está disponible: un clic equivocado compra otra pizza o falla sobre una agotada.

---

## Instrucciones

1. Tu tarea: aislar el botón "agregar al carrito" de la **única** pizza **sin gluten** que además está **disponible** (no agotada). Debe matchear **1 solo** elemento: el botón `add-to-cart-102` (Cuatro Quesos).
2. Tienes **dos** huecos marcados con `// TODO:`. Completa **al menos uno** (idealmente ambos) para que su `check()` quede en ✅:
   - `selectorCss` → composición CSS (`:has()` para mirar adentro + `:not()` para excluir lo agotado), partiendo de un hook de contenido estable.
   - `exprXpath` → parte de un **ancla de texto** y sube/baja por ejes con un predicado múltiple (`and` / `not`).
3. Ejecuta el archivo y verifica que **las 4 filas** queden en ✅.

> Es **esperado** que veas ❌ hasta que completes los selectores: ahora ambos apuntan a `CAMBIAME`, que matchea **0** elementos. Cuando cada uno aísle el botón correcto, las 4 filas (2 conteos + 2 testids) quedan en ✅.

---

## Plantilla

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/reto.ts
import { countCss, countXpath, $$, $x, attr } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 8: El selector de elite =====");

// TODO (CSS): compon un selector que aisle el add-to-cart de la pizza sin
//             gluten DISPONIBLE. Reemplaza "CAMBIAME".
const selectorCss = "CAMBIAME"; // TODO: :has(.badge--...) + :not([data-...]) + .add-to-cart

// TODO (XPath): mismo objetivo desde un ANCLA DE TEXTO + predicado multiple.
//               Reemplaza "//CAMBIAME".
const exprXpath = "//CAMBIAME"; // TODO: //span[normalize-space()='...']/ancestor::article//button[...]

// Verificacion (NO la toques): cada selector debe matchear EXACTAMENTE el
// boton add-to-cart-102 y nada mas.
console.log("\n· Solucion CSS:");
check("selectorCss matchea 1 elemento", countCss(selectorCss), 1);
check(
  "selectorCss apunta a add-to-cart-102",
  attr($$(selectorCss)[0], "data-testid"),
  "add-to-cart-102",
);

console.log("\n· Solucion XPath:");
check("exprXpath matchea 1 nodo", countXpath(exprXpath), 1);
check(
  "exprXpath apunta a add-to-cart-102",
  attr($x(exprXpath)[0] as Element, "data-testid"),
  "add-to-cart-102",
);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-08-tecnicas-1-percent/reto.ts
```

**Objetivo:** cuando tus selectores estén listos, las **4 filas** deben mostrar ✅ (cada uno aísla el botón `add-to-cart-102` de la pizza sin gluten disponible).

---

## Checklist de auto-corrección

- [ ] **CSS:** anclas en un hook de contenido estable de la tarjeta (su badge "Sin Gluten") con `:has(.badge--sin-gluten)`.
- [ ] **CSS:** excluyes la tarjeta agotada con `:not([data-sold-out])` (o `:not(.is-soldout)`).
- [ ] **CSS:** desciendes al botón con `.add-to-cart` (o `button.add-to-cart`).
- [ ] **XPath:** partes de un **ancla de texto** (`normalize-space()='Sin Gluten'`) y subes con `ancestor::article`.
- [ ] **XPath:** excluyes lo agotado en el predicado (`[not(@data-sold-out)]`) y bajas al `button[contains(@class,'add-to-cart')]`.
- [ ] Cada selector matchea **exactamente 1** elemento y es `add-to-cart-102`.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- **"Sin gluten"** tiene un hook propio en la tarjeta (un badge `.badge--sin-gluten`). Ánclate ahí: solo la Cuatro Quesos lo lleva ([8.1](/docs/css-xpath/m8-pivot-anchor)).
- **"Agotada"** se marca en el `<article>` con `data-sold-out="true"` y la clase `is-soldout`. Exclúyela con `:not([data-sold-out])` (CSS) o `not(@data-sold-out)` (XPath) ([8.2](/docs/css-xpath/m8-has-alcanza-xpath)).
- En CSS recuerda que `:has()` mira **hacia adentro** y `:not()` excluye sobre el **propio** elemento; luego desciendes con espacio al `.add-to-cart` ([8.2](/docs/css-xpath/m8-has-alcanza-xpath)).
- En XPath, parte del **ancla de texto** del badge con `normalize-space()`, **sube** con `ancestor::article`, mete la **exclusión** en el predicado del article (el mismo `[ ... and not(...) ]` de [8.2](/docs/css-xpath/m8-has-alcanza-xpath)) y **baja** al `button[contains(@class,...)]`. Son las cuatro piezas de [8.1](/docs/css-xpath/m8-pivot-anchor) y [8.3](/docs/css-xpath/m8-xpath-dinamico); ármalas tú.

</details>

---

⬅️ Anterior: [8.5 iframes y relative locators](/docs/css-xpath/m8-iframes-y-relativos) · ➡️ Siguiente: [Síntesis M8](/docs/css-xpath/m8-sintesis)
