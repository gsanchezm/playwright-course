# 2.4 — Hermanos: adyacente y general

> **Módulo 2 · CSS Atributos y combinadores**

> **Analogía QA:** a veces el elemento que quieres no tiene un buen hook propio, pero **vive al lado** de uno que sí. Los combinadores de hermano te dejan decir *"el que viene **justo** después de X"* (`+`) o *"cualquiera que venga después de X bajo el mismo padre"* (`~`). Es navegar por **vecindad**, como localizar el botón que sigue a la etiqueta de un campo.

---

## ¿Qué aprendes?

- `A + B` = hermano **adyacente**: el `B` que sigue **inmediatamente** a `A`.
- `A ~ B` = hermano **general**: cualquier `B` que venga **después** de `A` (mismo padre).
- Que ambos **solo miran hacia adelante**: en CSS no existe "hermano anterior".
- La diferencia `+` vs `~` cuando los hermanos **no** son consecutivos.

---

## `+` = hermano adyacente (el siguiente inmediato)

`A + B` toma el `B` que viene **justo** después de `A`, con el mismo padre. El botón del carrito es el hermano que sigue inmediatamente a la caja de búsqueda. Dentro de cada card, el `<span.badge>` viene justo tras la `<img>` (3 cards tienen badge; la 104 no), y el `<h3>` del nombre sigue al badge.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/04-hermanos.ts
import { countCss } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

titulo("+ = hermano adyacente (el siguiente inmediato)");
check(".nav-search + .cart-toggle → 1", countCss(".nav-search + .cart-toggle"), 1);
check("img + .badge → 3 (cards con badge tras la imagen)", countCss("img + .badge"), 3);
check(".badge + h3 → 3", countCss(".badge + h3"), 3);
```

---

## `~` = hermano general (todos los siguientes)

`A ~ B` toma **cualquier** `B` que venga después de `A` bajo el mismo padre. Hay 2 enlaces sociales hermanos (Twitter, Instagram): `.footer-link--social ~ .footer-link--social` da **1** porque solo el **segundo** tiene un social *antes*. Con los 3 nav-links, `.nav-link ~ .nav-link` da 2 (el 2º y el 3º siguen a un nav-link previo).

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/04-hermanos.ts
titulo("~ = hermano general (todos los siguientes)");
check(".footer-link--social ~ .footer-link--social → 1", countCss(".footer-link--social ~ .footer-link--social"), 1);
check(".nav-link ~ .nav-link → 2", countCss(".nav-link ~ .nav-link"), 2);
check(".summary-row + .summary-row → 2", countCss(".summary-row + .summary-row"), 2);
```

> ⚠️ Un patrón "N hermanos del mismo tipo → N−1 matches" aparece seguido con `~`: el **primero** nunca tiene un hermano anterior que lo seleccione. 2 sociales → 1; 3 nav-links → 2.

---

## Clave: los combinadores de hermano **solo miran hacia adelante**

No existe "hermano anterior" en CSS. `.is-active + .nav-link` toma el nav-link que **sigue** al activo (Checkout) → 1; no puedes pedir el que está **antes** ni con `+` ni con `~`. Y la diferencia `+` vs `~` se ve cuando no son consecutivos: tras la `<img>` de cada card vienen badge, h3, desc, price... `.pizza-img ~ .price` **alcanza** el price aunque no sea adyacente (4 cards), pero `.pizza-img + .price` da **0** porque el price nunca es el vecino inmediato de la imagen.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/04-hermanos.ts
titulo("Solo hacia adelante: no hay 'hermano anterior'");
check(".is-active + .nav-link (el siguiente al activo) → 1", countCss(".is-active + .nav-link"), 1);

// ~ salta vecinos intermedios (4); + exige adyacencia inmediata (0).
check(".pizza-img ~ .price (general, salta vecinos) → 4", countCss(".pizza-img ~ .price"), 4);
check(".pizza-img + .price (adyacente, nunca consecutivos) → 0", countCss(".pizza-img + .price"), 0);
```

> 🔷 **qa_transfer:** `page.locator('.nav-search + .cart-toggle')`. Mismo motor CSS, misma regla de vecindad. Úsalo cuando tu blanco solo sea identificable por *"el que está junto a"* un ancla estable.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-css-atributos-combinadores/04-hermanos.ts
```

---

## Qué observar

- `+` = **vecino inmediato**; `~` = **cualquier hermano siguiente**.
- Ambos exigen el **mismo padre** y solo miran **hacia adelante**.
- N hermanos del mismo tipo con `~` → **N−1** matches (el primero queda fuera).
- `~` salta vecinos intermedios (`.pizza-img ~ .price` = 4); `+` exige adyacencia (= 0 aquí).

➡️ Siguiente: [2.5 Selectores estables con testid](/docs/css-xpath/m2-selectores-estables)
