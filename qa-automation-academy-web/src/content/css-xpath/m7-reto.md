# 🚩 Reto — Módulo 7: "De frágil a resiliente"

> **Módulo 7 · CSS vs XPath y resiliencia**

> **Analogía QA:** heredaste un test con un selector **frágil** — una clase hash `.css-9z8y7x` generada por el bundler. Hoy apunta al formulario de login, pero cambiará en el próximo *build* y romperá la prueba. Tu tarea es reescribirlo a un selector **resiliente** que apunte exactamente al mismo nodo, sin depender de la clase hash.

---

## Instrucciones

1. **No toques** `SELECTOR_FRAGIL` (es el punto de partida heredado: `.css-9z8y7x`).
2. Reemplaza `"CAMBIAME"` en `SELECTOR_RESILIENTE` por un selector CSS que:
   - apunte al **mismo** nodo que `SELECTOR_FRAGIL` (1 solo elemento),
   - **no** contenga la subcadena `"css-"` (nada de clases hash),
   - use un hook estable (pista: el formulario tiene un `data-testid`).
3. Ejecuta el archivo y verifica que **las 3 filas** queden en ✅.

> Es **esperado** ver ❌ con `"CAMBIAME"`: `querySelectorAll` no encuentra nada → 0 nodos, distinto nodo, y el conteo no cuadra. Cuando lo resuelvas, las 3 filas deben quedar en ✅.

---

## Plantilla

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/reto.ts
import { $$, countCss } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 7: De frágil a resiliente =====");

// Selector heredado, FRÁGIL (NO lo toques): clase hash del bundler.
const SELECTOR_FRAGIL = ".css-9z8y7x";

// TODO: reescríbelo a un selector RESILIENTE equivalente (mismo nodo, sin "css-").
const SELECTOR_RESILIENTE = "CAMBIAME"; // TODO: usar el data-testid del formulario de login

// Validación (NO la toques): el resiliente debe apuntar al MISMO único nodo
// que el frágil, y NO puede contener una clase hash.
const nodoFragil = $$(SELECTOR_FRAGIL)[0] ?? null;
const nodoResiliente = $$(SELECTOR_RESILIENTE)[0] ?? null;

check(
  "el selector resiliente apunta a EXACTAMENTE 1 nodo",
  countCss(SELECTOR_RESILIENTE),
  1,
);
check(
  "apunta al MISMO nodo que el selector frágil",
  nodoResiliente !== null && nodoResiliente === nodoFragil,
  true,
);
check(
  "el selector resiliente NO usa una clase hash 'css-'",
  SELECTOR_RESILIENTE.includes("css-"),
  false,
);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-07-css-vs-xpath-resilientes/reto.ts
```

**Objetivo:** cuando tu selector esté listo, las **3 filas** deben mostrar ✅ (mismo nodo, exactamente 1, y sin clases hash).

---

## Checklist de auto-corrección

- [ ] Subiste por la **escalera de resiliencia** (7.4): preferiste un `testid` antes que la clase.
- [ ] El selector apunta a **exactamente 1** nodo (`countCss` = 1), ni 0 ni N.
- [ ] Es el **mismo nodo** que el frágil (lo comprobaste con `===`, no solo por conteo).
- [ ] **No** contiene `"css-"`: nada de clases generadas por el bundler.
- [ ] Al correrlo, las 3 filas muestran ✅.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- El formulario de login expone un `data-testid` propio. Búscalo: es el peldaño 1 de la [escalera (7.4)](/docs/css-xpath/m7-escalera-resiliencia).
- Un selector de atributo en CSS se escribe `[data-testid="..."]` — exacto y sin depender de clases.
- Si tu conteo da 0, tu hook no existe en el DOM (revisa el nombre del testid). Si da N>1, no es único (revisa [7.5](/docs/css-xpath/m7-depurar-con-conteo)).
- La clase hash y el testid apuntan al **mismo** nodo hoy; la diferencia es que el testid **sobrevive** al próximo build.

</details>

---

⬅️ Anterior: [7.5 Depurar contando matches](/docs/css-xpath/m7-depurar-con-conteo) · ➡️ Siguiente: [Síntesis M7](/docs/css-xpath/m7-sintesis)
