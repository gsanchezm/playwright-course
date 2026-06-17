# 🚩 Reto — Módulo 2: "El selector de contrato"

> **Módulo 2 · CSS Atributos y combinadores**

> **Analogía QA:** tu tarea es enganchar dos grupos de elementos usando **hooks estables** (atributos `data-*`), no clases visuales ni posiciones. Es justo lo que haces al automatizar: el conteo debe ser **exacto** y el selector debe sobrevivir al próximo rediseño.

---

## Instrucciones

1. Escribe **dos** selectores de atributo que enganchen exactamente el conteo pedido:
   - **`RETO_SOCIAL`** → los **2** enlaces sociales del footer (Twitter + Instagram). Ambos llevan `data-social` y la clase `footer-link--social`; los otros 3 footer-links **no**.
   - **`RETO_ADD`** → los **4** botones `add-to-cart` por su testid **dinámico** (`add-to-cart-101..104`). El `=` exacto solo toma uno: necesitas un **operador de prefijo**.
2. Reemplaza cada `[data-CAMBIAME]` por tu selector.
3. Ejecuta el archivo y verifica que **las 2 filas** queden en ✅.

> Es **esperado** que veas ❌ hasta que completes los selectores: con `[data-CAMBIAME]` ambos conteos dan **0**. Cuando tus selectores sean correctos, las 2 filas deben quedar en ✅ (2 sociales y 4 botones add-to-cart).

---

## Plantilla

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/reto.ts
import { countCss } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 2: El selector de contrato =====");

// TODO (a): captura EXACTAMENTE los 2 enlaces sociales del footer.
const RETO_SOCIAL = "[data-CAMBIAME]"; // TODO: usa data-social (o footer-link--social)

// TODO (b): captura los 4 botones add-to-cart por su testid dinámico.
const RETO_ADD = "[data-CAMBIAME]"; // TODO: usa data-testid con ^= (prefijo)

// Verificación (NO la toques): el conteo debe ser EXACTO.
check("Selector de sociales captura exactamente 2", countCss(RETO_SOCIAL), 2);
check("Selector de add-to-cart captura exactamente 4", countCss(RETO_ADD), 4);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-css-atributos-combinadores/reto.ts
```

**Objetivo:** cuando tus selectores estén listos, las **2 filas** deben mostrar ✅ (2 enlaces sociales y 4 botones add-to-cart).

---

## Checklist de auto-corrección

- [ ] `RETO_SOCIAL` usa un **atributo de dato** estable (`data-social`), no una posición ni un texto.
- [ ] `RETO_SOCIAL` da **exactamente 2**: no se cuelan los otros 3 footer-links (Términos, Privacidad, Contacto).
- [ ] `RETO_ADD` usa el operador de **prefijo** `^=` sobre `data-testid`, no el `=` exacto.
- [ ] `RETO_ADD` da **exactamente 4**: las 4 cards, incluida la del botón "Agotado" (103).
- [ ] Al correrlo, las 2 filas muestran ✅.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- Para los sociales: ¿qué atributo llevan **solo** Twitter e Instagram? Repasa la presencia `[attr]` en [2.1](/docs/css-xpath/m2-selectores-de-atributo).
- Para los add-to-cart: los testids son `add-to-cart-101`, `-102`... ¿qué operador engancha "empieza con"? Lo viste en [2.2](/docs/css-xpath/m2-operadores-de-atributo).
- Recuerda por qué el `=` exacto **falla** para enganchar "todos": revisa [2.5](/docs/css-xpath/m2-selectores-estables).
- Si tu selector de sociales da 5, probablemente estás usando `.footer-link` (la clase base) en vez del hook específico.

</details>

---

⬅️ Anterior: [2.5 Selectores estables con testid](/docs/css-xpath/m2-selectores-estables) · ➡️ Siguiente: [Síntesis M2](/docs/css-xpath/m2-sintesis)
