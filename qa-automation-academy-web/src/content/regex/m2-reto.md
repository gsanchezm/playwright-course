# 🚩 Reto — Módulo 2: "Valida el SKU"

> **Módulo 2 · Clases y cuantificadores**

> **Analogía QA:** OmniPizza identifica cada pizza con un SKU. Tu trabajo es escribir el "guardia de la puerta" que deja pasar los formatos correctos y rechaza todos los demás. Es exactamente lo que hace un validador de entrada antes de mandar un pedido al backend.

---

## Instrucciones

1. OmniPizza identifica cada pizza con un SKU con formato `PZ-####`: **DOS letras MAYÚSCULAS**, un **guion**, y **CUATRO dígitos**.
   - Válidos: `"PZ-1234"`, `"PZ-0001"`.
   - Inválidos: `"pz-1234"` (minúsculas), `"PZA-1234"` (3 letras), `"PZ-12345"` (5 dígitos), `"PZ1234"` (sin guion).
2. Completa la regex marcada con `// TODO:` (ahora es `/CAMBIAME/`, que no matchea nada útil). Debe quedar **ANCLADA** con `^ ... $` y combinar:
   - una **CLASE** de caracteres para las letras (¿mayúsculas?),
   - un **CUANTIFICADOR** exacto `{n}` para cuántas letras y cuántos dígitos,
   - el **guion literal** en medio.
   - Pista de estructura: `^[ ]{ }-[ ]{ }$`
3. Ejecuta el archivo y verifica que las dos secciones queden en ✅.

> Es ESPERADO que veas ❌ en los SKU **válidos** hasta que completes la regex (porque `/CAMBIAME/` no los matchea). Curiosamente los **inválidos** saldrán ✅ desde el inicio: como esperamos que NO coincidan y `/CAMBIAME/` tampoco coincide, el check ya pasa. El objetivo real es que tu regex haga que **AMBOS** bloques queden en ✅ (válidos matchean, inválidos NO).

---

## Plantilla

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/reto.ts
import { checkMatch } from "../helpers/check";
import { SKUS_VALIDOS, SKUS_INVALIDOS } from "../data/samples";

console.log("\n===== 🚩 Reto 2: Valida el SKU de OmniPizza (PZ-####) =====");

// ------------------------------------------------------------
// TODO: completa esta regex para el formato PZ-#### (2 letras MAYÚS,
//       guion, 4 dígitos), ANCLADA con ^ ... $.
// ------------------------------------------------------------
const reSku = /CAMBIAME/; // TODO: resuélvelo tú

// ------------------------------------------------------------
// Bucle de validación data-driven (NO necesitas tocar esto).
// Usa los datos compartidos del contrato: SKUS_VALIDOS / SKUS_INVALIDOS.
// ------------------------------------------------------------
console.log("--- SKU que DEBEN ser válidos ---");
for (const sku of SKUS_VALIDOS) checkMatch(reSku, sku, true);

console.log("--- SKU que DEBEN ser inválidos ---");
for (const sku of SKUS_INVALIDOS) checkMatch(reSku, sku, false);

console.log(
  "\nPista: cuando tu regex esté bien, las DOS secciones mostrarán solo ✅."
);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-clases-cuantificadores/reto.ts
```

**Output esperado (cuando lo resuelvas):**

```bash
--- SKU que DEBEN ser válidos ---
✅ ...
--- SKU que DEBEN ser inválidos ---
✅ ...

Pista: cuando tu regex esté bien, las DOS secciones mostrarán solo ✅.
```

---

## Checklist de auto-corrección

- [ ] La regex está **anclada** con `^` al inicio y `$` al final.
- [ ] Las letras usan una clase de **mayúsculas** (no `\w`, que aceptaría minúsculas y dígitos).
- [ ] Hay un cuantificador exacto `{2}` para las letras y `{4}` para los dígitos.
- [ ] El guion va literal en medio (fuera de una clase es un caracter normal).
- [ ] Las DOS secciones del output muestran solo ✅.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- Para "exactamente N", usa `{N}`, no `+` ni `*`.
- Una clase de mayúsculas es un rango: `[A-Z]`.
- Cuatro dígitos: `\d{4}` o `[0-9]{4}`.
- Si los inválidos como `"PZ-12345"` siguen pasando, probablemente te falta el `$` final.

</details>

---

⬅️ Anterior: [2.5 Validar datos](/docs/regex/m2-validar-datos) · ➡️ Siguiente: [Síntesis M2](/docs/regex/m2-sintesis)
