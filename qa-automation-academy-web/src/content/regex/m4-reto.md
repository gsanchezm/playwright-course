# 🚩 Reto — Módulo 4: "Ancla el cupón"

> **Módulo 4 · Anclas y banderas**

> **Analogía QA:** OmniPizza acepta cupones con un formato EXACTO. El validador actual acepta `"ABC123extra"` porque encuentra `"ABC123"` DENTRO del texto: el clásico falso positivo de una regex sin anclar. Tu trabajo es cerrar el portón con `^` y `$`.

---

## Contexto

OmniPizza acepta cupones con formato EXACTO: **3 letras MAYÚSCULAS** seguidas de **3 dígitos**. Ejemplos válidos: `"ABC123"`, `"XYZ789"`.

El bug actual: el validador acepta `"ABC123extra"` porque encuentra `"ABC123"` dentro del texto (no está anclado). Tu misión: anclarlo.

---

## Instrucciones

1. Completa la regex marcada con `// TODO:` (ahora es `/CAMBIAME/`, que no matchea nada útil). Debe quedar **anclada** con `^ ... $` para exigir que el cupón sea EXACTAMENTE 3 letras mayúsculas + 3 dígitos y NADA más.
   - Letras mayúsculas: `[A-Z]` (cuántas: `{3}`)
   - Dígitos: `\d` o `[0-9]` (cuántos: `{3}`)
   - Recuerda 4.1: sin `^...$`, `"ABC123extra"` pasa por falso positivo.
2. Ejecuta el archivo y verifica el output en terminal.

Es ESPERADO que veas ❌ hasta que completes la regex. El objetivo: que TODOS los `CUPONES_VALIDOS` pasen y TODOS los `CUPONES_INVALIDOS` (incluido `"ABC123extra"`) sean rechazados.

---

## Plantilla

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/reto.ts
// 🚩 Reto QA — Módulo 4: "Ancla el cupón"
import { check, checkMatch } from "../helpers/check";
import { CUPONES_VALIDOS, CUPONES_INVALIDOS } from "../data/samples";

console.log("\n===== 🚩 Reto 4: Ancla el cupón =====");

// ------------------------------------------------------------
// TODO: regex de cupón ANCLADA — 3 letras mayúsculas + 3 dígitos exactos.
//   El placeholder /CAMBIAME/ hace que los válidos fallen (❌) a propósito.
// ------------------------------------------------------------
const reCupon = /CAMBIAME/; // TODO: ánclala con ^ ... $

// ------------------------------------------------------------
// Casos de prueba. NO necesitas tocar esta parte: solo completa reCupon.
// ------------------------------------------------------------
console.log("--- Cupones que DEBEN pasar (válidos) ---");
for (const cupon of CUPONES_VALIDOS) {
  checkMatch(reCupon, cupon, true); // ✅ cuando reCupon esté bien
}

console.log("--- Cupones que DEBEN ser rechazados (inválidos) ---");
for (const cupon of CUPONES_INVALIDOS) {
  checkMatch(reCupon, cupon, false); // el caso estrella: "ABC123extra"
}
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-anclas-banderas/reto.ts
```

**Datos de muestra (de `data/samples.ts`):**

```bash
CUPONES_VALIDOS    = ["ABC123", "XYZ789", "PZA001"]
CUPONES_INVALIDOS  = ["ABC123extra", "abc123", "AB1234", "ABCD12", "ABC12"]
```

---

## Checklist de auto-corrección

- [ ] La regex empieza con `^` y termina con `$` (está **anclada**).
- [ ] Usa exactamente `{3}` letras mayúsculas y `{3}` dígitos.
- [ ] Los 3 cupones de `CUPONES_VALIDOS` muestran ✅.
- [ ] Los 5 cupones de `CUPONES_INVALIDOS` muestran ✅ (porque deben ser **rechazados**), incluido `"ABC123extra"`.
- [ ] `"abc123"` (minúsculas) es rechazado: `[A-Z]` no acepta minúsculas.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- Sin `^...$`, `"ABC123extra"` pasa porque CONTIENE `"ABC123"`. Las anclas exigen que el dato sea exactamente eso y NADA más (repaso de 4.1).
- Las clases de caracteres con cuantificador se escriben `[A-Z]{3}` (tres letras mayúsculas seguidas).
- `\d{3}` significa "exactamente tres dígitos".
- Si los válidos siguen en ❌, asegúrate de haber reemplazado el placeholder `/CAMBIAME/`.

</details>

---

⬅️ Anterior: [4.5 Flags `u` y `y`](/docs/regex/m4-flag-u-y-y) · ➡️ Siguiente: [🧠 Síntesis M4](/docs/regex/m4-sintesis)
