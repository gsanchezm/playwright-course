# 🚩 Reto — Módulo 5: "El precio que el text() crudo no ve"

> **Módulo 5 · XPath Texto y funciones**

> **Analogía QA:** tu tarea es enganchar un precio que **se ve** perfecto en pantalla (`$189.00`) pero que un locator ingenuo con `text()` **no** atrapa, porque el DOM guardó whitespace invisible alrededor. Es el bug flaky por excelencia: el assertion "debería pasar" y falla sin razón aparente. La cura es `normalize-space()`.

---

## Instrucciones

1. Tu tarea: escribir **un** XPath que seleccione **exactamente** el precio `"$189.00"` de la card de Pepperoni (`data-testid="price-101"`). El obstáculo: ese `<span>` trae whitespace invisible alrededor del texto, así que `text()="$189.00"` da `0` (no matchea). Debes usar `normalize-space()` para limpiar el texto antes de comparar.
2. Reemplaza `RETO_XPATH = "CAMBIAME"` por tu expresión. Ahora `"CAMBIAME"` se evalúa como un paso de hijo inexistente → `0` nodos.
3. Ejecuta el archivo y verifica que **ambas filas** queden en ✅.

> Es **esperado** que veas ❌ en la primera fila hasta resolverlo: con `"CAMBIAME"`, tu XPath captura `0` nodos en vez de `1`. La **segunda** fila (el contraste: el `text()` crudo da `0`) sale ✅ desde el inicio, porque demuestra precisamente **por qué** necesitas `normalize-space()`. Cuando tu XPath sea correcto, **ambas** filas quedan en ✅.

---

## Plantilla

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/reto.ts
import { countXpath } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 5: El precio que el text() crudo no ve =====");

// TODO: reemplaza "CAMBIAME" por un XPath con normalize-space() que
//       seleccione EXACTAMENTE el precio "$189.00" (debe dar 1 nodo).
const RETO_XPATH = "CAMBIAME"; // TODO: apunta a price-101 y normaliza su texto

// Verificación (NO la toques): tu XPath debe capturar EXACTAMENTE 1 nodo.
check("Tu XPath captura exactamente el precio $189.00 (1 nodo)", countXpath(RETO_XPATH), 1);

// Contraste (NO lo toques): el text() CRUDO falla por el whitespace → 0.
// Esta fila sale ✅ siempre: es la PRUEBA de que necesitas normalize-space().
check(
  'Contraste: text()="$189.00" crudo NO matchea (whitespace invisible) → 0',
  countXpath('//span[@data-testid="price-101"][text()="$189.00"]'),
  0,
);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-xpath-texto-funciones/reto.ts
```

**Objetivo:** cuando tu XPath use `normalize-space()`, la primera fila debe mostrar ✅ (1 nodo). La segunda fila ya está en ✅ y explica el porqué.

---

## Checklist de auto-corrección

- [ ] Apuntas al `<span data-testid="price-101">` por su **testid estable**, no por posición ni clase visual.
- [ ] Limpias el texto con `normalize-space(.)` antes de comparar contra `"$189.00"`.
- [ ] Tu XPath captura **exactamente 1** nodo (ni 0 ni varios).
- [ ] La fila de contraste sigue en ✅: confirma que el `text()` crudo **no** matchea (esa es la lección).
- [ ] Al correrlo, **ambas** filas muestran ✅.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- El gancho estable del precio es su atributo `data-testid` (revisa [5.2](/docs/css-xpath/m5-contains-starts-with)).
- ¿Qué función recorta y colapsa el whitespace del string-value para que la igualdad funcione? (la viste en [5.3](/docs/css-xpath/m5-normalize-space)).
- Recuerda: `text()="$189.00"` falla porque el nodo de texto incluye saltos de línea; compara `normalize-space(.)` en su lugar.
- Forma del predicado: `[normalize-space(.)="$189.00"]` colgado del `<span>` correcto.

</details>

---

⬅️ Anterior: [5.5 position() y last()](/docs/css-xpath/m5-position-last) · ➡️ Siguiente: [Síntesis M5](/docs/css-xpath/m5-sintesis)
